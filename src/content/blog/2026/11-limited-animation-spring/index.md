---
title: "How a Still Illustration Comes Alive: Limited Animation and a 50-Line Spring"
description: "A beginner-friendly frontend lesson with a live, draggable figure: the anime trick of moving almost nothing, two breathing sine waves, a damped spring, and why the whole thing writes CSS variables instead of React state."
pubDate: 2026-11-28
category: "Web"
tags: ["Animation", "CSS", "requestAnimationFrame", "React", "Accessibility", "Web"]
featured: false
author: "Alex.Hsiao"
readTime: "14 min read"
cardImage: "./cover.webp"
cardImageAlt: "Three poses of Vellum, the Apsor Archive companion, with the breathing sine waves and the spring's overshoot curve drawn beside them"
---

# How a Still Illustration Comes Alive

The chat companion in [Apsor Archive](https://github.com/AlexTrinityBlock/apsor-archive) is a small character named Vellum who stands beside the conversation. She has one drawing per action, a few near-identical frames for the idle and thinking loops, and no skeleton, no mesh, and no animation library. People still describe her as "alive".

This post takes that effect apart. Try the figure first. Drag her sideways, flick her and let go, or focus her and use the arrow keys. Then switch the layers off one at a time and see what each one contributes.

<section class="lv-demo" data-lv-demo data-base="/images/limited-animation-spring/" data-pose-names="Idle|Thinking|Greet" data-motion="full" data-running="false" aria-labelledby="lv-demo-label">
  <div class="lv-demo-head">
    <span class="card-tag" id="lv-demo-label">LIVE DEMO // 00 · ONE ILLUSTRATION, THREE LAYERS</span>
    <span class="lv-demo-hint">DRAG · FLICK · ← → KEYS</span>
  </div>
  <div class="lv-demo-grid">
    <div class="lv-stage" data-lv-stage tabindex="0" role="group" aria-roledescription="draggable figure" aria-label="Vellum, a standing figure. Drag or flick her sideways, or press the left and right arrow keys, to make her sway." data-pose="idle">
      <div class="lv-floor" aria-hidden="true"></div>
      <div class="lv-shadow" aria-hidden="true"></div>
      <div class="lv-figure" data-lv-figure>
        <div class="lv-body" data-lv-body></div>
        <div class="lv-fx" data-lv-fx aria-hidden="true"></div>
        <span class="lv-pivot" aria-hidden="true"></span>
      </div>
      <span class="lv-stage-tag" aria-hidden="true"><b>●</b> PIVOT · TRANSFORM-ORIGIN 50% 100%</span>
    </div>
    <div class="lv-panel">
      <dl class="lv-readouts" aria-label="Live values">
        <div class="lv-readout"><dt>SWAY</dt><dd data-lv-out="sway">+0.00°</dd></div>
        <div class="lv-readout"><dt>BOB</dt><dd data-lv-out="bob">+0.00 px</dd></div>
        <div class="lv-readout"><dt>SPRING TARGET</dt><dd data-lv-out="target">+0.00°</dd></div>
        <div class="lv-readout"><dt>DRAG VELOCITY</dt><dd><span data-lv-out="vx">+0.00</span><small>PX/MS</small></dd></div>
        <div class="lv-readout"><dt>FRAME</dt><dd data-lv-out="frame">1 / 3</dd></div>
        <div class="lv-readout"><dt>LOOP</dt><dd>1→2→3→2</dd></div>
      </dl>
      <div class="lv-trace-wrap">
        <canvas class="lv-trace" data-lv-trace aria-hidden="true"></canvas>
        <div class="lv-trace-legend"><span><i class="lv-key"></i>SWAY (SPRING OUTPUT)</span><span><i class="lv-key lv-key--target"></i>TARGET</span><span>LAST 4 S</span></div>
      </div>
      <div class="lv-controls">
        <button class="mono-btn-chamfer" type="button" data-lv-pose aria-label="Change pose"><span class="chamfer-inner"><span class="btn-tag">POSE //</span><span class="btn-label" data-lv-pose-label aria-live="polite">Idle</span></span></button>
        <div class="lv-layers" role="group" aria-label="Animation layers">
          <span class="lv-layers-label">LAYERS</span>
          <button class="lv-chip" type="button" data-lv-layer="frames" aria-pressed="true">FRAMES</button>
          <button class="lv-chip" type="button" data-lv-layer="breath" aria-pressed="true">BREATH</button>
          <button class="lv-chip" type="button" data-lv-layer="spring" aria-pressed="true">SPRING</button>
        </div>
      </div>
      <p class="lv-reduced" data-lv-reduced hidden>Your system asks for reduced motion, so the figure is holding still. <button type="button" data-lv-play-anyway aria-pressed="false">Play the animation anyway</button></p>
    </div>
  </div>
  <div class="lv-demo-foot">CHARACTER: VELLUM, FROM <a href="https://github.com/AlexTrinityBlock/apsor-archive">APSOR ARCHIVE</a> · ART GENERATED FOR THE PROJECT · 7 AVIF FRAMES, 119 KB · NO LIBRARY</div>
</section>

<script src="/js/limited-animation-demo.js" defer></script>

<p class="mfig-bridge">Turn off SPRING and flick again: the figure snaps instead of swinging. Turn off BREATH and wait: she becomes a picture of a person. Turn off FRAMES and you may not notice at all, which is exactly the point of limited animation.</p>

<figure class="fig">
  <img src="/images/limited-animation-spring/overview.webp" alt="Three poses of Vellum, idle tilted by the spring, thinking with a resting tilt, and greet, each pivoting at a gold ring under her feet, beside a spring overshoot curve and two breathing sine waves of different periods" width="720" height="405" loading="lazy" />
  <figcaption><b>Editorial figure</b> — Three drawings, one pivot. The spring (stiffness 90, damping 9) overshoots about 18% and settles in about a second; the breathing waves have periods of 4.2 s and 6.8 s, so they rarely line up. Character art: Vellum, generated for Apsor Archive.</figcaption>
</figure>

## Limited animation: move almost nothing

Full animation, in the Disney feature tradition, redraws the whole character many times a second. Japanese TV anime could not afford that. When *Astro Boy* went on air weekly in 1963, the studio built a production style around **limited animation**: hold a drawing for as long as possible, reuse it, and move only the part that matters. A talking character is often one held drawing with three mouth shapes. A dramatic moment is a still painting with a slow camera pan.

What keeps a held drawing from reading as a photograph is **secondary motion**: hair lifting, a coat settling, a chest rising. Two of the classic principles of animation describe it. *Secondary action* is the small motion that supports the main one. *Follow-through and overlapping action* says that loose parts keep moving after the body stops, and come to rest late.

Why does so little work? Human vision is very good at telling a living body from an object. A perfectly still figure is an object. A figure with a slow, continuous, slightly irregular motion at the scale of breathing reads as a body that is holding itself up. A pendulum overshoot after a push says the body has weight. You do not need new drawings to communicate either of those things. You need timing.

Vellum's stack follows the same economy:

| Layer | What moves | Cost |
| :-- | :-- | :-- |
| **Pose illustrations** | One drawing per action, crossfaded on change | One image per action |
| **Warp frames** | Three near-identical frames, 1→2→3→2 | Two extra images per looping action |
| **Procedural motion** | Breathing bob and sway, a damped spring | About 50 lines of TypeScript |
| **Overlays** | Dust motes, thought dots, sparkles, `zzz`, a contact shadow | CSS keyframes |

## Layer 1: one illustration per action

Each action has its own drawing: idle, thinking, greet, reading, sleeping, and so on. A manifest maps action names to frames:

```json
"idle":     { "frames": ["idle.avif", "idle-2.avif", "idle-3.avif"], "fps": 4, "loop": true, "pingpong": true },
"greet":    { "frames": ["greet.avif"], "fps": 0, "loop": true },
"thinking": { "frames": ["thinking.avif", "thinking-2.avif", "thinking-3.avif"], "fps": 4, "loop": true, "pingpong": true }
```

Changing pose is a 260 ms opacity crossfade between two stacked `<img>` layers. The detail that matters is **decode first, swap second**. Setting `img.src` starts a download and a decode. If you swap layers before the new image has decoded, the browser paints an empty box for a frame or two, and the figure blinks. `HTMLImageElement.decode()` returns a promise that resolves when the image can be painted without a hitch:

```ts
export function decodeFrame(url: string): Promise<void> {
  const existing = decoded.get(url);
  if (existing !== undefined) {
    return existing;
  }
  const image = new Image();
  image.decoding = "async";
  image.src = url;
  const promise = image
    .decode()
    .catch(() => {
      if (!(image.complete && image.naturalWidth > 0)) {
        throw new Error("companion frame failed to load");
      }
    })
    .then(() => {
      retained.set(url, image); // keep a reference so the browser keeps it warm
    });
  decoded.set(url, promise);
  return promise;
}
```

The player waits for `decodeFrames(clip.frames)` before it changes what is shown, and warms the likely next poses with `requestIdleCallback`. The demo above does the same: press POSE and the new drawing appears only after all its frames are ready.

## Layer 2: three pixel-locked frames, ping-pong

The idle and thinking loops each have three frames. They are **pixel-locked**: same canvas size, same registration, the feet and body in exactly the same place. Only small regions differ, such as a strand of hair, the edge of the cape, or a fold of the sleeve. Swapping frames therefore never makes the figure jump; it only makes the loose parts shimmer.

Three frames played 1→2→3→1 would pop at the wrap. Played **ping-pong**, 1→2→3→2→1, every change is between neighbours:

```ts
export function frameAtStep(clip: CompanionActionClip, step: number): number {
  const count = clip.frames.length;
  if (count < 2 || step <= 0) {
    return 0;
  }
  if (clip.pingpong) {
    const period = count * 2 - 2;        // 3 frames → period 4: 0,1,2,1
    if (!clip.loop && step >= period) {
      return 0;
    }
    const phase = step % period;
    return phase < count ? phase : period - phase;
  }
  // …plain wrap or play-once for other clips
}
```

Four frames a second is slower than TV anime's usual eight drawings a second ("on threes" at 24 fps). It does not need to be fast. The smooth motion comes from the next layer; the frames only add texture.

## One clock: `requestAnimationFrame`

Smooth motion needs one function that runs once per displayed frame and moves everything a little. That function is a `requestAnimationFrame` loop.

Why not `setInterval(tick, 16)`?

- **It is not synced to the display.** A 16 ms timer drifts against a 16.67 ms refresh, so some frames get two updates and some get none. That is visible as judder. On a 120 Hz screen it is simply wrong.
- **It keeps running when nobody is watching.** `requestAnimationFrame` callbacks stop in background tabs and hidden iframes, which saves battery for free.
- **It gives you a precise timestamp.** The callback receives the frame time, so you can compute exactly how much time passed and move by that much.

The companion's loop, from `CompanionStage.tsx`:

```tsx
useEffect(() => {
  const figure = figureRef.current;
  if (!animated || !active || figure === null) {
    figure?.style.setProperty("--companion-sway", `${motion === "off" ? 0 : tilt}deg`);
    figure?.style.setProperty("--companion-bob", "0px");
    return undefined;
  }
  let frame = 0;
  let last = performance.now();
  let sway: SpringState = { value: tilt, velocity: 0 };
  const tick = (now: number) => {
    const seconds = Math.min(0.1, (now - last) / 1000);
    last = now;
    if (document.visibilityState === "visible") {
      const breath = breathing(now);
      const dragSway = swayForVelocity(dragMotion.current?.vx ?? 0);
      const target = tilt + dragSway + (action === "held" ? 0 : breath.sway);
      sway = stepSpring(sway, target, seconds, SWAY_SPRING);
      const bob = action === "held" || action === "sleeping" ? 0 : breath.bob;
      figure.style.setProperty("--companion-sway", `${sway.value.toFixed(2)}deg`);
      figure.style.setProperty("--companion-bob", `${bob.toFixed(2)}px`);
    }
    frame = requestAnimationFrame(tick);
  };
  frame = requestAnimationFrame(tick);
  return () => cancelAnimationFrame(frame);
}, [animated, active, action, tilt, dragMotion, motion]);
```

Four habits are worth copying:

1. **Clamp the time step.** `Math.min(0.1, …)` means a tab that was hidden for a minute advances by 100 ms, not 60 seconds.
2. **Check visibility.** The browser already throttles hidden tabs; the explicit check makes the intent obvious and skips work in an embedded view.
3. **Clean up.** The effect returns `cancelAnimationFrame(frame)`. Without it, every pose change would start another loop, and after ten changes ten loops would fight over the same element.
4. **Pause when off duty.** `active` is false while the companion is hidden or minimized, so the loop does not run at all. The demo on this page uses an `IntersectionObserver` for the same purpose: scroll it out of view and the loop stops.

A small honest note: in the app, the 4 fps frame stepping uses a plain `setInterval`, because it is a discrete, low-rate step where a few milliseconds of drift are invisible. The continuous motion is the part that needs `requestAnimationFrame`. The demo drives both from the same rAF clock, which is also fine.

## Breathing: two sine waves that never line up

The breathing function is four lines of trigonometry:

```ts
/** Gentle breathing: vertical bob in px and a small sway in degrees. */
export function breathing(timeMs: number): { readonly bob: number; readonly sway: number } {
  const t = timeMs / 1000;
  return {
    bob: Math.sin(t * ((2 * Math.PI) / 4.2)) * 2.2,
    sway: Math.sin(t * ((2 * Math.PI) / 6.8) + 0.9) * 1.1,
  };
}
```

$$
\text{bob}(t) = 2.2\,\sin\!\left(\frac{2\pi t}{4.2}\right)\ \text{px}
\qquad
\text{sway}(t) = 1.1\,\sin\!\left(\frac{2\pi t}{6.8} + 0.9\right)\ \text{deg}
$$

Every number has a reason:

- **4.2 seconds** is about 14 breaths a minute, inside the normal resting range for an adult.
- **±2.2 px** on a figure roughly 300 px tall is under one percent of her height. You notice it as life, not as movement.
- **±1.1°** of sway is smaller still. It is the weight shift of someone standing, not a dance.
- **6.8 seconds** is the key. If the sway shared the bob's period, the two would rise and fall together, and the figure would trace the same small loop every 4.2 seconds, like a metronome. With different periods the combination keeps changing.
- **+0.9 radians** of phase means the two waves do not both start at zero when the page loads.

Strictly speaking, 4.2 and 6.8 are not incommensurate: their ratio is 21:34, so the combined pattern repeats every 142.8 seconds. That is close enough. Nobody stares at an idle figure for two and a half minutes and notices the repeat. If you want truly non-repeating motion, use an irrational ratio such as the golden ratio, or add a third, slower wave.

Notice where `breath.sway` goes in the loop above: it is **added to the spring's target**, not written straight to the screen. Breathing passes through the same spring as a drag, which keeps every change of angle smooth.

## The spring: 50 lines of physics

A spring has three ingredients: where it is (`value`), how fast it is moving (`velocity`), and where it wants to be (`target`). Every step, two forces act on it:

$$
a = -k\,(x - x_{\text{target}}) - c\,v
$$

The first term pulls toward the target, harder the further away it is (Hooke's law, stiffness $k$). The second resists motion, harder the faster it moves (damping $c$). With mass 1, force equals acceleration. Here is the whole file:

```ts
export interface SpringState {
  readonly value: number;
  readonly velocity: number;
}

export interface SpringConfig {
  readonly stiffness: number;
  readonly damping: number;
}

/** A loose pendulum: visible overshoot, settles in about a second. */
export const SWAY_SPRING: SpringConfig = { stiffness: 90, damping: 9 };
/** Firm return to the dock after a throw. */
export const DOCK_SPRING: SpringConfig = { stiffness: 170, damping: 22 };

const MAX_STEP_SECONDS = 1 / 30;

export function stepSpring(
  state: SpringState,
  target: number,
  seconds: number,
  config: SpringConfig,
): SpringState {
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

/** Map horizontal drag velocity (px/ms) to a sway angle in degrees. */
export function swayForVelocity(velocityX: number, maxDegrees = 16): number {
  const angle = -velocityX * 14;
  return Math.max(-maxDegrees, Math.min(maxDegrees, angle));
}
```

### Semi-implicit Euler: the order of two lines

Look at the loop body. It updates `velocity` first, then moves `value` using the **new** velocity. That ordering is called **semi-implicit** (or symplectic) Euler. If you swap the two lines, moving with the old velocity, you get explicit Euler, which adds a little energy every step. With no damping, an explicit-Euler spring swings wider and wider until it flies off the screen. Semi-implicit Euler keeps the energy of an undamped oscillator bounded, so it stays stable as long as the steps are small.

"Small" is the job of `MAX_STEP_SECONDS = 1/30`. If the browser stalls for 200 ms and you integrate that in one step, even the semi-implicit version explodes: I ran it, and after eight seconds of 200 ms steps the value was around $10^{23}$. Splitting a long frame into ≤ 33 ms sub-steps costs a few extra multiplications and removes the problem.

### What stiffness 90 and damping 9 feel like

Two derived numbers describe any spring:

- **Natural frequency** $\omega_0 = \sqrt{k} = \sqrt{90} \approx 9.5$ rad/s, about 1.5 swings a second.
- **Damping ratio** $\zeta = c / (2\sqrt{k}) = 9 / 19 \approx 0.47$.

A damping ratio below 1 is **underdamped**: the spring overshoots the target and oscillates back. At 0.47 the first overshoot is about 18% of the displacement, the next one is barely visible, and the swing settles within about a second. Simulated at 60 fps, a release from 16° overshoots to 2.7° on the other side and is within 5% of rest after 1.03 seconds. That is the pendulum you saw when you flicked the figure.

The `DOCK_SPRING` (stiffness 170, damping 22) has $\zeta \approx 0.84$, close to critical damping. It returns the companion to its dock firmly, with no visible bounce. Same code, different feel; the demo uses it to bring the figure back to the center of the stage after you drag her.

### Drag velocity becomes a lean

`swayForVelocity` turns the pointer's horizontal speed into a target angle: −14° per px/ms, clamped to ±16°. The minus sign matters. Drag right and the top of the figure leans left, because the feet are the pivot and the upper body lags behind the motion, like an umbrella you carry upright and swing. Speed comes from the pointer samples of the last 90 ms, so the lean follows the hand, not the total distance.

When you let go, the velocity drops to zero, the target snaps back to the resting tilt plus breathing, and the spring does the rest: overshoot, swing back, settle. No animation curve was authored for that moment. It falls out of the physics.

## Applying it: CSS variables, not React state

The loop never calls `setState`. It writes two CSS custom properties directly on the figure element:

```ts
figure.style.setProperty("--companion-sway", `${sway.value.toFixed(2)}deg`);
figure.style.setProperty("--companion-bob", `${bob.toFixed(2)}px`);
```

and a single CSS rule turns them into a transform:

```css
.companion-figure {
  position: absolute;
  left: 0;
  transform: translateY(var(--companion-bob, 0px)) rotate(var(--companion-sway, 0deg));
  /* Free-standing: the figure pivots at its feet. */
  transform-origin: 50% 100%;
  will-change: transform;
}

.companion-stage:not(.is-animated) .companion-figure {
  will-change: auto;
}
```

Three decisions are packed into that rule.

**`transform-origin: 50% 100%` puts the pivot at the feet.** The default origin is the center of the element, and a figure rotating around her waist looks like a cardboard sign spinning on a pin. Rotating around the bottom center makes her lean like a standing person. The gold ring in the demo marks that point; it stays fixed while everything above it moves.

**Only `transform` changes.** Browsers render in stages: style, layout, paint, composite. Changing `width` or `top` forces layout and repaint. Changing `transform` (or `opacity`) can be handled by the compositor alone, which moves an already-painted layer on the GPU. `will-change: transform` asks the browser to give the figure its own layer ahead of time, so the first frame of motion does not pay for that promotion. When animation is off, `will-change` goes back to `auto` so the layer is not held for nothing.

**React does not hear about any of it.** At 60 fps, `setState` would ask React to re-render the stage 60 times a second: run the component, diff the virtual DOM, and commit, on the same main thread that is streaming the chat reply next to it. Writing a CSS variable costs one style recalculation for one element. React renders the stage only when the pose changes, which happens a few times a minute.

The rule of thumb: **React state for things that change what is on the page; direct DOM writes for things that only change where it is, every frame.** Refs and CSS variables are the clean boundary between the two.

## Layer 4: overlays and the contact shadow

The last layer is cheap and does a lot. Each action can mount a small decorative overlay: drifting motes while searching, a thought bubble with three pulsing dots while thinking, eight sparks bursting outward on greet, `zzz` while sleeping. They are plain `<span>` elements animated by CSS keyframes, staggered with a `--i` index:

```css
.companion-fx__spark {
  animation: companion-spark 1.3s var(--ease-out) 2;
  animation-delay: calc(var(--i) * 0.04s);
}

@keyframes companion-spark {
  0%   { opacity: 0; transform: rotate(calc(var(--i) * 45deg)) translateY(0) scale(0.2); }
  30%  { opacity: 1; }
  100% { opacity: 0; transform: rotate(calc(var(--i) * 45deg)) translateY(-52px) scale(1); }
}
```

They sit **inside** the figure element, so they sway with her. They are `aria-hidden` and `pointer-events: none`, and they are mounted only at full motion.

Under her feet sits a soft radial-gradient ellipse: a **contact shadow**. It is the cheapest grounding trick there is. Without it, a cut-out figure floats; with it, she stands on something. The demo adds one small flourish that is not in the app: the shadow narrows a little as the bob lifts her.

## Respecting reduced motion

Some people get dizzy or nauseous from motion they did not ask for. Operating systems expose that preference, and CSS and JavaScript can read it:

```ts
const QUERY = "(prefers-reduced-motion: reduce)";
// React: subscribe with useSyncExternalStore so the value stays live.
```

The companion also has its own setting, **full / reduced / off**, combined with the system preference:

```ts
export function effectiveMotion(preference: CompanionMotion, systemReduced: boolean): CompanionMotion {
  if (preference === "off") {
    return "off";
  }
  return systemReduced ? "reduced" : preference;
}
```

Anything below `full` stops the rAF loop, freezes the first frame of each pose, unmounts the overlays, and leaves only the resting tilt. A CSS media query backs it up by turning off the keyframe animations. The pose still changes, because that is information, not decoration.

The demo on this page follows the same rule. With reduced motion on, she holds still and a short note offers to play the animation anyway, which is a choice you make, not one made for you.

## Limits, and where to go next

This technique has a ceiling. Everything here is a **rigid transform of a flat picture**: the whole image translates and rotates as one card. Small angles hide that. Push the sway to 30° and she stops looking like a person shifting her weight and starts looking like a sticker peeling off. The ±16° clamp is not arbitrary.

To bend the drawing itself, you need **mesh deformation**:

- **[Live2D Cubism](https://www.live2d.com/en/)** splits an illustration into layered parts and deforms each with meshes driven by parameters such as head angle, eye openness, and breathing. Its breathing parameter is, unsurprisingly, a sine wave.
- **[Spine](https://esotericsoftware.com/)** is skeletal 2D animation: bones, weighted meshes, and runtimes for the web and game engines.

Both produce far richer motion, and both need the artwork prepared for them: separated layers, rigging, and a dedicated editor.

If you want springs without writing them, the libraries speak the same language you just learned:

- **[Motion](https://motion.dev/)** (formerly Framer Motion) has `type: "spring"` transitions configured with `stiffness` and `damping`.
- **[React Spring](https://www.react-spring.dev/)** is built entirely on spring physics (`tension` and `friction`).
- **[GSAP](https://gsap.com/)** is the standard for timelines and sequencing, with physics and easing plugins.

They are the right choice when animation is a large part of a product. For one figure beside a chat, 50 lines you understand completely, with no dependency to update, is also a good choice.

## Checklist

- [ ] Prepare one illustration per action, plus two pixel-locked variants for looping actions.
- [ ] Decode the next pose with `img.decode()` before swapping; crossfade with opacity.
- [ ] Play warp frames ping-pong (1→2→3→2) at a low frame rate.
- [ ] Drive continuous motion from one `requestAnimationFrame` loop; clamp the time step; cancel on cleanup; pause when hidden or off screen.
- [ ] Breathe with two small sine waves of different periods; feed the sway into the spring's target.
- [ ] Integrate the spring with semi-implicit Euler and sub-steps of at most 1/30 s.
- [ ] Map drag velocity, not drag distance, to the lean; clamp the angle.
- [ ] Write CSS custom properties; animate only `transform`; pivot at `50% 100%`; drop `will-change` when idle.
- [ ] Honor `prefers-reduced-motion` and give the user their own motion setting.

## References

- [Apsor Archive on GitHub](https://github.com/AlexTrinityBlock/apsor-archive) — the companion's source: `frontend/src/app/companion/`.
- [MDN: `requestAnimationFrame`](https://developer.mozilla.org/en-US/docs/Web/API/Window/requestAnimationFrame) — timing, background tabs, and cancellation.
- [MDN: `HTMLImageElement.decode()`](https://developer.mozilla.org/en-US/docs/Web/API/HTMLImageElement/decode) — decoding before display.
- [MDN: `CSSStyleDeclaration.setProperty()`](https://developer.mozilla.org/en-US/docs/Web/API/CSSStyleDeclaration/setProperty) — writing custom properties from script.
- [MDN: `transform-origin`](https://developer.mozilla.org/en-US/docs/Web/CSS/transform-origin) and [`will-change`](https://developer.mozilla.org/en-US/docs/Web/CSS/will-change).
- [MDN: `prefers-reduced-motion`](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion).
- [MDN: Pointer events](https://developer.mozilla.org/en-US/docs/Web/API/Pointer_events) and [`touch-action`](https://developer.mozilla.org/en-US/docs/Web/CSS/touch-action) — dragging on touch screens.
- [web.dev: Stick to compositor-only properties](https://web.dev/articles/stick-to-compositor-only-properties-and-manage-layer-count) — why `transform` and `opacity` are cheap.
- [Glenn Fiedler, "Integration Basics"](https://gafferongames.com/post/integration_basics/) — explicit vs. semi-implicit Euler, with springs.
- [Wikipedia: Limited animation](https://en.wikipedia.org/wiki/Limited_animation) and [Twelve basic principles of animation](https://en.wikipedia.org/wiki/Twelve_basic_principles_of_animation).
