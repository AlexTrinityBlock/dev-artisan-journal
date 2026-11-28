---
title: "一張靜態插畫如何活起來：有限動畫與 50 行的彈簧"
description: "一堂寫給初學者的前端課，附一個可以拖曳的即時角色：動畫業「幾乎什麼都不動」的技巧、兩條呼吸正弦波、一個阻尼彈簧，以及為什麼整件事寫的是 CSS 變數而不是 React state。"
pubDate: 2026-11-28
category: "Web"
tags: ["動畫", "CSS", "requestAnimationFrame", "React", "無障礙", "Web"]
featured: false
author: "Alex.Hsiao"
readTime: "14 分鐘"
cardImage: "./cover.webp"
cardImageAlt: "Apsor Archive 聊天夥伴 Vellum 的三個姿勢，旁邊畫著呼吸正弦波與彈簧的過衝曲線"
---

# 一張靜態插畫如何活起來

[Apsor Archive](https://github.com/AlexTrinityBlock/apsor-archive) 的聊天夥伴是一個叫 Vellum 的小角色，站在對話旁邊。她每個動作只有一張圖，待機和思考各多了幾張幾乎一樣的影格；沒有骨架、沒有網格，也沒有動畫函式庫。可是看過的人都說她是「活的」。

這篇文章把這個效果拆開來看。先玩玩看：把她往旁邊拖、甩一下再放手，或者聚焦後用方向鍵。接著把圖層一層一層關掉，看看每一層各自貢獻了什麼。

<section class="lv-demo" data-lv-demo data-base="/images/limited-animation-spring/" data-pose-names="待機|思考|打招呼" data-motion="full" data-running="false" aria-labelledby="lv-demo-label">
  <div class="lv-demo-head">
    <span class="card-tag" id="lv-demo-label">LIVE DEMO // 00 · 一張插畫，三層動態</span>
    <span class="lv-demo-hint">拖曳 · 甩動 · ← → 方向鍵</span>
  </div>
  <div class="lv-demo-grid">
    <div class="lv-stage" data-lv-stage tabindex="0" role="group" aria-roledescription="可拖曳的角色" aria-label="Vellum，一個站立的角色。往旁邊拖曳或甩動她，或按左右方向鍵，讓她擺動。" data-pose="idle">
      <div class="lv-floor" aria-hidden="true"></div>
      <div class="lv-shadow" aria-hidden="true"></div>
      <div class="lv-figure" data-lv-figure>
        <div class="lv-body" data-lv-body></div>
        <div class="lv-fx" data-lv-fx aria-hidden="true"></div>
        <span class="lv-pivot" aria-hidden="true"></span>
      </div>
      <span class="lv-stage-tag" aria-hidden="true"><b>●</b> 支點 · TRANSFORM-ORIGIN 50% 100%</span>
    </div>
    <div class="lv-panel">
      <dl class="lv-readouts" aria-label="即時數值">
        <div class="lv-readout"><dt>擺動 SWAY</dt><dd data-lv-out="sway">+0.00°</dd></div>
        <div class="lv-readout"><dt>起伏 BOB</dt><dd data-lv-out="bob">+0.00 px</dd></div>
        <div class="lv-readout"><dt>彈簧目標</dt><dd data-lv-out="target">+0.00°</dd></div>
        <div class="lv-readout"><dt>拖曳速度</dt><dd><span data-lv-out="vx">+0.00</span><small>PX/MS</small></dd></div>
        <div class="lv-readout"><dt>影格</dt><dd data-lv-out="frame">1 / 3</dd></div>
        <div class="lv-readout"><dt>循環</dt><dd>1→2→3→2</dd></div>
      </dl>
      <div class="lv-trace-wrap">
        <canvas class="lv-trace" data-lv-trace aria-hidden="true"></canvas>
        <div class="lv-trace-legend"><span><i class="lv-key"></i>擺動（彈簧輸出）</span><span><i class="lv-key lv-key--target"></i>目標</span><span>最近 4 秒</span></div>
      </div>
      <div class="lv-controls">
        <button class="mono-btn-chamfer" type="button" data-lv-pose aria-label="切換姿勢"><span class="chamfer-inner"><span class="btn-tag">姿勢 //</span><span class="btn-label" data-lv-pose-label aria-live="polite">待機</span></span></button>
        <div class="lv-layers" role="group" aria-label="動畫圖層">
          <span class="lv-layers-label">圖層</span>
          <button class="lv-chip" type="button" data-lv-layer="frames" aria-pressed="true">FRAMES</button>
          <button class="lv-chip" type="button" data-lv-layer="breath" aria-pressed="true">BREATH</button>
          <button class="lv-chip" type="button" data-lv-layer="spring" aria-pressed="true">SPRING</button>
        </div>
      </div>
      <p class="lv-reduced" data-lv-reduced hidden>你的系統要求減少動態效果，所以角色保持靜止。<button type="button" data-lv-play-anyway aria-pressed="false">仍然播放動畫</button></p>
    </div>
  </div>
  <div class="lv-demo-foot">角色：VELLUM，出自 <a href="https://github.com/AlexTrinityBlock/apsor-archive">APSOR ARCHIVE</a> · 插畫為本專案生成 · 7 張 AVIF 影格，119 KB · 不用函式庫</div>
</section>

<script src="/js/limited-animation-demo.js" defer></script>

<p class="mfig-bridge">關掉 SPRING 再甩一次：角色會直接彈回去，不再擺盪。關掉 BREATH 等幾秒：她變成一張人物照片。關掉 FRAMES，你可能根本不會發現；這正是有限動畫的重點。</p>

<figure class="fig">
  <img src="/images/limited-animation-spring/overview.webp" alt="Vellum 的三個姿勢：被彈簧帶著傾斜的待機、帶有靜止傾角的思考，以及打招呼，每個姿勢都以腳下的金色圓圈為支點；旁邊是彈簧過衝曲線，以及兩條週期不同的呼吸正弦波" width="720" height="405" loading="lazy" />
  <figcaption><b>編輯示意圖</b> — 三張圖，一個支點。彈簧（stiffness 90、damping 9）大約過衝 18%，約一秒內靜止；兩條呼吸波的週期是 4.2 秒和 6.8 秒，很少同步。角色插畫：Vellum，為 Apsor Archive 生成。</figcaption>
</figure>

## 有限動畫：幾乎什麼都不動

迪士尼長片傳統的「完全動畫」每秒要把整個角色重畫很多次。日本的電視動畫負擔不起。1963 年《原子小金剛》每週播出時，製作團隊發展出一套以**有限動畫**為核心的做法：一張圖能停多久就停多久、能重複用就重複用，只動真正要動的部分。角色講話，常常是一張停格的圖配三種嘴型；戲劇性的一刻，常常是一張靜止的畫配上緩慢的鏡頭平移。

讓停格的圖不像照片的，是**次要動作**：頭髮飄起、外套落定、胸口起伏。經典動畫原則裡有兩條在講這件事。*Secondary action*（次要動作）是支撐主要動作的小動作。*Follow-through and overlapping action*（跟隨與重疊動作）說的是：身體停下之後，鬆散的部分還會繼續動，晚一點才停。

為什麼這麼少的動作就夠了？人的視覺非常擅長分辨活的身體和物體。完全靜止的人形是物體。一個以呼吸的尺度緩慢、連續、略帶不規則地移動的人形，看起來就是一個正在撐著自己站立的身體。被推一下之後像鐘擺一樣過衝，代表這個身體有重量。要傳達這兩件事，不需要新的圖，需要的是時機。

Vellum 的分層也是同樣的節省思路：

| 圖層 | 動的是什麼 | 成本 |
| :-- | :-- | :-- |
| **姿勢插畫** | 每個動作一張圖，切換時交叉淡化 | 每個動作一張圖 |
| **微動影格** | 三張幾乎一樣的影格，1→2→3→2 | 每個循環動作多兩張圖 |
| **程式化動作** | 呼吸的上下起伏與擺動、一個阻尼彈簧 | 大約 50 行 TypeScript |
| **疊加效果** | 浮塵、思考點點、星光、`zzz`、接觸陰影 | CSS keyframes |

## 第 1 層：每個動作一張插畫

每個動作都有自己的圖：待機、思考、打招呼、閱讀、睡覺等等。一份 manifest 把動作名稱對應到影格：

```json
"idle":     { "frames": ["idle.avif", "idle-2.avif", "idle-3.avif"], "fps": 4, "loop": true, "pingpong": true },
"greet":    { "frames": ["greet.avif"], "fps": 0, "loop": true },
"thinking": { "frames": ["thinking.avif", "thinking-2.avif", "thinking-3.avif"], "fps": 4, "loop": true, "pingpong": true }
```

換姿勢就是兩個疊在一起的 `<img>` 做 260 ms 的透明度交叉淡化。關鍵的細節是**先解碼，再切換**。設定 `img.src` 會開始下載和解碼。如果新圖還沒解碼完就切換圖層，瀏覽器會畫出一兩格的空白，角色就會閃一下。`HTMLImageElement.decode()` 會回傳一個 promise，在圖片可以無卡頓地繪製時 resolve：

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

播放器會等 `decodeFrames(clip.frames)` 完成才改變畫面，並用 `requestIdleCallback` 預熱接下來可能用到的姿勢。上面的示範也一樣：按下 POSE，新的圖要等所有影格都準備好才會出現。

## 第 2 層：三張像素對齊的影格，來回播放

待機和思考的循環各有三張影格。它們是**像素對齊**的：同樣的畫布大小、同樣的定位，腳和身體在完全相同的位置。只有小區域不同，例如一縷頭髮、披風的邊緣、袖子的一道摺痕。所以切換影格時角色永遠不會跳動，只有鬆散的部分在微微閃動。

三張影格如果照 1→2→3→1 播放，在繞回開頭時會跳一下。改成**來回播放**（ping-pong），1→2→3→2→1，每一次切換都只發生在相鄰的兩張之間：

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

每秒 4 格比電視動畫常見的每秒 8 張（24 fps 下「一拍三」）還慢。它不需要快。流暢的動作來自下一層；影格只負責增加質感。

## 一個時鐘：`requestAnimationFrame`

流暢的動作需要一個函式，在每一個顯示影格執行一次，把所有東西移動一點點。這個函式就是 `requestAnimationFrame` 迴圈。

為什麼不用 `setInterval(tick, 16)`？

- **它沒有和螢幕同步。** 16 ms 的計時器會和 16.67 ms 的更新週期互相漂移，所以有些影格更新兩次、有些一次都沒有，看起來就是抖動。在 120 Hz 的螢幕上更是直接錯誤。
- **沒人在看時它還在跑。** `requestAnimationFrame` 的回呼在背景分頁和隱藏的 iframe 裡會停止，等於免費省電。
- **它給你精確的時間戳。** 回呼會收到這一格的時間，你可以精確算出過了多久，然後只移動那麼多。

聊天夥伴的迴圈，出自 `CompanionStage.tsx`：

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

有四個習慣值得照抄：

1. **限制時間步長。** `Math.min(0.1, …)` 代表一個被隱藏了一分鐘的分頁回來時只前進 100 ms，而不是 60 秒。
2. **檢查可見性。** 瀏覽器本來就會節流隱藏的分頁；明確的檢查讓意圖更清楚，也能在嵌入的畫面裡省下工作。
3. **記得清理。** effect 回傳 `cancelAnimationFrame(frame)`。少了它，每次換姿勢都會多開一個迴圈，換十次就有十個迴圈在搶同一個元素。
4. **不在崗位時就暫停。** 聊天夥伴被隱藏或最小化時 `active` 是 false，迴圈根本不會執行。這頁的示範用 `IntersectionObserver` 做同一件事：捲出畫面，迴圈就停。

老實補充一點：在應用程式裡，每秒 4 格的影格切換用的是普通的 `setInterval`，因為那是離散、低頻率的步進，幾毫秒的漂移完全看不出來。真正需要 `requestAnimationFrame` 的是連續的動作。示範則用同一個 rAF 時鐘驅動兩者，這樣也沒問題。

## 呼吸：兩條永遠對不齊的正弦波

呼吸函式只有四行三角函數：

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

每個數字都有理由：

- **4.2 秒**大約是每分鐘 14 次呼吸，落在成人靜止時的正常範圍內。
- **±2.2 px** 對一個大約 300 px 高的角色來說，不到身高的百分之一。你感覺到的是生命，不是移動。
- **±1.1°** 的擺動更小。那是一個人站著時的重心轉移，不是在跳舞。
- **6.8 秒**是關鍵。如果擺動和起伏的週期相同，兩者會一起升一起降，角色每 4.2 秒畫出同一個小圈，像節拍器。週期不同，組合起來就一直在變。
- **+0.9 弧度**的相位，讓兩條波不會在頁面載入時同時從零開始。

嚴格來說，4.2 和 6.8 並不是不可公度的：它們的比是 21:34，所以組合起來的圖樣每 142.8 秒會重複一次。這已經夠了。沒有人會盯著一個待機的角色看兩分半，然後發現它重複了。如果想要真的不重複，可以用無理數比例，例如黃金比例，或是再加第三條更慢的波。

注意上面迴圈裡 `breath.sway` 去了哪裡：它被**加到彈簧的目標值**，而不是直接寫到畫面上。呼吸和拖曳經過同一個彈簧，所以每一次角度變化都是平滑的。

## 彈簧：50 行物理

一個彈簧有三樣東西：它在哪裡（`value`）、它動得多快（`velocity`）、它想去哪裡（`target`）。每一步都有兩個力作用在它身上：

$$
a = -k\,(x - x_{\text{target}}) - c\,v
$$

第一項把它拉向目標，離得越遠拉得越用力（虎克定律，剛性 $k$）。第二項抵抗運動，動得越快阻力越大（阻尼 $c$）。質量設為 1，力就等於加速度。整個檔案如下：

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

### 半隱式歐拉法：兩行程式的順序

看迴圈的內容。它先更新 `velocity`，再用**新的**速度移動 `value`。這個順序叫做**半隱式**（或辛）歐拉法。如果把兩行對調，用舊的速度移動，就變成顯式歐拉法，每一步都會多加一點能量。沒有阻尼時，顯式歐拉法的彈簧會越擺越大，直到飛出畫面。半隱式歐拉法能讓無阻尼振盪器的能量維持有界，所以只要步長夠小就是穩定的。

「夠小」是 `MAX_STEP_SECONDS = 1/30` 的工作。如果瀏覽器卡了 200 ms，而你一步就積分完這段時間，連半隱式版本也會爆掉：我實際跑過，用 200 ms 的步長跑八秒之後，數值大約是 $10^{23}$。把一個長影格切成每段不超過 33 ms 的子步驟，只多幾次乘法，就消除了這個問題。

### stiffness 90、damping 9 是什麼手感

任何彈簧都可以用兩個推導出來的數字描述：

- **自然頻率** $\omega_0 = \sqrt{k} = \sqrt{90} \approx 9.5$ rad/s，大約每秒擺 1.5 次。
- **阻尼比** $\zeta = c / (2\sqrt{k}) = 9 / 19 \approx 0.47$。

阻尼比小於 1 就是**欠阻尼**：彈簧會衝過目標再擺回來。0.47 時第一次過衝大約是位移的 18%，第二次幾乎看不見，大約一秒內就靜止。以 60 fps 模擬，從 16° 放開會衝到另一側的 2.7°，1.03 秒後就在靜止位置的 5% 以內。這就是你甩角色時看到的鐘擺。

`DOCK_SPRING`（stiffness 170、damping 22）的 $\zeta \approx 0.84$，接近臨界阻尼。它把聊天夥伴穩穩地送回停靠位置，看不出回彈。同樣的程式，不同的手感；示範在你拖曳之後用它把角色帶回舞台中央。

### 拖曳速度變成傾斜

`swayForVelocity` 把指標的水平速度轉成目標角度：每 px/ms 對應 −14°，限制在 ±16°。負號很重要。往右拖，角色的上半身會往左傾，因為腳是支點，上半身跟不上移動，就像直立拿著一把雨傘甩動。速度取自最近 90 ms 的指標取樣，所以傾斜跟著手的速度，而不是總距離。

放手時速度歸零，目標值彈回靜止傾角加上呼吸，剩下的交給彈簧：過衝、擺回、靜止。那一刻沒有人寫任何動畫曲線，它是物理自然算出來的。

## 套用：用 CSS 變數，不用 React state

迴圈從不呼叫 `setState`。它直接在角色元素上寫兩個 CSS 自訂屬性：

```ts
figure.style.setProperty("--companion-sway", `${sway.value.toFixed(2)}deg`);
figure.style.setProperty("--companion-bob", `${bob.toFixed(2)}px`);
```

再由一條 CSS 規則把它們變成 transform：

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

這條規則裡包了三個決定。

**`transform-origin: 50% 100%` 把支點放在腳底。** 預設的原點是元素中心，一個繞著腰旋轉的角色看起來像一塊插在釘子上轉的紙板。繞著底部中央旋轉，她就會像站著的人一樣傾斜。示範裡的金色圓圈標出的就是這個點；它保持不動，上面的一切都在動。

**只有 `transform` 在變。** 瀏覽器的渲染分幾個階段：style、layout、paint、composite。改 `width` 或 `top` 會觸發 layout 和重新繪製。改 `transform`（或 `opacity`）可以只交給合成器處理，在 GPU 上移動一張已經畫好的圖層。`will-change: transform` 請瀏覽器事先給角色一張自己的圖層，讓動作的第一格不必付出提升圖層的成本。動畫關閉時，`will-change` 會改回 `auto`，不白白佔著圖層。

**React 完全不知道這些事。** 在 60 fps 下，`setState` 會要求 React 每秒重新渲染舞台 60 次：執行元件、比對虛擬 DOM、提交，而且是在旁邊正在串流聊天回覆的同一條主執行緒上。寫一個 CSS 變數只花一個元素的一次樣式重算。React 只有在姿勢改變時才渲染舞台，一分鐘也就幾次。

經驗法則：**會改變頁面上「有什麼」的東西用 React state；每一格只改變「在哪裡」的東西直接寫 DOM。** Ref 和 CSS 變數就是兩者之間乾淨的邊界。

## 第 4 層：疊加效果與接觸陰影

最後一層很便宜，效果卻很大。每個動作可以掛上一個小小的裝飾疊層：搜尋時飄著浮塵、思考時有一個三點閃爍的思考泡泡、打招呼時八顆星光向外迸開、睡覺時冒出 `zzz`。它們只是普通的 `<span>`，用 CSS keyframes 做動畫，並用 `--i` 索引錯開時間：

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

它們放在角色元素**裡面**，所以會跟著她一起擺動。它們是 `aria-hidden`、`pointer-events: none`，而且只在完整動態模式下才會掛上。

她腳下有一個柔和的徑向漸層橢圓：**接觸陰影**。這是最便宜的落地技巧。沒有它，去背的角色像浮在空中；有了它，她就站在某個東西上。示範多加了一個應用程式裡沒有的小細節：起伏把她抬高時，陰影會稍微變窄。

## 尊重「減少動態效果」

有些人看到不是自己要求的動態會頭暈或想吐。作業系統會公開這個偏好，CSS 和 JavaScript 都讀得到：

```ts
const QUERY = "(prefers-reduced-motion: reduce)";
// React: subscribe with useSyncExternalStore so the value stays live.
```

聊天夥伴也有自己的設定：**full / reduced / off**，並和系統偏好結合：

```ts
export function effectiveMotion(preference: CompanionMotion, systemReduced: boolean): CompanionMotion {
  if (preference === "off") {
    return "off";
  }
  return systemReduced ? "reduced" : preference;
}
```

只要不是 `full`，就會停止 rAF 迴圈、凍結每個姿勢的第一張影格、移除疊加效果，只保留靜止傾角。CSS media query 再補一道，關掉 keyframe 動畫。姿勢仍然會改變，因為那是資訊，不是裝飾。

這頁的示範遵守同樣的規則。開啟減少動態效果時，她會保持靜止，旁邊有一行小提示讓你選擇仍然播放動畫；這是你自己做的選擇，而不是替你決定。

## 限制，以及下一步

這個技巧有天花板。這裡的一切都是**對一張平面圖的剛體變換**：整張圖像一張卡片一樣平移和旋轉。角度小的時候看不出來。把擺動推到 30°，她就不再像一個在轉移重心的人，而像一張正在剝落的貼紙。±16° 的上限不是隨便定的。

要讓圖本身彎曲，需要**網格變形**：

- **[Live2D Cubism](https://www.live2d.com/en/)** 把插畫拆成分層的部件，用網格變形每一個部件，並由頭部角度、眼睛開合、呼吸等參數驅動。它的呼吸參數，不意外地，也是一條正弦波。
- **[Spine](https://esotericsoftware.com/)** 是 2D 骨架動畫：骨骼、加權網格，以及給網頁和遊戲引擎用的執行環境。

兩者都能做出豐富得多的動作，也都需要為它們準備美術：拆好的圖層、綁定骨架，以及專用的編輯器。

如果想用彈簧又不想自己寫，這些函式庫說的正是你剛學到的語言：

- **[Motion](https://motion.dev/)**（前身是 Framer Motion）有 `type: "spring"` 的轉場，用 `stiffness` 和 `damping` 設定。
- **[React Spring](https://www.react-spring.dev/)** 完全建立在彈簧物理上（`tension` 和 `friction`）。
- **[GSAP](https://gsap.com/)** 是時間軸與動作編排的標準，有物理和緩動外掛。

當動畫是產品的重要部分時，它們是正確的選擇。對於聊天旁邊的一個角色，50 行你完全看得懂、沒有依賴需要更新的程式，也是一個好選擇。

## 檢查清單

- [ ] 每個動作準備一張插畫，循環動作再加兩張像素對齊的變化圖。
- [ ] 切換前用 `img.decode()` 解碼下一個姿勢；用透明度交叉淡化。
- [ ] 微動影格以低幀率來回播放（1→2→3→2）。
- [ ] 連續動作由單一 `requestAnimationFrame` 迴圈驅動；限制時間步長；清理時取消；隱藏或捲出畫面時暫停。
- [ ] 用兩條週期不同的小正弦波呼吸；把擺動餵進彈簧的目標值。
- [ ] 用半隱式歐拉法積分彈簧，子步驟不超過 1/30 秒。
- [ ] 把拖曳速度（而不是拖曳距離）對應到傾斜；限制角度。
- [ ] 寫 CSS 自訂屬性；只動 `transform`；支點設在 `50% 100%`；閒置時拿掉 `will-change`。
- [ ] 尊重 `prefers-reduced-motion`，並給使用者自己的動態設定。

## 參考資料

- [Apsor Archive on GitHub](https://github.com/AlexTrinityBlock/apsor-archive) — 聊天夥伴的原始碼：`frontend/src/app/companion/`。
- [MDN: `requestAnimationFrame`](https://developer.mozilla.org/en-US/docs/Web/API/Window/requestAnimationFrame) — 時機、背景分頁與取消。
- [MDN: `HTMLImageElement.decode()`](https://developer.mozilla.org/en-US/docs/Web/API/HTMLImageElement/decode) — 顯示前先解碼。
- [MDN: `CSSStyleDeclaration.setProperty()`](https://developer.mozilla.org/en-US/docs/Web/API/CSSStyleDeclaration/setProperty) — 從腳本寫入自訂屬性。
- [MDN: `transform-origin`](https://developer.mozilla.org/en-US/docs/Web/CSS/transform-origin) 與 [`will-change`](https://developer.mozilla.org/en-US/docs/Web/CSS/will-change)。
- [MDN: `prefers-reduced-motion`](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion)。
- [MDN: Pointer events](https://developer.mozilla.org/en-US/docs/Web/API/Pointer_events) 與 [`touch-action`](https://developer.mozilla.org/en-US/docs/Web/CSS/touch-action) — 在觸控螢幕上拖曳。
- [web.dev: Stick to compositor-only properties](https://web.dev/articles/stick-to-compositor-only-properties-and-manage-layer-count) — 為什麼 `transform` 和 `opacity` 很便宜。
- [Glenn Fiedler, "Integration Basics"](https://gafferongames.com/post/integration_basics/) — 顯式與半隱式歐拉法，以彈簧為例。
- [Wikipedia: Limited animation](https://en.wikipedia.org/wiki/Limited_animation) 與 [Twelve basic principles of animation](https://en.wikipedia.org/wiki/Twelve_basic_principles_of_animation)。
