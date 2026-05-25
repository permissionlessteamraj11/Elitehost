/**
 * Elite Command Palette v1.0
 */
export const initCommandPalette = () => {
  const palette = document.getElementById('commandPalette');
  const input = document.getElementById('cmdInput');
  const results = document.getElementById('cmdResults');

  if (!palette || !input || !results) return;

  const COMMANDS = [
    { name: 'Go to Features', icon: '⚡', url: '/features.html' },
    { name: 'View Pricing', icon: '💰', url: '/pricing.html' },
    { name: 'Read Blog', icon: '✍️', url: '/blog/' },
    { name: 'Login to Dashboard', icon: '🔑', url: '/auth/login.html' },
    { name: 'Register New Account', icon: '🚀', url: '/auth/register.html' },
    { name: 'Contact Support', icon: '💬', url: 'https://t.me/elitehosting_support' },
    { name: 'Open Documentation', icon: '📖', url: 'https://docs.elitehosting.in' },
  ];

  let selectedIdx = 0;

  const show = () => {
    palette.style.display = 'flex';
    input.focus();
    renderResults('');
  };

  const hide = () => {
    palette.style.display = 'none';
    input.value = '';
  };

  const renderResults = (query) => {
    const filtered = COMMANDS.filter(c =>
      c.name.toLowerCase().includes(query.toLowerCase())
    );

    results.innerHTML = filtered.map((cmd, i) => `
      <div class="cmd-item ${i === selectedIdx ? 'active' : ''}" data-url="${cmd.url}" style="
        padding: var(--s3) var(--s4);
        border-radius: var(--r-sm);
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: var(--s3);
        transition: all var(--t-fast);
        ${i === selectedIdx ? 'background: var(--electric-soft); color: var(--electric);' : 'color: var(--text-secondary);'}
      ">
        <span style="font-size: 16px">${cmd.icon}</span>
        <span style="font-size: var(--text-sm); font-weight: 500">${cmd.name}</span>
        ${i === selectedIdx ? '<span style="margin-left: auto; font-size: 10px; opacity: 0.6">↵</span>' : ''}
      </div>
    `).join('');

    // Add click events
    results.querySelectorAll('.cmd-item').forEach((el, i) => {
      el.onclick = () => {
        window.location.href = el.dataset.url;
      };
      el.onmouseenter = () => {
        selectedIdx = i;
        renderResults(input.value);
      };
    });
  };

  // Keyboard Shortcuts
  window.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      show();
    }
    if (e.key === 'Escape') hide();
  });

  palette.addEventListener('click', (e) => {
    if (e.target === palette) hide();
  });

  input.addEventListener('input', (e) => {
    selectedIdx = 0;
    renderResults(e.target.value);
  });

  input.addEventListener('keydown', (e) => {
    const items = results.querySelectorAll('.cmd-item');
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      selectedIdx = (selectedIdx + 1) % items.length;
      renderResults(input.value);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      selectedIdx = (selectedIdx - 1 + items.length) % items.length;
      renderResults(input.value);
    } else if (e.key === 'Enter') {
      const active = items[selectedIdx];
      if (active) window.location.href = active.dataset.url;
    }
  });
};
