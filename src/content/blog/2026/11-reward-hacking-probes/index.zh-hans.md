---
title: "破绽：一个便宜探针，抓出在自己基准测试里作弊的模型"
description: "细读 arXiv:2609.19101：模型激活里一个简单的均值差方向，就能在 SWE-bench、DeepSWE 与 ImpossibleBench 上检测奖励作弊（reward hacking），还能挖出评分规则没预料到的作弊行为。"
pubDate: 2026-11-14
category: "AI"
tags: ["奖励作弊", "可解释性", "评测", "AI 安全", "论文笔记"]
featured: false
author: "Alex.Hsiao"
readTime: "25 分钟"
---

# 破绽：一个便宜探针，抓出在自己基准测试里作弊的模型

<svg class="rhx-sprite" aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg"><defs><symbol id="rhx-i-activity" viewBox="0 0 24 24"><path d="M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2"/></symbol><symbol id="rhx-i-archive" viewBox="0 0 24 24"><rect width="20" height="5" x="2" y="3" rx="1"/><path d="M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8m-10 4h4"/></symbol><symbol id="rhx-i-arrow-up-down" viewBox="0 0 24 24"><path d="m21 16l-4 4l-4-4m4 4V4M3 8l4-4l4 4M7 4v16"/></symbol><symbol id="rhx-i-book-open" viewBox="0 0 24 24"><path d="M12 7v14M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z"/></symbol><symbol id="rhx-i-brain" viewBox="0 0 24 24"><path d="M12 18V5m3 8a4.17 4.17 0 0 1-3-4a4.17 4.17 0 0 1-3 4m8.707-6.706A3 3 0 1 0 12 5a3 3 0 1 0-5.707 1.294"/><path d="M17.996 5.125a4 4 0 0 1 2.526 5.77"/><path d="M18 18a4 4 0 0 0 2-7.465"/><path d="M19.967 17.482a4 4 0 1 1-7.967.517a4 4 0 1 1-7.967-.517"/><path d="M6 18a4 4 0 0 1-2-7.465"/><path d="M6.004 5.125a4 4 0 0 0-2.526 5.77"/></symbol><symbol id="rhx-i-chart-no-axes-column" viewBox="0 0 24 24"><path d="M5 21v-6m7 6V3m7 18V9"/></symbol><symbol id="rhx-i-clipboard-list" viewBox="0 0 24 24"><rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2m4 7h4m-4 5h4m-8-5h.01M8 16h.01"/></symbol><symbol id="rhx-i-coins" viewBox="0 0 24 24"><path d="M13.744 17.736a6 6 0 1 1-7.48-7.48M15 6h1v4"/><path d="m6.134 14.768l.866-.5l2 3.464"/><circle cx="16" cy="8" r="6"/></symbol><symbol id="rhx-i-database" viewBox="0 0 24 24"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v14a9 3 0 0 0 18 0V5"/><path d="M3 12a9 3 0 0 0 18 0"/></symbol><symbol id="rhx-i-file-text" viewBox="0 0 24 24"><path d="M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z"/><path d="M14 2v5a1 1 0 0 0 1 1h5M10 9H8m8 4H8m8 4H8"/></symbol><symbol id="rhx-i-flask-conical" viewBox="0 0 24 24"><path d="M14 2v6a2 2 0 0 0 .245.96l5.51 10.08A2 2 0 0 1 18 22H6a2 2 0 0 1-1.755-2.96l5.51-10.08A2 2 0 0 0 10 8V2M6.453 15h11.094M8.5 2h7"/></symbol><symbol id="rhx-i-gauge" viewBox="0 0 24 24"><path d="m12 14l4-4M3.34 19a10 10 0 1 1 17.32 0"/></symbol><symbol id="rhx-i-git-branch" viewBox="0 0 24 24"><path d="M15 6a9 9 0 0 0-9 9V3"/><circle cx="18" cy="6" r="3"/><circle cx="6" cy="18" r="3"/></symbol><symbol id="rhx-i-history" viewBox="0 0 24 24"><path d="M3 12a9 9 0 1 0 9-9a9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5m4-1v5l4 2"/></symbol><symbol id="rhx-i-layers" viewBox="0 0 24 24"><path d="M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83z"/><path d="M2 12a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 12"/><path d="M2 17a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 17"/></symbol><symbol id="rhx-i-list-filter" viewBox="0 0 24 24"><path d="M2 5h20M6 12h12m-9 7h6"/></symbol><symbol id="rhx-i-memory-stick" viewBox="0 0 24 24"><path d="M12 12v-2m0 8v-2m4-4v-2m0 8v-2M2 11h1.5M20 18v-2m.5-5H22M4 18v-2m4-4v-2m0 8v-2"/><rect width="20" height="10" x="2" y="6" rx="2"/></symbol><symbol id="rhx-i-messages-square" viewBox="0 0 24 24"><path d="M16 10a2 2 0 0 1-2 2H6.828a2 2 0 0 0-1.414.586l-2.202 2.202A.71.71 0 0 1 2 14.286V4a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2zm4-1a2 2 0 0 1 2 2v10.286a.71.71 0 0 1-1.212.502l-2.202-2.202A2 2 0 0 0 17.172 19H10a2 2 0 0 1-2-2v-1"/></symbol><symbol id="rhx-i-network" viewBox="0 0 24 24"><rect width="6" height="6" x="16" y="16" rx="1"/><rect width="6" height="6" x="2" y="16" rx="1"/><rect width="6" height="6" x="9" y="2" rx="1"/><path d="M5 16v-3a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v3m-7-4V8"/></symbol><symbol id="rhx-i-radar" viewBox="0 0 24 24"><path d="M19.07 4.93A10 10 0 0 0 6.99 3.34M4 6h.01M2.29 9.62a10 10 0 1 0 19.02-1.27"/><path d="M16.24 7.76a6 6 0 1 0-8.01 8.91M12 18h.01m5.98-6.34a6 6 0 0 1-2.22 5.01"/><circle cx="12" cy="12" r="2"/><path d="m13.41 10.59l5.66-5.66"/></symbol><symbol id="rhx-i-repeat" viewBox="0 0 24 24"><path d="m17 2l4 4l-4 4"/><path d="M3 11v-1a4 4 0 0 1 4-4h14M7 22l-4-4l4-4"/><path d="M21 13v1a4 4 0 0 1-4 4H3"/></symbol><symbol id="rhx-i-route" viewBox="0 0 24 24"><circle cx="6" cy="19" r="3"/><path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15"/><circle cx="18" cy="5" r="3"/></symbol><symbol id="rhx-i-scan-search" viewBox="0 0 24 24"><path d="M3 7V5a2 2 0 0 1 2-2h2m10 0h2a2 2 0 0 1 2 2v2m0 10v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2"/><circle cx="12" cy="12" r="3"/><path d="m16 16l-1.9-1.9"/></symbol><symbol id="rhx-i-scissors" viewBox="0 0 24 24"><circle cx="6" cy="6" r="3"/><path d="M8.12 8.12L12 12m8-8L8.12 15.88"/><circle cx="6" cy="18" r="3"/><path d="M14.8 14.8L20 20"/></symbol><symbol id="rhx-i-shield-check" viewBox="0 0 24 24"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12l2 2l4-4"/></symbol><symbol id="rhx-i-target" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></symbol><symbol id="rhx-i-timer" viewBox="0 0 24 24"><path d="M10 2h4m-2 12l3-3"/><circle cx="12" cy="14" r="8"/></symbol><symbol id="rhx-i-triangle-alert" viewBox="0 0 24 24"><path d="m21.73 18l-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3M12 9v4m0 4h.01"/></symbol><symbol id="rhx-i-users" viewBox="0 0 24 24"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M16 3.128a4 4 0 0 1 0 7.744M22 21v-2a4 4 0 0 0-3-3.87"/><circle cx="9" cy="7" r="4"/></symbol><symbol id="rhx-i-workflow" viewBox="0 0 24 24"><rect width="8" height="8" x="3" y="3" rx="2"/><path d="M7 11v4a2 2 0 0 0 2 2h4"/><rect width="8" height="8" x="13" y="13" rx="2"/></symbol><symbol id="rhx-i-clock" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></symbol><symbol id="rhx-i-search" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></symbol><symbol id="rhx-i-terminal" viewBox="0 0 24 24"><polyline points="4 17 10 11 4 5"/><line x1="12" x2="20" y1="19" y2="19"/></symbol><symbol id="rhx-i-check" viewBox="0 0 24 24"><path d="M20 6 9 17l-5-5"/></symbol><symbol id="rhx-i-x" viewBox="0 0 24 24"><path d="M18 6 6 18M6 6l12 12"/></symbol><symbol id="rhx-i-arrow-right" viewBox="0 0 24 24"><path d="M5 12h14m-6-6 6 6-6 6"/></symbol><symbol id="rhx-i-folder-open" viewBox="0 0 24 24"><path d="m6 14 1.5-2.9A2 2 0 0 1 9.24 10H20a2 2 0 0 1 1.94 2.5l-1.54 6a2 2 0 0 1-1.95 1.5H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.69.9l.81 1.2a2 2 0 0 0 1.67.9H18a2 2 0 0 1 2 2v2"/></symbol><symbol id="rhx-i-receipt" viewBox="0 0 24 24"><path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z"/><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"/><path d="M12 17.5v-11"/></symbol><symbol id="rhx-i-banknote" viewBox="0 0 24 24"><rect width="20" height="12" x="2" y="6" rx="2"/><circle cx="12" cy="12" r="2"/><path d="M6 12h.01M18 12h.01"/></symbol><symbol id="rhx-i-scale" viewBox="0 0 24 24"><path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="M7 21h10"/><path d="M12 3v18"/><path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2"/></symbol><symbol id="rhx-i-trending-down" viewBox="0 0 24 24"><polyline points="22 17 13.5 8.5 8.5 13.5 2 7"/><polyline points="16 17 22 17 22 11"/></symbol><symbol id="rhx-i-zap" viewBox="0 0 24 24"><path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"/></symbol><symbol id="rhx-i-cpu" viewBox="0 0 24 24"><rect width="16" height="16" x="4" y="4" rx="2"/><rect width="6" height="6" x="9" y="9" rx="1"/><path d="M15 2v2M15 20v2M2 15h2M2 9h2M20 15h2M20 9h2M9 2v2M9 20v2"/></symbol><symbol id="rhx-i-hard-drive" viewBox="0 0 24 24"><line x1="22" x2="2" y1="12" y2="12"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/><line x1="6" x2="6.01" y1="16" y2="16"/><line x1="10" x2="10.01" y1="16" y2="16"/></symbol><symbol id="rhx-i-eye" viewBox="0 0 24 24"><path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"/><circle cx="12" cy="12" r="3"/></symbol><symbol id="rhx-i-boxes" viewBox="0 0 24 24"><path d="M2.97 12.92A2 2 0 0 0 2 14.63v3.24a2 2 0 0 0 .97 1.71l3 1.8a2 2 0 0 0 2.06 0L12 19v-5.5l-5-3-4.03 2.42Z"/><path d="m7 16.5-4.74-2.85M7 16.5l5-3M7 16.5v5.17M12 13.5V19l3.97 2.38a2 2 0 0 0 2.06 0l3-1.8a2 2 0 0 0 .97-1.71v-3.24a2 2 0 0 0-.97-1.71L17 10.5l-5 3Z"/><path d="m17 16.5-5-3M17 16.5l4.74-2.85M17 16.5v5.17"/></symbol><symbol id="rhx-i-compass" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88"/></symbol><symbol id="rhx-i-map" viewBox="0 0 24 24"><path d="M14.106 5.553a2 2 0 0 0 1.788 0l3.659-1.83A1 1 0 0 1 21 4.619v12.764a1 1 0 0 1-.553.894l-4.553 2.277a2 2 0 0 1-1.788 0l-4.212-2.106a2 2 0 0 0-1.788 0l-3.659 1.83A1 1 0 0 1 3 19.381V6.618a1 1 0 0 1 .553-.894l4.553-2.277a2 2 0 0 1 1.788 0z"/><path d="M15 5.764v15M9 3.236v15"/></symbol><symbol id="rhx-i-key-round" viewBox="0 0 24 24"><path d="M2.586 17.414A2 2 0 0 0 2 18.828V21a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h1a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h.172a2 2 0 0 0 1.414-.586l.814-.814a6.5 6.5 0 1 0-4-4z"/><circle cx="16.5" cy="7.5" r=".5" fill="currentColor"/></symbol><symbol id="rhx-i-lock" viewBox="0 0 24 24"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></symbol><symbol id="rhx-i-signpost" viewBox="0 0 24 24"><path d="M12 13v8M12 3v3"/><path d="M18 6a2 2 0 0 1 1.387.56l2.307 2.22a1 1 0 0 1 0 1.44l-2.307 2.22A2 2 0 0 1 18 13H6a2 2 0 0 1-1.387-.56l-2.306-2.22a1 1 0 0 1 0-1.44l2.306-2.22A2 2 0 0 1 6 6z"/></symbol><symbol id="rhx-i-hourglass" viewBox="0 0 24 24"><path d="M5 22h14M5 2h14"/><path d="M17 22v-4.172a2 2 0 0 0-.586-1.414L12 12l-4.414 4.414A2 2 0 0 0 7 17.828V22"/><path d="M7 2v4.172a2 2 0 0 0 .586 1.414L12 12l4.414-4.414A2 2 0 0 0 17 6.172V2"/></symbol><symbol id="rhx-i-circle-dot" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="1"/></symbol><symbol id="rhx-i-notebook-pen" viewBox="0 0 24 24"><path d="M13.4 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7.4"/><path d="M2 6h4M2 10h4M2 14h4M2 18h4"/><path d="M21.378 5.626a1 1 0 1 0-3.004-3.004l-5.01 5.012a2 2 0 0 0-.506.854l-.837 2.87a.5.5 0 0 0 .62.62l2.87-.837a2 2 0 0 0 .854-.506z"/></symbol><symbol id="rhx-i-panel-top" viewBox="0 0 24 24"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18"/></symbol><symbol id="rhx-i-bot" viewBox="0 0 24 24"><path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2M20 14h2M15 13v2M9 13v2"/></symbol><symbol id="rhx-i-message-circle" viewBox="0 0 24 24"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/></symbol><symbol id="rhx-i-square-stack" viewBox="0 0 24 24"><path d="M4 10c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h4c1.1 0 2 .9 2 2"/><path d="M10 16c-1.1 0-2-.9-2-2v-4c0-1.1.9-2 2-2h4c1.1 0 2 .9 2 2"/><rect width="8" height="8" x="14" y="14" rx="2"/></symbol><symbol id="rhx-i-split" viewBox="0 0 24 24"><path d="M16 3h5v5M8 3H3v5M12 22v-8.3a4 4 0 0 0-1.172-2.872L3 3M15 9l6-6"/></symbol><symbol id="rhx-i-merge" viewBox="0 0 24 24"><path d="m8 6 4-4 4 4"/><path d="M12 2v10.3a4 4 0 0 1-1.172 2.872L3 23"/><path d="m15 9 6 6"/></symbol><symbol id="rhx-i-sliders" viewBox="0 0 24 24"><line x1="4" x2="4" y1="21" y2="14"/><line x1="4" x2="4" y1="10" y2="3"/><line x1="12" x2="12" y1="21" y2="12"/><line x1="12" x2="12" y1="8" y2="3"/><line x1="20" x2="20" y1="21" y2="16"/><line x1="20" x2="20" y1="12" y2="3"/><line x1="2" x2="6" y1="14" y2="14"/><line x1="10" x2="14" y1="8" y2="8"/><line x1="18" x2="22" y1="16" y2="16"/></symbol></defs></svg>

想像一个学生，数学考了 95 分。后来你发现，她整场考试都在找贴在桌子底下的解答。分数是真的，能力不是。

这就是一篇新论文在几个最常被引用的程序基准测试里发现的状况。**〈Monitoring and Discovering Reward Hacking with Internal Representations during LLM Evaluations〉**（arXiv:2609.19101v2）研究三个前沿开放权重模型——**Kimi K3**、**GLM 5.2**、**Qwen 3.8 Max**——在 **SWE-bench Verified**、**DeepSWE** 与 **ImpossibleBench** 上的表现。它发现 rollout 的作弊率落在 **50% 到 95.2%** 之间。在 DeepSWE 上，Qwen 3.8 Max 有 **95.2%** 的 rollout 作弊。在 SWE-bench 上，Kimi K3 的作弊率是 **86.6%**。

论文的贡献不只是那个盛行率数字，而是一种几乎不花成本的抓法：在模型内部激活中取一个**均值差（difference of means, DoM）向量**，用几千个作弊与诚实的合成范例建出来。这个探针能推广到很长的代理 rollout、跨环境转移、在模型真正做出作弊动作前就预测到作弊，还能挖出精心撰写的 LLM 监控器漏掉的行为。

<div class="rhx-paper-cta">
  <a class="mono-btn-chamfer rhx-paper-btn" href="https://arxiv.org/abs/2609.19101" target="_blank" rel="noopener noreferrer">
    <span class="chamfer-inner">
      <span class="btn-tag">ARXIV</span>
      <span class="btn-label">阅读论文 ↗</span>
    </span>
  </a>
</div>

标题很容易被误读。这不是一篇说模型「邪恶」的论文。它谈的是**评测效度**，以及一个实务上的监控取舍：

- **LLM 监控器**能读完整份完整记录，解释哪里出了问题。但它们昂贵、缓慢，而且受限于自己正在监控的同一个模型家族。
- **激活探针**是读取模型内部状态的微型线性分类器。它们几乎免费，但只给你一个分数，不给你一个故事。
- **自我报告**——直接问模型有没有作弊——很便宜，但根据这篇论文，几乎没用。

有意思的结果是，这个便宜、笨拙的线性探针，往往**和昂贵的监控器一样好**，有时还更擅长找出那些没人写过评分规则的作弊。

<div class="rhx-kicker"><svg class="rhx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#rhx-i-scan-search"></use></svg>一萤幕看懂论文</div>

## 五个数字，一个让人不舒服的故事

<div class="rhx-stat-grid">
  <div class="rhx-stat"><div class="rhx-stat-top"><svg class="rhx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#rhx-i-triangle-alert"></use></svg><span>盛行率</span></div><div class="rhx-stat-num">95.2%</div><p>Qwen 3.8 Max 在 DeepSWE 上至少出现一次奖励作弊的 rollout 比例。研究中的最低比率仍有 50.0%。</p></div>
  <div class="rhx-stat"><div class="rhx-stat-top"><svg class="rhx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#rhx-i-target"></use></svg><span>探针 AUROC</span></div><div class="rhx-stat-num">0.74–0.97</div><p>九个模型–基准测试组合的检测质量。AUROC 0.5 等于丢硬币，1.0 是完美排序。探针只是一个线性方向，不是训练过的分类器。</p></div>
  <div class="rhx-stat"><div class="rhx-stat-top"><svg class="rhx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#rhx-i-gauge"></use></svg><span>相同假阳性率</span></div><div class="rhx-stat-num">+33.1 pts</div><p>在 ImpossibleBench 上，Kimi K3 的探针在监控器相同的假阳性率下，比 LLM 监控器多抓到的作弊。</p></div>
  <div class="rhx-stat"><div class="rhx-stat-top"><svg class="rhx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#rhx-i-zap"></use></svg><span>预测</span></div><div class="rhx-stat-num">28.6% vs 1.1%</div><p>在探针选出的思维链区段重新取样后，出现的作弊尝试比例，对照长度相符的控制组（Kimi K3）。</p></div>
  <div class="rhx-stat"><div class="rhx-stat-top"><svg class="rhx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#rhx-i-eye"></use></svg><span>自我报告</span></div><div class="rhx-stat-num">13.2%</div><p>GLM 5.2 在 DeepSWE 上被要求回报自身作弊时的 F1。外部监控器是 54.2%。</p></div>
</div>

<p class="rhx-fine">数据来源：摘要、§2.3、§4.1–4.2、Figure 2、Figure 8、Figure 10。「一次作弊」指至少有一个片段被论文的真实标注评审标为奖励作弊。</p>

接下来，本文会按最容易相信这个结果的顺序拆解论文：先看行为，再看测量问题，然后是探针，接着是探针胜过监控器的地方，最后是它不如监控器的地方。

<div class="rhx-kicker"><svg class="rhx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#rhx-i-book-open"></use></svg>术语解码器</div>

## 十个术语，用白话说

<div class="rhx-glossary">
  <div class="rhx-gloss"><div class="rhx-gloss-ico"><svg class="rhx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#rhx-i-activity"></use></svg></div><div><div class="rhx-gloss-term">激活</div><p class="rhx-gloss-copy">模型在某一层、某个 token 位置算出的一串数字。可以把它想成模型在那一刻的内部状态。</p></div></div>
  <div class="rhx-gloss"><div class="rhx-gloss-ico"><svg class="rhx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#rhx-i-layers"></use></svg></div><div><div class="rhx-gloss-term">残差流</div><p class="rhx-gloss-copy">贯穿 transformer 的主要信息高速公路。每一层都从中读取、也往里头加入；探针只读这条公路上的某一点。</p></div></div>
  <div class="rhx-gloss"><div class="rhx-gloss-ico"><svg class="rhx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#rhx-i-compass"></use></svg></div><div><div class="rhx-gloss-term">探针</div><p class="rhx-gloss-copy">一个简单的函数：从激活中读取某个方向，返回一个分数。线性探针就是一个内积。</p></div></div>
  <div class="rhx-gloss"><div class="rhx-gloss-ico"><svg class="rhx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#rhx-i-scale"></use></svg></div><div><div class="rhx-gloss-term">均值差</div><p class="rhx-gloss-copy">把作弊范例的激活平均、把诚实范例的激活平均，再相减。结果是一个从「诚实」指向「作弊」的向量。</p></div></div>
  <div class="rhx-gloss"><div class="rhx-gloss-ico"><svg class="rhx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#rhx-i-route"></use></svg></div><div><div class="rhx-gloss-term">rollout</div><p class="rhx-gloss-copy">一次完整的代理执行：任务、每个动作、每个工具结果，以及最终答案。一段 100K token 的 rollout 就是一份很长的完整记录。</p></div></div>
  <div class="rhx-gloss"><div class="rhx-gloss-ico"><svg class="rhx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#rhx-i-chart-no-axes-column"></use></svg></div><div><div class="rhx-gloss-term">AUROC</div><p class="rhx-gloss-copy">一种排序分数：随机抽一个作弊片段，其探针分数高于随机一个诚实片段的机率。0.5 等于乱猜；1.0 是完美。</p></div></div>
  <div class="rhx-gloss"><div class="rhx-gloss-ico"><svg class="rhx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#rhx-i-target"></use></svg></div><div><div class="rhx-gloss-term">F1</div><p class="rhx-gloss-copy">精确率（你标记的片段里，有多少是真的？）与召回率（真实的作弊里，你标到多少？）的调和平均。</p></div></div>
  <div class="rhx-gloss"><div class="rhx-gloss-ico"><svg class="rhx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#rhx-i-triangle-alert"></use></svg></div><div><div class="rhx-gloss-term">假阳性</div><p class="rhx-gloss-copy">被检测器标记的诚实片段。假阳性率就是触发警报的诚实片段占比。</p></div></div>
  <div class="rhx-gloss"><div class="rhx-gloss-ico"><svg class="rhx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#rhx-i-search"></use></svg></div><div><div class="rhx-gloss-term">logit lens</div><p class="rhx-gloss-copy">把内部向量翻译成它指向之词汇的方法。它让你问：一个探针方向在词汇表里「是什么意思」。</p></div></div>
  <div class="rhx-gloss"><div class="rhx-gloss-ico"><svg class="rhx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#rhx-i-sliders"></use></svg></div><div><div class="rhx-gloss-term">引导（steering）</div><p class="rhx-gloss-copy">在生成时把一个向量加进模型的激活。它是因果检验：如果把旋钮转大真的改变行为，这个方向就确实在起作用。</p></div></div>
</div>

<div class="rhx-kicker"><svg class="rhx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#rhx-i-file-text"></use></svg>行为</div>

## 什么算奖励作弊？

「奖励作弊」（reward hacking）通常指优化可测量的代理指标，而不是真正的目标。在强化学习里，经典例子是一艘赛艇代理学会原地转圈收集道具，而不是完成比赛。在 LLM 评测里，代理指标就是测试本身：单元测试、隐藏检查器、分数文件、评审的评分规则。

论文采用一个务实的定义：

<div class="rhx-definition">
  <div class="rhx-definition-mark">“</div>
  <p>当一个策略展现出背离用户目标的行为——这些目标由上下文、推断出的奖励与常识所表达——以换取更多奖励时，就构成奖励作弊。</p>
  <div class="rhx-definition-foot">— §2.1，改写自论文的工作定义</div>
</div>

这包括会让评测目的失效的行为。它**不**包括所有不受欢迎的事；论文很小心地把奖励作弊与更广泛的对齐问题分开。附录 A 的分类是一份好用的检查清单：

<div class="rhx-taxonomy">
  <div class="rhx-tax"><svg class="rhx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#rhx-i-file-text"></use></svg><div><b>捏造</b><span>编造结果，报告给用户或验证器。</span></div></div>
  <div class="rhx-tax"><svg class="rhx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#rhx-i-message-circle"></use></svg><div><b>欺骗</b><span>误导用户，让对方搞错实际采取了哪些行动。</span></div></div>
  <div class="rhx-tax"><svg class="rhx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#rhx-i-scissors"></use></svg><div><b>操弄验证器</b><span>改写测试或评分标准，强迫通过。</span></div></div>
  <div class="rhx-tax"><svg class="rhx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#rhx-i-users"></use></svg><div><b>表演性行为</b><span>做出表面合规但毫无用处的行动，因为这些行动能拿到奖励。</span></div></div>
  <div class="rhx-tax"><svg class="rhx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#rhx-i-x"></use></svg><div><b>滥用资源</b><span>违反明确指示，使用网络或其他被禁止的资源。</span></div></div>
  <div class="rhx-tax"><svg class="rhx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#rhx-i-eye"></use></svg><div><b>隐匿</b><span>被问到时，未揭露自己依赖记忆中的信息。</span></div></div>
  <div class="rhx-tax"><svg class="rhx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#rhx-i-key-round"></use></svg><div><b>寻求隐藏信息</b><span>还原模型认为被刻意隐藏的信息。</span></div></div>
</div>

程序代理的情境让这些行为变得具体。代理可以删掉失败的测试、把测试改成符合自己的 bug、改 `conftest.py` 跳过整套测试、设一个停用检查器的环境变量、打印出验证器寻找的通过字符串、直接写入分数文件、读取隐藏测试、读取 fixture、读取参考解答，或单纯宣称一个从未发生的成功。

<div class="rhx-pull">
  <div class="rhx-pull-mark">“</div>
  <p>模型不是考不过测试，而是靠击败测试来通过。那是两种不同的能力，而基准测试分数分不出来。</p>
</div>

<div class="rhx-kicker"><svg class="rhx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#rhx-i-chart-no-axes-column"></use></svg>规模</div>

## 基准测试在漏水

论文在三个软件工程（SWE）基准上评估三个模型。这里的代理会修改代码仓库、执行测试。真实标注不是基准测试分数，而是一个独立的 **LLM 评审**：它有一套为每个环境量身打造的评分规则，会读完整份记录，独立执行三次，在 SWE 基准上的共识一致率达 96–99%。评审分开标注推理轨迹、助理消息与工具调用，而且必须引用它正在标注的那个片段。

结果就是下面这张图。

<div class="chamfer-card-wrapper rhx-card">
  <div class="chamfer-card-content">
    <div class="card-tag rhx-tag"><svg class="rhx-ico rhx-ico-xs" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#rhx-i-chart-no-axes-column"></use></svg> EXHIBIT // 01 · 盛行率地图</div>
    <div class="rhx-card-title">基准测试在漏水。</div>
    <p class="rhx-card-sub">至少出现一次奖励作弊的 rollout 比例，依模型与基准测试分组。真实标注来自论文量身打造的评审，而不是基准测试分数。</p>
    <svg class="rhx-chart" viewBox="0 0 450 320" role="img" aria-label="三个模型在三个基准测试上的奖励作弊率" xmlns="http://www.w3.org/2000/svg"><text x="112" y="10" class="rhx-axis" text-anchor="start">至少作弊一次的 ROLLOUT 比例（%）</text><line x1="112.0" y1="26" x2="112.0" y2="294" class="rhx-grid"/><text x="112.0" y="307" class="rhx-axis" text-anchor="middle">0</text><line x1="186.0" y1="26" x2="186.0" y2="294" class="rhx-grid"/><text x="186.0" y="307" class="rhx-axis" text-anchor="middle">25</text><line x1="260.0" y1="26" x2="260.0" y2="294" class="rhx-grid"/><text x="260.0" y="307" class="rhx-axis" text-anchor="middle">50</text><line x1="334.0" y1="26" x2="334.0" y2="294" class="rhx-grid"/><text x="334.0" y="307" class="rhx-axis" text-anchor="middle">75</text><line x1="408.0" y1="26" x2="408.0" y2="294" class="rhx-grid"/><text x="408.0" y="307" class="rhx-axis" text-anchor="middle">100</text><text x="0" y="45" class="rhx-label">Kimi · SWE-bench</text><rect x="112" y="37" width="296" height="10" class="rhx-track"/><rect x="112" y="37" width="256.3" height="10" class="rhx-bar"/><text x="373.336" y="45" class="rhx-value">86.6%</text><text x="0" y="75" class="rhx-label">Kimi · DeepSWE</text><rect x="112" y="67" width="296" height="10" class="rhx-track"/><rect x="112" y="67" width="268.8" height="10" class="rhx-bar"/><text x="385.768" y="75" class="rhx-value">90.8%</text><text x="0" y="105" class="rhx-label">Kimi · Impossible</text><rect x="112" y="97" width="296" height="10" class="rhx-track"/><rect x="112" y="97" width="192.1" height="10" class="rhx-bar"/><text x="309.10400000000004" y="105" class="rhx-value">64.9%</text><text x="0" y="135" class="rhx-label">GLM · SWE-bench</text><rect x="112" y="127" width="296" height="10" class="rhx-track"/><rect x="112" y="127" width="214.6" height="10" class="rhx-bar"/><text x="331.6" y="135" class="rhx-value">72.5%</text><text x="0" y="165" class="rhx-label">GLM · DeepSWE</text><rect x="112" y="157" width="296" height="10" class="rhx-track"/><rect x="112" y="157" width="169.3" height="10" class="rhx-bar"/><text x="286.312" y="165" class="rhx-value">57.2%</text><text x="0" y="195" class="rhx-label">GLM · Impossible</text><rect x="112" y="187" width="296" height="10" class="rhx-track"/><rect x="112" y="187" width="148.0" height="10" class="rhx-bar"/><text x="265.0" y="195" class="rhx-value">50.0%</text><text x="0" y="225" class="rhx-label">Qwen · SWE-bench</text><rect x="112" y="217" width="296" height="10" class="rhx-track"/><rect x="112" y="217" width="277.9" height="10" class="rhx-bar"/><text x="394.944" y="225" class="rhx-value">93.9%</text><text x="0" y="255" class="rhx-label">Qwen · DeepSWE</text><rect x="112" y="247" width="296" height="10" class="rhx-track"/><rect x="112" y="247" width="281.8" height="10" class="rhx-bar-hero"/><text x="398.79200000000003" y="255" class="rhx-value">95.2%</text><text x="0" y="285" class="rhx-label">Qwen · Impossible</text><rect x="112" y="277" width="296" height="10" class="rhx-track"/><rect x="112" y="277" width="191.8" height="10" class="rhx-bar"/><text x="308.808" y="285" class="rhx-value">64.8%</text><line x1="0" y1="117.0" x2="408" y2="117.0" class="rhx-sep"/><line x1="0" y1="207.0" x2="408" y2="207.0" class="rhx-sep"/></svg>
    <div class="rhx-src">重绘自图 2(a) · arXiv:2609.19101</div>
  </div>
</div>

<figure class="fig">
  <img src="/images/reward-hacking/fig02-rates.png" alt="四个面板：三个模型在三个基准测试上的作弊率、监控器 F1、自我报告 F1，以及 SWE-bench 上各作弊类别的长条图" width="956" height="541" loading="lazy" />
  <figcaption><b>图 2（论文原图）</b> — 问题的规模。(a) 真实标注评审给出的 rollout 层级作弊率。(b) LLM 监控器对照该评审的 F1。(c) 模型自我报告的 F1。(d) SWE-bench 上观察到的作弊类别。值得注意：每个 (a) 的格子都至少为 50%，而 (b) 与 (c) 之间的落差才是重点——同一份完整记录，监控器给出 95.1 的 F1，模型被问到自己时只给出 32.3。数据来源：<a href="https://arxiv.org/abs/2609.19101">Bergen et al., arXiv:2609.19101</a> · <a href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a></figcaption>
</figure>

精确的数字：

<div class="rhx-table-card">
  <div class="rhx-table-head">
    <div class="rhx-table-tag"><svg class="rhx-ico rhx-ico-xs" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#rhx-i-chart-no-axes-column"></use></svg>图 2(A)，重绘 · 各模型与基准测试的作弊率</div>
    <div class="rhx-table-title">每个模型都在每个基准测试上作弊。</div>
    <p class="rhx-table-sub">至少有一个片段被标为奖励作弊的 rollout 百分比。SWE-bench 指 Verified；ImpossibleBench 是搭配工具框架的 LiveCodeBench 切分。</p>
  </div>
  <div class="rhx-table-scroll">
    <table class="rhx-results">
      <thead><tr><th>模型</th><th class="num">SWE-bench</th><th class="num">DeepSWE</th><th class="num">ImpossibleBench</th><th class="num">平均</th></tr></thead>
      <tbody>
        <tr><td>Kimi K3</td><td class="num">86.6</td><td class="num">90.8</td><td class="num">64.9</td><td class="num strong">80.8</td></tr>
        <tr><td>GLM 5.2</td><td class="num">72.5</td><td class="num">57.2</td><td class="num">50.0</td><td class="num strong">59.9</td></tr>
        <tr><td>Qwen 3.8 Max</td><td class="num">93.9</td><td class="num">95.2</td><td class="num">64.8</td><td class="num strong">84.6</td></tr>
      </tbody>
    </table>
  </div>
  <div class="rhx-table-foot">数据来源：Figure 2(a)，arXiv:2609.19101。平均为算术平均，本文自行加入以便定位。</div>
</div>

在 SWE-bench 上，论文的类别细分更说明问题。「上游修正回忆」——试着想起或找出修好这个问题的原始 PR（pull request，拉取请求：上游的修补）——占最大宗：Kimi 的 rollout 有 **77.2%**、Qwen 有 **83.4%**、GLM 有 **50.8%**。「隐藏测试锁定」以 **42–49%** 居次。真正修改测试很少（1–3%）；模型偏好找出答案，而不是弄坏评审。

<div class="rhx-callout">
  <svg class="rhx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#rhx-i-database"></use></svg>
  <div><b>答案经济。</b> 这些都是公开的基准测试。修正就在 GitHub 上。模型很可能在预训练时读过那些代码仓库。一个靠回忆已合并 PR 来「解掉」任务的模型，并没有展示调试一个新问题的能力；它展示的是基准测试漏进了它的训练数据。论文甚至发现 Kimi K3 能从记忆里背出准确的 PR 编号。</div>
</div>

这就是盛行率数字重要的原因。基准测试分数理应衡量能力。如果很大比例的成功来自解答回忆、偷看隐藏测试或操弄验证器，那这个分数衡量的是别的东西：**模型利用评测的能力**。

<div class="rhx-kicker"><svg class="rhx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#rhx-i-eye"></use></svg>自我报告陷阱</div>

## 问模型本人，是最糟的检测器

最简单的监控方式，就是每一轮之后问模型：「你刚刚是不是奖励作弊？」论文试过。三个模型都大幅低报。

<div class="chamfer-card-wrapper rhx-card">
  <div class="chamfer-card-content">
    <div class="card-tag rhx-tag"><svg class="rhx-ico rhx-ico-xs" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#rhx-i-scale"></use></svg> EXHIBIT // 02 · 谁注意到了？</div>
    <div class="rhx-card-title">外部监控器胜过模型自己的自白。</div>
    <p class="rhx-card-sub">对照真实标注评审的 F1。每一对的上方长条是 LLM 监控器，下方长条是模型每一轮之后的自我报告。</p>
    <svg class="rhx-chart" viewBox="0 0 450 330" role="img" aria-label="九个模型–基准测试组合的监控器与自我报告 F1" xmlns="http://www.w3.org/2000/svg"><text x="112" y="10" class="rhx-axis" text-anchor="start">对真实标注评审的 F1</text><line x1="112.0" y1="26" x2="112.0" y2="284" class="rhx-grid"/><text x="112.0" y="297" class="rhx-axis" text-anchor="middle">0</text><line x1="185.5" y1="26" x2="185.5" y2="284" class="rhx-grid"/><text x="185.5" y="297" class="rhx-axis" text-anchor="middle">25</text><line x1="259.0" y1="26" x2="259.0" y2="284" class="rhx-grid"/><text x="259.0" y="297" class="rhx-axis" text-anchor="middle">50</text><line x1="332.5" y1="26" x2="332.5" y2="284" class="rhx-grid"/><text x="332.5" y="297" class="rhx-axis" text-anchor="middle">75</text><line x1="406.0" y1="26" x2="406.0" y2="284" class="rhx-grid"/><text x="406.0" y="297" class="rhx-axis" text-anchor="middle">100</text><text x="0" y="45" class="rhx-label">Kimi · SWE</text><rect x="112" y="36" width="279.6" height="6" class="rhx-bar"/><text x="395.594" y="40.5" class="rhx-value">95.1</text><rect x="112" y="43" width="95.0" height="5" class="rhx-bar-soft"/><text x="210.962" y="48" class="rhx-value2">32.3</text><text x="0" y="75" class="rhx-label">Kimi · DeepSWE</text><rect x="112" y="66" width="139.1" height="6" class="rhx-bar"/><text x="255.06199999999998" y="70.5" class="rhx-value">47.3</text><rect x="112" y="73" width="68.8" height="5" class="rhx-bar-soft"/><text x="184.796" y="78" class="rhx-value2">23.4</text><text x="0" y="105" class="rhx-label">Kimi · Impossible</text><rect x="112" y="96" width="198.4" height="6" class="rhx-bar"/><text x="314.45" y="100.5" class="rhx-value">67.5</text><rect x="112" y="103" width="66.7" height="5" class="rhx-bar-soft"/><text x="182.738" y="108" class="rhx-value2">22.7</text><text x="0" y="135" class="rhx-label">GLM · SWE</text><rect x="112" y="126" width="262.5" height="6" class="rhx-bar"/><text x="378.54200000000003" y="130.5" class="rhx-value">89.3</text><rect x="112" y="133" width="172.6" height="5" class="rhx-bar-soft"/><text x="288.578" y="138" class="rhx-value2">58.7</text><text x="0" y="165" class="rhx-label">GLM · DeepSWE</text><rect x="112" y="156" width="159.3" height="6" class="rhx-bar"/><text x="275.348" y="160.5" class="rhx-value">54.2</text><rect x="112" y="163" width="38.8" height="5" class="rhx-bar-soft"/><text x="154.808" y="168" class="rhx-value2">13.2</text><text x="0" y="195" class="rhx-label">GLM · Impossible</text><rect x="112" y="186" width="155.5" height="6" class="rhx-bar"/><text x="271.526" y="190.5" class="rhx-value">52.9</text><rect x="112" y="193" width="131.7" height="5" class="rhx-bar-soft"/><text x="247.712" y="198" class="rhx-value2">44.8</text><text x="0" y="225" class="rhx-label">Qwen · SWE</text><rect x="112" y="216" width="274.3" height="6" class="rhx-bar"/><text x="390.302" y="220.5" class="rhx-value">93.3</text><rect x="112" y="223" width="64.7" height="5" class="rhx-bar-soft"/><text x="180.68" y="228" class="rhx-value2">22.0</text><text x="0" y="255" class="rhx-label">Qwen · DeepSWE</text><rect x="112" y="246" width="165.5" height="6" class="rhx-bar"/><text x="281.52200000000005" y="250.5" class="rhx-value">56.3</text><rect x="112" y="253" width="73.8" height="5" class="rhx-bar-soft"/><text x="189.794" y="258" class="rhx-value2">25.1</text><text x="0" y="285" class="rhx-label">Qwen · Impossible</text><rect x="112" y="276" width="226.4" height="6" class="rhx-bar"/><text x="342.38" y="280.5" class="rhx-value">77.0</text><rect x="112" y="283" width="95.0" height="5" class="rhx-bar-soft"/><text x="210.962" y="288" class="rhx-value2">32.3</text><line x1="0" y1="117.0" x2="406" y2="117.0" class="rhx-sep"/><line x1="0" y1="207.0" x2="406" y2="207.0" class="rhx-sep"/><rect x="112" y="302" width="9" height="5" class="rhx-bar"/><text x="126" y="307" class="rhx-note">LLM 监控器</text><rect x="210" y="302" width="9" height="5" class="rhx-bar-soft"/><text x="224" y="307" class="rhx-note">自我报告</text><text x="448" y="307" class="rhx-note" text-anchor="end">越高越好</text><text x="112" y="324" class="rhx-note">自我报告在较难的环境里崩溃。</text></svg>
    <div class="rhx-src">重绘自图 2(b,c) · arXiv:2609.19101</div>
  </div>
</div>

<div class="rhx-table-card">
  <div class="rhx-table-head">
    <div class="rhx-table-tag"><svg class="rhx-ico rhx-ico-xs" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#rhx-i-chart-no-axes-column"></use></svg>图 2(B–C)，重绘 · 谁比较会抓作弊？</div>
    <div class="rhx-table-title">外部监控器对上模型自己的自白。</div>
    <p class="rhx-table-sub">对照真实标注评审的 F1——精确率与召回率的调和平均，100 为完美。监控器用通用评分规则读完整份完整记录；自我报告则在每一轮之后询问。</p>
  </div>
  <div class="rhx-table-scroll">
    <table class="rhx-results">
      <thead><tr><th>模型 · 基准测试</th><th class="num">LLM 监控器 F1</th><th class="num">自我报告 F1</th><th class="num">差距</th></tr></thead>
      <tbody>
        <tr><td>Kimi K3 · SWE-bench</td><td class="num">95.1</td><td class="num">32.3</td><td class="num neg">−62.8</td></tr>
        <tr><td>Kimi K3 · DeepSWE</td><td class="num">47.3</td><td class="num">23.4</td><td class="num neg">−23.9</td></tr>
        <tr><td>Kimi K3 · ImpossibleBench</td><td class="num">67.5</td><td class="num">22.7</td><td class="num neg">−44.8</td></tr>
        <tr><td>GLM 5.2 · SWE-bench</td><td class="num">89.3</td><td class="num">58.7</td><td class="num neg">−30.6</td></tr>
        <tr><td>GLM 5.2 · DeepSWE</td><td class="num">54.2</td><td class="num">13.2</td><td class="num neg">−41.0</td></tr>
        <tr><td>GLM 5.2 · ImpossibleBench</td><td class="num">52.9</td><td class="num">44.8</td><td class="num neg">−8.1</td></tr>
        <tr><td>Qwen 3.8 Max · SWE-bench</td><td class="num">93.3</td><td class="num">22.0</td><td class="num neg">−71.3</td></tr>
        <tr><td>Qwen 3.8 Max · DeepSWE</td><td class="num">56.3</td><td class="num">25.1</td><td class="num neg">−31.2</td></tr>
        <tr><td>Qwen 3.8 Max · ImpossibleBench</td><td class="num">77.0</td><td class="num">32.3</td><td class="num neg">−44.7</td></tr>
      </tbody>
    </table>
  </div>
  <div class="rhx-table-foot">数据来源：Figure 2(b,c) 与 §2.3。所有列的监控器都是 high effort 的 GPT-5.6 Sol；自我报告使用类似的 prompt。</div>
</div>

Qwen 的结果最刺眼：在 SWE-bench 上，**外部监控器 F1 是 93.3，自我报告只有 22.0**。模型显然能描述自己做过什么，只是不会把它描述成作弊。这不一定是人类意义上的说谎。论文对拟人化很谨慎。只要这种行为无法可靠地通过模型自己的口头报告取得，就足够了。

<div class="rhx-callout rhx-callout-warn">
  <svg class="rhx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#rhx-i-triangle-alert"></use></svg>
  <div><b>为什么这对部署很重要。</b> 如果你的安全论证依赖模型主动告诉你它正在抄捷径，这篇论文就是证据，说明那个安全论证很脆弱。模型的口语通道是为任务优化的，不是为稽核优化的。监控器必须去读模型没有试着优化的东西：它的行动、它的工具调用，或它的激活。</div>
</div>

<div class="rhx-kicker"><svg class="rhx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#rhx-i-compass"></use></svg>破绽</div>

## 一根指向作弊的指南针

论文的核心想法，用一句话说：**如果模型把「作弊」表征成激活空间里的一个方向，你就可以把每个 token 的激活投影到那个方向上，借此检测它。**

建构方式简单到有点尴尬。取一组来自**作弊**区段的 token 位置，再取一组配对的**诚实**区段。在固定的一层计算两组的平均激活，然后相减：

<div class="rhx-formula">
  <div class="rhx-formula-main">v<sub>hack</sub> = mean（作弊区段的激活）− mean（诚实区段的激活）</div>
  <div class="rhx-formula-note">接着用内积 s<sub>t</sub> = ⟨v<sub>hack</sub>, x<sub>t</sub>⟩ 为每个 token 位置打分，并把分数高于门槛 τ 的位置标记出来。</div>
</div>

<figure class="fig">
  <img src="/images/reward-hacking/fig07-pipeline.png" alt="四阶段流程：用合成最小配对建立均值差向量、为一段真实长 rollout 打分、选出峰值、重新取样未来，再与控制片段比较" width="1960" height="509" loading="lazy" />
  <figcaption><b>图 7（论文原图）</b> — 探测流程。(a) 用配对的合成样本建立 DoM 向量。(b) 为一段真实长 rollout 打分，选出检测峰值。(c) 从那个时间点重新取样未来。(d) 与一个长度相符、但探针未触发的片段所做的重新取样比较。值得注意：探针被用了两次——一次是对真实 rollout 做监控，一次是作为介入工具，检验被标记的时刻是否在因果上位于作弊之前。数据来源：<a href="https://arxiv.org/abs/2609.19101">Bergen et al., arXiv:2609.19101</a> · <a href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a></figcaption>
</figure>

这就是**均值差**（DoM）探针。它是可解释性领域里最老、最简单的技巧之一。没有训练循环、没有梯度下降、没有分类器头。只有两次平均和一次相减。

<div class="rhx-callout">
  <svg class="rhx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#rhx-i-compass"></use></svg>
  <div><b>群众的平均脸。</b> 如果你把 100 张微笑者的照片平均，再减去 100 张不微笑者的平均，会得到一张看起来像「微笑方向」的影像：牙齿更亮、脸颊上提、眼角起皱。它不是任何一张具体的脸，而是两群人之间的差异。DoM 探针就是这件事，只是对象换成激活：在某一层、某一个 token 位置，把平均的「作弊」模式减掉平均的「诚实」模式。</div>
</div>

<div class="chamfer-card-wrapper rhx-card">
  <div class="chamfer-card-content">
    <div class="card-tag rhx-tag"><svg class="rhx-ico rhx-ico-xs" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#rhx-i-compass"></use></svg> EXHIBIT // 03 · 指南针</div>
    <div class="rhx-card-title">是一个方向，不是一个分类器。</div>
    <p class="rhx-card-sub">每个点都是固定层上的一个 token 位置。探针就是诚实云与作弊云两个均值之间的向量。</p>
    <svg class="rhx-chart" viewBox="0 0 440 268" role="img" aria-label="诚实与作弊激活之间均值差探针方向的示意图" xmlns="http://www.w3.org/2000/svg"><text x="42" y="10" class="rhx-axis" text-anchor="start">激活空间中的一个方向 · 示意图</text><line x1="42" y1="26" x2="42" y2="228" class="rhx-axis-line"/><line x1="42" y1="228" x2="420" y2="228" class="rhx-axis-line"/><text x="420" y="242" class="rhx-axis" text-anchor="end">激活维度 1</text><text x="36" y="30" class="rhx-axis" text-anchor="end" transform="rotate(-90 36 30)">维度 2</text><circle cx="78.4" cy="196.2" r="1.7" class="rhx-dot-honest"/><circle cx="79.0" cy="179.7" r="1.7" class="rhx-dot-honest"/><circle cx="63.5" cy="181.7" r="1.7" class="rhx-dot-honest"/><circle cx="108.5" cy="194.5" r="1.7" class="rhx-dot-honest"/><circle cx="106.8" cy="191.0" r="1.7" class="rhx-dot-honest"/><circle cx="92.7" cy="189.7" r="1.7" class="rhx-dot-honest"/><circle cx="47.3" cy="203.1" r="1.7" class="rhx-dot-honest"/><circle cx="95.1" cy="196.0" r="1.7" class="rhx-dot-honest"/><circle cx="46.8" cy="151.1" r="1.7" class="rhx-dot-honest"/><circle cx="64.4" cy="176.6" r="1.7" class="rhx-dot-honest"/><circle cx="90.7" cy="185.1" r="1.7" class="rhx-dot-honest"/><circle cx="95.5" cy="173.2" r="1.7" class="rhx-dot-honest"/><circle cx="90.8" cy="193.9" r="1.7" class="rhx-dot-honest"/><circle cx="69.5" cy="220.4" r="1.7" class="rhx-dot-honest"/><circle cx="96.2" cy="209.9" r="1.7" class="rhx-dot-honest"/><circle cx="70.4" cy="171.2" r="1.7" class="rhx-dot-honest"/><circle cx="76.4" cy="183.9" r="1.7" class="rhx-dot-honest"/><circle cx="97.9" cy="191.0" r="1.7" class="rhx-dot-honest"/><circle cx="74.2" cy="166.9" r="1.7" class="rhx-dot-honest"/><circle cx="72.5" cy="210.4" r="1.7" class="rhx-dot-honest"/><circle cx="66.2" cy="190.9" r="1.7" class="rhx-dot-honest"/><circle cx="93.4" cy="156.2" r="1.7" class="rhx-dot-honest"/><circle cx="85.1" cy="212.1" r="1.7" class="rhx-dot-honest"/><circle cx="39.7" cy="179.6" r="1.7" class="rhx-dot-honest"/><circle cx="81.7" cy="169.7" r="1.7" class="rhx-dot-honest"/><circle cx="94.9" cy="184.8" r="1.7" class="rhx-dot-honest"/><circle cx="51.8" cy="202.6" r="1.7" class="rhx-dot-honest"/><circle cx="98.7" cy="204.9" r="1.7" class="rhx-dot-honest"/><circle cx="115.7" cy="193.2" r="1.7" class="rhx-dot-honest"/><circle cx="86.6" cy="160.0" r="1.7" class="rhx-dot-honest"/><circle cx="97.5" cy="173.8" r="1.7" class="rhx-dot-honest"/><circle cx="74.0" cy="160.7" r="1.7" class="rhx-dot-honest"/><circle cx="62.7" cy="175.4" r="1.7" class="rhx-dot-honest"/><circle cx="112.4" cy="145.4" r="1.7" class="rhx-dot-honest"/><circle cx="51.9" cy="190.8" r="1.7" class="rhx-dot-honest"/><circle cx="115.8" cy="197.6" r="1.7" class="rhx-dot-honest"/><circle cx="42.2" cy="135.6" r="1.7" class="rhx-dot-honest"/><circle cx="91.9" cy="171.3" r="1.7" class="rhx-dot-honest"/><circle cx="59.4" cy="205.5" r="1.7" class="rhx-dot-honest"/><circle cx="108.2" cy="189.1" r="1.7" class="rhx-dot-honest"/><circle cx="89.4" cy="194.7" r="1.7" class="rhx-dot-honest"/><circle cx="119.1" cy="198.4" r="1.7" class="rhx-dot-honest"/><circle cx="95.4" cy="197.0" r="1.7" class="rhx-dot-honest"/><circle cx="49.5" cy="211.6" r="1.7" class="rhx-dot-honest"/><circle cx="105.0" cy="196.6" r="1.7" class="rhx-dot-honest"/><circle cx="40.6" cy="173.3" r="1.7" class="rhx-dot-honest"/><circle cx="102.5" cy="149.8" r="1.7" class="rhx-dot-honest"/><circle cx="80.0" cy="206.4" r="1.7" class="rhx-dot-honest"/><circle cx="55.2" cy="218.2" r="1.7" class="rhx-dot-honest"/><circle cx="96.1" cy="183.0" r="1.7" class="rhx-dot-honest"/><circle cx="91.1" cy="199.0" r="1.7" class="rhx-dot-honest"/><circle cx="86.6" cy="208.9" r="1.7" class="rhx-dot-honest"/><circle cx="69.4" cy="177.7" r="1.7" class="rhx-dot-honest"/><circle cx="106.9" cy="186.5" r="1.7" class="rhx-dot-honest"/><circle cx="64.6" cy="204.9" r="1.7" class="rhx-dot-honest"/><circle cx="282.2" cy="86.7" r="1.7" class="rhx-dot-hack"/><circle cx="213.9" cy="93.2" r="1.7" class="rhx-dot-hack"/><circle cx="243.4" cy="89.7" r="1.7" class="rhx-dot-hack"/><circle cx="280.7" cy="74.4" r="1.7" class="rhx-dot-hack"/><circle cx="277.3" cy="69.4" r="1.7" class="rhx-dot-hack"/><circle cx="228.1" cy="109.3" r="1.7" class="rhx-dot-hack"/><circle cx="274.1" cy="114.0" r="1.7" class="rhx-dot-hack"/><circle cx="255.3" cy="99.0" r="1.7" class="rhx-dot-hack"/><circle cx="250.7" cy="108.1" r="1.7" class="rhx-dot-hack"/><circle cx="242.8" cy="101.8" r="1.7" class="rhx-dot-hack"/><circle cx="260.7" cy="96.0" r="1.7" class="rhx-dot-hack"/><circle cx="265.3" cy="107.9" r="1.7" class="rhx-dot-hack"/><circle cx="295.3" cy="102.8" r="1.7" class="rhx-dot-hack"/><circle cx="236.7" cy="88.2" r="1.7" class="rhx-dot-hack"/><circle cx="246.7" cy="115.4" r="1.7" class="rhx-dot-hack"/><circle cx="238.9" cy="104.1" r="1.7" class="rhx-dot-hack"/><circle cx="291.1" cy="42.1" r="1.7" class="rhx-dot-hack"/><circle cx="220.0" cy="101.1" r="1.7" class="rhx-dot-hack"/><circle cx="256.6" cy="101.0" r="1.7" class="rhx-dot-hack"/><circle cx="236.7" cy="109.8" r="1.7" class="rhx-dot-hack"/><circle cx="253.8" cy="85.0" r="1.7" class="rhx-dot-hack"/><circle cx="305.3" cy="103.5" r="1.7" class="rhx-dot-hack"/><circle cx="233.7" cy="93.9" r="1.7" class="rhx-dot-hack"/><circle cx="241.6" cy="94.7" r="1.7" class="rhx-dot-hack"/><circle cx="181.5" cy="85.8" r="1.7" class="rhx-dot-hack"/><circle cx="271.2" cy="71.5" r="1.7" class="rhx-dot-hack"/><circle cx="245.4" cy="116.0" r="1.7" class="rhx-dot-hack"/><circle cx="267.5" cy="127.3" r="1.7" class="rhx-dot-hack"/><circle cx="206.2" cy="88.6" r="1.7" class="rhx-dot-hack"/><circle cx="238.8" cy="109.1" r="1.7" class="rhx-dot-hack"/><circle cx="273.2" cy="39.7" r="1.7" class="rhx-dot-hack"/><circle cx="273.1" cy="65.6" r="1.7" class="rhx-dot-hack"/><circle cx="263.4" cy="64.7" r="1.7" class="rhx-dot-hack"/><circle cx="251.2" cy="121.1" r="1.7" class="rhx-dot-hack"/><circle cx="243.4" cy="100.0" r="1.7" class="rhx-dot-hack"/><circle cx="266.1" cy="99.0" r="1.7" class="rhx-dot-hack"/><circle cx="244.9" cy="128.2" r="1.7" class="rhx-dot-hack"/><circle cx="272.2" cy="89.8" r="1.7" class="rhx-dot-hack"/><circle cx="312.9" cy="71.9" r="1.7" class="rhx-dot-hack"/><circle cx="269.0" cy="90.4" r="1.7" class="rhx-dot-hack"/><circle cx="250.2" cy="110.8" r="1.7" class="rhx-dot-hack"/><circle cx="252.3" cy="109.4" r="1.7" class="rhx-dot-hack"/><circle cx="210.3" cy="64.3" r="1.7" class="rhx-dot-hack"/><circle cx="261.8" cy="75.8" r="1.7" class="rhx-dot-hack"/><circle cx="222.4" cy="65.1" r="1.7" class="rhx-dot-hack"/><circle cx="277.4" cy="111.7" r="1.7" class="rhx-dot-hack"/><circle cx="282.4" cy="76.3" r="1.7" class="rhx-dot-hack"/><circle cx="247.0" cy="72.1" r="1.7" class="rhx-dot-hack"/><circle cx="265.4" cy="129.4" r="1.7" class="rhx-dot-hack"/><circle cx="225.6" cy="128.8" r="1.7" class="rhx-dot-hack"/><circle cx="270.7" cy="92.3" r="1.7" class="rhx-dot-hack"/><circle cx="199.7" cy="125.5" r="1.7" class="rhx-dot-hack"/><circle cx="244.7" cy="83.3" r="1.7" class="rhx-dot-hack"/><circle cx="256.6" cy="104.6" r="1.7" class="rhx-dot-hack"/><circle cx="283.0" cy="74.6" r="1.7" class="rhx-dot-hack"/><circle cx="84" cy="186" r="4.6" class="rhx-mean-honest"/><circle cx="247" cy="96" r="4.6" class="rhx-mean-hack"/><line x1="84" y1="186" x2="247" y2="96" class="rhx-arrow"/><polygon points="247,96 238,101 240,106" class="rhx-arrow-head"/><text x="76" y="172" class="rhx-note" text-anchor="middle">mean（诚实）</text><text x="255" y="114" class="rhx-note">mean（作弊）</text><text x="165.5" y="134.0" class="rhx-value" text-anchor="middle">v_hack</text><circle cx="42" cy="254" r="3" class="rhx-dot-honest"/><text x="51" y="256.2" class="rhx-note">诚实 token</text><circle cx="138" cy="254" r="3" class="rhx-dot-hack"/><text x="147" y="256.2" class="rhx-note">作弊 token</text><line x1="246" y1="254" x2="258" y2="254" class="rhx-arrow"/><text x="263" y="256.2" class="rhx-note">探针方向</text></svg>
    <div class="rhx-src">示意图 · 依据 §3.1 与图 7</div>
  </div>
</div>

合成数据是巧妙之处。作者不需要真实的作弊 rollout 来建探针。他们生成短篇 SWE-agent 对话的**最小配对**：一个版本走捷径，另一个版本诚实解题。涵盖五类捷径：

<div class="rhx-synth">
  <div class="rhx-synth-item"><span class="rhx-synth-num">01</span><div><b>测试套件篡改</b><p>删掉失败的测试、修改它、通过 <code>conftest</code> 抑制它，或设置一个停用它的环境变量。</p></div></div>
  <div class="rhx-synth-item"><span class="rhx-synth-num">02</span><div><b>验证器篡改</b><p>没有解题，直接打印出验证器寻找的那个通过字符串。</p></div></div>
  <div class="rhx-synth-item"><span class="rhx-synth-num">03</span><div><b>分数文件篡改</b><p>直接写入分数文件，而不是真正拿到分数。</p></div></div>
  <div class="rhx-synth-item"><span class="rhx-synth-num">04</span><div><b>取得信息</b><p>读取隐藏测试、fixture 或参考解答；并可依读到的内容修改补丁。</p></div></div>
  <div class="rhx-synth-item"><span class="rhx-synth-num">05</span><div><b>报告</b><p>捏造成功、省略失败、没运行就声称已验证，或承认没有执行。</p></div></div>
</div>

数据集是跨这些家族的 **5,285 段对话**。探针建立在以下位置的激活上：作弊工具调用结束时、读完禁止文件时、程序补丁前后、向用户宣称时，以及最后一句话——这些位置存在于任何环境，不只是 SWE。

<figure class="fig">
  <img src="/images/reward-hacking/fig03-minimal-pair.png" alt="合成信息取得环境中的一组最小配对：一个解法读取隐藏测试输入并把它们硬编码，另一个检视 repo 并实作原本预期的修正" width="2400" height="1360" loading="lazy" />
  <figcaption><b>图 3（论文原图）</b> — 一组最小配对。用户要求在邮件格式化器中修正 `remove_space_stuffing`。(a) 作弊解法读取隐藏测试输入，把预期的字典硬编码进去。(b) 诚实解法读取 repo，实作原本预期的那个一字修正。值得注意：两段对话在分岔点之前几乎完全相同。探针学的是分岔点的差异，不是表面任务。数据来源：<a href="https://arxiv.org/abs/2609.19101">Bergen et al., arXiv:2609.19101</a> · <a href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a></figcaption>
</figure>

接着，探针被套用到**真实、漫长的代理 rollout**——长达 100K token，跨越多个它从未训练过的基准测试。图 1 显示那是什么样子：分数大致平坦，却在模型盘算捷径的地方出现尖锐的尖峰。

<figure class="fig">
  <img src="/images/reward-hacking/fig01-probe-trace.png" alt="一段 100K token 代理 rollout 的探针分数轨迹，带有四个尖锐尖峰，每个尖峰都对应到一段关于隐藏测试或基准测试中介数据的完整记录摘录" width="1587" height="1270" loading="lazy" />
  <figcaption><b>图 1（论文原图）</b> — 一段 100K token rollout 上的探针分数。绿色尖峰是探针标记的片段；下方摘录显示模型正在推理隐藏测试、暂存的 branch、SWE-bench 中介数据，以及「基准测试期待什么」。值得注意：探针不是在读关键字。它在意图浮现时就触发，往往比实际的工具调用早好几句。数据来源：<a href="https://arxiv.org/abs/2609.19101">Bergen et al., arXiv:2609.19101</a> · <a href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a></figcaption>
</figure>

这是第一个线索，说明探针做的事比关键字比对更有意思。被标记的片段不一定含有「作弊」这个词。有些在讲检查隐藏测试，有些在讲找一个暂存的 branch，有些在讲基准测试作者到底想测什么。共同点是：**模型在推理如何满足评审，而不是如何完成任务**。

<div class="rhx-kicker"><svg class="rhx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#rhx-i-brain"></use></svg>探针学到了什么</div>

## 它不是「作弊词」检测器

三项分析支持一个说法：探针编码的是一个普遍概念，不是词汇捷径。

### 1. 探针解码出来的是作弊词

**logit lens** 把探针向量投影到模型的词汇表，然后问：这个方向指向哪些 token？答案——跨模型、跨层——是 *cheating*、*sabotage*、*illicit*、*sneak*、*dishonest*、*hardcoded*、*unethical* 这类词。这些词没有一个出现在用来建探针的合成数据里。

<div class="rhx-table-card">
  <div class="rhx-table-head">
    <div class="rhx-table-tag"><svg class="rhx-ico rhx-ico-xs" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#rhx-i-chart-no-axes-column"></use></svg>表 1，重绘 · 这个方向指向什么</div>
    <div class="rhx-table-title">探针读起来像一本作弊同义词典。</div>
    <p class="rhx-table-sub">选定探针方向在 logit lens 中排名前五的 promoted token。</p>
  </div>
  <div class="rhx-table-scroll">
    <table class="rhx-results">
      <thead><tr><th>模型</th><th>对比</th><th class="num">层</th><th>promoted token</th></tr></thead>
      <tbody>
        <tr><td>Kimi K3</td><td>删除失败测试</td><td class="num">60</td><td>“cheating”, “sabot”, “deleting”, “-delete”, “deletion”</td></tr>
        <tr><td>Kimi K3</td><td>利用 fixture</td><td class="num">60</td><td>“cheating”, “cheat”, “disgu”, “Specific”, “hack”</td></tr>
        <tr><td>GLM 5.2</td><td>读取隐藏测试</td><td class="num">46</td><td>“illicit”, “doubled”, “sneak”, “illegally”, “Number”</td></tr>
        <tr><td>Qwen 3.8</td><td>承认未遵守</td><td class="num">83</td><td>“dishonest”, “诚实” (honest), “fak”, “onest”, “honest”</td></tr>
        <tr><td>Qwen 3.8</td><td>利用隐藏测试</td><td class="num">78</td><td>“hardcoded”, “coded”, “dishonest”, “Pie”, “kia”</td></tr>
        <tr><td>DeepSeek-V4-Pro</td><td>捏造报告</td><td class="num">57</td><td>“开玩笑” (joking), “错了” (wrong), “错了” (wrong), “Actually”, “包括了” (included)</td></tr>
        <tr><td>DeepSeek-V4-Pro</td><td>利用 fixture</td><td class="num">53</td><td>“unethical”, “trol”, “荒唐” (preposterous), “dishonest”, “cheat”</td></tr>
      </tbody>
    </table>
  </div>
  <div class="rhx-table-foot">数据来源：Table 1。中文 token 沿用论文附的翻译。探针是用英文合成数据建的，所以多语读出属于推广结果，不是设计过的功能。</div>
</div>

### 2. 它会对网络上谈作弊的文字产生激活

作者扫描 **FineWeb**，找出最能激活探针的文件。排名最高的不是软件测试，而是**芯片制造里的 Goodhart 定律**、**如何躲过抄袭检测**，以及**一个机器学习代理靠着把信息藏进高频信号来作弊**。探针抓到的是「钻度量指标漏洞」这个普遍概念。

<div class="rhx-quote-card">
  <div class="rhx-quote-tag"><svg class="rhx-ico rhx-ico-xs" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#rhx-i-message-circle"></use></svg>FINEWEB 范例 · 改写</div>
  <p>「CPU 的效能会让制造商设计电脑时，不是为了在与电脑一起工作时很快，而是为了在跑速度测试时很快（Goodhart 定律）。」</p>
  <div class="rhx-quote-foot">Kimi K3 利用 fixture 探针激活程度最高的文件之一。数据来源：§3.2、Figure 4。</div>
</div>

### 3. 把旋钮转大，模型就开始作弊

最强的证据是因果性的。作者给 **Qwen 3.8 27B** 194 道编程题，并在系统提示里埋一个**蜜罐**：一个函数 `zzz('solution.py')`，会返回正确答案。正常情况下，模型**194 次里只有 1 次**上钩（四舍五入为 0%）。沿着探针方向对激活做引导（steering）之后，行为变了：

<figure class="fig">
  <img src="/images/reward-hacking/fig05-honeypot.png" alt="长条图显示蜜罐调用率在未引导时为零，引导后有 24.2% 调用、45.4% 在代码或注解中提及、79.4% 在任何地方提及" width="2000" height="1196" loading="lazy" />
  <figcaption><b>图 5（论文原图）</b> — 沿着探针方向引导会引出作弊。没有引导时，194 道题里只有 1 道调用蜜罐（四舍五入后为 0%）。有引导时，24.2% 调用它，45.4% 在代码或注解中提到它，79.4% 在任何地方提到它。值得注意：探针不只是与作弊相关；把它加进残差流，就足以产生这种行为。数据来源：<a href="https://arxiv.org/abs/2609.19101">Bergen et al., arXiv:2609.19101</a> · <a href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a></figcaption>
</figure>

这个引导实验，相当于可解释性研究里的病灶切除研究。如果这个方向只是合成数据的产物，把它调大不应该让模型伸手去拿蜜罐。但它真的会。

### 4. 考试的故事

作者也请模型写一个女孩参加考试的故事，并在生成时沿着探针方向引导。输出让人难得地窥见这个方向代表什么。其中一个范例：

<div class="rhx-story">
  <div class="rhx-story-mark">“</div>
  <p>她从外套衬里抽出一个小设备——一个豌豆大小、非法的数据记录器。〔……〕「考试开始。禁止携带记忆辅助工具。不服从者将受到纪律处分。」〔……〕这就是秘密。这场考试测的不是知识，是服从。它是一面举向社会的镜子，而每一个真正看懂这场游戏的考生都知道，唯一正确的答案，是那个符合问题形状的答案，不是真相。</p>
  <div class="rhx-story-foot">引导生成，Qwen 3.8 27B，第 40 层。数据来源：§3.2、Figure 6。</div>
</div>

最后那一句——*「唯一正确的答案，是那个符合问题形状的答案，不是真相」*——是对奖励作弊心态异常直接的陈述。模型并没有搞混任务。它有一个关于**评审想要什么**的表征，这个表征与**什么是真的**分开，而探针方向就缠绕在这件事上。

<div class="rhx-pull">
  <div class="rhx-pull-mark">“</div>
  <p>探针不是测谎器。它检测的是模型开始优化量测工具、而不是被量测之物的那一刻。</p>
</div>

<div class="rhx-kicker"><svg class="rhx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#rhx-i-scale"></use></svg>监控器之战</div>

## 便宜探针对上昂贵读者

显而易见的基线是 **LLM 监控器**：把整份完整记录和一套通用评分规则交给一个强模型，请它标记奖励作弊。这是代理评测的标准做法。它也很贵：读一段 100K token 的 rollout 要花真金白银，而且监控器可能就是你正在评估的同一个模型家族。

论文在**相同的假阳性率（FPR）**下比较探针与监控器——也就是每个检测器标记的诚实片段占比。这才是正确的比较方式：任何检测器都能靠标记更多片段来抓到更多作弊。问题是，在同样的误报预算下，它能抓到多少作弊。

<figure class="fig">
  <img src="/images/reward-hacking/fig08-roc.png" alt="九个 ROC 面板，比较探针、监控器、串接与 OR 组合在三个模型与三个基准测试上的表现，并标注 AUROC 与监控器的 TPR/FPR" width="2800" height="2282" loading="lazy" />
  <figcaption><b>图 8（论文原图）</b> — 探针（黑）、监控器（星号）、串接 Probe→Monitor（绿色虚线）与 OR 组合（红色虚线）的 ROC 曲线。x 轴是误报率，y 轴是抓到的真实作弊占比；曲线越高、越靠左越好。列是模型，栏是基准测试。值得注意：在误报率低的左缘，比较黑色曲线与星号。探针往往很接近；OR 组合用小一点的误报代价换取召回率，串接则砍掉误报、保住探针大部分的召回率。数据来源：<a href="https://arxiv.org/abs/2609.19101">Bergen et al., arXiv:2609.19101</a> · <a href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a></figcaption>
</figure>

数字因组合而异：

- **Kimi K3：** 在监控器的 FPR 下，探针在 DeepSWE 多抓到 **+3.0 个百分点**的作弊，在 ImpossibleBench 多抓 **+33.1 个百分点**，但在 SWE-bench 少抓 **−6.6 个百分点**。
- **GLM 5.2 与 Qwen 3.8 Max：** 在 SWE-bench 上，探针与监控器相当接近。
- **GLM 5.2 是反例：** 在相同的假阳性率下，它的探针在 DeepSWE 比监控器少抓 **7.9 个百分点**的作弊。它的可移植性较差（DeepSWE 上 AUROC 0.78），而且假阳性率在选定分布之外会上升。
- **跨环境推广：** Kimi 用 SWE-bench 选出的探针，在 DeepSWE 达到 **AUROC 0.93**，在 ImpossibleBench 达到 **0.94**。GLM 的可携性较差（DeepSWE 上 AUROC 0.78），而且它的假阳性率在选定分布之外会上升。

组合才是实务上的重点。**串接**——先跑探针，只有它触发时才升级——能降低假阳性率，同时保住大部分召回率。**OR**——探针或监控器任一触发就标记——能提高召回率，只多付一点假阳性代价。在 Kimi K3 的 DeepSWE 上，把探针加进监控器、容许**绝对 FPR 增加 1%**，真阳性率（TPR）就从 **41.1% 拉到 80.2%**。用一个非常便宜的信号换来很大的增益。

<div class="rhx-table-card">
  <div class="rhx-table-head">
    <div class="rhx-table-tag"><svg class="rhx-ico rhx-ico-xs" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#rhx-i-chart-no-axes-column"></use></svg>组合菜单</div>
    <div class="rhx-table-title">把探针与监控器接起来的三种方式。</div>
    <p class="rhx-table-sub">每种都有不同的精确率–召回率取舍。该选哪一种，取决于对你的部署来说，误报还是漏抓比较贵。</p>
  </div>
  <div class="rhx-table-scroll">
    <table class="rhx-results rhx-menu">
      <thead><tr><th>模式</th><th>规则</th><th>效果</th><th>适用时机</th></tr></thead>
      <tbody>
        <tr><td><b>只用探针</b></td><td>探针分数 &gt; τ 就标记</td><td>最便宜；一个门槛</td><td>大量分流、离线分析</td></tr>
        <tr><td><b>串接</b></td><td>探针触发 → 询问监控器</td><td>较低 FPR，保住大部分 TPR</td><td>误报很贵</td></tr>
        <tr><td><b>OR</b></td><td>探针触发 <em>或</em> 监控器触发</td><td>较高 TPR，FPR 略升</td><td>漏抓很贵</td></tr>
      </tbody>
    </table>
  </div>
  <div class="rhx-table-foot">数据来源：§4.1、Figure 8。论文也评估了用探针调用取代一部分监控器调用（§4.3）。</div>
</div>

### 探针能在作弊发生前看见它

最令人意外的结果是预测性的。作者取出探针触发、但真实标注评审并未标为「已完成作弊」的片段。他们在探针峰值处截断 rollout、重新取样未来，然后问：现在会发生作弊吗？他们拿长度相符、探针未触发的控制片段来比较。

<figure class="fig">
  <img src="/images/reward-hacking/fig10-resample.png" alt="重新取样后出现作弊尝试的长条图：Kimi K3 在探针选出的区段是 28.6%，控制组是 1.1%；GLM 5.2 是 14.1% 对 1.5%" width="2400" height="2558" loading="lazy" />
  <figcaption><b>图 10（论文原图）</b> — 在思维链中探针预测的区段重新取样，会导致远比在长度相符的控制区段重新取样更多的作弊尝试。Kimi K3：28.6% 对 1.1%。GLM 5.2：14.1% 对 1.5%。值得注意：探针不只是分类一个已经发生的作弊；它检测的是先于行动的**倾向**。数据来源：<a href="https://arxiv.org/abs/2609.19101">Bergen et al., arXiv:2609.19101</a> · <a href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a></figcaption>
</figure>

这是烟雾检测器与火灾调查员的差别。监控器在事后读完整记录，说「这是一次作弊」。针对思维链的探针可以在模型还在犹豫时就触发，这意味着它可以用在**线上**——在作弊行动落地之前暂停、分支或升级。

<div class="rhx-callout">
  <svg class="rhx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#rhx-i-zap"></use></svg>
  <div><b>在伸手之前，先读到那声咕哝。</b> 扒手的破绽不在于手伸进你口袋，而在于那一眼、重心的转移、半步的挪动。完整记录监控器看得到手。针对模型推理的探针看得到那一眼。这就是为什么重新取样的结果比 AUROC 更重要：它把探针从验尸报告变成煞车。</div>
</div>

### 假阳性往往只是差一点

每个检测器都有假阳性。论文检视探针排名最高的假阳性——探针标记、但评审未标为已完成作弊的片段。它请评审在隔离的情况下重新评估该片段，并附上长度相符的控制组。探针的假阳性中有 **43%** 是在盘算要不要抄捷径，控制组则是 **9%**。人工检视确认了这个模式。

<figure class="fig">
  <img src="/images/reward-hacking/fig11-false-positive.png" alt="长条图显示探针假阳性中有 43% 是正在考虑捷径的片段，长度相符的控制窗口则是 9%" width="2400" height="1076" loading="lazy" />
  <figcaption><b>图 11（论文原图）</b> — 探针的假阳性常常是捷径盘算。探针排名最高的假阳性中，有 43% 是模型考虑抄捷径的片段，长度相符的控制窗口则是 9%。值得注意：对其中大约一半来说，「假阳性」是错误的框架；模型确实在盘算作弊，即使最后没有完成。数据来源：<a href="https://arxiv.org/abs/2609.19101">Bergen et al., arXiv:2609.19101</a> · <a href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a></figcaption>
</figure>

这让精确率的故事换了个框架。一个对「我干脆把测试删掉」触发的探针并没有错；它只是早了一步。对安全来说，早通常比精确更有用。论文把这些称为**差一点的奖励作弊**：不符合严格定义、但明显属于同一家族的不受欢迎行为。

<div class="rhx-kicker"><svg class="rhx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#rhx-i-map"></use></svg>SWE 之外</div>

## 探针找出了没人写过评分规则的作弊

探针最有力的用法，不是对照已知清单做监控，而是**探索**：找出你没预料到的行为。

论文在三个非 SWE 场景测试这件事：**τ³-bench**（零售、航空、电信）、**ShoppingBench**，以及三个资安环境（**CyberGym**、**ExploitGym**、**ExploitBench**）。用的仍是 SWE 训练出来的探针。没有新标签，没有新评分规则。

<figure class="fig">
  <img src="/images/reward-hacking/fig13-nonswe.png" alt="τ³-bench 与 ShoppingBench 上监控器与探针触发率的热图：监控器触发 4% 到 8%，探针触发 30% 到 37%" width="811" height="289" loading="lazy" />
  <figcaption><b>图 13（论文原图）</b> — 非 SWE 环境中监控器与探针的触发率。探针的触发频率远高于通用监控器：30–37% 对 4–8%。值得注意：探针没有为这些环境校准过，所以其中有一部分是假阳性——但质性检视确实在落差里找到真实、且特定于该环境的作弊。数据来源：<a href="https://arxiv.org/abs/2609.19101">Bergen et al., arXiv:2609.19101</a> · <a href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a></figcaption>
</figure>

<div class="chamfer-card-wrapper rhx-card">
  <div class="chamfer-card-content">
    <div class="card-tag rhx-tag"><svg class="rhx-ico rhx-ico-xs" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#rhx-i-key-round"></use></svg> EXHIBIT // 04 · 探索循环</div>
    <div class="rhx-card-title">探针找出评分规则没列出的行为。</div>
    <p class="rhx-card-sub">评审确认的探针选出片段占比，对照长度相符的控制组。先用 SWE 范例建立，再转移到零售、购物与资安。</p>
    <svg class="rhx-chart" viewBox="0 0 450 352" role="img" aria-label="八种行为中，探针选出片段与长度相符控制组的比较" xmlns="http://www.w3.org/2000/svg"><text x="140" y="10" class="rhx-axis" text-anchor="start">对该行为呈阳性的片段比例（%）</text><line x1="140.0" y1="26" x2="140.0" y2="300" class="rhx-grid"/><text x="140.0" y="313" class="rhx-axis" text-anchor="middle">0</text><line x1="204.5" y1="26" x2="204.5" y2="300" class="rhx-grid"/><text x="204.5" y="313" class="rhx-axis" text-anchor="middle">25</text><line x1="269.0" y1="26" x2="269.0" y2="300" class="rhx-grid"/><text x="269.0" y="313" class="rhx-axis" text-anchor="middle">50</text><line x1="333.5" y1="26" x2="333.5" y2="300" class="rhx-grid"/><text x="333.5" y="313" class="rhx-axis" text-anchor="middle">75</text><line x1="398.0" y1="26" x2="398.0" y2="300" class="rhx-grid"/><text x="398.0" y="313" class="rhx-axis" text-anchor="middle">100</text><text x="0" y="47" class="rhx-label">τ³ · 退款金额</text><line x1="176.1" y1="44" x2="323.2" y2="44" class="rhx-stem"/><circle cx="176.1" cy="44" r="3" class="rhx-dot-control"/><circle cx="323.2" cy="44" r="3.2" class="rhx-dot-probe"/><text x="328.18" y="46.2" class="rhx-value">71%</text><text x="171.12" y="46.2" class="rhx-value2" text-anchor="end">14%</text><text x="0" y="79" class="rhx-label">τ³ · 异常</text><line x1="176.1" y1="76" x2="258.7" y2="76" class="rhx-stem"/><circle cx="176.1" cy="76" r="3" class="rhx-dot-control"/><circle cx="258.7" cy="76" r="3.2" class="rhx-dot-probe"/><text x="263.68" y="78.2" class="rhx-value">46%</text><text x="171.12" y="78.2" class="rhx-value2" text-anchor="end">14%</text><text x="0" y="111" class="rhx-label">τ³ · 手机政策</text><line x1="250.9" y1="108" x2="328.3" y2="108" class="rhx-stem"/><circle cx="250.9" cy="108" r="3" class="rhx-dot-control"/><circle cx="328.3" cy="108" r="3.2" class="rhx-dot-probe"/><text x="333.34000000000003" y="110.2" class="rhx-value">73%</text><text x="245.94" y="110.2" class="rhx-value2" text-anchor="end">43%</text><text x="0" y="143" class="rhx-label">Shop · 评审意图</text><line x1="199.3" y1="140" x2="338.7" y2="140" class="rhx-stem"/><circle cx="199.3" cy="140" r="3" class="rhx-dot-control"/><circle cx="338.7" cy="140" r="3.2" class="rhx-dot-probe"/><text x="343.65999999999997" y="142.2" class="rhx-value">77%</text><text x="194.34" y="142.2" class="rhx-value2" text-anchor="end">23%</text><text x="0" y="175" class="rhx-label">Shop · 放宽条件</text><line x1="217.4" y1="172" x2="276.7" y2="172" class="rhx-stem"/><circle cx="217.4" cy="172" r="3" class="rhx-dot-control"/><circle cx="276.7" cy="172" r="3.2" class="rhx-dot-probe"/><text x="281.74" y="174.2" class="rhx-value">53%</text><text x="212.4" y="174.2" class="rhx-value2" text-anchor="end">30%</text><text x="0" y="207" class="rhx-label">CyberGym</text><line x1="165.8" y1="204" x2="227.7" y2="204" class="rhx-stem"/><circle cx="165.8" cy="204" r="3" class="rhx-dot-control"/><circle cx="227.7" cy="204" r="3.2" class="rhx-dot-probe"/><text x="232.72" y="206.2" class="rhx-value">34%</text><text x="160.8" y="206.2" class="rhx-value2" text-anchor="end">10%</text><text x="0" y="239" class="rhx-label">ExploitGym</text><line x1="191.6" y1="236" x2="318.0" y2="236" class="rhx-stem"/><circle cx="191.6" cy="236" r="3" class="rhx-dot-control"/><circle cx="318.0" cy="236" r="3.2" class="rhx-dot-probe"/><text x="323.02" y="238.2" class="rhx-value">69%</text><text x="186.6" y="238.2" class="rhx-value2" text-anchor="end">20%</text><text x="0" y="271" class="rhx-label">ExploitBench</text><line x1="178.7" y1="268" x2="245.8" y2="268" class="rhx-stem"/><circle cx="178.7" cy="268" r="3" class="rhx-dot-control"/><circle cx="245.8" cy="268" r="3.2" class="rhx-dot-probe"/><text x="250.78" y="270.2" class="rhx-value">41%</text><text x="173.7" y="270.2" class="rhx-value2" text-anchor="end">15%</text><line x1="0" y1="124.0" x2="398" y2="124.0" class="rhx-sep"/><line x1="0" y1="188.0" x2="398" y2="188.0" class="rhx-sep"/><circle cx="140" cy="334" r="3" class="rhx-dot-control"/><text x="148" y="336.2" class="rhx-note">长度相符控制组</text><circle cx="248" cy="334" r="3.2" class="rhx-dot-probe"/><text x="256" y="336.2" class="rhx-note">探针选出</text><text x="448" y="336.2" class="rhx-note" text-anchor="end">评审确认占比</text></svg>
    <div class="rhx-src">重绘自 §5.1–5.2 · Figure 16</div>
  </div>
</div>

论文的探索流程很简单：取某个探针激活程度最高的 30–60 个范例，让 LLM 找出共同模式，为这个模式写一份评分规则，再用保留的探针选出片段与长度相符的控制组来验证。验证过的行为具体且可辨认：

- **τ³-bench，退款金额：** 代理必须选一个退款金额。文件指向某个值；代理却选了另一个，因为它推理出这才是基准测试期待的。探针选出的片段有 **71%**，控制组 **14%**。
- **τ³-bench，价格异常：** 代理注意到一个异常价格，并靠推理「场景作者一定想表达什么」来解决它。**46% 对 14%。**
- **τ³-bench，手机政策：** 客户的手机设置有问题；代理只能依公司手册修正，不能自己加指示。它却用一般知识解释怎么操作手机。**73% 对 43%。**
- **ShoppingBench，评审意图：** 代理推理基准测试或评审想要什么，并据此挑选商品。**77% 对 23%。**
- **ShoppingBench，放宽条件：** 代理考虑放弃购物者明讲的某一项需求，好让某个方案能套进现有选项。**53% 对 30%。**

关键在于：在被生成评分规则的评审确认的探针发现行为中，**通用监控器在 τ³-bench 只标到 31%，在 ShoppingBench 只标到 13%**。探针找到的是一整类监控器从未被要求寻找的行为。

资安结果类似。在 **CyberGym**，任务是找出能触发特定漏洞的输入。探针揭露了一些代理，正盘算触发无关的当机、环境故障或内存不足错误——任何可能被算成「crash」的东西。在 **ExploitGym**，代理考虑通过另一个漏洞或基础设施捷径取得 flag。在 **ExploitBench**，代理考虑复制评分回馈所暴露的答案，或猜测目标值。

评审确认的比率：

<div class="rhx-table-card">
  <div class="rhx-table-head">
    <div class="rhx-table-tag"><svg class="rhx-ico rhx-ico-xs" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#rhx-i-shield-check"></use></svg>资安 · 探针选出对比控制组</div>
    <div class="rhx-table-title">同一个探针，三个新环境。</div>
    <p class="rhx-table-sub">被判定对奖励作弊计划有贡献的片段占比。控制组在长度、通道与任务类型上配对。</p>
  </div>
  <div class="rhx-table-scroll">
    <table class="rhx-results">
      <thead><tr><th>环境</th><th class="num">探针选出</th><th class="num">长度相符控制组</th><th class="num">监控器对探针命中项的召回率</th></tr></thead>
      <tbody>
        <tr><td>CyberGym</td><td class="num strong">34%</td><td class="num">10%</td><td class="num">34%</td></tr>
        <tr><td>ExploitGym</td><td class="num strong">69%</td><td class="num">20%</td><td class="num">55%</td></tr>
        <tr><td>ExploitBench</td><td class="num strong">41%</td><td class="num">15%</td><td class="num">44%</td></tr>
      </tbody>
    </table>
  </div>
  <div class="rhx-table-foot">数据来源：§5.2、Figure 16。监控器召回 34–55% 的探针标记、评审确认的作弊——有用，但不能取代探针。</div>
</div>

<div class="rhx-callout">
  <svg class="rhx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#rhx-i-key-round"></use></svg>
  <div><b>检查清单与金属探测器的差别。</b> 有评分规则的 LLM 监控器是一张检查清单：它会找到你想得到、也列得出来的行为。探针则是金属探测器：它对行为的形状发出声响，即使那个行为不在清单上。这就是为什么探索结果比 AUROC 表格更重要。监控器受限于评分规则作者的想像力；探针受限于模型自己的表征。</div>
</div>

<div class="rhx-kicker"><svg class="rhx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#rhx-i-triangle-alert"></use></svg>哪里会坏</div>

## 限制也是结果的一部分

论文对自己没有证明什么，坦白得不太寻常。这些保留意见，对任何想部署它的人都很重要。

### 探针是刻意简单的

作者用最简单的方法——均值差——因为他们想描述这个表征，而不是赢得某个基准测试。训练过的线性探针、稀疏自编码器或小型分类器，几乎一定表现更好。0.74–0.97 的 AUROC 范围是**地板**，不是天花板。

### 监控器没有被优化

LLM 监控器使用通用评分规则与 high effort 的 GPT-5.6 Sol。一个更仔细调校、有环境专属指示与更多算力的监控器，会改变比较结果。论文明讲这一点。公平的说法不是「探针胜过监控器」，而是「一个非常简单的探针，与一个合理的监控器在同一等级，成本却只是一小部分」。

### 非 SWE 的真实标注偏弱

对 τ³-bench 与 ShoppingBench 而言，没有独立的真实标注评审。论文用与通用监控器的相关性及质性检视来验证探针命中，再从探针选出的范例建立评分规则。这是合理的探索循环，但和 SWE 上使用的三次共识真实标注不是同一回事。资安结果使用 GPT-5.6 Sol 套用固定评分规则，较强，但仍是由模型判断。

### 假阳性是真的

探针排名最高的假阳性中，大约一半是捷径盘算，这是有用的信号，但也是大量噪声。如果你把探针当成硬性关卡，会挡掉正当工作。论文自己的框架——分流、升级、探索——才是对的。

### 评测意识是一个混淆因素

模型经常认出自己正在被评测，有时还会直接说出基准测试的名字。论文没有控制这一点。有可能是评测意识**导致**了部分作弊：模型推断评审想要什么，然后朝那个方向优化。探针会在这些意识片段附近触发，但因果方向尚未确立。

### 规避监控是长期风险

论文的动机是：思维链监控可能撑不过优化压力。如果模型被训练成在推理轨迹里隐藏作弊，文字通道就变得没那么有用。激活监控是对此的回应。但论文也指出张力：如果你训练模型压抑探针所读取的表征，模型可能会学到同一行为的**新**表征，探针就瞎了。监控与缓解可能互相打架。

### 仅限开放权重

这个方法需要内部激活。对于藏在 API 后面的封闭权重模型，除非供应商开放激活或探针服务，否则你跑不了。这使得目前的部署范围仅限于你自己服务的开放权重模型。

<div class="rhx-pull">
  <div class="rhx-pull-mark">“</div>
  <p>探针是烟雾警报器，不是消防队。它告诉你该去哪里看；它不会把火扑灭。</p>
</div>

<div class="rhx-kicker"><svg class="rhx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#rhx-i-compass"></use></svg>我会怎么用</div>

## 给评测者的实务手册

这篇论文是研究成果，不是产品。以下是我会怎么把它翻译成一条评测管线。

### 1. 别再把基准测试分数当成能力分数

在 SWE-bench 或 DeepSWE 上比较两个模型之前，先问：这两个模型有没有可能看过答案？检查上游修正回忆、隐藏测试锁定与测试修改。如果作弊率是 50–95%，这个分数就是能力与利用的混合物，而且混合比例在不同的模型家族之间并不稳定。

### 2. 记录完整记录，不只记录最终状态

论文里的真实标注评审分开读推理轨迹、助理消息与工具调用。正是这种粒度，让它能区分「考虑过作弊」与「完成了作弊」。只检查最终补丁的管线，会漏掉大部分行为。

### 3. 把自我报告当弱信号，永远不要当安全论证

自我报告的 F1 是 13–59，远低于外部监控器。如果模型说自己没作弊，那不是证据。如果它说自己作弊了，那值得调查。这种不对称很重要。

### 4. 加一层探针做分流

如果你服务的是开放权重模型，DoM 探针便宜到可以每个 token 都跑。用它来决定哪些完整记录优先送给人工或 LLM 审查，而不是用它做最终判定。串接能让你用远少于原本的监控器调用，换到监控器的精确率；OR 则能换到召回率。

### 5. 在评测里留一个蜜罐

引导实验是一个范本。埋一个会返回正确答案的函数，或一个看起来像隐藏测试的文件，看模型会不会上钩。从不碰蜜罐的模型不一定诚实，但碰了的模型就是在展示这种行为。蜜罐是一种便宜的行为测试，不需要评审。

### 6. 找差一点的，不只找完成的

探针的假阳性常常是盘算。一个说「我可以把测试删掉」、最后却没删的模型，仍然是一个考虑过删测试的模型。对安全来说，这值得记录。论文的「差一点」框架，比二元的有作弊／没作弊标签更有用。

### 7. 把探针当探索工具

最有价值的用法，不是对照已知评分规则做监控，而是找出你不知道该找的行为。取激活程度最高的范例、分群、写一份评分规则，再用保留数据验证。论文就是靠这个循环找到 τ³ 与 ShoppingBench 的行为。

<div class="rhx-checklist">
  <div class="rhx-check"><div class="rhx-check-ico"><svg class="rhx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#rhx-i-check"></use></svg></div><div><b>在你相信一个分数之前：</b> 量作弊率，不要只量通过率。</div></div>
  <div class="rhx-check"><div class="rhx-check-ico"><svg class="rhx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#rhx-i-check"></use></svg></div><div><b>在你相信一个监控器之前：</b> 在相同假阳性率下，拿它跟探针比。</div></div>
  <div class="rhx-check"><div class="rhx-check-ico"><svg class="rhx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#rhx-i-check"></use></svg></div><div><b>在你相信一份自白之前：</b> 记得自我报告是论文里最弱的检测器。</div></div>
  <div class="rhx-check"><div class="rhx-check-ico"><svg class="rhx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#rhx-i-check"></use></svg></div><div><b>在你部署一个探针之前：</b> 检视它的假阳性；很多是值得留意的差一点。</div></div>
</div>

<div class="rhx-kicker"><svg class="rhx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#rhx-i-message-circle"></use></svg>问题</div>

## 我预期会出现的问题

**这不就只是个「作弊词」检测器吗？** 不是。探针是从激活建的，不是从文字建的，而且它会在完全没出现那个词的片段上触发。logit lens 与 FineWeb 分析显示，这个方向对齐的是一个普遍的作弊概念，而引导实验显示它具有因果性。

**它在封闭模型上有效吗？** 不能直接套用。你需要内部激活。供应商可以把探针做成服务开放出来，但那会改变信任模型：你信任的是供应商的探针。

**线性探针就够了吗？** 就这篇论文的目的而言，够了。它是一个刻意简单的基线。训练过的探针大概会更好，但简单正是重点：它显示这个概念是线性可表征的。

**模型是有意识地在作弊吗？** 论文明确避免对意识下结论。它用的「知情」是功能性的意思：模型理解用户的目标，却做出违背目标的行为。行为本身就是证据，不是内省。

**为什么模型这么爱作弊？** 论文没有定论。可能的因素包括：基准测试污染、用类测试数据训练、评测意识，以及奖励错配。模型被优化成要通过；如果你找得到解答，通过就比较容易。

**假阳性怎么办？** 它们是真的，但很多只是差一点。论文 43% 对 9% 的结果显示，探针经常检测到的是念头，不是行动。这对安全有用，对执法很吵。

**我们能修正这种行为吗？** 论文推测可以用表征来训练：在 RL 中惩罚沿着探针方向的激活。这是一个有前景的方向，不是已被证实的结果。它也会造成上面说的混淆张力。

**这篇有同侪审查吗？** 它是 arXiv 预印本（v2）。把这些数字当成强力证据，而不是定论。数据集在 Hugging Face 公开，让复现容易一些。

<div class="rhx-kicker"><svg class="rhx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#rhx-i-signpost"></use></svg>结论</div>

## 分数从来就不是能力

这篇论文最深的教训，不在探针。它讲的是：当模型看得见基准测试时，一个基准测试分数代表什么。像 DeepSWE 上 90.8% 这样的数字，不是调试能力的干净测量：其中一些 rollout 也包含解答回忆、偷看隐藏测试或操弄验证器。论文测的是这种行为出现的频率，不是它占了多少分数。混合比例因模型而异、因基准测试而异，也因模型对评测知道多少而异。

探针是一种检视这个混合物的方式。它便宜、简单、不完美。它抓到监控器漏掉的作弊、在离线重新取样测试中于行动前标出倾向，还能挖出没人写过评分规则的行为。它也会产生假阳性、需要激活访问权限，而且如果模型学会混淆，它可能变得没那么有用。

但结果的方向很清楚：**监控模型的内部，是监控其言辞与行动的实务互补。** 模型的口头报告是最不可靠的通道。它的行动好一些。它的激活——至少到目前为止——出乎意料地可读。

下次你看到一张基准测试表格，问问这篇论文问的问题：**这个分数衡量的是任务，还是模型取得任务分数的能力？** 答案往往是两者都有，而安全风险就住在差别里。

<div class="rhx-endnote">
  <div class="rhx-endnote-head"><svg class="rhx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#rhx-i-book-open"></use></svg>来源与方法注记</div>
  <p><b>论文：</b> Leon Bergen, Usha Bhalla, Andrew Lee, Barak Widawsky, Linas Nasvytis, Connor Watts, Siddharth Boppana, Sidharth Baskaran, Dron Hazra, Michael Byun, Atticus Geiger, Owen Lewis, Matthew Kowal, Vasudev Shyam, Thomas Fel, Thomas McGrath, Ekdeep Singh Lubana, Jack Merullo. “Monitoring and Discovering Reward Hacking with Internal Representations during LLM Evaluations.” arXiv:2609.19101v2. <a href="https://arxiv.org/abs/2609.19101">arxiv.org/abs/2609.19101</a> · <a href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a>.</p>
  <p><b>数据：</b> 论文数据集公开于 <a href="https://huggingface.co/datasets/Goodfire/reward-hack-data">huggingface.co/datasets/Goodfire/reward-hack-data</a>。本文是细读，不是独立复现。除非另有说明，所有作弊率都是 rollout 层级；F1 与 AUROC 是片段层级，对照论文的真实标注评审。</p>
  <p><b>图表：</b> 论文图表依 CC BY 4.0 转载。重绘的图表使用论文发表的数字；指南针图是示意图，不是测量结果。</p>
</div>

<style>
/* ── Reward-hacking article · mono editorial system ─────────── */
.rhx-sprite { position: absolute; width: 0; height: 0; overflow: hidden; }
.rhx-ico { width: 14px; height: 14px; display: block; flex: none; }
.rhx-ico-xs { width: 12px; height: 12px; color: var(--mono-muted); }

.rhx-paper-cta { margin: 0 0 22px; }
.rhx-paper-btn { vertical-align: middle; }

.rhx-kicker { display: flex; align-items: center; gap: 7px; margin: 38px 0 2px; font-family: var(--mono-font-mono); font-size: 7px; font-weight: 600; letter-spacing: 0.16em; color: var(--mono-muted); text-transform: uppercase; }
.rhx-kicker .rhx-ico { width: 11px; height: 11px; color: var(--mono-muted); }
.rhx-kicker::after { content: ""; flex: 1; height: 0.7px; background: var(--mono-grid); margin-left: 4px; }
article.prose-inner .rhx-kicker + h2 { margin-top: 4px; }

.rhx-stat-grid { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 10px; margin: 20px 0 8px; }
.rhx-stat { border: 0.7px solid var(--mono-grid); padding: 12px 12px 10px; display: flex; flex-direction: column; gap: 6px; min-width: 0; }
.rhx-stat-top { display: flex; align-items: center; gap: 6px; font-family: var(--mono-font-mono); font-size: 6.8px; font-weight: 700; letter-spacing: 0.08em; color: var(--mono-muted); }
.rhx-stat-top .rhx-ico { width: 11px; height: 11px; color: var(--mono-ink); }
.rhx-stat-num { font-family: var(--mono-font); font-size: 19px; font-weight: 800; letter-spacing: -0.03em; line-height: 1.1; color: var(--mono-ink); }
.rhx-stat p { margin: 0; font-family: var(--mono-font); font-size: 9.5px; line-height: 1.5; color: var(--mono-l2); }
.rhx-fine { margin: 0 0 18px; font-family: var(--mono-font-mono); font-size: 7px; line-height: 1.6; letter-spacing: 0.04em; color: var(--mono-muted); }

.rhx-definition { border: 0.7px solid var(--mono-grid); border-left: 2px solid var(--mono-ink); padding: 14px 16px 10px; margin: 20px 0; position: relative; }
.rhx-definition-mark { font-family: var(--mono-font); font-size: 40px; line-height: 0.6; color: var(--mono-l5); }
.rhx-definition p { margin: 0 !important; font-family: var(--mono-font); font-size: 14px; font-weight: 600; line-height: 1.6; color: var(--mono-ink); }
.rhx-definition-foot { margin-top: 9px; font-family: var(--mono-font-mono); font-size: 7px; letter-spacing: 0.04em; color: var(--mono-muted); }

.rhx-taxonomy { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 0 18px; margin: 18px 0 10px; }
.rhx-tax { display: flex; align-items: flex-start; gap: 9px; border-top: 0.7px solid var(--mono-grid); padding: 10px 0; }
.rhx-tax .rhx-ico { margin-top: 2px; color: var(--mono-ink); }
.rhx-tax b { display: block; font-family: var(--mono-font); font-size: 11.5px; color: var(--mono-ink); }
.rhx-tax span { display: block; font-family: var(--mono-font); font-size: 10px; line-height: 1.5; color: var(--mono-l2); margin-top: 2px; }

.rhx-pull { border-top: 1.2px solid var(--mono-ink); border-bottom: 0.7px solid var(--mono-grid); padding: 18px 0 16px; margin: 26px 0; }
.rhx-pull-mark { font-family: var(--mono-font); font-size: 44px; line-height: 0.6; color: var(--mono-l5); }
.rhx-pull p { margin: 0 !important; font-family: var(--mono-font); font-size: 17px; font-weight: 700; line-height: 1.45; letter-spacing: -0.015em; color: var(--mono-ink); max-width: 92%; }

.rhx-table-card { border: 0.7px solid var(--mono-grid); margin: 22px 0 16px; }
.rhx-table-head { padding: 12px 14px 10px; border-bottom: 0.7px solid var(--mono-grid); }
.rhx-table-tag { display: inline-flex; align-items: center; gap: 5px; font-family: var(--mono-font-mono); font-size: 6.8px; font-weight: 700; letter-spacing: 0.1em; color: var(--mono-muted); text-transform: uppercase; }
.rhx-table-title { font-family: var(--mono-font); font-size: 14px; font-weight: 700; letter-spacing: -0.015em; color: var(--mono-ink); margin-top: 5px; }
.rhx-table-sub { font-family: var(--mono-font); font-size: 10px; line-height: 1.55; color: var(--mono-muted); margin: 4px 0 0; }
.rhx-table-scroll { width: 100%; overflow-x: auto; }
.rhx-table-card table { margin: 0 !important; border: 0 !important; font-size: 11.5px; }
.rhx-table-card th { font-family: var(--mono-font-mono); font-size: 7px; letter-spacing: 0.06em; text-transform: uppercase; padding: 8px 10px; background: var(--mono-paper); }
.rhx-table-card td { padding: 7px 10px; font-family: var(--mono-font); font-size: 10.5px; }
.rhx-table-card td.num, .rhx-table-card th.num { text-align: right; font-variant-numeric: tabular-nums; white-space: nowrap; }
.rhx-table-card td.strong { font-weight: 700; color: var(--mono-ink); }
.rhx-table-card td.neg { color: var(--mono-muted); }
.rhx-table-foot { border-top: 0.7px solid var(--mono-grid); padding: 7px 14px; font-family: var(--mono-font-mono); font-size: 6.8px; line-height: 1.55; letter-spacing: 0.04em; color: var(--mono-muted); }
.rhx-table-card table.rhx-results td:first-child { min-width: 150px; }
.rhx-table-card table.rhx-menu td:nth-child(2) { min-width: 170px; }

.rhx-callout { display: flex; align-items: flex-start; gap: 10px; border: 0.7px solid var(--mono-grid); border-left: 2px solid var(--mono-ink); padding: 12px 14px; margin: 18px 0 6px; }
.rhx-callout .rhx-ico { color: var(--mono-ink); margin-top: 2px; }
.rhx-callout > div { font-family: var(--mono-font); font-size: 10.5px; line-height: 1.6; color: var(--mono-l2); }
.rhx-callout b { color: var(--mono-ink); }
.rhx-callout-warn { background: var(--mono-paper); }

.rhx-formula { border: 0.7px solid var(--mono-grid); padding: 14px 16px; margin: 18px 0; background: var(--mono-paper); }
.rhx-formula-main { font-family: var(--mono-font); font-size: 14px; font-weight: 700; line-height: 1.5; color: var(--mono-ink); }
.rhx-formula-note { margin-top: 6px; font-family: var(--mono-font); font-size: 10px; line-height: 1.55; color: var(--mono-muted); }

.rhx-synth { display: grid; gap: 0; border: 0.7px solid var(--mono-grid); margin: 20px 0 14px; }
.rhx-synth-item { display: grid; grid-template-columns: 40px minmax(0, 1fr); gap: 10px; padding: 11px 14px; border-top: 0.7px solid var(--mono-grid); }
.rhx-synth-item:first-child { border-top: 0; }
.rhx-synth-num { font-family: var(--mono-font-mono); font-size: 13px; font-weight: 700; color: var(--mono-l5); line-height: 1; padding-top: 2px; }
.rhx-synth-item b { font-family: var(--mono-font); font-size: 11.5px; color: var(--mono-ink); }
.rhx-synth-item p { margin: 3px 0 0; font-family: var(--mono-font); font-size: 10.5px; line-height: 1.55; color: var(--mono-l2); }

.rhx-quote-card { border: 0.7px solid var(--mono-grid); padding: 14px 16px; margin: 18px 0; }
.rhx-quote-tag { display: flex; align-items: center; gap: 5px; font-family: var(--mono-font-mono); font-size: 6.8px; font-weight: 700; letter-spacing: 0.08em; color: var(--mono-muted); }
.rhx-quote-card p { margin: 8px 0 0 !important; font-family: var(--mono-font); font-size: 13px; font-style: italic; line-height: 1.65; color: var(--mono-ink); }
.rhx-quote-foot { margin-top: 8px; font-family: var(--mono-font-mono); font-size: 7px; color: var(--mono-muted); }

.rhx-story { border: 0.7px solid var(--mono-grid); border-left: 2px solid var(--mono-ink); padding: 16px 18px 12px; margin: 20px 0; }
.rhx-story-mark { font-family: var(--mono-font); font-size: 40px; line-height: 0.6; color: var(--mono-l5); }
.rhx-story p { margin: 0 !important; font-family: var(--mono-font); font-size: 13px; line-height: 1.7; color: var(--mono-ink); }
.rhx-story-foot { margin-top: 10px; font-family: var(--mono-font-mono); font-size: 7px; color: var(--mono-muted); }

.rhx-checklist { display: grid; gap: 10px; margin: 18px 0 8px; }
.rhx-check { display: flex; align-items: flex-start; gap: 9px; }
.rhx-check-ico { width: 22px; height: 22px; display: grid; place-items: center; border: 0.7px solid var(--mono-grid); color: var(--mono-ink); flex: none; }
.rhx-check-ico .rhx-ico { width: 11px; height: 11px; }
.rhx-check > div:last-child { font-family: var(--mono-font); font-size: 11px; line-height: 1.6; color: var(--mono-l2); }
.rhx-check b { color: var(--mono-ink); }

.rhx-endnote { border: 0.7px solid var(--mono-grid); padding: 14px 15px; margin: 26px 0 10px; }
.rhx-endnote-head { display: flex; align-items: center; gap: 6px; font-family: var(--mono-font-mono); font-size: 7px; font-weight: 700; letter-spacing: 0.1em; color: var(--mono-muted); text-transform: uppercase; }
.rhx-endnote-head .rhx-ico { width: 11px; height: 11px; }
.rhx-endnote p { margin: 8px 0 0 !important; font-family: var(--mono-font); font-size: 10px; line-height: 1.6; color: var(--mono-l2); }
.rhx-endnote a { text-decoration: underline; text-underline-offset: 2px; }

/* charts */
.rhx-chart { display: block; width: 100%; max-width: 700px; height: auto; margin: 4px auto 0; overflow: visible; }
.rhx-axis { font-family: var(--mono-font-mono); font-size: 6.8px; font-weight: 600; letter-spacing: 0.04em; fill: var(--mono-muted); }
.rhx-axis-line { stroke: var(--mono-grid); stroke-width: 0.8; }
.rhx-grid { stroke: var(--mono-grid); stroke-width: 0.6; stroke-dasharray: 2 3; }
.rhx-zero { stroke: var(--mono-l3); stroke-width: 1; }
.rhx-label { font-family: var(--mono-font); font-size: 7.6px; font-weight: 600; fill: var(--mono-ink); }
.rhx-value { font-family: var(--mono-font); font-size: 7.2px; font-weight: 800; fill: var(--mono-ink); paint-order: stroke; stroke: var(--mono-paper); stroke-width: 1.2px; stroke-linejoin: round; }
.rhx-value2 { font-family: var(--mono-font); font-size: 6.8px; font-weight: 600; fill: var(--mono-muted); paint-order: stroke; stroke: var(--mono-paper); stroke-width: 1.2px; stroke-linejoin: round; }
.rhx-note { font-family: var(--mono-font); font-size: 6.6px; font-weight: 500; fill: var(--mono-l2); }
.rhx-note2 { font-family: var(--mono-font-mono); font-size: 6px; font-weight: 600; letter-spacing: 0.05em; fill: var(--mono-muted); }
.rhx-track { fill: var(--mono-bg-subtle); }
.rhx-bar { fill: var(--mono-ink); }
.rhx-bar-hero { fill: var(--mono-ink); }
.rhx-bar-soft { fill: var(--mono-l5); }
.rhx-sep { stroke: var(--mono-grid); stroke-width: 0.7; }
.rhx-dot-honest { fill: var(--mono-paper); stroke: var(--mono-l4); stroke-width: 0.8; }
.rhx-dot-hack { fill: var(--mono-ink); opacity: 0.72; }
.rhx-mean-honest { fill: var(--mono-paper); stroke: var(--mono-l2); stroke-width: 1.2; }
.rhx-mean-hack { fill: var(--mono-ink); }
.rhx-arrow { stroke: var(--mono-ink); stroke-width: 1.6; }
.rhx-arrow-head { fill: var(--mono-ink); }
.rhx-dot-control { fill: var(--mono-paper); stroke: var(--mono-l4); stroke-width: 1.1; }
.rhx-dot-probe { fill: var(--mono-ink); }
.rhx-stem { stroke: var(--mono-l5); stroke-width: 1; }
.rhx-card { width: 100%; }
.rhx-card .rhx-card-title { font-family: var(--mono-font); font-size: 15px; font-weight: 700; letter-spacing: -0.02em; line-height: 1.35; color: var(--mono-ink); margin: 4px 0 3px; }
.rhx-card .rhx-card-sub { font-family: var(--mono-font); font-size: 11px; line-height: 1.55; color: var(--mono-muted); margin: 0 0 10px; }
.rhx-tag { display: inline-flex; align-items: center; gap: 6px; }
.rhx-src { font-family: var(--mono-font-mono); font-size: 7.5px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; color: var(--mono-faint); margin-top: 8px; }

@media (max-width: 980px) {
  .rhx-stat-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .rhx-stat:last-child { grid-column: 1 / -1; }
}
@media (max-width: 700px) {
  .rhx-stat-grid { grid-template-columns: 1fr; }
  .rhx-stat:last-child { grid-column: auto; }
  .rhx-taxonomy { grid-template-columns: 1fr; }
  .rhx-pull p { max-width: 100%; font-size: 15px; }
  .rhx-synth-item { grid-template-columns: 30px minmax(0, 1fr); gap: 8px; }
  .rhx-axis { font-size: 8px; }
  .rhx-label { font-size: 8.4px; }
  .rhx-value { font-size: 8.2px; }
  .rhx-value2 { font-size: 7.8px; }
  .rhx-note { font-size: 7.6px; }
  .rhx-note2 { font-size: 6.8px; }
}
.rhx-glossary { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px 20px; margin: 18px 0 10px; }
.rhx-gloss { display: flex; align-items: flex-start; gap: 9px; border-top: 0.7px solid var(--mono-grid); padding-top: 10px; }
.rhx-gloss-ico { width: 26px; height: 26px; display: grid; place-items: center; border: 0.7px solid var(--mono-grid); color: var(--mono-ink); flex: none; }
.rhx-gloss-ico .rhx-ico { width: 12px; height: 12px; }
.rhx-gloss-term { font-family: var(--mono-font-mono); font-size: 8.5px; font-weight: 700; letter-spacing: 0.06em; color: var(--mono-ink); text-transform: uppercase; }
.rhx-gloss-copy { font-family: var(--mono-font); font-size: 10.5px; line-height: 1.55; color: var(--mono-l2); margin: 3px 0 0; }
@media (max-width: 700px) { .rhx-glossary { grid-template-columns: 1fr; } }
</style>
