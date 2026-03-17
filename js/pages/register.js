/**
 * EliteHosting — Register Page JS
 * Password strength · Inline validation · Referral code from URL
 */
import { authSB } from '../core/supabase.js';
import { auth } from '../core/auth.js';
import { toast } from '../components/toast.js';

document.addEventListener('DOMContentLoaded', async () => {
  await auth.requireGuest();

  const form       = document.getElementById('registerForm');
  const emailEl    = document.getElementById('email');
  const userEl     = document.getElementById('username');
  const passEl     = document.getElementById('password');
  const refEl      = document.getElementById('referralCode');
  const submitBtn  = document.getElementById('submitBtn');
  const passToggle = document.getElementById('passToggle');
  const strengthSegs  = document.querySelectorAll('.strength-seg');
  const strengthLabel = document.querySelector('.strength-label');

  // Pre-fill referral code from URL
  const urlRef = new URLSearchParams(location.search).get('ref');
  if (urlRef && refEl) {
    refEl.value = urlRef.toUpperCase();
    refEl.closest('.input-group')?.classList.add('ref-prefilled');
  }

  // Toggle password
  passToggle?.addEventListener('click', () => {
    const isText = passEl.type === 'text';
    passEl.type = isText ? 'password' : 'text';
    passToggle.textContent = isText ? '👁️' : '🙈';
  });

  // GitHub OAuth
  document.getElementById('btnGitHub')?.addEventListener('click', async () => {
    try { await authSB.signInWithGitHub(); }
    catch { toast.error('GitHub signup failed.'); }
  });

  // Google OAuth
  document.getElementById('btnGoogle')?.addEventListener('click', async () => {
    try { await authSB.signInWithGoogle(); }
    catch { toast.error('Google signup failed.'); }
  });

  // Username: lowercase + sanitize, real-time
  userEl?.addEventListener('input', () => {
    userEl.value = userEl.value.toLowerCase().replace(/[^a-z0-9_-]/g, '');
    validateUsername(userEl.value);
  });

  // Password strength
  passEl?.addEventListener('input', () => {
    const strength = calcStrength(passEl.value);
    strengthSegs.forEach((seg, i) => {
      seg.className = `strength-seg${i < strength ? ` active-${strength}` : ''}`;
    });
    const labels = ['', '😬 Too weak', '🙂 Fair', '😊 Good', '💪 Strong'];
    const colors = ['', 'var(--error)', 'var(--fire)', 'var(--warning)', 'var(--mint)'];
    if (strengthLabel) {
      strengthLabel.textContent = passEl.value.length ? labels[strength] : '';
      strengthLabel.style.color = colors[strength];
    }
    if (passEl.value.length > 0) clearError(passEl);
  });

  // Email blur validation
  emailEl?.addEventListener('blur', () => {
    if (emailEl.value && !isValidEmail(emailEl.value)) {
      setError(emailEl, 'Enter a valid email address');
    }
  });

  // Clear errors on input
  [emailEl, passEl, refEl].forEach(el =>
    el?.addEventListener('input', () => clearError(el))
  );

  // Form submit
  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearAllErrors();

    const email    = emailEl.value.trim().toLowerCase();
    const username = userEl.value.trim();
    const password = passEl.value;
    const refCode  = refEl?.value.trim().toUpperCase() || null;

    // Validate all fields
    let valid = true;
    if (!isValidEmail(email)) {
      setError(emailEl, 'Valid email required'); valid = false;
    }
    if (username.length < 3) {
      setError(userEl, 'Min 3 characters required'); valid = false;
    }
    if (username.length > 30) {
      setError(userEl, 'Max 30 characters'); valid = false;
    }
    if (!username.match(/^[a-z0-9_-]+$/)) {
      setError(userEl, 'Only lowercase letters, numbers, _ and -'); valid = false;
    }
    if (calcStrength(password) < 2) {
      setError(passEl, 'Use uppercase letters and numbers to strengthen'); valid = false;
    }
    if (password.length < 8) {
      setError(passEl, 'Min 8 characters required'); valid = false;
    }
    if (!document.getElementById('agreeTerms')?.checked) {
      toast.warn('Please accept the Terms of Service to continue.');
      valid = false;
    }
    if (!valid) return;

    setBtnLoading(true);

    try {
      await authSB.signUp({ email, password, username, referralCode: refCode });
      renderSuccess(email);
    } catch (err) {
      const msg = err?.data?.error || 'Registration failed. Try again.';
      toast.error(msg);
      const lower = msg.toLowerCase();
      if (lower.includes('email'))    setError(emailEl, msg);
      else if (lower.includes('user')) setError(userEl, msg);
      else if (lower.includes('pass')) setError(passEl, msg);
    } finally {
      setBtnLoading(false);
    }
  });

  /* ── Helpers ────────────────────────────────────────────────── */
  function renderSuccess(email) {
    form.innerHTML = `
      <div class="register-success text-center" style="padding:var(--s8) 0">
        <div style="font-size:56px;margin-bottom:var(--s5)">📬</div>
        <h2 style="margin-bottom:var(--s3)">Verify your email</h2>
        <p style="color:var(--text-muted);max-width:340px;margin:0 auto var(--s6)">
          We sent a link to <strong style="color:var(--text-primary)">${email}</strong>.<br>
          Click it to activate your account and claim your
          <strong style="color:var(--mint)">2 free credits 🎁</strong>
        </p>
        <div style="display:flex;gap:var(--s3);justify-content:center;flex-wrap:wrap">
          <a href="/auth/login.html" class="btn btn-electric btn-md">Go to Login →</a>
          <a href="/" class="btn btn-ghost btn-md">Back to Home</a>
        </div>
        <p style="margin-top:var(--s5);font-size:var(--text-xs);color:var(--text-muted)">
          Didn't receive it? Check spam folder or
          <a href="#" id="resendLink" style="color:var(--electric)">click to resend</a>.
        </p>
      </div>
    `;

    document.getElementById('resendLink')?.addEventListener('click', async (e) => {
      e.preventDefault();
      try {
        await authSB.resetPassword(email);
        toast.success('Verification email resent!');
      } catch { toast.error('Could not resend. Try again later.'); }
    });
  }

  function calcStrength(pw) {
    let score = 0;
    if (pw.length >= 8) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    return Math.min(score, 4);
  }

  function validateUsername(val) {
    if (!val) return;
    if (val.length < 3) return setError(userEl, 'Min 3 chars');
    if (!/^[a-z0-9_-]+$/.test(val)) return setError(userEl, 'Invalid characters');
    clearError(userEl);
  }

  function isValidEmail(v) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  }

  function setError(el, msg) {
    el.classList.add('error');
    const hint = el.closest('.input-group')?.querySelector('.input-error-msg');
    if (hint) hint.textContent = msg;
  }

  function clearError(el) {
    el.classList.remove('error', 'anim-shake');
    const hint = el.closest('.input-group')?.querySelector('.input-error-msg');
    if (hint) hint.textContent = '';
  }

  function clearAllErrors() {
    document.querySelectorAll('.input.error').forEach(el => el.classList.remove('error'));
    document.querySelectorAll('.input-error-msg').forEach(el => el.textContent = '');
  }

  function setBtnLoading(state) {
    submitBtn.classList.toggle('btn-loading', state);
    submitBtn.disabled = state;
  }
});
