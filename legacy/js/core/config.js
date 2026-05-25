/**
 * EliteHosting — Runtime Config
 * Set window.__ENV before loading this, or edit defaults here.
 */
export const CONFIG = {
  SUPABASE_URL:      window.__ENV?.SUPABASE_URL      || 'https://YOUR_PROJECT.supabase.co',
  SUPABASE_ANON_KEY: window.__ENV?.SUPABASE_ANON_KEY || 'YOUR_ANON_KEY',
  SITE_URL:          window.__ENV?.SITE_URL           || 'https://www.elitehosting.in',
  TELEGRAM_BOT:      'https://t.me/elitehosting_bot',
  SUPPORT_TG:        'https://t.me/elitehosting_support',
  CREDIT_PACKS: [
    { id: 'starter',   credits: 5,  price: 99,  label: '5 Credits',  tag: null },
    { id: 'dev',       credits: 10, price: 179, label: '10 Credits', tag: 'Popular' },
    { id: 'pro',       credits: 25, price: 399, label: '25 Credits', tag: 'Best Value' },
    { id: 'power',     credits: 50, price: 699, label: '50 Credits', tag: null },
  ],
};
