-- Add referrer_id to users
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS referrer_id UUID REFERENCES public.users(id);

-- Change default credit balance to 2.0
ALTER TABLE public.users ALTER COLUMN credit_balance SET DEFAULT 2.0;

-- Create Referrals Table
CREATE TABLE IF NOT EXISTS public.referrals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    referrer_id UUID NOT NULL REFERENCES public.users(id),
    referred_id UUID NOT NULL REFERENCES public.users(id),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed')),
    reward_amount DECIMAL(10,2) DEFAULT 1.0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(referred_id)
);

-- Enable RLS on referrals
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can see their own referrals" ON public.referrals
    FOR SELECT USING (referrer_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid()) OR referred_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid()));

-- Function to handle referral rewards
CREATE OR REPLACE FUNCTION public.handle_referral_reward()
RETURNS TRIGGER AS $$
BEGIN
    -- Only reward when status changes to completed
    IF NEW.status = 'completed' AND OLD.status = 'pending' THEN
        -- Reward the referrer
        UPDATE public.users SET credit_balance = credit_balance + NEW.reward_amount WHERE id = NEW.referrer_id;
        -- Maybe reward the referred user too? (Optional, let's keep it simple for now)
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for referral rewards
CREATE TRIGGER referral_reward_trigger
AFTER UPDATE ON public.referrals
FOR EACH ROW
EXECUTE FUNCTION public.handle_referral_reward();
