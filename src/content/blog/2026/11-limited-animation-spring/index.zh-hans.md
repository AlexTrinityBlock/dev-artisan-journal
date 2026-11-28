---
title: "一张静态插画如何活起来：有限动画与 50 行的弹簧"
description: "一堂写给初学者的前端课，附一个可以拖拽的实时互动角色：动画业“几乎什么都不动”的技巧、两条呼吸正弦波、一个阻尼弹簧，以及为什么整件事写的是 CSS 变量而不是 React state。"
pubDate: 2026-11-28
category: "Web"
tags: ["动画", "CSS", "requestAnimationFrame", "React", "无障碍", "Web"]
featured: false
author: "Alex.Hsiao"
readTime: "14 分钟"
cardImage: "./cover.webp"
cardImageAlt: "Apsor Archive 聊天伙伴 Vellum 的三个姿势，旁边画着呼吸正弦波与弹簧的过冲曲线"
---

# 一张静态插画如何活起来

[Apsor Archive](https://github.com/AlexTrinityBlock/apsor-archive) 的聊天伙伴是一个叫 Vellum 的小角色，站在对话旁边。她每个动作只有一张图，待机和思考各多了几张几乎一样的帧；没有骨架、没有网格，也没有动画库。可是看过的人都说她是“活的”。

这篇文章把这个效果拆开来看。先玩玩看：把她往旁边拖、甩一下再放手，或者聚焦后用方向键。接着把图层一层一层关掉，看看每一层各自贡献了什么。

<section class="lv-demo" data-lv-demo data-base="/images/limited-animation-spring/" data-pose-names="待机|思考|打招呼" data-motion="full" data-running="false" aria-labelledby="lv-demo-label">
  <div class="lv-demo-head">
    <span class="card-tag" id="lv-demo-label">LIVE DEMO // 00 · 一张插画，三层动态</span>
    <span class="lv-demo-hint">拖拽 · 甩动 · ← → 方向键</span>
  </div>
  <div class="lv-demo-grid">
    <div class="lv-stage" data-lv-stage tabindex="0" role="group" aria-roledescription="可拖拽的角色" aria-label="Vellum，一个站立的角色。往旁边拖拽或甩动她，或按左右方向键，让她摆动。" data-pose="idle">
      <div class="lv-floor" aria-hidden="true"></div>
      <div class="lv-shadow" aria-hidden="true"></div>
      <div class="lv-figure" data-lv-figure>
        <div class="lv-body" data-lv-body></div>
        <div class="lv-fx" data-lv-fx aria-hidden="true"></div>
        <span class="lv-pivot" aria-hidden="true"></span>
      </div>
      <span class="lv-stage-tag" aria-hidden="true"><b>●</b> 支点 · TRANSFORM-ORIGIN 50% 100%</span>
    </div>
    <div class="lv-panel">
      <dl class="lv-readouts" aria-label="实时数值">
        <div class="lv-readout"><dt>摆动 SWAY</dt><dd data-lv-out="sway">+0.00°</dd></div>
        <div class="lv-readout"><dt>起伏 BOB</dt><dd data-lv-out="bob">+0.00 px</dd></div>
        <div class="lv-readout"><dt>弹簧目标</dt><dd data-lv-out="target">+0.00°</dd></div>
        <div class="lv-readout"><dt>拖拽速度</dt><dd><span data-lv-out="vx">+0.00</span><small>PX/MS</small></dd></div>
        <div class="lv-readout"><dt>帧</dt><dd data-lv-out="frame">1 / 3</dd></div>
        <div class="lv-readout"><dt>循环</dt><dd>1→2→3→2</dd></div>
      </dl>
      <div class="lv-trace-wrap">
        <canvas class="lv-trace" data-lv-trace aria-hidden="true"></canvas>
        <div class="lv-trace-legend"><span><i class="lv-key"></i>摆动（弹簧输出）</span><span><i class="lv-key lv-key--target"></i>目标</span><span>最近 4 秒</span></div>
      </div>
      <div class="lv-controls">
        <button class="mono-btn-chamfer" type="button" data-lv-pose aria-label="切换姿势"><span class="chamfer-inner"><span class="btn-tag">姿势 //</span><span class="btn-label" data-lv-pose-label aria-live="polite">待机</span></span></button>
        <div class="lv-layers" role="group" aria-label="动画图层">
          <span class="lv-layers-label">图层</span>
          <button class="lv-chip" type="button" data-lv-layer="frames" aria-pressed="true">FRAMES</button>
          <button class="lv-chip" type="button" data-lv-layer="breath" aria-pressed="true">BREATH</button>
          <button class="lv-chip" type="button" data-lv-layer="spring" aria-pressed="true">SPRING</button>
        </div>
      </div>
      <p class="lv-reduced" data-lv-reduced hidden>你的系统要求减少动态效果，所以角色保持静止。<button type="button" data-lv-play-anyway aria-pressed="false">仍然播放动画</button></p>
    </div>
  </div>
  <div class="lv-demo-foot">角色：VELLUM，出自 <a href="https://github.com/AlexTrinityBlock/apsor-archive">APSOR ARCHIVE</a> · 插画为本项目生成 · 7 张 AVIF 帧，119 KB · 不用任何库</div>
</section>

<script src="/js/limited-animation-demo.js" defer></script>

<p class="mfig-bridge">关掉 SPRING 再甩一次：角色会直接弹回去，不再摆荡。关掉 BREATH 等几秒：她变成一张人物照片。关掉 FRAMES，你可能根本不会发现；这正是有限动画的重点。</p>

<figure class="fig">
  <img src="/images/limited-animation-spring/overview.webp" alt="Vellum 的三个姿势：被弹簧带着倾斜的待机、带有静止倾角的思考，以及打招呼，每个姿势都以脚下的金色圆圈为支点；旁边是弹簧过冲曲线，以及两条周期不同的呼吸正弦波" width="720" height="405" loading="lazy" />
  <figcaption><b>编辑示意图</b> — 三张图，一个支点。弹簧（stiffness 90、damping 9）大约过冲 18%，约一秒内静止；两条呼吸波的周期是 4.2 秒和 6.8 秒，很少同步。角色插画：Vellum，为 Apsor Archive 生成。</figcaption>
</figure>

## 有限动画：几乎什么都不动

迪士尼长片传统的“完全动画”每秒要把整个角色重画很多次。日本的电视动画负担不起。1963 年《原子小金刚》每周播出时，制作团队发展出一套以**有限动画**为核心的做法：一张图能停多久就停多久、能重复用就重复用，只动真正要动的部分。角色讲话，常常是一张停格的图配三种嘴型；戏剧性的一刻，常常是一张静止的画配上缓慢的镜头平移。

让停格的图不像照片的，是**次要动作**：头发飘起、外套落定、胸口起伏。经典动画原则里有两条在讲这件事。*Secondary action*（次要动作）是支撑主要动作的小动作。*Follow-through and overlapping action*（跟随与重叠动作）说的是：身体停下之后，松散的部分还会继续动，晚一点才停。

为什么这么少的动作就够了？人的视觉非常擅长分辨活的身体和物体。完全静止的人形是物体。一个以呼吸的尺度缓慢、连续、略带不规则地移动的人形，看起来就是一个正在撑着自己站立的身体。被推一下之后像钟摆一样过冲，代表这个身体有重量。要传达这两件事，不需要新的图，需要的是时机。

Vellum 的分层也是同样的节省思路：

| 图层 | 动的是什么 | 成本 |
| :-- | :-- | :-- |
| **姿势插画** | 每个动作一张图，切换时交叉淡化 | 每个动作一张图 |
| **微动帧** | 三张几乎一样的帧，1→2→3→2 | 每个循环动作多两张图 |
| **程序化动作** | 呼吸的上下起伏与摆动、一个阻尼弹簧 | 大约 50 行 TypeScript |
| **叠加效果** | 浮尘、思考点点、星光、`zzz`、接触阴影 | CSS keyframes |

## 第 1 层：每个动作一张插画

每个动作都有自己的图：待机、思考、打招呼、阅读、睡觉等等。一份 manifest 把动作名称对应到帧：

```json
"idle":     { "frames": ["idle.avif", "idle-2.avif", "idle-3.avif"], "fps": 4, "loop": true, "pingpong": true },
"greet":    { "frames": ["greet.avif"], "fps": 0, "loop": true },
"thinking": { "frames": ["thinking.avif", "thinking-2.avif", "thinking-3.avif"], "fps": 4, "loop": true, "pingpong": true }
```

换姿势就是两个叠在一起的 `<img>` 做 260 ms 的透明度交叉淡化。关键的细节是**先解码，再切换**。设置 `img.src` 会开始下载和解码。如果新图还没解码完就切换图层，浏览器会画出一两帧的空白，角色就会闪一下。`HTMLImageElement.decode()` 会返回一个 promise，在图片可以无卡顿地绘制时 resolve：

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

播放器会等 `decodeFrames(clip.frames)` 完成才改变画面，并用 `requestIdleCallback` 预热接下来可能用到的姿势。上面的演示也一样：按下 POSE，新的图要等所有帧都准备好才会出现。

## 第 2 层：三张像素对齐的帧，来回播放

待机和思考的循环各有三张帧。它们是**像素对齐**的：同样的画布大小、同样的定位，脚和身体在完全相同的位置。只有小区域不同，例如一缕头发、披风的边缘、袖子的一道折痕。所以切换帧时角色永远不会跳动，只有松散的部分在微微闪动。

三张帧如果照 1→2→3→1 播放，在绕回开头时会跳一下。改成**来回播放**（ping-pong），1→2→3→2→1，每一次切换都只发生在相邻的两张之间：

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

每秒 4 帧比电视动画常见的每秒 8 张（24 fps 下“一拍三”）还慢。它不需要快。流畅的动作来自下一层；帧只负责增加质感。

## 一个时钟：`requestAnimationFrame`

流畅的动作需要一个函数，在每一个显示帧运行一次，把所有东西移动一点点。这个函数就是 `requestAnimationFrame` 循环。

为什么不用 `setInterval(tick, 16)`？

- **它没有和屏幕同步。** 16 ms 的计时器会和 16.67 ms 的更新周期互相漂移，所以有些帧更新两次、有些一次都没有，看起来就是抖动。在 120 Hz 的屏幕上更是直接错误。
- **没人在看时它还在跑。** `requestAnimationFrame` 的回调在后台标签页和隐藏的 iframe 里会停止，等于免费省电。
- **它给你精确的时间戳。** 回调会收到这一帧的时间，你可以精确算出过了多久，然后只移动那么多。

聊天伙伴的循环，出自 `CompanionStage.tsx`：

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

有四个习惯值得照抄：

1. **限制时间步长。** `Math.min(0.1, …)` 代表一个被隐藏了一分钟的标签页回来时只前进 100 ms，而不是 60 秒。
2. **检查可见性。** 浏览器本来就会节流隐藏的标签页；明确的检查让意图更清楚，也能在嵌入的画面里省下工作。
3. **记得清理。** effect 返回 `cancelAnimationFrame(frame)`。少了它，每次换姿势都会多开一个循环，换十次就有十个循环在抢同一个元素。
4. **不在岗位时就暂停。** 聊天伙伴被隐藏或最小化时 `active` 是 false，循环根本不会运行。这页的演示用 `IntersectionObserver` 做同一件事：滚出画面，循环就停。

老实补充一点：在应用程序里，每秒 4 帧的帧切换用的是普通的 `setInterval`，因为那是离散、低频率的步进，几毫秒的漂移完全看不出来。真正需要 `requestAnimationFrame` 的是连续的动作。演示则用同一个 rAF 时钟驱动两者，这样也没问题。

## 呼吸：两条永远对不齐的正弦波

呼吸函数只有四行三角函数：

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

每个数字都有理由：

- **4.2 秒**大约是每分钟 14 次呼吸，落在成人静止时的正常范围内。
- **±2.2 px** 对一个大约 300 px 高的角色来说，不到身高的百分之一。你感觉到的是生命，不是移动。
- **±1.1°** 的摆动更小。那是一个人站着时的重心转移，不是在跳舞。
- **6.8 秒**是关键。如果摆动和起伏的周期相同，两者会一起升一起降，角色每 4.2 秒画出同一个小圈，像节拍器。周期不同，组合起来就一直在变。
- **+0.9 弧度**的相位，让两条波不会在页面加载时同时从零开始。

严格来说，4.2 和 6.8 并不是不可公度的：它们的比是 21:34，所以组合起来的图样每 142.8 秒会重复一次。这已经够了。没有人会盯着一个待机的角色看两分半，然后发现它重复了。如果想要真的不重复，可以用无理数比例，例如黄金比例，或是再加第三条更慢的波。

注意上面循环里 `breath.sway` 去了哪里：它被**加到弹簧的目标值**，而不是直接写到画面上。呼吸和拖拽经过同一个弹簧，所以每一次角度变化都是平滑的。

## 弹簧：50 行物理

一个弹簧有三样东西：它在哪里（`value`）、它动得多快（`velocity`）、它想去哪里（`target`）。每一步都有两个力作用在它身上：

$$
a = -k\,(x - x_{\text{target}}) - c\,v
$$

第一项把它拉向目标，离得越远拉得越用力（虎克定律，刚性 $k$）。第二项抵抗运动，动得越快阻力越大（阻尼 $c$）。质量设为 1，力就等于加速度。整个文件如下：

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

### 半隐式欧拉法：两进程式的顺序

看循环的内容。它先更新 `velocity`，再用**新的**速度移动 `value`。这个顺序叫做**半隐式**（或辛）欧拉法。如果把两行对调，用旧的速度移动，就变成显式欧拉法，每一步都会多加一点能量。没有阻尼时，显式欧拉法的弹簧会越摆越大，直到飞出画面。半隐式欧拉法能让无阻尼振荡器的能量维持有界，所以只要步长够小就是稳定的。

“够小”是 `MAX_STEP_SECONDS = 1/30` 的工作。如果浏览器卡了 200 ms，而你一步就积分完这段时间，连半隐式版本也会爆掉：我实际跑过，用 200 ms 的步长跑八秒之后，数值大约是 $10^{23}$。把一个长帧切成每段不超过 33 ms 的子步骤，只多几次乘法，就消除了这个问题。

### stiffness 90、damping 9 是什么手感

任何弹簧都可以用两个推导出来的数字描述：

- **自然频率** $\omega_0 = \sqrt{k} = \sqrt{90} \approx 9.5$ rad/s，大约每秒摆 1.5 次。
- **阻尼比** $\zeta = c / (2\sqrt{k}) = 9 / 19 \approx 0.47$。

阻尼比小于 1 就是**欠阻尼**：弹簧会冲过目标再摆回来。0.47 时第一次过冲大约是位移的 18%，第二次几乎看不见，大约一秒内就静止。以 60 fps 模拟，从 16° 放开会冲到另一侧的 2.7°，1.03 秒后就在静止位置的 5% 以内。这就是你甩角色时看到的钟摆。

`DOCK_SPRING`（stiffness 170、damping 22）的 $\zeta \approx 0.84$，接近临界阻尼。它把聊天伙伴稳稳地送回停靠位置，看不出回弹。同样的代码，不同的手感；演示在你拖拽之后用它把角色带回舞台中央。

### 拖拽速度变成倾斜

`swayForVelocity` 把指针的水平速度转成目标角度：每 px/ms 对应 −14°，限制在 ±16°。负号很重要。往右拖，角色的上半身会往左倾，因为脚是支点，上半身跟不上移动，就像直立拿着一把雨伞甩动。速度取自最近 90 ms 的指针采样，所以倾斜跟着手的速度，而不是总距离。

放手时速度归零，目标值弹回静止倾角加上呼吸，剩下的交给弹簧：过冲、摆回、静止。那一刻没有人写任何动画曲线，它是物理自然算出来的。

## 套用：用 CSS 变量，不用 React state

循环从不调用 `setState`。它直接在角色元素上写两个 CSS 自定义属性：

```ts
figure.style.setProperty("--companion-sway", `${sway.value.toFixed(2)}deg`);
figure.style.setProperty("--companion-bob", `${bob.toFixed(2)}px`);
```

再由一条 CSS 规则把它们变成 transform：

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

这条规则里包了三个决定。

**`transform-origin: 50% 100%` 把支点放在脚底。** 默认的原点是元素中心，一个绕着腰旋转的角色看起来像一块插在钉子上转的纸板。绕着底部中央旋转，她就会像站着的人一样倾斜。演示里的金色圆圈标出的就是这个点；它保持不动，上面的一切都在动。

**只有 `transform` 在变。** 浏览器的渲染分几个阶段：style、layout、paint、composite。改 `width` 或 `top` 会触发 layout 和重新绘制。改 `transform`（或 `opacity`）可以只交给合成器处理，在 GPU 上移动一张已经画好的图层。`will-change: transform` 请浏览器事先给角色一张自己的图层，让动作的第一帧不必付出提升图层的成本。动画关闭时，`will-change` 会改回 `auto`，不白白占着图层。

**React 完全不知道这些事。** 在 60 fps 下，`setState` 会要求 React 每秒重新渲染舞台 60 次：运行组件、比对虚拟 DOM、提交，而且是在旁边正在流式输出聊天回复的同一条主线程上。写一个 CSS 变量只花一个元素的一次样式重算。React 只有在姿势改变时才渲染舞台，一分钟也就几次。

经验法则：**会改变页面上“有什么”的东西用 React state；每一帧只改变“在哪里”的东西直接写 DOM。** Ref 和 CSS 变量就是两者之间干净的边界。

## 第 4 层：叠加效果与接触阴影

最后一层很便宜，效果却很大。每个动作可以挂上一个小小的装饰叠层：搜索时飘着浮尘、思考时有一个三点闪烁的思考泡泡、打招呼时八颗星光向外迸开、睡觉时冒出 `zzz`。它们只是普通的 `<span>`，用 CSS keyframes 做动画，并用 `--i` 索引错开时间：

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

它们放在角色元素**里面**，所以会跟着她一起摆动。它们是 `aria-hidden`、`pointer-events: none`，而且只在完整动态模式下才会挂上。

她脚下有一个柔和的径向渐变椭圆：**接触阴影**。这是最便宜的落地技巧。没有它，抠图的角色像浮在空中；有了它，她就站在某个东西上。演示多加了一个应用程序里没有的小细节：起伏把她抬高时，阴影会稍微变窄。

## 尊重“减少动态效果”

有些人看到不是自己要求的动态会头晕或想吐。操作系统会公开这个偏好，CSS 和 JavaScript 都都能读取：

```ts
const QUERY = "(prefers-reduced-motion: reduce)";
// React: subscribe with useSyncExternalStore so the value stays live.
```

聊天伙伴也有自己的设置：**full / reduced / off**，并和系统偏好结合：

```ts
export function effectiveMotion(preference: CompanionMotion, systemReduced: boolean): CompanionMotion {
  if (preference === "off") {
    return "off";
  }
  return systemReduced ? "reduced" : preference;
}
```

只要不是 `full`，就会停止 rAF 循环、冻结每个姿势的第一张帧、移除叠加效果，只保留静止倾角。CSS media query 再补一道，关掉 keyframe 动画。姿势仍然会改变，因为那是信息，不是装饰。

这页的演示遵守同样的规则。打开减少动态效果时，她会保持静止，旁边有一行小提示让你选择仍然播放动画；这是你自己做的选择，而不是替你决定。

## 限制，以及下一步

这个技巧有天花板。这里的一切都是**对一张平面图的刚体变换**：整张图像一张卡片一样平移和旋转。角度小的时候看不出来。把摆动推到 30°，她就不再像一个在转移重心的人，而像一张正在剥落的贴纸。±16° 的上限不是随便定的。

要让图本身弯曲，需要**网格变形**：

- **[Live2D Cubism](https://www.live2d.com/en/)** 把插画拆成分层的部件，用网格变形每一个部件，并由头部角度、眼睛开合、呼吸等参数驱动。它的呼吸参数，不意外地，也是一条正弦波。
- **[Spine](https://esotericsoftware.com/)** 是 2D 骨架动画：骨骼、加权网格，以及给网页和游戏引擎用的运行时。

两者都能做出丰富得多的动作，也都需要为它们准备美术：拆好的图层、绑定骨架，以及专用的编辑器。

如果想用弹簧又不想自己写，这些库说的正是你刚学到的语言：

- **[Motion](https://motion.dev/)**（前身是 Framer Motion）有 `type: "spring"` 的转场，用 `stiffness` 和 `damping` 设置。
- **[React Spring](https://www.react-spring.dev/)** 完全创建在弹簧物理上（`tension` 和 `friction`）。
- **[GSAP](https://gsap.com/)** 是时间轴与动作编排的标准，有物理和缓动插件。

当动画是产品的重要部分时，它们是正确的选择。对于聊天旁边的一个角色，50 行你完全看得懂、没有依赖需要更新的代码，也是一个好选择。

## 检查清单

- [ ] 每个动作准备一张插画，循环动作再加两张像素对齐的变化图。
- [ ] 切换前用 `img.decode()` 解码下一个姿势；用透明度交叉淡化。
- [ ] 微动帧以低帧率来回播放（1→2→3→2）。
- [ ] 连续动作由单一 `requestAnimationFrame` 循环驱动；限制时间步长；清理时取消；隐藏或滚出画面时暂停。
- [ ] 用两条周期不同的小正弦波呼吸；把摆动喂进弹簧的目标值。
- [ ] 用半隐式欧拉法积分弹簧，子步骤不超过 1/30 秒。
- [ ] 把拖拽速度（而不是拖拽距离）对应到倾斜；限制角度。
- [ ] 写 CSS 自定义属性；只动 `transform`；支点设在 `50% 100%`；闲置时拿掉 `will-change`。
- [ ] 尊重 `prefers-reduced-motion`，并给用户自己的动态设置。

## 参考资料

- [Apsor Archive on GitHub](https://github.com/AlexTrinityBlock/apsor-archive) — 聊天伙伴的源代码：`frontend/src/app/companion/`。
- [MDN: `requestAnimationFrame`](https://developer.mozilla.org/en-US/docs/Web/API/Window/requestAnimationFrame) — 时机、后台标签页与取消。
- [MDN: `HTMLImageElement.decode()`](https://developer.mozilla.org/en-US/docs/Web/API/HTMLImageElement/decode) — 显示前先解码。
- [MDN: `CSSStyleDeclaration.setProperty()`](https://developer.mozilla.org/en-US/docs/Web/API/CSSStyleDeclaration/setProperty) — 从脚本写入自定义属性。
- [MDN: `transform-origin`](https://developer.mozilla.org/en-US/docs/Web/CSS/transform-origin) 与 [`will-change`](https://developer.mozilla.org/en-US/docs/Web/CSS/will-change)。
- [MDN: `prefers-reduced-motion`](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion)。
- [MDN: Pointer events](https://developer.mozilla.org/en-US/docs/Web/API/Pointer_events) 与 [`touch-action`](https://developer.mozilla.org/en-US/docs/Web/CSS/touch-action) — 在触摸屏幕上拖拽。
- [web.dev: Stick to compositor-only properties](https://web.dev/articles/stick-to-compositor-only-properties-and-manage-layer-count) — 为什么 `transform` 和 `opacity` 很便宜。
- [Glenn Fiedler, "Integration Basics"](https://gafferongames.com/post/integration_basics/) — 显式与半隐式欧拉法，以弹簧为例。
- [Wikipedia: Limited animation](https://en.wikipedia.org/wiki/Limited_animation) 与 [Twelve basic principles of animation](https://en.wikipedia.org/wiki/Twelve_basic_principles_of_animation)。
