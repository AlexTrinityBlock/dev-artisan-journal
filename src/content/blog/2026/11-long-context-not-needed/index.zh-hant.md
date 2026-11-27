---
title: "你不需要長上下文：一個習慣的七倍代價"
description: "細讀 arXiv:2611.05306：壓縮（compaction）與選擇性閱讀，讓前沿模型追上長上下文基線，同時把估計服務成本壓低最多 233×。代價不在準確率，而在於你得知道該留下什麼。"
pubDate: 2026-11-14
category: "AI"
tags: ["長上下文", "代理", "壓縮", "LLM", "論文筆記"]
featured: false
author: "Alex.Hsiao"
readTime: "30 分鐘"
cardImage: "./cover.webp"
cardImageAlt: "圖表顯示三個模型生成一百萬輸出 token 的成本隨上下文長度急遽上升"
---

# 你不需要長上下文：一個習慣的七倍代價

<svg class="lcx-sprite" aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg"><defs><symbol id="lcx-i-activity" viewBox="0 0 24 24"><path d="M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2"/></symbol><symbol id="lcx-i-archive" viewBox="0 0 24 24"><rect width="20" height="5" x="2" y="3" rx="1"/><path d="M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8m-10 4h4"/></symbol><symbol id="lcx-i-arrow-up-down" viewBox="0 0 24 24"><path d="m21 16l-4 4l-4-4m4 4V4M3 8l4-4l4 4M7 4v16"/></symbol><symbol id="lcx-i-book-open" viewBox="0 0 24 24"><path d="M12 7v14M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z"/></symbol><symbol id="lcx-i-brain" viewBox="0 0 24 24"><path d="M12 18V5m3 8a4.17 4.17 0 0 1-3-4a4.17 4.17 0 0 1-3 4m8.707-6.706A3 3 0 1 0 12 5a3 3 0 1 0-5.707 1.294"/><path d="M17.996 5.125a4 4 0 0 1 2.526 5.77"/><path d="M18 18a4 4 0 0 0 2-7.465"/><path d="M19.967 17.482a4 4 0 1 1-7.967.517a4 4 0 1 1-7.967-.517"/><path d="M6 18a4 4 0 0 1-2-7.465"/><path d="M6.004 5.125a4 4 0 0 0-2.526 5.77"/></symbol><symbol id="lcx-i-chart-no-axes-column" viewBox="0 0 24 24"><path d="M5 21v-6m7 6V3m7 18V9"/></symbol><symbol id="lcx-i-clipboard-list" viewBox="0 0 24 24"><rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2m4 7h4m-4 5h4m-8-5h.01M8 16h.01"/></symbol><symbol id="lcx-i-coins" viewBox="0 0 24 24"><path d="M13.744 17.736a6 6 0 1 1-7.48-7.48M15 6h1v4"/><path d="m6.134 14.768l.866-.5l2 3.464"/><circle cx="16" cy="8" r="6"/></symbol><symbol id="lcx-i-database" viewBox="0 0 24 24"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v14a9 3 0 0 0 18 0V5"/><path d="M3 12a9 3 0 0 0 18 0"/></symbol><symbol id="lcx-i-file-text" viewBox="0 0 24 24"><path d="M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z"/><path d="M14 2v5a1 1 0 0 0 1 1h5M10 9H8m8 4H8m8 4H8"/></symbol><symbol id="lcx-i-flask-conical" viewBox="0 0 24 24"><path d="M14 2v6a2 2 0 0 0 .245.96l5.51 10.08A2 2 0 0 1 18 22H6a2 2 0 0 1-1.755-2.96l5.51-10.08A2 2 0 0 0 10 8V2M6.453 15h11.094M8.5 2h7"/></symbol><symbol id="lcx-i-gauge" viewBox="0 0 24 24"><path d="m12 14l4-4M3.34 19a10 10 0 1 1 17.32 0"/></symbol><symbol id="lcx-i-git-branch" viewBox="0 0 24 24"><path d="M15 6a9 9 0 0 0-9 9V3"/><circle cx="18" cy="6" r="3"/><circle cx="6" cy="18" r="3"/></symbol><symbol id="lcx-i-history" viewBox="0 0 24 24"><path d="M3 12a9 9 0 1 0 9-9a9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5m4-1v5l4 2"/></symbol><symbol id="lcx-i-layers" viewBox="0 0 24 24"><path d="M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83z"/><path d="M2 12a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 12"/><path d="M2 17a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 17"/></symbol><symbol id="lcx-i-list-filter" viewBox="0 0 24 24"><path d="M2 5h20M6 12h12m-9 7h6"/></symbol><symbol id="lcx-i-memory-stick" viewBox="0 0 24 24"><path d="M12 12v-2m0 8v-2m4-4v-2m0 8v-2M2 11h1.5M20 18v-2m.5-5H22M4 18v-2m4-4v-2m0 8v-2"/><rect width="20" height="10" x="2" y="6" rx="2"/></symbol><symbol id="lcx-i-messages-square" viewBox="0 0 24 24"><path d="M16 10a2 2 0 0 1-2 2H6.828a2 2 0 0 0-1.414.586l-2.202 2.202A.71.71 0 0 1 2 14.286V4a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2zm4-1a2 2 0 0 1 2 2v10.286a.71.71 0 0 1-1.212.502l-2.202-2.202A2 2 0 0 0 17.172 19H10a2 2 0 0 1-2-2v-1"/></symbol><symbol id="lcx-i-network" viewBox="0 0 24 24"><rect width="6" height="6" x="16" y="16" rx="1"/><rect width="6" height="6" x="2" y="16" rx="1"/><rect width="6" height="6" x="9" y="2" rx="1"/><path d="M5 16v-3a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v3m-7-4V8"/></symbol><symbol id="lcx-i-radar" viewBox="0 0 24 24"><path d="M19.07 4.93A10 10 0 0 0 6.99 3.34M4 6h.01M2.29 9.62a10 10 0 1 0 19.02-1.27"/><path d="M16.24 7.76a6 6 0 1 0-8.01 8.91M12 18h.01m5.98-6.34a6 6 0 0 1-2.22 5.01"/><circle cx="12" cy="12" r="2"/><path d="m13.41 10.59l5.66-5.66"/></symbol><symbol id="lcx-i-repeat" viewBox="0 0 24 24"><path d="m17 2l4 4l-4 4"/><path d="M3 11v-1a4 4 0 0 1 4-4h14M7 22l-4-4l4-4"/><path d="M21 13v1a4 4 0 0 1-4 4H3"/></symbol><symbol id="lcx-i-route" viewBox="0 0 24 24"><circle cx="6" cy="19" r="3"/><path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15"/><circle cx="18" cy="5" r="3"/></symbol><symbol id="lcx-i-scan-search" viewBox="0 0 24 24"><path d="M3 7V5a2 2 0 0 1 2-2h2m10 0h2a2 2 0 0 1 2 2v2m0 10v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2"/><circle cx="12" cy="12" r="3"/><path d="m16 16l-1.9-1.9"/></symbol><symbol id="lcx-i-scissors" viewBox="0 0 24 24"><circle cx="6" cy="6" r="3"/><path d="M8.12 8.12L12 12m8-8L8.12 15.88"/><circle cx="6" cy="18" r="3"/><path d="M14.8 14.8L20 20"/></symbol><symbol id="lcx-i-shield-check" viewBox="0 0 24 24"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12l2 2l4-4"/></symbol><symbol id="lcx-i-target" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></symbol><symbol id="lcx-i-timer" viewBox="0 0 24 24"><path d="M10 2h4m-2 12l3-3"/><circle cx="12" cy="14" r="8"/></symbol><symbol id="lcx-i-triangle-alert" viewBox="0 0 24 24"><path d="m21.73 18l-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3M12 9v4m0 4h.01"/></symbol><symbol id="lcx-i-users" viewBox="0 0 24 24"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M16 3.128a4 4 0 0 1 0 7.744M22 21v-2a4 4 0 0 0-3-3.87"/><circle cx="9" cy="7" r="4"/></symbol><symbol id="lcx-i-workflow" viewBox="0 0 24 24"><rect width="8" height="8" x="3" y="3" rx="2"/><path d="M7 11v4a2 2 0 0 0 2 2h4"/><rect width="8" height="8" x="13" y="13" rx="2"/></symbol><symbol id="lcx-i-clock" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></symbol><symbol id="lcx-i-search" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></symbol><symbol id="lcx-i-terminal" viewBox="0 0 24 24"><polyline points="4 17 10 11 4 5"/><line x1="12" x2="20" y1="19" y2="19"/></symbol><symbol id="lcx-i-check" viewBox="0 0 24 24"><path d="M20 6 9 17l-5-5"/></symbol><symbol id="lcx-i-x" viewBox="0 0 24 24"><path d="M18 6 6 18M6 6l12 12"/></symbol><symbol id="lcx-i-arrow-right" viewBox="0 0 24 24"><path d="M5 12h14m-6-6 6 6-6 6"/></symbol><symbol id="lcx-i-folder-open" viewBox="0 0 24 24"><path d="m6 14 1.5-2.9A2 2 0 0 1 9.24 10H20a2 2 0 0 1 1.94 2.5l-1.54 6a2 2 0 0 1-1.95 1.5H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.69.9l.81 1.2a2 2 0 0 0 1.67.9H18a2 2 0 0 1 2 2v2"/></symbol><symbol id="lcx-i-receipt" viewBox="0 0 24 24"><path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z"/><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"/><path d="M12 17.5v-11"/></symbol><symbol id="lcx-i-banknote" viewBox="0 0 24 24"><rect width="20" height="12" x="2" y="6" rx="2"/><circle cx="12" cy="12" r="2"/><path d="M6 12h.01M18 12h.01"/></symbol><symbol id="lcx-i-scale" viewBox="0 0 24 24"><path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="M7 21h10"/><path d="M12 3v18"/><path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2"/></symbol><symbol id="lcx-i-trending-down" viewBox="0 0 24 24"><polyline points="22 17 13.5 8.5 8.5 13.5 2 7"/><polyline points="16 17 22 17 22 11"/></symbol><symbol id="lcx-i-zap" viewBox="0 0 24 24"><path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"/></symbol><symbol id="lcx-i-cpu" viewBox="0 0 24 24"><rect width="16" height="16" x="4" y="4" rx="2"/><rect width="6" height="6" x="9" y="9" rx="1"/><path d="M15 2v2M15 20v2M2 15h2M2 9h2M20 15h2M20 9h2M9 2v2M9 20v2"/></symbol><symbol id="lcx-i-hard-drive" viewBox="0 0 24 24"><line x1="22" x2="2" y1="12" y2="12"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/><line x1="6" x2="6.01" y1="16" y2="16"/><line x1="10" x2="10.01" y1="16" y2="16"/></symbol><symbol id="lcx-i-eye" viewBox="0 0 24 24"><path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"/><circle cx="12" cy="12" r="3"/></symbol><symbol id="lcx-i-boxes" viewBox="0 0 24 24"><path d="M2.97 12.92A2 2 0 0 0 2 14.63v3.24a2 2 0 0 0 .97 1.71l3 1.8a2 2 0 0 0 2.06 0L12 19v-5.5l-5-3-4.03 2.42Z"/><path d="m7 16.5-4.74-2.85M7 16.5l5-3M7 16.5v5.17M12 13.5V19l3.97 2.38a2 2 0 0 0 2.06 0l3-1.8a2 2 0 0 0 .97-1.71v-3.24a2 2 0 0 0-.97-1.71L17 10.5l-5 3Z"/><path d="m17 16.5-5-3M17 16.5l4.74-2.85M17 16.5v5.17"/></symbol><symbol id="lcx-i-compass" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88"/></symbol><symbol id="lcx-i-map" viewBox="0 0 24 24"><path d="M14.106 5.553a2 2 0 0 0 1.788 0l3.659-1.83A1 1 0 0 1 21 4.619v12.764a1 1 0 0 1-.553.894l-4.553 2.277a2 2 0 0 1-1.788 0l-4.212-2.106a2 2 0 0 0-1.788 0l-3.659 1.83A1 1 0 0 1 3 19.381V6.618a1 1 0 0 1 .553-.894l4.553-2.277a2 2 0 0 1 1.788 0z"/><path d="M15 5.764v15M9 3.236v15"/></symbol><symbol id="lcx-i-key-round" viewBox="0 0 24 24"><path d="M2.586 17.414A2 2 0 0 0 2 18.828V21a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h1a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h.172a2 2 0 0 0 1.414-.586l.814-.814a6.5 6.5 0 1 0-4-4z"/><circle cx="16.5" cy="7.5" r=".5" fill="currentColor"/></symbol><symbol id="lcx-i-lock" viewBox="0 0 24 24"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></symbol><symbol id="lcx-i-signpost" viewBox="0 0 24 24"><path d="M12 13v8M12 3v3"/><path d="M18 6a2 2 0 0 1 1.387.56l2.307 2.22a1 1 0 0 1 0 1.44l-2.307 2.22A2 2 0 0 1 18 13H6a2 2 0 0 1-1.387-.56l-2.306-2.22a1 1 0 0 1 0-1.44l2.306-2.22A2 2 0 0 1 6 6z"/></symbol><symbol id="lcx-i-hourglass" viewBox="0 0 24 24"><path d="M5 22h14M5 2h14"/><path d="M17 22v-4.172a2 2 0 0 0-.586-1.414L12 12l-4.414 4.414A2 2 0 0 0 7 17.828V22"/><path d="M7 2v4.172a2 2 0 0 0 .586 1.414L12 12l4.414-4.414A2 2 0 0 0 17 6.172V2"/></symbol><symbol id="lcx-i-circle-dot" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="1"/></symbol><symbol id="lcx-i-notebook-pen" viewBox="0 0 24 24"><path d="M13.4 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7.4"/><path d="M2 6h4M2 10h4M2 14h4M2 18h4"/><path d="M21.378 5.626a1 1 0 1 0-3.004-3.004l-5.01 5.012a2 2 0 0 0-.506.854l-.837 2.87a.5.5 0 0 0 .62.62l2.87-.837a2 2 0 0 0 .854-.506z"/></symbol><symbol id="lcx-i-panel-top" viewBox="0 0 24 24"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18"/></symbol><symbol id="lcx-i-bot" viewBox="0 0 24 24"><path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2M20 14h2M15 13v2M9 13v2"/></symbol><symbol id="lcx-i-message-circle" viewBox="0 0 24 24"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/></symbol><symbol id="lcx-i-square-stack" viewBox="0 0 24 24"><path d="M4 10c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h4c1.1 0 2 .9 2 2"/><path d="M10 16c-1.1 0-2-.9-2-2v-4c0-1.1.9-2 2-2h4c1.1 0 2 .9 2 2"/><rect width="8" height="8" x="14" y="14" rx="2"/></symbol><symbol id="lcx-i-split" viewBox="0 0 24 24"><path d="M16 3h5v5M8 3H3v5M12 22v-8.3a4 4 0 0 0-1.172-2.872L3 3M15 9l6-6"/></symbol><symbol id="lcx-i-merge" viewBox="0 0 24 24"><path d="m8 6 4-4 4 4"/><path d="M12 2v10.3a4 4 0 0 1-1.172 2.872L3 23"/><path d="m15 9 6 6"/></symbol></defs></svg>

每個模型供應商賣同一個數字，手法就像電信商賣「不限量」：一個上下文視窗，通常是幾十萬 token，偶爾一百萬。言下之意是視窗越大、能力越強。把整個程式碼儲存庫貼進來。把整份合約貼進來。把一整年的客服工單貼進來。模型都裝得下。

本文會反覆用到三個單位。**token** 是模型讀取與計費的文字單位，大約是英文單字的三分之四。**代理（agent）** 是能呼叫工具、在迴圈中採取動作的模型，不是只回答一次。**基線（baseline）** 是你拿來對照的參考設定；沒有基線，分數就只是個數字。

一篇由十二位作者合寫的新論文，**〈你不需要長上下文〉**（arXiv:2611.05306），從一個不太尋常的方向攻擊這個假設。它沒有主張模型在長輸入上會失敗。它主張的是更令人不安的事：**長輸入通常根本不需要待在上下文裡**——而把它留在那裡，代價高昂，只是零售價目表把這件事藏了起來。

論文提出三個實證主張，各自對應不同的工作負載：

1. **長流程任務**——會執行許多動作的代理——可以在每次對話結束時把歷史壓縮（compaction），總上下文維持在 8K–48K 之間，準確率大致持平，有時還更好。
2. **長輸入任務**——在大份文件上做問答——可以把文件存成檔案，讓代理用 `grep`、`sed`、`head`、`tail` 選擇性閱讀，準確率通常**更高**，勝過把全部內容貼進 prompt。
3. **單動作壓縮**——每執行一個動作後就丟掉整段對話，只保留一份精簡的自然語言狀態——仍能保住大部分準確率，而峰值上下文的中位數降到 **7K–9K token**。

<div class="lcx-paper-cta">
  <a class="mono-btn-chamfer lcx-paper-btn" href="https://arxiv.org/abs/2611.05306" target="_blank" rel="noopener noreferrer">
    <span class="chamfer-inner">
      <span class="btn-tag">ARXIV</span>
      <span class="btn-label">閱讀論文 ↗</span>
    </span>
  </a>
</div>

標題數字不是準確率的差距，而是一個價格：在 256K token 的上下文下，生成一百萬個輸出 token 的成本，比 16K 時貴 **3.6× 到 7×**，視模型與服務堆疊而定。在長輸入基準測試上，論文估計的最佳化零售成本，Claude Opus 4.5 降為原本的 **1/6.5 到 1/54.6**，GPT 5.6 Sol 降為原本的 **1/4.4 到 1/233.3**。這些倍數是吞吐量模型的估計值，不是帳單——但方向很難忽略。

本文會走完整篇論文：成本論證、三種上下文管理機制、兩組基準測試的每一項、單動作的結果、論文提出的**語意狀態空間模型**、壓縮的配方，以及故事開始破裂的地方。短版結論是：**長上下文不是一種你該預設付費的能力；它是一個你該按任務逐項證明其正當性的服務決策。**

<div class="lcx-kicker"><svg class="lcx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#lcx-i-scan-search"></use></svg>一螢幕讀完論文</div>

## 五個數字，一個論點

<div class="lcx-stat-grid">
  <div class="lcx-stat">
    <div class="lcx-stat-top"><svg class="lcx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#lcx-i-banknote"></use></svg><span>成本倍率</span></div>
    <div class="lcx-stat-num">3.6–7×</div>
    <p>在論文的三個開放權重服務部署上，256K 上下文生成 token 比 16K 更貴。</p>
  </div>
  <div class="lcx-stat">
    <div class="lcx-stat-top"><svg class="lcx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#lcx-i-gauge"></use></svg><span>長流程</span></div>
    <div class="lcx-stat-num">−3.7 / +5.6</div>
    <p>Opus 4.5 在 22 種壓縮設定下最差與最好的準確率變化，單位為百分點。GPT 5.6 Sol：−3.3 / +4.4。</p>
  </div>
  <div class="lcx-stat">
    <div class="lcx-stat-top"><svg class="lcx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#lcx-i-trending-down"></use></svg><span>長輸入</span></div>
    <div class="lcx-stat-num">+40 pts</div>
    <p>相對全輸入基線的最大準確率增幅（NIAH，Opus 4.5），估計成本同時下降 54.6×。</p>
  </div>
  <div class="lcx-stat">
    <div class="lcx-stat-top"><svg class="lcx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#lcx-i-memory-stick"></use></svg><span>單動作</span></div>
    <div class="lcx-stat-num">7–9K</div>
    <p>單動作壓縮下峰值即時上下文的中位數，低於全歷史基線 130K–200K 的最大值。</p>
  </div>
  <div class="lcx-stat">
    <div class="lcx-stat-top"><svg class="lcx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#lcx-i-triangle-alert"></use></svg><span>失敗模式</span></div>
    <div class="lcx-stat-num">53.0 → 3.6</div>
    <p>Qwen 3 Coder Next 在最緊的 16K/12K 預算下的 SWE-bench Verified 分數。壓縮不是每個模型都免費。</p>
  </div>
</div>

<p class="lcx-fine">資料來源：摘要、第 3–5 節、表 2、9、10、17，以及圖 1、5、6。準確率差距單位為百分點，不是百分比。</p>

本文其餘部分是長版。如果你只需要實務結論，可以直接跳到接近文末的**「我會怎麼用這篇論文」**。如果你想理解這個結果*為什麼*可信，請繼續讀——有趣的地方不是平均值，而是例外情況的形狀。

<div class="lcx-kicker"><svg class="lcx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#lcx-i-book-open"></use></svg>先定義</div>

## 「長」是相對詞，而這件事很重要

論文花了兩頁固定定義，這是對的。「上下文」是語言模型工程裡被過度載入的詞之一：它可以指某一步的輸入、生成的輸出、整段對話，或模型的架構上限。作者把五件事分開：

<div class="lcx-glossary">
  <div class="lcx-gloss"><div class="lcx-gloss-ico"><svg class="lcx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#lcx-i-circle-dot"></use></svg></div><div><div class="lcx-gloss-term">推論步</div><p class="lcx-gloss-copy">模型產生輸出的一次呼叫。在代理中，這通常是一個回合：模型讀取目前的上下文，然後輸出一個想法、一次工具呼叫，或一個答案。</p></div></div>
  <div class="lcx-gloss"><div class="lcx-gloss-ico"><svg class="lcx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#lcx-i-panel-top"></use></svg></div><div><div class="lcx-gloss-term">輸入上下文</div><p class="lcx-gloss-copy">模型在那一步被允許讀取的所有內容：系統提示、任務、先前的訊息、工具結果。這就是長對話中會不斷長大的東西。</p></div></div>
  <div class="lcx-gloss"><div class="lcx-gloss-ico"><svg class="lcx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#lcx-i-message-circle"></use></svg></div><div><div class="lcx-gloss-term">輸出上下文</div><p class="lcx-gloss-copy">模型在那一步生成的所有內容：思考軌跡、工具呼叫、給使用者的答案。除非有東西把它移除，否則它會附加到下一個輸入上下文。</p></div></div>
  <div class="lcx-gloss"><div class="lcx-gloss-ico"><svg class="lcx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#lcx-i-panel-top"></use></svg></div><div><div class="lcx-gloss-term">上下文視窗</div><p class="lcx-gloss-copy">端點在一次呼叫中能處理的 token 上限。它可能是模型的架構上限，也可能是較小的服務配置。超過上限的請求通常會直接失敗；超過上限的行為不可靠。</p></div></div>
  <div class="lcx-gloss"><div class="lcx-gloss-ico"><svg class="lcx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#lcx-i-scale"></use></svg></div><div><div class="lcx-gloss-term">長與短</div><p class="lcx-gloss-copy">論文把上下文稱為<em>長</em>，是指它接近 2026 年常見的 ~256K 視窗的顯著比例；稱為<em>短</em>，是指它離零比離那個視窗近得多——實務上是 <strong>16K–50K</strong>。短是相對的，不是小。</p></div></div>
</div>

最後一個定義是整篇論文的樞紐。作者說「短上下文」時，**不是**指 4K 的玩具視窗。他們指的是 16K–50K token，仍然足以裝下一本小說。論文不是主張模型應該忘掉一切。它主張的是：對於*輸入*可能大上數百倍的任務，數萬 token 的工作集已經足夠。

<div class="lcx-callout">
  <svg class="lcx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#lcx-i-book-open"></use></svg>
  <div><b>桌上的圖書館。</b> 50K token 的上下文大約是一本短篇小說。1M token 的上下文大約是整本欽定版聖經——舊約加新約。論文要問的不是「模型能不能讀一座圖書館？」而是「當問題只關於一個書架時，為什麼整座圖書館都在桌上？」</div>
</div>

論文用一張文學作品表把尺度畫得很生動。重點不是上下文視窗沒用，而是它們已經長得遠遠超過人們實際推理時所面對的文本大小。

<div class="lcx-table-card">
  <div class="lcx-table-head">
    <div class="lcx-table-tag"><svg class="lcx-ico lcx-ico-xs" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#lcx-i-book-open"></use></svg>表 1，重繪 · 圖書館 VS. 視窗</div>
    <div class="lcx-table-title">八本書，八個視窗。</div>
    <p class="lcx-table-sub">token 數為近似值：論文以每英文字約 1.33 token 換算。這裡最小的視窗仍能裝下三次<em>《大亨小傳》</em>。</p>
  </div>
  <div class="lcx-table-scroll">
    <table class="lcx-books">
      <thead><tr><th>文學作品</th><th class="num">Token 數</th><th>模型</th><th class="num">視窗</th></tr></thead>
      <tbody>
        <tr><td>《老人與海》</td><td class="num">~37K</td><td>MiniMax M2.7</td><td class="num">200K</td></tr>
        <tr><td>《大亨小傳》</td><td class="num">~64K</td><td>Claude Opus 4.5</td><td class="num">200K</td></tr>
        <tr><td>《古蘭經》（Saheeh International 英譯）</td><td class="num">~207K</td><td>Gemma 4 31B</td><td class="num">256K</td></tr>
        <tr><td>欽定版新約聖經</td><td class="num">~241K</td><td>Kimi K2.6</td><td class="num">256K</td></tr>
        <tr><td>《遠大前程》</td><td class="num">~245K</td><td>Qwen 3 Coder Next</td><td class="num">262K</td></tr>
        <tr><td>《魔戒》</td><td class="num">~640K</td><td>Gemini 3.8 Flash</td><td class="num">1M</td></tr>
        <tr><td>《戰爭與和平》</td><td class="num">~753K</td><td>GLM 5.2</td><td class="num">1M</td></tr>
        <tr><td>欽定版舊約聖經</td><td class="num">~802K</td><td>GPT 5.6 Sol</td><td class="num">1.05M</td></tr>
      </tbody>
    </table>
  </div>
  <div class="lcx-table-foot">這個配對是示意，不是基準測試（benchmark）。資料來源：arXiv:2611.05306，表 1。</div>
</div>

論文的框架刻意挑釁：上下文視窗一直被行銷成一場容量競賽，但容量不等於有用。能載一棟房子的卡車，不會自動成為買菜的正確交通工具。

<div class="lcx-kicker"><svg class="lcx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#lcx-i-receipt"></use></svg>帳單</div>

## 成本隨深度線性成長，而最後一次翻倍最貴

機制用一段話說完。Transformer 生成文字時，會對上下文裡既有的 token 做注意力運算：每個新 token 都會回頭看先前的 token，並給它們不同的權重。這個回看需要為每個先前 token 保存一組 key 與 value，所以服務堆疊把它們放進 **KV 快取**，不必每一步都從頭重算。快取會隨上下文長度線性成長，而每個新 token 都必須對全部快取做注意力。結果是：**越後面的 token，生成成本越高**——論文把單一 token 的解碼成本描述為隨上下文深度線性成長。整段序列的注意力總工作量是二次的，而 prefill（讀取輸入）才是二次項咬人的地方；圖 1 量的是解碼。論文引用標準分析，然後在真實服務堆疊上量測。

<div class="lcx-callout">
  <svg class="lcx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#lcx-i-gauge"></use></svg>
  <div><b>會加速的計程車跳表。</b> Prefill 是起跳價：模型讀取輸入。Decode 是跳表：每生成一個 token 跳一次。在長上下文裡，每一次跳表都要對更多歷史做注意力，所以車越跑，表跳得越快。零售價目表卻用每百萬 token 的均一費率報價，把加速藏了起來。</div>
</div>

論文分開量測兩件事：

- **雲端服務成本。** 在 H100 GPU 上，以 16K 到 256K 的上下文視窗服務 GLM 5.2、Kimi K2.6、Qwen 3 Coder Next，量測峰值持續解碼吞吐量，再以每 GPU 小時 $3.85 換算成每百萬輸出 token 的美元成本。
- **本機負擔。** 在一台可用統一記憶體約 109GB 的 NVIDIA DGX Spark 上，隨上下文成長，量測五個開放權重程式碼模型之間的 token 間延遲、batch-one 吞吐量與記憶體佔用。

兩項量測指向同一個方向。圖 1 是論文自己對雲端成本曲線的看法。

<figure class="fig">
  <img src="/images/long-context/fig01-cost-per-mtok.webp" alt="三個面板顯示，隨著上下文視窗從 16K 成長到 256K，GLM 5.2、Kimi K2.6 與 Qwen 3 Coder Next 生成一百萬個輸出 token 的美元成本急遽上升" width="1600" height="487" loading="lazy" />
  <figcaption><b>圖 1（論文原圖）</b>——長上下文的成本：在既有 KV 快取上生成 1M 輸出 token 的美元成本，以每 H100 小時 $3.85 計。每個面板有自己的 y 軸。三條曲線在不同位置彎折——Qwen 3 Coder Next 最早，GLM 5.2 最晚——256K 端點是 16K 端點的 3.6× 到 7×。該注意的是斜率，不是確切的美元數字。最後一次翻倍最貴，而 Qwen 的懲罰最大。資料來源：<a href="https://arxiv.org/abs/2611.05306">Belcak et al., arXiv:2611.05306</a> · <a href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a></figcaption>
</figure>

<div class="chamfer-card-wrapper lcx-card">
  <div class="chamfer-card-content">
    <div class="card-tag lcx-tag"><svg class="lcx-ico lcx-ico-xs" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#lcx-i-banknote"></use></svg> EXHIBIT // 01 · 成本曲線</div>
    <div class="lcx-card-title">短上下文解碼快 3.6–7×。</div>
    <p class="lcx-card-sub">每個上下文視窗下的解碼吞吐量，以相對 256K 工作點的速度倍數表示。數值讀自論文的圖 4；曲線是近似，方向不是。</p>
    <svg class="lcx-chart" viewBox="0 0 440 278" role="img" aria-label="三個模型在短上下文下的解碼速度，相對 256K 的倍數" xmlns="http://www.w3.org/2000/svg"><text x="46" y="10" class="lcx-ch-axis" text-anchor="start">解碼速度 VS. 256K 上下文</text><rect x="46.0" y="18" width="188.0" height="198" class="lcx-ch-band"/><text x="140.0" y="29" class="lcx-ch-band-label" text-anchor="middle">短上下文區</text><line x1="46" y1="216.0" x2="422" y2="216.0" class="lcx-ch-grid"/><text x="41" y="218.2" class="lcx-ch-axis" text-anchor="end">0×</text><line x1="46" y1="189.6" x2="422" y2="189.6" class="lcx-ch-grid"/><text x="41" y="191.79999999999998" class="lcx-ch-axis" text-anchor="end">1×</text><line x1="46" y1="163.20000000000002" x2="422" y2="163.20000000000002" class="lcx-ch-grid"/><text x="41" y="165.4" class="lcx-ch-axis" text-anchor="end">2×</text><line x1="46" y1="136.8" x2="422" y2="136.8" class="lcx-ch-grid"/><text x="41" y="139.0" class="lcx-ch-axis" text-anchor="end">3×</text><line x1="46" y1="110.4" x2="422" y2="110.4" class="lcx-ch-grid"/><text x="41" y="112.60000000000001" class="lcx-ch-axis" text-anchor="end">4×</text><line x1="46" y1="84.00000000000001" x2="422" y2="84.00000000000001" class="lcx-ch-grid"/><text x="41" y="86.20000000000002" class="lcx-ch-axis" text-anchor="end">5×</text><line x1="46" y1="57.599999999999994" x2="422" y2="57.599999999999994" class="lcx-ch-grid"/><text x="41" y="59.8" class="lcx-ch-axis" text-anchor="end">6×</text><line x1="46" y1="31.199999999999996" x2="422" y2="31.199999999999996" class="lcx-ch-grid"/><text x="41" y="33.4" class="lcx-ch-axis" text-anchor="end">7×</text><text x="46.0" y="230" class="lcx-ch-axis" text-anchor="middle">16K</text><text x="140.0" y="230" class="lcx-ch-axis" text-anchor="middle">32K</text><text x="234.0" y="230" class="lcx-ch-axis" text-anchor="middle">64K</text><text x="328.0" y="230" class="lcx-ch-axis" text-anchor="middle">128K</text><text x="422.0" y="230" class="lcx-ch-axis" text-anchor="middle">256K</text><line x1="46" y1="216" x2="422" y2="216" class="lcx-ch-axis-line"/><path d="M46.0,110.4 L140.0,118.3 L234.0,123.6 L328.0,136.8 L422.0,189.6" class="lcx-ch-line"/><circle cx="46.0" cy="110.4" r="2.5" class="lcx-ch-dot"/><circle cx="140.0" cy="118.3" r="2.5" class="lcx-ch-dot"/><circle cx="234.0" cy="123.6" r="2.5" class="lcx-ch-dot"/><circle cx="328.0" cy="136.8" r="2.5" class="lcx-ch-dot"/><circle cx="422.0" cy="189.6" r="2.5" class="lcx-ch-dot"/><text x="51.0" y="105.4" class="lcx-ch-value">4.0×</text><path d="M46.0,57.6 L140.0,86.6 L234.0,110.4 L328.0,131.5 L422.0,189.6" class="lcx-ch-line2"/><circle cx="46.0" cy="57.6" r="2.5" class="lcx-ch-dot2"/><circle cx="140.0" cy="86.6" r="2.5" class="lcx-ch-dot2"/><circle cx="234.0" cy="110.4" r="2.5" class="lcx-ch-dot2"/><circle cx="328.0" cy="131.5" r="2.5" class="lcx-ch-dot2"/><circle cx="422.0" cy="189.6" r="2.5" class="lcx-ch-dot2"/><text x="51.0" y="66.6" class="lcx-ch-value">6.0×</text><path d="M46.0,31.2 L140.0,73.4 L234.0,102.5 L328.0,131.5 L422.0,189.6" class="lcx-ch-line3"/><circle cx="46.0" cy="31.2" r="2.5" class="lcx-ch-dot3"/><circle cx="140.0" cy="73.4" r="2.5" class="lcx-ch-dot3"/><circle cx="234.0" cy="102.5" r="2.5" class="lcx-ch-dot3"/><circle cx="328.0" cy="131.5" r="2.5" class="lcx-ch-dot3"/><circle cx="422.0" cy="189.6" r="2.5" class="lcx-ch-dot3"/><text x="51.0" y="26.199999999999996" class="lcx-ch-value">7.0×</text><line x1="46" y1="254" x2="60" y2="254" class="lcx-ch-line"/><circle cx="53" cy="254" r="2.4" class="lcx-ch-dot"/><text x="65" y="256.3" class="lcx-ch-note">GLM 5.2</text><line x1="164" y1="254" x2="178" y2="254" class="lcx-ch-line2"/><circle cx="171" cy="254" r="2.4" class="lcx-ch-dot2"/><text x="183" y="256.3" class="lcx-ch-note">Kimi K2.6</text><line x1="282" y1="254" x2="296" y2="254" class="lcx-ch-line3"/><circle cx="289" cy="254" r="2.4" class="lcx-ch-dot3"/><text x="301" y="256.3" class="lcx-ch-note">Qwen 3 Coder Next</text><text x="46" y="272" class="lcx-ch-note">數值讀自圖 4，為近似值。所有曲線在 256K 參考點交會。</text></svg>
    <div class="lcx-src">重繪自圖 4 · arXiv:2611.05306</div>
  </div>
</div>

形狀在三個不同模型與兩種服務配置上一致。膝點的確切位置會移動——Qwen 3 Coder Next 較早、較猛地彎折，GLM 5.2 則一路平坦到 128K——但方向不變。**256K 的邊際 token，成本並不和 16K 的邊際 token 相同——即使 API 的帳面數字這麼說。**

圖 4 從服務端展示同一組資料：解碼吞吐量隨著設定的視窗變大而崩塌。右軸把曲線換算成相對 256K 工作點的速度倍數。

<figure class="fig">
  <img src="/images/long-context/fig04-throughput.webp" alt="三個面板顯示 GLM 5.2、Kimi K2.6 與 Qwen 3 Coder Next 的解碼吞吐量（token／秒）從 16K 到 256K 上下文一路下降，右軸顯示短上下文下有 4× 到 7× 的加速" width="1600" height="473" loading="lazy" />
  <figcaption><b>圖 4（論文原圖）</b>——解碼吞吐量隨上下文視窗成長而崩塌。GLM 5.2 在 16K 的吞吐量約為 256K 的 4×；Kimi K2.6 約 6×；Qwen 3 Coder Next 約 7×。該注意的是：較短的視窗不是小小的調校旋鈕——它改變可達到的服務經濟效益，幅度和激進量化同一個數量級。資料來源：<a href="https://arxiv.org/abs/2611.05306">Belcak et al., arXiv:2611.05306</a> · <a href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a></figcaption>
</figure>

本機的情況也一樣直白。在 DGX Spark 上，數個模型的 token 間延遲在量測範圍內大約翻倍，記憶體佔用一路攀升，直到 MiniMax M2.7 用完約 109GB 的預算。

<figure class="fig">
  <img src="/images/long-context/fig02-dgx-spark.webp" alt="NVIDIA DGX Spark 上的三個面板：token 間延遲隨上下文長度上升，batch-one 吞吐量下降，記憶體消耗逼近 109GB 的裝置上限" width="1600" height="501" loading="lazy" />
  <figcaption><b>圖 2（論文原圖）</b>——長上下文對本機裝置的負擔。延遲上升、吞吐量下降，記憶體消耗逼近裝置上限；MiniMax M2.7 在約 64K token 時記憶體不足。該注意的是：看記憶體面板，不是延遲面板。在桌機級的機器上，長上下文不只是比較貴——其中一個模型會直接停擺。資料來源：<a href="https://arxiv.org/abs/2611.05306">Belcak et al., arXiv:2611.05306</a> · <a href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a></figcaption>
</figure>

<div class="lcx-pull">
  <div class="lcx-pull-mark">“</div>
  <p>token 的零售價，報得好像上下文深度是免費的。到了服務端，深度就是帳單。</p>
</div>

這是論文的經濟前提，值得和其餘部分分開看。即使壓縮對準確率毫無幫助，3.6–7× 的服務成本差距，就足以讓人質問完整歷史是否必要。準確率實驗是為了回答顯而易見的後續問題：*如果我們不再什麼都帶著，會壞掉什麼？*

<div class="lcx-kicker"><svg class="lcx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#lcx-i-flask-conical"></use></svg>實驗</div>

## 兩種「長」，六加七個基準測試

論文按長度從哪裡來，把工作負載分類；這個分類法對實務工作者來說是全文最有用的東西。

<div class="lcx-duo">
  <div class="lcx-duo-col">
    <div class="lcx-duo-head"><svg class="lcx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#lcx-i-workflow"></use></svg><span>長流程</span></div>
    <div class="lcx-duo-big">歷史會長大，因為代理在行動。</div>
    <p>探索儲存庫、終端任務、多輪工具使用。每個動作與觀察都會被附加；上下文是做事過程的副作用，自然就越長越大。</p>
    <div class="lcx-duo-meta">6 個基準測試 · 每個模型 22 種設定</div>
  </div>
  <div class="lcx-duo-col">
    <div class="lcx-duo-head"><svg class="lcx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#lcx-i-file-text"></use></svg><span>長輸入</span></div>
    <div class="lcx-duo-big">代理還沒開始，輸入就已經很長。</div>
    <p>多文件問答、needle 檢索、長程式碼理解。問題很短，素材很大。任務本身沒有任何地方要求一次讀完。</p>
    <div class="lcx-duo-meta">7 個基準測試 · 選擇性閱讀</div>
  </div>
</div>

下面的基準測試卡片是完整集合。每張卡說明該基準測試量什麼，以及它為什麼屬於這一組。如果你已經熟悉這些基準測試，可以直接跳到三種機制；這些卡片是參考資料。

<div class="lcx-bench-grid">
  <div class="lcx-bench"><div class="lcx-bench-top"><div class="lcx-bench-ico"><svg class="lcx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#lcx-i-git-branch"></use></svg></div><div><div class="lcx-bench-name">SWE-bench Verified</div><div class="lcx-bench-sub">500 個任務 · Python 儲存庫</div></div></div><p class="lcx-bench-desc">解決真實的 GitHub issue；修補必須通過儲存庫保留的測試。長流程程式任務的經典基準測試。</p><div class="lcx-bench-stress"><b>為什麼適合</b> 探索、編輯、測試、除錯——一連串自然會拉長的相依動作。</div></div>
  <div class="lcx-bench"><div class="lcx-bench-top"><div class="lcx-bench-ico"><svg class="lcx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#lcx-i-terminal"></use></svg></div><div><div class="lcx-bench-name">SWE-bench Multilingual</div><div class="lcx-bench-sub">300 個任務 · 9 種語言</div></div></div><p class="lcx-bench-desc">跨九個語言生態系的 issue 解決。同樣的工作流程，不同的儲存庫慣例與工具鏈。</p><div class="lcx-bench-stress"><b>為什麼適合</b> 檢驗結果能否撐過語言與生態系的改變。</div></div>
  <div class="lcx-bench"><div class="lcx-bench-top"><div class="lcx-bench-ico"><svg class="lcx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#lcx-i-terminal"></use></svg></div><div><div class="lcx-bench-name">Terminal-Bench 2.1</div><div class="lcx-bench-sub">89 個任務 · 沙箱化 CLI</div></div></div><p class="lcx-bench-desc">在容器裡端到端解決命令列問題，由逐任務驗證器評分。範圍比單一儲存庫的修補更廣。</p><div class="lcx-bench-stress"><b>為什麼適合</b> 長命令歷史、環境狀態，以及從失敗命令中復原。</div></div>
  <div class="lcx-bench"><div class="lcx-bench-top"><div class="lcx-bench-ico"><svg class="lcx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#lcx-i-network"></use></svg></div><div><div class="lcx-bench-name">FRAMES</div><div class="lcx-bench-sub">824 個多跳問題</div></div></div><p class="lcx-bench-desc">答案需要結合 2–15 篇維基百科文章的內容。在這個代理化的版本裡，模型逐步搜尋並開啟文章。</p><div class="lcx-bench-stress"><b>為什麼適合</b> 證據跨步驟累積，但代理可以自己選擇要檢索什麼。</div></div>
  <div class="lcx-bench"><div class="lcx-bench-top"><div class="lcx-bench-ico"><svg class="lcx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#lcx-i-users"></use></svg></div><div><div class="lcx-bench-name">τ²-bench</div><div class="lcx-bench-sub">184 個任務 · 零售／航空／電信</div></div></div><p class="lcx-bench-desc">與模擬使用者對話，同時在政策限制下操作領域工具。成功需要正確答案與正確的最終狀態。</p><div class="lcx-bench-stress"><b>為什麼適合</b> 對話早期的細節，必須在幾次工具呼叫後仍然可用。</div></div>
  <div class="lcx-bench"><div class="lcx-bench-top"><div class="lcx-bench-ico"><svg class="lcx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#lcx-i-layers"></use></svg></div><div><div class="lcx-bench-name">BFCLv3</div><div class="lcx-bench-sub">200 個長多輪情境</div></div></div><p class="lcx-bench-desc">模擬環境中的多輪工具使用。代理必須記住先前的回合，並正確安排會改變狀態的呼叫。</p><div class="lcx-bench-stress"><b>為什麼適合</b> 乾淨地檢驗早期事實能否撐過後面的回合。</div></div>
  <div class="lcx-bench"><div class="lcx-bench-top"><div class="lcx-bench-ico"><svg class="lcx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#lcx-i-file-text"></use></svg></div><div><div class="lcx-bench-name">LongBench v2</div><div class="lcx-bench-sub">503 個問題 · 8K–2M 字</div></div></div><p class="lcx-bench-desc">六類任務：單文件與多文件問答、長上下文學習、長對話、程式碼儲存庫理解、結構化資料。</p><div class="lcx-bench-stress"><b>為什麼適合</b> 異質的真實文件；答案很少需要整份檔案。</div></div>
  <div class="lcx-bench"><div class="lcx-bench-top"><div class="lcx-bench-ico"><svg class="lcx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#lcx-i-book-open"></use></svg></div><div><div class="lcx-bench-name">LOONG</div><div class="lcx-bench-sub">1,600 個問題 · 中／英</div></div></div><p class="lcx-bench-desc">針對多份完整財報、法律案件或論文提問。包含定位、比較、分群與推理鏈任務。</p><div class="lcx-bench-stress"><b>為什麼適合</b> 證據分散在幾份關鍵文件裡。</div></div>
  <div class="lcx-bench"><div class="lcx-bench-top"><div class="lcx-bench-ico"><svg class="lcx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#lcx-i-scale"></use></svg></div><div><div class="lcx-bench-name">AA-LCR</div><div class="lcx-bench-sub">100 個問題 · 每題約 100K token</div></div></div><p class="lcx-bench-desc">由人類撰寫的推理題，素材是成組的真實報告、諮詢文件、法律文件與調查。重點是多步整合，不是查單一事實。</p><div class="lcx-bench-stress"><b>為什麼適合</b> 輸入很大，但相關證據只占一小部分。</div></div>
  <div class="lcx-bench"><div class="lcx-bench-top"><div class="lcx-bench-ico"><svg class="lcx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#lcx-i-scan-search"></use></svg></div><div><div class="lcx-bench-name">NIAH</div><div class="lcx-bench-sub">125 個實例 · 16K–500K</div></div></div><p class="lcx-bench-desc">把目標句子以受控深度插入無關的隨筆文字中；模型必須回傳那個事實。經典的「大海撈針」網格。</p><div class="lcx-bench-stress"><b>為什麼適合</b> 純檢索；如果選擇性閱讀在這裡贏不了，它在哪裡都贏不了。</div></div>
  <div class="lcx-bench"><div class="lcx-bench-top"><div class="lcx-bench-ico"><svg class="lcx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#lcx-i-list-filter"></use></svg></div><div><div class="lcx-bench-name">RULER</div><div class="lcx-bench-sub">13 個任務 · 256K/500K</div></div></div><p class="lcx-bench-desc">八種 needle 變體，加上變數追蹤、詞彙擷取與多跳問答。按所需答案集合的召回率評分。</p><div class="lcx-bench-stress"><b>為什麼適合</b> 檢驗聚合與追蹤，不只是單一的字面比對。</div></div>
  <div class="lcx-bench"><div class="lcx-bench-top"><div class="lcx-bench-ico"><svg class="lcx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#lcx-i-list-filter"></use></svg></div><div><div class="lcx-bench-name">Counting-Stars</div><div class="lcx-bench-sub">192 個問題 · 中／英</div></div></div><p class="lcx-bench-desc">32 個標記數字散落在長文中；模型必須全部找回來。推理變體會修正一開始錯誤的計數。</p><div class="lcx-bench-stress"><b>為什麼適合</b> 要求窮盡式召回——對有損摘要來說最難的情況。</div></div>
  <div class="lcx-bench"><div class="lcx-bench-top"><div class="lcx-bench-ico"><svg class="lcx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#lcx-i-boxes"></use></svg></div><div><div class="lcx-bench-name">BABILong</div><div class="lcx-bench-sub">550 個問題 · 64K–1M</div></div></div><p class="lcx-bench-desc">把簡短的 bAbI 事實嵌入書籍文字。回答需要先定位事實，再串接、計數、否定或追蹤集合。</p><div class="lcx-bench-stress"><b>為什麼適合</b> 事實很小，乾草堆巨大，推理是多步的。</div></div>
</div>

模型也照同樣方式分組。兩個閉源（只能透過 API 使用）前沿模型承擔主要的準確率實驗——**Claude Opus 4.5** 與 **GPT 5.6 Sol**——正因為它們來自不同供應商、不同後訓練配方。如果壓縮只對一個家族有幫助，結果就只是 prompt 的產物。五個開放權重（可下載、自行部署）的模型負責服務與穩健性檢查：**Qwen 3.6 27B**、**Qwen 3 Coder Next**（總參數 80B，啟用 3B）、**Gemma 4 31B**、**Step 3.7 Flash**（總參數 198B，啟用 11B）與 **MiniMax M2.7**（總參數 230B，啟用 10B）。

代理外殼（harness）刻意無聊。兩個基礎外殼都跑最小化的 ReAct 迴圈：任務是第一則使用者訊息，模型**一次只發出一個 Bash 動作**，動作與其結果再附加到對話。`mini-swe-agent` 處理軟體與終端任務；`mini-agent` 用基準測試專屬的指示與提交規則，把同一個迴圈推廣到其他基準測試。基線裡沒有隱藏記憶層、沒有向量資料庫、沒有檢索啟發式。重點就在這裡：實驗隔離的是**上下文管理**，不是代理的聰明程度。

<div class="lcx-kicker"><svg class="lcx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#lcx-i-repeat"></use></svg>三種機制</div>

## FHA、EoCC、SAC：三種帶著對話走的方式

論文比較三種上下文管理機制。它們的差別只在於**模型下一步被允許看到什麼**。

<div class="lcx-regime-grid">
  <div class="lcx-regime">
    <div class="lcx-regime-top"><span class="lcx-regime-code">FHA</span><span class="lcx-regime-name">全歷史累積</span></div>
    <p>附加每一個動作與觀察。什麼都不移除。上下文單調成長，直到任務結束或視窗溢出。</p>
    <div class="lcx-regime-tag"><svg class="lcx-ico lcx-ico-xs" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#lcx-i-arrow-right"></use></svg>預設做法</div>
  </div>
  <div class="lcx-regime">
    <div class="lcx-regime-top"><span class="lcx-regime-code">EoCC</span><span class="lcx-regime-name">對話尾端壓縮</span></div>
    <p>以 FHA 執行，直到上下文跨過門檻。請模型產出有界、與任務相關的壓縮；用任務與這份壓縮狀態開啟一段新對話。</p>
    <div class="lcx-regime-tag"><svg class="lcx-ico lcx-ico-xs" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#lcx-i-scissors"></use></svg>週期性重置</div>
  </div>
  <div class="lcx-regime">
    <div class="lcx-regime-top"><span class="lcx-regime-code">SAC</span><span class="lcx-regime-name">單動作壓縮</span></div>
    <p>每段對話拿到任務與目前的語意狀態——一份書面筆記，寫著發生了什麼、什麼卡住、下一步該做什麼——執行恰好一個動作，更新筆記，然後被丟棄。沒有任何對話歷史留到下一步。</p>
    <div class="lcx-regime-tag"><svg class="lcx-ico lcx-ico-xs" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#lcx-i-zap"></use></svg>一個動作</div>
  </div>
</div>

論文的圖 3 把三種機制畫成訊息堆疊。值得仔細看，因為 EoCC 與 SAC 的差別很容易糊掉。

<figure class="fig">
  <img src="/images/long-context/fig03-regimes.webp" alt="三種上下文管理機制的圖解：全歷史累積讓對話不斷成長，對話尾端壓縮週期性插入摘要，單動作壓縮則每段對話只執行一個動作" width="1600" height="583" loading="lazy" />
  <figcaption><b>圖 3（論文原圖）</b>——三種機制。FHA 維持一段無界生長的對話。EoCC 週期性插入壓縮並開啟新對話。SAC 只帶一份語意狀態，每段對話執行一個動作。該注意的是：SAC 不是「更常摘要」——它完全移除對話歷史，只留下書面狀態作為唯一的橋樑。資料來源：<a href="https://arxiv.org/abs/2611.05306">Belcak et al., arXiv:2611.05306</a> · <a href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a></figcaption>
</figure>

<div class="chamfer-card-wrapper lcx-card">
  <div class="chamfer-card-content">
    <div class="card-tag lcx-tag"><svg class="lcx-ico lcx-ico-xs" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#lcx-i-activity"></use></svg> EXHIBIT // 02 · 上下文軌跡</div>
    <div class="lcx-card-title">三種機制，三種記憶形狀。</div>
    <p class="lcx-card-sub">即時上下文隨時間變化的示意圖。FHA 無界成長；EoCC 在門檻處呈鋸齒狀；SAC 保持平坦，因為每個動作都開啟一段新對話。</p>
    <svg class="lcx-chart" viewBox="0 0 440 252" role="img" aria-label="三種機制下即時上下文隨動作變化的示意圖" xmlns="http://www.w3.org/2000/svg"><text x="46" y="10" class="lcx-ch-axis" text-anchor="start">即時上下文 · 示意圖</text><line x1="46" y1="210.0" x2="336" y2="210.0" class="lcx-ch-grid"/><text x="41" y="212.2" class="lcx-ch-axis" text-anchor="end">0K</text><line x1="46" y1="164.28571428571428" x2="336" y2="164.28571428571428" class="lcx-ch-grid"/><text x="41" y="166.48571428571427" class="lcx-ch-axis" text-anchor="end">50K</text><line x1="46" y1="118.57142857142858" x2="336" y2="118.57142857142858" class="lcx-ch-grid"/><text x="41" y="120.77142857142859" class="lcx-ch-axis" text-anchor="end">100K</text><line x1="46" y1="72.85714285714286" x2="336" y2="72.85714285714286" class="lcx-ch-grid"/><text x="41" y="75.05714285714286" class="lcx-ch-axis" text-anchor="end">150K</text><line x1="46" y1="27.142857142857153" x2="336" y2="27.142857142857153" class="lcx-ch-grid"/><text x="41" y="29.342857142857152" class="lcx-ch-axis" text-anchor="end">200K</text><text x="46.0" y="224" class="lcx-ch-axis" text-anchor="middle">0</text><text x="118.5" y="224" class="lcx-ch-axis" text-anchor="middle">10</text><text x="191.0" y="224" class="lcx-ch-axis" text-anchor="middle">20</text><text x="263.5" y="224" class="lcx-ch-axis" text-anchor="middle">30</text><text x="336.0" y="224" class="lcx-ch-axis" text-anchor="middle">40</text><text x="191.0" y="246" class="lcx-ch-axis" text-anchor="middle">已執行動作數</text><path d="M46.0,204.5 L321.5,29.0" class="lcx-ch-line"/><text x="292.5" y="38.11428571428571" class="lcx-ch-note">FHA</text><text x="292.5" y="46.11428571428571" class="lcx-ch-note2">不重置</text><path d="M46.0,204.5 L83.7,173.4 L89.5,204.1 L127.2,173.0 L133.0,203.6 L170.7,172.5 L176.5,203.1 L214.2,172.1 L220.0,202.7 L257.7,171.6 L263.5,202.2 L301.2,171.1" class="lcx-ch-line2"/><text x="270.75" y="151.48571428571427" class="lcx-ch-note">EoCC</text><text x="270.75" y="159.48571428571427" class="lcx-ch-note2">達門檻重置</text><path d="M46.0,207.7 L321.5,207.7" class="lcx-ch-line3"/><text x="220.0" y="203.71428571428572" class="lcx-ch-note">SAC · 每個上下文一個動作</text><line x1="46.0" y1="18" x2="46.0" y2="210" class="lcx-ch-axis-line"/></svg>
    <div class="lcx-src">示意圖 · 依據 §2.4.1 與圖 3</div>
  </div>
</div>

門檻的寫法是**總上下文上限 / 壓縮門檻**。例如 `16K / 12K` 表示執行中的上下文接近 12K token 時，代理就壓縮，而外殼絕不讓單段對話超過 16K。兩個數字之間的差距，保留給壓縮那一回合本身。讀表格時這個記法很重要：第一個數字是硬上限，第二個是觸發點。

對長流程任務，作者在大多數基準測試上掃過四種設定：`48K/36K`、`32K/24K`、`24K/18K`、`16K/12K`。BFCLv3 下探到 `12K/8K`；τ²-bench 下探到 `8K/6K`。每往下調一階，就是更緊的預算與更頻繁的壓縮。如果準確率主要是上下文長度的函數，這些曲線應該掉下懸崖。它們沒有。

對長輸入任務，手法不同。文件根本不放進對話，而是寫到代理的檔案系統，命名為 `input01.txt`、`input02.txt` 等等。任務訊息只列出檔名；代理用普通的 Bash 工具搜尋與讀取。論文稱之為**選擇性輸入閱讀**。它把長輸入任務轉成長流程任務：代理執行動作（`grep` 這個、`sed` 那個），觀察結果，再決定下一步讀什麼。

<div class="lcx-callout">
  <svg class="lcx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#lcx-i-folder-open"></use></svg>
  <div><b>倉庫，不是書桌。</b> 把一份 500K token 的文件貼進 prompt，等於把整座倉庫搬到桌上。選擇性閱讀是保留倉庫、學會它的索引，然後派一個跑腿的人去拿你需要的那兩個箱子。跑腿的報告很小；倉庫還在原地。</div>
</div>

這也是論文對顯而易見的反駁所給的答案。「如果代理需要你壓縮掉的東西怎麼辦？」把完整逐字稿留在磁碟上，再給代理一個搜尋它的方法。資訊不必待在上下文裡，才能被代理使用。這個區分——**在上下文中** vs. **可取得**——是整個結果的概念核心。

<div class="lcx-kicker"><svg class="lcx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#lcx-i-gauge"></use></svg>結果 1 · 長流程</div>

## 壓縮在長流程任務上無聊得令人安心——以最好的方式

第一個研究問題是：一個會執行許多動作的代理，能不能不帶著完整歷史就完成任務？在六個基準測試與兩個前沿模型上，答案是能——偏差很小、方向不一、多數為正。

<figure class="fig">
  <img src="/images/long-context/fig05-long-horizon.webp" alt="六個面板的長流程基準測試結果，顯示總上下文上限縮小時，準確率變化接近零，成本節省介於 2× 到 8.8× 之間" width="1800" height="1406" loading="lazy" />
  <figcaption><b>圖 5（論文原圖）</b>——長流程結果隨總上下文上限的變化。上排：相對全歷史基線的準確率變化；零代表不變。下排：估計成本節省。橘色是 Claude Opus 4.5，藍色是 GPT 5.6 Sol。該注意的是：準確率線在零附近徘徊，成本長條卻往上爬——這筆交易不是「少一點準確率換少一點成本」，而大多是「一樣的準確率，更少的成本」。資料來源：<a href="https://arxiv.org/abs/2611.05306">Belcak et al., arXiv:2611.05306</a> · <a href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a></figcaption>
</figure>

整體數字如下：

- **準確率範圍：** Opus 4.5 在所有基準測試與門檻間落在 **−3.7 到 +5.6 個百分點**；GPT 5.6 Sol 落在 **−3.3 到 +4.4**。
- **什麼時候會傷到：** 對任一模型，**22 種門檻設定中，最多只有 5 種**相對基線掉超過 2 個百分點。
- **成本：** Opus 4.5 節省 **2.2×–8.8×**，GPT 5.6 Sol 節省 **2.4×–5.0×**。
- **token 支出沒有爆炸：** 壓縮一般不會讓代理重做工作、燒掉更多總 token。新輸入 token 隨視窗縮小而上升，快取 token 下降，輸出 token 上升，GPT 在最緊的設定下更是大幅上升——這是預期的模式。

<div class="chamfer-card-wrapper lcx-card">
  <div class="chamfer-card-content">
    <div class="card-tag lcx-tag"><svg class="lcx-ico lcx-ico-xs" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#lcx-i-coins"></use></svg> EXHIBIT // 03 · 長流程經濟學</div>
    <div class="lcx-card-title">一樣的準確率，便宜 2.2–8.8×。</div>
    <p class="lcx-card-sub">每個長流程基準測試相對全歷史基線的估計成本節省。每根長條涵蓋受測的最低到最高設定；圓點標出最大值。</p>
    <svg class="lcx-chart" viewBox="0 0 440 300" role="img" aria-label="兩個模型在各長流程基準測試上的估計成本節省範圍" xmlns="http://www.w3.org/2000/svg"><text x="130" y="10" class="lcx-ch-axis" text-anchor="start">估計成本節省 VS. 全歷史</text><line x1="130.0" y1="26" x2="130.0" y2="236" class="lcx-ch-grid"/><text x="130.0" y="250" class="lcx-ch-axis" text-anchor="middle">1×</text><line x1="189.29411764705884" y1="26" x2="189.29411764705884" y2="236" class="lcx-ch-grid"/><text x="189.29411764705884" y="250" class="lcx-ch-axis" text-anchor="middle">3×</text><line x1="248.58823529411765" y1="26" x2="248.58823529411765" y2="236" class="lcx-ch-grid"/><text x="248.58823529411765" y="250" class="lcx-ch-axis" text-anchor="middle">5×</text><line x1="307.88235294117646" y1="26" x2="307.88235294117646" y2="236" class="lcx-ch-grid"/><text x="307.88235294117646" y="250" class="lcx-ch-axis" text-anchor="middle">7×</text><line x1="367.1764705882353" y1="26" x2="367.1764705882353" y2="236" class="lcx-ch-grid"/><text x="367.1764705882353" y="250" class="lcx-ch-axis" text-anchor="middle">9×</text><line x1="130.0" y1="26" x2="130.0" y2="236" class="lcx-ch-zero"/><text x="0" y="49" class="lcx-ch-label">SWE-bench Verified</text><line x1="195.2" y1="46" x2="299.0" y2="46" class="lcx-ch-range"/><line x1="195.2" y1="43" x2="195.2" y2="49" class="lcx-ch-cap"/><line x1="299.0" y1="43" x2="299.0" y2="49" class="lcx-ch-cap"/><circle cx="299.0" cy="46" r="2.5" class="lcx-ch-dot"/><text x="302.98823529411766" y="48.3" class="lcx-ch-value">6.7×</text><line x1="189.3" y1="56" x2="221.9" y2="56" class="lcx-ch-range2"/><line x1="189.3" y1="53" x2="189.3" y2="59" class="lcx-ch-cap2"/><line x1="221.9" y1="53" x2="221.9" y2="59" class="lcx-ch-cap2"/><circle cx="221.9" cy="56" r="2.3" class="lcx-ch-dot2"/><text x="225.90588235294115" y="58.2" class="lcx-ch-value2">4.1×</text><text x="0" y="83" class="lcx-ch-label">Terminal-Bench 2.1</text><line x1="165.6" y1="80" x2="245.6" y2="80" class="lcx-ch-range"/><line x1="165.6" y1="77" x2="165.6" y2="83" class="lcx-ch-cap"/><line x1="245.6" y1="77" x2="245.6" y2="83" class="lcx-ch-cap"/><circle cx="245.6" cy="80" r="2.5" class="lcx-ch-dot"/><text x="249.6235294117647" y="82.3" class="lcx-ch-value">4.9×</text><line x1="171.5" y1="90" x2="218.9" y2="90" class="lcx-ch-range2"/><line x1="171.5" y1="87" x2="171.5" y2="93" class="lcx-ch-cap2"/><line x1="218.9" y1="87" x2="218.9" y2="93" class="lcx-ch-cap2"/><circle cx="218.9" cy="90" r="2.3" class="lcx-ch-dot2"/><text x="222.94117647058823" y="92.2" class="lcx-ch-value2">4.0×</text><text x="0" y="117" class="lcx-ch-label">SWE-bench Multilingual</text><line x1="210.0" y1="114" x2="361.2" y2="114" class="lcx-ch-range"/><line x1="210.0" y1="111" x2="210.0" y2="117" class="lcx-ch-cap"/><line x1="361.2" y1="111" x2="361.2" y2="117" class="lcx-ch-cap"/><circle cx="361.2" cy="114" r="2.5" class="lcx-ch-dot"/><text x="365.2470588235294" y="116.3" class="lcx-ch-value">8.8×</text><line x1="189.3" y1="124" x2="204.1" y2="124" class="lcx-ch-range2"/><line x1="189.3" y1="121" x2="189.3" y2="127" class="lcx-ch-cap2"/><line x1="204.1" y1="121" x2="204.1" y2="127" class="lcx-ch-cap2"/><circle cx="204.1" cy="124" r="2.3" class="lcx-ch-dot2"/><text x="208.11764705882354" y="126.2" class="lcx-ch-value2">3.5×</text><text x="0" y="151" class="lcx-ch-label">FRAMES</text><line x1="218.9" y1="148" x2="328.6" y2="148" class="lcx-ch-range"/><line x1="218.9" y1="145" x2="218.9" y2="151" class="lcx-ch-cap"/><line x1="328.6" y1="145" x2="328.6" y2="151" class="lcx-ch-cap"/><circle cx="328.6" cy="148" r="2.5" class="lcx-ch-dot"/><text x="332.63529411764705" y="150.3" class="lcx-ch-value">7.7×</text><line x1="183.4" y1="158" x2="213.0" y2="158" class="lcx-ch-range2"/><line x1="183.4" y1="155" x2="183.4" y2="161" class="lcx-ch-cap2"/><line x1="213.0" y1="155" x2="213.0" y2="161" class="lcx-ch-cap2"/><circle cx="213.0" cy="158" r="2.3" class="lcx-ch-dot2"/><text x="217.01176470588234" y="160.2" class="lcx-ch-value2">3.8×</text><text x="0" y="185" class="lcx-ch-label">BFCLv3</text><line x1="218.9" y1="182" x2="251.6" y2="182" class="lcx-ch-range"/><line x1="218.9" y1="179" x2="218.9" y2="185" class="lcx-ch-cap"/><line x1="251.6" y1="179" x2="251.6" y2="185" class="lcx-ch-cap"/><circle cx="251.6" cy="182" r="2.5" class="lcx-ch-dot"/><text x="255.55294117647057" y="184.3" class="lcx-ch-value">5.1×</text><line x1="221.9" y1="192" x2="248.6" y2="192" class="lcx-ch-range2"/><line x1="221.9" y1="189" x2="221.9" y2="195" class="lcx-ch-cap2"/><line x1="248.6" y1="189" x2="248.6" y2="195" class="lcx-ch-cap2"/><circle cx="248.6" cy="192" r="2.3" class="lcx-ch-dot2"/><text x="252.58823529411765" y="194.2" class="lcx-ch-value2">5.0×</text><text x="0" y="219" class="lcx-ch-label">τ²-bench</text><line x1="242.7" y1="216" x2="260.4" y2="216" class="lcx-ch-range"/><line x1="242.7" y1="213" x2="242.7" y2="219" class="lcx-ch-cap"/><line x1="260.4" y1="213" x2="260.4" y2="219" class="lcx-ch-cap"/><circle cx="260.4" cy="216" r="2.5" class="lcx-ch-dot"/><text x="264.44705882352946" y="218.3" class="lcx-ch-value">5.4×</text><line x1="210.0" y1="226" x2="216.0" y2="226" class="lcx-ch-range2"/><line x1="210.0" y1="223" x2="210.0" y2="229" class="lcx-ch-cap2"/><line x1="216.0" y1="223" x2="216.0" y2="229" class="lcx-ch-cap2"/><circle cx="216.0" cy="226" r="2.3" class="lcx-ch-dot2"/><text x="219.9764705882353" y="228.2" class="lcx-ch-value2">3.9×</text><line x1="130" y1="258" x2="144" y2="258" class="lcx-ch-range"/><text x="149" y="260.3" class="lcx-ch-note">Opus 4.5</text><line x1="208" y1="258" x2="222" y2="258" class="lcx-ch-range2"/><text x="227" y="260.3" class="lcx-ch-note">GPT 5.6 Sol</text><text x="436" y="260.3" class="lcx-ch-note" text-anchor="end">圓點＝最高倍數</text><text x="130" y="288" class="lcx-ch-note">長條涵蓋觀測到的最低到最高設定；圓點標出最大值。</text></svg>
    <div class="lcx-src">重繪自圖 5 · arXiv:2611.05306</div>
  </div>
</div>

逐項基準測試的表比範圍更有資訊量，因為例外會叢集在可預測的地方。

<div class="lcx-table-card">
  <div class="lcx-table-head">
    <div class="lcx-table-tag"><svg class="lcx-ico lcx-ico-xs" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#lcx-i-chart-no-axes-column"></use></svg>長流程 · 準確率與最佳設定</div>
    <div class="lcx-table-title">壓縮在哪裡幫上忙，又在哪裡付出一點代價。</div>
    <p class="lcx-table-sub">每個基準測試最佳的 EoCC 準確率，以及產生該結果的設定。Δ 是相對全歷史基線。最緊的設定不一定最好。</p>
  </div>
  <div class="lcx-table-scroll">
    <table class="lcx-results">
      <thead><tr><th>基準測試</th><th class="num">Opus 基線</th><th class="num">Opus 最佳</th><th class="num">Δ</th><th>最佳設定</th><th class="num">GPT 基線</th><th class="num">GPT 最佳</th><th class="num">Δ</th><th>最佳設定</th></tr></thead>
      <tbody>
        <tr><td>SWE-bench Verified</td><td class="num">70.0</td><td class="num strong">74.8</td><td class="num pos">+4.8</td><td>24K/18K</td><td class="num">84.4</td><td class="num strong">88.8</td><td class="num pos">+4.4</td><td>48K/36K</td></tr>
        <tr><td>Terminal-Bench 2.1</td><td class="num">47.2</td><td class="num strong">52.8</td><td class="num pos">+5.6</td><td>32K/24K</td><td class="num">87.6</td><td class="num strong">88.8</td><td class="num pos">+1.2</td><td>48K/36K</td></tr>
        <tr><td>SWE-bench Multilingual</td><td class="num">66.3</td><td class="num strong">68.0</td><td class="num pos">+1.7</td><td>48K/36K</td><td class="num">79.3</td><td class="num strong">80.0</td><td class="num pos">+0.7</td><td>48K/36K</td></tr>
        <tr><td>FRAMES</td><td class="num">81.0</td><td class="num strong">79.7</td><td class="num neg">−1.3</td><td>48K/36K</td><td class="num">90.2</td><td class="num strong">88.7</td><td class="num neg">−1.5</td><td>48K/36K</td></tr>
        <tr><td>BFCLv3</td><td class="num">62.0</td><td class="num strong">64.0</td><td class="num pos">+2.0</td><td>24K/18K</td><td class="num">39.5</td><td class="num strong">39.5</td><td class="num">0.0</td><td>24K/18K</td></tr>
        <tr><td>τ²-bench</td><td class="num">79.3</td><td class="num strong">79.3</td><td class="num">0.0</td><td>16K/12K</td><td class="num">73.9</td><td class="num strong">77.2</td><td class="num pos">+3.3</td><td>12K/8K</td></tr>
      </tbody>
    </table>
  </div>
  <div class="lcx-table-foot">受測設定中最佳的 EoCC 準確率。資料來源：arXiv:2611.05306，附錄 C，表 3–8。</div>
</div>

有三個模式值得命名。

**第一，程式與終端工作的增益最大。** Opus 在 SWE-bench Verified 上 +4.8 個百分點，Terminal-Bench +5.6，多語言組 +1.7。這不是單純資訊流失的故事會預測的結果。一個合理的解釋：壓縮強迫模型寫下計畫與當前狀態，這比一大坨 30K token 的 shell 輸出更像有效的工作記憶。論文沒有證明這個機制，但模式與它一致。

**第二，FRAMES 是壓縮穩定吃虧的那個基準測試。** 它也是代理從固定維基百科語料檢索、並在許多跳之間累積證據的基準測試。當任務是*跨檢索文件整合證據*時，摘要漏掉不該漏的那一句，代價就很高。損失不大（Opus 1.3–3.7 個百分點，GPT 1.5–3.3），但很系統性。

**第三，最佳設定往往不是最緊的。** SWE-bench Verified 對 Opus 在 24K/18K 達到峰值，不是 16K/12K。Terminal-Bench 在 32K/24K 達到峰值。關係不是單調的：壓縮太多，代理會失去線索；壓縮太少，它得為用不到的 token 付費。實務意涵是：**預算是超參數，不是道德立場。**

<div class="lcx-pull">
  <div class="lcx-pull-mark">“</div>
  <p>結果不是「越短越好」。而是「最佳值比預設短得多，而且曲線平坦到你可以找到它」。</p>
</div>

### 論文認真看待的反駁

對「你永遠不需要歷史」有一個明顯的反例：需要精確回憶任意序列的任務。論文提出一個思想實驗。給代理一個丟硬幣工具。工具回報每次結果。之後再問代理第 *i* 次的結果。在固定壓縮預算下，某些壓縮終究會丟掉某些結果；當代理需要那個被丟掉的結果，它就失敗。失敗的原因是壓縮，不是模型。

論文的回應很細緻，我認為也正確：**保留完整逐字稿，讓它可以被搜尋。** 代理的對話歷史變成另一種長輸入。如果它需要第 37 次丟硬幣的結果，它可以 `grep` 檔案庫。資訊不必*在上下文中*，它必須*可取得*。這個動作把反例從一項駁倒，變成一個設計要求：**沒有檔案庫的壓縮是有損的；有檔案庫的壓縮是快取。**

這和資料庫做的事一樣。buffer pool 很小，磁碟很大，索引決定要帶什麼進來。論文主張代理記憶應該更像資料庫，而不是一段不斷長大的聊天紀錄。

<div class="lcx-kicker"><svg class="lcx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#lcx-i-file-text"></use></svg>結果 2 · 長輸入</div>

## 選擇性閱讀勝過貼上——有時勝過 40 個百分點

第二個研究問題是：長輸入到底需不需要被完整吞進去？基線把整份文件放進 prompt。壓縮外殼拿到一個檔案系統與一組 Bash 工具。兩者使用同一個模型、同一個任務。

結果完全不在同一個量級。

<figure class="fig">
  <img src="/images/long-context/fig06-long-input.webp" alt="七個面板的長輸入基準測試結果，顯示代理選擇性閱讀文件時，準確率最高增加 40 個百分點，成本節省 4.4× 到 233×" width="1800" height="1912" loading="lazy" />
  <figcaption><b>圖 6（論文原圖）</b>——長輸入結果。每個面板上排：相對全輸入基線的準確率變化。下排：估計成本節省。增益在 needle 型基準測試上最大，但連 LOONG 與 AA-LCR 都進步。該注意的是：x 軸是總上下文上限，不是文件大小——代理的工作上下文有上限，來源文件卻和原本一樣大。資料來源：<a href="https://arxiv.org/abs/2611.05306">Belcak et al., arXiv:2611.05306</a> · <a href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a></figcaption>
</figure>

整體數字幾乎令人難以置信，直到你看見機制：

- **準確率範圍：** Opus 4.5 **−0.4 到 +40.0 個百分點**；GPT 5.6 Sol **+1.0 到 +30.9 個百分點**。十四個模型–基準測試配對中只有一個是負的，而且是 −0.4。
- **成本：** Opus 4.5 **6.5×–54.6×**，GPT 5.6 Sol **4.4×–233.3×**。
- **壓縮很少發生：** 在數個基準測試上，壓縮次數的中位數是**零**。選擇性閱讀做了幾乎所有的工作；壓縮是備援，不是主戲。

<div class="chamfer-card-wrapper lcx-card">
  <div class="chamfer-card-content">
    <div class="card-tag lcx-tag"><svg class="lcx-ico lcx-ico-xs" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#lcx-i-trending-down"></use></svg> EXHIBIT // 04 · 長輸入變化</div>
    <div class="lcx-card-title">選擇性閱讀通常會贏。</div>
    <p class="lcx-card-sub">相對全輸入基線的準確率變化，單位為百分點。長條落在零右側，代表把文件存成檔案、用 Bash 讀取，勝過把一切貼進 prompt。</p>
    <svg class="lcx-chart" viewBox="0 0 460 310" role="img" aria-label="七個長輸入基準測試與兩個模型的準確率變化" xmlns="http://www.w3.org/2000/svg"><text x="126" y="10" class="lcx-ch-axis" text-anchor="start">準確率變化 VS. 全輸入基線（百分點）</text><line x1="146.8" y1="26" x2="146.8" y2="236" class="lcx-ch-grid"/><text x="146.8" y="250" class="lcx-ch-axis" text-anchor="middle">+0</text><line x1="216.13333333333333" y1="26" x2="216.13333333333333" y2="236" class="lcx-ch-grid"/><text x="216.13333333333333" y="250" class="lcx-ch-axis" text-anchor="middle">+10</text><line x1="285.4666666666667" y1="26" x2="285.4666666666667" y2="236" class="lcx-ch-grid"/><text x="285.4666666666667" y="250" class="lcx-ch-axis" text-anchor="middle">+20</text><line x1="354.8" y1="26" x2="354.8" y2="236" class="lcx-ch-grid"/><text x="354.8" y="250" class="lcx-ch-axis" text-anchor="middle">+30</text><line x1="424.1333333333333" y1="26" x2="424.1333333333333" y2="236" class="lcx-ch-grid"/><text x="424.1333333333333" y="250" class="lcx-ch-axis" text-anchor="middle">+40</text><line x1="146.8" y1="26" x2="146.8" y2="236" class="lcx-ch-zero"/><text x="0" y="47" class="lcx-ch-label">LongBench v2</text><rect x="144.0" y="38" width="2.8" height="5" class="lcx-ch-bar"/><text x="140.02666666666667" y="42.4" class="lcx-ch-value" text-anchor="end">-0.4</text><rect x="146.8" y="48" width="12.5" height="5" class="lcx-ch-bar2"/><text x="163.28" y="52.4" class="lcx-ch-value2" text-anchor="start">+1.8</text><text x="0" y="77" class="lcx-ch-label">LOONG</text><rect x="146.8" y="68" width="63.8" height="5" class="lcx-ch-bar"/><text x="214.58666666666664" y="72.4" class="lcx-ch-value" text-anchor="start">+9.2</text><rect x="146.8" y="78" width="23.6" height="5" class="lcx-ch-bar2"/><text x="174.37333333333333" y="82.4" class="lcx-ch-value2" text-anchor="start">+3.4</text><text x="0" y="107" class="lcx-ch-label">AA-LCR</text><rect x="146.8" y="98" width="131.7" height="5" class="lcx-ch-bar"/><text x="282.5333333333333" y="102.4" class="lcx-ch-value" text-anchor="start">+19.0</text><rect x="146.8" y="108" width="6.9" height="5" class="lcx-ch-bar2"/><text x="157.73333333333335" y="112.4" class="lcx-ch-value2" text-anchor="start">+1.0</text><text x="0" y="137" class="lcx-ch-label">NIAH</text><rect x="146.8" y="128" width="277.3" height="5" class="lcx-ch-bar"/><text x="428.1333333333333" y="132.4" class="lcx-ch-value" text-anchor="start">+40.0</text><rect x="146.8" y="138" width="138.7" height="5" class="lcx-ch-bar2"/><text x="289.4666666666667" y="142.4" class="lcx-ch-value2" text-anchor="start">+20.0</text><text x="0" y="167" class="lcx-ch-label">RULER</text><rect x="146.8" y="158" width="230.2" height="5" class="lcx-ch-bar"/><text x="380.9866666666667" y="162.4" class="lcx-ch-value" text-anchor="start">+33.2</text><rect x="146.8" y="168" width="214.2" height="5" class="lcx-ch-bar2"/><text x="365.03999999999996" y="172.4" class="lcx-ch-value2" text-anchor="start">+30.9</text><text x="0" y="197" class="lcx-ch-label">Counting-Stars</text><rect x="146.8" y="188" width="111.6" height="5" class="lcx-ch-bar"/><text x="262.4266666666667" y="192.4" class="lcx-ch-value" text-anchor="start">+16.1</text><rect x="146.8" y="198" width="31.9" height="5" class="lcx-ch-bar2"/><text x="182.69333333333333" y="202.4" class="lcx-ch-value2" text-anchor="start">+4.6</text><text x="0" y="227" class="lcx-ch-label">BABILong</text><rect x="146.8" y="218" width="172.6" height="5" class="lcx-ch-bar"/><text x="323.44" y="222.4" class="lcx-ch-value" text-anchor="start">+24.9</text><rect x="146.8" y="228" width="161.5" height="5" class="lcx-ch-bar2"/><text x="312.3466666666667" y="232.4" class="lcx-ch-value2" text-anchor="start">+23.3</text><rect x="126" y="266" width="9" height="5" class="lcx-ch-bar"/><text x="140" y="271" class="lcx-ch-note">Opus 4.5</text><rect x="204" y="266" width="9" height="5" class="lcx-ch-bar2"/><text x="218" y="271" class="lcx-ch-note">GPT 5.6 Sol</text><text x="458" y="271" class="lcx-ch-note" text-anchor="end">最佳壓縮設定</text><text x="126" y="298" class="lcx-ch-note">長條落在零右側，代表選擇性閱讀勝過貼上整份文件。</text></svg>
    <div class="lcx-src">重繪自圖 6 與表 11–17</div>
  </div>
</div>

逐項基準測試的表把模式具體化。

<div class="lcx-table-card">
  <div class="lcx-table-head">
    <div class="lcx-table-tag"><svg class="lcx-ico lcx-ico-xs" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#lcx-i-chart-no-axes-column"></use></svg>長輸入 · 基線 VS. 選擇性閱讀</div>
    <div class="lcx-table-title">七個基準測試，兩個模型，一個模式。</div>
    <p class="lcx-table-sub">最佳壓縮準確率相對全輸入基線。「Perfect」是該基準測試有回報時的完全答對率；「mean」是平均分數。成本倍數是論文在圖示設定下的估計。</p>
  </div>
  <div class="lcx-table-scroll">
    <table class="lcx-results lcx-wide">
      <thead><tr><th>基準測試</th><th class="num">Opus 基線</th><th class="num">Opus 壓縮</th><th class="num">Δ</th><th class="num">成本</th><th class="num">GPT 基線</th><th class="num">GPT 壓縮</th><th class="num">Δ</th><th class="num">成本</th></tr></thead>
      <tbody>
        <tr><td>LongBench v2</td><td class="num">68.0</td><td class="num">67.6</td><td class="num neg">−0.4</td><td class="num">7.4×</td><td class="num">70.8</td><td class="num strong">72.6</td><td class="num pos">+1.8</td><td class="num">4.4×</td></tr>
        <tr><td>LOONG <span class="lcx-cell-note">平均／完全答對</span></td><td class="num">70.1 / 38.9</td><td class="num strong">79.3 / 53.4</td><td class="num pos">+9.2 / +14.5</td><td class="num">13.6×</td><td class="num">79.3 / 44.4</td><td class="num strong">82.7 / 51.9</td><td class="num pos">+3.4 / +7.5</td><td class="num">12.9×</td></tr>
        <tr><td>AA-LCR</td><td class="num">65.0</td><td class="num strong">84.0</td><td class="num pos">+19.0</td><td class="num">9.8×</td><td class="num">82.0</td><td class="num strong">83.0</td><td class="num pos">+1.0</td><td class="num">16.2×</td></tr>
        <tr><td>NIAH</td><td class="num">60.0</td><td class="num strong">100.0</td><td class="num pos">+40.0</td><td class="num">54.6×</td><td class="num">80.0</td><td class="num strong">100.0</td><td class="num pos">+20.0</td><td class="num">233.3×</td></tr>
        <tr><td>RULER <span class="lcx-cell-note">召回</span></td><td class="num">62.5</td><td class="num strong">95.7</td><td class="num pos">+33.2</td><td class="num">42.8×</td><td class="num">65.5</td><td class="num strong">96.4</td><td class="num pos">+30.9</td><td class="num">80.5×</td></tr>
        <tr><td>Counting-Stars <span class="lcx-cell-note">完全答對</span></td><td class="num">65.1</td><td class="num strong">81.2</td><td class="num pos">+16.1</td><td class="num">25.9×</td><td class="num">76.6</td><td class="num strong">81.2</td><td class="num pos">+4.6</td><td class="num">40.7×</td></tr>
        <tr><td>BABILong</td><td class="num">67.1</td><td class="num strong">92.0</td><td class="num pos">+24.9</td><td class="num">31.5×</td><td class="num">70.7</td><td class="num strong">94.0</td><td class="num pos">+23.3</td><td class="num">88.0×</td></tr>
      </tbody>
    </table>
  </div>
  <div class="lcx-table-foot">每個基準測試最佳的壓縮結果，附論文的估計最佳化零售成本倍數。資料來源：附錄 F，表 11–17，以及圖 6。</div>
</div>

為什麼選擇性閱讀會*勝過*貼上？論文的解釋不是模型在小型上下文裡比較聰明。而是**檢索是一個過濾步驟**。用 `grep` 找一個名字或片語，回傳幾行；模型再讀取它們周圍的視窗。無關的 99% 從不進入上下文，所以無法讓模型分心，也無法稀釋注意力。貼上一切，等於要模型在內部做過濾，用有限的注意力預算，而且沒有明確的索引。

論文也直接回報長度關係。圖 7 與圖 8 以對數 x 軸畫出總對話長度對文件長度。如果代理是按比例吞文件，點會貼著虛線 `y = x`。它們沒有；對話長度停留在一個寬頻帶內，文件長度卻橫跨好幾個數量級。

<figure class="fig">
  <img src="/images/long-context/fig07-longbench-scatter.webp" alt="LongBench v2 的對話長度對文件長度散佈圖，x 軸為對數；大多數點落在遠低於等長線的水平帶內" width="1600" height="1032" loading="lazy" />
  <figcaption><b>圖 7（論文原圖）</b>——LongBench v2，Opus 4.5 以 16K/12K 壓縮。x 軸是對數，y 軸是線性；虛線是 `y = x`。該注意的是：文件從 10K 長到超過 1M token，對話大致維持在有界範圍。代理不是按比例讀得更多；它是搜得更好。資料來源：<a href="https://arxiv.org/abs/2611.05306">Belcak et al., arXiv:2611.05306</a> · <a href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a></figcaption>
</figure>

<figure class="fig">
  <img src="/images/long-context/fig08-loong-scatter.webp" alt="LOONG 的對話長度對文件長度散佈圖；四個文件大小分組都維持在約 20K 到 100K 對話 token 的帶狀區域，低於等長線" width="1600" height="1032" loading="lazy" />
  <figcaption><b>圖 8（論文原圖）</b>——LOONG，Opus 4.5 以 48K/40K 壓縮，1,600 個問題。四個文件大小分組都呈現同樣的有界對話模式。該注意的是：垂直方向的離散來自任務難度，不是文件長度。一份 300K token 的文件，不會強迫產生 300K token 的對話。資料來源：<a href="https://arxiv.org/abs/2611.05306">Belcak et al., arXiv:2611.05306</a> · <a href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a></figcaption>
</figure>

壓縮次數中位數接近零，就是線索。在 NIAH 上，兩個模型完全不壓縮；在 Counting-Stars 上，兩者都不壓縮；在 RULER 上，中位數是零；在 BABILong 上，GPT 從不壓縮，Opus 每個任務最多壓縮一次。代理找到證據、讀一個小視窗、回答。長輸入很長，但*工作集*很小。

<div class="lcx-callout lcx-callout-warn">
  <svg class="lcx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#lcx-i-triangle-alert"></use></svg>
  <div><b>不要把 needle 結果讀過頭。</b> NIAH 與 Counting-Stars 有詞彙抓手：名字、數字、有辨識度的片語。`grep` 找得到。論文坦白承認，這讓 needle 基準測試比現實的多文件推理容易。更強的證據是 LOONG 與 AA-LCR：代理必須跨文件定位、比較、整合證據——而且仍然進步。</div>
</div>

論文還提出一個容易漏掉的根本論點：**needle-in-a-haystack 基準測試假設長上下文任務存在。** 如果一個任務之所以產生長上下文，唯一原因是有人把乾草堆貼進了 prompt，那這個基準測試量的是自找的限制。論文的結果顯示，這個限制可以移除，而 needle 不會掉。

<div class="lcx-kicker"><svg class="lcx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#lcx-i-zap"></use></svg>結果 3 · 一個動作</div>

## 最激進的版本：每個上下文一個動作

第三個問題讓我坐直了身子。如果壓縮有效，你可以多常做？每段對話一次？每個任務一次？論文把它推到極限：**每個動作之後都壓縮。** 每段對話包含任務、目前的語意狀態，以及恰好一個 Bash 動作。然後對話被丟掉，下一段從更新後的狀態開始。

這不是「更積極地摘要歷史」。這是不同的執行模型：模型從不看見自己先前的訊息，只看見它自己產出的書面狀態。狀態是動作之間唯一的橋樑。

<div class="lcx-table-card">
  <div class="lcx-table-head">
    <div class="lcx-table-tag"><svg class="lcx-ico lcx-ico-xs" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#lcx-i-chart-no-axes-column"></use></svg>表 2，重繪 · SAC VS. FHA VS. EoCC</div>
    <div class="lcx-table-title">每個上下文一個動作，幾乎沒有準確率代價。</div>
    <p class="lcx-table-sub">峰值上下文長度是每任務的中位數／最大值，單位為千 token。最佳 EoCC 欄使用括號中的設定。</p>
  </div>
  <div class="lcx-table-scroll">
    <table class="lcx-results">
      <thead><tr><th>模型 · 基準測試</th><th class="num">FHA 準確率</th><th class="num">最佳 EoCC</th><th class="num">SAC 準確率</th><th class="num">FHA 峰值</th><th class="num">最佳 EoCC 峰值</th><th class="num">SAC 峰值</th></tr></thead>
      <tbody>
        <tr><td>Opus 4.5 · SWE-bench Verified</td><td class="num">70.0</td><td class="num">74.8 <span class="lcx-cell-note">(24K/18K)</span></td><td class="num strong">70.2</td><td class="num">32 / 200</td><td class="num">19 / 22</td><td class="num strong">8 / 16</td></tr>
        <tr><td>Opus 4.5 · Terminal-Bench</td><td class="num">47.2</td><td class="num">52.8 <span class="lcx-cell-note">(32K/24K)</span></td><td class="num strong">51.8</td><td class="num">27 / 130</td><td class="num">24 / 31</td><td class="num strong">9 / 19</td></tr>
        <tr><td>GPT 5.6 Sol · SWE-bench Verified</td><td class="num">84.4</td><td class="num">88.8 <span class="lcx-cell-note">(48K/36K)</span></td><td class="num">82.4</td><td class="num">18 / 173</td><td class="num">22 / 35</td><td class="num strong">7 / 15</td></tr>
        <tr><td>GPT 5.6 Sol · Terminal-Bench</td><td class="num">87.6</td><td class="num">88.8 <span class="lcx-cell-note">(48K/36K)</span></td><td class="num">84.3</td><td class="num">17 / 133</td><td class="num">23 / 40</td><td class="num strong">8 / 37</td></tr>
      </tbody>
    </table>
  </div>
  <div class="lcx-table-foot">SAC 在兩個基準測試上都保住或改善 Opus 4.5 的基線；GPT 5.6 Sol 則掉 2.0 與 3.3 個百分點。每一列的峰值上下文都大幅收縮。資料來源：arXiv:2611.05306，表 2。</div>
</div>

<div class="chamfer-card-wrapper lcx-card">
  <div class="chamfer-card-content">
    <div class="card-tag lcx-tag"><svg class="lcx-ico lcx-ico-xs" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#lcx-i-zap"></use></svg> EXHIBIT // 05 · 單動作結果</div>
    <div class="lcx-card-title">峰值上下文崩塌，準確率大致不動。</div>
    <p class="lcx-card-sub">每任務峰值即時上下文，在全歷史基線（淺色）與單動作壓縮（深色）之下。圓點是中位數；長條延伸到最大值。</p>
    <svg class="lcx-chart" viewBox="0 0 440 250" role="img" aria-label="全歷史與單動作壓縮下的峰值上下文長度" xmlns="http://www.w3.org/2000/svg"><text x="132" y="10" class="lcx-ch-axis" text-anchor="start">每任務峰值即時上下文（K token）</text><line x1="132.0" y1="28" x2="132.0" y2="196" class="lcx-ch-grid"/><text x="132.0" y="210" class="lcx-ch-axis" text-anchor="middle">0K</text><line x1="192.95238095238096" y1="28" x2="192.95238095238096" y2="196" class="lcx-ch-grid"/><text x="192.95238095238096" y="210" class="lcx-ch-axis" text-anchor="middle">50K</text><line x1="253.9047619047619" y1="28" x2="253.9047619047619" y2="196" class="lcx-ch-grid"/><text x="253.9047619047619" y="210" class="lcx-ch-axis" text-anchor="middle">100K</text><line x1="314.8571428571429" y1="28" x2="314.8571428571429" y2="196" class="lcx-ch-grid"/><text x="314.8571428571429" y="210" class="lcx-ch-axis" text-anchor="middle">150K</text><line x1="375.8095238095238" y1="28" x2="375.8095238095238" y2="196" class="lcx-ch-grid"/><text x="375.8095238095238" y="210" class="lcx-ch-axis" text-anchor="middle">200K</text><line x1="132.0" y1="28" x2="132.0" y2="196" class="lcx-ch-zero"/><text x="0" y="50" class="lcx-ch-label">Opus · SWE-bench Verified</text><line x1="171.0" y1="46" x2="375.8" y2="46" class="lcx-ch-range"/><line x1="171.0" y1="43" x2="171.0" y2="49" class="lcx-ch-cap"/><line x1="375.8" y1="43" x2="375.8" y2="49" class="lcx-ch-cap"/><circle cx="171.0" cy="46" r="2.5" class="lcx-ch-dot2"/><text x="379.8095238095238" y="48.2" class="lcx-ch-note">200K</text><line x1="141.8" y1="57" x2="151.5" y2="57" class="lcx-ch-range-strong"/><line x1="141.8" y1="54" x2="141.8" y2="60" class="lcx-ch-cap-strong"/><line x1="151.5" y1="54" x2="151.5" y2="60" class="lcx-ch-cap-strong"/><circle cx="141.8" cy="57" r="2.8" class="lcx-ch-dot"/><text x="155.5047619047619" y="59.2" class="lcx-ch-value">16K</text><text x="0" y="88" class="lcx-ch-label">Opus · Terminal-Bench</text><line x1="164.9" y1="84" x2="290.5" y2="84" class="lcx-ch-range"/><line x1="164.9" y1="81" x2="164.9" y2="87" class="lcx-ch-cap"/><line x1="290.5" y1="81" x2="290.5" y2="87" class="lcx-ch-cap"/><circle cx="164.9" cy="84" r="2.5" class="lcx-ch-dot2"/><text x="294.4761904761905" y="86.2" class="lcx-ch-note">130K</text><line x1="143.0" y1="95" x2="155.2" y2="95" class="lcx-ch-range-strong"/><line x1="143.0" y1="92" x2="143.0" y2="98" class="lcx-ch-cap-strong"/><line x1="155.2" y1="92" x2="155.2" y2="98" class="lcx-ch-cap-strong"/><circle cx="143.0" cy="95" r="2.8" class="lcx-ch-dot"/><text x="159.16190476190476" y="97.2" class="lcx-ch-value">19K</text><text x="0" y="126" class="lcx-ch-label">GPT · SWE-bench Verified</text><line x1="153.9" y1="122" x2="342.9" y2="122" class="lcx-ch-range"/><line x1="153.9" y1="119" x2="153.9" y2="125" class="lcx-ch-cap"/><line x1="342.9" y1="119" x2="342.9" y2="125" class="lcx-ch-cap"/><circle cx="153.9" cy="122" r="2.5" class="lcx-ch-dot2"/><text x="346.8952380952381" y="124.2" class="lcx-ch-note">173K</text><line x1="140.5" y1="133" x2="150.3" y2="133" class="lcx-ch-range-strong"/><line x1="140.5" y1="130" x2="140.5" y2="136" class="lcx-ch-cap-strong"/><line x1="150.3" y1="130" x2="150.3" y2="136" class="lcx-ch-cap-strong"/><circle cx="140.5" cy="133" r="2.8" class="lcx-ch-dot"/><text x="154.28571428571428" y="135.2" class="lcx-ch-value">15K</text><text x="0" y="164" class="lcx-ch-label">GPT · Terminal-Bench</text><line x1="152.7" y1="160" x2="294.1" y2="160" class="lcx-ch-range"/><line x1="152.7" y1="157" x2="152.7" y2="163" class="lcx-ch-cap"/><line x1="294.1" y1="157" x2="294.1" y2="163" class="lcx-ch-cap"/><circle cx="152.7" cy="160" r="2.5" class="lcx-ch-dot2"/><text x="298.1333333333333" y="162.2" class="lcx-ch-note">133K</text><line x1="141.8" y1="171" x2="177.1" y2="171" class="lcx-ch-range-strong"/><line x1="141.8" y1="168" x2="141.8" y2="174" class="lcx-ch-cap-strong"/><line x1="177.1" y1="168" x2="177.1" y2="174" class="lcx-ch-cap-strong"/><circle cx="141.8" cy="171" r="2.8" class="lcx-ch-dot"/><text x="181.10476190476192" y="173.2" class="lcx-ch-value">37K</text><line x1="132" y1="220" x2="145" y2="220" class="lcx-ch-range"/><circle cx="138" cy="220" r="2.4" class="lcx-ch-dot2"/><text x="150" y="222.3" class="lcx-ch-note">FHA 基線</text><line x1="236" y1="220" x2="249" y2="220" class="lcx-ch-range-strong"/><circle cx="242" cy="220" r="2.6" class="lcx-ch-dot"/><text x="254" y="222.3" class="lcx-ch-note">SAC</text><text x="132" y="242" class="lcx-ch-note">長條＝每任務峰值上下文的中位數到最大值；圓點＝中位數。</text></svg>
    <div class="lcx-src">重繪自表 2 · arXiv:2611.05306</div>
  </div>
</div>

這個分叉很有啟發。Opus 4.5 在 SAC 下於 SWE-bench Verified **略好**（70.2 對 70.0），在 Terminal-Bench **好 4.6 個百分點**（51.8 對 47.2）。GPT 5.6 Sol 在 SWE-bench Verified **差 2.0 個百分點**，在 Terminal-Bench **差 3.3 個百分點**。兩個模型都還能工作，都沒有崩潰。峰值上下文最大值從 130K–200K 降到 15K–37K，中位數降到 7K–9K。

為什麼 Opus 少了上下文反而*更好*？論文沒有直接回答，但機制合理，也與長流程結果一致。單動作對話被迫從一份書面狀態開始，狀態會說：任務是什麼、我做過什麼、我下一步打算做什麼、哪些產物重要。這是一個**更好的 prompt**，勝過一份 30K token、相關事實埋在第四頁的逐字稿。狀態是壓縮，但也是一種策展。有時候，策展勝過完整。

我一直回想到的類比是**交班筆記**。醫院護理師在下班時，不會為下一班重播一整天的每一分鐘。他們寫一份結構化筆記：病人狀態、有什麼變化、什麼待辦、該注意什麼。筆記是有損的。它也比錄影更有用，因為它是*為下一班人的決策而挑選的*。全歷史模型是錄影；單動作壓縮是交班筆記。

GPT 的結果是另一邊的砝碼。一個被後訓練成對長歷史做注意力的模型，在歷史消失時可能掉得更多，尤其當它的工具使用策略依賴逐字稿裡近期的範例。論文自己的框架支持這點：SAC 是**後訓練目標**——也就是預訓練之後、教模型遵循指令與使用工具的那個階段——不只是外殼技巧。你可以把壓縮硬裝到任何模型上；模型擅不擅長*書寫與閱讀狀態*，是另一種能力。

<div class="lcx-pull">
  <div class="lcx-pull-mark">“</div>
  <p>SAC 不是 prompt 小把戲。它是一個賭注：賭模型能用自然語言維持狀態——而這個賭注在不同模型上回收得不均勻。</p>
</div>

<div class="lcx-kicker"><svg class="lcx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#lcx-i-brain"></use></svg>概念</div>

## 語意狀態空間模型

論文的概念貢獻，是替 SAC 在做的事取一個名字：**語意狀態空間模型（SSSM）**。定義有五個部分。一個 SSSM 被後訓練來：

1. **理解**一段自然語言描述的對話狀態。
2. **推理**下一個動作，或手上的任務。
3. **執行**一個動作。
4. **登記**結果。
5. **更新**自然語言狀態，把推理結論、動作決策與結果寫進去，形式要能讓*另一個推論實例*接續對話。

最後一句是重點。狀態不是層與層之間傳遞的隱藏向量。它是文字，由模型寫下，下一個實例讀得懂，人類也稽核得到。這讓它成為**語意**的，而不是神經的。

<div class="lcx-compare">
  <div class="lcx-compare-col">
    <div class="lcx-compare-head"><svg class="lcx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#lcx-i-cpu"></use></svg>狀態空間模型</div>
    <p>在 token 生成之間更新的黑箱神經狀態。有效率、連續、難以檢視。狀態是內部張量。</p>
    <div class="lcx-compare-foot">不透明 · 快 · 學習得來</div>
  </div>
  <div class="lcx-compare-col">
    <div class="lcx-compare-head"><svg class="lcx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#lcx-i-notebook-pen"></use></svg>語意狀態空間模型</div>
    <p>在回合之間更新的自然語言狀態。每次交接較慢，但可檢視、可編輯、可跨模型實例攜帶、可除錯。</p>
    <div class="lcx-compare-foot">可解釋 · 可攜 · 可稽核</div>
  </div>
</div>

SAC 那一節的交班筆記，在這裡也成立：SSSM 就是一個被訓練來書寫與閱讀那份筆記的模型。

論文主張，SSSM 在訓練上可能比全歷史模型更**資料有效率**，因為模型不必學會該對長逐字稿的哪些片段做注意力。它只需要學會如何維持狀態。這是假設，不是結果，但很合理：對長上下文做注意力是困難、吃資料的技能；狀態維護是範圍較窄、訓練訊號較清楚的技能。

論文結尾的修辭問句很尖銳：**如果 SSSM 能追平全歷史模型，那為什麼還要訓練全歷史模型？** 誠實的答案是：我們還不知道。實驗顯示壓縮在這些基準測試上足夠；它們沒有顯示一個從頭訓練來維持狀態的模型，會比一個訓練來做注意力的模型更好。但舉證責任已經移位。

<div class="lcx-kicker"><svg class="lcx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#lcx-i-notebook-pen"></use></svg>配方</div>

## 一份好的壓縮到底該包含什麼

附錄 A 是論文最實用的部分，卻很容易被跳過。作者先試了顯而易見的做法——把壓縮當成摘要——發現效果不理想。摘要試圖給輸入裡的每一樣東西同等重量，還會過度強調代理軌跡中重複的片段。摘要告訴你發生了什麼。好的壓縮告訴下一個實例**接下來該做什麼**。

在論文裡每一種工作流程都有效的結構，有四種成分：

<div class="lcx-recipe">
  <div class="lcx-recipe-item">
    <div class="lcx-recipe-num">01</div>
    <div class="lcx-recipe-body"><div class="lcx-recipe-title">任務，逐字或近乎逐字</div><p>不要改寫。確切的需求、限制與驗收標準。改寫任務，就是你弄丟關鍵那一句的方式。</p></div>
  </div>
  <div class="lcx-recipe-item">
    <div class="lcx-recipe-num">02</div>
    <div class="lcx-recipe-body"><div class="lcx-recipe-title">目前在做什麼、意圖與下一步</div><p>我現在在做什麼？我原本打算下一步做什麼？什麼卡住了，為什麼？這就是「交班」段落。</p></div>
  </div>
  <div class="lcx-recipe-item">
    <div class="lcx-recipe-num">03</div>
    <div class="lcx-recipe-body"><div class="lcx-recipe-title">與後續執行相關的產物</div><p>檔案路徑、diff、測試名稱、錯誤訊息、API 簽名——下一個動作真正會碰到的東西。不是每一個產物；是承重的那些。</p></div>
  </div>
  <div class="lcx-recipe-item">
    <div class="lcx-recipe-num">04</div>
    <div class="lcx-recipe-body"><div class="lcx-recipe-title">計畫、完成定義與指標</div><p>從任務拆解出的計畫、完成條件的清單，以及其餘證據放在哪裡的指標。指標讓檔案庫變得可用。</p></div>
  </div>
</div>

論文的原話值得引用：最好的壓縮「不是執行歷史的敘事，而是為後續執行仔細挑選的簡報」。那是和摘要不同的目標函數。摘要最佳化覆蓋率。簡報最佳化**決策相關性**。

<div class="lcx-callout">
  <svg class="lcx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#lcx-i-scissors"></use></svg>
  <div><b>反模式。</b> 「代理探索了儲存庫、跑了測試、在 parser 裡找到一個 bug，然後做了一些修改。」這是摘要。它沒有檔名、沒有失敗的測試、沒有下一步、沒有完成定義。下一個實例會重做整段探索。好的壓縮會說：「Parser bug 在 <code>src/parse.ts:184</code>；失敗測試 <code>parse.spec.ts::handles CRLF</code>；修正 offset 計算；跑 <code>bun test parse</code>；不要動 lexer。」</div>
</div>

論文也指出，這個結構不限於軟體工程。它被用在研究裡的每一種工作流程：終端任務、網路研究、工具使用情境。共同點不是程式碼，而是**後繼者可以據以行動的狀態**。

<div class="lcx-kicker"><svg class="lcx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#lcx-i-triangle-alert"></use></svg>哪裡會壞</div>

## 例外是最有用的部分

論文對失敗模式很誠實，而誠實的部分正是開發者該花注意力的地方。

### 開放權重模型不是一致地穩健

主要實驗使用兩個前沿閉源模型。附錄 D 在五個開放權重（可下載、自行部署）的模型上重做長流程測試。落差很大。

<div class="chamfer-card-wrapper lcx-card">
  <div class="chamfer-card-content">
    <div class="card-tag lcx-tag"><svg class="lcx-ico lcx-ico-xs" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#lcx-i-triangle-alert"></use></svg> EXHIBIT // 06 · 開放權重的脆弱性</div>
    <div class="lcx-card-title">有一個模型掉下懸崖。</div>
    <p class="lcx-card-sub">五個開放權重（可下載、自行部署）的模型在四種上下文預算下的 SWE-bench Verified 分數。Qwen 3 Coder Next 在最緊的設定掉 49.4 個百分點；其餘掉 3.6–13.4。</p>
    <svg class="lcx-chart" viewBox="0 0 440 300" role="img" aria-label="五個開放權重（可下載、自行部署）的模型在 SWE-bench Verified 上隨上下文預算收緊的分組長條圖" xmlns="http://www.w3.org/2000/svg"><text x="38" y="10" class="lcx-ch-axis" text-anchor="start">SWE-BENCH VERIFIED · 解決率（%）</text><line x1="38" y1="216.0" x2="424" y2="216.0" class="lcx-ch-grid"/><text x="33" y="218.2" class="lcx-ch-axis" text-anchor="end">0</text><line x1="38" y1="169.0" x2="424" y2="169.0" class="lcx-ch-grid"/><text x="33" y="171.2" class="lcx-ch-axis" text-anchor="end">20</text><line x1="38" y1="122.0" x2="424" y2="122.0" class="lcx-ch-grid"/><text x="33" y="124.2" class="lcx-ch-axis" text-anchor="end">40</text><line x1="38" y1="75.0" x2="424" y2="75.0" class="lcx-ch-grid"/><text x="33" y="77.2" class="lcx-ch-axis" text-anchor="end">60</text><line x1="38" y1="28.0" x2="424" y2="28.0" class="lcx-ch-grid"/><text x="33" y="30.2" class="lcx-ch-axis" text-anchor="end">80</text><rect x="53.0" y="54.8" width="10" height="161.2" class="lcx-ch-bar"/><rect x="65.4" y="52.9" width="10" height="163.1" class="lcx-ch-bar-mid"/><rect x="77.8" y="55.7" width="10" height="160.3" class="lcx-ch-bar-soft"/><rect x="90.2" y="63.2" width="10" height="152.8" class="lcx-ch-bar-pale"/><text x="76.6" y="230" class="lcx-ch-axis" text-anchor="middle">Qwen 3.6</text><text x="76.6" y="238" class="lcx-ch-axis" text-anchor="middle">27B</text><rect x="130.2" y="91.5" width="10" height="124.5" class="lcx-ch-bar"/><rect x="142.6" y="100.4" width="10" height="115.6" class="lcx-ch-bar-mid"/><rect x="155.0" y="121.1" width="10" height="94.9" class="lcx-ch-bar-soft"/><rect x="167.4" y="207.5" width="10" height="8.5" class="lcx-ch-bar-pale"/><text x="153.8" y="230" class="lcx-ch-axis" text-anchor="middle">Qwen Coder</text><text x="153.8" y="238" class="lcx-ch-axis" text-anchor="middle">Next</text><rect x="207.4" y="62.8" width="10" height="153.2" class="lcx-ch-bar"/><rect x="219.8" y="63.2" width="10" height="152.8" class="lcx-ch-bar-mid"/><rect x="232.2" y="61.4" width="10" height="154.6" class="lcx-ch-bar-soft"/><rect x="244.6" y="79.7" width="10" height="136.3" class="lcx-ch-bar-pale"/><text x="231.0" y="230" class="lcx-ch-axis" text-anchor="middle">Gemma 4</text><text x="231.0" y="238" class="lcx-ch-axis" text-anchor="middle">31B</text><rect x="284.6" y="51.5" width="10" height="164.5" class="lcx-ch-bar"/><rect x="297.0" y="59.0" width="10" height="157.0" class="lcx-ch-bar-mid"/><rect x="309.4" y="64.2" width="10" height="151.8" class="lcx-ch-bar-soft"/><rect x="321.8" y="83.0" width="10" height="133.0" class="lcx-ch-bar-pale"/><text x="308.2" y="230" class="lcx-ch-axis" text-anchor="middle">Step 3.7</text><text x="308.2" y="238" class="lcx-ch-axis" text-anchor="middle">Flash</text><rect x="361.8" y="45.4" width="10" height="170.6" class="lcx-ch-bar"/><rect x="374.2" y="44.5" width="10" height="171.6" class="lcx-ch-bar-mid"/><rect x="386.6" y="44.0" width="10" height="172.0" class="lcx-ch-bar-soft"/><rect x="399.0" y="56.7" width="10" height="159.3" class="lcx-ch-bar-pale"/><text x="385.40000000000003" y="230" class="lcx-ch-axis" text-anchor="middle">MiniMax</text><text x="385.40000000000003" y="238" class="lcx-ch-axis" text-anchor="middle">M2.7</text><line x1="38" y1="216" x2="424" y2="216" class="lcx-ch-axis-line"/><text x="194.8" y="194.85" class="lcx-ch-value">3.6</text><rect x="38" y="256" width="8" height="5" class="lcx-ch-bar"/><text x="50" y="261" class="lcx-ch-note">基線</text><rect x="134" y="256" width="8" height="5" class="lcx-ch-bar-mid"/><text x="146" y="261" class="lcx-ch-note">48K/40K</text><rect x="230" y="256" width="8" height="5" class="lcx-ch-bar-soft"/><text x="242" y="261" class="lcx-ch-note">32K/24K</text><rect x="326" y="256" width="8" height="5" class="lcx-ch-bar-pale"/><text x="338" y="261" class="lcx-ch-note">16K/12K</text><text x="38" y="288" class="lcx-ch-note">Qwen 3 Coder Next（第二組）在 16K/12K 崩潰；其餘四個模型掉 3.6–13.4 個百分點。</text></svg>
    <div class="lcx-src">重繪自表 9 · arXiv:2611.05306</div>
  </div>
</div>

<div class="lcx-table-card">
  <div class="lcx-table-head">
    <div class="lcx-table-tag"><svg class="lcx-ico lcx-ico-xs" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#lcx-i-chart-no-axes-column"></use></svg>開放權重模型 · SWE-BENCH VERIFIED</div>
    <div class="lcx-table-title">同一個外殼，非常不同的穩健性。</div>
    <p class="lcx-table-sub">500 個實例中解決的百分比。最緊的設定是 16K/12K。Qwen 3 Coder Next 崩潰；Qwen 3.6 與 MiniMax 撐住。</p>
  </div>
  <div class="lcx-table-scroll">
    <table class="lcx-results">
      <thead><tr><th>模型</th><th class="num">基線</th><th class="num">48K/40K</th><th class="num">32K/24K</th><th class="num">16K/12K</th><th class="num">最緊設定的 Δ</th></tr></thead>
      <tbody>
        <tr><td>Qwen 3.6 27B</td><td class="num">68.6</td><td class="num">69.4</td><td class="num">68.2</td><td class="num">65.0</td><td class="num neg">−3.6</td></tr>
        <tr><td>Qwen 3 Coder Next</td><td class="num">53.0</td><td class="num">49.2</td><td class="num">40.4</td><td class="num neg strong">3.6</td><td class="num neg strong">−49.4</td></tr>
        <tr><td>Gemma 4 31B</td><td class="num">65.2</td><td class="num">65.0</td><td class="num">65.8</td><td class="num">58.0</td><td class="num neg">−7.2</td></tr>
        <tr><td>Step 3.7 Flash</td><td class="num">70.0</td><td class="num">66.8</td><td class="num">64.6</td><td class="num">56.6</td><td class="num neg">−13.4</td></tr>
        <tr><td>MiniMax M2.7</td><td class="num">72.6</td><td class="num">73.0</td><td class="num">73.2</td><td class="num">67.8</td><td class="num neg">−4.8</td></tr>
      </tbody>
    </table>
  </div>
  <div class="lcx-table-foot">資料來源：arXiv:2611.05306，表 9。表 10 的 Terminal-Bench 結果呈現類似的離散；Qwen 3.6 與 MiniMax 在最緊的設定仍保住基線分數。</div>
</div>

對任何想部署這套做法的人來說，Qwen 3 Coder Next 的崩潰是論文中最重要的單一數字。它在 16K/12K 從 **53.0 掉到 3.6**。論文的解釋很機械化：它的軌跡很囉唆，所以 12K 的門檻留下太少空間，讓壓縮之間無法產生有用的進展。模型把預算花在重建狀態，而不是解任務。

這是一般的教訓：**壓縮的穩健性是模型屬性，不只是外殼屬性。** 一個會寫出緊湊、資訊密集狀態的模型，能撐過激進的預算。一個會寫出冗長、重複軌跡的模型不行。如果你要為緊上下文預算的代理挑模型，測它的壓縮行為，不要只測它的基準測試分數。

### FRAMES 與漏掉一句話的代價

FRAMES 是壓縮穩定吃虧的長流程基準測試（Opus 1.3–3.7 個百分點，GPT 1.5–3.3）。任務需要跨多跳整合 2–15 篇維基百科文章的證據。一份漏掉橋接事實的壓縮，可能打斷整條鏈。損失不大，但它提醒我們：**不是所有 token 都同樣可壓縮。** 50 條 shell 命令的逐字稿可能壓成一行；五個相依事實的鏈，可能一壓就斷。

### 成本倍數是估計值

論文的成本模型是明確的，而且它是一個模型。它在 H100 上量測吞吐量，擬合出上下文成本比（`r = 0.20`），以標準輸出價錨定零售價（Opus 4.5 每百萬 $25，GPT 5.6 Sol 每百萬 $20），並保留供應商 5:1 的輸出對輸入、10:1 的輸入對快取比率。得到的「估計最佳化零售成本」是一個**反事實**：如果供應商把上下文長度的節省轉嫁出來，服務會是什麼價。那不是你今天能付的帳單。

這個但書是雙向的。GPT 在 NIAH 上的 233× 不是承諾，是模型的輸出。但*方向*——較短的上下文更便宜，而且常常是整數倍——有直接吞吐量量測支持，不只是成本模型。論文小心地把兩者分開，讀者也該如此。

### 「短」仍然是 16K–50K

這篇論文最常見的誤讀會是「上下文視窗不重要」。那不是它的主張。它主張的是**16K–50K 對受測任務已經足夠**，而 256K 以上常常不必要。16K 上下文仍然是一篇長篇短篇故事——大約 12,000 字。論文不是提倡失憶；它提倡的是工作集。

### 基準測試是樣本，不是整個空間

六個長流程加七個長輸入基準測試是寬廣的樣本，但仍然只是樣本。論文沒有測試每一種代理工作負載：沒有多模態任務、沒有即時控制、沒有輸入是一份 10M token 基因體的任務、沒有模型必須把一份精確的形式證明一直記在腦裡的任務。結論是「長上下文不是完成『長上下文』任務的必要條件」——一個小心界定範圍的主張。它不是「長上下文永遠沒用」。

<div class="lcx-pull">
  <div class="lcx-pull-mark">“</div>
  <p>論文最強的主張，也是最謙卑的：支持長上下文的標準論證並不充分，而不是長上下文永遠沒有價值。</p>
</div>

<div class="lcx-kicker"><svg class="lcx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#lcx-i-compass"></use></svg>我會怎麼用這篇論文</div>

## 給代理開發者的實務手冊

論文是研究結果，不是部署指南。以下是我會怎麼把它翻譯成工程決策。

### 1. 把上下文當快取，不是帳本

把完整逐字稿存在某個耐久的地方——物件儲存、資料庫、日誌檔。prompt 裡只放工作集。檔案庫是真相來源；上下文是有替換策略的快取。這一個架構決策，讓其他所有技巧成為可能。

### 2. 量每任務的 token，不只量準確率

論文最實用的指標不是準確率，而是**特定上下文預算下的準確率**。一個分數高 1 個百分點、卻燒掉 5× token 的系統，並沒有明顯更好。要監測：輸入 token、快取 token、輸出 token、峰值上下文、壓縮次數、任務成功率。把它們畫在一起。

### 3. 從 EoCC 開始，不是 SAC

EoCC 是風險較低的介入。它保留對話結構，只在門檻處壓縮。SAC 是更激進的賭注；它需要一個會寫好狀態的模型。如果你要部署到異質的模型陣容，EoCC 的可攜性更高。

### 4. 把壓縮 prompt 寫成一份交班筆記

不要要求「一份摘要」。要求五種成分：逐字任務、目前狀態、下一步、承重產物、完成定義。把 schema 放進系統提示。驗證輸出包含那些欄位。一份漏掉失敗測試名稱的壓縮，比不壓縮更糟。

### 5. 給代理一個搜尋自己歷史的工具

丟硬幣的反例是真的。如果代理之後可能需要某個精確細節，檔案庫必須可搜尋。對逐字稿檔案 `grep` 很粗糙，但有效。一份有時間戳與工具名稱的結構化事件日誌更好。

### 6. 在自己的工作負載上測試最緊的預算

論文的門檻是起點，不是宇宙常數。最佳設定因基準測試而異：SWE-bench Verified 是 24K/18K，Terminal-Bench 是 32K/24K，FRAMES 是 48K/36K。在具代表性的樣本上掃預算，挑膝點，不是挑最小值。

### 7. 注意軌跡囉唆的模型

Qwen 3 Coder Next 的崩潰是警訊。一個會發出長思考軌跡與重複命令的模型，會更早撞到壓縮門檻，並把更多預算花在重建狀態。如果你非得用這種模型，提高門檻或縮短軌跡。

<div class="lcx-checklist">
  <div class="lcx-check"><div class="lcx-check-ico"><svg class="lcx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#lcx-i-check"></use></svg></div><div><b>上線前：</b> 代理能不能找回被壓縮掉的事實？如果不行，檔案庫的搜尋還不夠好。</div></div>
  <div class="lcx-check"><div class="lcx-check-ico"><svg class="lcx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#lcx-i-check"></use></svg></div><div><b>上線前：</b> 壓縮裡有沒有任務的驗收標準，還是只有發生什麼事的敘事？</div></div>
  <div class="lcx-check"><div class="lcx-check-ico"><svg class="lcx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#lcx-i-check"></use></svg></div><div><b>上線前：</b> 你有沒有量峰值上下文與 token 支出，而不只是最終分數？</div></div>
  <div class="lcx-check"><div class="lcx-check-ico"><svg class="lcx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#lcx-i-check"></use></svg></div><div><b>上線前：</b> 你選的模型在你打算跑的最緊預算下還能工作嗎？去測，不要假設。</div></div>
</div>

<div class="lcx-kicker"><svg class="lcx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#lcx-i-message-circle"></use></svg>問題</div>

## 我預期會收到的問題

**論文是說長上下文沒用嗎？** 不是。它是說長上下文對它測試的任務不是*必要*的，而支持長上下文的標準論證比表面上看起來弱。當然有任務是大工作集有幫助的；論文沒有宣稱已經找齊。

**壓縮會遺失資訊嗎？** 會，這是構造上的必然。論文的答案是保留完整逐字稿並讓它可搜尋。壓縮是快取替換策略，不是刪除策略。

**為什麼不直接用 RAG？** 選擇性閱讀*就是*一種檢索，只是它靠代理與工具，而不是 embedding。代理自己選要搜什麼、讀結果、再迭代。論文的論點是這個迴圈常常就夠了；你不需要為每個任務另外建一個向量索引。

**EoCC 不就是摘要嗎？** 不是。論文發現摘要效果不理想。EoCC 是結構化簡報：任務、狀態、下一步、產物、完成定義。差別在目標函數——決策相關性，不是覆蓋率。

**為什麼 GPT 5.6 Sol 在 SAC 下掉得比較多？** 論文沒有給定論。一個合理的解釋是它的策略更依賴上下文中近期的範例；移除逐字稿就移除了那些範例。這正是後訓練調整可以修正的模型專屬行為。

**16K 對真實的程式碼庫 夠嗎？** 對受測任務來說，常常夠——有搜尋工具與好的壓縮。16K 視窗裝不下大型儲存庫，但它不需要。代理選擇性讀檔。失敗模式不是「儲存庫太大」，而是「代理找不到正確的檔案」。

**多模態或潛在狀態呢？** 論文只處理文字。SSSM 的想法是通用的，但實驗不是。多模態代理可能需要不同的狀態表徵；那是開放問題。

**這篇有同儕審查嗎？** 它是 arXiv 預印本（v1，2026 年 11 月 3 日提交）。把這些數字當作強力證據，不是定論。程式碼與外殼細節都在論文裡；原則上結果可重現。

<div class="lcx-kicker"><svg class="lcx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#lcx-i-signpost"></use></svg>底線</div>

## 貴的是那個習慣

論文的標題是挑釁，但它真正的主張比標題更有用。它不是說上下文視窗很糟。它是說**我們一直把一個服務參數當成一種能力**，而這個混淆的代價，付在延遲、記憶體與美元上。

三個結果合起來，形成一個連貫的工程哲學：

- **保留檔案庫。** 完整歷史儲存起來很便宜，帶著走很貴。
- **帶著簡報。** 好的壓縮是交班筆記，不是摘要。
- **選擇性閱讀。** 長輸入是一個檔案系統，不是一個 prompt。
- **量預算。** 最佳上下文上限是超參數，不是預設值。

最深遠的意涵與模型設計有關。如果一個模型能跨動作維持自然語言狀態，上下文視窗就不再是架構的中心。如果假設成立，狀態會成為中心。這就是 SSSM 想法指向的地方，也是論文結尾那個問題——*為什麼還要訓練全歷史模型？*——不只是修辭的原因。

我不認為長上下文會消失。總會有任務就是需要大工作集。但預設值應該改變。下次你把一份 200K token 的文件貼進 prompt 時，問論文那個問題：**這是需要待在上下文裡的資訊，還是需要可取得的資訊？** 答案常常是後者，而帳單會小一點。

<div class="lcx-endnote">
  <div class="lcx-endnote-head"><svg class="lcx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#lcx-i-book-open"></use></svg>來源與方法說明</div>
  <p><b>論文：</b> Peter Belcak、Saurav Muralidharan、Jindong Jiang、Yonggan Fu、Wonmin Byeon、Hanrong Ye、Ryan Angilly、Ali Taghibakhshi、Shih-Yang Liu、Siru Ouyang、Greg Heinrich、Pavlo Molchanov。〈You don’t need long context〉。arXiv:2611.05306v1，2026 年 11 月 3 日提交。<a href="https://arxiv.org/abs/2611.05306">arxiv.org/abs/2611.05306</a> · <a href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a>。</p>
  <p><b>方法：</b> 本文是細讀，不是獨立重現。所有準確率數字都是基準測試自身尺度上的百分點。成本倍數是論文估計的最佳化零售成本，不是實際帳單。論文圖表依 CC BY 4.0 轉載；重繪圖表為本刊原創，使用論文發表的數字。</p>
  <p><b>勘誤：</b> 如果你在轉錄中發現錯誤，每張圖說都連結到來源表。論文的附錄 C–F 有完整的逐項基準測試表。</p>
</div>

<style>
/* ── Long-context article · mono editorial system ───────────── */
.lcx-sprite { position: absolute; width: 0; height: 0; overflow: hidden; }
.lcx-ico { width: 14px; height: 14px; display: block; flex: none; }
.lcx-ico-xs { width: 12px; height: 12px; color: var(--mono-muted); }

.lcx-paper-cta { margin: 0 0 22px; }
.lcx-paper-btn { vertical-align: middle; }

.lcx-kicker { display: flex; align-items: center; gap: 7px; margin: 38px 0 2px; font-family: var(--mono-font-mono); font-size: 7px; font-weight: 600; letter-spacing: 0.16em; color: var(--mono-muted); text-transform: uppercase; }
.lcx-kicker .lcx-ico { width: 11px; height: 11px; color: var(--mono-muted); }
.lcx-kicker::after { content: ""; flex: 1; height: 0.7px; background: var(--mono-grid); margin-left: 4px; }
article.prose-inner .lcx-kicker + h2 { margin-top: 4px; }

.lcx-stat-grid { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 10px; margin: 20px 0 8px; }
.lcx-stat { border: 0.7px solid var(--mono-grid); padding: 12px 12px 10px; display: flex; flex-direction: column; gap: 6px; min-width: 0; }
.lcx-stat-top { display: flex; align-items: center; gap: 6px; font-family: var(--mono-font-mono); font-size: 6.8px; font-weight: 700; letter-spacing: 0.08em; color: var(--mono-muted); }
.lcx-stat-top .lcx-ico { width: 11px; height: 11px; color: var(--mono-ink); }
.lcx-stat-num { font-family: var(--mono-font); font-size: 19px; font-weight: 800; letter-spacing: -0.03em; line-height: 1.1; color: var(--mono-ink); }
.lcx-stat p { margin: 0; font-family: var(--mono-font); font-size: 9.5px; line-height: 1.5; color: var(--mono-l2); }
.lcx-fine { margin: 0 0 18px; font-family: var(--mono-font-mono); font-size: 7px; line-height: 1.6; letter-spacing: 0.04em; color: var(--mono-muted); }

.lcx-glossary { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px 20px; margin: 18px 0 10px; }
.lcx-gloss { display: flex; align-items: flex-start; gap: 9px; border-top: 0.7px solid var(--mono-grid); padding-top: 10px; }
.lcx-gloss-ico { width: 26px; height: 26px; display: grid; place-items: center; border: 0.7px solid var(--mono-grid); color: var(--mono-ink); flex: none; }
.lcx-gloss-ico .lcx-ico { width: 12px; height: 12px; }
.lcx-gloss-term { font-family: var(--mono-font-mono); font-size: 8.5px; font-weight: 700; letter-spacing: 0.06em; color: var(--mono-ink); text-transform: uppercase; }
.lcx-gloss-copy { font-family: var(--mono-font); font-size: 10.5px; line-height: 1.55; color: var(--mono-l2); margin: 3px 0 0; }

.lcx-callout { display: flex; align-items: flex-start; gap: 10px; border: 0.7px solid var(--mono-grid); border-left: 2px solid var(--mono-ink); padding: 12px 14px; margin: 18px 0 6px; }
.lcx-callout .lcx-ico { color: var(--mono-ink); margin-top: 2px; }
.lcx-callout > div { font-family: var(--mono-font); font-size: 10.5px; line-height: 1.6; color: var(--mono-l2); }
.lcx-callout b { color: var(--mono-ink); }
.lcx-callout-warn { border-left-color: var(--mono-ink); background: var(--mono-paper); }

.lcx-table-card { border: 0.7px solid var(--mono-grid); margin: 22px 0 16px; }
.lcx-table-head { padding: 12px 14px 10px; border-bottom: 0.7px solid var(--mono-grid); }
.lcx-table-tag { display: inline-flex; align-items: center; gap: 5px; font-family: var(--mono-font-mono); font-size: 6.8px; font-weight: 700; letter-spacing: 0.1em; color: var(--mono-muted); text-transform: uppercase; }
.lcx-table-title { font-family: var(--mono-font); font-size: 14px; font-weight: 700; letter-spacing: -0.015em; color: var(--mono-ink); margin-top: 5px; }
.lcx-table-sub { font-family: var(--mono-font); font-size: 10px; line-height: 1.55; color: var(--mono-muted); margin: 4px 0 0; }
.lcx-table-scroll { width: 100%; overflow-x: auto; }
.lcx-table-card table { margin: 0 !important; border: 0 !important; font-size: 11.5px; }
.lcx-table-card th { font-family: var(--mono-font-mono); font-size: 7px; letter-spacing: 0.06em; text-transform: uppercase; padding: 8px 10px; background: var(--mono-paper); }
.lcx-table-card td { padding: 7px 10px; font-family: var(--mono-font); font-size: 10.5px; }
.lcx-table-card td.num, .lcx-table-card th.num { text-align: right; font-variant-numeric: tabular-nums; white-space: nowrap; }
.lcx-table-card td.strong { font-weight: 700; color: var(--mono-ink); }
.lcx-table-card td.pos { color: var(--mono-ink); }
.lcx-table-card td.neg { color: var(--mono-muted); }
.lcx-table-card td.neg.strong { color: var(--mono-ink); font-weight: 800; }
.lcx-table-foot { border-top: 0.7px solid var(--mono-grid); padding: 7px 14px; font-family: var(--mono-font-mono); font-size: 6.8px; line-height: 1.55; letter-spacing: 0.04em; color: var(--mono-muted); }
.lcx-cell-note { font-family: var(--mono-font-mono); font-size: 7px; font-weight: 500; color: var(--mono-muted); }
.lcx-table-card table.lcx-books td:first-child { min-width: 160px; }
.lcx-table-card table.lcx-results td:first-child { min-width: 150px; }

.lcx-pull { border-top: 1.2px solid var(--mono-ink); border-bottom: 0.7px solid var(--mono-grid); padding: 18px 0 16px; margin: 26px 0; position: relative; }
.lcx-pull-mark { font-family: var(--mono-font); font-size: 44px; line-height: 0.6; color: var(--mono-l5); }
.lcx-pull p { margin: 0 !important; font-family: var(--mono-font); font-size: 17px; font-weight: 700; line-height: 1.45; letter-spacing: -0.015em; color: var(--mono-ink); max-width: 92%; }

.lcx-duo { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px; margin: 20px 0 18px; }
.lcx-duo-col { border: 0.7px solid var(--mono-grid); padding: 14px 15px; }
.lcx-duo-head { display: flex; align-items: center; gap: 7px; font-family: var(--mono-font-mono); font-size: 7px; font-weight: 700; letter-spacing: 0.1em; color: var(--mono-muted); }
.lcx-duo-head .lcx-ico { width: 12px; height: 12px; color: var(--mono-ink); }
.lcx-duo-big { font-family: var(--mono-font); font-size: 14px; font-weight: 700; line-height: 1.35; color: var(--mono-ink); margin: 8px 0 6px; }
.lcx-duo-col p { margin: 0; font-family: var(--mono-font); font-size: 10.5px; line-height: 1.6; color: var(--mono-l2); }
.lcx-duo-meta { margin-top: 10px; padding-top: 8px; border-top: 0.7px solid var(--mono-grid); font-family: var(--mono-font-mono); font-size: 7px; letter-spacing: 0.06em; color: var(--mono-muted); }

.lcx-bench-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; margin: 22px 0 18px; }
.lcx-bench { border: 0.7px solid var(--mono-grid); padding: 12px 13px; display: flex; flex-direction: column; gap: 8px; }
.lcx-bench-top { display: flex; align-items: center; gap: 9px; }
.lcx-bench-ico { width: 30px; height: 30px; display: grid; place-items: center; border: 0.7px solid var(--mono-grid); color: var(--mono-ink); flex: none; }
.lcx-bench-ico .lcx-ico { width: 14px; height: 14px; }
.lcx-bench-name { font-family: var(--mono-font); font-size: 12px; font-weight: 700; color: var(--mono-ink); line-height: 1.2; }
.lcx-bench-sub { font-family: var(--mono-font-mono); font-size: 7px; font-weight: 600; letter-spacing: 0.06em; color: var(--mono-muted); margin-top: 2px; text-transform: uppercase; }
.lcx-bench-desc { margin: 0; font-family: var(--mono-font); font-size: 10px; line-height: 1.55; color: var(--mono-l2); }
.lcx-bench-stress { border-top: 0.7px solid var(--mono-grid); padding-top: 7px; font-family: var(--mono-font); font-size: 9px; line-height: 1.5; color: var(--mono-l2); }
.lcx-bench-stress b { font-family: var(--mono-font-mono); font-size: 6.8px; letter-spacing: 0.08em; color: var(--mono-ink); margin-right: 4px; }

.lcx-regime-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; margin: 20px 0 16px; }
.lcx-regime { border: 0.7px solid var(--mono-grid); padding: 13px 13px 11px; display: flex; flex-direction: column; gap: 8px; }
.lcx-regime-top { display: flex; flex-direction: column; gap: 3px; }
.lcx-regime-code { font-family: var(--mono-font-mono); font-size: 8px; font-weight: 700; letter-spacing: 0.1em; color: var(--mono-muted); }
.lcx-regime-name { font-family: var(--mono-font); font-size: 12.5px; font-weight: 700; line-height: 1.3; color: var(--mono-ink); }
.lcx-regime p { margin: 0; font-family: var(--mono-font); font-size: 10px; line-height: 1.55; color: var(--mono-l2); }
.lcx-regime-tag { margin-top: auto; display: flex; align-items: center; gap: 5px; border-top: 0.7px solid var(--mono-grid); padding-top: 7px; font-family: var(--mono-font-mono); font-size: 6.8px; font-weight: 600; letter-spacing: 0.06em; color: var(--mono-muted); }

.lcx-compare { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px; margin: 20px 0 14px; }
.lcx-compare-col { border: 0.7px solid var(--mono-grid); padding: 14px; }
.lcx-compare-head { display: flex; align-items: center; gap: 7px; font-family: var(--mono-font-mono); font-size: 7px; font-weight: 700; letter-spacing: 0.08em; color: var(--mono-ink); }
.lcx-compare-head .lcx-ico { width: 13px; height: 13px; }
.lcx-compare-col p { margin: 8px 0; font-family: var(--mono-font); font-size: 10.5px; line-height: 1.6; color: var(--mono-l2); }
.lcx-compare-foot { border-top: 0.7px solid var(--mono-grid); padding-top: 7px; font-family: var(--mono-font-mono); font-size: 6.8px; letter-spacing: 0.07em; color: var(--mono-muted); }

.lcx-recipe { display: grid; gap: 0; border: 0.7px solid var(--mono-grid); margin: 20px 0 14px; }
.lcx-recipe-item { display: grid; grid-template-columns: 42px minmax(0, 1fr); gap: 12px; padding: 12px 14px; border-top: 0.7px solid var(--mono-grid); }
.lcx-recipe-item:first-child { border-top: 0; }
.lcx-recipe-num { font-family: var(--mono-font-mono); font-size: 14px; font-weight: 700; color: var(--mono-l5); line-height: 1; padding-top: 2px; }
.lcx-recipe-title { font-family: var(--mono-font); font-size: 12px; font-weight: 700; color: var(--mono-ink); }
.lcx-recipe-body p { margin: 4px 0 0; font-family: var(--mono-font); font-size: 10.5px; line-height: 1.6; color: var(--mono-l2); }

.lcx-checklist { display: grid; gap: 10px; margin: 18px 0 8px; }
.lcx-check { display: flex; align-items: flex-start; gap: 9px; }
.lcx-check-ico { width: 22px; height: 22px; display: grid; place-items: center; border: 0.7px solid var(--mono-grid); color: var(--mono-ink); flex: none; }
.lcx-check-ico .lcx-ico { width: 11px; height: 11px; }
.lcx-check > div:last-child { font-family: var(--mono-font); font-size: 11px; line-height: 1.6; color: var(--mono-l2); }
.lcx-check b { color: var(--mono-ink); }

.lcx-endnote { border: 0.7px solid var(--mono-grid); padding: 14px 15px; margin: 26px 0 10px; }
.lcx-endnote-head { display: flex; align-items: center; gap: 6px; font-family: var(--mono-font-mono); font-size: 7px; font-weight: 700; letter-spacing: 0.1em; color: var(--mono-muted); text-transform: uppercase; }
.lcx-endnote-head .lcx-ico { width: 11px; height: 11px; }
.lcx-endnote p { margin: 8px 0 0 !important; font-family: var(--mono-font); font-size: 10px; line-height: 1.6; color: var(--mono-l2); }
.lcx-endnote a { text-decoration: underline; text-underline-offset: 2px; }

@media (max-width: 980px) {
  .lcx-stat-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .lcx-stat:last-child { grid-column: 1 / -1; }
  .lcx-regime-grid { grid-template-columns: 1fr; }
  .lcx-bench-grid { grid-template-columns: 1fr; }
}
@media (max-width: 700px) {
  .lcx-stat-grid { grid-template-columns: 1fr; }
  .lcx-stat:last-child { grid-column: auto; }
  .lcx-glossary { grid-template-columns: 1fr; }
  .lcx-duo { grid-template-columns: 1fr; }
  .lcx-compare { grid-template-columns: 1fr; }
  .lcx-pull p { max-width: 100%; font-size: 15px; }
  .lcx-recipe-item { grid-template-columns: 32px minmax(0, 1fr); gap: 9px; }
  .lcx-table-card table { font-size: 10.5px; }
}
.lcx-chart { display:block; width:100%; max-width:700px; height:auto; margin:4px auto 0; overflow:visible; }
.lcx-ch-axis { font-family:var(--mono-font-mono); font-size:6.6px; font-weight:600; letter-spacing:.04em; fill:var(--mono-muted); }
.lcx-ch-axis-line { stroke:var(--mono-grid); stroke-width:.8; }
.lcx-ch-grid { stroke:var(--mono-grid); stroke-width:.6; stroke-dasharray:2 3; }
.lcx-ch-zero { stroke:var(--mono-l3); stroke-width:1; }
.lcx-ch-band { fill:var(--mono-bg-subtle); opacity:.55; }
.lcx-ch-band-label { font-family:var(--mono-font-mono); font-size:5.8px; font-weight:600; letter-spacing:.08em; fill:var(--mono-muted); }
.lcx-ch-line { fill:none; stroke:var(--mono-ink); stroke-width:1.4; }
.lcx-ch-line2 { fill:none; stroke:var(--mono-l2); stroke-width:1.3; }
.lcx-ch-line3 { fill:none; stroke:var(--mono-l4); stroke-width:1.1; stroke-dasharray:3 2.5; }
.lcx-ch-dot { fill:var(--mono-ink); }
.lcx-ch-dot2 { fill:var(--mono-l2); }
.lcx-ch-dot3 { fill:var(--mono-l4); }
.lcx-ch-note { font-family:var(--mono-font); font-size:6.4px; font-weight:500; fill:var(--mono-l2); }
.lcx-ch-note2 { font-family:var(--mono-font-mono); font-size:5.6px; font-weight:500; letter-spacing:.03em; fill:var(--mono-muted); }
.lcx-ch-value { font-family:var(--mono-font); font-size:6.8px; font-weight:800; fill:var(--mono-ink); paint-order:stroke; stroke:var(--mono-paper); stroke-width:1.2px; stroke-linejoin:round; }
.lcx-ch-value2 { font-family:var(--mono-font); font-size:6.4px; font-weight:700; fill:var(--mono-l2); paint-order:stroke; stroke:var(--mono-paper); stroke-width:1.1px; stroke-linejoin:round; }
.lcx-ch-label { font-family:var(--mono-font); font-size:7.2px; font-weight:600; fill:var(--mono-ink); }
.lcx-ch-range { stroke:var(--mono-l4); stroke-width:1.4; }
.lcx-ch-range2 { stroke:var(--mono-l5); stroke-width:1.4; }
.lcx-ch-range-strong { stroke:var(--mono-ink); stroke-width:2; }
.lcx-ch-cap { stroke:var(--mono-l4); stroke-width:.8; }
.lcx-ch-cap2 { stroke:var(--mono-l5); stroke-width:.8; }
.lcx-ch-cap-strong { stroke:var(--mono-ink); stroke-width:.9; }
.lcx-ch-bar { fill:var(--mono-ink); }
.lcx-ch-bar2 { fill:var(--mono-l4); }
.lcx-card { margin:28px 0; }
.lcx-card .lcx-card-title { font-family:var(--mono-font); font-size:15px; font-weight:700; letter-spacing:-.02em; line-height:1.35; color:var(--mono-ink); margin:4px 0 3px; }
.lcx-card .lcx-card-sub { font-family:var(--mono-font); font-size:11px; line-height:1.55; color:var(--mono-muted); margin:0 0 10px; }
.lcx-tag { display:inline-flex; align-items:center; gap:6px; }
.lcx-src { font-family:var(--mono-font-mono); font-size:7.5px; font-weight:600; letter-spacing:.08em; text-transform:uppercase; color:var(--mono-faint); margin-top:8px; }
.lcx-ch-bar-mid { fill:var(--mono-l2); }
.lcx-ch-bar-soft { fill:var(--mono-l4); }
.lcx-ch-bar-pale { fill:var(--mono-l6); }
.lcx-card, .lcx-card .chamfer-card-content { width:100%; }

@media (max-width: 700px) {
  .lcx-ch-axis { font-size: 8px; }
  .lcx-ch-note { font-size: 7.6px; }
  .lcx-ch-note2 { font-size: 6.8px; }
  .lcx-ch-value { font-size: 8.2px; }
  .lcx-ch-value2 { font-size: 7.8px; }
  .lcx-ch-label { font-size: 8.4px; }
  .lcx-ch-band-label { display: none; }
}
</style>
