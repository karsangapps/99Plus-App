import { NextResponse } from 'next/server'
import { getUidFromCookies } from '@/lib/session'
import { getStudentProfileId } from '@/lib/studentProfile'
import { getInsforgeAdminClient } from '@/lib/insforgeAdmin'
import { createOrderBodySchema } from '@/lib/validations/payments'

export async function POST(req: Request) {
  try {
    const uid = await getUidFromCookies()
    if (!uid) {
      return NextResponse.json({ ok: false, error: 'Not signed in.' }, { status: 401 })
    }

    const studentProfileId = await getStudentProfileId(uid)
    if (!studentProfileId) {
      return NextResponse.json({ ok: false, error: 'Student profile not found.' }, { status: 404 })
    }

    const raw = await req.json()
    const parsed = createOrderBodySchema.safeParse(raw)
    if (!parsed.success) {
      const first = parsed.error.issues[0]
      const msg = first ? `${first.path.join('.')}: ${first.message}` : 'Invalid request.'
      return NextResponse.json({ ok: false, error: msg }, { status: 400 })
    }
    const body = parsed.data

    const db = getInsforgeAdminClient()

    // Create payment_orders row (Razorpay integration can be wired later)
    const orderRes = await db.database
      .from('payment_orders')
      .insert({
        student_profile_id: studentProfileId,
        product_type: body.product_type,
        product_reference: body.product_reference ?? null,
        amount_paise: body.amount_paise,
        currency: 'INR',
        status: 'created',
        razorpay_order_id: null,
        meta_json: {}
      })
      .select('id')
      .single()

    if (orderRes.error || !orderRes.data) {
      return NextResponse.json(
        { ok: false, error: orderRes.error?.message ?? 'Failed to create order.' },
        { status: 500 }
      )
    }

    const orderId = (orderRes.data as { id: string }).id

    return NextResponse.json({
      ok: true,
      orderId,
      amount_paise: body.amount_paise
      // razorpay_order_id would be set after Razorpay API call
    })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Unknown error'
    return NextResponse.json({ ok: false, error: msg }, { status: 500 })
  }
}
