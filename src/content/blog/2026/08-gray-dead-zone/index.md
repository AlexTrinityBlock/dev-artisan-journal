---
title: "The Gray Dead Zone: Three Rules for Picking Hues on the Wheel"
description: "A short reflection on the CSS-Tricks 'Gray Dead Zone' — plus an interactive Color Lab with five HSL wheels for testing hue intervals, saturation, and lightness."
pubDate: 2026-08-31
category: "Design"
tags: ["Color", "Gradients", "ColorTheory", "CSS", "Design"]
featured: false
author: "Alex.Hsiao"
readTime: "4 min read"
---

# The Gray Dead Zone: Three Rules for Picking Hues on the Wheel

**Erik D. Kennedy** noticed a strange thing about color gradients: when the straight line between two colors passes through the *zero-saturation middle* of the color wheel, the gradient's midpoint quietly dies into **gray**. Chris Coyier documented the phenomenon on [CSS-Tricks as the "Gray Dead Zone" of gradients](https://css-tricks.com/the-gray-dead-zone-of-gradients/) — a real, reproducible trap that appears the moment you interpolate between complementary hues, like red and cyan. Red and blue, by contrast, detour through purple and stay vivid.

## The Phenomenon: Interpolating Through the Center

On the wheel, the gradient between two colors is a straight line — a **chord** — through color space. When that chord passes near the center of the wheel, saturation drops toward zero and the midpoint of the gradient lands on gray. The classic culprits are the complementary pairs: red ↔ cyan, yellow ↔ blue, green ↔ magenta. Their chords run straight through the center.

> **The "Gray Dead Zone"** — *Chris Coyier, CSS-Tricks*: *"If you have a gradient between two colors where the line between them in the color space goes through the zero-saturation middle, you get this 'gray dead zone' in the middle."*

The technical root is sRGB's lossy interpolation; newer CSS color spaces such as `oklch` fix the *interpolation* in code, but choosing the destination hues is still your decision — and the wheel is still the map.

## Three Rules for the Wheel

### 1. Never Cross the Gray Dead Zone

Before committing to a palette, check the geometry. If two hues sit across the center from each other — roughly 180° apart — their midpoint will be mud. Either pick hues on the same side of the wheel, or take a deliberate detour: a good gradient tool solves this with interpolation modes and easing stops that arc around the center instead of through it.

### 2. Bigger Angles Cover More Hue — Moderate Intervals Stay Soft

The angular distance between stops is the palette's range. Small intervals (15–30°) read as one quiet family of hues; large intervals (90–180°) start covering half the wheel and drift toward complement territory — which is rule 1's trap. Moderate intervals (30–60°) keep the family feel while giving each stop a distinct identity. The **VARIABLE** wheel in the lab below is the fastest way to feel this: sweep the angle and watch the palette go from "one color, five shades" to "five different colors".

### 3. Saturation Is a One-Way Valve — Compensate with Lightness

Overly saturated colors look aggressive — and, in most interfaces, amateurish. The natural fix is to lower saturation, but desaturation collapses hues toward the wheel's center, which is precisely the gray dead zone. The trick is to treat saturation and lightness as one coupled dial: as you lower saturation, raise lightness in equal measure. The color stays clean and airy instead of sinking into mud.

## Color Lab

The interactive exhibit below puts those three rules on five HSL wheels. Each card generates a five-stop palette by walking the wheel in equal steps: the **anchor** (the larger knob) is the first color, and every following stop moves *offset* degrees around the wheel. Drag a wheel to re-aim the whole palette; adjust **Sat** and **Light** per wheel; click any hex to copy it. The last card — **GRAY DEAD ZONE** — places its five stops along a diameter that runs color → gray → complement: the exact chord that produces the muddy midpoint.

<div class="color-lab" id="colorLab">
  <div class="cl-head">
    <span class="card-tag">EXHIBIT // 02 · COLOR WHEEL LAB</span>
    <h4 class="cl-title">Stay off the centerline: five wheels that never go gray</h4>
    <p class="cl-sub">Drag any wheel to rotate its hue · click a hex to copy · per-wheel sat / light sliders</p>
  </div>
  <div id="cl-cards" class="cl-grid"></div>
  <div class="cl-foot">HSL SPECTRUM DISC · 5 ANCHOR POINTS PER WHEEL · GRAY CARD = RGB INTERPOLATION THROUGH CENTER · REF: CSS-TRICKS</div>
</div>

<script is:inline>
  // ── COLOR WHEEL LAB ──────────────────────────────────────────
  // Five HSL wheels: a variable-interval wheel, fixed 30/60/90°
  // offsets, and a gray-dead-zone card that interpolates straight
  // through the wheel's center (zero saturation).
  const SPECS = [
    { key: 'interactive', label: 'VARIABLE', variable: true },
    { key: '30', label: '30° INTERVAL' },
    { key: '60', label: '60° INTERVAL' },
    { key: '90', label: '90° INTERVAL' },
    { key: 'gray', label: 'GRAY DEAD ZONE' }
  ];
  const state = {
    interactive: { hue: 307, offset: 90, sat: 70, light: 60 },
    '30': { hue: 307, offset: 30, sat: 70, light: 60 },
    '60': { hue: 307, offset: 60, sat: 70, light: 60 },
    '90': { hue: 307, offset: 90, sat: 70, light: 60 },
    'gray': { hue: 0, offset: 45, sat: 70, light: 50 }
  };
  const cardColors = {};

  const byId = id => document.getElementById(id);
  const setText = (id, t) => { const el = byId(id); if (el) el.textContent = t; };
  const setSwatch = (id, c) => { const el = byId(id); if (el) el.style.backgroundColor = c; };
  const setHero = (id, cs) => { const el = byId(id); if (el) el.style.background = `linear-gradient(135deg, ${cs.join(', ')})`; };

  // HSL -> HEX (sRGB)
  function hslToHex(h, s, l) {
    h = (h % 360 + 360) % 360;
    s = Math.max(0, Math.min(100, s)) / 100;
    l = Math.max(0, Math.min(100, l)) / 100;
    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs((h / 60) % 2 - 1));
    const m = l - c / 2;
    let r = 0, g = 0, b = 0;
    if (0 <= h && h < 60) { r = c; g = x; b = 0; }
    else if (60 <= h && h < 120) { r = x; g = c; b = 0; }
    else if (120 <= h && h < 180) { r = 0; g = c; b = x; }
    else if (180 <= h && h < 240) { r = 0; g = x; b = c; }
    else if (240 <= h && h < 300) { r = x; g = 0; b = c; }
    else if (300 <= h && h < 360) { r = c; g = 0; b = x; }
    const toHex = n => { const hx = Math.round((n + m) * 255).toString(16); return hx.length === 1 ? '0' + hx : hx; };
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  }

  // Five anchor colors walking the wheel by `offset` per step
  const colorsFor = (hue, offset, sat, light) => [0, 1, 2, 3, 4].map(i =>
    hslToHex((hue - i * offset + 360) % 360, sat, light)
  );

  // Gray dead zone: RGB interpolation between complementary hues (180° apart)
  const hexToRgb = hex => { const n = parseInt(hex.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; };
  const mixRgb = (a, b, t) => [0, 1, 2].map(i => Math.round(a[i] + (b[i] - a[i]) * t));
  const rgbToHex = rgb => '#' + rgb.map(v => v.toString(16).padStart(2, '0')).join('');
  const colorsForGray = (hue, sat, light) => {
    const a = hexToRgb(hslToHex(hue, sat, light));
    const b = hexToRgb(hslToHex((hue + 180) % 360, sat, light));
    return [0, 0.25, 0.5, 0.75, 1].map(t => rgbToHex(mixRgb(a, b, t)));
  };

  // Draw the full 360° spectrum disc
  function drawDisc(ctx, cx, cy, radius) {
    for (let a = 0; a < 360; a++) {
      const sa = (a - 1.5) * Math.PI / 180, ea = (a + 1.5) * Math.PI / 180;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, radius, sa, ea);
      ctx.closePath();
      ctx.fillStyle = `hsl(${a}, 100%, 50%)`;
      ctx.fill();
    }
  }

  // Wheel renderer — five anchor knobs, dashed connecting polygon
  function drawColorWheel(canvas, hue, offset, sat, light) {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width, h = canvas.height, cx = w / 2, cy = h / 2, radius = w / 2 - 10;

    ctx.clearRect(0, 0, w, h);
    drawDisc(ctx, cx, cy, radius);

    const pts = [0, 1, 2, 3, 4].map(i => {
      const hh = (hue - i * offset + 360) % 360;
      const rad = hh * Math.PI / 180;
      return { x: cx + radius * 0.82 * Math.cos(rad), y: cy + radius * 0.82 * Math.sin(rad), color: hslToHex(hh, sat, light), leader: i === 0 };
    });

    // Guide radii to the anchors (hairline furniture)
    pts.forEach(p => {
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(p.x, p.y);
      ctx.setLineDash([2, 3]);
      ctx.strokeStyle = '#B0AFA9';
      ctx.lineWidth = 0.7;
      ctx.stroke();
      ctx.setLineDash([]);
    });

    // Dashed connecting polygon (the palette's route around the wheel)
    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i < 5; i++) ctx.lineTo(pts[i].x, pts[i].y);
    ctx.closePath();
    ctx.setLineDash([4, 3]);
    ctx.strokeStyle = '#1C1C1A';
    ctx.lineWidth = 1.2;
    ctx.stroke();
    ctx.setLineDash([]);

    // Knobs — solid fills, white ring, no glow
    pts.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.leader ? 7 : 5.5, 0, 2 * Math.PI);
      ctx.fillStyle = p.color;
      ctx.fill();
      ctx.lineWidth = p.leader ? 2 : 1.5;
      ctx.strokeStyle = '#ffffff';
      ctx.stroke();
    });
  }

  // Gray dead zone wheel: five anchors on a diameter through the center
  function drawGrayWheel(canvas, hue, colors) {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width, h = canvas.height, cx = w / 2, cy = h / 2, radius = w / 2 - 10;

    ctx.clearRect(0, 0, w, h);
    drawDisc(ctx, cx, cy, radius);

    const a = hue * Math.PI / 180;
    const b = (hue + 180) * Math.PI / 180;
    const pts = [
      { x: cx + radius * 0.82 * Math.cos(a), y: cy + radius * 0.82 * Math.sin(a), color: colors[0] },
      { x: cx + radius * 0.45 * Math.cos(a), y: cy + radius * 0.45 * Math.sin(a), color: colors[1] },
      { x: cx, y: cy, color: colors[2] },
      { x: cx + radius * 0.45 * Math.cos(b), y: cy + radius * 0.45 * Math.sin(b), color: colors[3] },
      { x: cx + radius * 0.82 * Math.cos(b), y: cy + radius * 0.82 * Math.sin(b), color: colors[4] }
    ];

    // The diameter that crosses the dead zone
    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i < 5; i++) ctx.lineTo(pts[i].x, pts[i].y);
    ctx.setLineDash([4, 3]);
    ctx.strokeStyle = '#1C1C1A';
    ctx.lineWidth = 1.2;
    ctx.stroke();
    ctx.setLineDash([]);

    // Knobs — the gray center knob is the dead zone itself
    pts.forEach((p, i) => {
      const isGray = i === 2;
      ctx.beginPath();
      ctx.arc(p.x, p.y, isGray ? 9 : (i === 0 ? 7 : 5.5), 0, 2 * Math.PI);
      ctx.fillStyle = p.color;
      ctx.fill();
      ctx.lineWidth = isGray ? 2.5 : (i === 0 ? 2 : 1.5);
      ctx.strokeStyle = '#ffffff';
      ctx.stroke();
    });
  }

  // ── Render cards ─────────────────────────────────────────────
  function renderCards() {
    byId('cl-cards').innerHTML = SPECS.map(({ key, label, variable }) => {
      let html = '';
      html += `<div class="cl-card">`;
      html += `<div class="cl-card-tag"><span class="card-tag">WHEEL // ${label}</span></div>`;
      html += `<div class="cl-row">`;
      html += `<div class="cl-wheel-wrap">`;
      html += `<canvas id="wheel-${key}" width="140" height="140" class="cl-wheel"></canvas>`;
      if (key !== 'gray') {
        html += `<div class="cl-hue-badge"><div class="cl-hue-badge-inner"><span class="cl-hue-label">Hue</span><span id="hue-${key}" class="cl-hue-val">307°</span></div></div>`;
      }
      html += `</div>`;
      html += `<div class="cl-main">`;
      html += `<div id="hero-${key}" class="cl-hero"></div>`;
      html += `<div class="cl-swatches">`;
      for (let i = 0; i < 5; i++) {
        html += `<div class="cl-swatch"><span id="sw-${key}-${i}" class="cl-dot"></span><span id="hex-${key}-${i}" data-card="${key}" data-idx="${i}" class="cl-hex">#000000</span></div>`;
      }
      html += `</div>`;
      html += `</div>`;
      html += `</div>`;
      if (variable) {
        html += `<div class="cl-controls">`;
        html += `<div class="cl-ctrl-row"><span class="cl-label">Angle</span><span id="offsetVal" class="cl-val">90°</span></div>`;
        html += `<input type="range" id="offsetSlider" min="15" max="180" step="5" value="90" oninput="clUpdateOffset(this.value)" class="cl-range">`;
        html += `<div class="cl-presets">${[30, 60, 90, 120, 180].map(a => `<button type="button" onclick="clUpdateOffset(${a})" class="cl-preset">${a}°</button>`).join('')}</div>`;
        html += `</div>`;
      }
      html += `<div class="cl-controls">`;
      html += `<div class="cl-ctrl-row"><span class="cl-label">Sat</span><span id="satVal-${key}" class="cl-val">${state[key].sat}%</span></div>`;
      html += `<input type="range" id="satSlider-${key}" min="0" max="100" step="5" value="${state[key].sat}" oninput="clUpdateSat('${key}', this.value)" class="cl-range">`;
      html += `</div>`;
      html += `<div class="cl-controls">`;
      html += `<div class="cl-ctrl-row"><span class="cl-label">Light</span><span id="lightVal-${key}" class="cl-val">${state[key].light}%</span></div>`;
      html += `<input type="range" id="lightSlider-${key}" min="10" max="90" step="5" value="${state[key].light}" oninput="clUpdateLight('${key}', this.value)" class="cl-range">`;
      html += `</div>`;
      html += `</div>`;
      return html;
    }).join('');
  }

  // ── Updates ──────────────────────────────────────────────────
  function updateCard(key) {
    const { hue, offset, sat, light } = state[key];
    const colors = key === 'gray' ? colorsForGray(hue, sat, light) : colorsFor(hue, offset, sat, light);
    if (key === 'gray') {
      drawGrayWheel(byId(`wheel-${key}`), hue, colors);
      const el = byId(`hero-${key}`);
      if (el) el.style.background = `linear-gradient(90deg, ${colors.join(', ')})`;
    } else {
      drawColorWheel(byId(`wheel-${key}`), hue, offset, sat, light);
      setText(`hue-${key}`, `${Math.round(hue)}°`);
      setHero(`hero-${key}`, colors);
    }
    for (let i = 0; i < 5; i++) {
      setSwatch(`sw-${key}-${i}`, colors[i]);
      setText(`hex-${key}-${i}`, colors[i]);
    }
    cardColors[key] = colors;
  }

  const updateAll = () => SPECS.forEach(s => updateCard(s.key));

  function clUpdateOffset(val) {
    state.interactive.offset = parseInt(val, 10);
    const slider = byId('offsetSlider');
    if (slider) slider.value = val;
    setText('offsetVal', `${val}°`);
    updateCard('interactive');
    document.querySelectorAll('#colorLab .cl-preset').forEach(b => {
      b.classList.toggle('active', parseInt(b.textContent, 10) === parseInt(val, 10));
    });
  }

  function clUpdateSat(key, val) {
    state[key].sat = parseInt(val, 10);
    const slider = byId(`satSlider-${key}`);
    if (slider) slider.value = val;
    setText(`satVal-${key}`, `${val}%`);
    updateCard(key);
  }

  function clUpdateLight(key, val) {
    state[key].light = parseInt(val, 10);
    const slider = byId(`lightSlider-${key}`);
    if (slider) slider.value = val;
    setText(`lightVal-${key}`, `${val}%`);
    updateCard(key);
  }

  // ── Interactions: click-to-copy + per-wheel drag ─────────────
  function setupInteractions() {
    document.querySelectorAll('#colorLab [data-card]').forEach(el => {
      el.addEventListener('click', () => {
        const hex = cardColors[el.dataset.card] && cardColors[el.dataset.card][+el.dataset.idx];
        if (!hex) return;
        const ta = document.createElement('textarea');
        ta.value = hex;
        ta.style.position = 'fixed';
        ta.style.left = '-9999px';
        document.body.appendChild(ta);
        ta.select();
        try { document.execCommand('copy'); } catch (e) {}
        document.body.removeChild(ta);
        if (typeof showToast === 'function') showToast(`Copied ${hex}`);
      });
    });

    SPECS.forEach(({ key }) => {
      const canvas = byId(`wheel-${key}`);
      if (!canvas) return;
      let dragging = false;
      const move = (e) => {
        if (!dragging) return;
        const r = canvas.getBoundingClientRect();
        const x = (e.touches ? e.touches[0].clientX : e.clientX) - r.left - r.width / 2;
        const y = (e.touches ? e.touches[0].clientY : e.clientY) - r.top - r.height / 2;
        let deg = Math.atan2(y, x) * 180 / Math.PI;
        if (deg < 0) deg += 360;
        state[key].hue = deg;
        updateCard(key);
      };
      canvas.addEventListener('mousedown', e => { dragging = true; move(e); });
      window.addEventListener('mousemove', move);
      window.addEventListener('mouseup', () => { dragging = false; });
      canvas.addEventListener('touchstart', e => { dragging = true; move(e); }, { passive: true });
      window.addEventListener('touchmove', move, { passive: true });
      window.addEventListener('touchend', () => { dragging = false; });
    });
  }

  // ── Boot ─────────────────────────────────────────────────────
  renderCards();
  updateAll();
  setupInteractions();
</script>

Try it: drag the **VARIABLE** card's angle from 30° to 180° and watch the palette stop feeling like "one color, five shades" and start pulling toward complement territory. Then watch the **GRAY DEAD ZONE** card — no matter where the two endpoints sit, the middle stop is always gray, because its chord runs straight through the wheel's center.

## Reflection

The wheel is a routing problem, not a rainbow picker. The three rules above are really one habit: **choose a lane, then steer**. Keep the chord off-center so interpolation never passes through zero saturation; keep the interval moderate so the palette stays a family instead of a fireworks show; and when you want gentler colors, treat saturation and lightness as a single dial — desaturate and lift lightness together, or the palette falls into the same muddy gray the dead zone warns about. CSS is finally fixing the *interpolation* side of this in code with `oklch`, but the destination hues are still your decision — and the wheel is still the map.

## References

- [The "Gray Dead Zone" of Gradients — CSS-Tricks](https://css-tricks.com/the-gray-dead-zone-of-gradients/) — Chris Coyier on Erik D. Kennedy's observation of zero-saturation gradient midpoints.
