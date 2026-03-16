-- Production Lock: cutoff_benchmarks, payment_orders, payment_webhook_events, subscriptions
-- Run via: insforge db query (each block or full file)
-- Prerequisite: migrations/002_surgical_swap_tables.sql

-- 1. cutoff_benchmarks (PRD 14.5.2)
CREATE TABLE IF NOT EXISTS cutoff_benchmarks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  university_id UUID REFERENCES universities(id),
  college_id UUID REFERENCES colleges(id),
  program_id UUID REFERENCES programs(id),
  category TEXT,
  round_label TEXT NOT NULL,
  exam_year INT NOT NULL,
  cutoff_score NUMERIC NOT NULL,
  cutoff_percentile NUMERIC,
  confidence_level NUMERIC,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_cutoff_university ON cutoff_benchmarks(university_id);
CREATE INDEX IF NOT EXISTS idx_cutoff_program ON cutoff_benchmarks(program_id);
CREATE INDEX IF NOT EXISTS idx_cutoff_year_round ON cutoff_benchmarks(exam_year, round_label);

-- 2. subscriptions (PRD 14.4.1)
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_profile_id UUID NOT NULL,
  plan_code TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ NOT NULL,
  razorpay_subscription_id TEXT,
  razorpay_payment_id TEXT,
  cancel_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_subscriptions_student ON subscriptions(student_profile_id);

-- 3. payment_orders (PRD 14.4.2)
CREATE TABLE IF NOT EXISTS payment_orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_profile_id UUID NOT NULL,
  product_type TEXT NOT NULL,
  product_reference TEXT,
  amount_paise INT NOT NULL,
  currency TEXT NOT NULL DEFAULT 'INR',
  status TEXT NOT NULL DEFAULT 'created',
  razorpay_order_id TEXT UNIQUE,
  meta_json JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_payment_orders_student ON payment_orders(student_profile_id);
CREATE INDEX IF NOT EXISTS idx_payment_orders_razorpay ON payment_orders(razorpay_order_id);

-- 4. payment_webhook_events (PRD 14.4.3)
CREATE TABLE IF NOT EXISTS payment_webhook_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  provider TEXT NOT NULL,
  event_type TEXT NOT NULL,
  external_event_id TEXT UNIQUE NOT NULL,
  payload_json JSONB NOT NULL DEFAULT '{}',
  processed BOOLEAN DEFAULT false,
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_webhook_external ON payment_webhook_events(external_event_id);
