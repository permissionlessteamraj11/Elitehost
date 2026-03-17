/**
 * Pure Canvas 2D line chart — No external deps
 * @class MetricsChart
 */
export class MetricsChart {
  #canvas; #ctx; #data = []; #opts; #W; #H;

  constructor(canvas, opts = {}) {
    this.#canvas = canvas;
    this.#ctx = canvas.getContext('2d');
    this.#opts = {
      maxPoints:   opts.maxPoints   || 30,
      maxValue:    opts.maxValue    || 100,
      color:       opts.color       || '#00D4FF',
      fillOpacity: opts.fillOpacity || 0.15,
      lineWidth:   opts.lineWidth   || 2,
      dotRadius:   opts.dotRadius   || 3,
      gridLines:   opts.gridLines   || 4,
      smooth:      opts.smooth      !== false,
      unit:        opts.unit        || '',
    };
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    this.#W = rect.width || 300;
    this.#H = rect.height || 120;
    canvas.width  = this.#W * dpr;
    canvas.height = this.#H * dpr;
    this.#ctx.scale(dpr, dpr);
    canvas.style.width  = this.#W + 'px';
    canvas.style.height = this.#H + 'px';
  }

  update(value) {
    this.#data.push(Math.max(0, Math.min(Number(value) || 0, this.#opts.maxValue)));
    if (this.#data.length > this.#opts.maxPoints) this.#data.shift();
    this.#draw();
  }

  #draw() {
    const ctx = this.#ctx, W = this.#W, H = this.#H;
    const { maxValue, color, fillOpacity, lineWidth, dotRadius, gridLines, smooth, unit } = this.#opts;
    ctx.clearRect(0, 0, W, H);
    if (this.#data.length < 2) return;

    const step = W / (this.#opts.maxPoints - 1);
    const getX = i => i * step;
    const getY = v => H - (v / maxValue) * H * 0.85 - H * 0.08;

    // Grid lines
    ctx.strokeStyle = 'rgba(255,255,255,0.04)';
    ctx.lineWidth = 1;
    for (let i = 1; i <= gridLines; i++) {
      const y = H * (i / (gridLines + 1));
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
    }

    const points = this.#data.map((v, i) => ({
      x: getX(i + (this.#opts.maxPoints - this.#data.length)),
      y: getY(v),
    }));

    // Fill gradient
    ctx.beginPath();
    this.#tracePath(ctx, points, smooth);
    ctx.lineTo(points[points.length - 1].x, H);
    ctx.lineTo(points[0].x, H);
    ctx.closePath();
    const grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, this.#hexToRgba(color, fillOpacity));
    grad.addColorStop(1, this.#hexToRgba(color, 0));
    ctx.fillStyle = grad; ctx.fill();

    // Line
    ctx.beginPath(); this.#tracePath(ctx, points, smooth);
    ctx.strokeStyle = color; ctx.lineWidth = lineWidth;
    ctx.lineJoin = 'round'; ctx.lineCap = 'round'; ctx.stroke();

    // Dot at current value
    const last = points[points.length - 1];
    ctx.beginPath(); ctx.arc(last.x, last.y, dotRadius + 2, 0, Math.PI * 2);
    ctx.fillStyle = this.#hexToRgba(color, 0.3); ctx.fill();
    ctx.beginPath(); ctx.arc(last.x, last.y, dotRadius, 0, Math.PI * 2);
    ctx.fillStyle = color; ctx.fill();

    // Value label
    const curVal = this.#data[this.#data.length - 1];
    ctx.fillStyle = color;
    ctx.font = `600 11px "JetBrains Mono", monospace`;
    ctx.textAlign = 'right';
    ctx.fillText(`${curVal.toFixed(1)}${unit}`, W - 4, 14);
  }

  #tracePath(ctx, points, smooth) {
    ctx.moveTo(points[0].x, points[0].y);
    if (!smooth) { points.slice(1).forEach(p => ctx.lineTo(p.x, p.y)); return; }
    for (let i = 0; i < points.length - 1; i++) {
      const cpx = (points[i].x + points[i + 1].x) / 2;
      ctx.bezierCurveTo(cpx, points[i].y, cpx, points[i + 1].y, points[i + 1].x, points[i + 1].y);
    }
  }

  #hexToRgba(hex, alpha) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r},${g},${b},${alpha})`;
  }

  setMaxValue(max) { this.#opts.maxValue = max; this.#draw(); }
  getData() { return [...this.#data]; }
  clear() { this.#data = []; this.#ctx.clearRect(0, 0, this.#W, this.#H); }
}

export default MetricsChart;
