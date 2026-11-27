---
title: "Super-agent 是一個系統，不是一個 Session"
description: "細讀 DeepSeek Harness 的 Super-agent 設計與 dsh-superagent-prototype：常駐 Router、隔離 Worker、事件驅動 Trigger、全雙工 ReAct，以及計算、狀態與環境的分離。"
pubDate: 2026-11-26
category: "AI"
tags: ["AI Agents", "DeepSeek", "Harness", "Architecture", "RepoNotes"]
featured: false
author: "Alex.Hsiao"
readTime: "14 分鐘"
cardImage: "./cover.webp"
cardImageAlt: "dsh-superagent 原型的架構圖：來源與工具進入 Engine，Engine 協調 Store、Policy、Executor 與 Effects"
---

> **article.md** — [agent-readable file](/blog/2026/11-superagent-system/article.md)
>
> **English description.** `dsh-superagent` is a proactive coding agent for one GitHub repository, packaged as a bundle for DeepSeek Harness. It listens to GitHub and, optionally, Feishu. When an authorized person asks for work, it opens a work item, works on it in its own agent session and directory, and answers in the original conversation, for example with a pull request. ([source](https://github.com/deepseek-ai/dsh-superagent-prototype))
>
> **Original article.** [Super-agent 设计探索：迈向更自主的 Agent 系统](https://zhuanlan.zhihu.com/p/2099987320443237060)
>
> **Rendering.** Plain Markdown in the site's normal body font; no display face, image-only text, or decorative substitution.

多數 agent 展示仍然長得一樣：一個聊天視窗、一個模型、一個任務。你輸入需求，模型呼叫幾個工具，結果出現。真正有趣的工程在迴圈裡面——模型怎麼規劃、工具怎麼描述、錯誤怎麼重試。

DeepSeek Harness 團隊的文章〈Super-agent 设计探索：迈向更自主的 Agent 系统〉從別的地方開始。它主張下一個瓶頸不是模型完成單一任務的能力，而是**一個人同時監督多個任務的能力**。作者觀察到，一個人通常只能同時跟進三到五個活躍 Session；再多的話，人就成了排程器：切換視窗、重述上下文、記住哪個 thread 要了什麼。

如果瓶頸在這裡，更好的聊天視窗解決不了問題，需要的是系統。文章提出的設計——以及隨附的開源原型——把 session 管理、事件路由、授權、執行與恢復，從人的腦中移到 agent runtime 裡。模型仍然是引擎；產品是引擎外面的組織方式。

這篇是對設計文章與 `dsh-superagent-prototype`  repo 的細讀。短版結論是：**在自主 agent 裡，最重要的程式碼可能是決定「什麼時候不要行動」的那一段。**

## 四個性質，五個模組

文章用四個性質定義 Super-agent：

- **連續（Continuous）。** 使用者可以在 IM thread、GitHub pull request 或 email 串裡跟它說話，它表現得像同一個 agent，而不是每個頻道各自一個 session。
- **高效（Efficient）。** 長指令還在跑時，它可以接受新指令，也能平行推進多個獨立任務。
- **主動（Proactive）。** 它會觀察環境，在規則允許時主動開始工作，不必每次都被點名。
- **持久（Persistent）。** 它持續在線、接得到使用者真實的工作環境，並在長期運行中從異常恢復。

這些是形容詞。真正讓它們成立的是架構。文章把四個性質對應到五個模組：

| 模組 | 服務的性質 | 實際做的事 |
| --- | --- | --- |
| 雙層架構 | 連續 + 高效 | 常駐 Router 保留全局上下文；隔離的 Worker 執行任務 |
| 事件驅動 intake | 主動 | Trigger 經過濾、串成 Thread、路由到 Worker |
| 面向人的互動 | 連續 + 高效 | 全雙工 ReAct；依頻道調整輸出 |
| 計算／狀態／環境分離 | 持久 | 無狀態雲端迴圈、持久 session 狀態、本地執行 daemon |
| Watchdog | 持久 | 外部控制迴圈，檢查進展而不只是 process 活著 |

關鍵不是哪一個模組新。每一項在作業系統、分散式系統或佇列設計裡都有對應。關鍵是把 agent 當成一個**有可排程工作、持久狀態、准入控制與故障恢復的系統**，而不是一個附帶對話的模型。

這也解釋了為什麼文章花很少篇幅談 prompt。Prompt 重要，但它不是架構。架構決定哪個事件會進到哪個 context、誰有權限開始工作、worker 死掉時怎麼辦，以及人什麼時候才需要被拉回來做決定。

## Router 不做工；Worker 不對外說話

第一個模組是整篇文章裡最乾淨的想法。

單一 agent session 提供最好的連續性：所有東西都在同一個 context。但它提供最差的吞吐量：一個 ReAct 迴圈一次跑一步，每個新訊息都要排在目前的 tool call 後面。每個事件開一個新 session 則相反：吞吐量最好，連續性最差，使用者又開始在 context 之間切換。

Super-agent 把差別拆成兩層。

**Router** 是常駐 session，擁有全局對話。它接收人類訊息、維持跨任務的全貌、決定哪些事值得開 Worker，並把結果說回給使用者。它是 sequence point 與記憶，不是執行者。文章說它甚至可以設定成沒有 Bash 工具；它的工作是路由與對話，不是跑指令。較輕量的模型往往就夠。

**Worker** 是隔離的 session，各自擁有 context 與目錄。Worker 拿到完整執行工具、通常是最強的模型，以及一個任務。它不直接跟使用者說話，只向 Router 回報，由 Router 決定使用者看到什麼。

```text
GitHub / Feishu / mail
          │
          ▼
     [ Source ] ──► Trigger ──► Thread
          │                        │
          │ new work               │ follow-up
          ▼                        ▼
     [ Router ] ◄──────────► [ Worker ]
          │                        │
          └──── human reply ◄──────┘
```

結果很微妙但重要：**session 不再是使用者的問題。** 使用者看到的是一個 agent；系統底下可能同時跑五個 Worker。文章說得很直接：session 應該是系統的實作細節，而不是使用者的認知負擔。

Router 這一側還有第二個結果。因為 Router 是單一常駐 session，它理論上會是吞吐瓶頸。但實務上它會批次處理。Router 在思考時，新的 Trigger 會排隊；下一次模型呼叫時，整批一起送進去。輸入很長、輸出很短，prefill 會把批次平行算掉。在 context 上限之內，積壓越多，每個決策分攤到的推理時間反而可能越少。

原型直接把這個分離寫進程式。`src/core/engine.ts` 是 Trigger、Thread、Decision、Ticket 與 Assignment 的唯一寫入者。`src/executor/dsh.ts` 讓每個 Ticket 擁有一個 Executor session 與一個目錄。Router 是主 session；Worker 是 `worker-<ticket id>` session。這條界線由程式碼強制，不是靠 prompt 請模型配合。

## 事件不是 prompt

第二個模組改變的是輸入。

一般 agent 等 prompt。Super-agent 聽事件流：GitHub 留言、pull request review、CI 結果、IM 提及、email。文章把這些事件叫 **Trigger**。同一個 pull request、IM 話題或郵件串上的一連串 Trigger，構成一條 **Thread**。

原始事件流大多是噪音。如果每個事件都送進模型，系統又慢又貴。設計借用作業系統的 fast path / slow path，做兩層過濾：

1. **程式層（fast path）。** 用來源、群組、sender、bot 白名單、mention 規則等確定性條件，在呼叫模型前先濾掉大部分事件。
2. **語意層（slow path）。** 通過的候選事件進 Router，由它讀團隊 policy，判斷是否值得工作。

同樣的拆分也用在路由。新 Thread 走 slow path：Router 評估它、建立 Worker。Worker 訂閱該 Thread 之後，後續事件走 fast path：Source 直接送給 Worker，不必每則都經 Router 轉發。Router 仍然觀察全部事件以掌握全局狀態，但只決定還沒被認領的事。

訂閱是多對多。一個 Worker 可以追多條 Thread；一條 Thread 也可以被多個 Worker 追蹤。當兩個 Worker 碰到同一個 pull request，新的 review comment 會同時送到兩邊，不需要點對點通訊。它們有機會看到彼此的工作，並在共享環境裡自行解決衝突。Router 仍然是唯一對使用者說話的人。

接著是 context 問題。Worker 的視窗有限，事件流沒有。文章從 cache 設計借了兩個操作：

- **Inline** 現在很可能用到的資訊：目前物件的 ID、短摘要、相鄰訊息、上層 review comment。
- **Spill** 太長或太罕用的內容：視窗裡只留引用與截斷點，模型需要時再用工具讀。

一致地套用之後，就得到 **Chain of Recall**：每個被召回的物件都 inline 下一跳物件的 ID，模型可以從一則訊息走到它的 Thread、從 Thread 走到 Worker session、再從 session 走到相關的 review，一次一跳。Context 不是倒垃圾，而是一張模型可以走的圖。

事件驅動的最後一個想法是**投機執行（speculative execution）**。Agent 可以在還不確定結果會不會被採用時，就先在背景開始做。在 DeepSeek Harness 的內部使用者群裡，有一條「靜默復現並修復」規則：有人在群裡回報問題時，agent 先在背景嘗試復現、準備 patch；只有確認問題且找到合理修法時才出聲，否則全程安靜。成本是背景算力，好處是人的下一則訊息可以是批准，而不是又重新描述一次需求。

這跟聊天機器人是不同的經濟學。你不是為每個答案付費，而是**為節省注意力付費**。

## 全雙工，或者不會卡住的對話

第三個模組關乎人機介面，起點是一個小觀察：經典 ReAct 迴圈是半雙工的。

模型呼叫 `run()`，工具執行，迴圈阻塞到結果回來。這段時間 session 不能接受新指令。如果指令跑十分鐘，使用者只能等，或再開一個 session。這正是 Super-agent 想消除的行為。

文章把阻塞呼叫換成非同步的一對：

- `start()` 立刻回傳「Started」通知；工具在背景繼續跑。
- 背景工作完成後，結果會當成一則新事件送回 session。
- `stop()` 讓模型取消跑太久的指令。

迴圈現在是全雙工：模型下一步就能收到新的人類訊息，不必等長指令。對話不必等 shell。

文章說這個非同步機制已經在 DeepSeek Harness 裡，但預設沒開。原型在 Worker session 裡採用同樣的模式：前景 shell 指令五秒後移到背景 job，Worker 可以接收 follow-up，而不是卡在長 build 上。

還有一條依頻道調整輸出的規則，聽起來小，其實很重要。Worker 的推理與 tool call 留在 Worker 裡。Router 對使用者說話，而回覆的形狀取決於頻道：

- **IM：** 低干擾、簡短、面向決策。團隊的硬規則是每次回覆不超過 100 詞（words）。
- **GitHub、email、文件：** 結構化、高資訊密度、非同步。Pull request 要有完整的問題背景、改動說明與驗證結果。

這不是禮貌，而是頻寬匹配。群聊吃不下推理軌跡；pull request 也不該被壓成 100 字摘要。同一個 agent 必須在不同地方用不同方式說話，而這個轉譯由系統擁有，不是使用者。

## 計算、狀態、環境是三件不同的事

第四個模組讓「持久」變成字面意思。

本地 agent 把三件事綁在一台機器上：跑迴圈的**計算**、必須活下來的**狀態**，以及工具操作的**環境**。闔上筆電，三件事一起停。換一台機器，環境就沒了。

文章分兩步拆開。

**計算與狀態。** Agent 迴圈跑在無狀態的彈性容器裡；Session、Ticket、訊息、決策存在資料庫。容器可以重啟、擴充、替換，session 從持久狀態繼續。這是把普通 Web 服務架構套到 agent 上。

**計算與環境。** 更難的是環境。真實工作躺在一個有未提交修改、本地憑證、內網服務與特定 toolchain 的 checkout 裡。把這些複製到雲端沙箱又貴又容易漏；要求使用者搬到雲端更糟。所以環境留在原地。使用者機器上跑一個輕量 daemon，只負責執行指令與回傳結果。雲端迴圈透過 daemon 讀環境；daemon 不保存 session 狀態。

文章把這叫 **BYOM — Bring Your Own Machine**。它和 Anthropic 的「腦手分離」形狀相同，但對象是偶爾離線的個人機器，而不是託管雲端沙箱。機器可以消失再回來；雲端 agent 可以在它回來後接續任務。

安全問題也從這裡開始，文章知道。若雲端迴圈被入侵或被 prompt injection 攻破，所有連上的機器都在範圍內。憑證不能進到模型 context；agent 應該能在不讀取憑證本身的情況下使用它。原型對自己的姿態很坦白：Worker session 以 operator 的 OS 使用者身分、帶 `danger-full-access` 執行；wrapper 與目錄是預設值，不是安全邊界，絕對路徑可以繞過 blocked command 清單。建議的隔離方式是專用 OS 帳號。設計很誠實地說明它是研究原型，不是 hardened product。

## Watchdog 也是一個 agent

第五個模組是多數 agent framework 會漏掉的：**Watchdog**。

長期運行的分散式系統不能只靠主 process 發現自己故障，它們需要外部控制迴圈。Agent 系統也需要，而且還多一件事：很多故障不是 crash。模型可能陷入迴圈、偏離目標，或在每個 process 都健康時一直做錯的事。

所以 Super-agent 用定時訊息驅動一個獨立的 Watchdog session。它檢查基礎設施錯誤、狀態恢復失敗，更有趣的是檢查每個 Worker 是否真的有進展、方向是否仍對準目標。發現異常時它可以介入、重試，或在 runtime 改系統行為。因為 Watchdog 本身是有完整工具能力的 agent session，operator 可以問它故障原因，也可以讓它線上修改 prompt 或規則。

這是一個小而關鍵的設計選擇。監控 agent 的不是 dashboard，而是另一個 context 不同、工作也不同的 agent。監控變成 first-class workload。

## 授權才是產品

如果你只讀架構段，可能會以為最難的是路由。Repo 暗示更難的是**權限**。

一個能替整個團隊行動的 agent，也能浪費整個團隊的注意力，或用團隊的名義做錯事。原型的 `docs/000-philosophy.md` 寫下原則：盡可能少佔用人類注意力，盡可能提供價值。後半句容易說，前半句是授權問題。

原型把工作分兩種：

- **Explicit。** 白名單上的人點名 agent，要求某件事。
- **Inferred。** Agent 看到可能值得工作的事件——bug 回報、review comment、CI 失敗——但沒有人點名它。

Inferred 工作由 **Policy** 把關。Policy 包含規則、各 Source 的 allowlist，以及 accept mode：

| 模式 | 行為 |
| --- | --- |
| `off` | 不考慮 inferred 候選 |
| `observe` | 評估候選；正面結果記為「would accept」，但不執行 |
| `auto` | 正面評估可以建立 Ticket 並開始工作 |

預設是 `observe`。這是自主 agent 該有的預設：先證明判斷力，再取得行動權。面板會記錄決策，團隊可以先看 agent「本來會做什麼」，再切到 `auto`。

請求被接受後，會變成一個 **Ticket**，帶著 **Mandate**：它是用什麼依據被准入的、符合哪些規則、誰提出的、當時的 policy 版本。Ticket 在暫停或結束後要恢復時，Mandate 會重新驗證。如果提出者已不在名單、規則已不適用，或系統已不接受主動工作，Ticket 就維持結束。人說「stop」是普通 Trigger；在面板按 stop 是命令。這個區別很重要，因為一個是對話，另一個是覆寫。

這是我就算不建 Super-agent 也想偷走的部分。Agent 迴圈正在變成 commodity；**准入契約**——誰可以要求、依據哪條規則、帶著什麼證據、有效到什麼時候——才是讓自主系統可被忍受的東西。

## 原型實際交付了什麼

Repo 是 `deepseek-ai/dsh-superagent-prototype`，MIT，TypeScript，包成 DeepSeek Harness bundle。它不是 mock：有真的 Engine、SQLite store、持久 effect queue、GitHub 與 Feishu sources、Web panel，以及 setup flow。

README 難得地坦白：

> Research prototype for reference only, not an official DeepSeek product. ... It may still contain bugs, and its coding style and engineering practices may be inconsistent. ... We have adapted it for publication, so it is not identical to our internal version or the implementation described in *Exploring Super-agent Design*.

這個落差是故事的一部分。文章描述的是設計空間；repo 實作其中一部分，其他想法留給未來。兩者一起讀，比只讀其中一個有用。

發表形狀也是故事的一部分。這是一個只有一個 commit 的快照：沒有 release、issues 關閉、寫作時約 24,600 stars。在 Node 22.23.5 上跑 `pnpm check`，結果是 1,196 個測試通過、1 個 Feishu health 測試失敗。這不是丟掉程式碼的理由，而是把它當研究 artifact、而不是 dependency 來讀的理由。

粗略的地圖：

| 層 | 位置 | 做什麼 |
| --- | --- | --- |
| Engine | `src/core/engine.ts` | Trigger、Thread、Decision、Ticket、Assignment 的唯一寫入者 |
| Store | `src/app/store.ts` | 一個 SQLite 資料庫、repositories、read queries、settings versions |
| Effects | `src/app/effects.ts` | 持久 side-effect queue：assessment、launch、delivery、relay、notice、reply |
| Executor | `src/executor/dsh.ts` | 每個 Ticket 一個 session 與目錄；worker slots；重啟恢復 |
| Sources | `src/sources/github*`、`src/sources/feishu*` | 事件 intake、thread reads、回覆 |
| Policy | `src/policy.ts` | 授權、評估、revalidation、policy effects |
| Panel | `src/client` | 需要人的事、決策、設定、健康狀態 |
| Setup | `SETUP.md` | 給 coding agent 讀的安裝腳本 |

<figure class="fig">
  <img src="/images/superagent-system/dsh-superagent-architecture.webp" alt="由儲存庫 Mermaid 原始碼渲染的 dsh-superagent 官方架構圖：來源外掛、Session 工具與管理路由進入 Engine，Engine 協調 Store、Policy、SourceRegistry、MasterAssessor、DshExecutor、Outbox 與 Effects" width="1600" height="1165" loading="lazy" />
  <figcaption><b>官方圖示</b> — 原型的核心類別與膠水層，由儲存庫的 Mermaid 原始碼渲染：來源外掛、Session 工具與管理路由進入 Engine；Engine 協調 Store、Policy、SourceRegistry、MasterAssessor、DshExecutor 與 Outbox；非同步工作經由 Effects 排隊。下方表格逐一說明每個元件的職責。來源：<a href="https://github.com/deepseek-ai/dsh-superagent-prototype/blob/main/docs/007-architecture.md">dsh-superagent-prototype，docs/007-architecture.md</a> · MIT</figcaption>
</figure>

### 每個元件做什麼

| 元件 | 功能 |
| --- | --- |
| **Source plugins** | 把 GitHub 與 Feishu 事件轉成 Trigger 與 Thread 事實、讀取 thread context，並透過 Source 的 channel 送回訊息。它們只透過 `SourceHost` / `SourceContext` 接觸核心。 |
| **Session tools** | 主 Session 與 Executor Session 的工具轉接層。把模型的工具呼叫轉成 Engine 命令（candidate、decide、attach、note、status、assignment/report），回傳精簡卡片或讀取結果。 |
| **Management routes** | 面板背後的 same-origin `/orchestrator/api` HTTP 路由。驗證請求與限制，再呼叫 Engine 或讀取 Store。 |
| **Engine** | Trigger、Thread、Decision、Ticket 與 Assignment（及其 Mandate）的唯一寫入者。它擁有每個命令的交易，並委派給 Intake、Evals、Tickets、Assignments 與 Replies。 |
| **Store** | 一個 SQLite 資料庫：domain repositories、read queries、Source metadata、settings 與 history、outbox receipts 與 typed KV。它只存狀態，不做政策判斷。 |
| **Policy** | 團隊規則：admission gate、Mandate revalidation、assessment outcome、pause 與 timeout 狀態，以及 policy version 變更對 live Tickets 的影響。 |
| **SourceRegistry** | 管理已註冊的 Source kinds 與 instances，實作 `SourceScope`，提供 channel send/link、thread context、search、health claims 與 configuration validation。 |
| **MasterAssessor** | 執行主 Session 對主動候選的評估：提供有界的 Thread 與 repository 上下文、讀取模型判斷，並把 Decision 回傳給 Engine。 |
| **DshExecutor** | Executor port：每個 Ticket 一個 Session 與目錄；準備 launch、遞送 Inputs、管理工作槽、重試與取消，並把 assignment 生命週期回報 Engine。 |
| **Outbox** | 訊息 receipt 的唯一寫入者。它在同一個交易保存訊息與 reply effect，透過 Source channel 送出；Source 關閉時等待，對話消失或未被監聽時丟棄。 |
| **Settings** | 版本化設定區塊、pause 狀態、setup 欄位、policy version 變更與 Source policy sync。儲存會宣告來源是 panel、tool 或 sync。 |
| **Sessions** | 管理主 Session 與 worker 的 DeepSeek Harness Sessions：建立、prompt/skills/tools 註冊、prompt versions、relay、notice 與 model-retry 狀態。 |
| **Effects** | 持久 side-effect 佇列：每個 kind/key 一列；assessment、launch、delivery、relay、notice、reply 的 handler；由舊到新執行、併發上限、指數退避、pause/drain 與 health。 |
| **Runtime** *(圖中未畫)* | Composition root：鎖住 state 目錄、開啟 Store、用各自的 ports 建構 parts、註冊 routes 與 Source host，並負責 startup/shutdown。 |
| **Panel** *(圖中未畫)* | 管理 UI：overview、stage 頁、Threads 與 Tickets、settings、prompts 與 health。它呼叫 management routes，本身不持有 domain rules。 |

Setup 檔是個好細節。它是寫給 coding agent 的，不是給人：一次問一個問題、收集答案、顯示一份計畫、再執行。這跟 Super-agent 自己的哲學一樣——把 operator 的注意力降到最低——只是套在安裝上。

## 12.4 分鐘的結果，以及它量了什麼

文章有一個初步實驗，值得仔細讀，因為數字很容易被誤解。

設定：每次約 300 則訊息，其中約 20 則是工作請求；其餘是閒聊、follow-up、停止、CI 訊息。寫程式的工作用一個只消耗時間的工具代替。實驗量的是**排程與協作**，不是寫程式品質。每種設定跑五次，訊息間隔與工作時間縮成四分之一。

四種設定：

- Super-agent。
- 去掉訂閱直通的 Super-agent。
- 單一 session + subagent 工具，中性 prompt。
- 單一 session + subagent 工具，偏好委派的 prompt。

結果比標題更有意思：

| 設定 | p50 | p95 | Cache-read token | 發生什麼 |
| --- | --- | --- | --- | --- |
| Super-agent | 12.4 分 | 15.7 分 | 2,323 萬 | Router + Worker + 直通 |
| Super-agent，去掉直通 | 12.6 分 | 15.5 分 | 3,177 萬 | 速度相同；Router 決策 +30% |
| 單一 session，中性 prompt | 20.4 分 | 29.5 分 | 605 萬 | 五次實驗中，模型一次都沒呼叫 subagent |
| 單一 session，委派 prompt | 13.8 分 | 29.0 分 | 1,082 萬 | 五次有四次委派；一次長尾 |

仔細看表。對上**偏好委派**的 baseline，中位數差距只有約 10%——12.4 對 13.8 分。真正的差別在尾端：15.7 對 29.0 分。架構贏的不是「平均快一倍」，而是**變異更小**：比較少任務卡在打斷或錯誤的委派決策後面。對上**中性** baseline，中位數與尾端都差很多，因為模型根本沒有委派。

Token 的交換寫得很明。Super-agent 用 2,323 萬 cache-read token，約是中性 baseline 605 萬的 3.8 倍、委派 baseline 1,082 萬的 2.1 倍。它用更多 context 讀取換更短、更穩定的完成時間。這是交換，不是免費午餐。

把 Super-agent 的直通路徑拿掉，完成時間沒什麼變（12.6／15.5 對 12.4／15.7），但 Router 的工作量變了：決策數增加約 30%，read-cache token 增加到 3,177 萬，約 37%。直通不是品質功能，是卸載功能。

Router 批次測試是另一組：Trigger 到達率從每分鐘約 1 則升到約 40 則。平均 batch 從 1.0 升到 2.8；單次請求從 2.5 秒升到 3.9 秒，遠慢於 batch 成長；每個決策分攤的推理時間從 6.4 秒降到 1.6 秒。在這個負載下，單一 Router 還有餘裕。

但 caveat 是真的：合成負載、只用時間的 coding tool、五次、時間縮放。這是排程 sanity check，不是產品 benchmark。但方向和架構一致：贏來自讓全局 context 保持連續，同時讓執行平行。

## 哪些是借的，哪些是新的

Super-agent 幾乎每個 primitive 都有前例：

- Fast path / slow path：作業系統與網路堆疊。
- Inline / spill 與 locality：cache 與 compiler。
- Speculative execution：CPU 與資料庫。
- 計算／儲存分離：分散式系統。
- Durable outbox 與 idempotent effects：message queue 與交易系統。
- Watchdog：硬體與分散式控制平面。

文章自己說了：它沒有提出新理論，而是把經典系統思想套到 agent 上。這不是缺點。新意在組合，以及願意把**系統**而不是模型當成設計單位。

多數 agent framework 最佳化迴圈：更好的 tool schema、更好的 planning prompt、更好的 retry。Super-agent 最佳化迴圈外面的組織：誰可以開始工作、哪個 context 看到哪個事件、執行住在哪裡、worker 卡住時怎麼辦。這是 stack 的不同層，而且長期被忽略。

最接近的類比不是「有工具的聊天機器人」，而是**注意力的作業系統**。Router 是 scheduler 與 shell；Worker 是 process；Thread 是對話的 file descriptor；Mandate 是 capability；Watchdog 是 kernel 的健康監控。類比不完美，但它解釋了為什麼系統工程師覺得這個設計熟悉，而 prompt 工程師覺得陌生。

## 真正重要的開放問題

文章對沒解決的事很誠實。四個問題特別突出。

**1. Router 的擴展。** 單一常駐 Router 簡單，而且保留全局 context。什麼時候需要 shard？Shard 會用連續性換吞吐量，文章沒有說已經有答案。實驗顯示每分鐘 40 個 Trigger 還有餘裕，不是組織規模的答案。

**2. 跨月的記憶。** Chain of Recall 處理近期任務與 session 歷史。長期記憶——agent 半年後應該記得專案、人物或決策的什麼——仍是開放問題。原型的 SQLite store 是 substrate，不是 memory policy。

**3. Agent 對 agent 協作。** 設計假設一個 Super-agent instance 擁有一個 context 邊界。當組織跑多個權限不同的 instance，跨邊界的 A2A 協作還沒解。文章把問題命名出來，沒有藏。

**4. 安全與隱私。** BYOM 把雲端迴圈接到有憑證與私有程式的個人機器。Prompt injection、憑證外洩、雲端迴圈被攻破，都是真實風險。原型的 wrapper 是便利，不是 sandbox。任何團隊要上 production，都需要更強的隔離故事。

還有一個比較軟的問題：如果 agent 接手更多工作，人的注意力真的會空出來，還是會轉移到審查更多 agent 輸出？文章的回答是：審查是新的瓶頸，系統應該只在需要決策時才找人。這有可能，但它是設計目標，不是已量測的保證。

## 怎麼試，但不要把整棟樓的鑰匙給它

原型不是 one-click install，這大概也合理。README 建議的路徑是請 coding agent 讀 `SETUP.md`，跟你一起設定。Setup flow 一次問一個問題、顯示計畫、再安裝。

合理的第一次運行：

1. 給 agent 一個專用 GitHub 帳號，不要用你自己的。它寫的所有東西都會掛在那個名字下。
2. 從一個 repository 與很短的白名單開始——最好只有你。
3. Accept mode 保持 `observe`。讀 agent 本來會做的決策。
4. 給它一個窄的 execution root 與會建立 checkout 的 prepare command。不要指向塞滿憑證的目錄。
5. 等觀察到的決策看起來很無聊，再切到 `auto`。
6. 看 panel 與 Watchdog health entry。安靜的 agent 不一定是在工作的 agent。

Prerequisites 是真的：Node.js 22.19+ 或 24+、pnpm、git、tmux、Python、GitHub CLI，以及一個裝好 model provider 的 DeepSeek Harness。Setup 設計成由 coding agent 驅動，但帳號與權限仍然屬於 operator。

## 位移

讀這個專案最有用的方式，不是「DeepSeek 做了一個 coding agent」，而是它對「困難搬到哪裡了」的聲明。

單任務 agent 正在變好。模型會呼叫工具、從錯誤恢復、在比一年前更少監督下完成範圍明確的任務。當這件事變好，限制就往外移：從迴圈移到佇列，從 prompt 移到 policy，從 session 移到系統。

Super-agent 的貢獻，是對外面那一層長什麼樣子給出一個具體答案：常駐 Router、隔離 Worker、事件驅動 intake、全雙工迴圈、持久狀態、本地執行平面，以及 Watchdog。沒有一個是魔法，全部是工程。而讓它可以被放著跑的東西，不是模型的智力，是那個決定 agent 什麼時候可以行動、什麼時候該安靜的准入契約。

這是整篇設計裡我會留下的一句話：**一個能替團隊行動的 agent，首先必須是一個知道什麼時候不要行動的 agent。**

## 參考資料

- [Super-agent 设计探索：迈向更自主的 Agent 系统](https://zhuanlan.zhihu.com/p/2099987320443237060) — DeepSeek Harness 團隊，知乎，2026 年 10 月 31 日（11 月 1 日編輯）；英文標題為 "Exploring Super-agent Design: Towards a More Autonomous Agent System"。
- [deepseek-ai/dsh-superagent-prototype](https://github.com/deepseek-ai/dsh-superagent-prototype) — MIT 研究原型，原始碼與文件。
- [DeepSeek Harness](https://www.deepseek.com/en/harness) — host runtime。
- [dsh-superagent philosophy](https://github.com/deepseek-ai/dsh-superagent-prototype/blob/main/docs/000-philosophy.md) — 注意力最小化原則。
- [dsh-superagent architecture](https://github.com/deepseek-ai/dsh-superagent-prototype/blob/main/docs/007-architecture.md) — Engine、Store、Effects、Sources、Executor。
- [dsh-superagent execution](https://github.com/deepseek-ai/dsh-superagent-prototype/blob/main/docs/003-execution.md) — Ticket、stage、worker slot、恢復。
- [dsh-superagent authorization](https://github.com/deepseek-ai/dsh-superagent-prototype/blob/main/docs/002-authorization.md) — accept mode、規則、Mandate、revalidation。
- [SETUP.md](https://github.com/deepseek-ai/dsh-superagent-prototype/blob/main/SETUP.md) — 給 coding agent 讀的安裝流程。
