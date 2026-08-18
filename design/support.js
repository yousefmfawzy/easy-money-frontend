const GREEN = '#3ADF00';
const ORANGE = '#F26522';
const MIN = 1000;
const MAX = 100000;

function group(n) {
  const s = String(Math.round(n));
  let out = '';
  for (let i = 0; i < s.length; i++) {
    if (i > 0 && (s.length - i) % 3 === 0) out += ',';
    out += s[i];
  }
  return out;
}

class Component extends DCLogic {
  componentDidMount() {
    this.values = [94500, 68200, 41300, 12800, 78900, 27600];
    this.dirs = [1, -1, 1, -1, 1, 1];
    this.lastUpdate = Date.now();
    this.paintAll();
    this.clockTimer = setInterval(() => this.tickClock(), 1000);
    if (this.props.livePrices !== false) {
      this.priceTimer = setInterval(() => this.tickPrice(), 5000);
    }
    this.tickClock();
  }

  componentWillUnmount() {
    clearInterval(this.clockTimer);
    clearInterval(this.priceTimer);
  }

  downColor() {
    return this.props.downColor || '#FF1E1E';
  }

  glow(color) {
    if (this.props.barGlow === false) return 'none';
    const rgb = color === GREEN ? '58,223,0' : color === ORANGE ? '242,101,34' : '255,30,30';
    return '0 0 2.6cqw rgba(' + rgb + ',0.4)';
  }

  paintBar(i) {
    const bar = document.querySelector('[data-bar="' + i + '"]');
    if (!bar) return;
    const color = this.dirs[i] < 0 ? this.downColor() : GREEN;
    const pct = Math.max(0, Math.min(100, ((this.values[i] - MIN) / (MAX - MIN)) * 100));
    bar.style.background = color;
    bar.style.boxShadow = this.glow(color);
    bar.style.height = pct.toFixed(2) + '%';
    const val = document.querySelector('[data-value="' + i + '"]');
    if (val && val.parentElement) {
      val.parentElement.style.bottom = 'calc(' + pct.toFixed(2) + '% + 1cqw)';
    }
  }

  paintAll() {
    for (let i = 0; i < 6; i++) this.paintBar(i);
  }

  tickClock() {
    const el = document.querySelector('[data-clock="1"]');
    if (el) {
      const d = new Date();
      const p = (n) => String(n).padStart(2, '0');
      const h24 = d.getHours();
      const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
      el.textContent = h12 + ':' + p(d.getMinutes()) + ':' + p(d.getSeconds()) + ' ' + (h24 < 12 ? 'AM' : 'PM');
    }
    const ago = document.querySelector('[data-ago="1"]');
    if (ago) {
      const s = Math.max(0, Math.round((Date.now() - this.lastUpdate) / 1000));
      ago.textContent = s + 's AGO';
    }
  }

  tickPrice() {
    const i = Math.floor(Math.random() * 6);
    const up = Math.random() > 0.42;
    const pct = 0.6 + Math.random() * 4.2;
    const next = up ? this.values[i] * (1 + pct / 100) : this.values[i] * (1 - pct / 100);
    this.values[i] = Math.max(1200, Math.min(99500, Math.round(next / 100) * 100));
    this.dirs[i] = up ? 1 : -1;
    this.lastUpdate = Date.now();

    const val = document.querySelector('[data-value="' + i + '"]');
    if (val) {
      val.textContent = group(this.values[i]);
      val.style.animation = 'none';
      void val.offsetWidth;
      val.style.animation = 'em-pop 0.55s cubic-bezier(0.2,0.9,0.25,1)';
    }
    const bar = document.querySelector('[data-bar="' + i + '"]');
    if (bar) bar.style.transition = 'height 0.7s cubic-bezier(0.3,0.85,0.25,1), background 0.3s linear, box-shadow 0.3s linear';
    this.paintBar(i);

    const ch = document.querySelector('[data-change="' + i + '"]');
    if (ch) {
      ch.style.color = up ? GREEN : ORANGE;
      const spans = ch.querySelectorAll('span');
      if (spans.length === 2) {
        spans[0].textContent = up ? '▲' : '▼';
        spans[1].textContent = (up ? '+' : '-') + pct.toFixed(2) + '%';
      }
    }
    this.tickClock();
  }

  renderVals() {
    return {};
  }
}
