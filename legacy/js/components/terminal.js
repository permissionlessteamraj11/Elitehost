/**
 * Terminal log renderer with level coloring + search + download
 * @class Terminal
 */
export class Terminal {
  #el; #lines = []; #maxLines; #autoScroll = true; #filter = null;

  constructor(containerEl, opts = {}) {
    this.#el = containerEl;
    this.#maxLines = opts.maxLines || 600;
    this.#el.style.cssText = `
      height:${opts.height || '340px'};overflow-y:auto;
      font-family:var(--font-mono);font-size:12px;line-height:1.65;
      padding:14px 16px;background:#060810;scrollbar-width:thin;
    `;
    this.#el.addEventListener('scroll', () => {
      const { scrollTop, scrollHeight, clientHeight } = this.#el;
      this.#autoScroll = scrollTop + clientHeight >= scrollHeight - 20;
    });
  }

  addLine(level = 'info', message, timestamp) {
    const COLORS = {
      error:   '#FF6B6B', success: '#00FFA3', warn: '#FFD60A',
      info:    '#93C5FD', debug:   'rgba(255,255,255,0.28)',
      system:  '#A78BFA', command: '#00D4FF',
    };
    const ts = timestamp ? (timestamp instanceof Date ? timestamp : new Date(timestamp)) : new Date();
    const line = document.createElement('div');
    line.dataset.level = level;
    line.style.cssText = `color:${COLORS[level] || '#FFFFFF88'};padding:1px 0;display:flex;gap:10px;word-break:break-word;`;

    const tsSpan = document.createElement('span');
    tsSpan.style.cssText = `color:rgba(255,255,255,0.22);flex-shrink:0;user-select:none;font-size:11px;`;
    tsSpan.textContent = ts.toLocaleTimeString('en-IN', { hour12: false });

    const lvlSpan = document.createElement('span');
    lvlSpan.style.cssText = `flex-shrink:0;font-weight:600;font-size:10px;text-transform:uppercase;opacity:0.7;min-width:36px;`;
    lvlSpan.textContent = level.substring(0, 4).padEnd(4);

    const msgSpan = document.createElement('span');
    msgSpan.style.cssText = `flex:1;`;
    msgSpan.innerHTML = this.#processMessage(message);

    line.appendChild(tsSpan);
    line.appendChild(lvlSpan);
    line.appendChild(msgSpan);

    if (this.#filter && !message.toLowerCase().includes(this.#filter.toLowerCase())) {
      line.style.display = 'none';
    }

    this.#el.appendChild(line);
    this.#lines.push(line);

    while (this.#lines.length > this.#maxLines) {
      this.#lines[0].remove(); this.#lines.shift();
    }
    if (this.#autoScroll) this.#el.scrollTop = this.#el.scrollHeight;
    return line;
  }

  #processMessage(msg) {
    let clean = String(msg).replace(/\x1B\[[0-9;]*[a-zA-Z]/g, '');
    clean = clean.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    // Clickable URLs
    clean = clean.replace(/(https?:\/\/[^\s]+)/g,
      '<a href="$1" target="_blank" rel="noopener noreferrer" style="color:var(--electric);text-decoration:underline;">$1</a>');
    return clean;
  }

  setLive(isLive) {
    const badge = document.getElementById('liveBadge');
    if (!badge) return;
    badge.textContent = isLive ? '🟢 Live' : '⚪ Idle';
    badge.style.color = isLive ? 'var(--mint)' : 'var(--text-muted)';
  }

  filter(query) {
    this.#filter = query;
    this.#lines.forEach(line => {
      const msg = line.querySelector('span:last-child')?.textContent || '';
      line.style.display = (!query || msg.toLowerCase().includes(query.toLowerCase())) ? '' : 'none';
    });
  }

  clear() { this.#el.innerHTML = ''; this.#lines = []; }
  scrollToBottom() { this.#el.scrollTop = this.#el.scrollHeight; }

  getContent() { return this.#lines.map(l => l.textContent).join('\n'); }

  downloadLog(filename) {
    const blob = new Blob([this.getContent()], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename || `build-log-${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  }
}

export default Terminal;
