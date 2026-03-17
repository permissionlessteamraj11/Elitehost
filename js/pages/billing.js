/**
 * EliteHosting — Billing Page JS
 */
import { auth } from '../core/auth.js';
import { creditsSB } from '../core/supabase.js';
import { toast } from '../components/toast.js';
import { CONFIG } from '../core/config.js';

document.addEventListener('DOMContentLoaded', async () => {
  await auth.requireAuth();
  initSidebar();

  // Check for payment success
  const params = new URLSearchParams(location.search);
  if (params.get('payment') === 'success') {
    toast.success('🎉 Credits added to your account!', { duration: 6000 });
    history.replaceState({}, '', location.pathname);
  }
  if (params.get('payment') === 'cancel') {
    toast.warn('Payment cancelled.');
    history.replaceState({}, '', location.pathname);
  }

  await Promise.all([loadBalance(), loadTransactions()]);
  renderCreditPacks();
});

function initSidebar() {
  document.getElementById('sidebarToggle')?.addEventListener('click', () => {
    document.getElementById('sidebar')?.classList.toggle('mobile-open');
  });
  document.querySelectorAll('.nav-item[href]').forEach(a =>
    a.classList.toggle('active', a.getAttribute('href') === location.pathname)
  );
}

async function loadBalance() {
  try {
    const { data } = await creditsSB.getBalance();
    const bal = parseFloat(data?.balance ?? 0);
    setText('creditBalance',     bal.toFixed(2));
    setText('creditBalanceLarge', bal.toFixed(2));
    document.querySelectorAll('.credit-balance').forEach(el => el.textContent = bal.toFixed(2));

    // Expiring credits warning
    const expiring = data?.expiringCredits || [];
    if (expiring.length) {
      const totalExpiring = expiring.reduce((a, c) => a + parseFloat(c.remaining_credits), 0);
      const daysLeft = Math.ceil((new Date(expiring[0].expires_at) - Date.now()) / 86400000);
      const warn = document.getElementById('expiringWarn');
      if (warn) {
        warn.style.display = 'flex';
        setText('expiringAmount', totalExpiring.toFixed(2));
        setText('expiringDays',   daysLeft);
      }
    }

    // Weeks estimate
    const weeksLeft = Math.floor(bal);
    setText('weeksEstimate', weeksLeft > 0 ? `~${weeksLeft} week${weeksLeft !== 1 ? 's' : ''}` : 'Low balance');
  } catch {
    setText('creditBalance', '—');
  }
}

async function loadTransactions() {
  const container = document.getElementById('txList');
  if (!container) return;
  showSkeleton(container, 4);

  try {
    const { data } = await creditsSB.getTransactions();
    const txs = data?.transactions || [];

    if (!txs.length) {
      container.innerHTML = `
        <div style="text-align:center;padding:var(--s8);color:var(--text-muted)">
          <div style="font-size:32px;margin-bottom:var(--s4)">📋</div>
          <p>No transactions yet.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = txs.map(tx => {
      const isDebit  = tx.type === 'debit';
      const sign     = isDebit ? '−' : '+';
      const color    = isDebit ? 'var(--error)' : 'var(--mint)';
      const icon     = tx.source === 'deployment' ? '🚀' : tx.source === 'ai' ? '🤖' : tx.source === 'purchase' ? '💳' : '🎁';
      const date     = new Date(tx.created_at).toLocaleString('en-IN', { day:'numeric', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' });
      return `
        <div style="display:flex;align-items:center;gap:var(--s4);padding:var(--s4) 0;border-bottom:1px solid var(--border)">
          <span style="font-size:20px;width:28px;text-align:center">${icon}</span>
          <div style="flex:1">
            <div style="font-size:var(--text-sm);font-weight:500">${escHtml(tx.description || tx.source)}</div>
            <div style="font-size:var(--text-xs);color:var(--text-muted)">${date}</div>
          </div>
          <div style="font-family:var(--font-mono);font-weight:700;color:${color};font-size:var(--text-base)">
            ${sign}${parseFloat(tx.amount).toFixed(2)} cr
          </div>
          <div style="font-family:var(--font-mono);font-size:var(--text-xs);color:var(--text-muted)">
            Bal: ${parseFloat(tx.balance_after).toFixed(2)}
          </div>
        </div>
      `;
    }).join('');
  } catch {
    container.innerHTML = `<div style="color:var(--error);padding:var(--s4)">Failed to load transactions.</div>`;
  }
}

function renderCreditPacks() {
  const container = document.getElementById('creditPacks');
  if (!container) return;

  container.innerHTML = CONFIG.CREDIT_PACKS.map(pack => `
    <div class="card ${pack.tag === 'Popular' ? 'card-electric' : pack.tag === 'Best Value' ? 'card-mint' : ''}"
         style="text-align:center;padding:var(--s6);position:relative;transition:all var(--t-base)">
      ${pack.tag ? `<div class="badge badge-${pack.tag === 'Popular' ? 'building' : 'running'}"
                        style="position:absolute;top:var(--s3);right:var(--s3)">${pack.tag}</div>` : ''}
      <div style="font-size:var(--text-3xl);font-weight:800;margin-bottom:var(--s2);font-family:var(--font-display)">
        ${pack.credits}
        <span style="font-size:var(--text-base);color:var(--text-muted);font-weight:400"> credits</span>
      </div>
      <div style="font-size:var(--text-xs);color:var(--text-muted);margin-bottom:var(--s4)">
        ≈ ${pack.credits} weeks of 1 running app
      </div>
      <div style="font-size:var(--text-2xl);font-weight:800;color:var(--electric);margin-bottom:var(--s5);font-family:var(--font-display)">
        ₹${pack.price}
      </div>
      <div style="font-size:var(--text-xs);color:var(--text-muted);margin-bottom:var(--s5)">
        ₹${(pack.price / pack.credits).toFixed(0)} per credit
      </div>
      <button class="btn btn-electric btn-md w-full buy-btn"
              data-pack="${pack.id}" data-credits="${pack.credits}" data-price="${pack.price}"
              aria-label="Buy ${pack.credits} credits for ₹${pack.price}">
        Buy Now — ₹${pack.price}
      </button>
    </div>
  `).join('');

  // Attach buy handlers
  container.querySelectorAll('.buy-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      btn.classList.add('btn-loading'); btn.disabled = true;
      try {
        const { data } = await creditsSB.createCheckout(btn.dataset.pack);
        if (data?.checkoutUrl) {
          window.location.href = data.checkoutUrl;
        } else {
          toast.error('Could not initiate checkout. Contact support.');
        }
      } catch (err) {
        toast.error(err?.data?.error || 'Checkout failed. Try again.');
      } finally {
        btn.classList.remove('btn-loading'); btn.disabled = false;
      }
    });
  });
}

function showSkeleton(el, count = 3) {
  el.innerHTML = Array(count).fill(0).map(() =>
    `<div style="padding:var(--s4) 0;border-bottom:1px solid var(--border)">
      <div class="skeleton skeleton-text" style="width:60%"></div>
      <div class="skeleton skeleton-text" style="width:40%;margin-top:var(--s2)"></div>
    </div>`
  ).join('');
}

function setText(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val;
}

function escHtml(s) {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}
