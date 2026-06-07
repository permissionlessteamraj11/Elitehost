-- Add wallet_balance to users
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS wallet_balance DECIMAL(10,2) DEFAULT 0.0;

-- Create Withdrawals Table
CREATE TABLE IF NOT EXISTS public.withdrawals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL,
    upi_id TEXT NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create OTP Verifications Table
CREATE TABLE IF NOT EXISTS public.otp_verifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT NOT NULL,
    otp_hash TEXT NOT NULL,
    attempts INTEGER DEFAULT 0,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    verified BOOLEAN DEFAULT FALSE
);

-- Create Platform Settings Table
CREATE TABLE IF NOT EXISTS public.platform_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed Platform Settings
INSERT INTO public.platform_settings (key, value)
VALUES ('free_plan_enabled', 'true'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- Enable RLS
ALTER TABLE public.withdrawals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.otp_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can see their own withdrawals" ON public.withdrawals
    FOR SELECT USING (user_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid()));

CREATE POLICY "Users can create their own withdrawals" ON public.withdrawals
    FOR INSERT WITH CHECK (user_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid()));

CREATE POLICY "Admins can see all withdrawals" ON public.withdrawals
    FOR ALL USING (EXISTS (SELECT 1 FROM public.users WHERE auth_id = auth.uid() AND role IN ('admin', 'superadmin')));

CREATE POLICY "Admins can manage platform settings" ON public.platform_settings
    FOR ALL USING (EXISTS (SELECT 1 FROM public.users WHERE auth_id = auth.uid() AND role IN ('admin', 'superadmin')));

CREATE POLICY "Public can read platform settings" ON public.platform_settings
    FOR SELECT USING (true);
