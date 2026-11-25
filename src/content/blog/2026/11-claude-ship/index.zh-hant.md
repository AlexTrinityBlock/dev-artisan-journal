---
title: "Claude Ship 與代理編碼的最後一哩"
description: "Claude Ship 把拉取請求拆成三種權力：Code Review 找問題、PR Steward 修問題、Claude Approvals 做決定。真正有趣的是政策邊界，不是補丁。"
pubDate: 2026-11-25
category: "AI"
tags: ["Claude Ship", "程式碼審查", "AI 代理", "CI", "治理"]
featured: false
author: "Alex.Hsiao"
readTime: "12 分鐘"
---

# Claude Ship 與代理編碼的最後一哩

## 審查瓶頸

代理開一個拉取請求的速度，比人讀完它還快。這個不對稱，就是問題的新形狀。

當寫程式是慢的那一端，審查可以是工作結束時的檢查點。當生成變便宜，審查就成了吞吐量的上限，拉取請求則變成一條佇列。佇列不只是延遲。每一項都要付一次情境切換的代價：重新載入 diff、重建意圖、檢查測試、想起服務在邊界上做什麼。代理寫的 PR 還多一種劣勢：審查者不是作者，所以第一次讀就是唯一一次讀。

Anthropic 的說法很直接：在 Claude Code 團隊，大多數程式碼由 Claude 寫，PR 之後的每一件事都必須用同樣的速度前進。這就是 Claude Ship 的產品主張。它在 2026 年 11 月 23 日發布，beta，在 Claude Team 與 Enterprise 方案提供，支援 GitHub 上的儲存庫。真正的問題不是它能不能審 diff，而是團隊怎麼處理緊接在後的那個決定。

多數對 PR 迴圈的描述，把三件不同的事壓在一個人身上：找問題、修問題、決定合併。這三件事的失敗方式不同。審查者可以很徹底但很慢。修復者可以很快但很樂觀。核准者可以很小心，卻仍然判斷錯。把它們綁在一起，就代表那個希望補丁過關的人，同時也是簽核的人；這是我們在人類身上容忍的利害衝突，因為責任有名字可以追。

<section class="mfig-lead">
  <div class="mfig-lead-head">
    <span class="card-tag">CLAUDE SHIP // 00</span>
    <p class="mfig-lead-kicker">Claude Ship 把拉取請求拆成三種權力。真正值得治理的是合併決定。</p>
    <h3 class="mfig-lead-title">審查找問題。Steward 修問題。Approvals 做決定。</h3>
    <p class="mfig-lead-sub">一個迴圈、三個角色，和一份能說不的政策檔。</p>
  </div>
  <div class="mfig-lead-grid">
    <div class="mfig-card">
      <div class="mfig-icon"><svg class="mfig-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg></div>
      <div class="mfig-tag">CODE REVIEW // 找問題</div>
      <h4>發現問題，不是下判決</h4>
      <p>多角度審查、對抗式驗證，把分類後的發現貼回 PR。</p>
      <div class="mfig-meta">QUICK · STANDARD · DEEP</div>
    </div>
    <div class="mfig-arrow" aria-hidden="true">→</div>
    <div class="mfig-card">
      <div class="mfig-icon"><svg class="mfig-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 1 1 7.94-7.94l-3.76 3.76z"/></svg></div>
      <div class="mfig-tag">PR STEWARD // 修問題</div>
      <h4>修復，但不拿鑰匙</h4>
      <p>CI、衝突與回饋。每次推送都說明改了什麼、怎麼還原。</p>
      <div class="mfig-meta">CI · 衝突 · @CLAUDE STOP</div>
    </div>
    <div class="mfig-arrow" aria-hidden="true">→</div>
    <div class="mfig-card">
      <div class="mfig-icon"><svg class="mfig-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/></svg></div>
      <div class="mfig-tag">CLAUDE APPROVALS // 做決定</div>
      <h4>有紀錄的決定</h4>
      <p>儲存庫的政策讀取發現與分類器，然後放行、要求人工，或阻擋。</p>
      <div class="mfig-meta">政策檔 · 訊號 · 觀察</div>
    </div>
  </div>
  <div class="mfig-lead-flow mfig-scroll">
  <svg class="mfig-svg" viewBox="0 0 840 128" role="img" aria-labelledby="ship-lead-title ship-lead-desc">
    <title id="ship-lead-title">Claude Ship 的迴圈</title>
    <desc id="ship-lead-desc">拉取請求開啟後，Code Review 找問題，PR Steward 修問題，儲存庫政策被評估，然後變更合併。沒有角色同時握有兩種權力。</desc>
    <defs>
      <marker id="ship-arrow" viewBox="0 0 5 5" refX="4.4" refY="2.5" markerWidth="5" markerHeight="5" markerUnits="userSpaceOnUse" orient="auto"><path d="M0 0 L5 2.5 L0 5 z" fill="var(--mono-ink)"/></marker>
    </defs>
    <text x="24" y="16" class="f" font-size="7.5" letter-spacing="1.2">迴圈 // 從 PR 到合併</text>
    <text x="816" y="16" class="f" font-size="7.5" text-anchor="end" letter-spacing="1">一份政策</text>
    <line x1="24" y1="24" x2="816" y2="24" class="rule"/>
    <rect x="32" y="38" width="128" height="50" class="term"/>
    <text x="44" y="52" class="f" font-size="6" letter-spacing="0.6">01</text>
    <text x="44" y="66" class="t" font-size="9.5" font-weight="800">PR</text>
    <text x="44" y="78" class="m" font-size="6.2">已開啟</text>
    <line x1="160" y1="63" x2="192" y2="63" class="arrow" marker-end="url(#ship-arrow)"/>
    <rect x="196" y="38" width="128" height="50" class="box"/>
    <text x="208" y="52" class="f" font-size="6" letter-spacing="0.6">02</text>
    <text x="208" y="66" class="t" font-size="9.5" font-weight="800">REVIEW</text>
    <text x="208" y="78" class="m" font-size="6.2">找問題</text>
    <line x1="324" y1="63" x2="356" y2="63" class="arrow" marker-end="url(#ship-arrow)"/>
    <rect x="360" y="38" width="128" height="50" class="box"/>
    <text x="372" y="52" class="f" font-size="6" letter-spacing="0.6">03</text>
    <text x="372" y="66" class="t" font-size="9.5" font-weight="800">FIX</text>
    <text x="372" y="78" class="m" font-size="6.2">STEWARD</text>
    <line x1="488" y1="63" x2="520" y2="63" class="arrow" marker-end="url(#ship-arrow)"/>
    <rect x="524" y="38" width="128" height="50" class="codebox"/>
    <text x="536" y="52" class="f" font-size="6" letter-spacing="0.6">04</text>
    <text x="536" y="66" class="t" font-size="9.5" font-weight="800">POLICY</text>
    <text x="536" y="78" class="m" font-size="6.2">檔案</text>
    <line x1="652" y1="63" x2="684" y2="63" class="arrow" marker-end="url(#ship-arrow)"/>
    <rect x="688" y="38" width="128" height="50" class="term"/>
    <text x="700" y="52" class="f" font-size="6" letter-spacing="0.6">05</text>
    <text x="700" y="66" class="t" font-size="9.5" font-weight="800">MERGE</text>
    <text x="700" y="78" class="m" font-size="6.2">決定</text>
    <text x="420" y="108" class="f" font-size="6.4" text-anchor="middle" letter-spacing="0.6">沒有角色同時握有兩種權力</text>
    <text x="420" y="120" class="f" font-size="6.2" text-anchor="middle">STEWARD 不能核准 · APPROVALS 不能改程式碼</text>
  </svg>
  </div>
  <p class="mfig-lead-note"><b>分工才是重點。</b>修 PR 的代理，明確不被允許核准或合併 PR。</p>
</section>

<p class="mfig-bridge">接下來要談的就是這個分工：它為什麼存在、權限邊界在哪裡、政策檔該有什麼內容，以及 Anthropic 自家團隊的數字證明了什麼、又沒證明什麼。</p>

## Claude Ship 是什麼：一個迴圈，三種角色

Claude Ship 不是新模型，也不是新編輯器。它是三個代理圍著拉取請求組起來的系統。Code Review 已經正式可用（GA）。PR Steward 與 Claude Approvals 是兩個 beta 代理。三者一起賣，掛在 Claude Team 與 Enterprise 方案，只支援 GitHub 上的儲存庫。

**Code Review 找問題。** 它會拿 PR 對照程式碼庫，用多個視角做深入審查。它收集發現、對抗式地驗證、分類，然後貼到 PR 上。每個儲存庫可以選 Quick、Standard 或 Deep 審查等級。對抗式驗證這一步很重要：一個在被試圖推翻後仍站得住的發現，比一串看似合理的疑慮有用。

**PR Steward 修問題。** 它想辦法讓 PR 維持綠燈，而且被設計成不能核准或合併。它處理失敗的 CI 檢查、合併衝突，以及來自 Code Review、其他審查工具或團隊成員的審查回饋。每次推送後，它會留言說明改了什麼、怎麼還原。開發者可以留言 `@claude` 下指令來調整方向，或 `@claude stop` 讓它停手。

**Claude Approvals 做決定。** 它套用一份寫在儲存庫裡的核准政策，Anthropic 形容它像「更聰明的 CODEOWNERS 檔」。若政策允許，它可以自行核准例行變更；若政策要求，它也可以針對特定情境要求更深的人工簽核。訊號可以包含 Code Review 的發現，或團隊用自然語言寫的自訂分類器。Anthropic 建議先開觀察模式，再讓分支保護要求它的綠燈。

把三個角色當成系統來看，它們不是一條管線，而是一個帶閘門的迴圈。Steward 的推送改變 diff，diff 改變發現，發現再改變政策是否放行。迴圈裡唯一穩定的物件是政策，所以它放在儲存庫，而不是某個設定頁面。

角色是依權限切的，不是依任務切的。審查產生主張。Steward 產生 commit。Approvals 產生決定。只有一個角色能說 yes，而它不能寫程式。每個角色都可能出錯，但沒辦法把錯誤藏進另一個角色的輸出裡。

<figure class="mfig-fig">
  <figcaption>
    <span class="card-tag">三角色迴圈 // 01</span>
    <h3 class="mfig-fig-title">一個迴圈、三個角色、兩道禁令</h3>
    <p class="mfig-fig-sub">Code Review 產生發現，PR Steward 推修復，Claude Approvals 讀政策與訊號。修復者不能核准；核准者不能改程式碼。</p>
  </figcaption>
  <div class="mfig-scroll">
  <svg class="mfig-svg" viewBox="0 0 840 400" role="img" aria-labelledby="ship-f1-title ship-f1-desc">
    <title id="ship-f1-title">三角色迴圈</title>
    <desc id="ship-f1-desc">拉取請求開啟後由 Code Review 審查，發現交給 PR Steward，由它修復 CI 失敗、衝突與回饋，並把 commit 推回 PR。Claude Approvals 評估政策檔與來自審查和儲存庫的訊號，然後合併或要求人工簽核。PR Steward 不能核准或合併；Claude Approvals 不能改程式碼。</desc>
    <defs>
      <marker id="ship-f1-arrow" viewBox="0 0 5 5" refX="4.4" refY="2.5" markerWidth="5" markerHeight="5" markerUnits="userSpaceOnUse" orient="auto"><path d="M0 0 L5 2.5 L0 5 z" fill="var(--mono-ink)"/></marker>
    </defs>
    <text x="24" y="18" class="f" font-size="7.5" letter-spacing="1.2">三種角色 // 三種權力</text>
    <text x="816" y="18" class="f" font-size="7.5" text-anchor="end" letter-spacing="1">一個合併決定</text>
    <line x1="24" y1="26" x2="816" y2="26" class="rule"/>
    <rect x="24" y="54" width="136" height="78" class="term"/>
    <text x="36" y="72" class="f" font-size="6.4" letter-spacing="0.7">輸入</text>
    <text x="36" y="92" class="t" font-size="9.2" font-weight="800">PR 已開啟</text>
    <text x="36" y="106" class="m" font-size="6.2">diff · 意圖 · 測試</text>
    <text x="36" y="118" class="f" font-size="6">開發者或 /ship</text>
    <line x1="160" y1="93" x2="192" y2="93" class="arrow" marker-end="url(#ship-f1-arrow)"/>
    <rect x="196" y="54" width="198" height="78" class="box"/>
    <text x="208" y="72" class="f" font-size="6.4" letter-spacing="0.7">CODE REVIEW // 找問題</text>
    <text x="208" y="92" class="t" font-size="9.2" font-weight="800">多角度審查</text>
    <text x="208" y="106" class="m" font-size="6.2">收集 · 驗證 · 分類</text>
    <text x="208" y="118" class="f" font-size="6">把發現貼回 PR</text>
    <line x1="394" y1="93" x2="516" y2="93" class="arrow" marker-end="url(#ship-f1-arrow)"/>
    <text x="455" y="84" class="f" font-size="6" text-anchor="middle">發現</text>
    <rect x="520" y="54" width="182" height="78" class="term"/>
    <text x="532" y="72" class="f" font-size="6.4" letter-spacing="0.7">CLAUDE APPROVALS // 做決定</text>
    <text x="532" y="92" class="t" font-size="9.2" font-weight="800">政策 + 訊號</text>
    <text x="532" y="106" class="m" font-size="6.2">放行 · 詢問 · 阻擋</text>
    <text x="532" y="118" class="f" font-size="6">不能改程式碼</text>
    <line x1="702" y1="93" x2="726" y2="93" class="arrow" marker-end="url(#ship-f1-arrow)"/>
    <rect x="730" y="54" width="86" height="78" class="codebox"/>
    <text x="773" y="86" class="t" font-size="9" font-weight="800" text-anchor="middle">MERGE</text>
    <text x="773" y="100" class="m" font-size="6" text-anchor="middle">或人工</text>
    <text x="773" y="112" class="f" font-size="6" text-anchor="middle">簽核</text>
    <line x1="295" y1="132" x2="295" y2="244" class="arrow" marker-end="url(#ship-f1-arrow)"/>
    <text x="303" y="176" class="f" font-size="6.2">發現</text>
    <text x="303" y="188" class="f" font-size="6.2">+ 回饋</text>
    <rect x="196" y="248" width="198" height="92" class="box"/>
    <text x="208" y="266" class="f" font-size="6.4" letter-spacing="0.7">PR STEWARD // 修問題</text>
    <text x="208" y="286" class="t" font-size="9.2" font-weight="800">讓 PR 維持綠燈</text>
    <text x="208" y="300" class="m" font-size="6.2">CI · 衝突 · 審查回饋</text>
    <text x="208" y="312" class="f" font-size="6">每次推送後留言</text>
    <text x="208" y="324" class="f" font-size="6">改了什麼 · 怎麼還原</text>
    <path d="M196 292 H176 V120 H160" class="dash" fill="none" marker-end="url(#ship-f1-arrow)"/>
    <text x="84" y="156" class="f" font-size="6">推送 + 還原說明</text>
    <text x="84" y="168" class="f" font-size="6">@claude / @claude stop</text>
    <path d="M394 292 H462 V112 H516" class="arrow" fill="none" marker-end="url(#ship-f1-arrow)"/>
    <text x="470" y="196" class="f" font-size="6">綠燈</text>
    <text x="470" y="208" class="f" font-size="6">+ DIFF</text>
    <line x1="611" y1="132" x2="611" y2="196" class="arrow" marker-end="url(#ship-f1-arrow)"/>
    <rect x="520" y="200" width="182" height="64" class="box"/>
    <text x="532" y="218" class="f" font-size="6.4" letter-spacing="0.7">政策要求時</text>
    <text x="532" y="238" class="t" font-size="8.6" font-weight="800">人工簽核</text>
    <text x="532" y="252" class="m" font-size="6.2">由人決定</text>
    <line x1="196" y1="356" x2="816" y2="356" class="rule-soft"/>
    <text x="196" y="372" class="f" font-size="6.4">✕ PR STEWARD 不能核准或合併</text>
    <text x="520" y="372" class="f" font-size="6.4">✕ CLAUDE APPROVALS 不能改程式碼</text>
  </svg>
  </div>
  <p class="mfig-fig-src">審查找問題 · STEWARD 修問題 · APPROVALS 做決定 · 沒有角色同時握有兩種權力</p>
</figure>

## 權力分立

PR Steward 的禁令，是這份公告裡最有趣的一行。修復代理被優化成讓檢查通過。那是一個替代目標，對修復者來說是好的目標；對核准者來說，這是錯的目標。核准者要問的不是「能不能讓它變綠」，而是「這個改變該不該存在於 main」。當變更越危險，這兩個問題的分歧就越大。

還有一個認識論上的理由。如果同一個模型既找問題又修問題，「沒有發現」就會變得曖昧。它可能代表程式碼乾淨，也可能代表找問題的人和修問題的人有同一個盲點。把決定分開，不會消除盲點，但它會強迫決定對著一條規則做，而不是對著模型自己「做完了」的信心做。

政策是儲存庫裡的一個檔案。這個選擇承載了大部分的治理價值：

- **有版本。** 每一次規則變動都是一個有作者、有日期的 diff。
- **可審查。** 政策可以走它自己管轄的那套 PR 流程。
- **有範圍。** 一個儲存庫可以比隔壁嚴格，不需要中央核准的例外。
- **可讀。** 開發者可以讀到一個變更為什麼被放行或被留住。

Anthropic 說它像「更聰明的 CODEOWNERS 檔」。這個比喻有用，但你要保留正確的那一半。CODEOWNERS 回答一個狹窄的問題：這條路徑誰必須審？它是確定性的、依路徑的，而且失敗時預設拒絕。如果擁有者不存在，或檔案格式損壞，審查要求就無法滿足，合併只能等。Claude Approvals 的政策回答更大的問題：這個變更能不能不經人工就合併？它看內容、看發現、看分類器，不只路徑。「更聰明」的部分是條件判斷；真正該保留的是失敗模式：當政策不存在、語意不清或失效時，結果應該是人工，而不是合併。

這就是為什麼遞迴很重要。政策管 PR，而改政策本身也是一個 PR。原則上這很優雅：規則透過它約束的流程來改變。實務上這創造了一個明顯的攻擊面。能改政策的代理，就能替自己擴權。沒有被保護的政策檔不是控制，只是建議。不管檔案叫什麼名字，它都需要一個擁有者、一項人工審查要求，以及一條明確規則：對它的變更永遠不能自動核准。

最後一個性質，才讓這個設計成為治理模式，而不只是工作流：政策能說不。它可以放行例行變更、要求人工處理有後果的變更，或直接阻擋。只能說 yes 的政策，是一枚蓋了 schema 的橡皮圖章。

## 兩個入口，同一條權限邊界

Claude Ship 有兩個入口，針對不同的人。

對開發者，是 Claude Code 裡的 `/ship`。變更準備好時，開發者執行指令。Claude 推送變更、開 PR、審查，並處理回饋與失敗的檢查，幫它走到可合併的狀態。實際能不能合併，取決於開發者的權限與儲存庫的分支規則。

對管理員或工程主管，是整個儲存庫的自動化。替一個儲存庫開啟 Claude Ship，它就會在團隊的 PR 上自動工作，不需要任何人手動呼叫 `/ship`。管理員可以逐儲存庫開啟 Code Review 與 PR Steward。當連接的儲存庫在預設分支上有政策檔時，Claude Approvals 就會啟動，管理員也可以把它關掉。每個儲存庫有自己的審查等級、審查時機與支出上限。系統與既有的分支保護和必要檢查一起運作。

最值得注意的一致之處是：指令是方便，不是權限。`/ship` 不會給代理開發者原本沒有的權限。它只是縮短「變更準備好了」到「迴圈開始跑」之間的距離。儲存庫層級的路徑也不是另一套比較寬鬆的系統；它只是讓每個開發者不必記得要打這個指令。

底下有兩層授權，不該混在一起。開發者授權的是推送與修復的動作，邊界是自己的權限。管理員授權的是核准的動作，邊界是政策與分支保護。`/ship` 屬於第一層。Claude Approvals 屬於第二層。開發者不能靠執行指令擴大第二層，管理員也不能靠寫政策擴大第一層。這就是權限邊界，兩個入口都一樣。

## 政策即程式碼

Anthropic 的建議是從觀察模式開始，這個建議有理，但理由很容易被忽略。政策是一個關於「哪些變更算例行」的假設。在你拿真實 PR 跑過之前，你不會知道假設對不對。觀察模式就是實驗：Claude Approvals 評估每個 PR，記下它「本來會怎麼做」，分支保護不變，人還是要合併。

政策可用的訊號分成不同種類。Code Review 的發現是結構化證據：嚴重度、類別、位置、驗證狀態。自訂分類器是由模型評估的自然語言規則。分支保護與必要檢查是強制層，不是判斷。好的政策會把這些類別分開。能用確定的路徑與大小規則時就用；發現可靠時就用發現；只有當規則無法寫成述詞時，才用模型分類器。

分類器最誘人，也最容易用過頭。「會改變發票總額、稅或退款的變更需要人工」是有用的分類器。「判斷這個變更安不安全」不是；它把整個判斷交回給模型，沒有規則可以稽核。分類器是一次模型呼叫，所以要花 token，也會隨著模型改變而漂移。把分類器寫窄、給例子，並讓未知情況落到人工，而不是落到放行。

成本結構也是同一個形狀。Claude Ship 以 token 計費。管理員可以為 Code Review 與 PR Steward 設支出上限。Claude Approvals 沒有基本費，但政策裡的分類器依使用的 token 計費；而一個會用到 Claude 審查的政策，即使在觀察模式，也會觸發一次計費的 Code Review。所以觀察模式是強制上的折扣，不是免費層。開啟之前，先把政策自己會產生的審查費用編進預算。

稽核軌跡有兩半。PR Steward 在每次推送後留言，說明改了什麼、怎麼還原。那不是狀態更新，而是還原協定。另一半是核准決定：哪一條政策生效、當時有哪些訊號、是誰或什麼說 yes。如果你無法從 PR 重建這些，政策就只是裝飾。政策檔的 git 歷史解釋規則；PR 時間軸解釋決定。兩者合起來，才能回答事故後唯一重要的問題：這個東西為什麼被合併？

好的政策檔該有什麼？不是一份最大的條件清單，而是一份簡短、預設拒絕的文件：

1. **預設人工簽核。** 自動核准是例外，而且要具名。
2. **敏感路徑永遠人工。** 認證、付款、遷移、基礎設施、CI 配置，以及政策檔本身。
3. **便宜可評估的風險觸發。** 大小、依賴變更、schema 變更、公開行為變更。
4. **發現規則。** 阻擋級發現永遠不自動核准；未驗證的發現視為未結案。
5. **窄分類器與例子。** 每個都有擁有者與理由，未知情況向上呈報。
6. **簡短的例行工作允許清單。** 文件、測試、patch 級依賴升級是常見候選。
7. **觀察開關與審查節奏。** 政策要定期重讀，每次事故後也要重讀。

下面的語法只是示意形狀，不是 Anthropic 官方公布的 schema。重點是結構：預設、例外、訊號，以及一個讓整套東西維持觀察模式的開關，直到有人真的信任它。

```yaml
# 示意形狀，不是 Anthropic 官方公布的 schema。
default: require_human

paths:                           # 這些永遠不自動核准
  "src/auth/**": human
  "db/migrations/**": human
  ".github/workflows/**": human
  "**/approval-policy*": human   # 政策管自己

findings:
  blocking: human                # 任何未結案的阻擋級發現
  unverified: human              # 審查無法確認也無法駁回

classifiers:
  - name: billing-behavior
    rule: "會改變發票總額、稅或退款的變更"
    action: human
  - name: dependency-major
    rule: "主要版本的依賴升級"
    action: human

limits:
  max_files: 40                  # 更大的變更需要人工
  max_added_lines: 800

allow:
  - "docs/**"
  - "**/*.test.ts"
  - "檢查全綠的 patch 級依賴升級"

observe: true                    # 記下決定，還不要擋
```

兩個反模式值得點名。第一個是「Code Review 沒標記的就核准」。這會讓 Code Review 成為唯一的閘門，也讓權力分立崩塌：找問題的人因為「沒說話」而變成決定的人。沒有發現不是安全的證據，只是「這位審查者、這一次執行，什麼都沒找到」的證據。第二個是政策長到沒人讀。沒有人審的政策，只是多幾步的設定檔。把它控制在一個新工程師能坐下來讀完、並向審查者解釋的長度。

<figure class="mfig-fig">
  <figcaption>
    <span class="card-tag">政策決定 // 02</span>
    <h3 class="mfig-fig-title">政策檔就是決定介面</h3>
    <p class="mfig-fig-sub">預設分支上的政策讀取審查發現、自然語言分類器與儲存庫脈絡，然後放行、要求人工或阻擋。觀察模式會記下同一個決定，但不執行它。</p>
  </figcaption>
  <div class="mfig-scroll">
  <svg class="mfig-svg" viewBox="0 0 840 400" role="img" aria-labelledby="ship-f2-title ship-f2-desc">
    <title id="ship-f2-title">核准政策如何做決定</title>
    <desc id="ship-f2-desc">政策檔定義預設人工簽核、敏感路徑、發現規則、分類器、大小限制與例行允許清單。Claude Approvals 把它與審查發現、自訂分類器、儲存庫脈絡結合。結果是放行、要求人工或阻擋。觀察模式下決定會被記錄，但分支保護不變。</desc>
    <defs>
      <marker id="ship-f2-arrow" viewBox="0 0 5 5" refX="4.4" refY="2.5" markerWidth="5" markerHeight="5" markerUnits="userSpaceOnUse" orient="auto"><path d="M0 0 L5 2.5 L0 5 z" fill="var(--mono-ink)"/></marker>
    </defs>
    <text x="24" y="18" class="f" font-size="7.5" letter-spacing="1.2">政策 // 訊號 // 決定</text>
    <text x="816" y="18" class="f" font-size="7.5" text-anchor="end" letter-spacing="1">預設：人工</text>
    <line x1="24" y1="26" x2="816" y2="26" class="rule"/>
    <rect x="24" y="44" width="224" height="152" class="term"/>
    <text x="36" y="62" class="f" font-size="6.4" letter-spacing="0.7">政策檔 // 預設分支</text>
    <line x1="36" y1="70" x2="236" y2="70" class="rule-soft"/>
    <text x="36" y="86" class="mono t" font-size="6.6" font-weight="700">default: require_human</text>
    <text x="36" y="100" class="mono m" font-size="6.4">paths.auth: human</text>
    <text x="36" y="112" class="mono m" font-size="6.4">paths.migrations: human</text>
    <text x="36" y="124" class="mono m" font-size="6.4">findings.blocking: human</text>
    <text x="36" y="136" class="mono m" font-size="6.4">classifiers: billing → human</text>
    <text x="36" y="148" class="mono m" font-size="6.4">allow: docs, tests, bumps</text>
    <line x1="36" y1="158" x2="236" y2="158" class="rule-soft"/>
    <text x="36" y="176" class="mono t" font-size="6.6" font-weight="700">observe: true</text>
    <text x="132" y="176" class="f" font-size="6">← 從這裡開始</text>
    <path d="M136 196 V232" class="dash" fill="none" marker-end="url(#ship-f2-arrow)"/>
    <rect x="24" y="236" width="224" height="74" class="codebox"/>
    <text x="36" y="254" class="f" font-size="6.4" letter-spacing="0.7">觀察模式</text>
    <text x="36" y="274" class="t" font-size="8.4" font-weight="800">記錄，不設閘門</text>
    <text x="36" y="288" class="m" font-size="6.2">決定會被記下</text>
    <text x="36" y="300" class="f" font-size="6">分支保護不變</text>
    <rect x="592" y="44" width="224" height="152" class="box"/>
    <text x="604" y="62" class="f" font-size="6.4" letter-spacing="0.7">訊號 // 每個 PR</text>
    <line x1="604" y1="70" x2="804" y2="70" class="rule-soft"/>
    <text x="604" y="88" class="t" font-size="7.6" font-weight="800">審查發現</text>
    <text x="604" y="100" class="m" font-size="6.2">嚴重度 · 類別 · 未結案</text>
    <line x1="604" y1="110" x2="804" y2="110" class="rule-soft"/>
    <text x="604" y="128" class="t" font-size="7.6" font-weight="800">自訂分類器</text>
    <text x="604" y="140" class="m" font-size="6.2">自然語言規則</text>
    <line x1="604" y1="150" x2="804" y2="150" class="rule-soft"/>
    <text x="604" y="168" class="t" font-size="7.6" font-weight="800">儲存庫脈絡</text>
    <text x="604" y="180" class="m" font-size="6.2">分支保護 · 檢查</text>
    <rect x="316" y="70" width="204" height="92" class="term"/>
    <text x="328" y="88" class="f" font-size="6.4" letter-spacing="0.7">CLAUDE APPROVALS</text>
    <text x="328" y="110" class="t" font-size="9" font-weight="800">評估</text>
    <text x="328" y="124" class="m" font-size="6.2">政策 + 訊號</text>
    <text x="328" y="136" class="f" font-size="6">每個 PR 一個決定</text>
    <text x="328" y="150" class="f" font-size="6">可以說不</text>
    <line x1="248" y1="120" x2="312" y2="120" class="arrow" marker-end="url(#ship-f2-arrow)"/>
    <line x1="588" y1="120" x2="524" y2="120" class="arrow" marker-end="url(#ship-f2-arrow)"/>
    <line x1="418" y1="162" x2="418" y2="204" class="rule"/>
    <line x1="370" y1="204" x2="733" y2="204" class="rule"/>
    <line x1="370" y1="204" x2="370" y2="232" class="arrow" marker-end="url(#ship-f2-arrow)"/>
    <line x1="550" y1="204" x2="550" y2="232" class="arrow" marker-end="url(#ship-f2-arrow)"/>
    <line x1="733" y1="204" x2="733" y2="232" class="arrow" marker-end="url(#ship-f2-arrow)"/>
    <rect x="290" y="236" width="160" height="70" class="box"/>
    <text x="302" y="254" class="f" font-size="6.4" letter-spacing="0.7">結果 01</text>
    <text x="302" y="274" class="t" font-size="9" font-weight="800">放行</text>
    <text x="302" y="288" class="m" font-size="6.2">例行變更</text>
    <text x="302" y="300" class="f" font-size="6">Claude 核准</text>
    <rect x="470" y="236" width="160" height="70" class="box"/>
    <text x="482" y="254" class="f" font-size="6.4" letter-spacing="0.7">結果 02</text>
    <text x="482" y="274" class="t" font-size="9" font-weight="800">要求人工</text>
    <text x="482" y="288" class="m" font-size="6.2">有後果的變更</text>
    <text x="482" y="300" class="f" font-size="6">由人簽核</text>
    <rect x="650" y="236" width="166" height="70" class="box"/>
    <text x="662" y="254" class="f" font-size="6.4" letter-spacing="0.7">結果 03</text>
    <text x="662" y="274" class="t" font-size="9" font-weight="800">阻擋</text>
    <text x="662" y="288" class="m" font-size="6.2">政策禁止</text>
    <text x="662" y="300" class="f" font-size="6">不得合併</text>
    <line x1="24" y1="330" x2="816" y2="330" class="rule-soft"/>
    <text x="420" y="348" class="f" font-size="6.4" text-anchor="middle" letter-spacing="0.6">分支保護貫徹結果 · 觀察模式不改變它</text>
    <text x="420" y="366" class="f" font-size="6.2" text-anchor="middle">只能說 yes 的政策是橡皮圖章</text>
  </svg>
  </div>
  <p class="mfig-fig-src">政策檔 · 審查發現 · 分類器 · 分支保護 · 先觀察</p>
</figure>

## Claude Code 團隊回報的結果

Anthropic 回報，在 Claude Code 團隊，2026 年 6 月到 9 月之間，合併的 PR 增加超過一倍，而被回退的 PR 佔比下降超過 40%。同一段也註明，Claude 的審查只是更大流程裡的其中一層。這個提醒很重要。這是來自一個大量用工具寫程式的團隊的內部結果，不是跨公司控制的基準測試。

兩個數字放在一起，比單看任何一個有趣。合併量上升可能只因為開的 PR 變多。合併數上升、回退佔比持平，代表團隊用同樣的品質變快了。回退佔比下降則是品質的反向指標。Anthropic 描述的是兩件事同時發生：更多合併、更少重工，而且是在一個本來就大量使用代理的團隊上。如果數字站得住，移動的瓶頸是協調，不是程式碼生產。

這些數字不能證明全部都是 Claude Ship 造成的。這段期間還包含 Claude Code 的更廣泛採用、團隊流程的改變，以及工作組成的變化。「增加超過一倍」是相對變化，基期沒有公布。「下降超過 40%」是回退佔比的相對下降，不是下降 40 個百分點，而且取決於回退怎麼計數。沒有對照組、沒有公開的同期群定義、沒有獨立稽核。誠實的讀法比較窄：至少有一個高流量的團隊回報，這個迴圈吸收了更多 PR，而回退佔比沒有變大。這是存在性證明，不是你可以直接套進預測的基準。

TELUS 的工程總監說，Code Review 在人工審查者看到 PR 之前就抓到真實問題，PR Steward 幫貢獻者修好，而人的時間現在留給真正需要它的變更。這是在說注意力移動了，不是說人離開了。佇列變短，判斷留著。

## 限制與成本

免責聲明不是樣板，應該直接引用而不是改寫：「Claude Ship uses AI and may miss bugs, security vulnerabilities, or other issues.」綠燈是對政策的陳述，不是對程式碼的證明。政策只能為它的訊號看得到的東西背書，而訊號是由可能朝同一個方向出錯的模型產生的。

幾個限制是結構性的：

- **還是 beta。** PR Steward 與 Claude Approvals 可能改變。不要在沒有備援的情況下，把合規依賴建立在目前的語意上。
- **只支援 GitHub。** 其他平台上的儲存庫暫時不在範圍內。
- **只限 Team 與 Enterprise。** 小團隊與個人開發者無法直接採用。
- **部分組織被排除。** 不支援 Zero Data Retention、HIPAA 設定或客戶自管加密金鑰的組織。對這些團隊，治理模式仍可移植，但這個實作不行。
- **要花 token。** 金額取決於 PR 的數量與大小、審查等級、審查頻率，以及 PR Steward 的工作量。一個會用到 Claude 審查的政策，即使在觀察模式也會觸發計費的 Code Review。
- **它審查，不證明。** 人工簽核不是可以省略的程序，而是兜住模型遺漏之處的控制點。

成本討論通常停在帳單。更重要的成本是注意力。一個把 5% 變更送給人工的政策，會得到仔細的審查，因為審查者知道佇列很小、案例是被選過的。一個把 60% 送給人工的政策，會得到橡皮圖章，因為沒有人在自身工作之外，能長期維持那樣的審查密度。政策的門檻不只分配工作，也決定人工審查還算不算數。這是設計決策，不是帳務細節。

政策本身還有一條安全邊界。政策檔是特權設定，比較像生產環境的 IAM，而不是 README。如果代理能改它，代理就能替自己擴權。如果開發者能在改程式碼的同一個 PR 裡改它，政策就變成它應該判斷的那個 diff 的一部分。用你最嚴格的審查要求保護這個檔案，並把它的變更排除在自動核准路徑之外。

## 實際導入路徑

符合這個設計的導入路徑是漸進且可量測的。它不從最關鍵的儲存庫開始，也不從強制執行開始。

1. **選一個儲存庫。** 挑有真實 PR 流量、影響範圍有限的。有良好測試與明確擁有者的服務，比所有人都害怕的 monorepo 更適合當第一個。
2. **先開 Code Review。** 用 Quick 或 Standard。讀兩週的發現，確認誤報率，再加入任何能阻擋合併的東西。
3. **加上 PR Steward，但要看還原說明。** 每次推送後的留言就是稽核軌跡。如果寫得含糊，這個自動化還沒準備好拿更多權限。
4. **用觀察模式寫政策。** 預設維持人工簽核。只加入你有把握的路徑與發現。在第一個分類器執行之前，先設好每月支出上限。
5. **衡量的是迴圈，不是 demo。** 追蹤審查延遲、合併率、回退佔比、每個 PR 的人工分鐘數，以及政策推翻率。推翻率高，代表政策錯了，或審查者不信任它；兩者都能修，但前提是你看得到。
6. **窄範圍強制。** 當觀察紀錄與你的判斷一致，才在分支保護裡要求 Claude Approvals，而且只限允許清單。敏感路徑留給人工。一次擴大一種變更類別。
7. **定期審查政策。** 每季一次，每次事故後一次。給檔案一個擁有者。把政策變更當程式碼變更處理，因為它就是。

| 訊號 | 它告訴你什麼 | 它怎麼誤導你 |
| :--- | :--- | :--- |
| 審查延遲 | 佇列有沒有在動 | 壞程式碼快速合併，看起來像成功 |
| 回退佔比 | 重工在上升還是下降 | 團隊可以停止回退，然後說是進步 |
| 每個 PR 的人工分鐘數 | 審查是移動了，還是消失了 | 數字低可能是信任，也可能是忽視 |
| 政策推翻率 | 政策符不符合現實 | 默默推翻會藏住失效的政策 |
| 逃逸到生產環境的缺陷 | 真正重要的結果 | 雜訊大、落後，需要長窗口 |

在開啟強制之前，先定義退場條件。如果回退佔比上升、如果審查者說不出一個變更為什麼被核准，或如果推翻變成常態，就關掉閘門，回到觀察模式。不能回退的治理系統不是控制，是承諾。

符合資格的 Claude Enterprise 組織，可以取得至少 10,000 美元的 Claude Ship 額度，額度需在認領後 30 天內使用，認領期限是 2027 年 1 月 15 日，適用相關條款。額度是拿來做實驗的理由，不是跳過衡量的理由。

## 結語：合併決定是最後一哩

寫補丁從來不是交付最難的部分。最難的是判斷這個補丁安不安全、可以合併，而且事後還能解釋這個判斷。

Claude Ship 有趣，是因為它把這個判斷當成一種獨立的權力。Code Review 找問題。PR Steward 修問題，而且明確被禁止核准或合併。Claude Approvals 對著一份放在儲存庫裡的政策檔做決定，可以要求人工，也可以說不。這個設計不是功能清單，而是一套權力分立，用在一個否則會把太多判斷集中在「想把事情做完」的代理身上的迴圈。

beta 的警告不會削弱這個模式，反而定義了導入路徑：先觀察、窄範圍強制、讓人在真正重要的變更上把關，並用看待合併數一樣的認真程度看待回退佔比。Anthropic 自己的免責聲明就是正確的框架。系統可能會漏東西。這正是為什麼政策必須能說不，也為什麼必須有一個人擁有那個說不的檔案。

能修任何東西的代理，仍然不該是決定它有沒有上線的那一個。

## 參考資料

- [Anthropic：Introducing Claude Ship](https://claude.com/resources/articles/introducing-claude-ship) — 2026 年 11 月 23 日的發布公告。
- [Claude Ship 文件](https://code.claude.com/docs/en/claude-ship) — 設定與管理。
- [Code Review 設定指南](https://code.claude.com/docs/en/code-review-setup) — 連接 GitHub 並啟用儲存庫。
- [Anthropic：Code Review is now generally available](https://claude.com/resources/articles/code-review-is-now-generally-available) — 審查層。
- [Anthropic：Solving code review at Anthropic](https://claude.dev/blog/solving-code-review-at-anthropic/) — 團隊回報的結果。
- [GitHub：About CODEOWNERS](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-code-owners) — Claude Approvals 被拿來比較的檔案。
- [GitHub：About protected branches](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches) — 強制層。
- [Claude Enterprise：Code Review promotional credits](https://support.claude.com/en/articles/17603594-free-code-review-promotional-credits-for-claude-enterprise) — 資格與條款。
