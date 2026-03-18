-- ================================================================
-- ELITEHOSTING — Schema v2 Update
-- Run this AFTER schema.sql in Supabase SQL Editor
-- ================================================================

-- ── payment_requests table ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.payment_requests (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id           UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  amount_inr        DECIMAL(10,2) NOT NULL,
  credits_requested DECIMAL(10,2) NOT NULL,
  pack_id           TEXT NOT NULL,
  screenshot_url    TEXT,
  upi_ref           TEXT,
  status            TEXT NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending', 'approved', 'rejected')),
  admin_note        TEXT,
  reviewed_by       UUID REFERENCES public.users(id),
  reviewed_at       TIMESTAMPTZ,
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payment_req_user   ON public.payment_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_req_status ON public.payment_requests(status);

-- RLS for payment_requests
ALTER TABLE public.payment_requests ENABLE ROW LEVEL SECURITY;

-- User can insert own requests
CREATE POLICY "payment_req_insert" ON public.payment_requests
  FOR INSERT WITH CHECK (
    user_id = (SELECT id FROM public.users WHERE auth_id = auth.uid())
  );

-- User can view own requests
CREATE POLICY "payment_req_select_own" ON public.payment_requests
  FOR SELECT USING (
    user_id = (SELECT id FROM public.users WHERE auth_id = auth.uid())
  );

-- Admin can view all
CREATE POLICY "payment_req_admin_select" ON public.payment_requests
  FOR SELECT USING (
    (SELECT roles FROM public.users WHERE auth_id = auth.uid()) @> ARRAY['admin']::text[]
  );

-- Admin can update (approve/reject)
CREATE POLICY "payment_req_admin_update" ON public.payment_requests
  FOR UPDATE USING (
    (SELECT roles FROM public.users WHERE auth_id = auth.uid()) @> ARRAY['admin']::text[]
  );

-- ── Admin RLS policies for users table ───────────────────────────
-- Admin can read ALL users
CREATE POLICY "admin_read_users" ON public.users
  FOR SELECT USING (
    auth.uid() = auth_id
    OR (SELECT roles FROM public.users WHERE auth_id = auth.uid()) @> ARRAY['admin']::text[]
  );

-- Admin can update (ban/unban)
CREATE POLICY "admin_update_users" ON public.users
  FOR UPDATE USING (
    auth.uid() = auth_id
    OR (SELECT roles FROM public.users WHERE auth_id = auth.uid()) @> ARRAY['admin']::text[]
  );

-- Admin can read all deployments
CREATE POLICY "admin_read_deployments" ON public.deployments
  FOR SELECT USING (
    owner_id = (SELECT id FROM public.users WHERE auth_id = auth.uid())
    OR (SELECT roles FROM public.users WHERE auth_id = auth.uid()) @> ARRAY['admin']::text[]
  );

-- Admin can read all transactions
CREATE POLICY "admin_read_transactions" ON public.transactions
  FOR SELECT USING (
    user_id = (SELECT id FROM public.users WHERE auth_id = auth.uid())
    OR (SELECT roles FROM public.users WHERE auth_id = auth.uid()) @> ARRAY['admin']::text[]
  );

-- ── Set admin role ───────────────────────────────────────────────
-- STEP 1: Register at https://www.elitehosting.in/auth/register.html
--         with email: Kvinit6421@gmail.com
-- STEP 2: Run this query to grant admin role:
UPDATE public.users
SET roles = ARRAY['admin', 'superadmin']
WHERE email = 'Kvinit6421@gmail.com';

-- Verify admin was set:
SELECT id, email, username, roles FROM public.users WHERE email = 'Kvinit6421@gmail.com';

-- ── Supabase Storage bucket for screenshots ──────────────────────
-- Run this in Supabase Dashboard → Storage → Create bucket:
-- Bucket name: payment-screenshots
-- Public: true
-- OR create via SQL:
INSERT INTO storage.buckets (id, name, public)
VALUES ('payment-screenshots', 'payment-screenshots', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload
CREATE POLICY "auth_upload_screenshots" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'payment-screenshots'
    AND auth.role() = 'authenticated'
  );

-- Allow public read
CREATE POLICY "public_read_screenshots" ON storage.objects
  FOR SELECT USING (bucket_id = 'payment-screenshots');

-- ── ENV Variables to set in Cloudflare Pages ────────────────────
-- SUPABASE_URL       = https://your-project.supabase.co
-- SUPABASE_ANON_KEY  = eyJ...
-- ADMIN_EMAIL        = Kvinit6421@gmail.com
-- ADMIN_UPI_ID       = yourname@upi  (your UPI ID for payments)
-- ADMIN_NAME         = Vinit (shown on QR)

-- ================================================================
-- DONE! Now:
-- 1. Register with Kvinit6421@gmail.com
-- 2. Verify email
-- 3. Run UPDATE above to grant admin role
-- 4. Login at /admin/login.html
-- ================================================================
