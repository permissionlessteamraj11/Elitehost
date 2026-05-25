/**
 * EliteHosting — Billing JS (QR Payment + Screenshot Upload)
 */
import { auth }                             from '../core/auth.js';
import { creditsSB, paymentSB, profileSB }  from '../core/supabase.js';

const PACKS = [
  { id:'starter', credits:5,  price:99,  label:'5 Credits',  tag:null,         popular:false, value:false },
  { id:'dev',     credits:10, price:179, label:'10 Credits', tag:'⭐ Popular',  popular:true,  value:false },
  { id:'pro',     credits:25, price:399, label:'25 Credits', tag:'💎 Best Value',popular:false,value:true  },
  { id:'power',   credits:50, price:699, label:'50 Credits', tag:null,         popular:false, value:false },
];

let selectedPack  = null;
let screenshotB64 = null;

document.addEventListener('DOMContentLoaded', async () => {
  try { await auth.requireAuth(); } catch { return; }

  // Check payment success/cancel from URL
  const params = new URLSearchParams(location.search);
  if (params.get('payment') === 'success') {
    window.dbToast?.('🎉 Payment submitted! Admin will verify and add credits.', 'success');
    history.replaceState({}, '', location.pathname);
  }

  await Promise.all([loadBalance(), loadTransactions(), loadMyRequests()]);
  renderPacks();
});

/* ── Balance ───────────────────────────────────────────────────── */
async function loadBalance() {
  try {
    const { data } = await creditsSB.getBalance();
    const bal = parseFloat(data.balance ?? 0);
    setText('creditBalanceLarge', bal.toFixed(2));
    document.querySelectorAll('.credit-balance').forEach(el => el.textContent = bal.toFixed(2));

    const weeks = Math.floor(bal);
    setText('weeksEstimate', weeks > 0 ? `~${weeks} week${weeks !== 1 ? 's' : ''}` : 'Low');

    if (data.expiringCredits?.length) {
      const amt  = data.expiringCredits.reduce((a, c) => a + parseFloat(c.remaining), 0);
      const days = Math.ceil((new Date(data.expiringCredits[0].expires_at) - Date.now()) / 86400000);
      const w = document.getElementById('expiringWarn');
      if (w) { w.style.display = 'block'; setText('expiringAmount', amt.toFixed(2)); setText('expiringDays', days); }
    }
  } catch { setText('creditBalanceLarge', '—'); }
}

/* ── Render Packs ──────────────────────────────────────────────── */
function renderPacks() {
  const container = document.getElementById('creditPacks');
  if (!container) return;

  container.innerHTML = PACKS.map(p => `
    <div class="db-pack ${p.popular ? 'is-popular' : p.value ? 'is-value' : ''}"
         data-pack="${p.id}" style="cursor:pointer">
      ${p.tag ? `<div class="db-pack-badge">${p.tag}</div>` : ''}
      <div class="db-pack-credits">${p.credits}</div>
      <div style="font-size:12px;color:var(--text-muted);margin-bottom:10px">credits</div>
      <div class="db-pack-price">₹${p.price}</div>
      <div class="db-pack-rate">₹${(p.price/p.credits).toFixed(0)} per credit</div>
      <div style="font-size:11px;color:var(--text-muted);margin-bottom:14px">≈ ${p.credits} weeks of 1 app</div>
      <button class="db-action-btn primary" style="width:100%;justify-content:center;font-size:13px;min-height:44px"
              data-pack-btn="${p.id}">
        Pay ₹${p.price}
      </button>
    </div>`).join('');

  // Attach pay buttons
  container.querySelectorAll('[data-pack-btn]').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const pack = PACKS.find(p => p.id === btn.dataset.packBtn);
      if (pack) openPaymentModal(pack);
    });
  });
}

/* ── Payment Modal ─────────────────────────────────────────────── */
function openPaymentModal(pack) {
  selectedPack  = pack;
  screenshotB64 = null;

  const adminUpi  = window.__ENV?.ADMIN_UPI_ID   || 'admin@upi';
  const adminName = window.__ENV?.ADMIN_NAME      || 'EliteHosting';

  // QR code URL via Google Charts
  const upiLink = `upi://pay?pa=${adminUpi}&pn=${encodeURIComponent(adminName)}&am=${pack.price}&cu=INR&tn=${encodeURIComponent('EliteHosting '+pack.credits+' credits')}`;
  const qrUrl   = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(upiLink)}&color=00D4FF&bgcolor=03020A`;

  // Remove existing modal
  document.getElementById('payModal')?.remove();

  const modal = document.createElement('div');
  modal.id = 'payModal';
  modal.style.cssText = `
    position:fixed;inset:0;z-index:1000;
    display:flex;align-items:center;justify-content:center;
    background:rgba(0,0,0,.75);backdrop-filter:blur(12px);
    padding:16px;
  `;

  modal.innerHTML = `
    <div style="
      background:var(--color-surface-1);border:1px solid rgba(255,255,255,.1);
      border-radius:24px;padding:24px;width:100%;max-width:420px;
      max-height:90vh;overflow-y:auto;position:relative;
      animation:pop-in .4s cubic-bezier(.34,1.56,.64,1) both;
    ">
      <button id="closePayModal" style="
        position:absolute;top:16px;right:16px;
        background:rgba(255,255,255,.07);border:none;border-radius:8px;
        width:32px;height:32px;color:var(--text-muted);cursor:pointer;
        font-size:18px;display:flex;align-items:center;justify-content:center;
        touch-action:manipulation;
      ">✕</button>

      <h3 style="font-size:18px;font-weight:800;margin-bottom:4px">💳 Pay ₹${pack.price}</h3>
      <p style="font-size:13px;color:var(--text-muted);margin-bottom:20px">
        ${pack.credits} credits will be added after admin verification (usually within 30 min)
      </p>

      <!-- QR Code -->
      <div style="text-align:center;margin-bottom:20px">
        <div style="background:white;border-radius:16px;padding:16px;display:inline-block;margin-bottom:12px">
          <img src="${qrUrl}" width="200" height="200" alt="UPI QR Code" style="display:block;border-radius:8px">
        </div>
        <div style="font-size:13px;font-weight:600;color:var(--electric);margin-bottom:4px">📲 Scan &amp; Pay</div>
        <div style="font-family:var(--font-mono);font-size:14px;font-weight:700;color:var(--text-primary);padding:8px 16px;background:rgba(0,212,255,.08);border:1px solid rgba(0,212,255,.2);border-radius:10px;display:inline-block">
          ${adminUpi}
        </div>
        <div style="font-size:11px;color:var(--text-muted);margin-top:6px">UPI ID — copy and pay manually</div>
      </div>

      <!-- Amount display -->
      <div style="
        background:rgba(0,212,255,.06);border:1px solid rgba(0,212,255,.15);
        border-radius:12px;padding:12px 16px;margin-bottom:20px;
        display:flex;align-items:center;justify-content:space-between;
      ">
        <span style="font-size:13px;color:var(--text-muted)">Amount to pay</span>
        <span style="font-size:20px;font-weight:800;font-family:var(--font-display);color:var(--electric)">₹${pack.price}</span>
      </div>

      <!-- Instructions -->
      <div style="margin-bottom:20px">
        <div style="font-size:12px;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:.07em;margin-bottom:10px">
          How to pay:
        </div>
        <div style="display:flex;flex-direction:column;gap:8px">
          ${['Scan the QR code with any UPI app (PhonePe, GPay, Paytm)', `Pay exactly ₹${pack.price}`, 'Take a screenshot of payment success', 'Upload screenshot below and submit'].map((s, i) => `
            <div style="display:flex;gap:10px;align-items:flex-start;font-size:13px;color:var(--text-secondary)">
              <span style="width:22px;height:22px;border-radius:50%;background:var(--electric-soft);border:1px solid rgba(0,212,255,.2);display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;color:var(--electric);flex-shrink:0">${i+1}</span>
              ${s}
            </div>`).join('')}
        </div>
      </div>

      <!-- UPI ref (optional) -->
      <div style="margin-bottom:16px">
        <label style="display:block;font-size:11px;font-weight:700;color:rgba(255,255,255,.45);text-transform:uppercase;letter-spacing:.07em;margin-bottom:7px">
          UPI Transaction ID <span style="text-transform:none;font-weight:400;color:var(--text-disabled)">(optional but speeds up verification)</span>
        </label>
        <input type="text" id="upiRefInput" class="db-input" placeholder="e.g. 123456789012" autocomplete="off">
      </div>

      <!-- Screenshot upload -->
      <div style="margin-bottom:20px">
        <label style="display:block;font-size:11px;font-weight:700;color:rgba(255,255,255,.45);text-transform:uppercase;letter-spacing:.07em;margin-bottom:7px">
          Payment Screenshot *
        </label>
        <div id="screenshotDrop"
             style="border:2px dashed rgba(0,212,255,.25);border-radius:14px;padding:24px;text-align:center;cursor:pointer;transition:all .2s;touch-action:manipulation"
             onclick="document.getElementById('screenshotFile').click()">
          <div id="screenshotPreview" style="display:none;margin-bottom:10px">
            <img id="screenshotImg" style="max-height:120px;border-radius:8px;max-width:100%">
          </div>
          <div id="screenshotPrompt">
            <div style="font-size:28px;margin-bottom:8px">📸</div>
            <div style="font-size:14px;font-weight:600;color:var(--text-secondary)">Upload payment screenshot</div>
            <div style="font-size:12px;color:var(--text-muted);margin-top:4px">JPG/PNG · Max 5MB</div>
          </div>
        </div>
        <input type="file" id="screenshotFile" accept="image/*" style="display:none">
        <div class="db-error-msg" id="screenshotErr"></div>
      </div>

      <!-- Submit -->
      <button id="submitPayBtn" type="button" disabled
        style="width:100%;padding:14px;background:var(--grad-electric);border:none;border-radius:100px;color:#000;font-size:15px;font-weight:700;cursor:pointer;touch-action:manipulation;opacity:.5;transition:all .2s">
        <span id="submitPayLabel">Upload screenshot to submit</span>
      </button>
    </div>`;

  document.body.appendChild(modal);
  document.body.style.overflow = 'hidden';

  // Close
  document.getElementById('closePayModal').addEventListener('click', closePayModal);
  modal.addEventListener('click', e => { if (e.target === modal) closePayModal(); });

  // Screenshot upload
  document.getElementById('screenshotFile').addEventListener('change', e => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      document.getElementById('screenshotErr').textContent = 'File too large (max 5MB)';
      return;
    }
    const reader = new FileReader();
    reader.onload = ev => {
      screenshotB64 = ev.target.result;
      document.getElementById('screenshotImg').src = screenshotB64;
      document.getElementById('screenshotPreview').style.display = 'block';
      document.getElementById('screenshotPrompt').style.display = 'none';
      document.getElementById('screenshotErr').textContent = '';
      const btn = document.getElementById('submitPayBtn');
      btn.disabled = false;
      btn.style.opacity = '1';
      btn.querySelector('#submitPayLabel').textContent = `Submit Payment for ₹${pack.price}`;
    };
    reader.readAsDataURL(file);
  });

  // Submit
  document.getElementById('submitPayBtn').addEventListener('click', async () => {
    if (!screenshotB64) return;
    const btn = document.getElementById('submitPayBtn');
    const lbl = document.getElementById('submitPayLabel');
    btn.disabled = true;
    lbl.innerHTML = '<span class="db-spin"></span> Submitting…';

    try {
      await paymentSB.submitRequest({
        packId:            pack.id,
        amountInr:         pack.price,
        creditsRequested:  pack.credits,
        screenshotBase64:  screenshotB64,
        upiRef:            document.getElementById('upiRefInput').value.trim() || null,
      });
      closePayModal();
      window.dbToast?.('✅ Payment submitted! Admin will verify within 30 min.', 'success');
      loadMyRequests();
    } catch (err) {
      window.dbToast?.(err?.data?.error || 'Submission failed. Try again.', 'error');
      btn.disabled = false;
      lbl.textContent = `Submit Payment for ₹${pack.price}`;
    }
  });
}

function closePayModal() {
  document.getElementById('payModal')?.remove();
  document.body.style.overflow = '';
}

/* ── My Payment Requests ───────────────────────────────────────── */
async function loadMyRequests() {
  const container = document.getElementById('myRequests');
  if (!container) return;
  try {
    const { data } = await paymentSB.getMyRequests();
    const reqs = data.requests;
    if (!reqs.length) { container.innerHTML = ''; return; }

    container.innerHTML = `
      <h3 style="font-size:16px;font-weight:700;margin-bottom:12px">My Payment Requests</h3>
      ${reqs.map(r => {
        const status = r.status === 'approved' ? { color:'var(--mint)',   icon:'✅', label:'Approved'  } :
                       r.status === 'rejected' ? { color:'var(--error)',  icon:'❌', label:'Rejected'  } :
                                                 { color:'var(--warning)',icon:'⏳', label:'Pending'   };
        const date = new Date(r.created_at).toLocaleString('en-IN',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'});
        return `
          <div class="db-card" style="margin-bottom:10px">
            <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px">
              <div>
                <div style="font-size:14px;font-weight:600">₹${r.amount_inr} → ${r.credits_requested} credits</div>
                <div style="font-size:12px;color:var(--text-muted);margin-top:2px">${date}</div>
                ${r.admin_note ? `<div style="font-size:11px;color:var(--text-muted);margin-top:4px">Note: ${r.admin_note}</div>` : ''}
              </div>
              <span style="padding:5px 14px;border-radius:100px;font-size:12px;font-weight:700;background:rgba(0,0,0,.3);color:${status.color}">
                ${status.icon} ${status.label}
              </span>
            </div>
          </div>`;
      }).join('')}`;
  } catch {}
}

/* ── Transactions ──────────────────────────────────────────────── */
async function loadTransactions() {
  const container = document.getElementById('txList');
  if (!container) return;
  showSkel(container, 3);
  try {
    const { data } = await creditsSB.getTransactions(30);
    const txs = data.transactions;
    if (!txs.length) {
      container.innerHTML = `<div style="text-align:center;padding:32px;color:var(--text-muted);font-size:13px">No transactions yet.</div>`;
      return;
    }
    container.innerHTML = txs.map(tx => {
      const isDebit = tx.type === 'debit';
      const icon = tx.source === 'purchase' ? '💳' : tx.source === 'ai' ? '🤖' : tx.source === 'deployment' ? '🚀' : '🎁';
      const date = new Date(tx.created_at).toLocaleString('en-IN',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'});
      return `
        <div class="db-tx-row">
          <span class="db-tx-icon">${icon}</span>
          <div class="db-tx-info">
            <div class="db-tx-desc">${esc(tx.description || tx.source)}</div>
            <div class="db-tx-date">${date}</div>
          </div>
          <span class="db-tx-amount ${isDebit ? 'debit' : 'credit'}">
            ${isDebit ? '−' : '+'}${parseFloat(tx.amount).toFixed(2)} cr
          </span>
        </div>`;
    }).join('');
  } catch {
    container.innerHTML = `<div style="color:var(--error);padding:12px;font-size:13px">Failed to load transactions.</div>`;
  }
}

/* ── Helpers ───────────────────────────────────────────────────── */
function showSkel(el, n) {
  el.innerHTML = Array(n).fill(`<div class="db-skel db-skel-line" style="margin-bottom:16px"></div>`).join('');
}
function setText(id, v) { const el = document.getElementById(id); if (el) el.textContent = v; }
function esc(s) { return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
