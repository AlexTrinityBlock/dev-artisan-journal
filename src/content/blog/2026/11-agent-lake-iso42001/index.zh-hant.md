---
title: "LangChain 如何通過 ISO/IEC 42001 人工智能治理認證"
description: "LangChain 如何用 agent lake 與 LangSmith 通過 ISO/IEC 42001，以及 trace 單獨仍然證明不了什麼。"
pubDate: 2026-11-25
category: "AI"
tags: ["代理治理", "ISO 42001", "可觀測性", "LangSmith", "AI 管理"]
featured: false
author: "Alex.Hsiao"
readTime: "14 分鐘"
---

# LangChain 如何通過 ISO/IEC 42001 人工智能治理認證

代理可以把每件事都做對，卻仍舊沒有留下任何證明。這正是 AI 管理系統應該補上的缺口，也是 agent lake 能縮小、卻無法獨力填平的缺口。

2026 年 11 月，LangChain 發表了兩篇通常被分開閱讀的文章。一篇談 [agent lake](https://www.langchain.com/blog/the-agent-lake)：為代理 trace 與 outcome 設計的儲存與運算。另一篇談 [LangChain 如何用 LangSmith 通過 ISO/IEC 42001 驗證](https://www.langchain.com/blog/ai-governance-iso-iec-42001-langsmith)。合在一起讀，它們的主張比各自單獨讀時更大：工程師除錯代理所用的產物，正是稽核員可以用來治理代理的產物。本文認真看待這個主張，再追問它到哪裡為止。

<section class="mfig-lead">
  <div class="mfig-lead-head">
    <span class="card-tag">AGENT LAKE // 00</span>
    <p class="mfig-lead-kicker">Trace 不是一套合規計畫，而是可以拿來建構合規計畫的原料。</p>
    <h3 class="mfig-lead-title">Lake 負責保存證據，管理系統負責決定證據的意義。</h3>
    <p class="mfig-lead-sub">LangChain 的 agent lake 與它的 ISO/IEC 42001 稽核指向同一套架構，也指向同一個極限。</p>
  </div>
  <div class="mfig-lead-grid">
    <div class="mfig-card">
      <div class="mfig-icon"><svg class="mfig-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 3v16a2 2 0 0 0 2 2h16"/><path d="M7 16h8"/><path d="M7 11h12"/><path d="M7 6h3"/></svg></div>
      <div class="mfig-tag">TRACE // 紀錄</div>
      <h4>每一步，一筆紀錄</h4>
      <p>輸入、模型呼叫、工具呼叫、輸出、錯誤、核准，全部收進可整段閱讀的 thread。</p>
      <div class="mfig-meta">TRACE · THREAD · SPAN</div>
    </div>
    <div class="mfig-arrow" aria-hidden="true">→</div>
    <div class="mfig-card">
      <div class="mfig-icon"><svg class="mfig-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg></div>
      <div class="mfig-tag">EVAL // 證明</div>
      <h4>可以重複的分數</h4>
      <p>鎖定資料集、固定評測器，讓一次發佈成為可檢驗的主張，而不是軼事。</p>
      <div class="mfig-meta">DATASET · EVALUATOR · RELEASE</div>
    </div>
    <div class="mfig-arrow" aria-hidden="true">→</div>
    <div class="mfig-card">
      <div class="mfig-icon"><svg class="mfig-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12a9 9 0 1 1-9-9"/><path d="M21 3v6h-6"/><path d="M9 12l2 2 4-4"/></svg></div>
      <div class="mfig-tag">AIMS // 循環</div>
      <h4>留下可追溯紀錄的治理</h4>
      <p>政策、角色、風險評鑑、矯正措施，包在代理外面，而不是只做代理裡面的觀測。</p>
      <div class="mfig-meta">POLICY · RISK · AUDIT</div>
    </div>
  </div>
  <div class="mfig-lead-flow mfig-scroll">
  <svg class="mfig-svg" viewBox="0 0 840 126" role="img" aria-labelledby="lake-lead-title lake-lead-desc">
    <title id="lake-lead-title">從一次代理執行，到一件證據</title>
    <desc id="lake-lead-desc">Trace 記錄發生了什麼，outcome 記錄它是否重要，評測記錄它是否通過，issue 記錄什麼在重複，修正記錄改了什麼，合起來的紀錄則成為稽核證據。</desc>
    <defs>
      <marker id="lake-lead-arrow" viewBox="0 0 5 5" refX="4.4" refY="2.5" markerWidth="5" markerHeight="5" markerUnits="userSpaceOnUse" orient="auto"><path d="M0 0 L5 2.5 L0 5 z" fill="var(--mono-ink)"/></marker>
    </defs>
    <text x="20" y="16" class="f" font-size="7.5" letter-spacing="1.2">一次執行 // 六件產物</text>
    <text x="820" y="16" class="f" font-size="7.5" text-anchor="end" letter-spacing="1">證據鏈</text>
    <line x1="20" y1="24" x2="820" y2="24" class="rule"/>
    <rect x="20" y="42" width="118" height="38" class="term"/>
    <text x="79" y="65" class="t mono" font-size="9.6" font-weight="800" text-anchor="middle">TRACE</text>
    <text x="79" y="96" class="m" font-size="6.6" text-anchor="middle">發生了什麼</text>
    <line x1="140" y1="61" x2="153" y2="61" class="arrow" marker-end="url(#lake-lead-arrow)"/>
    <rect x="155" y="42" width="118" height="38" class="box"/>
    <text x="214" y="65" class="t mono" font-size="9.6" font-weight="800" text-anchor="middle">OUTCOME</text>
    <text x="214" y="96" class="m" font-size="6.6" text-anchor="middle">是否重要</text>
    <line x1="275" y1="61" x2="288" y2="61" class="arrow" marker-end="url(#lake-lead-arrow)"/>
    <rect x="290" y="42" width="118" height="38" class="term"/>
    <text x="349" y="65" class="t mono" font-size="9.6" font-weight="800" text-anchor="middle">EVAL</text>
    <text x="349" y="96" class="m" font-size="6.6" text-anchor="middle">是否通過</text>
    <line x1="410" y1="61" x2="423" y2="61" class="arrow" marker-end="url(#lake-lead-arrow)"/>
    <rect x="425" y="42" width="118" height="38" class="box"/>
    <text x="484" y="65" class="t mono" font-size="9.6" font-weight="800" text-anchor="middle">ISSUE</text>
    <text x="484" y="96" class="m" font-size="6.6" text-anchor="middle">什麼在重複</text>
    <line x1="545" y1="61" x2="558" y2="61" class="arrow" marker-end="url(#lake-lead-arrow)"/>
    <rect x="560" y="42" width="118" height="38" class="term"/>
    <text x="619" y="65" class="t mono" font-size="9.6" font-weight="800" text-anchor="middle">FIX</text>
    <text x="619" y="96" class="m" font-size="6.6" text-anchor="middle">改了什麼</text>
    <line x1="680" y1="61" x2="693" y2="61" class="arrow" marker-end="url(#lake-lead-arrow)"/>
    <rect x="695" y="42" width="125" height="38" class="codebox"/>
    <text x="757" y="65" class="t mono" font-size="9.6" font-weight="800" text-anchor="middle">EVIDENCE</text>
    <text x="757" y="96" class="m" font-size="6.6" text-anchor="middle">證明了什麼</text>
    <text x="420" y="117" class="f" font-size="6.4" text-anchor="middle" letter-spacing="0.6">每一步都寫下一筆紀錄 // 紀錄只有在 SCHEMA 站得住時才有用</text>
  </svg>
  </div>
  <p class="mfig-lead-note"><b>證據不等於合規。</b>Lake 為四個稽核問題提供證據；管理系統決定這些答案是否可被接受。</p>
</section>

<p class="mfig-bridge">這個區別就是本文的論點：lake 存了什麼、稽核員能向它追問什麼，以及還有什麼必須留在 lake 之外。</p>

## 政策與一次執行之間的落差

多數 AI 治理一開始都是一份文件。它點名系統、指派負責人、禁止某些動作、要求另一些動作必須經過審查，並承諾持續監控。文件是必要的。但從證據的角度看，它只是一份意圖聲明。

代理不像服務那樣有固定的契約。同樣的輸入，可能產生不同的計畫、不同的工具順序、不同的副作用。一次執行可以在錯誤的任務上成功，也可以在失敗時留下一筆被改過的客戶紀錄。傳統監控抓得到延遲、錯誤率、可用性，卻抓不到真正要命的那句話：代理正確地把信寄給了錯誤等級的客戶。

稽核問題比「代理好不好？」更窄，也更難：代理被允許做什麼、你怎麼知道它有效、它實際做了什麼、它失敗之後改了什麼？這四個問題需要四種證據。其中只有一種是儀表板。

可觀測性提供執行紀錄。治理提供權限、風險決定與矯正。Agent lake 有趣的地方，在於它站在兩者之間：它讓執行紀錄與對這次執行的判斷，可以用同一組識別碼放在一起。

商業框架是 LangChain 的。架構論證則更廣，而且經得起行銷語言的檢驗：任何讓代理握有真實權限的組織，都需要一套方法，重建發生過什麼，並把它連回「這件事該不該發生」。

## Agent lake 實際上存了什麼

LangChain 把 agent lake 定義為「結合為代理 trace 最佳化的儲存，以及智慧運算，用來查詢、分析、從中學習，推動代理持續改善」的平台。

拿掉行銷語言，這個定義有三個部分。儲存是為 trace 最佳化的，不是為資料列最佳化的。運算是設計來從非結構化推理裡找出意義，不只是彙總數字。目的則是一個循環：生產資料變成評測資料，評測資料變成一次變更，變更再回到生產。

一筆 trace 記錄一次執行的每一步：使用者輸入、每一次模型呼叫、每一次工具呼叫、最後輸出。多輪互動會收進 thread，讓一整段對話可以被當成一個單位閱讀，而不是一堆互不相干的請求。這很重要，因為真正有意思的失敗通常是一串序列：一次看似合理的檢索、一次自信的工具呼叫、一個安靜的錯誤、一句流暢的道歉。

Lake 也存 outcome。Outcome 是工作造成的影響，可以跟 trace 或 thread 一對一，也可以多對多。一個倒讚屬於某一次回覆；一個合併的 PR 可能由一個 thread 開啟、由好幾個 thread 共同貢獻；一段被複製的程式碼，可能是答案有用的唯一訊號。Outcome 來自四種來源：使用者、對代理實際作用的系統進行直接觀察、以 LLM-as-a-judge 產生的替代指標，以及人工標註。

配對本身就是設計。沒有 outcome 的 trace 是軼事。沒有 trace 的 outcome 是沒有人能據以行動的數字。把兩者放進同一個儲存、用穩定的 join 連起來，問題就從「我們的成功率是多少？」變成「哪些軌跡會帶來成功、對哪些使用者、在哪些權限之下？」

每一種 outcome 來源都有不同的偏差。使用者回報的是什麼惹惱了他們。系統回報的是完成了什麼。裁判回報的是看起來正確的結果。標註者回報的是他們被付錢去找的東西。只記錄一種來源的證據層，一定會對它過度配適。當 outcome 表被允許彼此矛盾，lake 反而更可信。

LangChain 的規模說法很大：SmithDB 是它為 trace 專門打造的資料庫；LangSmith 每月接收數十億次代理執行的 trace；客戶 Clay 每天送來數億個事件。我沒有獨立驗證這些數字，它們是 LangChain 公布的主張，不是稽核量測。規模有意義，理由很實際：在數十億次執行裡，沒有人會逐筆讀 trace，大家靠查詢。運算層不是便利功能，而是人類找到關鍵那一筆執行的唯一方法。

這也是傳統資料湖不夠用的原因。通用資料湖可以存 JSON。它無法以低成本回答 trace 形狀的問題：重建父子 span 樹、切出一個 thread 的時間窗、把 feedback join 到某個步驟、語意篩選「使用者感到挫折的 thread」或「含有 PII 的 trace」，並且對提示詞、輸出、工具 payload 套用不同的保留規則。你可以在 Snowflake 或 Databricks 上全部自己搭，很多團隊也真的這樣做。但你是在通用資料湖裡蓋一座 trace 資料庫，而最難的是 schema。

LangChain 的運算層，最容易理解成四種工作。線上評測器與 AI Search 負責找出有意思的 trace；決策模型讓這件事的成本低到可以持續執行。Insights 把流量分群，讓新的使用情境與正在轉移的失敗模式浮現。Engine 把重複失敗變成 issue、追查根因、提出 PR。SmithTune 用最好的軌跡微調模型，再跟基礎模型比較。廠商表示，Engine 已經分析超過六千萬筆生產 trace；一個用 Engine 軌跡微調的 Kimi K3，在內部 IssueBench 子集上得到 96 分，基礎 Kimi K3 是 90 分，GPT-5.6 Sol 是 87 分。這些是廠商在自家內部基準上的數字，不是對任何其他人任務的保證。

真正重要的主張，不是每家公司都需要這五種工具，而是儲存與運算共用同一套 schema。Lake 不是更大的日誌儲存。它是一套結構，把營運的廢氣變成證據。

<figure class="mfig-fig">
  <figcaption>
    <span class="card-tag">架構 // 01</span>
    <h3 class="mfig-fig-title">Lake 是一條管線，旁邊有一道治理側欄</h3>
    <p class="mfig-fig-sub">代理、工具、使用者與 outcome 經過寫入層；SmithDB 把執行紀錄與判斷放在一起；運算把它們變成 issue、修正與測試。側欄不在 lake 裡，但每一個階段都依賴它。</p>
  </figcaption>
  <div class="mfig-scroll">
  <svg class="mfig-svg" viewBox="0 0 840 420" role="img" aria-labelledby="lake-f1-title lake-f1-desc">
    <title id="lake-f1-title">Agent lake 與治理側欄的架構</title>
    <desc id="lake-f1-desc">代理、工具、使用者與 outcome 進入寫入層，經過批次、串流、遮罩、抽樣、schema 檢查與保留政策。Trace 與 outcome 儲存 SmithDB 持有 trace、thread、span、feedback 與 outcome。智慧運算在儲存之上跑線上評測、AI Search、Insights、Engine 與 SmithTune。結果變成有標籤的部署，生產執行再經由回饋迴路成為新證據。側欄列出政策、角色、風險登錄簿、資料溯源、人為監督與矯正措施，這些治理元素在 lake 之外。</desc>
    <defs>
      <marker id="lake-f1-arrow" viewBox="0 0 5 5" refX="4.4" refY="2.5" markerWidth="5" markerHeight="5" markerUnits="userSpaceOnUse" orient="auto"><path d="M0 0 L5 2.5 L0 5 z" fill="var(--mono-ink)"/></marker>
    </defs>
    <text x="24" y="18" class="f" font-size="7.5" letter-spacing="1.2">AGENT LAKE // TRACE + OUTCOME + 運算</text>
    <text x="816" y="18" class="f" font-size="7.5" text-anchor="end" letter-spacing="1">是證據，不是合規</text>
    <line x1="24" y1="26" x2="816" y2="26" class="rule"/>
    <text x="24" y="44" class="f" font-size="6.6" letter-spacing="0.8">來源</text>
    <rect x="24" y="52" width="104" height="48" class="box"/>
    <text x="34" y="68" class="f" font-size="6.2" letter-spacing="0.6">代理</text>
    <text x="34" y="84" class="t" font-size="8.6" font-weight="800">執行</text>
    <text x="34" y="95" class="m" font-size="6.2">計畫 · thread</text>
    <rect x="24" y="108" width="104" height="48" class="term"/>
    <text x="34" y="124" class="f" font-size="6.2" letter-spacing="0.6">工具</text>
    <text x="34" y="140" class="t" font-size="8.6" font-weight="800">呼叫</text>
    <text x="34" y="151" class="m" font-size="6.2">副作用</text>
    <rect x="24" y="164" width="104" height="48" class="box"/>
    <text x="34" y="180" class="f" font-size="6.2" letter-spacing="0.6">使用者</text>
    <text x="34" y="196" class="t" font-size="8.6" font-weight="800">回饋</text>
    <text x="34" y="207" class="m" font-size="6.2">核准</text>
    <rect x="24" y="220" width="104" height="48" class="term"/>
    <text x="34" y="236" class="f" font-size="6.2" letter-spacing="0.6">OUTCOME</text>
    <text x="34" y="252" class="t" font-size="8.6" font-weight="800">影響</text>
    <text x="34" y="263" class="m" font-size="6.2">PR · 分數 · 標註</text>
    <line x1="128" y1="76" x2="136" y2="76" class="rule-soft"/>
    <line x1="128" y1="132" x2="136" y2="132" class="rule-soft"/>
    <line x1="128" y1="188" x2="136" y2="188" class="rule-soft"/>
    <line x1="128" y1="244" x2="136" y2="244" class="rule-soft"/>
    <line x1="136" y1="76" x2="136" y2="244" class="rule-soft"/>
    <line x1="136" y1="160" x2="148" y2="160" class="arrow" marker-end="url(#lake-f1-arrow)"/>
    <rect x="150" y="52" width="104" height="216" class="codebox"/>
    <text x="162" y="70" class="f" font-size="6.4" letter-spacing="0.6">寫入</text>
    <text x="162" y="84" class="t mono" font-size="7.6" font-weight="800">OTEL / SDK</text>
    <line x1="162" y1="92" x2="242" y2="92" class="rule-soft"/>
    <text x="162" y="108" class="m" font-size="7.2">批次</text>
    <text x="162" y="121" class="m" font-size="7.2">串流</text>
    <line x1="162" y1="130" x2="242" y2="130" class="rule-soft"/>
    <text x="162" y="146" class="m" font-size="7.2">遮罩</text>
    <text x="162" y="159" class="m" font-size="7.2">抽樣</text>
    <line x1="162" y1="168" x2="242" y2="168" class="rule-soft"/>
    <text x="162" y="184" class="m" font-size="7.2">SCHEMA</text>
    <text x="162" y="197" class="m" font-size="7.2">檢查</text>
    <line x1="162" y1="206" x2="242" y2="206" class="rule-soft"/>
    <text x="162" y="222" class="m" font-size="7.2">保留</text>
    <text x="162" y="235" class="m" font-size="7.2">政策</text>
    <text x="162" y="256" class="f" font-size="6.2">單一入口</text>
    <line x1="254" y1="160" x2="264" y2="160" class="arrow" marker-end="url(#lake-f1-arrow)"/>
    <rect x="266" y="52" width="148" height="216" class="term"/>
    <text x="278" y="70" class="f" font-size="6.4" letter-spacing="0.6">TRACE + OUTCOME 儲存</text>
    <text x="278" y="88" class="t mono" font-size="11" font-weight="800">SmithDB</text>
    <line x1="278" y1="96" x2="402" y2="96" class="rule-soft"/>
    <text x="278" y="112" class="m" font-size="7.2">trace</text>
    <text x="278" y="127" class="m" font-size="7.2">thread</text>
    <text x="278" y="142" class="m" font-size="7.2">span</text>
    <text x="278" y="157" class="m" font-size="7.2">feedback</text>
    <text x="278" y="172" class="m" font-size="7.2">outcome</text>
    <line x1="278" y1="182" x2="402" y2="182" class="rule-soft"/>
    <text x="278" y="198" class="f" font-size="6.2">僅附加</text>
    <text x="278" y="210" class="f" font-size="6.2">高基數</text>
    <text x="278" y="222" class="f" font-size="6.2">trace 形狀的 schema</text>
    <text x="278" y="244" class="m" font-size="6.2">每月數十億次執行</text>
    <text x="278" y="256" class="f" font-size="5.8">LANGCHAIN 說法</text>
    <line x1="414" y1="160" x2="428" y2="160" class="arrow" marker-end="url(#lake-f1-arrow)"/>
    <rect x="430" y="52" width="174" height="216" class="box"/>
    <text x="442" y="70" class="f" font-size="6.4" letter-spacing="0.6">智慧運算</text>
    <text x="442" y="88" class="t" font-size="8.2" font-weight="800">線上評測</text>
    <text x="442" y="99" class="m" font-size="6.2">幻覺 · 毒性</text>
    <line x1="442" y1="106" x2="592" y2="106" class="rule-soft"/>
    <text x="442" y="122" class="t" font-size="8.2" font-weight="800">AI SEARCH</text>
    <text x="442" y="133" class="m" font-size="6.2">自然語言查詢</text>
    <line x1="442" y1="140" x2="592" y2="140" class="rule-soft"/>
    <text x="442" y="156" class="t" font-size="8.2" font-weight="800">INSIGHTS</text>
    <text x="442" y="167" class="m" font-size="6.2">流量分群</text>
    <line x1="442" y1="174" x2="592" y2="174" class="rule-soft"/>
    <text x="442" y="190" class="t" font-size="8.2" font-weight="800">ENGINE</text>
    <text x="442" y="201" class="m" font-size="6.2">issue → 根因 → PR</text>
    <line x1="442" y1="208" x2="592" y2="208" class="rule-soft"/>
    <text x="442" y="224" class="t" font-size="8.2" font-weight="800">SMITHTUNE</text>
    <text x="442" y="235" class="m" font-size="6.2">最佳軌跡</text>
    <text x="442" y="254" class="f" font-size="6.2">決策模型讓篩選</text>
    <text x="442" y="264" class="f" font-size="6.2">變得便宜</text>
    <line x1="604" y1="120" x2="618" y2="120" class="arrow" marker-end="url(#lake-f1-arrow)"/>
    <rect x="620" y="52" width="76" height="108" class="codebox"/>
    <text x="630" y="70" class="f" font-size="6.2" letter-spacing="0.6">部署</text>
    <text x="630" y="90" class="t" font-size="11" font-weight="800">v+1</text>
    <text x="630" y="106" class="m" font-size="6.2">已標記</text>
    <text x="630" y="119" class="m" font-size="6.2">已審查</text>
    <text x="630" y="132" class="m" font-size="6.2">可回滾</text>
    <text x="630" y="148" class="f" font-size="5.8">核准關卡</text>
    <line x1="658" y1="160" x2="658" y2="170" class="arrow" marker-end="url(#lake-f1-arrow)"/>
    <rect x="620" y="172" width="76" height="96" class="box"/>
    <text x="630" y="190" class="f" font-size="6.2" letter-spacing="0.6">生產環境</text>
    <text x="630" y="210" class="t" font-size="8.2" font-weight="800">新執行</text>
    <text x="630" y="226" class="m" font-size="6.2">新 trace</text>
    <text x="630" y="239" class="m" font-size="6.2">新 outcome</text>
    <text x="630" y="258" class="f" font-size="6.2">下一輪</text>
    <path d="M658 268 V300 H340 V270" class="arrow" fill="none" marker-end="url(#lake-f1-arrow)"/>
    <text x="500" y="316" class="f" font-size="6.2" text-anchor="middle" letter-spacing="0.6">新的執行會變成新的證據</text>
    <rect x="712" y="52" width="104" height="216" class="dash"/>
    <text x="724" y="70" class="f" font-size="6.4" letter-spacing="0.6">治理</text>
    <text x="724" y="83" class="t mon" font-size="7.4" font-weight="800">證據側欄</text>
    <line x1="724" y1="91" x2="804" y2="91" class="rule-soft"/>
    <text x="724" y="107" class="m" font-size="6.6">政策</text>
    <text x="724" y="125" class="m" font-size="6.6">角色</text>
    <text x="724" y="143" class="m" font-size="6.6">風險登錄簿</text>
    <text x="724" y="161" class="m" font-size="6.6">資料溯源</text>
    <text x="724" y="179" class="m" font-size="6.6">人為監督</text>
    <text x="724" y="197" class="m" font-size="6.6">矯正措施</text>
    <line x1="724" y1="207" x2="804" y2="207" class="rule-soft"/>
    <text x="724" y="223" class="f" font-size="6.2">在 lake 之外，</text>
    <text x="724" y="235" class="f" font-size="6.2">在稽核之內</text>
    <text x="724" y="254" class="f" font-size="6.2">適用於</text>
    <text x="724" y="264" class="f" font-size="6.2">每個階段</text>
    <line x1="24" y1="332" x2="816" y2="332" class="rule"/>
    <text x="24" y="350" class="f" font-size="6.2" letter-spacing="0.8">LAKE 證明什麼</text>
    <text x="24" y="366" class="t" font-size="7.8" font-weight="800">執行 + outcome</text>
    <text x="24" y="379" class="m" font-size="6.2">以穩定 ID 串接</text>
    <text x="300" y="350" class="f" font-size="6.2" letter-spacing="0.8">側欄補上什麼</text>
    <text x="300" y="366" class="t" font-size="7.8" font-weight="800">權限 + 風險 + 矯正</text>
    <text x="300" y="379" class="m" font-size="6.2">lake 無法做的決定</text>
    <text x="576" y="350" class="f" font-size="6.2" letter-spacing="0.8">稽核問什麼</text>
    <text x="576" y="366" class="t" font-size="7.8" font-weight="800">允許 · 有效 · 做了什麼 · 改善</text>
    <text x="576" y="379" class="m" font-size="6.2">四個問題，四種證據</text>
    <text x="420" y="404" class="f" font-size="6.2" text-anchor="middle" letter-spacing="0.5">TRACE 證明活動 // OUTCOME 證明關聯 // 管理系統證明權限</text>
  </svg>
  </div>
  <p class="mfig-fig-src">TRACE + OUTCOME · SMITHDB · 運算 · 部署 · 治理側欄</p>
</figure>

## 稽核員會問的四個問題

LangChain 說，它的 ISO/IEC 42001 稽核，對每個納入範圍的 AI 系統都收斂成四個問題：代理被允許做什麼？你怎麼證明代理有效？你怎麼證明代理做了什麼？你怎麼改善代理？我在這裡沿用這四個問題，因為不論你是否追求驗證，它們都是一份好用的、與供應商無關的清單。

| 問題 | 證據產物 | 能證明什麼 | 還缺什麼 |
| :--- | :--- | :--- | :--- |
| 允許 | 工作區權限、憑證模型、工具 Auto/Ask、提示詞標籤 | 邊界已被定義，並在示範的執行中實際落實 | 邊界是否符合風險評鑑，以及誰接受了剩餘風險 |
| 有效 | 版本化資料集、固定評測器、發佈實驗、資料溯源 | 這次發佈是依照可重現的正確定義受測 | 測試分布是否符合生產，以及評測器本身是否正確 |
| 做了什麼 | 含工具呼叫、錯誤、核准、評測回饋的 trace | 存在執行紀錄，且可以重建一次執行 | 紀錄是否完整、是否可偵測竄改、是否為真 |
| 改善 | Issue、根因分析、PR、迴歸測試 | 失敗被偵測到，並被送進變更流程 | 變更是否處理了根因，以及修正是否持久 |

**允許。** 在 LangSmith Fleet 裡，LangChain 示範三層控制：工作區權限決定有哪些整合、誰能新增能力；代理設定決定代理使用誰的憑證、誰能呼叫它，而「共用憑證」或「呼叫者 OAuth 憑證」的選擇在建立時就固定；工具設定決定每個工具是自動執行，還是停下來等人審查。稽核示範用的是一個設為 Ask 的 Slack 工具。執行暫停，審查者附上理由拒絕，代理回報拒絕，沒有重試。

重點不是「有核准」這件事，而是 trace 記下了暫停、拒絕、理由，以及沒有重試。設定截圖證明的是意圖；trace 證明的是執行。提示詞與上下文的版本控管，對指令也提供同樣的區分：commit 與可移動的標籤，顯示改了什麼、誰改的、當時生產環境是哪個版本。

**有效。** 代理評測的可重現性，不是輸出的可重現性，而是測試的可重現性。LangChain 把資料集與評測器固定住，讓分數的變化可以歸因於代理，而不是考卷。它配套的控制值得借鏡：評測資料只來自 LangChain 自己營運的系統，絕不來自客戶工作區；每個評測測試都記錄範例來源，並附上評分程式碼；變更走 code review；空白答案也能通過的測試會被丟棄；每個評分器都用一個已知正確的答案檢查過。

每一道控制都在回答不同的失敗。溯源回答「資料從哪裡來？」Code review 回答「誰改了測試？」丟掉空白測試回答「這個測試到底量到了什麼？」評分器校準回答「裁判本身對嗎？」合在一起，它們才把一個評測分數從數字變成可辯護的量測。

**做了什麼。** Trace 是最強的證據類別，也是最脆弱的。它在同一筆紀錄裡顯示輸入與輸出、工具呼叫與錯誤，以及一次核准的暫停與恢復。發佈前用的評測，也可以套用在生產 trace 上，把回饋掛回該次執行，讓審查者打開被標記的答案，看見導致它的動作。跟著 trace 一起存下的更正，可以回饋到下一次評測。

這就是稽核員說的活動紀錄。它不是一行寫著「請求成功」的日誌，而是一條可重建的系統路徑，決策點清楚可見。

**改善。** Engine 把重複失敗分組成 issue，在代理原始碼裡追根因，提出一個 PR，並可在人看到之前先用評測集測試修正。稽核員跟著一筆變更走過審查、進到程式碼庫，再看到那些 trace 變成迴歸資料集裡的範例。最後這一步，多數團隊會跳過。合併的 PR 是一筆變更紀錄；只有當它連回一個 finding，並且後面跟著有效性檢查，它才成為矯正措施。

「還缺什麼」那一欄，就是本文的論點。每一件產物都把自己的問題回答得夠好，好到有用；也回答得夠差，差到若被當成全部答案就很危險。

## ISO/IEC 42001 在這裡的角色

ISO/IEC 42001 是 AI 管理系統的國際標準。它可以被驗證，建立在 ISO 各項標準共用的調和式管理系統結構上，並以規劃－執行－檢查－行動（PDCA）循環組織。附錄 A 把控制措施依政策、內部組織、資源、衝擊評鑑、AI 系統生命週期、資料、給利害關係人的資訊、AI 系統的使用，以及第三方關係分組。

驗證不是產品審查。它從管理系統的內部稽核開始。接著由經認可的外部稽核員檢查系統是否照文件所述運作。監督稽核每年重複一次。LangChain 表示，其範圍涵蓋所有在 LangChain 管理的模型上執行推論的 GA LangSmith 功能背後的管理系統，而新推出的 AI 功能每年會加入範圍。

看任何證書，先看範圍。狹窄的範圍可以完全誠實，卻對範圍外的產品部分幾乎什麼都沒說。「我們治理我們自己運行的東西」是一條站得住腳的邊界，但它不等於「我們治理客戶用我們建立的一切」。

PDCA 循環是證據與管理交會的地方。規劃涵蓋範圍、政策、角色、風險與衝擊評鑑、目標。執行涵蓋生命週期控制、資料處理、營運。檢查涵蓋監控、量測、內部稽核、管理審查。行動涵蓋不符合事項、矯正措施、持續改善。證據流入每一個階段，但不取代任何階段。一筆 trace 可以滿足記錄控制，卻不能滿足政策控制、角色控制或衝擊評鑑控制。

LangChain 附錄裡的控制對照，是把控制連到產物的好例子：Fleet 設定對應 A.6.2.2，工具核准對應 A.6.2.3 與 A.9.3，資料集版本與溯源對應 A.7.2 與 A.7.5，實驗對應 A.6.2.4，trace 對應 A.6.2.8，線上評測與告警對應 A.6.2.6 與條文 9.1，Engine 對應條文 10.1 與 10.2。這張對照表是 LangChain 的，不是稽核員的。產物是否真的滿足一項控制，由稽核員判定。部落格裡的一張表，是關於適用性的主張，不是適用性的證明。但小心使用的話，這張表顯示了一個真正的證據計畫的形狀：每一項控制都應該指向一件產物、一位負責人、一個測試。

<figure class="mfig-fig">
  <figcaption>
    <span class="card-tag">證據地圖 // 02</span>
    <h3 class="mfig-fig-title">四個問題、一個管理循環，以及夾在中間的產物</h3>
    <p class="mfig-fig-sub">每個稽核問題對應一種證據類別，也對應規劃－執行－檢查－行動循環的一個階段。產物來自 lake；政策、角色、衝擊評鑑、風險接受與管理審查則不是。</p>
  </figcaption>
  <div class="mfig-scroll">
  <svg class="mfig-svg" viewBox="0 0 840 420" role="img" aria-labelledby="lake-f2-title lake-f2-desc">
    <title id="lake-f2-title">ISO/IEC 42001 證據地圖</title>
    <desc id="lake-f2-desc">四個稽核問題——允許、有效、做了什麼、改善——分別對應權限與提示詞標籤、版本化評測與溯源、trace 與核准，以及 issue 與迴歸測試。每一列也對應規劃、執行、檢查或行動階段，以及附錄 A 條文。政策、角色、衝擊評鑑、風險接受、內部稽核與管理審查，位在 lake 之外、管理系統之內。</desc>
    <defs>
      <marker id="lake-f2-arrow" viewBox="0 0 5 5" refX="4.4" refY="2.5" markerWidth="5" markerHeight="5" markerUnits="userSpaceOnUse" orient="auto"><path d="M0 0 L5 2.5 L0 5 z" fill="var(--mono-ink)"/></marker>
    </defs>
    <text x="24" y="18" class="f" font-size="7.5" letter-spacing="1.2">ISO/IEC 42001 // 證據地圖</text>
    <text x="816" y="18" class="f" font-size="7.5" text-anchor="end" letter-spacing="1">四個問題 // 一個循環</text>
    <line x1="24" y1="26" x2="816" y2="26" class="rule"/>
    <rect x="24" y="46" width="184" height="62" class="term"/>
    <text x="36" y="62" class="f" font-size="6.2" letter-spacing="0.6">Q1 // 允許</text>
    <text x="36" y="80" class="t" font-size="9.6" font-weight="800">它可以做什麼？</text>
    <text x="36" y="94" class="m" font-size="6.2">權限與監督</text>
    <rect x="216" y="46" width="236" height="62" class="box"/>
    <text x="228" y="62" class="f" font-size="6.2" letter-spacing="0.6">證據</text>
    <text x="228" y="78" class="m" font-size="6.4">工作區權限</text>
    <text x="228" y="90" class="m" font-size="6.4">憑證模型 · Auto / Ask</text>
    <text x="228" y="102" class="m" font-size="6.4">提示詞標籤 · 核准者</text>
    <rect x="460" y="46" width="92" height="62" class="codebox"/>
    <text x="470" y="62" class="f" font-size="6.2" letter-spacing="0.6">附錄 A</text>
    <text x="470" y="78" class="t mono" font-size="6.6">A.6.2.2</text>
    <text x="470" y="90" class="t mono" font-size="6.6">A.6.2.3</text>
    <text x="470" y="102" class="f" font-size="6.0">規劃</text>
    <rect x="24" y="114" width="184" height="62" class="box"/>
    <text x="36" y="130" class="f" font-size="6.2" letter-spacing="0.6">Q2 // 有效</text>
    <text x="36" y="148" class="t" font-size="9.6" font-weight="800">如何證明它有效？</text>
    <text x="36" y="162" class="m" font-size="6.2">查證與確認</text>
    <rect x="216" y="114" width="236" height="62" class="term"/>
    <text x="228" y="130" class="f" font-size="6.2" letter-spacing="0.6">證據</text>
    <text x="228" y="146" class="m" font-size="6.4">版本化資料集 · 固定評測器</text>
    <text x="228" y="158" class="m" font-size="6.4">發佈實驗</text>
    <text x="228" y="170" class="m" font-size="6.4">資料溯源 · 來源血緣</text>
    <rect x="460" y="114" width="92" height="62" class="codebox"/>
    <text x="470" y="130" class="f" font-size="6.2" letter-spacing="0.6">附錄 A</text>
    <text x="470" y="146" class="t mono" font-size="6.6">A.6.2.4</text>
    <text x="470" y="158" class="t mono" font-size="6.6">A.7.2 · A.7.5</text>
    <text x="470" y="170" class="f" font-size="6.0">執行 / 檢查</text>
    <rect x="24" y="182" width="184" height="62" class="term"/>
    <text x="36" y="198" class="f" font-size="6.2" letter-spacing="0.6">Q3 // 做了什麼</text>
    <text x="36" y="216" class="t" font-size="9.6" font-weight="800">它做了什麼？</text>
    <text x="36" y="230" class="m" font-size="6.2">記錄與監控</text>
    <rect x="216" y="182" width="236" height="62" class="box"/>
    <text x="228" y="198" class="f" font-size="6.2" letter-spacing="0.6">證據</text>
    <text x="228" y="214" class="m" font-size="6.4">trace · 工具呼叫 · 錯誤</text>
    <text x="228" y="226" class="m" font-size="6.4">核准 · 暫停 / 恢復</text>
    <text x="228" y="238" class="m" font-size="6.4">評測回饋 · 更正</text>
    <rect x="460" y="182" width="92" height="62" class="codebox"/>
    <text x="470" y="198" class="f" font-size="6.2" letter-spacing="0.6">附錄 A</text>
    <text x="470" y="214" class="t mono" font-size="6.6">A.6.2.8</text>
    <text x="470" y="226" class="t mono" font-size="6.6">條文 9.1</text>
    <text x="470" y="238" class="f" font-size="6.0">檢查</text>
    <rect x="24" y="250" width="184" height="62" class="box"/>
    <text x="36" y="266" class="f" font-size="6.2" letter-spacing="0.6">Q4 // 改善</text>
    <text x="36" y="284" class="t" font-size="9.6" font-weight="800">如何改善它？</text>
    <text x="36" y="298" class="m" font-size="6.2">矯正措施</text>
    <rect x="216" y="250" width="236" height="62" class="term"/>
    <text x="228" y="266" class="f" font-size="6.2" letter-spacing="0.6">證據</text>
    <text x="228" y="282" class="m" font-size="6.4">issue · 根因分析</text>
    <text x="228" y="294" class="m" font-size="6.4">PR · 迴歸測試</text>
    <text x="228" y="306" class="m" font-size="6.4">有效性檢查</text>
    <rect x="460" y="250" width="92" height="62" class="codebox"/>
    <text x="470" y="266" class="f" font-size="6.2" letter-spacing="0.6">條文</text>
    <text x="470" y="282" class="t mono" font-size="6.6">10.1</text>
    <text x="470" y="294" class="t mono" font-size="6.6">10.2</text>
    <text x="470" y="306" class="f" font-size="6.0">行動</text>
    <text x="24" y="334" class="f" font-size="6.2" letter-spacing="0.6">每一列是一項控制目標，不是一個功能。</text>
    <text x="24" y="348" class="m" font-size="6.4">產物是必要的；是否充分，由管理系統決定。</text>
    <text x="568" y="44" class="f" font-size="6.4" letter-spacing="0.6">管理系統 // PDCA</text>
    <rect x="580" y="56" width="104" height="88" class="box"/>
    <text x="592" y="74" class="f" font-size="6.4" letter-spacing="0.6">規劃</text>
    <text x="592" y="92" class="m" font-size="6.2">範圍 · 政策</text>
    <text x="592" y="104" class="m" font-size="6.2">角色</text>
    <text x="592" y="116" class="m" font-size="6.2">風險 + 衝擊</text>
    <text x="592" y="128" class="m" font-size="6.2">目標</text>
    <line x1="684" y1="100" x2="698" y2="100" class="arrow" marker-end="url(#lake-f2-arrow)"/>
    <rect x="700" y="56" width="104" height="88" class="term"/>
    <text x="712" y="74" class="f" font-size="6.4" letter-spacing="0.6">執行</text>
    <text x="712" y="92" class="m" font-size="6.2">生命週期</text>
    <text x="712" y="104" class="m" font-size="6.2">資料處理</text>
    <text x="712" y="116" class="m" font-size="6.2">營運</text>
    <text x="712" y="128" class="m" font-size="6.2">控制</text>
    <line x1="752" y1="144" x2="752" y2="160" class="arrow" marker-end="url(#lake-f2-arrow)"/>
    <rect x="700" y="162" width="104" height="88" class="box"/>
    <text x="712" y="180" class="f" font-size="6.4" letter-spacing="0.6">檢查</text>
    <text x="712" y="198" class="m" font-size="6.2">監控</text>
    <text x="712" y="210" class="m" font-size="6.2">量測</text>
    <text x="712" y="222" class="m" font-size="6.2">內部稽核</text>
    <text x="712" y="234" class="m" font-size="6.2">管理審查</text>
    <line x1="698" y1="206" x2="686" y2="206" class="arrow" marker-end="url(#lake-f2-arrow)"/>
    <rect x="580" y="162" width="104" height="88" class="term"/>
    <text x="592" y="180" class="f" font-size="6.4" letter-spacing="0.6">行動</text>
    <text x="592" y="198" class="m" font-size="6.2">不符合事項</text>
    <text x="592" y="210" class="m" font-size="6.2">矯正措施</text>
    <text x="592" y="222" class="m" font-size="6.2">有效性</text>
    <text x="592" y="234" class="m" font-size="6.2">改善</text>
    <line x1="632" y1="162" x2="632" y2="146" class="arrow" marker-end="url(#lake-f2-arrow)"/>
    <rect x="568" y="268" width="248" height="96" class="dash"/>
    <text x="580" y="286" class="f" font-size="6.2" letter-spacing="0.6">LAKE 之外 // AIMS 之內</text>
    <text x="580" y="304" class="m" font-size="6.4">政策 · 角色 · 當責</text>
    <text x="580" y="318" class="m" font-size="6.4">衝擊評鑑 · 風險接受</text>
    <text x="580" y="332" class="m" font-size="6.4">適用性聲明</text>
    <text x="580" y="346" class="m" font-size="6.4">內部稽核 · 管理審查</text>
    <text x="580" y="358" class="f" font-size="6.0">這些屬於 AIMS，不屬於 trace 儲存</text>
    <text x="568" y="386" class="f" font-size="6.2">TRACE 回答發生了什麼。</text>
    <text x="568" y="400" class="f" font-size="6.2">AIMS 回答誰有權做決定。</text>
  </svg>
  </div>
  <p class="mfig-fig-src">允許 · 有效 · 做了什麼 · 改善 · 規劃 · 執行 · 檢查 · 行動</p>
</figure>

案例研究裡最有意思的是 Security Agent。LangChain 用 Deep Agents 建構它、在 LangSmith 上運行它、用它把兩人治理團隊的產能放大，並且讓它自己的執行也留下 trace，工具使用和其他代理一樣的核准設定。政策、評鑑、稽核回覆都經過這個代理；它對環境、盤點、程式碼與過去決定的知識，每運行一次就累積一次。

遞迴本身就是重點。如果治理職能自己也是代理，它的執行、權限、核准就必須位在同一層證據裡。否則系統裡權力最大的代理，會是證據最少的那一個。LangChain 的答案是人工審查，以及把更正回饋給代理。這是合理的控制，但它需要自己的紀錄：誰審查、改了什麼、怎麼知道改對了。

這個案例不是模板。兩人團隊、範圍狹窄，可以把很多文件工作自動化。大型企業有遺留系統、產業監管機關、勞資會議，面對的是不同的問題，也有不同的風險胃納。可以轉移的是證據的架構，不是組織圖。

## 改善循環就是一項控制

改善循環常被描述成一條功能鏈：線上評測、AI Search、Insights、Engine、SmithTune。把它讀成一條控制鏈更有用：每一環都把一個訊號轉換成另一種紀錄。

線上評測器定義失敗。幻覺、毒性、使用者滿意度不是中性的量測，而是用分數表達的政策選擇。你定義評測器的那一刻，就定義了什麼算缺陷。這是包裝成指標的治理決定，應該放進風險評鑑，而不是只放在可觀測性儀表板。

AI Search 與 Insights 定義母體。AI Search 讓人用自然語言問問題，再由決策模型對結果套語意篩選。Insights 把近期 trace 分組，並持續把新對話歸進類別。分群告訴你哪些失敗常見，不會告訴你哪些失敗嚴重。嚴重性是風險判斷，必須從分群之外進來。

Engine 定義修正。它定期掃描 trace、把重複失敗分成 issue、追查根因、開 PR；從第二版起，還能在人看到之前先用評測集測試修正。控制不是自動化，控制是審查關卡：有人確認 issue 是真的、根因說得通、修正是可接受的。少了這道關卡的自動化，只會產生更快的未審查變更佇列。

PR 與迴歸測試定義記憶。沒有被寫成測試的修正，是組織會丟失的修正。LangChain 的循環把失敗背後的 trace 變成評測資料集裡的範例，失敗於是成為後續版本的迴歸測試。這就是修好代理與改善代理的差別。

SmithTune 定義模型。用最佳軌跡微調很吸引人，因為 lake 裡已經有語料。LangChain 公布的結果——微調後的 Kimi K3 在內部 IssueBench 子集上 96 分，基礎模型 90 分，GPT-5.6 Sol 87 分——是廠商在廠商任務上的基準。它證明方法可能可行，不證明在你的流量上可行。微調後的模型也是一次新發佈，需要和其他變更一樣的評測、核准、回滾路徑，而不是一場慶功。

人工核准與提示詞版本控管是控制，不是功能。Auto 與 Ask 只有在核准被記錄、核准者有權、拒絕被尊重、紀錄被保留時才有意義。版本控管只有在發佈有標籤、diff 被審查、可以回滾時才有意義。一個寫著「需要核准」的按鈕是設定；一筆被拒絕動作的 trace，才是控制確實運作的證據。

條文 10.1 與 10.2 在這裡變得具體。持續改善需要 finding、根因、行動、有效性審查。不符合事項與矯正措施需要同一條鏈，再加上一個決定：已經出錯的輸出要怎麼處理。沒有 finding 的 PR 是維護。沒有有效性檢查的 finding 是祈禱。

## 不導入 LangSmith 也能複製的事

你不需要 SmithDB 才能建證據層。你需要 schema、保留政策，以及把證據當成有使用者的產品來經營的紀律。下面這份清單刻意與供應商無關。每一項的測試不是「我們有沒有工具？」而是「有人提出要求時，我們拿不拿得出產物？」

1. **Trace schema。** Span 要有父子連結、thread 識別碼、模型與工具版本、開始與結束時間、狀態、核准事件，以及明確的遮罩標記。測試：你能不能只用一次查詢重建一次執行，不必 join 五份應用程式日誌？
2. **Outcome 連結。** 從 trace 或 thread 到 outcome 的穩定識別碼、宣告的基數、來源、時間戳，以及負面結果。測試：你能不能算出每個版本、每個使用情境的成功率，並解釋分母？
3. **不可變保留。** 僅附加儲存、每筆紀錄的雜湊或簽章、可信時鐘，以及區分到期與法律保留的刪除政策。測試：管理員能不能悄悄修改一筆 trace？答案應該是不行。
4. **評測版本控管。** 資料集的內容雜湊、評測器與裁判模型的版本、執行設定，以及把三者釘住的 CI 工作。測試：分數改變時，你能分辨是代理、資料，還是裁判變了？
5. **核准紀錄。** 誰核准或拒絕、實際看到什麼、何時、依據哪條政策、理由是什麼。把紀錄綁到它授權的工具呼叫。測試：你能不能拿出一筆被拒絕的動作，並證明它沒有執行？
6. **資料溯源。** 來源系統、同意或授權、轉換過程，以及客戶資料是否被排除。血緣要追到單一評測範例。測試：你能不能把每個測試案例追到一個被允許的來源？
7. **存取控制。** 證據儲存採最小權限，因為 trace 含提示詞、輸出，有時還有個資。讀取也要記錄，不是只記寫入。測試：誰能讀含 PII 的 trace，那次存取有被稽核嗎？
8. **風險登錄簿。** 代理盤點、使用情境、自主程度、資料類別、受影響對象、負責人，以及剩餘風險的接受。測試：每個生產代理是否都有具名負責人與現行評鑑？
9. **矯正措施。** Finding、根因、行動、負責人、期限、有效性檢查、結案紀錄。測試：你能不能拿出一筆修好之後又復發的失敗，並說明後來怎麼處理？

最小紀錄可以很小。重點是那些欄位在稽核開口之前就存在：

```json
{
  "trace_id": "tr_example",
  "thread_id": "th_example",
  "agent": "release-triage@2026.11.3",
  "spans": [
    {"span_id": "s1", "type": "model", "prompt_ref": "commit:9f3c2a"},
    {"span_id": "s2", "type": "tool", "tool": "github.open_pr", "approval": "ask", "decision": "approved", "approver": "u_example"}
  ],
  "outcome": {"type": "merged_pr", "ref": "PR-example", "source": "system"},
  "retention": {"policy": "evidence-7y", "legal_hold": false}
}
```

如果你只建兩件事，先建 trace schema 與 outcome 連結。其他事情在它們存在之後都比較容易，因為後續每一件產物——評測範例、issue、PR、迴歸測試——都可以掛在同一組識別碼上。

組織面的項目不是選配。Lake 不能指派當責、不能決定剩餘風險、不能主持管理審查。那些是管理系統的職能，也正是 ISO/IEC 42001 驗證的東西。

## 證據會在哪些地方失效

證據有失效模式。只列好處的文章是銷售文件。嚴重的失效是結構性的。

**Trace 不是真相。** 一筆 trace 是代理對自身行為的說法，經過 SDK 與 instrumentation 中介。Span 可能缺失、抽樣可能掩蓋有問題的那次執行、payload 可能被截斷、遮罩可能刪除真正重要的細節，而工具可能回報成功卻做了別的事。Trace 證明系統記錄了一個事件；它不證明事件真的照紀錄發生。

**PII 與保留。** 你需要的證據，和你根本不該留下的資料，往往是同一批位元組。保留越久，稽核價值與隱私風險一起上升。法律保留、刪除請求、跨境傳輸、角色權限，全都適用於 lake。遮罩保護人，但也摧毀證據。政策必須逐欄位選擇要接受哪一種風險。

**評測器漂移。** LLM 裁判是一臺量測儀器，會隨著模型、提示詞或校準改變。三月的分數與十一月的同一個分數，可能不是同一件事。把裁判版本化、用已知答案重新校準，並保留一份人工標註的樣本當參考。否則改善循環是在對著一個會移動的「好」的定義做最佳化。

**過度自動化。** Engine 提出 PR 的速度，可能快過團隊審查的速度。核准疲勞會把控制變成一個按鈕。一個永遠不會拒絕任何東西的審查佇列，和沒有審查沒有兩樣。解法不是減少自動化，而是抽樣、升級門檻，以及定期測試控制本身，包括刻意拒絕。

**稽核軌跡完整性。** 誰能刪除一筆 trace？誰能改保留規則？誰能在發佈前關閉評測器？如果答案是「管理員，而且無聲無息」，證據層就有內部人風險。把管理平面與證據平面分開，讓刪除成為一筆被記錄的事件，並為稽核匯出簽章副本。

**涵蓋範圍。** Lake 只持有被 instrument 的東西。平台外建置的代理、代理呼叫之間的人工作業、透過 MCP 存取的第三方代理，以及有人拿來記錄真正決定的那張試算表，全都在 schema 之外。稽核範圍是一條邊界，而邊界是管理決定，不是技術預設。

**成本。** 全保真 trace 的儲存與查詢的成本都很高。抽樣降低成本，也削弱證據。分層有幫助，但前提是保留政策在資料量湧入之前就設計好。最便宜的證據，是你決定留下來的證據。

**供應商鎖定。** 一組驗證證據的生命週期，可能比供應商合約更長。要求開放格式匯出、schema 文件、相容於 OpenTelemetry 的 trace，以及清楚的刪除條款。證書不是資料可攜性的保證。

還有一個四個問題沒問的第五題：這個代理該不該存在？四個問題檢驗代理是否被治理，不檢驗它是否正當、誰受益、誰承擔風險、出錯時會怎麼樣。那是衝擊評鑑，也是治理真正開始的地方。效率不是授權。

## 稽核就是一項查詢

如果 schema 對了，稽核大部分只是一項查詢。拿出接觸過那個系統的代理的權限與核准紀錄。拿出資料集、評測器版本與發佈實驗。拿出客訴那一次執行的 trace。拿出後續的 issue、PR 與迴歸測試。稽核員要的不是一個故事，而是那些資料列。

但查詢只有在有人在稽核之前設計好 schema 時才成立。這是 agent lake 的實務教訓，而它比 LangChain 更大。把決策點 instrument 起來，不要只記輸出。把 outcome 存在 trace 旁邊，把變更存在 finding 旁邊。讓管理系統保持權威：lake 是感測器，不是憲法。政策、風險接受、角色、矯正措施都存在於它之外，再多的 trace 也替代不了。

LangChain 的驗證是一個有用的存在性證明。它顯示稽核證據可以來自工程師本來就在用來除錯的 trace，也顯示一個小型治理團隊可以把自己的一部分文件工作自動化，而不失去讓自動化安全的人工審查。它沒有顯示一個 lake 就能讓公司合規，也沒有顯示廠商的範圍涵蓋你的範圍。

Lake 可以告訴你發生過什麼。只有管理系統能告訴你，那件事是否被允許。
