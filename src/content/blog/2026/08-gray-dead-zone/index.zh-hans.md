---
title: "灰色死亡区：在色轮上挑选色相的三条规则"
description: "对 CSS-Tricks「Gray Dead Zone」的简短思考，外加一个交互式 Color Lab：五个 HSL 色轮，用来测试色相间隔、饱和度与明度。"
pubDate: 2026-08-31
category: "Design"
tags: ["Color", "Gradients", "ColorTheory", "CSS", "Design"]
featured: false
author: "Alex.Hsiao"
readTime: "4 min read"
---

# 灰色死亡区：在色轮上挑选色相的三条规则

**Erik D. Kennedy** 注意到颜色渐变的一个古怪现象：当两个颜色之间的直线穿过色轮的*零饱和中心*时，渐变的中点会悄悄死掉、变成**灰色**。Chris Coyier 在 [CSS-Tricks 上把这个现象记录为渐变的「Gray Dead Zone」](https://css-tricks.com/the-gray-dead-zone-of-gradients/)——一个真实、可复现的陷阱，只要你开始在互补色相之间插值（例如红与青），它就会出现。相比之下，红与蓝会绕行经过紫色，因此保持鲜艳。

## 现象：穿过中心的插值

在色轮上，两个颜色之间的渐变是一条直线——一条穿过色彩空间的**弦**。当这条弦靠近色轮中心，饱和度便趋近于零，渐变中点就落在灰色上。经典的元凶是互补色对：红 ↔ 青、黄 ↔ 蓝、绿 ↔ 洋红。它们的弦笔直穿过中心。

> **「灰色死亡区」**——*Chris Coyier, CSS-Tricks*：*「当两个颜色之间的渐变，其色彩空间中的连线穿过零饱和的中点，中段就会出现这个『灰色死亡区』。」*

技术根源在于 sRGB 有损的插值；较新的 CSS 色彩空间（如 `oklch`）在代码层面修好了*插值*，但要选哪些终点色相仍然由你决定——而色轮依然是那张地图。

## 色轮的三条规则

### 1. 绝不穿越灰色死亡区

在定案配色之前，先检查几何关系。如果两个色相隔著中心彼此相对——大约相距 180°——它们的中点必然是浑浊的。要么选择色轮同一侧的色相，要么刻意绕行：好的渐变工具会用插值模式与缓动停点解决这件事，让路径绕过中心，而不是穿过中心。

### 2. 角度越大，覆盖的色相越多——适中间隔最柔和

停点之间的角度距离，就是配色的范围。小间隔（15–30°）读起来像同一个安静的色相家族；大间隔（90–180°）开始覆盖半个色轮，并偏向互补领域——那正是规则 1 的陷阱。适中间隔（30–60°）既保留家族感，又让每个停点有独立个性。下方实验室里的 **VARIABLE** 色轮是感受这件事最快的方式：扫动角度，看着配色从「一个颜色、五种深浅」变成「五个不同的颜色」。

### 3. 饱和度是单向阀——用明度补偿

过度饱和的颜色看起来有攻击性——而且在多数界面里显得业余。自然的解法是降低饱和度，但去饱和会让色相朝色轮中心塌陷，而那里正是灰色死亡区。诀窍是把饱和度与明度当成同一个联动旋钮：降低饱和度的同时，等量提高明度。颜色便能保持干净轻盈，而不会沉入浑浊。

## Color Lab

下方的交互展示把这三条规则放到五个 HSL 色轮上。每张卡片以等距步进绕行色轮，生成五个停点的配色：**锚点**（较大的旋钮）是第一个颜色，之后每个停点沿色轮移动 *offset* 度。拖拽色轮可重新对准整组配色；每轮可调整 **Sat** 与 **Light**；点击任一十六进制色码即可复制。最后一张卡片——**GRAY DEAD ZONE**——把五个停点排在一条直径上，路径为 颜色 → 灰 → 互补色：正是产生浑浊中点的那条弦。

<div class="color-lab" id="colorLab">
  <div class="cl-head">
    <span class="card-tag">EXHIBIT // 02 · COLOR WHEEL LAB</span>
    <h4 class="cl-title">远离中心线：五个永远不会变灰的色轮</h4>
    <p class="cl-sub">拖拽任一轮盘旋转色相 · 点击色码复制 · 每轮独立的饱和度 / 明度滑块</p>
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

试试看：把 **VARIABLE** 卡片的角度从 30° 拖到 180°，观察配色如何不再像「一个颜色、五种深浅」，而是开始被拉向互补领域。接着看 **GRAY DEAD ZONE** 卡片——无论两个端点落在哪里，中间的停点永远是灰色，因为它的弦笔直穿过色轮中心。

## 反思

色轮是一道路径规划问题，不是彩虹挑选器。上面三条规则其实是同一种习惯：**先选车道，再转方向盘**。让弦偏离中心，插值就永远不会经过零饱和；让间隔保持适中，配色就会是一个家族，而不是烟花秀；想要更柔和的颜色时，把饱和度与明度当成同一个旋钮——同时降饱和、提明度，否则配色会掉进死亡区所警告的那种泥泞灰。CSS 终于在代码层面用 `oklch` 修好了*插值*这一侧，但终点色相仍然由你决定——而色轮依然是那张地图。

## 参考资料

- [渐变的「灰色死亡区」— CSS-Tricks](https://css-tricks.com/the-gray-dead-zone-of-gradients/) — Chris Coyier 记录 Erik D. Kennedy 对零饱和渐变中点的观察。
