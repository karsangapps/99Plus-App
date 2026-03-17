/**
 * POST /api/payments/webhook
 *
 * Razorpay Webhook Handler — Phase 4 (PRD §16.4)
 *
 * Security model:
 *   1. Signature verification via HMAC-SHA256 (X-Razorpay-Signature header).
 *   2. Idempotency: `external_event_id` (= Razorpay event.id) has a UNIQUE
 *      constraint in payment_webhook_events. A duplicate delivery causes a
 *      Postgres unique-violation which we catch and return 200 — safe replay.
 *   3. DB is the Source of Truth: client-side payment success callbacks are
 *      NEVER trusted. Entitlements are granted only after this handler writes
 *      the ledger row / subscription row.
 *
 * Event map (PRD §16.4):
 *   payment.captured      → mark order paid  + insert surgical_credits ledger row
 *   order.paid            → mark order paid  (fallback if payment.captured already ran)
 *   subscription.activated → insert/activate subscription
 *   subscription.charged  → extend subscription ends_at
 *   subscription.cancelled → cancel subscription
 *   refund.processed      → insert negative surgical_credits row
 */

import crypto from 'node:crypto'
import { NextRequest, NextResponse } from 'next/server'
import { getInsforgeAdminClient } from '@/lib/insforgeAdmin'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type RazorpayEvent = {
  id: string
  entity: string
  event: string
  payload: {
    payment?: { entity: RazorpayPaymentEntity }
    order?: { entity: RazorpayOrderEntity }
    subscription?: { entity: RazorpaySubscriptionEntity }
    refund?: { entity: RazorpayRefundEntity }
  }
  created_at: number
}

type RazorpayPaymentEntity = {
  id: string
  order_id: string
  amount: number
  status: string
}

type RazorpayOrderEntity = {
  id: string
  status: string
}

type RazorpaySubscriptionEntity = {
  id: string
  plan_id: string
  status: string
  current_start: number
  current_end: number
  charge_at: number
}

type RazorpayRefundEntity = {
  id: string
  payment_id: string
  amount: number
}

// ---------------------------------------------------------------------------
// Signature verification
// ---------------------------------------------------------------------------

function verifyRazorpaySignature(
  rawBody: string,
  signature: string,
  secret: string
): boolean {
  const expected = crypto
    .createHmac('sha256', secret)
    .update(rawBody)
    .digest('hex')
  // Constant-time comparison to prevent timing attacks
  try {
    return crypto.timingSafeEqual(
      Buffer.from(expected, 'hex'),
      Buffer.from(signature, 'hex')
    )
  } catch {
    return false
  }
}

// ---------------------------------------------------------------------------
// Route handler
// ---------------------------------------------------------------------------

export async function POST(req: NextRequest) {
  const rawBody = await req.text()
  const signature = req.headers.get('x-razorpay-signature') ?? ''
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET ?? ''

  // 1. Verify signature — reject unsigned/tampered requests immediately
  if (!webhookSecret) {
    console.error('[webhook] RAZORPAY_WEBHOOK_SECRET is not set')
    return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 })
  }

  if (!verifyRazorpaySignature(rawBody, signature, webhookSecret)) {
    console.warn('[webhook] Invalid Razorpay signature — rejecting')
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  let event: RazorpayEvent
  try {
    event = JSON.parse(rawBody) as RazorpayEvent
  } catch {
    return NextResponse.json({ error: 'Malformed JSON body' }, { status: 400 })
  }

  const db = getInsforgeAdminClient()

  // 2. Idempotency gate — try inserting the event log row FIRST.
  //    If Postgres throws a unique-violation, the event was already processed.
  const insertResult = await db.database
    .from('payment_webhook_events')
    .insert({
      provider: 'razorpay',
      event_type: event.event,
      external_event_id: event.id,
      payload_json: event as unknown as Record<string, unknown>,
      processed: false,
    })

  if (insertResult.error) {
    const code = (insertResult.error as { code?: string }).code
    if (code === '23505') {
      // Duplicate delivery — already processed, acknowledge safely
      console.info(`[webhook] Duplicate event ${event.id} — skipping`)
      return NextResponse.json({ status: 'already_processed' }, { status: 200 })
    }
    console.error('[webhook] Failed to insert event log:', insertResult.error)
    return NextResponse.json({ error: 'DB write failed' }, { status: 500 })
  }

  // 3. Route to the correct handler
  let processingError: string | null = null
  try {
    switch (event.event) {
      case 'payment.captured':
        await handlePaymentCaptured(db, event)
        break
      case 'order.paid':
        await handleOrderPaid(db, event)
        break
      case 'subscription.activated':
      case 'subscription.charged':
        await handleSubscriptionActivated(db, event)
        break
      case 'subscription.cancelled':
        await handleSubscriptionCancelled(db, event)
        break
      case 'refund.processed':
        await handleRefundProcessed(db, event)
        break
      default:
        // Unknown event — log and acknowledge. Do not fail.
        console.info(`[webhook] Unhandled event type: ${event.event}`)
    }
  } catch (err) {
    processingError = err instanceof Error ? err.message : String(err)
    console.error(`[webhook] Error processing ${event.event}:`, processingError)
  }

  // 4. Mark event as processed (or failed) — update in place
  await db.database
    .from('payment_webhook_events')
    .update({
      processed: processingError === null,
      processed_at: new Date().toISOString(),
      payload_json: {
        ...(event as unknown as Record<string, unknown>),
        _processing_error: processingError,
      },
    })
    .eq('external_event_id', event.id)

  if (processingError) {
    // Return 500 so Razorpay retries the webhook
    return NextResponse.json({ error: processingError }, { status: 500 })
  }

  return NextResponse.json({ status: 'ok' }, { status: 200 })
}

// ---------------------------------------------------------------------------
// Event handlers
// ---------------------------------------------------------------------------

type DbClient = ReturnType<typeof getInsforgeAdminClient>

/**
 * payment.captured — primary entitlement grant path.
 * 1. Lookup the payment_order by razorpay_order_id.
 * 2. Mark it paid.
 * 3. Grant credits (sachet) OR activate subscription (Pro Pass).
 */
async function handlePaymentCaptured(db: DbClient, event: RazorpayEvent) {
  const payment = event.payload.payment?.entity
  if (!payment) throw new Error('Missing payment entity in payment.captured')

  // Resolve the internal order
  const { data: orders, error: orderErr } = await db.database
    .from('payment_orders')
    .select('id, student_profile_id, product_type, amount_paise, status')
    .eq('razorpay_order_id', payment.order_id)
    .limit(1)

  if (orderErr) throw new Error(`Order lookup failed: ${orderErr.message}`)

  const order = (orders as Array<{
    id: string
    student_profile_id: string
    product_type: string
    amount_paise: number
    status: string
  }>)?.[0]

  if (!order) {
    console.warn(`[webhook] No payment_order found for razorpay_order_id ${payment.order_id}`)
    return
  }

  if (order.status === 'paid') {
    console.info(`[webhook] Order ${order.id} already paid — skipping credit grant`)
    return
  }

  // Mark order as paid
  await db.database
    .from('payment_orders')
    .update({
      status: 'paid',
      updated_at: new Date().toISOString(),
    })
    .eq('id', order.id)

  // Grant entitlement based on product type
  const isSachet = order.product_type === 'sachet_mock' ||
    order.product_type === 'sachet_drill_pack'
  const isProPass = order.product_type === 'pro_pass_monthly' ||
    order.product_type === 'pro_pass_seasonal'

  if (isSachet) {
    await grantSachetCredits(db, {
      studentProfileId: order.student_profile_id,
      productType: order.product_type as 'sachet_mock' | 'sachet_drill_pack',
      razorpayPaymentId: payment.id,
      razorpayOrderId: payment.order_id,
    })
  } else if (isProPass) {
    const expiresAt = getProPassExpiry(order.product_type)
    await activateProPass(db, {
      studentProfileId: order.student_profile_id,
      planCode: order.product_type,
      razorpayPaymentId: payment.id,
      startsAt: new Date(),
      endsAt: expiresAt,
    })
  }
}

/**
 * order.paid — Razorpay sends this after payment.captured.
 * Acts as idempotent fallback — only updates order status if not already paid.
 */
async function handleOrderPaid(db: DbClient, event: RazorpayEvent) {
  const order = event.payload.order?.entity
  if (!order) return

  await db.database
    .from('payment_orders')
    .update({ status: 'paid', updated_at: new Date().toISOString() })
    .eq('razorpay_order_id', order.id)
    .eq('status', 'created')  // Only update if still in 'created' state
}

/**
 * subscription.activated / subscription.charged
 * Upsert subscription row and set status to 'active'.
 */
async function handleSubscriptionActivated(db: DbClient, event: RazorpayEvent) {
  const sub = event.payload.subscription?.entity
  if (!sub) throw new Error('Missing subscription entity')

  const startsAt = new Date(sub.current_start * 1000)
  const endsAt = new Date(sub.current_end * 1000)

  // Look up the corresponding payment_order to get student_profile_id
  const { data: orders } = await db.database
    .from('payment_orders')
    .select('student_profile_id, product_type')
    .eq('razorpay_order_id', sub.id)
    .limit(1)

  const order = (orders as Array<{ student_profile_id: string; product_type: string }>)?.[0]
  if (!order) {
    console.warn(`[webhook] No order found for subscription ${sub.id}`)
    return
  }

  // Check if subscription row already exists for this Razorpay subscription ID
  const { data: existing } = await db.database
    .from('subscriptions')
    .select('id')
    .eq('razorpay_subscription_id', sub.id)
    .limit(1)

  if ((existing as Array<{ id: string }>)?.length) {
    // Update existing subscription
    await db.database
      .from('subscriptions')
      .update({
        status: 'active',
        starts_at: startsAt.toISOString(),
        ends_at: endsAt.toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('razorpay_subscription_id', sub.id)
  } else {
    // Insert new subscription
    await db.database
      .from('subscriptions')
      .insert({
        student_profile_id: order.student_profile_id,
        plan_code: order.product_type,
        status: 'active',
        starts_at: startsAt.toISOString(),
        ends_at: endsAt.toISOString(),
        razorpay_subscription_id: sub.id,
      })
  }
}

/**
 * subscription.cancelled — mark subscription as cancelled.
 */
async function handleSubscriptionCancelled(db: DbClient, event: RazorpayEvent) {
  const sub = event.payload.subscription?.entity
  if (!sub) return

  await db.database
    .from('subscriptions')
    .update({
      status: 'cancelled',
      cancel_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('razorpay_subscription_id', sub.id)
}

/**
 * refund.processed — insert a negative ledger row to claw back credits.
 */
async function handleRefundProcessed(db: DbClient, event: RazorpayEvent) {
  const refund = event.payload.refund?.entity
  if (!refund) return

  // Find the credit row tied to this payment to determine student and balance
  const { data: creditRows } = await db.database
    .from('surgical_credits')
    .select('student_profile_id, balance_after, delta_credits')
    .eq('razorpay_payment_id', refund.payment_id)
    .eq('txn_type', 'purchase')
    .limit(1)

  const credit = (creditRows as Array<{
    student_profile_id: string
    balance_after: number
    delta_credits: number
  }>)?.[0]

  if (!credit) {
    console.warn(`[webhook] No credit row found for refunded payment ${refund.payment_id}`)
    return
  }

  const refundedCredits = credit.delta_credits
  const newBalance = credit.balance_after - refundedCredits

  await db.database
    .from('surgical_credits')
    .insert({
      student_profile_id: credit.student_profile_id,
      txn_type: 'refund',
      product_type: 'bonus', // placeholder — refunds aren't product-specific
      delta_credits: -refundedCredits,
      balance_after: newBalance,
      razorpay_payment_id: refund.payment_id,
      meta_json: { refund_id: refund.id, refund_amount_paise: refund.amount },
    })
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

type SachetGrantParams = {
  studentProfileId: string
  productType: 'sachet_mock' | 'sachet_drill_pack'
  razorpayPaymentId: string
  razorpayOrderId: string
}

async function grantSachetCredits(db: DbClient, params: SachetGrantParams) {
  const { studentProfileId, productType, razorpayPaymentId, razorpayOrderId } = params

  // Get current balance (latest ledger row)
  const { data: rows } = await db.database
    .from('surgical_credits')
    .select('balance_after')
    .eq('student_profile_id', studentProfileId)
    .order('created_at', { ascending: false })
    .limit(1)

  const currentBalance = (rows as Array<{ balance_after: number }>)?.[0]?.balance_after ?? 0
  const creditAmount = productType === 'sachet_mock' ? 1 : 5  // sachet=1 credit, drill pack=5

  await db.database
    .from('surgical_credits')
    .insert({
      student_profile_id: studentProfileId,
      txn_type: 'purchase',
      product_type: productType,
      delta_credits: creditAmount,
      balance_after: currentBalance + creditAmount,
      razorpay_payment_id: razorpayPaymentId,
      razorpay_order_id: razorpayOrderId,
      meta_json: { source: 'webhook', event: 'payment.captured' },
    })
}

type ProPassParams = {
  studentProfileId: string
  planCode: string
  razorpayPaymentId: string
  startsAt: Date
  endsAt: Date
}

async function activateProPass(db: DbClient, params: ProPassParams) {
  const { studentProfileId, planCode, razorpayPaymentId, startsAt, endsAt } = params

  await db.database
    .from('subscriptions')
    .insert({
      student_profile_id: studentProfileId,
      plan_code: planCode,
      status: 'active',
      starts_at: startsAt.toISOString(),
      ends_at: endsAt.toISOString(),
      razorpay_payment_id: razorpayPaymentId,
    })
}

/** Pro Pass expiry: monthly = 30 days, seasonal = until June 30 of next exam year */
function getProPassExpiry(productType: string): Date {
  if (productType === 'pro_pass_monthly') {
    const d = new Date()
    d.setDate(d.getDate() + 30)
    return d
  }
  // pro_pass_seasonal — valid until end of CUET 2026 admission cycle
  return new Date('2026-06-30T23:59:59Z')
}
