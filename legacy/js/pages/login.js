/**
 * EliteHosting — Login Page
 */
import { authSB } from '../core/supabase.js';
import { auth } from '../core/auth.js';
import { toast } from '../components/toast.js';

document.addEventListener('DOMContentLoaded', async () => {
  await auth.requireGuest();

  const form     = document.getElementById('loginForm');
  const emailEl  = document.getElementById('email');
  const passEl   = document.getElementById('password');
  const submitBtn= document.getElementById('submitBtn');
  const passToggle = document.getElementById('passToggle');
  const forgotLink = document.getElementById('forgotLink');

  // Toggle password visibility
  passToggle?.addEventListener('click', () => {
    const isText = passEl.type === 'text';
    passEl.type = isText ? 'password' : 'text';
    passToggle.textContent = isText ? '👁️' : '🙈';
  });

  // GitHub OAuth
  document.getElementById('btnGitHub')?.addEventListener('click', async () => {
    try {
      await authSB.signInWithGitHub();
    } catch {
      toast.error('GitHub login failed. Try again.');
    }
  });

  // Google OAuth
  document.getElementById('btnGoogle')?.addEventListener('click', async () => {
    try {
      await authSB.signInWithGoogle();
    } catch {
      toast.error('Google login failed. Try again.');
    }
  });

  // Forgot password
  forgotLink?.addEventListener('click', async (e) => {
    e.preventDefault();
    const email = emailEl.value.trim();
    if (!email) {
      toast.warn('Enter your email first, then click Forgot Password.');
      emailEl.focus();
      return;
    }
    forgotLink.textContent = 'Sending…';
    try {
      await authSB.resetPassword(email);
      toast.success('Reset link sent! Check your inbox.');
    } catch {
      toast.error('Failed to send reset email. Try again.');
    } finally {
      forgotLink.textContent = 'Forgot password?';
    }
  });

  // Form submit
  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearErrors();

    const email    = emailEl.value.trim().toLowerCase();
    const password = passEl.value;

    // Basic validation
    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      return setError(emailEl, 'Valid email required');
    }
    if (!password) {
      return setError(passEl, 'Password required');
    }

    setBtnLoading(true);

    try {
      const { data } = await authSB.signIn({ email, password });
      toast.success(`Welcome back, ${data.user.username || 'there'}! 🎉`);
      // Redirect
      const returnTo = new URLSearchParams(location.search).get('returnTo');
      setTimeout(() => {
        location.href = returnTo || '/dashboard/index.html';
      }, 600);
    } catch (err) {
      const msg = err?.data?.error || 'Login failed. Check credentials.';
      toast.error(msg);
      setError(emailEl, ' ');
      setError(passEl, msg);
      passEl.focus();
      passEl.closest('.input-group')?.querySelector('.input')?.classList.add('anim-shake');
    } finally {
      setBtnLoading(false);
    }
  });

  // Clear errors on input
  [emailEl, passEl].forEach(el => el?.addEventListener('input', () => {
    el.classList.remove('error', 'anim-shake');
    const hint = el.closest('.input-group')?.querySelector('.input-error-msg');
    if (hint) hint.textContent = '';
  }));

  function setError(input, msg) {
    input.classList.add('error');
    const hint = input.closest('.input-group')?.querySelector('.input-error-msg');
    if (hint) hint.textContent = msg;
  }

  function clearErrors() {
    document.querySelectorAll('.input.error').forEach(el => el.classList.remove('error'));
    document.querySelectorAll('.input-error-msg').forEach(el => el.textContent = '');
  }

  function setBtnLoading(state) {
    submitBtn.classList.toggle('btn-loading', state);
    submitBtn.disabled = state;
    submitBtn.querySelector('.btn-text').textContent = state ? '' : 'Sign In';
  }
});
