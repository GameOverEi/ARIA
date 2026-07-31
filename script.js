// ============================================================
// AIRA — shared behaviour
// ============================================================

// Mobile nav toggle
document.addEventListener('DOMContentLoaded', () => {
  const btn = document.querySelector('.menu-btn');
  const links = document.querySelector('.nav-links');
  if (btn && links) {
    btn.addEventListener('click', () => {
      const open = links.classList.toggle('open-mobile');
      links.style.display = open ? 'flex' : '';
      links.style.flexDirection = 'column';
      links.style.position = 'absolute';
      links.style.top = '64px';
      links.style.left = '0';
      links.style.right = '0';
      links.style.background = '#fff';
      links.style.padding = '10px 18px 18px';
      links.style.borderBottom = '1px solid var(--line)';
    });
  }

  // Gauges
  document.querySelectorAll('[data-gauge]').forEach(initGauge);
});

function aqiColor(v) {
  if (v <= 50) return getVar('--aqi-good');
  if (v <= 100) return getVar('--aqi-moderate');
  if (v <= 150) return getVar('--aqi-sensitive');
  if (v <= 200) return getVar('--aqi-unhealthy');
  if (v <= 300) return getVar('--aqi-verybad');
  return getVar('--aqi-hazard');
}
function aqiLabelTH(v) {
  if (v <= 50) return 'ดี (Good)';
  if (v <= 100) return 'ปานกลาง (Moderate)';
  if (v <= 150) return 'เริ่มมีผลต่อกลุ่มเสี่ยง';
  if (v <= 200) return 'ไม่ดีต่อสุขภาพ';
  if (v <= 300) return 'แย่มาก (Very Unhealthy)';
  return 'อันตราย (Hazardous)';
}
function getVar(name) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

function initGauge(el) {
  const value = parseFloat(el.dataset.gauge);
  const max = parseFloat(el.dataset.max || 300);
  const r = 50, c = 2 * Math.PI * r;
  const pct = Math.min(value / max, 1);
  const fg = el.querySelector('.ring-fg');
  if (!fg) return;
  fg.style.stroke = aqiColor(value);
  fg.style.strokeDasharray = `${c}`;
  fg.style.strokeDashoffset = `${c}`;
  requestAnimationFrame(() => {
    fg.style.strokeDashoffset = `${c * (1 - pct)}`;
  });
}

// Simple inline SVG line chart with AQI colour bands behind it.
// container: element with class chart-wrap; data: array of {x label, y value}
function drawTrendChart(container, data, opts = {}) {
  const w = opts.width || 560, h = opts.height || 200, pad = 24;
  const max = opts.max || 220;
  const min = 0;
  const points = data.map((d, i) => {
    const x = pad + (i / (data.length - 1)) * (w - pad * 2);
    const y = h - pad - ((d.y - min) / (max - min)) * (h - pad * 2);
    return [x, y];
  });
  const path = points.map((p, i) => (i === 0 ? 'M' : 'L') + p[0].toFixed(1) + ',' + p[1].toFixed(1)).join(' ');

  const bandStops = [
    { v: 300, color: 'var(--aqi-hazard)' },
    { v: 200, color: 'var(--aqi-verybad)' },
    { v: 150, color: 'var(--aqi-unhealthy)' },
    { v: 100, color: 'var(--aqi-sensitive)' },
    { v: 50, color: 'var(--aqi-moderate)' },
    { v: 0, color: 'var(--aqi-good)' },
  ];

  let bandRects = '';
  for (let i = 0; i < bandStops.length - 1; i++) {
    const yTop = h - pad - ((bandStops[i].v - min) / (max - min)) * (h - pad * 2);
    const yBot = h - pad - ((bandStops[i + 1].v - min) / (max - min)) * (h - pad * 2);
    bandRects += `<rect x="0" y="${yTop}" width="${w}" height="${yBot - yTop}" fill="${bandStops[i].color}" opacity="0.14"/>`;
  }

  const dots = points.map((p, i) =>
    `<circle cx="${p[0]}" cy="${p[1]}" r="3.5" fill="${aqiColor(data[i].y)}" stroke="#fff" stroke-width="1.5"/>`
  ).join('');

  container.innerHTML = `
    <svg viewBox="0 0 ${w} ${h}" width="100%" height="${h}" preserveAspectRatio="none" style="border-radius:10px;overflow:hidden;">
      ${bandRects}
      <path d="${path}" fill="none" stroke="var(--ink)" stroke-width="2.2" stroke-linejoin="round" stroke-linecap="round"/>
      ${dots}
    </svg>
    <div class="chart-axis">${data.map(d => `<span>${d.x}</span>`).join('')}</div>
  `;
}
