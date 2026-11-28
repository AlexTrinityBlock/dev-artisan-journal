/*
 * Live demo for "How a Single Still Illustration Comes Alive".
 *
 * A dependency-free port of the Apsor Archive chat companion's motion stack:
 * pose frames (pingpong + crossfade), two breathing sine waves, and a damped
 * spring that turns horizontal drag velocity into a pendulum sway. One
 * requestAnimationFrame loop writes CSS custom properties; nothing re-renders.
 *
 * Markup lives in each article edition (so labels are localized); this file
 * only reads data attributes and never injects user-facing copy of its own.
 */
(() => {
  'use strict';

  // ── spring.ts, ported verbatim ───────────────────────────────────────────
  const SWAY_SPRING = { stiffness: 90, damping: 9 };
  const DOCK_SPRING = { stiffness: 170, damping: 22 };
  const MAX_STEP_SECONDS = 1 / 30;

  function stepSpring(state, target, seconds, config) {
    let remaining = Math.max(0, seconds);
    let { value, velocity } = state;
    while (remaining > 0) {
      const dt = Math.min(MAX_STEP_SECONDS, remaining);
      const force = -config.stiffness * (value - target) - config.damping * velocity;
      velocity += force * dt;
      value += velocity * dt;
      remaining -= dt;
    }
    return { value, velocity };
  }

  function swayForVelocity(velocityX, maxDegrees = 16) {
    const angle = -velocityX * 14;
    return Math.max(-maxDegrees, Math.min(maxDegrees, angle));
  }

  function breathing(timeMs) {
    const t = timeMs / 1000;
    return {
      bob: Math.sin(t * ((2 * Math.PI) / 4.2)) * 2.2,
      sway: Math.sin(t * ((2 * Math.PI) / 6.8) + 0.9) * 1.1,
    };
  }

  // ── manifest subset ──────────────────────────────────────────────────────
  const POSES = {
    idle: { frames: ['vellum-idle', 'vellum-idle-2', 'vellum-idle-3'], fps: 4, tilt: 0 },
    thinking: { frames: ['vellum-thinking', 'vellum-thinking-2', 'vellum-thinking-3'], fps: 4, tilt: 2.5 },
    greet: { frames: ['vellum-greet'], fps: 0, tilt: 0 },
  };
  const ORDER = ['idle', 'thinking', 'greet'];
  const CROSSFADE_MS = 260;
  const VELOCITY_WINDOW_MS = 90;
  const TRACE_SECONDS = 4;

  /** 0,1,2,1,0,1,2,… — the pingpong index for a playback step. */
  function frameAtStep(count, step) {
    if (count < 2 || step <= 0) return 0;
    const period = count * 2 - 2;
    const phase = step % period;
    return phase < count ? phase : period - phase;
  }

  const decoded = new Map();
  function decodeFrame(url) {
    if (decoded.has(url)) return decoded.get(url);
    const image = new Image();
    image.decoding = 'async';
    image.src = url;
    const promise = image
      .decode()
      .catch(() => {
        if (!(image.complete && image.naturalWidth > 0)) throw new Error('frame failed');
      })
      .then(() => image);
    promise.catch(() => decoded.delete(url));
    decoded.set(url, promise);
    return promise;
  }

  function mount(root) {
    const base = root.dataset.base || '/images/limited-animation-spring/';
    const names = (root.dataset.poseNames || 'Idle|Thinking|Greet').split('|');
    const url = (frame) => `${base}${frame}.avif`;

    const stage = root.querySelector('[data-lv-stage]');
    const figure = root.querySelector('[data-lv-figure]');
    const body = root.querySelector('[data-lv-body]');
    const fx = root.querySelector('[data-lv-fx]');
    const poseBtn = root.querySelector('[data-lv-pose]');
    const poseLabel = root.querySelector('[data-lv-pose-label]');
    const motionNote = root.querySelector('[data-lv-reduced]');
    const motionBtn = root.querySelector('[data-lv-play-anyway]');
    const canvas = root.querySelector('[data-lv-trace]');
    const out = {};
    root.querySelectorAll('[data-lv-out]').forEach((el) => {
      out[el.dataset.lvOut] = el;
    });
    const layers = { frames: true, breath: true, spring: true };
    root.querySelectorAll('[data-lv-layer]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const key = btn.dataset.lvLayer;
        layers[key] = !layers[key];
        btn.setAttribute('aria-pressed', String(layers[key]));
        if (key === 'frames') restartFrames();
      });
    });

    // ── state ──────────────────────────────────────────────────────────────
    let pose = 'idle';
    let poseIndex = 0;
    let poseStartedAt = performance.now();
    let current = null; // the visible <img>
    let sway = { value: 0, velocity: 0 };
    let dock = { value: 0, velocity: 0 }; // horizontal offset in px
    let target = 0;
    let bob = 0;
    let vx = 0;
    let lastFrame = -1;
    let dragging = null; // { id, startX, startOffset, samples }
    let kick = null; // keyboard flick: { vx, until }
    const trace = []; // { t, sway, target }

    const reducedQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    let playAnyway = false;
    let onScreen = true;
    let raf = 0;
    let last = 0;

    const animated = () => !reducedQuery.matches || playAnyway;
    const running = () => animated() && onScreen && document.visibilityState === 'visible';

    // ── pose layers ────────────────────────────────────────────────────────
    function showPose(next, { instant = false } = {}) {
      const clip = POSES[next];
      // Decode every frame of the next clip first, then swap: never a blank box.
      return Promise.all(clip.frames.map((f) => decodeFrame(url(f)).catch(() => null))).then(() => {
        if (next !== pose && current !== null) return; // a newer request won
        const img = document.createElement('img');
        img.className = 'lv-pose';
        img.alt = '';
        img.draggable = false;
        img.decoding = 'async';
        img.width = 384;
        img.height = 576;
        img.src = url(clip.frames[0]);
        const leaving = current;
        current = img;
        lastFrame = 0;
        if (leaving && !instant && animated()) {
          img.classList.add('is-entering');
          leaving.classList.remove('is-entering');
          leaving.classList.add('is-leaving');
          window.setTimeout(() => leaving.remove(), CROSSFADE_MS);
        } else if (leaving) {
          leaving.remove();
        }
        body.appendChild(img);
        if (out.frame) out.frame.textContent = clip.frames.length > 1 ? '1 / 3' : '1 / 1';
        stage.dataset.pose = next;
        renderEffects(next);
        if (!running()) applyStatic();
      });
    }

    function restartFrames() {
      poseStartedAt = performance.now();
      lastFrame = -1;
    }

    function renderEffects(next) {
      fx.replaceChildren();
      if (!animated()) return;
      if (next === 'thinking') {
        const bubble = document.createElement('span');
        bubble.className = 'lv-fx-thought';
        for (let i = 0; i < 3; i += 1) {
          const dot = document.createElement('span');
          dot.className = 'lv-fx-dot';
          dot.style.setProperty('--i', String(i));
          bubble.appendChild(dot);
        }
        fx.appendChild(bubble);
      } else if (next === 'greet') {
        for (let i = 0; i < 8; i += 1) {
          const spark = document.createElement('span');
          spark.className = 'lv-fx-spark';
          spark.style.setProperty('--i', String(i));
          fx.appendChild(spark);
        }
        // Restart the one-shot bow on every greet.
        body.classList.remove('is-bowing');
        void body.offsetWidth;
        body.classList.add('is-bowing');
      } else {
        for (let i = 0; i < 5; i += 1) {
          const mote = document.createElement('span');
          mote.className = 'lv-fx-mote';
          mote.style.setProperty('--i', String(i));
          fx.appendChild(mote);
        }
      }
    }

    poseBtn.addEventListener('click', () => {
      poseIndex = (poseIndex + 1) % ORDER.length;
      pose = ORDER[poseIndex];
      poseLabel.textContent = names[poseIndex] || pose;
      restartFrames();
      showPose(pose);
    });

    // ── drag: velocity → sway target, offset → dock spring ────────────────
    function velocityNow(now) {
      if (dragging === null) return 0;
      const samples = dragging.samples;
      const lastSample = samples[samples.length - 1];
      if (!lastSample || now - lastSample.t > VELOCITY_WINDOW_MS) return 0;
      const first = samples.find((s) => lastSample.t - s.t <= VELOCITY_WINDOW_MS) || lastSample;
      const dt = lastSample.t - first.t;
      return dt > 0 ? (lastSample.x - first.x) / dt : 0;
    }

    const maxOffset = () => Math.max(40, stage.clientWidth / 2 - 70);

    stage.addEventListener('pointerdown', (event) => {
      if (event.button !== 0 && event.pointerType === 'mouse') return;
      stage.setPointerCapture(event.pointerId);
      dragging = {
        id: event.pointerId,
        startX: event.clientX,
        startOffset: dock.value,
        samples: [{ x: event.clientX, t: event.timeStamp }],
      };
      stage.classList.add('is-dragging');
      if (!running()) applyStatic();
    });
    stage.addEventListener('pointermove', (event) => {
      if (dragging === null || event.pointerId !== dragging.id) return;
      dragging.samples.push({ x: event.clientX, t: event.timeStamp });
      if (dragging.samples.length > 12) dragging.samples.shift();
      const limit = maxOffset();
      const offset = dragging.startOffset + (event.clientX - dragging.startX);
      dock = { value: Math.max(-limit, Math.min(limit, offset)), velocity: 0 };
      if (!running()) applyStatic();
    });
    const release = (event) => {
      if (dragging === null || event.pointerId !== dragging.id) return;
      dragging = null;
      stage.classList.remove('is-dragging');
      if (!running()) {
        dock = { value: 0, velocity: 0 };
        applyStatic();
      }
    };
    stage.addEventListener('pointerup', release);
    stage.addEventListener('pointercancel', release);
    stage.addEventListener('keydown', (event) => {
      if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
      event.preventDefault();
      const dir = event.key === 'ArrowLeft' ? -1 : 1;
      // A short synthetic flick: the same input a fast drag would produce.
      kick = { vx: dir * 1.1, until: performance.now() + 140 };
      dock = { value: dock.value + dir * 28, velocity: 0 };
    });

    // ── the loop ───────────────────────────────────────────────────────────
    function tick(now) {
      const seconds = Math.min(0.1, (now - last) / 1000);
      last = now;
      const clip = POSES[pose];

      // Layer 1: pingpong frames, stepped from the same clock.
      if (current !== null && clip.fps > 0) {
        const step = layers.frames ? Math.floor(((now - poseStartedAt) / 1000) * clip.fps) : 0;
        const index = frameAtStep(clip.frames.length, step);
        if (index !== lastFrame) {
          lastFrame = index;
          current.src = url(clip.frames[index]);
          if (out.frame) out.frame.textContent = `${index + 1} / ${clip.frames.length}`;
        }
      }

      // Layer 2: breathing. Layer 3: the spring.
      const breath = layers.breath ? breathing(now) : { bob: 0, sway: 0 };
      if (kick !== null && now > kick.until) kick = null;
      vx = kick !== null ? kick.vx : velocityNow(now);
      target = clip.tilt + swayForVelocity(vx) + breath.sway;
      sway = layers.spring ? stepSpring(sway, target, seconds, SWAY_SPRING) : { value: target, velocity: 0 };
      bob = breath.bob;
      if (dragging === null) dock = stepSpring(dock, 0, seconds, DOCK_SPRING);

      write();
      record(now);
      raf = requestAnimationFrame(tick);
    }

    let lastReadout = 0;
    function write() {
      stage.style.setProperty('--lv-x', `${dock.value.toFixed(2)}px`);
      stage.style.setProperty('--lv-sway', `${sway.value.toFixed(2)}deg`);
      stage.style.setProperty('--lv-bob', `${bob.toFixed(2)}px`);
      stage.style.setProperty('--lv-shadow', (1 + bob / 40).toFixed(3));
      const now = performance.now();
      if (now - lastReadout < 90) return; // text at ~11 Hz is plenty to read
      lastReadout = now;
      const sign = (n, d) => (n >= 0 ? '+' : '−') + Math.abs(n).toFixed(d);
      if (out.sway) out.sway.textContent = `${sign(sway.value, 2)}°`;
      if (out.target) out.target.textContent = `${sign(target, 2)}°`;
      if (out.bob) out.bob.textContent = `${sign(bob, 2)} px`;
      if (out.vx) out.vx.textContent = `${sign(vx, 2)}`;
    }

    // ── trace canvas ───────────────────────────────────────────────────────
    const ctx = canvas ? canvas.getContext('2d') : null;
    const css = getComputedStyle(root);
    const ink = css.getPropertyValue('--mono-ink').trim() || '#1C1C1A';
    const faint = css.getPropertyValue('--mono-l5').trim() || '#B0AFA9';
    const accent = '#b08a36';

    function record(now) {
      trace.push({ t: now, sway: sway.value, target });
      while (trace.length && now - trace[0].t > TRACE_SECONDS * 1000) trace.shift();
      draw(now);
    }

    function draw(now) {
      if (!ctx) return;
      const dpr = window.devicePixelRatio || 1;
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      if (canvas.width !== Math.round(w * dpr) || canvas.height !== Math.round(h * dpr)) {
        canvas.width = Math.round(w * dpr);
        canvas.height = Math.round(h * dpr);
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      const mid = h / 2;
      const scale = (h / 2 - 4) / 18; // ±18° fills the strip
      ctx.strokeStyle = faint;
      ctx.lineWidth = 0.7;
      ctx.beginPath();
      ctx.moveTo(0, mid);
      ctx.lineTo(w, mid);
      ctx.stroke();
      const xOf = (t) => w - ((now - t) / (TRACE_SECONDS * 1000)) * w;
      const line = (key, color, width, dash) => {
        ctx.strokeStyle = color;
        ctx.lineWidth = width;
        ctx.setLineDash(dash);
        ctx.beginPath();
        trace.forEach((p, i) => {
          const x = xOf(p.t);
          const y = mid + p[key] * scale; // positive tilt = clockwise; draw it downward
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        });
        ctx.stroke();
        ctx.setLineDash([]);
      };
      line('target', accent, 1.2, [3, 3]);
      line('sway', ink, 1.6, []);
    }

    // ── still mode (reduced motion or paused) ──────────────────────────────
    function applyStatic() {
      const clip = POSES[pose];
      sway = { value: clip.tilt, velocity: 0 };
      target = clip.tilt;
      bob = 0;
      vx = 0;
      if (current !== null && !animated()) current.src = url(clip.frames[0]);
      write();
      lastReadout = 0;
      write();
      trace.length = 0;
      if (ctx) draw(performance.now());
    }

    function sync() {
      const wantRun = running();
      root.dataset.motion = animated() ? 'full' : 'reduced';
      if (motionNote) motionNote.hidden = !reducedQuery.matches;
      if (motionBtn) motionBtn.setAttribute('aria-pressed', String(playAnyway));
      if (wantRun && raf === 0) {
        last = performance.now();
        raf = requestAnimationFrame(tick);
      } else if (!wantRun && raf !== 0) {
        cancelAnimationFrame(raf);
        raf = 0;
        if (!animated()) {
          dock = { value: 0, velocity: 0 };
          applyStatic();
        }
      }
      root.dataset.running = String(raf !== 0);
    }

    if (motionBtn) {
      motionBtn.addEventListener('click', () => {
        playAnyway = !playAnyway;
        renderEffects(pose);
        sync();
      });
    }
    reducedQuery.addEventListener('change', () => {
      renderEffects(pose);
      sync();
    });
    document.addEventListener('visibilitychange', sync);
    if ('IntersectionObserver' in window) {
      new IntersectionObserver((entries) => {
        onScreen = entries.some((e) => e.isIntersecting);
        sync();
      }).observe(root);
    }

    showPose('idle', { instant: true }).then(sync);
    // Warm the other poses once the page is idle.
    const warm = () => ORDER.forEach((p) => POSES[p].frames.forEach((f) => decodeFrame(url(f)).catch(() => null)));
    if ('requestIdleCallback' in window) window.requestIdleCallback(warm, { timeout: 2000 });
    else window.setTimeout(warm, 300);
  }

  const start = () => document.querySelectorAll('[data-lv-demo]').forEach(mount);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
