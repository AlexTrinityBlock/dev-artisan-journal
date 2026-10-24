---
title: "灰色死亡區：在色輪上挑選色相的三條規則"
description: "對 CSS-Tricks「Gray Dead Zone」的簡短反思，外加一個互動 Color Lab：五個 HSL 色輪，用來測試色相間隔、飽和度與明度。"
pubDate: 2026-08-31
category: "Design"
tags: ["Color", "Gradients", "ColorTheory", "CSS", "Design"]
featured: false
author: "Alex.Hsiao"
readTime: "4 min read"
---

# 灰色死亡區：在色輪上挑選色相的三條規則

**Erik D. Kennedy** 注意到色彩漸層的一個怪現象：當兩個顏色之間的直線穿過色輪的*零飽和中心*時，漸層的中點會悄悄死去、變成**灰色**。Chris Coyier 在 [CSS-Tricks 上把這個現象記錄為漸層的「Gray Dead Zone」](https://css-tricks.com/the-gray-dead-zone-of-gradients/)——一個真實、可重現的陷阱，只要你開始在互補色相之間插值（例如紅與青），它就會出現。相對地，紅與藍會繞道經過紫色，因此保持鮮豔。

## 現象：穿過中心的插值

在色輪上，兩個顏色之間的漸層是一條直線——一條穿過色彩空間的**弦**。當這條弦靠近色輪中心，飽和度便趨近於零，漸層中點就落在灰色上。經典的元兇是互補色對：紅 ↔ 青、黃 ↔ 藍、綠 ↔ 洋紅。它們的弦筆直穿過中心。

> **「灰色死亡區」**——*Chris Coyier, CSS-Tricks*：*「當兩個顏色之間的漸層，其色彩空間中的連線穿過零飽和的中點，中段就會出現這個『灰色死亡區』。」*

技術根源在於 sRGB 有損的插值；較新的 CSS 色彩空間（如 `oklch`）在程式碼層面修好了*插值*，但要選哪些終點色相仍然由你決定——而色輪依然是那張地圖。

## 色輪的三條規則

### 1. 絕不穿越灰色死亡區

在定案配色之前，先檢查幾何關係。如果兩個色相隔著中心彼此相對——大約相距 180°——它們的中點必然是泥濁的。要嘛選擇色輪同一側的色相，要嘛刻意繞道：好的漸層工具會用插值模式與緩動停點解決這件事，讓路徑繞過中心，而不是穿過中心。

### 2. 角度越大，涵蓋的色相越多——適中間隔最柔和

停點之間的角度距離，就是配色的範圍。小間隔（15–30°）讀起來像同一個安靜的色相家族；大間隔（90–180°）開始覆蓋半個色輪，並漂向互補領域——那正是規則 1 的陷阱。適中間隔（30–60°）既保留家族感，又讓每個停點有獨立個性。下方實驗室裡的 **VARIABLE** 色輪是感受這件事最快的方式：掃動角度，看著配色從「一個顏色、五種深淺」變成「五個不同的顏色」。

### 3. 飽和度是單向閥——用明度補償

過度飽和的顏色看起來具侵略性——而且在多數介面裡顯得業餘。自然的解法是降低飽和度，但去飽和會讓色相朝色輪中心塌陷，而那裡正是灰色死亡區。訣竅是把飽和度與明度當成同一個連動旋鈕：降低飽和度的同時，等量提高明度。顏色便能保持乾淨輕盈，而不會沉入泥濁。

## Color Lab

下方的互動展示把這三條規則放上五個 HSL 色輪。每張卡片以等距步進繞行色輪，產生五個停點的配色：**錨點**（較大的旋鈕）是第一個顏色，之後每個停點沿著色輪移動 *offset* 度。拖曳色輪可重新瞄準整組配色；每輪可調整 **Sat** 與 **Light**；點擊任一十六進位色碼即可複製。最後一張卡片——**GRAY DEAD ZONE**——把五個停點排在一條直徑上，路徑為 顏色 → 灰 → 互補色：正是產生泥濁中點的那條弦。

<div class="color-lab" id="colorLab">
  <div class="cl-head">
    <span class="card-tag">EXHIBIT // 02 · COLOR WHEEL LAB</span>
    <h4 class="cl-title">遠離中心線：五個永遠不會變灰的色輪</h4>
    <p class="cl-sub">拖曳任一色輪旋轉色相 · 點擊色碼複製 · 每輪獨立的飽和度 / 明度滑桿</p>
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

試試看：把 **VARIABLE** 卡片的角度從 30° 拖到 180°，觀察配色如何不再像「一個顏色、五種深淺」，而是開始被拉向互補領域。接著看 **GRAY DEAD ZONE** 卡片——無論兩個端點落在哪裡，中間的停點永遠是灰色，因為它的弦筆直穿過色輪中心。

## 反思

色輪是一道路徑規劃問題，不是彩虹挑選器。上面三條規則其實是同一種習慣：**先選車道，再轉方向盤**。讓弦偏離中心，插值就永遠不會經過零飽和；讓間隔保持適中，配色就會是一個家族，而不是煙火秀；想要更柔和的顏色時，把飽和度與明度當成同一個旋鈕——同時降飽和、提明度，否則配色會掉進死亡區所警告的那種泥濘灰。CSS 終於在程式碼層面用 `oklch` 修好了*插值*這一側，但終點色相仍然由你決定——而色輪依然是那張地圖。

## 參考資料

- [漸層的「灰色死亡區」— CSS-Tricks](https://css-tricks.com/the-gray-dead-zone-of-gradients/) — Chris Coyier 記錄 Erik D. Kennedy 對零飽和漸層中點的觀察。
