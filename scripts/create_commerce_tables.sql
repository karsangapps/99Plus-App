-- ============================================================
-- Phase 4 — Commerce Tables (PRD §14.3.6 & §14.4)
-- Run via: insforge db run scripts/create_commerce_tables.sql
-- ============================================================

-- ============================================================
-- ENUM: payment_product_type
-- ============================================================
DO $$ BEGIN
  CREATE TYPE payment_product_type AS ENUM (
    'sachet_mock',
    'sachet_drill_pack',
    'pro_pass_monthly',
    'pro_pass_seasonal',
    'bonus'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ============================================================
-- 14.3.6 surgical_credits — immutable ledger model
-- NEVER update a row. INSERT only (append-only log).
-- balance_after = previous balance_after + delta_credits
-- ============================================================
CREATE TABLE IF NOT EXISTS surgical_credits (
  id                    UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_profile_id    UUID NOT NULL,
  txn_type              TEXT NOT NULL
                          CHECK (txn_type IN ('purchase', 'consume', 'refund', 'bonus', 'expire')),
  product_type          payment_product_type NOT NULL,
  delta_credits         INTEGER NOT NULL,
  balance_after         INTEGER NOT NULL,
  razorpay_payment_id   TEXT,
  razorpay_order_id     TEXT,
  practice_session_id   UUID,
  expires_at            TIMESTAMPTZ,
  meta_json             JSONB NOT NULL DEFAULT '{}',
  created_at            TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- ============================================================
-- 14.4.1 subscriptions — Pro Pass / unlimited access
-- ============================================================
CREATE TABLE IF NOT EXISTS subscriptions (
  id                          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_profile_id          UUID NOT NULL,
  plan_code                   TEXT NOT NULL,
  status                      TEXT NOT NULL DEFAULT 'pending'
                                CHECK (status IN ('active', 'cancelled', 'expired', 'pending')),
  starts_at                   TIMESTAMPTZ NOT NULL,
  ends_at                     TIMESTAMPTZ NOT NULL,
  razorpay_subscription_id    TEXT,
  razorpay_payment_id         TEXT,
  cancel_at                   TIMESTAMPTZ,
  created_at                  TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at                  TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- ============================================================
-- 14.4.2 payment_orders — Razorpay order lifecycle record
-- ============================================================
CREATE TABLE IF NOT EXISTS payment_orders (
  id                    UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_profile_id    UUID NOT NULL,
  product_type          payment_product_type NOT NULL,
  product_reference     TEXT,
  amount_paise          INTEGER NOT NULL,
  currency              TEXT NOT NULL DEFAULT 'INR',
  status                TEXT NOT NULL DEFAULT 'created'
                          CHECK (status IN ('created', 'paid', 'failed', 'refunded')),
  razorpay_order_id     TEXT NOT NULL UNIQUE,
  meta_json             JSONB NOT NULL DEFAULT '{}',
  created_at            TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at            TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- ============================================================
-- 14.4.3 payment_webhook_events — idempotent webhook log
-- external_event_id UNIQUE constraint is the idempotency key.
-- Processor must INSERT first, then handle — no duplicate runs.
-- ============================================================
CREATE TABLE IF NOT EXISTS payment_webhook_events (
  id                    UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  provider              TEXT NOT NULL DEFAULT 'razorpay',
  event_type            TEXT NOT NULL,
  external_event_id     TEXT NOT NULL UNIQUE,
  payload_json          JSONB NOT NULL,
  processed             BOOLEAN NOT NULL DEFAULT false,
  processed_at          TIMESTAMPTZ,
  created_at            TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- ============================================================
-- Indexes
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_surgical_credits_student    ON surgical_credits (student_profile_id);
CREATE INDEX IF NOT EXISTS idx_surgical_credits_txn_type   ON surgical_credits (txn_type);
CREATE INDEX IF NOT EXISTS idx_surgical_credits_rp_payment ON surgical_credits (razorpay_payment_id)
  WHERE razorpay_payment_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_subscriptions_student       ON subscriptions (student_profile_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status        ON subscriptions (status);

CREATE INDEX IF NOT EXISTS idx_payment_orders_student      ON payment_orders (student_profile_id);
CREATE INDEX IF NOT EXISTS idx_payment_orders_status       ON payment_orders (status);

CREATE INDEX IF NOT EXISTS idx_webhook_events_processed    ON payment_webhook_events (processed)
  WHERE processed = false;

-- ============================================================
-- Row Level Security
-- ============================================================
ALTER TABLE surgical_credits        ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions           ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_orders          ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_webhook_events  ENABLE ROW LEVEL SECURITY;

-- surgical_credits: student can read their own ledger (server writes via service_role)
DROP POLICY IF EXISTS "owner_read"        ON surgical_credits;
CREATE POLICY "owner_read"
  ON surgical_credits FOR SELECT
  USING (auth.uid()::text = student_profile_id::text);

-- subscriptions: student can read their own subscription
DROP POLICY IF EXISTS "owner_read"        ON subscriptions;
DROP POLICY IF EXISTS "owner_update"      ON subscriptions;
CREATE POLICY "owner_read"
  ON subscriptions FOR SELECT
  USING (auth.uid()::text = student_profile_id::text);
CREATE POLICY "owner_update"
  ON subscriptions FOR UPDATE
  USING (auth.uid()::text = student_profile_id::text);

-- payment_orders: student can read their own orders
DROP POLICY IF EXISTS "owner_read"        ON payment_orders;
CREATE POLICY "owner_read"
  ON payment_orders FOR SELECT
  USING (auth.uid()::text = student_profile_id::text);

-- payment_webhook_events: no direct student access — service_role only
-- The DENY-ALL policy ensures only server-side service_role can write/read.
DROP POLICY IF EXISTS "deny_all"          ON payment_webhook_events;
CREATE POLICY "deny_all"
  ON payment_webhook_events FOR ALL
  USING (false);
