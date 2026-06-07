-- Function to resolve referral code and link referrer
CREATE OR REPLACE FUNCTION public.link_referrer_on_signup()
RETURNS TRIGGER AS $$
DECLARE
    ref_id UUID;
BEGIN
    -- Check if a referral code was provided in metadata
    IF NEW.raw_user_meta_data->>'referral_code' IS NOT NULL THEN
        -- Resolve username to user ID
        SELECT id INTO ref_id FROM public.users
        WHERE UPPER(username) = UPPER(NEW.raw_user_meta_data->>'referral_code');

        -- Link if found
        IF ref_id IS NOT NULL AND ref_id != NEW.id THEN
            NEW.referrer_id := ref_id;

            -- Insert into referrals table
            INSERT INTO public.referrals (referrer_id, referred_id, status, reward_amount)
            VALUES (ref_id, NEW.id, 'pending', 0);
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Since the above function needs to run BEFORE the user record is finalized
-- but public.users is managed by our app, we should handle this in our registration action
-- or use a trigger on public.users. Let's use a trigger on public.users.

DROP TRIGGER IF EXISTS link_referrer_trigger ON public.users;
CREATE TRIGGER link_referrer_trigger
BEFORE INSERT ON public.users
FOR EACH ROW
EXECUTE FUNCTION public.link_referrer_on_signup();
