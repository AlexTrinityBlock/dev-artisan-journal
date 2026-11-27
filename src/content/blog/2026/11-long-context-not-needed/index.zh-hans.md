---
title: "你不需要长上下文：一个习惯的七倍代价"
description: "细读 arXiv:2611.05306：压缩（compaction）与选择性阅读，让前沿模型追上长上下文基线，同时把估计服务成本压低最多 233×。代价不在准确率，而在于你得知道该留下什么。"
pubDate: 2026-11-14
category: "AI"
tags: ["长上下文", "代理", "压缩", "LLM", "论文笔记"]
featured: false
author: "Alex.Hsiao"
readTime: "30 分钟"
cardImage: "./cover.webp"
cardImageAlt: "图表显示三个模型生成一百万输出 token 的成本随上下文长度急剧上升"
---

# 你不需要长上下文：一个习惯的七倍代价

<svg class="lcx-sprite" aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg"><defs><symbol id="lcx-i-activity" viewBox="0 0 24 24"><path d="M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2"/></symbol><symbol id="lcx-i-archive" viewBox="0 0 24 24"><rect width="20" height="5" x="2" y="3" rx="1"/><path d="M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8m-10 4h4"/></symbol><symbol id="lcx-i-arrow-up-down" viewBox="0 0 24 24"><path d="m21 16l-4 4l-4-4m4 4V4M3 8l4-4l4 4M7 4v16"/></symbol><symbol id="lcx-i-book-open" viewBox="0 0 24 24"><path d="M12 7v14M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z"/></symbol><symbol id="lcx-i-brain" viewBox="0 0 24 24"><path d="M12 18V5m3 8a4.17 4.17 0 0 1-3-4a4.17 4.17 0 0 1-3 4m8.707-6.706A3 3 0 1 0 12 5a3 3 0 1 0-5.707 1.294"/><path d="M17.996 5.125a4 4 0 0 1 2.526 5.77"/><path d="M18 18a4 4 0 0 0 2-7.465"/><path d="M19.967 17.482a4 4 0 1 1-7.967.517a4 4 0 1 1-7.967-.517"/><path d="M6 18a4 4 0 0 1-2-7.465"/><path d="M6.004 5.125a4 4 0 0 0-2.526 5.77"/></symbol><symbol id="lcx-i-chart-no-axes-column" viewBox="0 0 24 24"><path d="M5 21v-6m7 6V3m7 18V9"/></symbol><symbol id="lcx-i-clipboard-list" viewBox="0 0 24 24"><rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2m4 7h4m-4 5h4m-8-5h.01M8 16h.01"/></symbol><symbol id="lcx-i-coins" viewBox="0 0 24 24"><path d="M13.744 17.736a6 6 0 1 1-7.48-7.48M15 6h1v4"/><path d="m6.134 14.768l.866-.5l2 3.464"/><circle cx="16" cy="8" r="6"/></symbol><symbol id="lcx-i-database" viewBox="0 0 24 24"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v14a9 3 0 0 0 18 0V5"/><path d="M3 12a9 3 0 0 0 18 0"/></symbol><symbol id="lcx-i-file-text" viewBox="0 0 24 24"><path d="M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z"/><path d="M14 2v5a1 1 0 0 0 1 1h5M10 9H8m8 4H8m8 4H8"/></symbol><symbol id="lcx-i-flask-conical" viewBox="0 0 24 24"><path d="M14 2v6a2 2 0 0 0 .245.96l5.51 10.08A2 2 0 0 1 18 22H6a2 2 0 0 1-1.755-2.96l5.51-10.08A2 2 0 0 0 10 8V2M6.453 15h11.094M8.5 2h7"/></symbol><symbol id="lcx-i-gauge" viewBox="0 0 24 24"><path d="m12 14l4-4M3.34 19a10 10 0 1 1 17.32 0"/></symbol><symbol id="lcx-i-git-branch" viewBox="0 0 24 24"><path d="M15 6a9 9 0 0 0-9 9V3"/><circle cx="18" cy="6" r="3"/><circle cx="6" cy="18" r="3"/></symbol><symbol id="lcx-i-history" viewBox="0 0 24 24"><path d="M3 12a9 9 0 1 0 9-9a9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5m4-1v5l4 2"/></symbol><symbol id="lcx-i-layers" viewBox="0 0 24 24"><path d="M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83z"/><path d="M2 12a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 12"/><path d="M2 17a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 17"/></symbol><symbol id="lcx-i-list-filter" viewBox="0 0 24 24"><path d="M2 5h20M6 12h12m-9 7h6"/></symbol><symbol id="lcx-i-memory-stick" viewBox="0 0 24 24"><path d="M12 12v-2m0 8v-2m4-4v-2m0 8v-2M2 11h1.5M20 18v-2m.5-5H22M4 18v-2m4-4v-2m0 8v-2"/><rect width="20" height="10" x="2" y="6" rx="2"/></symbol><symbol id="lcx-i-messages-square" viewBox="0 0 24 24"><path d="M16 10a2 2 0 0 1-2 2H6.828a2 2 0 0 0-1.414.586l-2.202 2.202A.71.71 0 0 1 2 14.286V4a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2zm4-1a2 2 0 0 1 2 2v10.286a.71.71 0 0 1-1.212.502l-2.202-2.202A2 2 0 0 0 17.172 19H10a2 2 0 0 1-2-2v-1"/></symbol><symbol id="lcx-i-network" viewBox="0 0 24 24"><rect width="6" height="6" x="16" y="16" rx="1"/><rect width="6" height="6" x="2" y="16" rx="1"/><rect width="6" height="6" x="9" y="2" rx="1"/><path d="M5 16v-3a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v3m-7-4V8"/></symbol><symbol id="lcx-i-radar" viewBox="0 0 24 24"><path d="M19.07 4.93A10 10 0 0 0 6.99 3.34M4 6h.01M2.29 9.62a10 10 0 1 0 19.02-1.27"/><path d="M16.24 7.76a6 6 0 1 0-8.01 8.91M12 18h.01m5.98-6.34a6 6 0 0 1-2.22 5.01"/><circle cx="12" cy="12" r="2"/><path d="m13.41 10.59l5.66-5.66"/></symbol><symbol id="lcx-i-repeat" viewBox="0 0 24 24"><path d="m17 2l4 4l-4 4"/><path d="M3 11v-1a4 4 0 0 1 4-4h14M7 22l-4-4l4-4"/><path d="M21 13v1a4 4 0 0 1-4 4H3"/></symbol><symbol id="lcx-i-route" viewBox="0 0 24 24"><circle cx="6" cy="19" r="3"/><path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15"/><circle cx="18" cy="5" r="3"/></symbol><symbol id="lcx-i-scan-search" viewBox="0 0 24 24"><path d="M3 7V5a2 2 0 0 1 2-2h2m10 0h2a2 2 0 0 1 2 2v2m0 10v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2"/><circle cx="12" cy="12" r="3"/><path d="m16 16l-1.9-1.9"/></symbol><symbol id="lcx-i-scissors" viewBox="0 0 24 24"><circle cx="6" cy="6" r="3"/><path d="M8.12 8.12L12 12m8-8L8.12 15.88"/><circle cx="6" cy="18" r="3"/><path d="M14.8 14.8L20 20"/></symbol><symbol id="lcx-i-shield-check" viewBox="0 0 24 24"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12l2 2l4-4"/></symbol><symbol id="lcx-i-target" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></symbol><symbol id="lcx-i-timer" viewBox="0 0 24 24"><path d="M10 2h4m-2 12l3-3"/><circle cx="12" cy="14" r="8"/></symbol><symbol id="lcx-i-triangle-alert" viewBox="0 0 24 24"><path d="m21.73 18l-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3M12 9v4m0 4h.01"/></symbol><symbol id="lcx-i-users" viewBox="0 0 24 24"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M16 3.128a4 4 0 0 1 0 7.744M22 21v-2a4 4 0 0 0-3-3.87"/><circle cx="9" cy="7" r="4"/></symbol><symbol id="lcx-i-workflow" viewBox="0 0 24 24"><rect width="8" height="8" x="3" y="3" rx="2"/><path d="M7 11v4a2 2 0 0 0 2 2h4"/><rect width="8" height="8" x="13" y="13" rx="2"/></symbol><symbol id="lcx-i-clock" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></symbol><symbol id="lcx-i-search" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></symbol><symbol id="lcx-i-terminal" viewBox="0 0 24 24"><polyline points="4 17 10 11 4 5"/><line x1="12" x2="20" y1="19" y2="19"/></symbol><symbol id="lcx-i-check" viewBox="0 0 24 24"><path d="M20 6 9 17l-5-5"/></symbol><symbol id="lcx-i-x" viewBox="0 0 24 24"><path d="M18 6 6 18M6 6l12 12"/></symbol><symbol id="lcx-i-arrow-right" viewBox="0 0 24 24"><path d="M5 12h14m-6-6 6 6-6 6"/></symbol><symbol id="lcx-i-folder-open" viewBox="0 0 24 24"><path d="m6 14 1.5-2.9A2 2 0 0 1 9.24 10H20a2 2 0 0 1 1.94 2.5l-1.54 6a2 2 0 0 1-1.95 1.5H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.69.9l.81 1.2a2 2 0 0 0 1.67.9H18a2 2 0 0 1 2 2v2"/></symbol><symbol id="lcx-i-receipt" viewBox="0 0 24 24"><path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z"/><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"/><path d="M12 17.5v-11"/></symbol><symbol id="lcx-i-banknote" viewBox="0 0 24 24"><rect width="20" height="12" x="2" y="6" rx="2"/><circle cx="12" cy="12" r="2"/><path d="M6 12h.01M18 12h.01"/></symbol><symbol id="lcx-i-scale" viewBox="0 0 24 24"><path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="M7 21h10"/><path d="M12 3v18"/><path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2"/></symbol><symbol id="lcx-i-trending-down" viewBox="0 0 24 24"><polyline points="22 17 13.5 8.5 8.5 13.5 2 7"/><polyline points="16 17 22 17 22 11"/></symbol><symbol id="lcx-i-zap" viewBox="0 0 24 24"><path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"/></symbol><symbol id="lcx-i-cpu" viewBox="0 0 24 24"><rect width="16" height="16" x="4" y="4" rx="2"/><rect width="6" height="6" x="9" y="9" rx="1"/><path d="M15 2v2M15 20v2M2 15h2M2 9h2M20 15h2M20 9h2M9 2v2M9 20v2"/></symbol><symbol id="lcx-i-hard-drive" viewBox="0 0 24 24"><line x1="22" x2="2" y1="12" y2="12"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/><line x1="6" x2="6.01" y1="16" y2="16"/><line x1="10" x2="10.01" y1="16" y2="16"/></symbol><symbol id="lcx-i-eye" viewBox="0 0 24 24"><path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"/><circle cx="12" cy="12" r="3"/></symbol><symbol id="lcx-i-boxes" viewBox="0 0 24 24"><path d="M2.97 12.92A2 2 0 0 0 2 14.63v3.24a2 2 0 0 0 .97 1.71l3 1.8a2 2 0 0 0 2.06 0L12 19v-5.5l-5-3-4.03 2.42Z"/><path d="m7 16.5-4.74-2.85M7 16.5l5-3M7 16.5v5.17M12 13.5V19l3.97 2.38a2 2 0 0 0 2.06 0l3-1.8a2 2 0 0 0 .97-1.71v-3.24a2 2 0 0 0-.97-1.71L17 10.5l-5 3Z"/><path d="m17 16.5-5-3M17 16.5l4.74-2.85M17 16.5v5.17"/></symbol><symbol id="lcx-i-compass" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88"/></symbol><symbol id="lcx-i-map" viewBox="0 0 24 24"><path d="M14.106 5.553a2 2 0 0 0 1.788 0l3.659-1.83A1 1 0 0 1 21 4.619v12.764a1 1 0 0 1-.553.894l-4.553 2.277a2 2 0 0 1-1.788 0l-4.212-2.106a2 2 0 0 0-1.788 0l-3.659 1.83A1 1 0 0 1 3 19.381V6.618a1 1 0 0 1 .553-.894l4.553-2.277a2 2 0 0 1 1.788 0z"/><path d="M15 5.764v15M9 3.236v15"/></symbol><symbol id="lcx-i-key-round" viewBox="0 0 24 24"><path d="M2.586 17.414A2 2 0 0 0 2 18.828V21a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h1a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h.172a2 2 0 0 0 1.414-.586l.814-.814a6.5 6.5 0 1 0-4-4z"/><circle cx="16.5" cy="7.5" r=".5" fill="currentColor"/></symbol><symbol id="lcx-i-lock" viewBox="0 0 24 24"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></symbol><symbol id="lcx-i-signpost" viewBox="0 0 24 24"><path d="M12 13v8M12 3v3"/><path d="M18 6a2 2 0 0 1 1.387.56l2.307 2.22a1 1 0 0 1 0 1.44l-2.307 2.22A2 2 0 0 1 18 13H6a2 2 0 0 1-1.387-.56l-2.306-2.22a1 1 0 0 1 0-1.44l2.306-2.22A2 2 0 0 1 6 6z"/></symbol><symbol id="lcx-i-hourglass" viewBox="0 0 24 24"><path d="M5 22h14M5 2h14"/><path d="M17 22v-4.172a2 2 0 0 0-.586-1.414L12 12l-4.414 4.414A2 2 0 0 0 7 17.828V22"/><path d="M7 2v4.172a2 2 0 0 0 .586 1.414L12 12l4.414-4.414A2 2 0 0 0 17 6.172V2"/></symbol><symbol id="lcx-i-circle-dot" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="1"/></symbol><symbol id="lcx-i-notebook-pen" viewBox="0 0 24 24"><path d="M13.4 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7.4"/><path d="M2 6h4M2 10h4M2 14h4M2 18h4"/><path d="M21.378 5.626a1 1 0 1 0-3.004-3.004l-5.01 5.012a2 2 0 0 0-.506.854l-.837 2.87a.5.5 0 0 0 .62.62l2.87-.837a2 2 0 0 0 .854-.506z"/></symbol><symbol id="lcx-i-panel-top" viewBox="0 0 24 24"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18"/></symbol><symbol id="lcx-i-bot" viewBox="0 0 24 24"><path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2M20 14h2M15 13v2M9 13v2"/></symbol><symbol id="lcx-i-message-circle" viewBox="0 0 24 24"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/></symbol><symbol id="lcx-i-square-stack" viewBox="0 0 24 24"><path d="M4 10c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h4c1.1 0 2 .9 2 2"/><path d="M10 16c-1.1 0-2-.9-2-2v-4c0-1.1.9-2 2-2h4c1.1 0 2 .9 2 2"/><rect width="8" height="8" x="14" y="14" rx="2"/></symbol><symbol id="lcx-i-split" viewBox="0 0 24 24"><path d="M16 3h5v5M8 3H3v5M12 22v-8.3a4 4 0 0 0-1.172-2.872L3 3M15 9l6-6"/></symbol><symbol id="lcx-i-merge" viewBox="0 0 24 24"><path d="m8 6 4-4 4 4"/><path d="M12 2v10.3a4 4 0 0 1-1.172 2.872L3 23"/><path d="m15 9 6 6"/></symbol></defs></svg>

每个模型供应商卖同一个数字，手法就像电信商卖「不限量」：一个上下文窗口，通常是几十万 token，偶尔一百万。言下之意是窗口越大、能力越强。把整个代码仓库贴进来。把整份合约贴进来。把一整年的客服工单贴进来。模型都装得下。

本文会反复用到三个单位。**token** 是模型读取与计费的文字单位，大约是英文单词的四分之三。**代理（agent）** 是能调用工具、在循环中采取行动的模型，不是只回答一次。**基线（baseline）** 是你用来对照的参考设置；没有基线，分数就只是个数字。

一篇由十二位作者合写的新论文，**〈You don’t need long context〉**（arXiv:2611.05306），从一个不太寻常的方向攻击这个假设。它没有主张模型在长输入上会失败。它主张的是更令人不安的事：**长输入通常根本不需要待在上下文里**——而把它留在那里，代价高昂，只是零售价目表把这件事藏了起来。

论文提出三个实证主张，各自对应不同的工作负载：

1. **长流程任务**——会执行许多动作的代理——可以在每次对话结束时压缩历史，总上下文维持在 8K–48K 之间，准确率大致持平，有时还更好。
2. **长输入任务**——在大份文件上做问答——可以把文件存进文件系统，让代理用 `grep`、`sed`、`head`、`tail` 选择性阅读，准确率通常**更高**，胜过把全部内容贴进 prompt。
3. **单动作压缩**——每执行一个动作后就丢掉整段对话，只保留一份精简的自然语言状态——仍能保住大部分准确率，而峰值上下文的中位数降到 **7K–9K token**。

<div class="lcx-paper-cta">
  <a class="mono-btn-chamfer lcx-paper-btn" href="https://arxiv.org/abs/2611.05306" target="_blank" rel="noopener noreferrer">
    <span class="chamfer-inner">
      <span class="btn-tag">ARXIV</span>
      <span class="btn-label">阅读论文 ↗</span>
    </span>
  </a>
</div>

标题数字不是准确率的差距，而是一个价格：在 256K token 的上下文下，生成一百万个输出 token 的成本，比 16K 时贵 **3.6× 到 7×**，视模型与服务栈而定。在长输入基准测试上，论文估计的优化零售成本，Claude Opus 4.5 降为原本的 **1/6.5 到 1/54.6**，GPT 5.6 Sol 降为原本的 **1/4.4 到 1/233.3**。这些倍数是吞吐量模型的估计值，不是账单——但方向很难忽略。

本文会走完整篇论文：成本论证、三种上下文管理机制、两组基准测试的每一项、单动作的结果、论文提出的**语义状态空间模型**、压缩的配方，以及故事开始破裂的地方。短版结论是：**长上下文不是一种你该默认付费的能力；它是一个你该按任务逐项证明其正当性的服务决策。**

<div class="lcx-kicker"><svg class="lcx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#lcx-i-scan-search"></use></svg>一屏读完论文</div>

## 五个数字，一个论点

<div class="lcx-stat-grid">
  <div class="lcx-stat">
    <div class="lcx-stat-top"><svg class="lcx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#lcx-i-banknote"></use></svg><span>成本倍率</span></div>
    <div class="lcx-stat-num">3.6–7×</div>
    <p>在论文的三个开放权重服务部署上，256K 上下文生成 token 比 16K 更贵。</p>
  </div>
  <div class="lcx-stat">
    <div class="lcx-stat-top"><svg class="lcx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#lcx-i-gauge"></use></svg><span>长流程</span></div>
    <div class="lcx-stat-num">−3.7 / +5.6</div>
    <p>Opus 4.5 在 22 种压缩设置下最差与最好的准确率变化，单位为百分点。GPT 5.6 Sol：−3.3 / +4.4。</p>
  </div>
  <div class="lcx-stat">
    <div class="lcx-stat-top"><svg class="lcx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#lcx-i-trending-down"></use></svg><span>长输入</span></div>
    <div class="lcx-stat-num">+40 pts</div>
    <p>相对全输入基线的最大准确率增幅（NIAH，Opus 4.5），估计成本同时下降 54.6×。</p>
  </div>
  <div class="lcx-stat">
    <div class="lcx-stat-top"><svg class="lcx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#lcx-i-memory-stick"></use></svg><span>单动作</span></div>
    <div class="lcx-stat-num">7–9K</div>
    <p>单动作压缩下峰值即时上下文的中位数，低于全历史基线 130K–200K 的最大值。</p>
  </div>
  <div class="lcx-stat">
    <div class="lcx-stat-top"><svg class="lcx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#lcx-i-triangle-alert"></use></svg><span>失败模式</span></div>
    <div class="lcx-stat-num">53.0 → 3.6</div>
    <p>Qwen 3 Coder Next 在最紧的 16K/12K 预算下的 SWE-bench Verified 分数。压缩不是每个模型都免费。</p>
  </div>
</div>

<p class="lcx-fine">数据来源：摘要、第 3–5 节、表 2、9、10、17，以及图 1、5、6。准确率差距单位为百分点，不是百分比。</p>

本文其余部分是长版。如果你只需要实务结论，可以直接跳到接近文末的**「我会怎么用这篇论文」**。如果你想理解这个结果*为什么*可信，请继续读——有趣的地方不是平均值，而是例外情况的形状。

<div class="lcx-kicker"><svg class="lcx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#lcx-i-book-open"></use></svg>先定义</div>

## 「长」是相对词，而这件事很重要

论文花了两页固定定义，这是对的。「上下文」是语言模型工程里被过度载入的词之一：它可以指某一步的输入、生成的输出、整段对话，或模型的架构上限。作者把五件事分开：

<div class="lcx-glossary">
  <div class="lcx-gloss"><div class="lcx-gloss-ico"><svg class="lcx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#lcx-i-circle-dot"></use></svg></div><div><div class="lcx-gloss-term">推论步</div><p class="lcx-gloss-copy">模型产生输出的一次调用。在代理中，这通常是一个回合：模型读取目前的上下文，然后输出一个想法、一次工具调用，或一个答案。</p></div></div>
  <div class="lcx-gloss"><div class="lcx-gloss-ico"><svg class="lcx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#lcx-i-panel-top"></use></svg></div><div><div class="lcx-gloss-term">输入上下文</div><p class="lcx-gloss-copy">模型在那一步被允许读取的所有内容：系统提示、任务、先前的消息、工具结果。这就是长对话中会不断长大的东西。</p></div></div>
  <div class="lcx-gloss"><div class="lcx-gloss-ico"><svg class="lcx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#lcx-i-message-circle"></use></svg></div><div><div class="lcx-gloss-term">输出上下文</div><p class="lcx-gloss-copy">模型在那一步生成的所有内容：思考轨迹、工具调用、给用户的答案。除非有东西把它移除，否则它会附加到下一个输入上下文。</p></div></div>
  <div class="lcx-gloss"><div class="lcx-gloss-ico"><svg class="lcx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#lcx-i-panel-top"></use></svg></div><div><div class="lcx-gloss-term">上下文窗口</div><p class="lcx-gloss-copy">端点在一次调用中能处理的 token 上限。它可能是模型的架构上限，也可能是较小的服务配置。超过上限的请求通常会直接失败；超过上限的行为不可靠。</p></div></div>
  <div class="lcx-gloss"><div class="lcx-gloss-ico"><svg class="lcx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#lcx-i-scale"></use></svg></div><div><div class="lcx-gloss-term">长与短</div><p class="lcx-gloss-copy">论文把上下文称为<em>长</em>，是指它接近 2026 年常见的 ~256K 窗口的显着比例；称为<em>短</em>，是指它离零比离那个窗口近得多——实务上是 <strong>16K–50K</strong>。短是相对的，不是小。</p></div></div>
</div>

最后一个定义是整篇论文的枢纽。作者说「短上下文」时，**不是**指 4K 的玩具窗口。他们指的是 16K–50K token，仍然足以装下一本小说。论文不是主张模型应该忘掉一切。它主张的是：对于*输入*可能大上数百倍的任务，数万 token 的工作集已经足够。

<div class="lcx-callout">
  <svg class="lcx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#lcx-i-book-open"></use></svg>
  <div><b>桌上的图书馆。</b> 50K token 的上下文大约是一本短篇小说。1M token 的上下文大约是整本钦定版圣经——旧约加新约。论文要问的不是「模型能不能读一座图书馆？」而是「当问题只关于一个书架时，为什么整座图书馆都在桌上？」</div>
</div>

论文用一张文学作品表把尺度画得很生动。重点不是上下文窗口没用，而是它们已经长得远远超过人们实际推理时所面对的文本大小。

<div class="lcx-table-card">
  <div class="lcx-table-head">
    <div class="lcx-table-tag"><svg class="lcx-ico lcx-ico-xs" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#lcx-i-book-open"></use></svg>表 1，重绘 · 图书馆 VS. 窗口</div>
    <div class="lcx-table-title">八本书，八个窗口。</div>
    <p class="lcx-table-sub">token 数为近似值：论文以每英文字约 1.33 token 换算。这里最小的窗口仍能装下三次<em>《大亨小传》</em>。</p>
  </div>
  <div class="lcx-table-scroll">
    <table class="lcx-books">
      <thead><tr><th>文学作品</th><th class="num">Token 数</th><th>模型</th><th class="num">窗口</th></tr></thead>
      <tbody>
        <tr><td>《老人与海》</td><td class="num">~37K</td><td>MiniMax M2.7</td><td class="num">200K</td></tr>
        <tr><td>《大亨小传》</td><td class="num">~64K</td><td>Claude Opus 4.5</td><td class="num">200K</td></tr>
        <tr><td>《古兰经》（Saheeh International 英译）</td><td class="num">~207K</td><td>Gemma 4 31B</td><td class="num">256K</td></tr>
        <tr><td>钦定版新约圣经</td><td class="num">~241K</td><td>Kimi K2.6</td><td class="num">256K</td></tr>
        <tr><td>《远大前程》</td><td class="num">~245K</td><td>Qwen 3 Coder Next</td><td class="num">262K</td></tr>
        <tr><td>《魔戒》</td><td class="num">~640K</td><td>Gemini 3.8 Flash</td><td class="num">1M</td></tr>
        <tr><td>《战争与和平》</td><td class="num">~753K</td><td>GLM 5.2</td><td class="num">1M</td></tr>
        <tr><td>钦定版旧约圣经</td><td class="num">~802K</td><td>GPT 5.6 Sol</td><td class="num">1.05M</td></tr>
      </tbody>
    </table>
  </div>
  <div class="lcx-table-foot">这个配对是示意，不是基准测试。数据来源：arXiv:2611.05306，表 1。</div>
</div>

论文的框架刻意挑衅：上下文窗口一直被行销成一场容量竞赛，但容量不等于有用。能载一栋房子的卡车，不会自动成为买菜的正确交通工具。

<div class="lcx-kicker"><svg class="lcx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#lcx-i-receipt"></use></svg>账单</div>

## 成本随深度线性成长，而最后一次翻倍最贵

机制用一段话说完。Transformer 生成文字时，会对上下文里既有的 token 做注意力运算：每个新 token 都会回头看先前的 token，并给它们不同的权重。这个回看需要为每个先前 token 保存一组 key 与 value，所以服务栈把它们放进 **KV 缓存**，不必每一步都从头重算。缓存会随上下文长度线性成长，而每个新 token 都必须对全部缓存做注意力。结果是：**越后面的 token，生成成本越高**——论文把单一 token 的解码成本描述为随上下文深度线性成长。整段序列的注意力总工作量是二次的，而 prefill（读取输入）才是二次项咬人的地方；图 1 量的是解码。论文引用标准分析，然后在真实服务栈上量测。

<div class="lcx-callout">
  <svg class="lcx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#lcx-i-gauge"></use></svg>
  <div><b>会加速的计程车跳表。</b> Prefill 是起跳价：模型读取输入。Decode 是跳表：每生成一个 token 跳一次。在长上下文里，每一次跳表都要对更多历史做注意力，所以车越跑，表跳得越快。零售价目表却用每百万 token 的均一费率报价，把加速藏了起来。</div>
</div>

论文分开量测两件事：

- **云端服务成本。** 在 H100 GPU 上，以 16K 到 256K 的上下文窗口服务 GLM 5.2、Kimi K2.6、Qwen 3 Coder Next，量测峰值持续解码吞吐量，再以每 GPU 小时 $3.85 换算成每百万输出 token 的美元成本。
- **本机负担。** 在一台可用统一内存约 109GB 的 NVIDIA DGX Spark 上，随上下文成长，量测五个开放权重程序码模型之间的 token 间延迟、batch-one 吞吐量与内存占用。

两项量测指向同一个方向。图 1 是论文自己对云端成本曲线的看法。

<figure class="fig">
  <img src="/images/long-context/fig01-cost-per-mtok.webp" alt="三个面板显示，随着上下文窗口从 16K 成长到 256K，GLM 5.2、Kimi K2.6 与 Qwen 3 Coder Next 生成一百万个输出 token 的美元成本急遽上升" width="1600" height="487" loading="lazy" />
  <figcaption><b>图 1（论文原图）</b>——长上下文的成本：在既有 KV 缓存上生成 1M 输出 token 的美元成本，以每 H100 小时 $3.85 计。每个面板有自己的 y 轴。三条曲线在不同位置弯折——Qwen 3 Coder Next 最早，GLM 5.2 最晚——256K 端点是 16K 端点的 3.6× 到 7×。该注意的是斜率，不是确切的美元数字。最后一次翻倍最贵，而 Qwen 的惩罚最大。数据来源：<a href="https://arxiv.org/abs/2611.05306">Belcak et al., arXiv:2611.05306</a> · <a href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a></figcaption>
</figure>

<div class="chamfer-card-wrapper lcx-card">
  <div class="chamfer-card-content">
    <div class="card-tag lcx-tag"><svg class="lcx-ico lcx-ico-xs" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#lcx-i-banknote"></use></svg> EXHIBIT // 01 · 成本曲线</div>
    <div class="lcx-card-title">短上下文解码快 3.6–7×。</div>
    <p class="lcx-card-sub">每个上下文窗口下的解码吞吐量，以相对 256K 工作点的速度倍数表示。数值读自论文的图 4；曲线是近似，方向不是。</p>
    <svg class="lcx-chart" viewBox="0 0 440 278" role="img" aria-label="三个模型在短上下文下的解码速度，相对 256K 的倍数" xmlns="http://www.w3.org/2000/svg"><text x="46" y="10" class="lcx-ch-axis" text-anchor="start">解码速度 VS. 256K 上下文</text><rect x="46.0" y="18" width="188.0" height="198" class="lcx-ch-band"/><text x="140.0" y="29" class="lcx-ch-band-label" text-anchor="middle">短上下文区</text><line x1="46" y1="216.0" x2="422" y2="216.0" class="lcx-ch-grid"/><text x="41" y="218.2" class="lcx-ch-axis" text-anchor="end">0×</text><line x1="46" y1="189.6" x2="422" y2="189.6" class="lcx-ch-grid"/><text x="41" y="191.79999999999998" class="lcx-ch-axis" text-anchor="end">1×</text><line x1="46" y1="163.20000000000002" x2="422" y2="163.20000000000002" class="lcx-ch-grid"/><text x="41" y="165.4" class="lcx-ch-axis" text-anchor="end">2×</text><line x1="46" y1="136.8" x2="422" y2="136.8" class="lcx-ch-grid"/><text x="41" y="139.0" class="lcx-ch-axis" text-anchor="end">3×</text><line x1="46" y1="110.4" x2="422" y2="110.4" class="lcx-ch-grid"/><text x="41" y="112.60000000000001" class="lcx-ch-axis" text-anchor="end">4×</text><line x1="46" y1="84.00000000000001" x2="422" y2="84.00000000000001" class="lcx-ch-grid"/><text x="41" y="86.20000000000002" class="lcx-ch-axis" text-anchor="end">5×</text><line x1="46" y1="57.599999999999994" x2="422" y2="57.599999999999994" class="lcx-ch-grid"/><text x="41" y="59.8" class="lcx-ch-axis" text-anchor="end">6×</text><line x1="46" y1="31.199999999999996" x2="422" y2="31.199999999999996" class="lcx-ch-grid"/><text x="41" y="33.4" class="lcx-ch-axis" text-anchor="end">7×</text><text x="46.0" y="230" class="lcx-ch-axis" text-anchor="middle">16K</text><text x="140.0" y="230" class="lcx-ch-axis" text-anchor="middle">32K</text><text x="234.0" y="230" class="lcx-ch-axis" text-anchor="middle">64K</text><text x="328.0" y="230" class="lcx-ch-axis" text-anchor="middle">128K</text><text x="422.0" y="230" class="lcx-ch-axis" text-anchor="middle">256K</text><line x1="46" y1="216" x2="422" y2="216" class="lcx-ch-axis-line"/><path d="M46.0,110.4 L140.0,118.3 L234.0,123.6 L328.0,136.8 L422.0,189.6" class="lcx-ch-line"/><circle cx="46.0" cy="110.4" r="2.5" class="lcx-ch-dot"/><circle cx="140.0" cy="118.3" r="2.5" class="lcx-ch-dot"/><circle cx="234.0" cy="123.6" r="2.5" class="lcx-ch-dot"/><circle cx="328.0" cy="136.8" r="2.5" class="lcx-ch-dot"/><circle cx="422.0" cy="189.6" r="2.5" class="lcx-ch-dot"/><text x="51.0" y="105.4" class="lcx-ch-value">4.0×</text><path d="M46.0,57.6 L140.0,86.6 L234.0,110.4 L328.0,131.5 L422.0,189.6" class="lcx-ch-line2"/><circle cx="46.0" cy="57.6" r="2.5" class="lcx-ch-dot2"/><circle cx="140.0" cy="86.6" r="2.5" class="lcx-ch-dot2"/><circle cx="234.0" cy="110.4" r="2.5" class="lcx-ch-dot2"/><circle cx="328.0" cy="131.5" r="2.5" class="lcx-ch-dot2"/><circle cx="422.0" cy="189.6" r="2.5" class="lcx-ch-dot2"/><text x="51.0" y="66.6" class="lcx-ch-value">6.0×</text><path d="M46.0,31.2 L140.0,73.4 L234.0,102.5 L328.0,131.5 L422.0,189.6" class="lcx-ch-line3"/><circle cx="46.0" cy="31.2" r="2.5" class="lcx-ch-dot3"/><circle cx="140.0" cy="73.4" r="2.5" class="lcx-ch-dot3"/><circle cx="234.0" cy="102.5" r="2.5" class="lcx-ch-dot3"/><circle cx="328.0" cy="131.5" r="2.5" class="lcx-ch-dot3"/><circle cx="422.0" cy="189.6" r="2.5" class="lcx-ch-dot3"/><text x="51.0" y="26.199999999999996" class="lcx-ch-value">7.0×</text><line x1="46" y1="254" x2="60" y2="254" class="lcx-ch-line"/><circle cx="53" cy="254" r="2.4" class="lcx-ch-dot"/><text x="65" y="256.3" class="lcx-ch-note">GLM 5.2</text><line x1="164" y1="254" x2="178" y2="254" class="lcx-ch-line2"/><circle cx="171" cy="254" r="2.4" class="lcx-ch-dot2"/><text x="183" y="256.3" class="lcx-ch-note">Kimi K2.6</text><line x1="282" y1="254" x2="296" y2="254" class="lcx-ch-line3"/><circle cx="289" cy="254" r="2.4" class="lcx-ch-dot3"/><text x="301" y="256.3" class="lcx-ch-note">Qwen 3 Coder Next</text><text x="46" y="272" class="lcx-ch-note">数值读自图 4，为近似值。所有曲线在 256K 参考点交会。</text></svg>
    <div class="lcx-src">重绘自图 4 · arXiv:2611.05306</div>
  </div>
</div>

形状在三个不同模型与两种服务配置上一致。膝点的确切位置会移动——Qwen 3 Coder Next 较早、较猛地弯折，GLM 5.2 则一路平坦到 128K——但方向不变。**256K 的边际 token，成本并不和 16K 的边际 token 相同——即使 API 的帐面数字这么说。**

图 4 从服务端展示同一组数据：解码吞吐量随着设置的窗口变大而崩塌。右轴把曲线换算成相对 256K 工作点的速度倍数。

<figure class="fig">
  <img src="/images/long-context/fig04-throughput.webp" alt="三个面板显示 GLM 5.2、Kimi K2.6 与 Qwen 3 Coder Next 的解码吞吐量（token／秒）从 16K 到 256K 上下文一路下降，右轴显示短上下文下有 4× 到 7× 的加速" width="1600" height="473" loading="lazy" />
  <figcaption><b>图 4（论文原图）</b>——解码吞吐量随上下文窗口成长而崩塌。GLM 5.2 在 16K 时仍保有约 4× 于 256K 的吞吐量；Kimi K2.6 约 6×；Qwen 3 Coder Next 约 7×。该注意的是：较短的窗口不是小小的调校旋钮——它改变可达到的服务经济效益，幅度和激进量化同一个数量级。数据来源：<a href="https://arxiv.org/abs/2611.05306">Belcak et al., arXiv:2611.05306</a> · <a href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a></figcaption>
</figure>

本机的情况也一样直白。在 DGX Spark 上，数个模型的 token 间延迟在量测范围内大约翻倍，内存占用一路攀升，直到 MiniMax M2.7 用完约 109GB 的预算。

<figure class="fig">
  <img src="/images/long-context/fig02-dgx-spark.webp" alt="NVIDIA DGX Spark 上的三个面板：token 间延迟随上下文长度上升，batch-one 吞吐量下降，内存消耗逼近 109GB 的设备上限" width="1600" height="501" loading="lazy" />
  <figcaption><b>图 2（论文原图）</b>——长上下文对本机设备的负担。延迟上升、吞吐量下降，内存消耗逼近设备上限；MiniMax M2.7 在约 64K token 时内存不足。该注意的是：看内存面板，不是延迟面板。在桌面级的机器上，长上下文不只是比较贵——其中一个模型会直接停摆。数据来源：<a href="https://arxiv.org/abs/2611.05306">Belcak et al., arXiv:2611.05306</a> · <a href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a></figcaption>
</figure>

<div class="lcx-pull">
  <div class="lcx-pull-mark">“</div>
  <p>token 的零售价，报得好像上下文深度是免费的。到了服务端，深度就是账单。</p>
</div>

这是论文的经济前提，值得和其余部分分开看。即使压缩对准确率毫无帮助，3.6–7× 的服务成本差距，就足以让人质问完整历史是否必要。准确率实验是为了回答显而易见的后续问题：*如果我们不再什么都带着，会坏掉什么？*

<div class="lcx-kicker"><svg class="lcx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#lcx-i-flask-conical"></use></svg>实验</div>

## 两种「长」，六加七个基准测试

论文按长度从哪里来，把工作负载分类；这个分类法对实务工作者来说是全文最有用的东西。

<div class="lcx-duo">
  <div class="lcx-duo-col">
    <div class="lcx-duo-head"><svg class="lcx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#lcx-i-workflow"></use></svg><span>长流程</span></div>
    <div class="lcx-duo-big">历史会长大，因为代理在行动。</div>
    <p>探索代码仓库、终端任务、多轮工具使用。每个动作与观察都会被附加；上下文是做事过程的副作用，自然就越长越大。</p>
    <div class="lcx-duo-meta">6 个基准测试 · 每个模型 22 种设置</div>
  </div>
  <div class="lcx-duo-col">
    <div class="lcx-duo-head"><svg class="lcx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#lcx-i-file-text"></use></svg><span>长输入</span></div>
    <div class="lcx-duo-big">代理还没开始，输入就已经很长。</div>
    <p>多文件问答、needle 检索、长程序码理解。问题很短，素材很大。任务本身没有任何地方要求一次读完。</p>
    <div class="lcx-duo-meta">7 个基准测试 · 选择性阅读</div>
  </div>
</div>

下面的基准测试卡片是完整集合。每张卡说明该基准测试量什么，以及它为什么属于这一组。如果你已经熟悉这些基准测试，可以直接跳到三种机制；这些卡片是参考资料。

<div class="lcx-bench-grid">
  <div class="lcx-bench"><div class="lcx-bench-top"><div class="lcx-bench-ico"><svg class="lcx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#lcx-i-git-branch"></use></svg></div><div><div class="lcx-bench-name">SWE-bench Verified</div><div class="lcx-bench-sub">500 个任务 · Python 代码仓库</div></div></div><p class="lcx-bench-desc">解决真实的 GitHub issue；修补必须通过代码仓库保留的测试。长流程程序任务的经典基准测试。</p><div class="lcx-bench-stress"><b>为什么适合</b> 探索、编辑、测试、调试——一连串自然会拉长的相依动作。</div></div>
  <div class="lcx-bench"><div class="lcx-bench-top"><div class="lcx-bench-ico"><svg class="lcx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#lcx-i-terminal"></use></svg></div><div><div class="lcx-bench-name">SWE-bench Multilingual</div><div class="lcx-bench-sub">300 个任务 · 9 种语言</div></div></div><p class="lcx-bench-desc">跨九个语言生态系的 issue 解决。同样的工作流程，不同的代码仓库惯例与工具链。</p><div class="lcx-bench-stress"><b>为什么适合</b> 检验结果能否撑过语言与生态系的改变。</div></div>
  <div class="lcx-bench"><div class="lcx-bench-top"><div class="lcx-bench-ico"><svg class="lcx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#lcx-i-terminal"></use></svg></div><div><div class="lcx-bench-name">Terminal-Bench 2.1</div><div class="lcx-bench-sub">89 个任务 · 沙箱化 CLI</div></div></div><p class="lcx-bench-desc">在容器里端到端解决命令列问题，由逐任务验证器评分。范围比单一代码仓库的修补更广。</p><div class="lcx-bench-stress"><b>为什么适合</b> 长命令历史、环境状态，以及从失败命令中复原。</div></div>
  <div class="lcx-bench"><div class="lcx-bench-top"><div class="lcx-bench-ico"><svg class="lcx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#lcx-i-network"></use></svg></div><div><div class="lcx-bench-name">FRAMES</div><div class="lcx-bench-sub">824 个多跳问题</div></div></div><p class="lcx-bench-desc">答案需要结合 2–15 篇维基百科文章的内容。在这个代理化的版本里，模型逐步搜寻并开启文章。</p><div class="lcx-bench-stress"><b>为什么适合</b> 证据跨步骤累积，但代理可以自己选择要检索什么。</div></div>
  <div class="lcx-bench"><div class="lcx-bench-top"><div class="lcx-bench-ico"><svg class="lcx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#lcx-i-users"></use></svg></div><div><div class="lcx-bench-name">τ²-bench</div><div class="lcx-bench-sub">184 个任务 · 零售／航空／电信</div></div></div><p class="lcx-bench-desc">与模拟用户对话，同时在政策限制下操作领域工具。成功需要正确答案与正确的最终状态。</p><div class="lcx-bench-stress"><b>为什么适合</b> 对话早期的细节，必须在几次工具调用后仍然可用。</div></div>
  <div class="lcx-bench"><div class="lcx-bench-top"><div class="lcx-bench-ico"><svg class="lcx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#lcx-i-layers"></use></svg></div><div><div class="lcx-bench-name">BFCLv3</div><div class="lcx-bench-sub">200 个长多轮情境</div></div></div><p class="lcx-bench-desc">模拟环境中的多轮工具使用。代理必须记住先前的回合，并正确安排会改变状态的调用。</p><div class="lcx-bench-stress"><b>为什么适合</b> 干净地检验早期事实能否撑过后面的回合。</div></div>
  <div class="lcx-bench"><div class="lcx-bench-top"><div class="lcx-bench-ico"><svg class="lcx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#lcx-i-file-text"></use></svg></div><div><div class="lcx-bench-name">LongBench v2</div><div class="lcx-bench-sub">503 个问题 · 8K–2M 字</div></div></div><p class="lcx-bench-desc">六类任务：单文件与多文件问答、长上下文学习、长对话、代码仓库理解、结构化数据。</p><div class="lcx-bench-stress"><b>为什么适合</b> 异质的真实文件；答案很少需要整份文件。</div></div>
  <div class="lcx-bench"><div class="lcx-bench-top"><div class="lcx-bench-ico"><svg class="lcx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#lcx-i-book-open"></use></svg></div><div><div class="lcx-bench-name">LOONG</div><div class="lcx-bench-sub">1,600 个问题 · 中／英</div></div></div><p class="lcx-bench-desc">针对多份完整财报、法律案件或论文提问。包含定位、比较、分群与推理链任务。</p><div class="lcx-bench-stress"><b>为什么适合</b> 证据分散在几份关键文件里。</div></div>
  <div class="lcx-bench"><div class="lcx-bench-top"><div class="lcx-bench-ico"><svg class="lcx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#lcx-i-scale"></use></svg></div><div><div class="lcx-bench-name">AA-LCR</div><div class="lcx-bench-sub">100 个问题 · 每题约 100K token</div></div></div><p class="lcx-bench-desc">由人类撰写的推理题，素材是成组的真实报告、咨询文件、法律文件与调查。重点是多步整合，不是查单一事实。</p><div class="lcx-bench-stress"><b>为什么适合</b> 输入很大，但相关证据只占一小部分。</div></div>
  <div class="lcx-bench"><div class="lcx-bench-top"><div class="lcx-bench-ico"><svg class="lcx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#lcx-i-scan-search"></use></svg></div><div><div class="lcx-bench-name">NIAH</div><div class="lcx-bench-sub">125 个实例 · 16K–500K</div></div></div><p class="lcx-bench-desc">把目标句子以受控深度插入无关的随笔文字中；模型必须返回那个事实。经典的「大海捞针」网格。</p><div class="lcx-bench-stress"><b>为什么适合</b> 纯检索；如果选择性阅读在这里赢不了，它在哪里都赢不了。</div></div>
  <div class="lcx-bench"><div class="lcx-bench-top"><div class="lcx-bench-ico"><svg class="lcx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#lcx-i-list-filter"></use></svg></div><div><div class="lcx-bench-name">RULER</div><div class="lcx-bench-sub">13 个任务 · 256K/500K</div></div></div><p class="lcx-bench-desc">八种 needle 变体，加上变数追踪、词汇撷取与多跳问答。按所需答案集合的召回率评分。</p><div class="lcx-bench-stress"><b>为什么适合</b> 检验聚合与追踪，不只是单一的字面比对。</div></div>
  <div class="lcx-bench"><div class="lcx-bench-top"><div class="lcx-bench-ico"><svg class="lcx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#lcx-i-list-filter"></use></svg></div><div><div class="lcx-bench-name">Counting-Stars</div><div class="lcx-bench-sub">192 个问题 · 中／英</div></div></div><p class="lcx-bench-desc">32 个标记数字散落在长文中；模型必须全部找回来。推理变体会修正一开始错误的计数。</p><div class="lcx-bench-stress"><b>为什么适合</b> 要求穷尽式召回——对有损摘要来说最难的情况。</div></div>
  <div class="lcx-bench"><div class="lcx-bench-top"><div class="lcx-bench-ico"><svg class="lcx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#lcx-i-boxes"></use></svg></div><div><div class="lcx-bench-name">BABILong</div><div class="lcx-bench-sub">550 个问题 · 64K–1M</div></div></div><p class="lcx-bench-desc">把简短的 bAbI 事实嵌入书籍文字。回答需要先定位事实，再串接、计数、否定或追踪集合。</p><div class="lcx-bench-stress"><b>为什么适合</b> 事实很小，干草堆巨大，推理是多步的。</div></div>
</div>

模型也照同样方式分组。两个闭源（只能通过 API 使用）前沿模型承担主要的准确率实验——**Claude Opus 4.5** 与 **GPT 5.6 Sol**——正因为它们来自不同供应商、不同后训练配方。如果压缩只对一个家族有帮助，结果就只是 prompt 的产物。五个开放权重（可下载、自行部署）的模型负责服务与稳健性检查：**Qwen 3.6 27B**、**Qwen 3 Coder Next**（总参数 80B，启用 3B）、**Gemma 4 31B**、**Step 3.7 Flash**（总参数 198B，启用 11B）与 **MiniMax M2.7**（总参数 230B，启用 10B）。

代理外壳（harness）刻意无聊。两个基础外壳都跑最小化的 ReAct 循环：任务是第一则用户消息，模型**一次只发出一个 Bash 动作**，动作与其结果再附加到对话。`mini-swe-agent` 处理软件与终端任务；`mini-agent` 用基准测试专属指令与提交规则，把同一个循环推广到其他基准测试。基线里没有隐藏记忆层、没有向量数据库、没有检索启发式。重点就在这里：实验隔离的是**上下文管理**，不是代理的聪明程度。

<div class="lcx-kicker"><svg class="lcx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#lcx-i-repeat"></use></svg>三种机制</div>

## FHA、EoCC、SAC：三种带着对话走的方式

论文比较三种上下文管理机制。它们的差别只在于**模型下一步被允许看到什么**。

<div class="lcx-regime-grid">
  <div class="lcx-regime">
    <div class="lcx-regime-top"><span class="lcx-regime-code">FHA</span><span class="lcx-regime-name">全历史累积</span></div>
    <p>附加每一个动作与观察。什么都不移除。上下文单调成长，直到任务结束或窗口溢出。</p>
    <div class="lcx-regime-tag"><svg class="lcx-ico lcx-ico-xs" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#lcx-i-arrow-right"></use></svg>默认做法</div>
  </div>
  <div class="lcx-regime">
    <div class="lcx-regime-top"><span class="lcx-regime-code">EoCC</span><span class="lcx-regime-name">对话末端压缩</span></div>
    <p>以 FHA 执行，直到上下文跨过门槛。请模型产出有界、与任务相关的压缩；用任务与这份压缩状态开启一段新对话。</p>
    <div class="lcx-regime-tag"><svg class="lcx-ico lcx-ico-xs" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#lcx-i-scissors"></use></svg>周期性重置</div>
  </div>
  <div class="lcx-regime">
    <div class="lcx-regime-top"><span class="lcx-regime-code">SAC</span><span class="lcx-regime-name">单动作压缩</span></div>
    <p>每段对话拿到任务与目前的语义状态——一份书面笔记，写着发生了什么、什么卡住、下一步该做什么——执行恰好一个动作，更新笔记，然后被丢弃。没有任何对话历史留到下一步。</p>
    <div class="lcx-regime-tag"><svg class="lcx-ico lcx-ico-xs" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#lcx-i-zap"></use></svg>一个动作</div>
  </div>
</div>

论文的图 3 把三种机制画成消息堆叠。值得仔细看，因为 EoCC 与 SAC 的差别很容易糊掉。

<figure class="fig">
  <img src="/images/long-context/fig03-regimes.webp" alt="三种上下文管理机制的图解：全历史累积让对话不断成长，对话末端压缩周期性插入摘要，单动作压缩则每段对话只执行一个动作" width="1600" height="583" loading="lazy" />
  <figcaption><b>图 3（论文原图）</b>——三种机制。FHA 维持一段无界生长的对话。EoCC 周期性插入压缩并开启新对话。SAC 只带一份语义状态，每段对话执行一个动作。该注意的是：SAC 不是「更常摘要」——它完全移除对话历史，只留下书面状态作为唯一的桥梁。数据来源：<a href="https://arxiv.org/abs/2611.05306">Belcak et al., arXiv:2611.05306</a> · <a href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a></figcaption>
</figure>

<div class="chamfer-card-wrapper lcx-card">
  <div class="chamfer-card-content">
    <div class="card-tag lcx-tag"><svg class="lcx-ico lcx-ico-xs" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#lcx-i-activity"></use></svg> EXHIBIT // 02 · 上下文轨迹</div>
    <div class="lcx-card-title">三种机制，三种记忆形状。</div>
    <p class="lcx-card-sub">即时上下文随时间变化的示意图。FHA 无界成长；EoCC 在门槛处呈锯齿状；SAC 保持平坦，因为每个动作都开启一段新对话。</p>
    <svg class="lcx-chart" viewBox="0 0 440 252" role="img" aria-label="三种机制下即时上下文随动作变化的示意图" xmlns="http://www.w3.org/2000/svg"><text x="46" y="10" class="lcx-ch-axis" text-anchor="start">即时上下文 · 示意图</text><line x1="46" y1="210.0" x2="336" y2="210.0" class="lcx-ch-grid"/><text x="41" y="212.2" class="lcx-ch-axis" text-anchor="end">0K</text><line x1="46" y1="164.28571428571428" x2="336" y2="164.28571428571428" class="lcx-ch-grid"/><text x="41" y="166.48571428571427" class="lcx-ch-axis" text-anchor="end">50K</text><line x1="46" y1="118.57142857142858" x2="336" y2="118.57142857142858" class="lcx-ch-grid"/><text x="41" y="120.77142857142859" class="lcx-ch-axis" text-anchor="end">100K</text><line x1="46" y1="72.85714285714286" x2="336" y2="72.85714285714286" class="lcx-ch-grid"/><text x="41" y="75.05714285714286" class="lcx-ch-axis" text-anchor="end">150K</text><line x1="46" y1="27.142857142857153" x2="336" y2="27.142857142857153" class="lcx-ch-grid"/><text x="41" y="29.342857142857152" class="lcx-ch-axis" text-anchor="end">200K</text><text x="46.0" y="224" class="lcx-ch-axis" text-anchor="middle">0</text><text x="118.5" y="224" class="lcx-ch-axis" text-anchor="middle">10</text><text x="191.0" y="224" class="lcx-ch-axis" text-anchor="middle">20</text><text x="263.5" y="224" class="lcx-ch-axis" text-anchor="middle">30</text><text x="336.0" y="224" class="lcx-ch-axis" text-anchor="middle">40</text><text x="191.0" y="246" class="lcx-ch-axis" text-anchor="middle">已执行动作数</text><path d="M46.0,204.5 L321.5,29.0" class="lcx-ch-line"/><text x="292.5" y="38.11428571428571" class="lcx-ch-note">FHA</text><text x="292.5" y="46.11428571428571" class="lcx-ch-note2">不重置</text><path d="M46.0,204.5 L83.7,173.4 L89.5,204.1 L127.2,173.0 L133.0,203.6 L170.7,172.5 L176.5,203.1 L214.2,172.1 L220.0,202.7 L257.7,171.6 L263.5,202.2 L301.2,171.1" class="lcx-ch-line2"/><text x="270.75" y="151.48571428571427" class="lcx-ch-note">EoCC</text><text x="270.75" y="159.48571428571427" class="lcx-ch-note2">达门槛重置</text><path d="M46.0,207.7 L321.5,207.7" class="lcx-ch-line3"/><text x="220.0" y="203.71428571428572" class="lcx-ch-note">SAC · 每个上下文一个动作</text><line x1="46.0" y1="18" x2="46.0" y2="210" class="lcx-ch-axis-line"/></svg>
    <div class="lcx-src">示意图 · 依据 §2.4.1 与图 3</div>
  </div>
</div>

门槛的写法是**总上下文上限 / 压缩门槛**。例如 `16K / 12K` 表示执行中的上下文接近 12K token 时，代理就压缩，而外壳绝不让单段对话超过 16K。两个数字之间的差距，保留给压缩那一回合本身。读表格时这个记法很重要：第一个数字是硬上限，第二个是触发点。

对长流程任务，作者在大多数基准测试上扫过四种设置：`48K/36K`、`32K/24K`、`24K/18K`、`16K/12K`。BFCLv3 下探到 `12K/8K`；τ²-bench 下探到 `8K/6K`。每往下调一阶，就是更紧的预算与更频繁的压缩。如果准确率主要是上下文长度的函数，这些曲线应该掉下悬崖。它们没有。

对长输入任务，手法不同。文件根本不放进对话，而是写到代理的文件系统，命名为 `input01.txt`、`input02.txt` 等等。任务消息只列出档名；代理用普通的 Bash 工具搜寻与读取。论文称之为**选择性输入阅读**。它把长输入任务转成长流程任务：代理执行动作（`grep` 这个、`sed` 那个），观察结果，再决定下一步读什么。

<div class="lcx-callout">
  <svg class="lcx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#lcx-i-folder-open"></use></svg>
  <div><b>仓库，不是书桌。</b> 把一份 500K token 的文件贴进 prompt，等于把整座仓库搬到桌上。选择性阅读是保留仓库、学会它的索引，然后派一个跑腿的人去拿你需要的那两个箱子。跑腿的报告很小；仓库还在原地。</div>
</div>

这也是论文对显而易见的反驳所给的答案。「如果代理需要你压缩掉的东西怎么办？」把完整逐字稿留在磁碟上，再给代理一个搜寻它的方法。信息不必待在上下文里，才能被代理使用。这个区分——**在上下文中** vs. **可取得**——是整个结果的概念核心。

<div class="lcx-kicker"><svg class="lcx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#lcx-i-gauge"></use></svg>结果 1 · 长流程</div>

## 压缩在长流程任务上无聊得令人安心——以最好的方式

第一个研究问题是：一个会执行许多动作的代理，能不能不带着完整历史就完成任务？在六个基准测试与两个前沿模型上，答案是能——偏差很小、方向不一、多数为正。

<figure class="fig">
  <img src="/images/long-context/fig05-long-horizon.webp" alt="六个面板的长流程基准测试结果，显示总上下文上限缩小时，准确率变化接近零，成本节省介于 2× 到 8.8× 之间" width="1800" height="1406" loading="lazy" />
  <figcaption><b>图 5（论文原图）</b>——长流程结果随总上下文上限的变化。上排：相对全历史基线的准确率变化；零代表不变。下排：估计成本节省。橘色是 Claude Opus 4.5，蓝色是 GPT 5.6 Sol。该注意的是：准确率线在零附近徘徊，成本长条却往上爬——这笔交易不是「少一点准确率换少一点成本」，而大多是「一样的准确率，更少的成本」。数据来源：<a href="https://arxiv.org/abs/2611.05306">Belcak et al., arXiv:2611.05306</a> · <a href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a></figcaption>
</figure>

整体数字如下：

- **准确率范围：** Opus 4.5 在所有基准测试与门槛间落在 **−3.7 到 +5.6 个百分点**；GPT 5.6 Sol 落在 **−3.3 到 +4.4**。
- **什么时候会伤到：** 对任一模型，**22 种门槛设置中，最多只有 5 种**相对基线掉超过 2 个百分点。
- **成本：** Opus 4.5 节省 **2.2×–8.8×**，GPT 5.6 Sol 节省 **2.4×–5.0×**。
- **token 支出没有爆炸：** 压缩一般不会让代理重做工作、烧掉更多总 token。新输入 token 随窗口缩小而上升，缓存 token 下降，输出 token 上升，GPT 在最紧的设置下更是大幅上升——这是预期的模式。

<div class="chamfer-card-wrapper lcx-card">
  <div class="chamfer-card-content">
    <div class="card-tag lcx-tag"><svg class="lcx-ico lcx-ico-xs" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#lcx-i-coins"></use></svg> EXHIBIT // 03 · 长流程经济学</div>
    <div class="lcx-card-title">一样的准确率，便宜 2.2–8.8×。</div>
    <p class="lcx-card-sub">每个长流程基准测试相对全历史基线的估计成本节省。每根长条涵盖受测的最低到最高设置；圆点标出最大值。</p>
    <svg class="lcx-chart" viewBox="0 0 440 300" role="img" aria-label="两个模型在各长流程基准测试上的估计成本节省范围" xmlns="http://www.w3.org/2000/svg"><text x="130" y="10" class="lcx-ch-axis" text-anchor="start">估计成本节省 VS. 全历史</text><line x1="130.0" y1="26" x2="130.0" y2="236" class="lcx-ch-grid"/><text x="130.0" y="250" class="lcx-ch-axis" text-anchor="middle">1×</text><line x1="189.29411764705884" y1="26" x2="189.29411764705884" y2="236" class="lcx-ch-grid"/><text x="189.29411764705884" y="250" class="lcx-ch-axis" text-anchor="middle">3×</text><line x1="248.58823529411765" y1="26" x2="248.58823529411765" y2="236" class="lcx-ch-grid"/><text x="248.58823529411765" y="250" class="lcx-ch-axis" text-anchor="middle">5×</text><line x1="307.88235294117646" y1="26" x2="307.88235294117646" y2="236" class="lcx-ch-grid"/><text x="307.88235294117646" y="250" class="lcx-ch-axis" text-anchor="middle">7×</text><line x1="367.1764705882353" y1="26" x2="367.1764705882353" y2="236" class="lcx-ch-grid"/><text x="367.1764705882353" y="250" class="lcx-ch-axis" text-anchor="middle">9×</text><line x1="130.0" y1="26" x2="130.0" y2="236" class="lcx-ch-zero"/><text x="0" y="49" class="lcx-ch-label">SWE-bench Verified</text><line x1="195.2" y1="46" x2="299.0" y2="46" class="lcx-ch-range"/><line x1="195.2" y1="43" x2="195.2" y2="49" class="lcx-ch-cap"/><line x1="299.0" y1="43" x2="299.0" y2="49" class="lcx-ch-cap"/><circle cx="299.0" cy="46" r="2.5" class="lcx-ch-dot"/><text x="302.98823529411766" y="48.3" class="lcx-ch-value">6.7×</text><line x1="189.3" y1="56" x2="221.9" y2="56" class="lcx-ch-range2"/><line x1="189.3" y1="53" x2="189.3" y2="59" class="lcx-ch-cap2"/><line x1="221.9" y1="53" x2="221.9" y2="59" class="lcx-ch-cap2"/><circle cx="221.9" cy="56" r="2.3" class="lcx-ch-dot2"/><text x="225.90588235294115" y="58.2" class="lcx-ch-value2">4.1×</text><text x="0" y="83" class="lcx-ch-label">Terminal-Bench 2.1</text><line x1="165.6" y1="80" x2="245.6" y2="80" class="lcx-ch-range"/><line x1="165.6" y1="77" x2="165.6" y2="83" class="lcx-ch-cap"/><line x1="245.6" y1="77" x2="245.6" y2="83" class="lcx-ch-cap"/><circle cx="245.6" cy="80" r="2.5" class="lcx-ch-dot"/><text x="249.6235294117647" y="82.3" class="lcx-ch-value">4.9×</text><line x1="171.5" y1="90" x2="218.9" y2="90" class="lcx-ch-range2"/><line x1="171.5" y1="87" x2="171.5" y2="93" class="lcx-ch-cap2"/><line x1="218.9" y1="87" x2="218.9" y2="93" class="lcx-ch-cap2"/><circle cx="218.9" cy="90" r="2.3" class="lcx-ch-dot2"/><text x="222.94117647058823" y="92.2" class="lcx-ch-value2">4.0×</text><text x="0" y="117" class="lcx-ch-label">SWE-bench Multilingual</text><line x1="210.0" y1="114" x2="361.2" y2="114" class="lcx-ch-range"/><line x1="210.0" y1="111" x2="210.0" y2="117" class="lcx-ch-cap"/><line x1="361.2" y1="111" x2="361.2" y2="117" class="lcx-ch-cap"/><circle cx="361.2" cy="114" r="2.5" class="lcx-ch-dot"/><text x="365.2470588235294" y="116.3" class="lcx-ch-value">8.8×</text><line x1="189.3" y1="124" x2="204.1" y2="124" class="lcx-ch-range2"/><line x1="189.3" y1="121" x2="189.3" y2="127" class="lcx-ch-cap2"/><line x1="204.1" y1="121" x2="204.1" y2="127" class="lcx-ch-cap2"/><circle cx="204.1" cy="124" r="2.3" class="lcx-ch-dot2"/><text x="208.11764705882354" y="126.2" class="lcx-ch-value2">3.5×</text><text x="0" y="151" class="lcx-ch-label">FRAMES</text><line x1="218.9" y1="148" x2="328.6" y2="148" class="lcx-ch-range"/><line x1="218.9" y1="145" x2="218.9" y2="151" class="lcx-ch-cap"/><line x1="328.6" y1="145" x2="328.6" y2="151" class="lcx-ch-cap"/><circle cx="328.6" cy="148" r="2.5" class="lcx-ch-dot"/><text x="332.63529411764705" y="150.3" class="lcx-ch-value">7.7×</text><line x1="183.4" y1="158" x2="213.0" y2="158" class="lcx-ch-range2"/><line x1="183.4" y1="155" x2="183.4" y2="161" class="lcx-ch-cap2"/><line x1="213.0" y1="155" x2="213.0" y2="161" class="lcx-ch-cap2"/><circle cx="213.0" cy="158" r="2.3" class="lcx-ch-dot2"/><text x="217.01176470588234" y="160.2" class="lcx-ch-value2">3.8×</text><text x="0" y="185" class="lcx-ch-label">BFCLv3</text><line x1="218.9" y1="182" x2="251.6" y2="182" class="lcx-ch-range"/><line x1="218.9" y1="179" x2="218.9" y2="185" class="lcx-ch-cap"/><line x1="251.6" y1="179" x2="251.6" y2="185" class="lcx-ch-cap"/><circle cx="251.6" cy="182" r="2.5" class="lcx-ch-dot"/><text x="255.55294117647057" y="184.3" class="lcx-ch-value">5.1×</text><line x1="221.9" y1="192" x2="248.6" y2="192" class="lcx-ch-range2"/><line x1="221.9" y1="189" x2="221.9" y2="195" class="lcx-ch-cap2"/><line x1="248.6" y1="189" x2="248.6" y2="195" class="lcx-ch-cap2"/><circle cx="248.6" cy="192" r="2.3" class="lcx-ch-dot2"/><text x="252.58823529411765" y="194.2" class="lcx-ch-value2">5.0×</text><text x="0" y="219" class="lcx-ch-label">τ²-bench</text><line x1="242.7" y1="216" x2="260.4" y2="216" class="lcx-ch-range"/><line x1="242.7" y1="213" x2="242.7" y2="219" class="lcx-ch-cap"/><line x1="260.4" y1="213" x2="260.4" y2="219" class="lcx-ch-cap"/><circle cx="260.4" cy="216" r="2.5" class="lcx-ch-dot"/><text x="264.44705882352946" y="218.3" class="lcx-ch-value">5.4×</text><line x1="210.0" y1="226" x2="216.0" y2="226" class="lcx-ch-range2"/><line x1="210.0" y1="223" x2="210.0" y2="229" class="lcx-ch-cap2"/><line x1="216.0" y1="223" x2="216.0" y2="229" class="lcx-ch-cap2"/><circle cx="216.0" cy="226" r="2.3" class="lcx-ch-dot2"/><text x="219.9764705882353" y="228.2" class="lcx-ch-value2">3.9×</text><line x1="130" y1="258" x2="144" y2="258" class="lcx-ch-range"/><text x="149" y="260.3" class="lcx-ch-note">Opus 4.5</text><line x1="208" y1="258" x2="222" y2="258" class="lcx-ch-range2"/><text x="227" y="260.3" class="lcx-ch-note">GPT 5.6 Sol</text><text x="436" y="260.3" class="lcx-ch-note" text-anchor="end">圆点＝最高倍数</text><text x="130" y="288" class="lcx-ch-note">长条涵盖观测到的最低到最高设置；圆点标出最大值。</text></svg>
    <div class="lcx-src">重绘自图 5 · arXiv:2611.05306</div>
  </div>
</div>

逐项基准测试的表比范围更有信息量，因为例外会丛集在可预测的地方。

<div class="lcx-table-card">
  <div class="lcx-table-head">
    <div class="lcx-table-tag"><svg class="lcx-ico lcx-ico-xs" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#lcx-i-chart-no-axes-column"></use></svg>长流程 · 准确率与最佳设置</div>
    <div class="lcx-table-title">压缩在哪里帮上忙，又在哪里付出一点代价。</div>
    <p class="lcx-table-sub">每个基准测试最佳的 EoCC 准确率，以及产生该结果的设置。Δ 是相对全历史基线。最紧的设置不一定最好。</p>
  </div>
  <div class="lcx-table-scroll">
    <table class="lcx-results">
      <thead><tr><th>基准测试</th><th class="num">Opus 基线</th><th class="num">Opus 最佳</th><th class="num">Δ</th><th>最佳设置</th><th class="num">GPT 基线</th><th class="num">GPT 最佳</th><th class="num">Δ</th><th>最佳设置</th></tr></thead>
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
  <div class="lcx-table-foot">受测设置中最佳的 EoCC 准确率。数据来源：arXiv:2611.05306，附录 C，表 3–8。</div>
</div>

有三个模式值得命名。

**第一，程序与终端工作的增益最大。** Opus 在 SWE-bench Verified 上 +4.8 个百分点，Terminal-Bench +5.6，多语言组 +1.7。这不是单纯信息流失的故事会预测的结果。一个合理的解释：压缩强迫模型写下计划与当前状态，这比一大坨 30K token 的 shell 输出更像有效的工作记忆。论文没有证明这个机制，但模式与它一致。

**第二，FRAMES 是压缩稳定吃亏的那个基准测试。** 它也是代理从固定维基百科语料检索、并在许多跳之间累积证据的基准测试。当任务是*跨检索文件整合证据*时，摘要漏掉错误的那一句就很贵。损失不大（Opus 1.3–3.7 个百分点，GPT 1.5–3.3），但很系统性。

**第三，最佳设置往往不是最紧的。** SWE-bench Verified 对 Opus 在 24K/18K 达到峰值，不是 16K/12K。Terminal-Bench 在 32K/24K 达到峰值。关系不是单调的：压缩太多，代理会失去线索；压缩太少，它得为用不到的 token 付费。实务意涵是：**预算是超参数，不是道德立场。**

<div class="lcx-pull">
  <div class="lcx-pull-mark">“</div>
  <p>结果不是「越短越好」。而是「最佳值比默认短得多，而且曲线平坦到你可以找到它」。</p>
</div>

### 论文认真看待的反驳

对「你永远不需要历史」有一个明显的反例：需要精确回忆任意序列的任务。论文提出一个思想实验。给代理一个丢硬币工具。工具回报每次结果。之后再问代理第 *i* 次的结果。在固定压缩预算下，某些压缩终究会丢掉某些结果；当代理需要那个被丢掉的结果，它就失败。失败的原因是压缩，不是模型。

论文的回应很细致，我认为也正确：**保留完整逐字稿，让它可以被搜寻。** 代理的对话历史变成另一种长输入。如果它需要第 37 次丢硬币的结果，它可以 `grep` 文件库。信息不必*在上下文中*，它必须*可取得*。这个动作把反例从一项驳倒，变成一个设计要求：**没有文件库的压缩是有损的；有文件库的压缩是缓存。**

这和数据库做的事一样。buffer pool 很小，磁碟很大，索引决定要带什么进来。论文主张代理记忆应该更像数据库，而不是一段不断长大的聊天纪录。

<div class="lcx-kicker"><svg class="lcx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#lcx-i-file-text"></use></svg>结果 2 · 长输入</div>

## 选择性阅读胜过贴上——有时胜过 40 个百分点

第二个研究问题是：长输入到底需不需要被完整吞进去？基线把整份文件放进 prompt。压缩外壳拿到一个文件系统与一组 Bash 工具。两者使用同一个模型、同一个任务。

结果完全不在同一个量级。

<figure class="fig">
  <img src="/images/long-context/fig06-long-input.webp" alt="七个面板的长输入基准测试结果，显示代理选择性阅读文件时，准确率最高增加 40 个百分点，成本节省 4.4× 到 233×" width="1800" height="1912" loading="lazy" />
  <figcaption><b>图 6（论文原图）</b>——长输入结果。每个面板上排：相对全输入基线的准确率变化。下排：估计成本节省。增益在 needle 型基准测试上最大，但连 LOONG 与 AA-LCR 都进步。该注意的是：x 轴是总上下文上限，不是文件大小——代理的工作上下文有上限，来源文件却和原本一样大。数据来源：<a href="https://arxiv.org/abs/2611.05306">Belcak et al., arXiv:2611.05306</a> · <a href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a></figcaption>
</figure>

整体数字几乎令人难以置信，直到你看见机制：

- **准确率范围：** Opus 4.5 **−0.4 到 +40.0 个百分点**；GPT 5.6 Sol **+1.0 到 +30.9 个百分点**。十四个模型–基准测试配对中只有一个是负的，而且是 −0.4。
- **成本：** Opus 4.5 **6.5×–54.6×**，GPT 5.6 Sol **4.4×–233.3×**。
- **压缩很少发生：** 在数个基准测试上，压缩次数的中位数是**零**。选择性阅读做了几乎所有的工作；压缩是备援，不是主戏。

<div class="chamfer-card-wrapper lcx-card">
  <div class="chamfer-card-content">
    <div class="card-tag lcx-tag"><svg class="lcx-ico lcx-ico-xs" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#lcx-i-trending-down"></use></svg> EXHIBIT // 04 · 长输入变化</div>
    <div class="lcx-card-title">选择性阅读通常会赢。</div>
    <p class="lcx-card-sub">相对全输入基线的准确率变化，单位为百分点。长条落在零右侧，代表把文件存进文件系统、用 Bash 读取，胜过把一切贴进 prompt。</p>
    <svg class="lcx-chart" viewBox="0 0 460 310" role="img" aria-label="七个长输入基准测试与两个模型的准确率变化" xmlns="http://www.w3.org/2000/svg"><text x="126" y="10" class="lcx-ch-axis" text-anchor="start">准确率变化 VS. 全输入基线（百分点）</text><line x1="146.8" y1="26" x2="146.8" y2="236" class="lcx-ch-grid"/><text x="146.8" y="250" class="lcx-ch-axis" text-anchor="middle">+0</text><line x1="216.13333333333333" y1="26" x2="216.13333333333333" y2="236" class="lcx-ch-grid"/><text x="216.13333333333333" y="250" class="lcx-ch-axis" text-anchor="middle">+10</text><line x1="285.4666666666667" y1="26" x2="285.4666666666667" y2="236" class="lcx-ch-grid"/><text x="285.4666666666667" y="250" class="lcx-ch-axis" text-anchor="middle">+20</text><line x1="354.8" y1="26" x2="354.8" y2="236" class="lcx-ch-grid"/><text x="354.8" y="250" class="lcx-ch-axis" text-anchor="middle">+30</text><line x1="424.1333333333333" y1="26" x2="424.1333333333333" y2="236" class="lcx-ch-grid"/><text x="424.1333333333333" y="250" class="lcx-ch-axis" text-anchor="middle">+40</text><line x1="146.8" y1="26" x2="146.8" y2="236" class="lcx-ch-zero"/><text x="0" y="47" class="lcx-ch-label">LongBench v2</text><rect x="144.0" y="38" width="2.8" height="5" class="lcx-ch-bar"/><text x="140.02666666666667" y="42.4" class="lcx-ch-value" text-anchor="end">-0.4</text><rect x="146.8" y="48" width="12.5" height="5" class="lcx-ch-bar2"/><text x="163.28" y="52.4" class="lcx-ch-value2" text-anchor="start">+1.8</text><text x="0" y="77" class="lcx-ch-label">LOONG</text><rect x="146.8" y="68" width="63.8" height="5" class="lcx-ch-bar"/><text x="214.58666666666664" y="72.4" class="lcx-ch-value" text-anchor="start">+9.2</text><rect x="146.8" y="78" width="23.6" height="5" class="lcx-ch-bar2"/><text x="174.37333333333333" y="82.4" class="lcx-ch-value2" text-anchor="start">+3.4</text><text x="0" y="107" class="lcx-ch-label">AA-LCR</text><rect x="146.8" y="98" width="131.7" height="5" class="lcx-ch-bar"/><text x="282.5333333333333" y="102.4" class="lcx-ch-value" text-anchor="start">+19.0</text><rect x="146.8" y="108" width="6.9" height="5" class="lcx-ch-bar2"/><text x="157.73333333333335" y="112.4" class="lcx-ch-value2" text-anchor="start">+1.0</text><text x="0" y="137" class="lcx-ch-label">NIAH</text><rect x="146.8" y="128" width="277.3" height="5" class="lcx-ch-bar"/><text x="428.1333333333333" y="132.4" class="lcx-ch-value" text-anchor="start">+40.0</text><rect x="146.8" y="138" width="138.7" height="5" class="lcx-ch-bar2"/><text x="289.4666666666667" y="142.4" class="lcx-ch-value2" text-anchor="start">+20.0</text><text x="0" y="167" class="lcx-ch-label">RULER</text><rect x="146.8" y="158" width="230.2" height="5" class="lcx-ch-bar"/><text x="380.9866666666667" y="162.4" class="lcx-ch-value" text-anchor="start">+33.2</text><rect x="146.8" y="168" width="214.2" height="5" class="lcx-ch-bar2"/><text x="365.03999999999996" y="172.4" class="lcx-ch-value2" text-anchor="start">+30.9</text><text x="0" y="197" class="lcx-ch-label">Counting-Stars</text><rect x="146.8" y="188" width="111.6" height="5" class="lcx-ch-bar"/><text x="262.4266666666667" y="192.4" class="lcx-ch-value" text-anchor="start">+16.1</text><rect x="146.8" y="198" width="31.9" height="5" class="lcx-ch-bar2"/><text x="182.69333333333333" y="202.4" class="lcx-ch-value2" text-anchor="start">+4.6</text><text x="0" y="227" class="lcx-ch-label">BABILong</text><rect x="146.8" y="218" width="172.6" height="5" class="lcx-ch-bar"/><text x="323.44" y="222.4" class="lcx-ch-value" text-anchor="start">+24.9</text><rect x="146.8" y="228" width="161.5" height="5" class="lcx-ch-bar2"/><text x="312.3466666666667" y="232.4" class="lcx-ch-value2" text-anchor="start">+23.3</text><rect x="126" y="266" width="9" height="5" class="lcx-ch-bar"/><text x="140" y="271" class="lcx-ch-note">Opus 4.5</text><rect x="204" y="266" width="9" height="5" class="lcx-ch-bar2"/><text x="218" y="271" class="lcx-ch-note">GPT 5.6 Sol</text><text x="458" y="271" class="lcx-ch-note" text-anchor="end">最佳压缩设置</text><text x="126" y="298" class="lcx-ch-note">长条落在零右侧，代表选择性阅读胜过贴上整份文件。</text></svg>
    <div class="lcx-src">重绘自图 6 与表 11–17</div>
  </div>
</div>

逐项基准测试的表把模式具体化。

<div class="lcx-table-card">
  <div class="lcx-table-head">
    <div class="lcx-table-tag"><svg class="lcx-ico lcx-ico-xs" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#lcx-i-chart-no-axes-column"></use></svg>长输入 · 基线 VS. 选择性阅读</div>
    <div class="lcx-table-title">七个基准测试，两个模型，一个模式。</div>
    <p class="lcx-table-sub">最佳压缩准确率相对全输入基线。「Perfect」是该基准测试有回报时的完全答对率；「mean」是平均分数。成本倍数是论文在图示设置下的估计。</p>
  </div>
  <div class="lcx-table-scroll">
    <table class="lcx-results lcx-wide">
      <thead><tr><th>基准测试</th><th class="num">Opus 基线</th><th class="num">Opus 压缩</th><th class="num">Δ</th><th class="num">成本</th><th class="num">GPT 基线</th><th class="num">GPT 压缩</th><th class="num">Δ</th><th class="num">成本</th></tr></thead>
      <tbody>
        <tr><td>LongBench v2</td><td class="num">68.0</td><td class="num">67.6</td><td class="num neg">−0.4</td><td class="num">7.4×</td><td class="num">70.8</td><td class="num strong">72.6</td><td class="num pos">+1.8</td><td class="num">4.4×</td></tr>
        <tr><td>LOONG <span class="lcx-cell-note">平均／完全答对</span></td><td class="num">70.1 / 38.9</td><td class="num strong">79.3 / 53.4</td><td class="num pos">+9.2 / +14.5</td><td class="num">13.6×</td><td class="num">79.3 / 44.4</td><td class="num strong">82.7 / 51.9</td><td class="num pos">+3.4 / +7.5</td><td class="num">12.9×</td></tr>
        <tr><td>AA-LCR</td><td class="num">65.0</td><td class="num strong">84.0</td><td class="num pos">+19.0</td><td class="num">9.8×</td><td class="num">82.0</td><td class="num strong">83.0</td><td class="num pos">+1.0</td><td class="num">16.2×</td></tr>
        <tr><td>NIAH</td><td class="num">60.0</td><td class="num strong">100.0</td><td class="num pos">+40.0</td><td class="num">54.6×</td><td class="num">80.0</td><td class="num strong">100.0</td><td class="num pos">+20.0</td><td class="num">233.3×</td></tr>
        <tr><td>RULER <span class="lcx-cell-note">召回</span></td><td class="num">62.5</td><td class="num strong">95.7</td><td class="num pos">+33.2</td><td class="num">42.8×</td><td class="num">65.5</td><td class="num strong">96.4</td><td class="num pos">+30.9</td><td class="num">80.5×</td></tr>
        <tr><td>Counting-Stars <span class="lcx-cell-note">完全答对</span></td><td class="num">65.1</td><td class="num strong">81.2</td><td class="num pos">+16.1</td><td class="num">25.9×</td><td class="num">76.6</td><td class="num strong">81.2</td><td class="num pos">+4.6</td><td class="num">40.7×</td></tr>
        <tr><td>BABILong</td><td class="num">67.1</td><td class="num strong">92.0</td><td class="num pos">+24.9</td><td class="num">31.5×</td><td class="num">70.7</td><td class="num strong">94.0</td><td class="num pos">+23.3</td><td class="num">88.0×</td></tr>
      </tbody>
    </table>
  </div>
  <div class="lcx-table-foot">每个基准测试最佳的压缩结果，附论文的估计优化零售成本倍数。数据来源：附录 F，表 11–17，以及图 6。</div>
</div>

为什么选择性阅读会*胜过*贴上？论文的解释不是模型在小型上下文里比较聪明。而是**检索是一个过滤步骤**。用 `grep` 找一个名字或片语，返回几行；模型再读取它们周围的窗口。无关的 99% 从不进入上下文，所以无法让模型分心，也无法稀释注意力。贴上一切，等于要模型在内部做过滤，用有限的注意力预算，而且没有明确的索引。

论文也直接回报长度关系。图 7 与图 8 以对数 x 轴画出总对话长度对文件长度。如果代理是按比例吞文件，点会贴着虚线 `y = x`。它们没有；对话长度停留在一个宽频带内，文件长度却横跨好几个数量级。

<figure class="fig">
  <img src="/images/long-context/fig07-longbench-scatter.webp" alt="LongBench v2 的对话长度对文件长度散布图，x 轴为对数；大多数点落在远低于等长线的水平带内" width="1600" height="1032" loading="lazy" />
  <figcaption><b>图 7（论文原图）</b>——LongBench v2，Opus 4.5 以 16K/12K 压缩。x 轴是对数，y 轴是线性；虚线是 `y = x`。该注意的是：文件从 10K 长到超过 1M token，对话大致维持在有界范围。代理不是按比例读得更多；它是搜得更好。数据来源：<a href="https://arxiv.org/abs/2611.05306">Belcak et al., arXiv:2611.05306</a> · <a href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a></figcaption>
</figure>

<figure class="fig">
  <img src="/images/long-context/fig08-loong-scatter.webp" alt="LOONG 的对话长度对文件长度散布图；四个文件大小分组都维持在约 20K 到 100K 对话 token 的带状区域，低于等长线" width="1600" height="1032" loading="lazy" />
  <figcaption><b>图 8（论文原图）</b>——LOONG，Opus 4.5 以 48K/40K 压缩，1,600 个问题。四个文件大小分组都呈现同样的有界对话模式。该注意的是：垂直方向的离散来自任务难度，不是文件长度。一份 300K token 的文件，不会强迫产生 300K token 的对话。数据来源：<a href="https://arxiv.org/abs/2611.05306">Belcak et al., arXiv:2611.05306</a> · <a href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a></figcaption>
</figure>

压缩次数中位数接近零，就是线索。在 NIAH 上，两个模型完全不压缩；在 Counting-Stars 上，两者都不压缩；在 RULER 上，中位数是零；在 BABILong 上，GPT 从不压缩，Opus 每个任务最多压缩一次。代理找到证据、读一个小窗口、回答。长输入很长，但*工作集*很小。

<div class="lcx-callout lcx-callout-warn">
  <svg class="lcx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#lcx-i-triangle-alert"></use></svg>
  <div><b>不要把 needle 结果读过头。</b> NIAH 与 Counting-Stars 有词汇抓手：名字、数字、有辨识度的片语。`grep` 找得到。论文坦白承认，这让 needle 基准测试比现实的多文件推理容易。更强的证据是 LOONG 与 AA-LCR：代理必须跨文件定位、比较、整合证据——而且仍然进步。</div>
</div>

论文还提出一个容易漏掉的根本论点：**needle-in-a-haystack 基准测试假设长上下文任务存在。** 如果一个任务之所以产生长上下文，唯一原因是有人把干草堆贴进了 prompt，那这个基准测试量的是自找的限制。论文的结果显示，这个限制可以移除，而 needle 不会掉。

<div class="lcx-kicker"><svg class="lcx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#lcx-i-zap"></use></svg>结果 3 · 一个动作</div>

## 最激进的版本：每个上下文一个动作

第三个问题让我坐直了。如果压缩有效，你可以多常做？每段对话一次？每个任务一次？论文把它推到极限：**每个动作之后都压缩。** 每段对话包含任务、目前的语义状态，以及恰好一个 Bash 动作。然后对话被丢掉，下一段从更新后的状态开始。

这不是「更积极地摘要历史」。这是不同的执行模型：模型从不看见自己先前的消息，只看见它自己产出的书面状态。状态是动作之间唯一的桥梁。

<div class="lcx-table-card">
  <div class="lcx-table-head">
    <div class="lcx-table-tag"><svg class="lcx-ico lcx-ico-xs" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#lcx-i-chart-no-axes-column"></use></svg>表 2，重绘 · SAC VS. FHA VS. EoCC</div>
    <div class="lcx-table-title">每个上下文一个动作，几乎没有准确率代价。</div>
    <p class="lcx-table-sub">峰值上下文长度是每任务的中位数／最大值，单位为千 token。最佳 EoCC 栏使用括号中的设置。</p>
  </div>
  <div class="lcx-table-scroll">
    <table class="lcx-results">
      <thead><tr><th>模型 · 基准测试</th><th class="num">FHA 准确率</th><th class="num">最佳 EoCC</th><th class="num">SAC 准确率</th><th class="num">FHA 峰值</th><th class="num">最佳 EoCC 峰值</th><th class="num">SAC 峰值</th></tr></thead>
      <tbody>
        <tr><td>Opus 4.5 · SWE-bench Verified</td><td class="num">70.0</td><td class="num">74.8 <span class="lcx-cell-note">(24K/18K)</span></td><td class="num strong">70.2</td><td class="num">32 / 200</td><td class="num">19 / 22</td><td class="num strong">8 / 16</td></tr>
        <tr><td>Opus 4.5 · Terminal-Bench</td><td class="num">47.2</td><td class="num">52.8 <span class="lcx-cell-note">(32K/24K)</span></td><td class="num strong">51.8</td><td class="num">27 / 130</td><td class="num">24 / 31</td><td class="num strong">9 / 19</td></tr>
        <tr><td>GPT 5.6 Sol · SWE-bench Verified</td><td class="num">84.4</td><td class="num">88.8 <span class="lcx-cell-note">(48K/36K)</span></td><td class="num">82.4</td><td class="num">18 / 173</td><td class="num">22 / 35</td><td class="num strong">7 / 15</td></tr>
        <tr><td>GPT 5.6 Sol · Terminal-Bench</td><td class="num">87.6</td><td class="num">88.8 <span class="lcx-cell-note">(48K/36K)</span></td><td class="num">84.3</td><td class="num">17 / 133</td><td class="num">23 / 40</td><td class="num strong">8 / 37</td></tr>
      </tbody>
    </table>
  </div>
  <div class="lcx-table-foot">SAC 在两个基准测试上都保住或改善 Opus 4.5 的基线；GPT 5.6 Sol 则掉 2.0 与 3.3 个百分点。每一列的峰值上下文都大幅收缩。数据来源：arXiv:2611.05306，表 2。</div>
</div>

<div class="chamfer-card-wrapper lcx-card">
  <div class="chamfer-card-content">
    <div class="card-tag lcx-tag"><svg class="lcx-ico lcx-ico-xs" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#lcx-i-zap"></use></svg> EXHIBIT // 05 · 单动作结果</div>
    <div class="lcx-card-title">峰值上下文崩塌，准确率大致不动。</div>
    <p class="lcx-card-sub">每任务峰值即时上下文，在全历史基线（浅色）与单动作压缩（深色）之下。圆点是中位数；长条延伸到最大值。</p>
    <svg class="lcx-chart" viewBox="0 0 440 250" role="img" aria-label="全历史与单动作压缩下的峰值上下文长度" xmlns="http://www.w3.org/2000/svg"><text x="132" y="10" class="lcx-ch-axis" text-anchor="start">每任务峰值即时上下文（K token）</text><line x1="132.0" y1="28" x2="132.0" y2="196" class="lcx-ch-grid"/><text x="132.0" y="210" class="lcx-ch-axis" text-anchor="middle">0K</text><line x1="192.95238095238096" y1="28" x2="192.95238095238096" y2="196" class="lcx-ch-grid"/><text x="192.95238095238096" y="210" class="lcx-ch-axis" text-anchor="middle">50K</text><line x1="253.9047619047619" y1="28" x2="253.9047619047619" y2="196" class="lcx-ch-grid"/><text x="253.9047619047619" y="210" class="lcx-ch-axis" text-anchor="middle">100K</text><line x1="314.8571428571429" y1="28" x2="314.8571428571429" y2="196" class="lcx-ch-grid"/><text x="314.8571428571429" y="210" class="lcx-ch-axis" text-anchor="middle">150K</text><line x1="375.8095238095238" y1="28" x2="375.8095238095238" y2="196" class="lcx-ch-grid"/><text x="375.8095238095238" y="210" class="lcx-ch-axis" text-anchor="middle">200K</text><line x1="132.0" y1="28" x2="132.0" y2="196" class="lcx-ch-zero"/><text x="0" y="50" class="lcx-ch-label">Opus · SWE-bench Verified</text><line x1="171.0" y1="46" x2="375.8" y2="46" class="lcx-ch-range"/><line x1="171.0" y1="43" x2="171.0" y2="49" class="lcx-ch-cap"/><line x1="375.8" y1="43" x2="375.8" y2="49" class="lcx-ch-cap"/><circle cx="171.0" cy="46" r="2.5" class="lcx-ch-dot2"/><text x="379.8095238095238" y="48.2" class="lcx-ch-note">200K</text><line x1="141.8" y1="57" x2="151.5" y2="57" class="lcx-ch-range-strong"/><line x1="141.8" y1="54" x2="141.8" y2="60" class="lcx-ch-cap-strong"/><line x1="151.5" y1="54" x2="151.5" y2="60" class="lcx-ch-cap-strong"/><circle cx="141.8" cy="57" r="2.8" class="lcx-ch-dot"/><text x="155.5047619047619" y="59.2" class="lcx-ch-value">16K</text><text x="0" y="88" class="lcx-ch-label">Opus · Terminal-Bench</text><line x1="164.9" y1="84" x2="290.5" y2="84" class="lcx-ch-range"/><line x1="164.9" y1="81" x2="164.9" y2="87" class="lcx-ch-cap"/><line x1="290.5" y1="81" x2="290.5" y2="87" class="lcx-ch-cap"/><circle cx="164.9" cy="84" r="2.5" class="lcx-ch-dot2"/><text x="294.4761904761905" y="86.2" class="lcx-ch-note">130K</text><line x1="143.0" y1="95" x2="155.2" y2="95" class="lcx-ch-range-strong"/><line x1="143.0" y1="92" x2="143.0" y2="98" class="lcx-ch-cap-strong"/><line x1="155.2" y1="92" x2="155.2" y2="98" class="lcx-ch-cap-strong"/><circle cx="143.0" cy="95" r="2.8" class="lcx-ch-dot"/><text x="159.16190476190476" y="97.2" class="lcx-ch-value">19K</text><text x="0" y="126" class="lcx-ch-label">GPT · SWE-bench Verified</text><line x1="153.9" y1="122" x2="342.9" y2="122" class="lcx-ch-range"/><line x1="153.9" y1="119" x2="153.9" y2="125" class="lcx-ch-cap"/><line x1="342.9" y1="119" x2="342.9" y2="125" class="lcx-ch-cap"/><circle cx="153.9" cy="122" r="2.5" class="lcx-ch-dot2"/><text x="346.8952380952381" y="124.2" class="lcx-ch-note">173K</text><line x1="140.5" y1="133" x2="150.3" y2="133" class="lcx-ch-range-strong"/><line x1="140.5" y1="130" x2="140.5" y2="136" class="lcx-ch-cap-strong"/><line x1="150.3" y1="130" x2="150.3" y2="136" class="lcx-ch-cap-strong"/><circle cx="140.5" cy="133" r="2.8" class="lcx-ch-dot"/><text x="154.28571428571428" y="135.2" class="lcx-ch-value">15K</text><text x="0" y="164" class="lcx-ch-label">GPT · Terminal-Bench</text><line x1="152.7" y1="160" x2="294.1" y2="160" class="lcx-ch-range"/><line x1="152.7" y1="157" x2="152.7" y2="163" class="lcx-ch-cap"/><line x1="294.1" y1="157" x2="294.1" y2="163" class="lcx-ch-cap"/><circle cx="152.7" cy="160" r="2.5" class="lcx-ch-dot2"/><text x="298.1333333333333" y="162.2" class="lcx-ch-note">133K</text><line x1="141.8" y1="171" x2="177.1" y2="171" class="lcx-ch-range-strong"/><line x1="141.8" y1="168" x2="141.8" y2="174" class="lcx-ch-cap-strong"/><line x1="177.1" y1="168" x2="177.1" y2="174" class="lcx-ch-cap-strong"/><circle cx="141.8" cy="171" r="2.8" class="lcx-ch-dot"/><text x="181.10476190476192" y="173.2" class="lcx-ch-value">37K</text><line x1="132" y1="220" x2="145" y2="220" class="lcx-ch-range"/><circle cx="138" cy="220" r="2.4" class="lcx-ch-dot2"/><text x="150" y="222.3" class="lcx-ch-note">FHA 基线</text><line x1="236" y1="220" x2="249" y2="220" class="lcx-ch-range-strong"/><circle cx="242" cy="220" r="2.6" class="lcx-ch-dot"/><text x="254" y="222.3" class="lcx-ch-note">SAC</text><text x="132" y="242" class="lcx-ch-note">长条＝每任务峰值上下文的中位数到最大值；圆点＝中位数。</text></svg>
    <div class="lcx-src">重绘自表 2 · arXiv:2611.05306</div>
  </div>
</div>

这个分叉很有启发。Opus 4.5 在 SAC 下于 SWE-bench Verified **略好**（70.2 对 70.0），在 Terminal-Bench **好 4.6 个百分点**（51.8 对 47.2）。GPT 5.6 Sol 在 SWE-bench Verified **差 2.0 个百分点**，在 Terminal-Bench **差 3.3 个百分点**。两个模型都还能工作，都没有崩溃。峰值上下文最大值从 130K–200K 降到 15K–37K，中位数降到 7K–9K。

为什么 Opus 少了上下文反而*更好*？论文没有直接回答，但机制合理，也与长流程结果一致。单动作对话被迫从一份书面状态开始，状态会说：任务是什么、我做过什么、我下一步打算做什么、哪些产物重要。这是一个**更好的 prompt**，胜过一份 30K token、相关事实埋在第四页的逐字稿。状态是压缩，但也是一种策展。有时候，策展胜过完整。

我一直回想到的类比是**交班笔记**。医院护理师在下班时，不会为下一班重播一整天的每一分钟。他们写一份结构化笔记：病人状态、有什么变化、什么待办、该注意什么。笔记是有损的。它也比录影更有用，因为它是*为下一班人的决策而挑选的*。全历史模型是录影；单动作压缩是交班笔记。

GPT 的结果是另一边的砝码。一个被后训练成对长历史做注意力的模型，在历史消失时可能掉得更多，尤其当它的工具使用策略依赖逐字稿里近期的范例。论文自己的框架支持这点：SAC 是**后训练目标**——也就是预训练之后、教模型遵循指令与使用工具的那个阶段——不只是外壳技巧。你可以把压缩硬装到任何模型上；模型擅不擅长*书写与阅读状态*，是另一种能力。

<div class="lcx-pull">
  <div class="lcx-pull-mark">“</div>
  <p>SAC 不是 prompt 小把戏。它是一个赌注：赌模型能用自然语言维持状态——而这个赌注在不同模型上回收得不均匀。</p>
</div>

<div class="lcx-kicker"><svg class="lcx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#lcx-i-brain"></use></svg>概念</div>

## 语义状态空间模型

论文的概念贡献，是替 SAC 在做的事取一个名字：**语义状态空间模型（SSSM）**。定义有五个部分。一个 SSSM 被后训练来：

1. **理解**一段自然语言描述的对话状态。
2. **推理**下一个动作，或手上的任务。
3. **执行**一个动作。
4. **登记**结果。
5. **更新**自然语言状态，把推理结论、动作决策与结果写进去，形式要能让*另一个推论实例*接续对话。

最后一句是重点。状态不是层与层之间传递的隐藏向量。它是文字，由模型写下，下一个实例读得懂，人类也稽核得到。这让它成为**语义**的，而不是神经的。

<div class="lcx-compare">
  <div class="lcx-compare-col">
    <div class="lcx-compare-head"><svg class="lcx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#lcx-i-cpu"></use></svg>状态空间模型</div>
    <p>在 token 生成之间更新的黑箱神经状态。有效率、连续、难以检视。状态是内部张量。</p>
    <div class="lcx-compare-foot">不透明 · 快 · 学习得来</div>
  </div>
  <div class="lcx-compare-col">
    <div class="lcx-compare-head"><svg class="lcx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#lcx-i-notebook-pen"></use></svg>语义状态空间模型</div>
    <p>在回合之间更新的自然语言状态。每次交接较慢，但可检视、可编辑、可跨模型实例携带、可调试。</p>
    <div class="lcx-compare-foot">可解释 · 可携 · 可稽核</div>
  </div>
</div>

SAC 那一节的交班笔记，在这里也成立：SSSM 就是一个被训练来书写与阅读那份笔记的模型。

论文主张，SSSM 在训练上可能比全历史模型更**数据有效率**，因为模型不必学会该对长逐字稿的哪些片段做注意力。它只需要学会如何维持状态。这是假设，不是结果，但很合理：对长上下文做注意力是困难、吃数据的技能；状态维护是范围较窄、训练信号较清楚的技能。

论文结尾的修辞问句很尖锐：**如果 SSSM 能追平全历史模型，那为什么还要训练全历史模型？** 诚实的答案是：我们还不知道。实验显示压缩在这些基准测试上足够；它们没有显示一个从头训练来维持状态的模型，会比一个训练来做注意力的模型更好。但举证责任已经移位。

<div class="lcx-kicker"><svg class="lcx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#lcx-i-notebook-pen"></use></svg>配方</div>

## 一份好的压缩到底该包含什么

附录 A 是论文最实用的部分，却很容易被跳过。作者先试了显而易见的做法——把压缩当成摘要——发现效果不理想。摘要试图给输入里的每一样东西同等重量，还会过度强调代理轨迹中重复的片段。摘要告诉你发生了什么。好的压缩告诉下一个实例**接下来该做什么**。

在论文里每一种工作流程都有效的结构，有四种成分：

<div class="lcx-recipe">
  <div class="lcx-recipe-item">
    <div class="lcx-recipe-num">01</div>
    <div class="lcx-recipe-body"><div class="lcx-recipe-title">任务，逐字或近乎逐字</div><p>不要改写。确切的需求、限制与验收标准。改写任务，就是你弄丢关键那一句的方式。</p></div>
  </div>
  <div class="lcx-recipe-item">
    <div class="lcx-recipe-num">02</div>
    <div class="lcx-recipe-body"><div class="lcx-recipe-title">目前在做什么、意图与下一步</div><p>我现在在做什么？我原本打算下一步做什么？什么卡住了，为什么？这就是「交班」段落。</p></div>
  </div>
  <div class="lcx-recipe-item">
    <div class="lcx-recipe-num">03</div>
    <div class="lcx-recipe-body"><div class="lcx-recipe-title">与后续执行相关的产物</div><p>文件路径、diff、测试名称、错误消息、API 签名——下一个动作真正会碰到的东西。不是每一个产物；是承重的那些。</p></div>
  </div>
  <div class="lcx-recipe-item">
    <div class="lcx-recipe-num">04</div>
    <div class="lcx-recipe-body"><div class="lcx-recipe-title">计划、完成定义与指标</div><p>从任务拆解出的计划、完成条件的清单，以及其余证据放在哪里的指标。指标让文件库变得可用。</p></div>
  </div>
</div>

论文的原话值得引用：最好的压缩「不是执行历史的叙事，而是为后续执行仔细挑选的简报」。那是和摘要不同的目标函数。摘要优化覆盖率。简报优化**决策相关性**。

<div class="lcx-callout">
  <svg class="lcx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#lcx-i-scissors"></use></svg>
  <div><b>反模式。</b> 「代理探索了代码仓库、跑了测试、在 parser 里找到一个 bug，然后做了一些修改。」这是摘要。它没有文件名、没有失败的测试、没有下一步、没有完成定义。下一个实例会重做整段探索。好的压缩会说：「Parser bug 在 <code>src/parse.ts:184</code>；失败测试 <code>parse.spec.ts::handles CRLF</code>；修正偏移量计算；运行 <code>bun test parse</code>；不要动 lexer。」</div>
</div>

论文也指出，这个结构不限于软件工程。它被用在研究里的每一种工作流程：终端任务、网络研究、工具使用情境。共同点不是程序码，而是**后继者可以据以行动的状态**。

<div class="lcx-kicker"><svg class="lcx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#lcx-i-triangle-alert"></use></svg>哪里会坏</div>

## 例外是最有用的部分

论文对失败模式很诚实，而诚实的部分正是开发者该花注意力的地方。

### 开放权重模型不是一致地稳健

主要实验使用两个前沿闭源模型。附录 D 在五个开放权重（可下载、自行部署）的模型上重做长流程测试。落差很大。

<div class="chamfer-card-wrapper lcx-card">
  <div class="chamfer-card-content">
    <div class="card-tag lcx-tag"><svg class="lcx-ico lcx-ico-xs" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#lcx-i-triangle-alert"></use></svg> EXHIBIT // 06 · 开放权重的脆弱性</div>
    <div class="lcx-card-title">有一个模型掉下悬崖。</div>
    <p class="lcx-card-sub">五个开放权重（可下载、自行部署）的模型在四种上下文预算下的 SWE-bench Verified 分数。Qwen 3 Coder Next 在最紧的设置掉 49.4 个百分点；其余掉 3.6–13.4。</p>
    <svg class="lcx-chart" viewBox="0 0 440 300" role="img" aria-label="五个开放权重（可下载、自行部署）的模型在 SWE-bench Verified 上随上下文预算收紧的分组长条图" xmlns="http://www.w3.org/2000/svg"><text x="38" y="10" class="lcx-ch-axis" text-anchor="start">SWE-BENCH VERIFIED · 解决率（%）</text><line x1="38" y1="216.0" x2="424" y2="216.0" class="lcx-ch-grid"/><text x="33" y="218.2" class="lcx-ch-axis" text-anchor="end">0</text><line x1="38" y1="169.0" x2="424" y2="169.0" class="lcx-ch-grid"/><text x="33" y="171.2" class="lcx-ch-axis" text-anchor="end">20</text><line x1="38" y1="122.0" x2="424" y2="122.0" class="lcx-ch-grid"/><text x="33" y="124.2" class="lcx-ch-axis" text-anchor="end">40</text><line x1="38" y1="75.0" x2="424" y2="75.0" class="lcx-ch-grid"/><text x="33" y="77.2" class="lcx-ch-axis" text-anchor="end">60</text><line x1="38" y1="28.0" x2="424" y2="28.0" class="lcx-ch-grid"/><text x="33" y="30.2" class="lcx-ch-axis" text-anchor="end">80</text><rect x="53.0" y="54.8" width="10" height="161.2" class="lcx-ch-bar"/><rect x="65.4" y="52.9" width="10" height="163.1" class="lcx-ch-bar-mid"/><rect x="77.8" y="55.7" width="10" height="160.3" class="lcx-ch-bar-soft"/><rect x="90.2" y="63.2" width="10" height="152.8" class="lcx-ch-bar-pale"/><text x="76.6" y="230" class="lcx-ch-axis" text-anchor="middle">Qwen 3.6</text><text x="76.6" y="238" class="lcx-ch-axis" text-anchor="middle">27B</text><rect x="130.2" y="91.5" width="10" height="124.5" class="lcx-ch-bar"/><rect x="142.6" y="100.4" width="10" height="115.6" class="lcx-ch-bar-mid"/><rect x="155.0" y="121.1" width="10" height="94.9" class="lcx-ch-bar-soft"/><rect x="167.4" y="207.5" width="10" height="8.5" class="lcx-ch-bar-pale"/><text x="153.8" y="230" class="lcx-ch-axis" text-anchor="middle">Qwen Coder</text><text x="153.8" y="238" class="lcx-ch-axis" text-anchor="middle">Next</text><rect x="207.4" y="62.8" width="10" height="153.2" class="lcx-ch-bar"/><rect x="219.8" y="63.2" width="10" height="152.8" class="lcx-ch-bar-mid"/><rect x="232.2" y="61.4" width="10" height="154.6" class="lcx-ch-bar-soft"/><rect x="244.6" y="79.7" width="10" height="136.3" class="lcx-ch-bar-pale"/><text x="231.0" y="230" class="lcx-ch-axis" text-anchor="middle">Gemma 4</text><text x="231.0" y="238" class="lcx-ch-axis" text-anchor="middle">31B</text><rect x="284.6" y="51.5" width="10" height="164.5" class="lcx-ch-bar"/><rect x="297.0" y="59.0" width="10" height="157.0" class="lcx-ch-bar-mid"/><rect x="309.4" y="64.2" width="10" height="151.8" class="lcx-ch-bar-soft"/><rect x="321.8" y="83.0" width="10" height="133.0" class="lcx-ch-bar-pale"/><text x="308.2" y="230" class="lcx-ch-axis" text-anchor="middle">Step 3.7</text><text x="308.2" y="238" class="lcx-ch-axis" text-anchor="middle">Flash</text><rect x="361.8" y="45.4" width="10" height="170.6" class="lcx-ch-bar"/><rect x="374.2" y="44.5" width="10" height="171.6" class="lcx-ch-bar-mid"/><rect x="386.6" y="44.0" width="10" height="172.0" class="lcx-ch-bar-soft"/><rect x="399.0" y="56.7" width="10" height="159.3" class="lcx-ch-bar-pale"/><text x="385.40000000000003" y="230" class="lcx-ch-axis" text-anchor="middle">MiniMax</text><text x="385.40000000000003" y="238" class="lcx-ch-axis" text-anchor="middle">M2.7</text><line x1="38" y1="216" x2="424" y2="216" class="lcx-ch-axis-line"/><text x="194.8" y="194.85" class="lcx-ch-value">3.6</text><rect x="38" y="256" width="8" height="5" class="lcx-ch-bar"/><text x="50" y="261" class="lcx-ch-note">基线</text><rect x="134" y="256" width="8" height="5" class="lcx-ch-bar-mid"/><text x="146" y="261" class="lcx-ch-note">48K/40K</text><rect x="230" y="256" width="8" height="5" class="lcx-ch-bar-soft"/><text x="242" y="261" class="lcx-ch-note">32K/24K</text><rect x="326" y="256" width="8" height="5" class="lcx-ch-bar-pale"/><text x="338" y="261" class="lcx-ch-note">16K/12K</text><text x="38" y="288" class="lcx-ch-note">Qwen 3 Coder Next（第二组）在 16K/12K 崩溃；其余四个模型掉 3.6–13.4 个百分点。</text></svg>
    <div class="lcx-src">重绘自表 9 · arXiv:2611.05306</div>
  </div>
</div>

<div class="lcx-table-card">
  <div class="lcx-table-head">
    <div class="lcx-table-tag"><svg class="lcx-ico lcx-ico-xs" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#lcx-i-chart-no-axes-column"></use></svg>开放权重模型 · SWE-BENCH VERIFIED</div>
    <div class="lcx-table-title">同一个外壳，非常不同的稳健性。</div>
    <p class="lcx-table-sub">500 个实例中解决的百分比。最紧的设置是 16K/12K。Qwen 3 Coder Next 崩溃；Qwen 3.6 与 MiniMax 撑住。</p>
  </div>
  <div class="lcx-table-scroll">
    <table class="lcx-results">
      <thead><tr><th>模型</th><th class="num">基线</th><th class="num">48K/40K</th><th class="num">32K/24K</th><th class="num">16K/12K</th><th class="num">最紧设置的 Δ</th></tr></thead>
      <tbody>
        <tr><td>Qwen 3.6 27B</td><td class="num">68.6</td><td class="num">69.4</td><td class="num">68.2</td><td class="num">65.0</td><td class="num neg">−3.6</td></tr>
        <tr><td>Qwen 3 Coder Next</td><td class="num">53.0</td><td class="num">49.2</td><td class="num">40.4</td><td class="num neg strong">3.6</td><td class="num neg strong">−49.4</td></tr>
        <tr><td>Gemma 4 31B</td><td class="num">65.2</td><td class="num">65.0</td><td class="num">65.8</td><td class="num">58.0</td><td class="num neg">−7.2</td></tr>
        <tr><td>Step 3.7 Flash</td><td class="num">70.0</td><td class="num">66.8</td><td class="num">64.6</td><td class="num">56.6</td><td class="num neg">−13.4</td></tr>
        <tr><td>MiniMax M2.7</td><td class="num">72.6</td><td class="num">73.0</td><td class="num">73.2</td><td class="num">67.8</td><td class="num neg">−4.8</td></tr>
      </tbody>
    </table>
  </div>
  <div class="lcx-table-foot">数据来源：arXiv:2611.05306，表 9。表 10 的 Terminal-Bench 结果呈现类似的离散；Qwen 3.6 与 MiniMax 在最紧的设置仍保住基线分数。</div>
</div>

对任何想部署这套做法的人来说，Qwen 3 Coder Next 的崩溃是论文中最重要的单一数字。它在 16K/12K 从 **53.0 掉到 3.6**。论文的解释很机械化：它的轨迹很啰唆，所以 12K 的门槛留下太少空间，让压缩之间无法产生有用的进展。模型把预算花在重建状态，而不是解任务。

这是一般的教训：**压缩的稳健性是模型属性，不只是外壳属性。** 一个会写出紧凑、信息密集状态的模型，能撑过激进的预算。一个会写出冗长、重复轨迹的模型不行。如果你要为紧上下文预算的代理挑模型，测它的压缩行为，不要只测它的基准测试分数。

### FRAMES 与漏掉一句话的代价

FRAMES 是压缩稳定吃亏的长流程基准测试（Opus 1.3–3.7 个百分点，GPT 1.5–3.3）。任务需要跨多跳整合 2–15 篇维基百科文章的证据。一份漏掉桥接事实的压缩，可能打断整条链。损失不大，但它提醒我们：**不是所有 token 都同样可压缩。** 50 条 shell 命令的逐字稿可能压成一行；五个相依事实的链，可能一压就断。

### 成本倍数是估计值

论文的成本模型是明确的，而且它是一个模型。它在 H100 上量测吞吐量，拟合出上下文成本比（`r = 0.20`），以标准输出价锚定零售价（Opus 4.5 每百万 $25，GPT 5.6 Sol 每百万 $20），并保留供应商 5:1 的输出对输入、10:1 的输入对缓存比率。得到的「估计优化零售成本」是一个**反事实**：如果供应商把上下文长度的节省转嫁出来，服务会是什么价。那不是你今天能付的账单。

这个但书是双向的。GPT 在 NIAH 上的 233× 不是承诺，是模型的输出。但*方向*——较短的上下文更便宜，而且常常是整数倍——有直接吞吐量量测支持，不只是成本模型。论文小心地把两者分开，读者也该如此。

### 「短」仍然是 16K–50K

这篇论文最常见的误读会是「上下文窗口不重要」。那不是它的主张。它主张的是**16K–50K 对受测任务已经足够**，而 256K 以上常常不必要。16K 上下文仍然是一篇长短篇小说——大约 12,000 字。论文不是提倡失忆；它提倡的是工作集。

### 基准测试是样本，不是整个空间

六个长流程加七个长输入基准测试是宽广的样本，但仍然只是样本。论文没有测试每一种代理工作负载：没有多模态任务、没有即时控制、没有输入是一份 10M token 基因体的任务、没有模型必须把一份精确的形式证明一直记在脑里的任务。结论是「长上下文不是完成『长上下文』任务的必要条件」——一个小心界定范围的主张。它不是「长上下文永远没用」。

<div class="lcx-pull">
  <div class="lcx-pull-mark">“</div>
  <p>论文最强的主张，也是最谦卑的：支持长上下文的标准论证并不充分，而不是长上下文永远没有价值。</p>
</div>

<div class="lcx-kicker"><svg class="lcx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#lcx-i-compass"></use></svg>我会怎么用这篇论文</div>

## 给代理开发者的实务手册

论文是研究结果，不是部署指南。以下是我会怎么把它翻译成工程决策。

### 1. 把上下文当缓存，不是帐本

把完整逐字稿存在某个耐久的地方——物件储存、数据库、日志档。prompt 里只放工作集。文件库是真相来源；上下文是有替换策略的缓存。这一个架构决策，让其他所有技巧成为可能。

### 2. 量每任务的 token，不只量准确率

论文最实用的指标不是准确率，而是**特定上下文预算下的准确率**。一个分数高 1 个百分点、却烧掉 5× token 的系统，并没有明显更好。要监测：输入 token、缓存 token、输出 token、峰值上下文、压缩次数、任务成功率。把它们画在一起。

### 3. 从 EoCC 开始，不是 SAC

EoCC 是风险较低的介入。它保留对话结构，只在门槛处压缩。SAC 是更激进的赌注；它需要一个会写好状态的模型。如果你要部署到异质的模型阵容，EoCC 的可携性更高。

### 4. 把压缩 prompt 写成一份交班笔记

不要要求「一份摘要」。要求五种成分：逐字任务、目前状态、下一步、承重产物、完成定义。把 schema 放进系统提示。验证输出包含那些栏位。一份漏掉失败测试名称的压缩，比不压缩更糟。

### 5. 给代理一个搜寻自己历史的工具

丢硬币的反例是真的。如果代理之后可能需要某个精确细节，文件库必须可搜寻。对逐字稿文件 `grep` 很粗糙，但有效。一份有时间戳与工具名称的结构化事件日志更好。

### 6. 在自己的工作负载上测试最紧的预算

论文的门槛是起点，不是宇宙常数。最佳设置因基准测试而异：SWE-bench Verified 是 24K/18K，Terminal-Bench 是 32K/24K，FRAMES 是 48K/36K。在具代表性的样本上扫预算，挑膝点，不是挑最小值。

### 7. 注意轨迹啰唆的模型

Qwen 3 Coder Next 的崩溃是警讯。一个会发出长思考轨迹与重复命令的模型，会更早撞到压缩门槛，并把更多预算花在重建状态。如果你非得用这种模型，提高门槛或缩短轨迹。

<div class="lcx-checklist">
  <div class="lcx-check"><div class="lcx-check-ico"><svg class="lcx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#lcx-i-check"></use></svg></div><div><b>上线前：</b> 代理能不能找回被压缩掉的事实？如果不行，文件库的搜寻还不够好。</div></div>
  <div class="lcx-check"><div class="lcx-check-ico"><svg class="lcx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#lcx-i-check"></use></svg></div><div><b>上线前：</b> 压缩里有没有任务的验收标准，还是只有发生什么事的叙事？</div></div>
  <div class="lcx-check"><div class="lcx-check-ico"><svg class="lcx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#lcx-i-check"></use></svg></div><div><b>上线前：</b> 你有没有量峰值上下文与 token 支出，而不只是最终分数？</div></div>
  <div class="lcx-check"><div class="lcx-check-ico"><svg class="lcx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#lcx-i-check"></use></svg></div><div><b>上线前：</b> 你选的模型在你打算跑的最紧预算下还能工作吗？去测，不要假设。</div></div>
</div>

<div class="lcx-kicker"><svg class="lcx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#lcx-i-message-circle"></use></svg>问题</div>

## 我预期会收到的问题

**论文是说长上下文没用吗？** 不是。它是说长上下文对它测试的任务不是*必要*的，而支持长上下文的标准论证比表面上看起来弱。当然有任务是大工作集有帮助的；论文没有宣称已经找齐。

**压缩会遗失信息吗？** 会，这是构造上的必然。论文的答案是保留完整逐字稿并让它可搜寻。压缩是缓存替换策略，不是删除策略。

**为什么不直接用 RAG？** 选择性阅读*就是*一种检索，只是它靠代理与工具，而不是 embedding。代理自己选要搜什么、读结果、再迭代。论文的论点是这个循环常常就够了；你不需要为每个任务另外建一个向量索引。

**EoCC 不就是摘要吗？** 不是。论文发现摘要效果不理想。EoCC 是结构化简报：任务、状态、下一步、产物、完成定义。差别在目标函数——决策相关性，不是覆盖率。

**为什么 GPT 5.6 Sol 在 SAC 下掉得比较多？** 论文没有给定论。一个合理的解释是它的策略更依赖上下文中近期的范例；移除逐字稿就移除了那些范例。这正是后训练调整可以修正的模型专属行为。

**16K 对真实的代码库 够吗？** 对受测任务来说，常常够——有搜寻工具与好的压缩。16K 窗口装不下大型代码仓库，但它不需要。代理选择性读取文件。失败模式不是「代码仓库太大」，而是「代理找不到正确的文件」。

**多模态或潜在状态呢？** 论文只处理文字。SSSM 的想法是通用的，但实验不是。多模态代理可能需要不同的状态表征；那是开放问题。

**这篇有同侪审查吗？** 它是 arXiv 预印本（v1，2026 年 11 月 3 日提交）。把这些数字当作强力证据，不是定论。程序码与外壳细节都在论文里；原则上结果可重现。

<div class="lcx-kicker"><svg class="lcx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#lcx-i-signpost"></use></svg>底线</div>

## 贵的是那个习惯

论文的标题是挑衅，但它真正的主张比标题更有用。它不是说上下文窗口很糟。它是说**我们一直把一个服务参数当成一种能力**，而这个混淆的代价，付在延迟、内存与美元上。

三个结果合起来，形成一个连贯的工程哲学：

- **保留文件库。** 完整历史储存起来很便宜，带着走很贵。
- **带着简报。** 好的压缩是交班笔记，不是摘要。
- **选择性阅读。** 长输入是一个文件系统，不是一个 prompt。
- **量预算。** 最佳上下文上限是超参数，不是默认值。

最深远的意涵与模型设计有关。如果一个模型能跨动作维持自然语言状态，上下文窗口就不再是架构的中心。如果假设成立，状态会成为中心。这就是 SSSM 想法指向的地方，也是论文结尾那个问题——*为什么还要训练全历史模型？*——不只是修辞的原因。

我不认为长上下文会消失。总会有任务就是需要大工作集。但默认值应该改变。下次你把一份 200K token 的文件贴进 prompt 时，问论文那个问题：**这是需要待在上下文里的信息，还是需要可取得的信息？** 答案常常是后者，而账单会小一点。

<div class="lcx-endnote">
  <div class="lcx-endnote-head"><svg class="lcx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#lcx-i-book-open"></use></svg>来源与方法说明</div>
  <p><b>论文：</b> Peter Belcak、Saurav Muralidharan、Jindong Jiang、Yonggan Fu、Wonmin Byeon、Hanrong Ye、Ryan Angilly、Ali Taghibakhshi、Shih-Yang Liu、Siru Ouyang、Greg Heinrich、Pavlo Molchanov。〈You don’t need long context〉。arXiv:2611.05306v1，2026 年 11 月 3 日提交。<a href="https://arxiv.org/abs/2611.05306">arxiv.org/abs/2611.05306</a> · <a href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a>。</p>
  <p><b>方法：</b> 本文是细读，不是独立重现。所有准确率数字都是基准测试自身尺度上的百分点。成本倍数是论文估计的优化零售成本，不是实际账单。论文图表依 CC BY 4.0 转载；重绘图表为本刊原创，使用论文发表的数字。</p>
  <p><b>勘误：</b> 如果你在转录中发现错误，每张图说都连结到来源表。论文的附录 C–F 有完整的逐项基准测试表。</p>
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
