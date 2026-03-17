-- ================================================================
-- ELITEHOSTING.IN — Supabase Database Schema v1.0
-- Run this in Supabase SQL Editor
-- ================================================================

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ── USERS TABLE ─────────────────────────────────────────────────
CREATE TABLE public.users (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  auth_id         UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email           TEXT UNIQUE NOT NULL,
  username        TEXT UNIQUE NOT NULL CHECK (username ~ '^[a-z0-9_-]{3,30}$'),
  display_name    TEXT,
  avatar_url      TEXT,
  roles           TEXT[] DEFAULT ARRAY['user'],
  credit_balance  DECIMAL(10,2) DEFAULT 2.00 NOT NULL CHECK (credit_balance >= 0),
  referral_code   TEXT UNIQUE DEFAULT upper(substring(encode(gen_random_bytes(4), 'hex'), 1, 8)),
  referred_by     UUID REFERENCES public.users(id),
  email_verified  BOOLEAN DEFAULT FALSE,
  totp_enabled    BOOLEAN DEFAULT FALSE,
  totp_secret     TEXT,
  telegram_chat_id BIGINT UNIQUE,
  is_banned       BOOLEAN DEFAULT FALSE,
  ban_reason      TEXT,
  last_login_at   TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ── DEPLOYMENTS TABLE ────────────────────────────────────────────
CREATE TABLE public.deployments (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id        UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name            TEXT NOT NULL CHECK (name ~ '^[a-z0-9-]{2,40}$'),
  slug            TEXT NOT NULL,
  source_type     TEXT NOT NULL CHECK (source_type IN ('git', 'zip')),
  repo_url        TEXT,
  branch          TEXT DEFAULT 'main',
  artifact_key    TEXT,
  framework       TEXT,
  start_cmd       TEXT NOT NULL,
  build_cmd       TEXT,
  port            INTEGER NOT NULL DEFAULT 3000 CHECK (port > 0 AND port < 65536),
  env_vars_enc    TEXT,
  status          TEXT NOT NULL DEFAULT 'pending'
                  CHECK (status IN ('pending', 'building', 'deploying', 'running', 'stopped', 'failed', 'deleted')),
  public_url      TEXT,
  custom_domain   TEXT,
  ssl_enabled     BOOLEAN DEFAULT FALSE,
  last_deployed_at TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(owner_id, name)
);

-- ── CONTAINERS TABLE ─────────────────────────────────────────────
CREATE TABLE public.containers (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  deployment_id   UUID UNIQUE NOT NULL REFERENCES public.deployments(id) ON DELETE CASCADE,
  docker_id       TEXT,
  host_port       INTEGER,
  runtime_status  TEXT DEFAULT 'pending',
  memory_limit_mb INTEGER DEFAULT 512,
  cpu_quota       INTEGER DEFAULT 50000,
  metrics_json    JSONB DEFAULT '{}',
  started_at      TIMESTAMPTZ,
  stopped_at      TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ── BUILD LOGS TABLE ─────────────────────────────────────────────
CREATE TABLE public.build_logs (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  deployment_id   UUID NOT NULL REFERENCES public.deployments(id) ON DELETE CASCADE,
  level           TEXT NOT NULL DEFAULT 'info',
  message         TEXT NOT NULL,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_build_logs_deployment ON public.build_logs(deployment_id, created_at DESC);

-- ── CREDITS TABLE ────────────────────────────────────────────────
CREATE TABLE public.credits (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  amount          DECIMAL(10,2) NOT NULL,
  remaining       DECIMAL(10,2) NOT NULL,
  source          TEXT NOT NULL CHECK (source IN ('signup_bonus', 'purchase', 'referral', 'admin_grant', 'refund')),
  description     TEXT,
  stripe_session  TEXT,
  expires_at      TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_credits_user ON public.credits(user_id, expires_at);

-- ── TRANSACTIONS TABLE ───────────────────────────────────────────
CREATE TABLE public.transactions (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  type            TEXT NOT NULL CHECK (type IN ('credit', 'debit')),
  amount          DECIMAL(10,2) NOT NULL,
  balance_after   DECIMAL(10,2) NOT NULL,
  description     TEXT NOT NULL,
  reference_id    UUID,
  reference_type  TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_transactions_user ON public.transactions(user_id, created_at DESC);

-- ── AI REQUESTS TABLE ────────────────────────────────────────────
CREATE TABLE public.ai_requests (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  task_type       TEXT NOT NULL,
  provider        TEXT NOT NULL,
  model           TEXT NOT NULL,
  input_tokens    INTEGER DEFAULT 0,
  output_tokens   INTEGER DEFAULT 0,
  credits_charged DECIMAL(10,3) NOT NULL DEFAULT 0,
  cached          BOOLEAN DEFAULT FALSE,
  deployment_id   UUID REFERENCES public.deployments(id),
  result_text     TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ── REFERRALS TABLE ──────────────────────────────────────────────
CREATE TABLE public.referrals (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  referrer_id     UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  referred_id     UUID UNIQUE NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  status          TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'validated', 'rewarded')),
  rewarded_at     TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ── NOTIFICATIONS TABLE ──────────────────────────────────────────
CREATE TABLE public.notifications (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  type            TEXT NOT NULL,
  title           TEXT NOT NULL,
  message         TEXT NOT NULL,
  is_read         BOOLEAN DEFAULT FALSE,
  data            JSONB DEFAULT '{}',
  created_at      TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_notifications_user ON public.notifications(user_id, created_at DESC);

-- ── BROADCAST MESSAGES TABLE ─────────────────────────────────────
CREATE TABLE public.broadcasts (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id        UUID NOT NULL REFERENCES public.users(id),
  type            TEXT NOT NULL DEFAULT 'info',
  title           TEXT,
  message         TEXT NOT NULL,
  target          TEXT DEFAULT 'all',
  sent_count      INTEGER DEFAULT 0,
  fail_count      INTEGER DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ── DOMAIN VERIFICATIONS TABLE ───────────────────────────────────
CREATE TABLE public.custom_domains (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  deployment_id   UUID NOT NULL REFERENCES public.deployments(id) ON DELETE CASCADE,
  domain          TEXT NOT NULL,
  verified        BOOLEAN DEFAULT FALSE,
  verify_token    TEXT DEFAULT upper(encode(gen_random_bytes(16), 'hex')),
  ssl_issued      BOOLEAN DEFAULT FALSE,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ── FUNCTIONS ────────────────────────────────────────────────────

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at       BEFORE UPDATE ON public.users       FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_deployments_updated_at BEFORE UPDATE ON public.deployments FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_containers_updated_at  BEFORE UPDATE ON public.containers  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Deduct credits atomically
CREATE OR REPLACE FUNCTION deduct_credits(
  p_user_id     UUID,
  p_amount      DECIMAL,
  p_description TEXT,
  p_ref_id      UUID DEFAULT NULL,
  p_ref_type    TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  v_balance DECIMAL;
BEGIN
  SELECT credit_balance INTO v_balance FROM public.users WHERE id = p_user_id FOR UPDATE;
  IF v_balance < p_amount THEN RETURN FALSE; END IF;
  UPDATE public.users SET credit_balance = credit_balance - p_amount WHERE id = p_user_id;
  INSERT INTO public.transactions (user_id, type, amount, balance_after, description, reference_id, reference_type)
  VALUES (p_user_id, 'debit', p_amount, v_balance - p_amount, p_description, p_ref_id, p_ref_type);
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add credits
CREATE OR REPLACE FUNCTION add_credits(
  p_user_id     UUID,
  p_amount      DECIMAL,
  p_source      TEXT,
  p_description TEXT,
  p_expires_at  TIMESTAMPTZ DEFAULT NULL
)
RETURNS VOID AS $$
DECLARE
  v_balance DECIMAL;
BEGIN
  UPDATE public.users SET credit_balance = credit_balance + p_amount WHERE id = p_user_id RETURNING credit_balance INTO v_balance;
  INSERT INTO public.credits (user_id, amount, remaining, source, description, expires_at)
  VALUES (p_user_id, p_amount, p_amount, p_source, p_description, p_expires_at);
  INSERT INTO public.transactions (user_id, type, amount, balance_after, description)
  VALUES (p_user_id, 'credit', p_amount, v_balance, p_description);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get user stats
CREATE OR REPLACE FUNCTION get_user_stats(p_user_id UUID)
RETURNS JSON AS $$
DECLARE
  v_result JSON;
BEGIN
  SELECT json_build_object(
    'total_deployments', COUNT(*),
    'running', COUNT(*) FILTER (WHERE status = 'running'),
    'failed',  COUNT(*) FILTER (WHERE status = 'failed'),
    'stopped', COUNT(*) FILTER (WHERE status = 'stopped')
  ) INTO v_result
  FROM public.deployments
  WHERE owner_id = p_user_id AND status != 'deleted';
  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ── ROW LEVEL SECURITY ───────────────────────────────────────────
ALTER TABLE public.users       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deployments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.containers  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.build_logs  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credits     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Users can view/update their own record
CREATE POLICY "users_select_own" ON public.users FOR SELECT USING (auth.uid() = auth_id);
CREATE POLICY "users_update_own" ON public.users FOR UPDATE USING (auth.uid() = auth_id);

-- Deployments RLS
CREATE POLICY "deploy_select_own" ON public.deployments FOR SELECT USING (owner_id = (SELECT id FROM public.users WHERE auth_id = auth.uid()));
CREATE POLICY "deploy_insert_own" ON public.deployments FOR INSERT WITH CHECK (owner_id = (SELECT id FROM public.users WHERE auth_id = auth.uid()));
CREATE POLICY "deploy_update_own" ON public.deployments FOR UPDATE USING (owner_id = (SELECT id FROM public.users WHERE auth_id = auth.uid()));

-- Build logs RLS
CREATE POLICY "logs_select_own" ON public.build_logs FOR SELECT USING (
  deployment_id IN (SELECT id FROM public.deployments WHERE owner_id = (SELECT id FROM public.users WHERE auth_id = auth.uid()))
);

-- Credits, transactions, ai_requests - own only
CREATE POLICY "credits_own"      ON public.credits      FOR SELECT USING (user_id = (SELECT id FROM public.users WHERE auth_id = auth.uid()));
CREATE POLICY "transactions_own" ON public.transactions  FOR SELECT USING (user_id = (SELECT id FROM public.users WHERE auth_id = auth.uid()));
CREATE POLICY "ai_requests_own"  ON public.ai_requests  FOR SELECT USING (user_id = (SELECT id FROM public.users WHERE auth_id = auth.uid()));
CREATE POLICY "notifications_own" ON public.notifications FOR ALL   USING (user_id = (SELECT id FROM public.users WHERE auth_id = auth.uid()));

-- Admin overrides (use service role key for admin functions)
-- Admins identified by roles array containing 'admin' or 'superadmin'

-- ── INDEXES ──────────────────────────────────────────────────────
CREATE INDEX idx_deployments_owner   ON public.deployments(owner_id);
CREATE INDEX idx_deployments_status  ON public.deployments(status);
CREATE INDEX idx_deployments_slug    ON public.deployments(slug);
CREATE INDEX idx_users_telegram      ON public.users(telegram_chat_id) WHERE telegram_chat_id IS NOT NULL;
CREATE INDEX idx_users_referral_code ON public.users(referral_code);

-- ── SEED DATA ────────────────────────────────────────────────────
-- Insert a sample admin user (set via Supabase Auth, then link here)
-- This is done post-auth-signup via trigger

-- Trigger: auto-create user profile after Supabase Auth signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_username TEXT;
  v_ref_code TEXT;
BEGIN
  v_username := COALESCE(
    NEW.raw_user_meta_data->>'username',
    split_part(NEW.email, '@', 1)
  );
  -- Ensure unique username
  WHILE EXISTS (SELECT 1 FROM public.users WHERE username = lower(regexp_replace(v_username, '[^a-z0-9_-]', '', 'g'))) LOOP
    v_username := v_username || floor(random() * 100)::text;
  END LOOP;
  v_username := lower(regexp_replace(v_username, '[^a-z0-9_-]', '', 'g'));
  IF length(v_username) < 3 THEN v_username := 'user' || floor(random()*10000)::text; END IF;

  INSERT INTO public.users (auth_id, email, username, display_name, email_verified)
  VALUES (
    NEW.id,
    NEW.email,
    v_username,
    COALESCE(NEW.raw_user_meta_data->>'display_name', v_username),
    NEW.email_confirmed_at IS NOT NULL
  );

  -- Grant 2 free signup credits
  PERFORM add_credits(
    (SELECT id FROM public.users WHERE auth_id = NEW.id),
    2.00,
    'signup_bonus',
    'Welcome! 2 free credits on signup 🎉',
    NOW() + INTERVAL '30 days'
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Trigger: update email_verified when email is confirmed
CREATE OR REPLACE FUNCTION public.handle_email_confirm()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.email_confirmed_at IS NOT NULL AND OLD.email_confirmed_at IS NULL THEN
    UPDATE public.users SET email_verified = TRUE WHERE auth_id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_email_confirmed
  AFTER UPDATE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_email_confirm();
