---
title: "You Don't Need Long Context: The Seven-Times Cost of a Habit"
description: "A close reading of arXiv:2611.05306: compaction and selective reading let frontier models match long-context baselines while cutting estimated serving costs by up to 233×. The catch is not accuracy — it is knowing what to keep."
pubDate: 2026-11-14
category: "AI"
tags: ["Long Context", "Agents", "Compaction", "LLM", "PaperNotes"]
featured: false
author: "Alex.Hsiao"
readTime: "34 min read"
---

# You Don't Need Long Context: The Seven-Times Cost of a Habit

<svg class="lcx-sprite" aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg"><defs><symbol id="lcx-i-activity" viewBox="0 0 24 24"><path d="M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2"/></symbol><symbol id="lcx-i-archive" viewBox="0 0 24 24"><rect width="20" height="5" x="2" y="3" rx="1"/><path d="M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8m-10 4h4"/></symbol><symbol id="lcx-i-arrow-up-down" viewBox="0 0 24 24"><path d="m21 16l-4 4l-4-4m4 4V4M3 8l4-4l4 4M7 4v16"/></symbol><symbol id="lcx-i-book-open" viewBox="0 0 24 24"><path d="M12 7v14M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z"/></symbol><symbol id="lcx-i-brain" viewBox="0 0 24 24"><path d="M12 18V5m3 8a4.17 4.17 0 0 1-3-4a4.17 4.17 0 0 1-3 4m8.707-6.706A3 3 0 1 0 12 5a3 3 0 1 0-5.707 1.294"/><path d="M17.996 5.125a4 4 0 0 1 2.526 5.77"/><path d="M18 18a4 4 0 0 0 2-7.465"/><path d="M19.967 17.482a4 4 0 1 1-7.967.517a4 4 0 1 1-7.967-.517"/><path d="M6 18a4 4 0 0 1-2-7.465"/><path d="M6.004 5.125a4 4 0 0 0-2.526 5.77"/></symbol><symbol id="lcx-i-chart-no-axes-column" viewBox="0 0 24 24"><path d="M5 21v-6m7 6V3m7 18V9"/></symbol><symbol id="lcx-i-clipboard-list" viewBox="0 0 24 24"><rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2m4 7h4m-4 5h4m-8-5h.01M8 16h.01"/></symbol><symbol id="lcx-i-coins" viewBox="0 0 24 24"><path d="M13.744 17.736a6 6 0 1 1-7.48-7.48M15 6h1v4"/><path d="m6.134 14.768l.866-.5l2 3.464"/><circle cx="16" cy="8" r="6"/></symbol><symbol id="lcx-i-database" viewBox="0 0 24 24"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v14a9 3 0 0 0 18 0V5"/><path d="M3 12a9 3 0 0 0 18 0"/></symbol><symbol id="lcx-i-file-text" viewBox="0 0 24 24"><path d="M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z"/><path d="M14 2v5a1 1 0 0 0 1 1h5M10 9H8m8 4H8m8 4H8"/></symbol><symbol id="lcx-i-flask-conical" viewBox="0 0 24 24"><path d="M14 2v6a2 2 0 0 0 .245.96l5.51 10.08A2 2 0 0 1 18 22H6a2 2 0 0 1-1.755-2.96l5.51-10.08A2 2 0 0 0 10 8V2M6.453 15h11.094M8.5 2h7"/></symbol><symbol id="lcx-i-gauge" viewBox="0 0 24 24"><path d="m12 14l4-4M3.34 19a10 10 0 1 1 17.32 0"/></symbol><symbol id="lcx-i-git-branch" viewBox="0 0 24 24"><path d="M15 6a9 9 0 0 0-9 9V3"/><circle cx="18" cy="6" r="3"/><circle cx="6" cy="18" r="3"/></symbol><symbol id="lcx-i-history" viewBox="0 0 24 24"><path d="M3 12a9 9 0 1 0 9-9a9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5m4-1v5l4 2"/></symbol><symbol id="lcx-i-layers" viewBox="0 0 24 24"><path d="M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83z"/><path d="M2 12a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 12"/><path d="M2 17a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 17"/></symbol><symbol id="lcx-i-list-filter" viewBox="0 0 24 24"><path d="M2 5h20M6 12h12m-9 7h6"/></symbol><symbol id="lcx-i-memory-stick" viewBox="0 0 24 24"><path d="M12 12v-2m0 8v-2m4-4v-2m0 8v-2M2 11h1.5M20 18v-2m.5-5H22M4 18v-2m4-4v-2m0 8v-2"/><rect width="20" height="10" x="2" y="6" rx="2"/></symbol><symbol id="lcx-i-messages-square" viewBox="0 0 24 24"><path d="M16 10a2 2 0 0 1-2 2H6.828a2 2 0 0 0-1.414.586l-2.202 2.202A.71.71 0 0 1 2 14.286V4a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2zm4-1a2 2 0 0 1 2 2v10.286a.71.71 0 0 1-1.212.502l-2.202-2.202A2 2 0 0 0 17.172 19H10a2 2 0 0 1-2-2v-1"/></symbol><symbol id="lcx-i-network" viewBox="0 0 24 24"><rect width="6" height="6" x="16" y="16" rx="1"/><rect width="6" height="6" x="2" y="16" rx="1"/><rect width="6" height="6" x="9" y="2" rx="1"/><path d="M5 16v-3a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v3m-7-4V8"/></symbol><symbol id="lcx-i-radar" viewBox="0 0 24 24"><path d="M19.07 4.93A10 10 0 0 0 6.99 3.34M4 6h.01M2.29 9.62a10 10 0 1 0 19.02-1.27"/><path d="M16.24 7.76a6 6 0 1 0-8.01 8.91M12 18h.01m5.98-6.34a6 6 0 0 1-2.22 5.01"/><circle cx="12" cy="12" r="2"/><path d="m13.41 10.59l5.66-5.66"/></symbol><symbol id="lcx-i-repeat" viewBox="0 0 24 24"><path d="m17 2l4 4l-4 4"/><path d="M3 11v-1a4 4 0 0 1 4-4h14M7 22l-4-4l4-4"/><path d="M21 13v1a4 4 0 0 1-4 4H3"/></symbol><symbol id="lcx-i-route" viewBox="0 0 24 24"><circle cx="6" cy="19" r="3"/><path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15"/><circle cx="18" cy="5" r="3"/></symbol><symbol id="lcx-i-scan-search" viewBox="0 0 24 24"><path d="M3 7V5a2 2 0 0 1 2-2h2m10 0h2a2 2 0 0 1 2 2v2m0 10v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2"/><circle cx="12" cy="12" r="3"/><path d="m16 16l-1.9-1.9"/></symbol><symbol id="lcx-i-scissors" viewBox="0 0 24 24"><circle cx="6" cy="6" r="3"/><path d="M8.12 8.12L12 12m8-8L8.12 15.88"/><circle cx="6" cy="18" r="3"/><path d="M14.8 14.8L20 20"/></symbol><symbol id="lcx-i-shield-check" viewBox="0 0 24 24"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12l2 2l4-4"/></symbol><symbol id="lcx-i-target" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></symbol><symbol id="lcx-i-timer" viewBox="0 0 24 24"><path d="M10 2h4m-2 12l3-3"/><circle cx="12" cy="14" r="8"/></symbol><symbol id="lcx-i-triangle-alert" viewBox="0 0 24 24"><path d="m21.73 18l-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3M12 9v4m0 4h.01"/></symbol><symbol id="lcx-i-users" viewBox="0 0 24 24"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M16 3.128a4 4 0 0 1 0 7.744M22 21v-2a4 4 0 0 0-3-3.87"/><circle cx="9" cy="7" r="4"/></symbol><symbol id="lcx-i-workflow" viewBox="0 0 24 24"><rect width="8" height="8" x="3" y="3" rx="2"/><path d="M7 11v4a2 2 0 0 0 2 2h4"/><rect width="8" height="8" x="13" y="13" rx="2"/></symbol><symbol id="lcx-i-clock" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></symbol><symbol id="lcx-i-search" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></symbol><symbol id="lcx-i-terminal" viewBox="0 0 24 24"><polyline points="4 17 10 11 4 5"/><line x1="12" x2="20" y1="19" y2="19"/></symbol><symbol id="lcx-i-check" viewBox="0 0 24 24"><path d="M20 6 9 17l-5-5"/></symbol><symbol id="lcx-i-x" viewBox="0 0 24 24"><path d="M18 6 6 18M6 6l12 12"/></symbol><symbol id="lcx-i-arrow-right" viewBox="0 0 24 24"><path d="M5 12h14m-6-6 6 6-6 6"/></symbol><symbol id="lcx-i-folder-open" viewBox="0 0 24 24"><path d="m6 14 1.5-2.9A2 2 0 0 1 9.24 10H20a2 2 0 0 1 1.94 2.5l-1.54 6a2 2 0 0 1-1.95 1.5H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.69.9l.81 1.2a2 2 0 0 0 1.67.9H18a2 2 0 0 1 2 2v2"/></symbol><symbol id="lcx-i-receipt" viewBox="0 0 24 24"><path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z"/><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"/><path d="M12 17.5v-11"/></symbol><symbol id="lcx-i-banknote" viewBox="0 0 24 24"><rect width="20" height="12" x="2" y="6" rx="2"/><circle cx="12" cy="12" r="2"/><path d="M6 12h.01M18 12h.01"/></symbol><symbol id="lcx-i-scale" viewBox="0 0 24 24"><path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="M7 21h10"/><path d="M12 3v18"/><path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2"/></symbol><symbol id="lcx-i-trending-down" viewBox="0 0 24 24"><polyline points="22 17 13.5 8.5 8.5 13.5 2 7"/><polyline points="16 17 22 17 22 11"/></symbol><symbol id="lcx-i-zap" viewBox="0 0 24 24"><path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"/></symbol><symbol id="lcx-i-cpu" viewBox="0 0 24 24"><rect width="16" height="16" x="4" y="4" rx="2"/><rect width="6" height="6" x="9" y="9" rx="1"/><path d="M15 2v2M15 20v2M2 15h2M2 9h2M20 15h2M20 9h2M9 2v2M9 20v2"/></symbol><symbol id="lcx-i-hard-drive" viewBox="0 0 24 24"><line x1="22" x2="2" y1="12" y2="12"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/><line x1="6" x2="6.01" y1="16" y2="16"/><line x1="10" x2="10.01" y1="16" y2="16"/></symbol><symbol id="lcx-i-eye" viewBox="0 0 24 24"><path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"/><circle cx="12" cy="12" r="3"/></symbol><symbol id="lcx-i-boxes" viewBox="0 0 24 24"><path d="M2.97 12.92A2 2 0 0 0 2 14.63v3.24a2 2 0 0 0 .97 1.71l3 1.8a2 2 0 0 0 2.06 0L12 19v-5.5l-5-3-4.03 2.42Z"/><path d="m7 16.5-4.74-2.85M7 16.5l5-3M7 16.5v5.17M12 13.5V19l3.97 2.38a2 2 0 0 0 2.06 0l3-1.8a2 2 0 0 0 .97-1.71v-3.24a2 2 0 0 0-.97-1.71L17 10.5l-5 3Z"/><path d="m17 16.5-5-3M17 16.5l4.74-2.85M17 16.5v5.17"/></symbol><symbol id="lcx-i-compass" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88"/></symbol><symbol id="lcx-i-map" viewBox="0 0 24 24"><path d="M14.106 5.553a2 2 0 0 0 1.788 0l3.659-1.83A1 1 0 0 1 21 4.619v12.764a1 1 0 0 1-.553.894l-4.553 2.277a2 2 0 0 1-1.788 0l-4.212-2.106a2 2 0 0 0-1.788 0l-3.659 1.83A1 1 0 0 1 3 19.381V6.618a1 1 0 0 1 .553-.894l4.553-2.277a2 2 0 0 1 1.788 0z"/><path d="M15 5.764v15M9 3.236v15"/></symbol><symbol id="lcx-i-key-round" viewBox="0 0 24 24"><path d="M2.586 17.414A2 2 0 0 0 2 18.828V21a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h1a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h.172a2 2 0 0 0 1.414-.586l.814-.814a6.5 6.5 0 1 0-4-4z"/><circle cx="16.5" cy="7.5" r=".5" fill="currentColor"/></symbol><symbol id="lcx-i-lock" viewBox="0 0 24 24"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></symbol><symbol id="lcx-i-signpost" viewBox="0 0 24 24"><path d="M12 13v8M12 3v3"/><path d="M18 6a2 2 0 0 1 1.387.56l2.307 2.22a1 1 0 0 1 0 1.44l-2.307 2.22A2 2 0 0 1 18 13H6a2 2 0 0 1-1.387-.56l-2.306-2.22a1 1 0 0 1 0-1.44l2.306-2.22A2 2 0 0 1 6 6z"/></symbol><symbol id="lcx-i-hourglass" viewBox="0 0 24 24"><path d="M5 22h14M5 2h14"/><path d="M17 22v-4.172a2 2 0 0 0-.586-1.414L12 12l-4.414 4.414A2 2 0 0 0 7 17.828V22"/><path d="M7 2v4.172a2 2 0 0 0 .586 1.414L12 12l4.414-4.414A2 2 0 0 0 17 6.172V2"/></symbol><symbol id="lcx-i-circle-dot" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="1"/></symbol><symbol id="lcx-i-notebook-pen" viewBox="0 0 24 24"><path d="M13.4 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7.4"/><path d="M2 6h4M2 10h4M2 14h4M2 18h4"/><path d="M21.378 5.626a1 1 0 1 0-3.004-3.004l-5.01 5.012a2 2 0 0 0-.506.854l-.837 2.87a.5.5 0 0 0 .62.62l2.87-.837a2 2 0 0 0 .854-.506z"/></symbol><symbol id="lcx-i-panel-top" viewBox="0 0 24 24"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18"/></symbol><symbol id="lcx-i-bot" viewBox="0 0 24 24"><path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2M20 14h2M15 13v2M9 13v2"/></symbol><symbol id="lcx-i-message-circle" viewBox="0 0 24 24"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/></symbol><symbol id="lcx-i-square-stack" viewBox="0 0 24 24"><path d="M4 10c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h4c1.1 0 2 .9 2 2"/><path d="M10 16c-1.1 0-2-.9-2-2v-4c0-1.1.9-2 2-2h4c1.1 0 2 .9 2 2"/><rect width="8" height="8" x="14" y="14" rx="2"/></symbol><symbol id="lcx-i-split" viewBox="0 0 24 24"><path d="M16 3h5v5M8 3H3v5M12 22v-8.3a4 4 0 0 0-1.172-2.872L3 3M15 9l6-6"/></symbol><symbol id="lcx-i-merge" viewBox="0 0 24 24"><path d="m8 6 4-4 4 4"/><path d="M12 2v10.3a4 4 0 0 1-1.172 2.872L3 23"/><path d="m15 9 6 6"/></symbol></defs></svg>

Every model provider sells the same number the way a phone carrier sells "unlimited": a context window, usually in the hundreds of thousands of tokens, sometimes a million. The implication is that more window is more capability. Paste the whole repository. Paste the whole contract. Paste the entire year of support tickets. The model will hold it all.

Three units recur in this piece. A **token** is the unit of text a model reads and bills — roughly three-quarters of an English word. An **agent** is a model that can call tools and take actions in a loop, rather than answer once. A **baseline** is the reference configuration you measure against; without one, a score is just a number.

A new paper from a twelve-author team, **“You don’t need long context”** (arXiv:2611.05306), attacks that assumption from an unusual direction. It does not argue that models fail on long inputs. It argues something more uncomfortable: **the long input usually does not need to be in the context at all** — and keeping it there is expensive in a way the retail price sheet hides.

The paper makes three empirical claims, each tied to a different workload:

1. **Long-horizon tasks** — agents that take many actions — can run with the history compacted at the end of every conversation, at 8K–48K total context, with accuracy that is broadly flat and sometimes better.
2. **Long-input tasks** — question answering over large documents — can run by storing the documents as files and letting the agent read them selectively with `grep`, `sed`, `head`, and `tail`, usually with **higher** accuracy than pasting everything in.
3. **Single-action compaction** — throwing away the conversation after every single action and carrying only a compact natural-language state — still preserves most of the accuracy, while median peak context falls to **7K–9K tokens**.

<div class="lcx-paper-cta">
  <a class="mono-btn-chamfer lcx-paper-btn" href="https://arxiv.org/abs/2611.05306" target="_blank" rel="noopener noreferrer">
    <span class="chamfer-inner">
      <span class="btn-tag">ARXIV</span>
      <span class="btn-label">READ THE PAPER ↗</span>
    </span>
  </a>
</div>

The headline number is not an accuracy delta. It is a price: at 256K tokens, generating one million output tokens costs **3.6× to 7×** more than at 16K, depending on the model and serving stack. Across the long-input benchmarks, the paper’s estimated optimized retail cost falls by a factor of **6.5 to 54.6** for Claude Opus 4.5 and by a factor of **4.4 to 233.3** for GPT 5.6 Sol. Those multiples are estimates from a throughput model, not invoices — but the direction is hard to ignore.

This article walks through the whole paper: the cost argument, the three context-management regimes, every benchmark in both groups, the single-action result, the proposed **Semantic State Space Model**, the compaction recipe, and the places where the story breaks. The short version: **long context is not a capability you should pay for by default; it is a serving decision you should justify per task.**

<div class="lcx-kicker"><svg class="lcx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#lcx-i-scan-search"></use></svg>THE PAPER IN ONE SCREEN</div>

## Five numbers, one argument

<div class="lcx-stat-grid">
  <div class="lcx-stat">
    <div class="lcx-stat-top"><svg class="lcx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#lcx-i-banknote"></use></svg><span>COST RATIO</span></div>
    <div class="lcx-stat-num">3.6–7×</div>
    <p>More expensive to generate a token at 256K context than at 16K, on the paper’s three open-weight serving deployments.</p>
  </div>
  <div class="lcx-stat">
    <div class="lcx-stat-top"><svg class="lcx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#lcx-i-gauge"></use></svg><span>LONG-HORIZON</span></div>
    <div class="lcx-stat-num">−3.7 / +5.6</div>
    <p>Worst and best accuracy change, in percentage points, for Opus 4.5 across 22 compaction settings. GPT 5.6 Sol: −3.3 / +4.4.</p>
  </div>
  <div class="lcx-stat">
    <div class="lcx-stat-top"><svg class="lcx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#lcx-i-trending-down"></use></svg><span>LONG-INPUT</span></div>
    <div class="lcx-stat-num">+40 pts</div>
    <p>Largest accuracy gain over the full-input baseline (NIAH, Opus 4.5), with estimated cost falling 54.6×.</p>
  </div>
  <div class="lcx-stat">
    <div class="lcx-stat-top"><svg class="lcx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#lcx-i-memory-stick"></use></svg><span>SINGLE ACTION</span></div>
    <div class="lcx-stat-num">7–9K</div>
    <p>Median peak live context under single-action compaction, down from 130K–200K maximums in the full-history baselines.</p>
  </div>
  <div class="lcx-stat">
    <div class="lcx-stat-top"><svg class="lcx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#lcx-i-triangle-alert"></use></svg><span>FAILURE MODE</span></div>
    <div class="lcx-stat-num">53.0 → 3.6</div>
    <p>Qwen 3 Coder Next’s SWE-bench Verified score at the tightest 16K/12K budget. Compaction is not free for every model.</p>
  </div>
</div>

<p class="lcx-fine">Sources: abstract, Sections 3–5, Tables 2, 9, 10, 17, and Figures 1, 5, 6. Accuracy deltas are percentage points, not percent.</p>

The rest of this piece is the long version. If you only need the practical takeaway, jump to **“What I would do with this”** near the end. If you want to understand *why* the result is believable, keep reading — the interesting part is not the average, it is the shape of the exceptions.

<div class="lcx-kicker"><svg class="lcx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#lcx-i-book-open"></use></svg>DEFINITIONS FIRST</div>

## “Long” is a relative word, and that matters

The paper spends two pages fixing definitions, and it is right to. “Context” is one of the most overloaded words in language-model engineering: it can mean the input at one step, the generated output, the whole conversation, or the model’s architectural limit. The authors separate five things:

<div class="lcx-glossary">
  <div class="lcx-gloss"><div class="lcx-gloss-ico"><svg class="lcx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#lcx-i-circle-dot"></use></svg></div><div><div class="lcx-gloss-term">Inference step</div><p class="lcx-gloss-copy">One call to the model to produce output. In an agent, this is usually one turn: the model reads the current context and emits a thought, a tool call, or an answer.</p></div></div>
  <div class="lcx-gloss"><div class="lcx-gloss-ico"><svg class="lcx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#lcx-i-panel-top"></use></svg></div><div><div class="lcx-gloss-term">Input context</div><p class="lcx-gloss-copy">Everything the model is allowed to read at that step: system prompt, task, earlier messages, tool results. This is the thing that grows in a long conversation.</p></div></div>
  <div class="lcx-gloss"><div class="lcx-gloss-ico"><svg class="lcx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#lcx-i-message-circle"></use></svg></div><div><div class="lcx-gloss-term">Output context</div><p class="lcx-gloss-copy">Everything the model generates in that step: a thinking trace, a tool call, a user-facing answer. It is appended to the next input context unless something removes it.</p></div></div>
  <div class="lcx-gloss"><div class="lcx-gloss-ico"><svg class="lcx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#lcx-i-panel-top"></use></svg></div><div><div class="lcx-gloss-term">Context window</div><p class="lcx-gloss-copy">The maximum number of tokens the endpoint can process in one invocation. It may be the model’s architectural limit, or a smaller serving configuration. A request above it usually fails outright; behavior above the limit is not reliable.</p></div></div>
  <div class="lcx-gloss"><div class="lcx-gloss-ico"><svg class="lcx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#lcx-i-scale"></use></svg></div><div><div class="lcx-gloss-term">Long vs. short</div><p class="lcx-gloss-copy">The paper calls a context <em>long</em> when it approaches a significant fraction of the ~256K windows common in 2026, and <em>short</em> when it is much closer to zero than to that window — in practice, <strong>16K–50K</strong>. Short is relative, not small.</p></div></div>
</div>

That last definition is the hinge of the whole paper. When the authors say “short context,” they do **not** mean a 4K toy window. They mean 16K–50K tokens, which is still enough to hold a long short story — roughly 12,000 words at the low end. The claim is not that models should forget everything. The claim is that a working set of tens of thousands of tokens is sufficient for tasks whose *inputs* may be hundreds of times larger.

<div class="lcx-callout">
  <svg class="lcx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#lcx-i-book-open"></use></svg>
  <div><b>The library on the desk.</b> A 50K-token context is roughly a short novel. A 1M-token context is roughly the whole King James Bible — Old Testament plus New Testament. The paper’s question is not “can the model read a library?” It is “why is the whole library on the desk when the question is about one shelf?”</div>
</div>

The paper makes the scale vivid with a table of literary works. Its point is not that context windows are useless; it is that they have grown far past the size of the texts people actually reason about.

<div class="lcx-table-card">
  <div class="lcx-table-head">
    <div class="lcx-table-tag"><svg class="lcx-ico lcx-ico-xs" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#lcx-i-book-open"></use></svg>TABLE 1, REDRAWN · THE LIBRARY VS. THE WINDOW</div>
    <div class="lcx-table-title">Eight books, eight windows.</div>
    <p class="lcx-table-sub">Token counts are approximate: the paper converts English words at ~1.33 tokens per word. The smallest window here still holds <em>The Great Gatsby</em> three times over.</p>
  </div>
  <div class="lcx-table-scroll">
    <table class="lcx-books">
      <thead><tr><th>Literary work</th><th class="num">Tokens</th><th>Model</th><th class="num">Window</th></tr></thead>
      <tbody>
        <tr><td>The Old Man and the Sea</td><td class="num">~37K</td><td>MiniMax M2.7</td><td class="num">200K</td></tr>
        <tr><td>The Great Gatsby</td><td class="num">~64K</td><td>Claude Opus 4.5</td><td class="num">200K</td></tr>
        <tr><td>Qur’an (Saheeh Int’l)</td><td class="num">~207K</td><td>Gemma 4 31B</td><td class="num">256K</td></tr>
        <tr><td>King James New Testament</td><td class="num">~241K</td><td>Kimi K2.6</td><td class="num">256K</td></tr>
        <tr><td>Great Expectations</td><td class="num">~245K</td><td>Qwen 3 Coder Next</td><td class="num">262K</td></tr>
        <tr><td>The Lord of the Rings</td><td class="num">~640K</td><td>Gemini 3.8 Flash</td><td class="num">1M</td></tr>
        <tr><td>War and Peace</td><td class="num">~753K</td><td>GLM 5.2</td><td class="num">1M</td></tr>
        <tr><td>King James Old Testament</td><td class="num">~802K</td><td>GPT 5.6 Sol</td><td class="num">1.05M</td></tr>
      </tbody>
    </table>
  </div>
  <div class="lcx-table-foot">The pairing is illustrative, not a benchmark. Source: arXiv:2611.05306, Table 1.</div>
</div>

The paper’s framing is deliberately provocative: context windows have been marketed as a capacity race, but capacity is not the same as usefulness. A truck that can carry a house is not automatically the right vehicle for a grocery run.

<div class="lcx-kicker"><svg class="lcx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#lcx-i-receipt"></use></svg>THE INVOICE</div>

## The cost is linear in depth, and the last doubling is the expensive one

Here is the mechanism in one paragraph. A transformer generates text by attending over the tokens already in its context: each new token looks back at the earlier ones and weighs them. That look-back needs a stored key and value for every earlier token, so serving stacks keep them in a **KV cache** instead of recomputing them on every step. The cache grows linearly with context length, and each new token must attend over all of it. The result is that **later tokens are more expensive to generate than earlier ones** — the paper describes the per-token decode cost as linear in context depth. Total attention work over a whole sequence is quadratic, and prefill — reading the input — is where that quadratic term bites; Figure 1 measures decode. The paper cites the standard analysis and then measures it on real serving stacks.

<div class="lcx-callout">
  <svg class="lcx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#lcx-i-gauge"></use></svg>
  <div><b>The taxi meter that accelerates.</b> Prefill is the upfront fare: the model reads the input. Decode is the meter: one tick per generated token. In a long context, every tick attends over more history, so the meter speeds up as the ride goes on. The retail price sheet quotes a flat rate per million tokens, which hides the acceleration.</div>
</div>

The paper measures two things separately:

- **Cloud serving cost.** On H100 GPUs, serve GLM 5.2, Kimi K2.6, and Qwen 3 Coder Next at context windows from 16K to 256K, measure peak sustained decode throughput, and convert it to dollars per million output tokens at $3.85 per GPU-hour.
- **Local burden.** On an NVIDIA DGX Spark with ~109GB of usable unified memory, measure inter-token latency, batch-one throughput, and memory footprint for five open-weight coding models as context grows.

Both measurements point the same way. Figure 1 is the paper’s own view of the cloud cost curve.

<figure class="fig">
  <img src="/images/long-context/fig01-cost-per-mtok.png" alt="Three panels showing the dollar cost of one million output tokens rising sharply as context window grows from 16K to 256K for GLM 5.2, Kimi K2.6, and Qwen 3 Coder Next" width="2800" height="852" loading="lazy" />
  <figcaption><b>Fig. 1 (paper)</b> — The cost of long context: dollars to generate 1M output tokens on an existing KV cache, at $3.85 per H100-hour. Each panel has its own y-axis. The curves bend at different points — Qwen 3 Coder Next earliest, GLM 5.2 latest — and the 256K endpoint is 3.6× to 7× the 16K endpoint. What to notice: the slope, not the exact dollar value. The last doubling is the expensive one, and the penalty is largest for Qwen. Source: <a href="https://arxiv.org/abs/2611.05306">Belcak et al., arXiv:2611.05306</a> · <a href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a></figcaption>
</figure>

<div class="chamfer-card-wrapper lcx-card">
  <div class="chamfer-card-content">
    <div class="card-tag lcx-tag"><svg class="lcx-ico lcx-ico-xs" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#lcx-i-banknote"></use></svg> EXHIBIT // 01 · THE COST CURVE</div>
    <div class="lcx-card-title">Short contexts decode 3.6–7× faster.</div>
    <p class="lcx-card-sub">Decode throughput at each context window, expressed as a speedup over the 256K operating point. Values are read from the paper’s Figure 4; the curves are approximate, the direction is not.</p>
    <svg class="lcx-chart" viewBox="0 0 440 278" role="img" aria-label="Decode speed at short context relative to 256K for three models" xmlns="http://www.w3.org/2000/svg"><text x="46" y="10" class="lcx-ch-axis" text-anchor="start">DECODE SPEED VS. 256K CONTEXT</text><rect x="46.0" y="18" width="188.0" height="198" class="lcx-ch-band"/><text x="140.0" y="29" class="lcx-ch-band-label" text-anchor="middle">SHORT-CONTEXT ZONE</text><line x1="46" y1="216.0" x2="422" y2="216.0" class="lcx-ch-grid"/><text x="41" y="218.2" class="lcx-ch-axis" text-anchor="end">0×</text><line x1="46" y1="189.6" x2="422" y2="189.6" class="lcx-ch-grid"/><text x="41" y="191.79999999999998" class="lcx-ch-axis" text-anchor="end">1×</text><line x1="46" y1="163.20000000000002" x2="422" y2="163.20000000000002" class="lcx-ch-grid"/><text x="41" y="165.4" class="lcx-ch-axis" text-anchor="end">2×</text><line x1="46" y1="136.8" x2="422" y2="136.8" class="lcx-ch-grid"/><text x="41" y="139.0" class="lcx-ch-axis" text-anchor="end">3×</text><line x1="46" y1="110.4" x2="422" y2="110.4" class="lcx-ch-grid"/><text x="41" y="112.60000000000001" class="lcx-ch-axis" text-anchor="end">4×</text><line x1="46" y1="84.00000000000001" x2="422" y2="84.00000000000001" class="lcx-ch-grid"/><text x="41" y="86.20000000000002" class="lcx-ch-axis" text-anchor="end">5×</text><line x1="46" y1="57.599999999999994" x2="422" y2="57.599999999999994" class="lcx-ch-grid"/><text x="41" y="59.8" class="lcx-ch-axis" text-anchor="end">6×</text><line x1="46" y1="31.199999999999996" x2="422" y2="31.199999999999996" class="lcx-ch-grid"/><text x="41" y="33.4" class="lcx-ch-axis" text-anchor="end">7×</text><text x="46.0" y="230" class="lcx-ch-axis" text-anchor="middle">16K</text><text x="140.0" y="230" class="lcx-ch-axis" text-anchor="middle">32K</text><text x="234.0" y="230" class="lcx-ch-axis" text-anchor="middle">64K</text><text x="328.0" y="230" class="lcx-ch-axis" text-anchor="middle">128K</text><text x="422.0" y="230" class="lcx-ch-axis" text-anchor="middle">256K</text><line x1="46" y1="216" x2="422" y2="216" class="lcx-ch-axis-line"/><path d="M46.0,110.4 L140.0,118.3 L234.0,123.6 L328.0,136.8 L422.0,189.6" class="lcx-ch-line"/><circle cx="46.0" cy="110.4" r="2.5" class="lcx-ch-dot"/><circle cx="140.0" cy="118.3" r="2.5" class="lcx-ch-dot"/><circle cx="234.0" cy="123.6" r="2.5" class="lcx-ch-dot"/><circle cx="328.0" cy="136.8" r="2.5" class="lcx-ch-dot"/><circle cx="422.0" cy="189.6" r="2.5" class="lcx-ch-dot"/><text x="51.0" y="105.4" class="lcx-ch-value">4.0×</text><path d="M46.0,57.6 L140.0,86.6 L234.0,110.4 L328.0,131.5 L422.0,189.6" class="lcx-ch-line2"/><circle cx="46.0" cy="57.6" r="2.5" class="lcx-ch-dot2"/><circle cx="140.0" cy="86.6" r="2.5" class="lcx-ch-dot2"/><circle cx="234.0" cy="110.4" r="2.5" class="lcx-ch-dot2"/><circle cx="328.0" cy="131.5" r="2.5" class="lcx-ch-dot2"/><circle cx="422.0" cy="189.6" r="2.5" class="lcx-ch-dot2"/><text x="51.0" y="66.6" class="lcx-ch-value">6.0×</text><path d="M46.0,31.2 L140.0,73.4 L234.0,102.5 L328.0,131.5 L422.0,189.6" class="lcx-ch-line3"/><circle cx="46.0" cy="31.2" r="2.5" class="lcx-ch-dot3"/><circle cx="140.0" cy="73.4" r="2.5" class="lcx-ch-dot3"/><circle cx="234.0" cy="102.5" r="2.5" class="lcx-ch-dot3"/><circle cx="328.0" cy="131.5" r="2.5" class="lcx-ch-dot3"/><circle cx="422.0" cy="189.6" r="2.5" class="lcx-ch-dot3"/><text x="51.0" y="26.199999999999996" class="lcx-ch-value">7.0×</text><line x1="46" y1="254" x2="60" y2="254" class="lcx-ch-line"/><circle cx="53" cy="254" r="2.4" class="lcx-ch-dot"/><text x="65" y="256.3" class="lcx-ch-note">GLM 5.2</text><line x1="164" y1="254" x2="178" y2="254" class="lcx-ch-line2"/><circle cx="171" cy="254" r="2.4" class="lcx-ch-dot2"/><text x="183" y="256.3" class="lcx-ch-note">Kimi K2.6</text><line x1="282" y1="254" x2="296" y2="254" class="lcx-ch-line3"/><circle cx="289" cy="254" r="2.4" class="lcx-ch-dot3"/><text x="301" y="256.3" class="lcx-ch-note">Qwen 3 Coder Next</text><text x="46" y="272" class="lcx-ch-note">Values read from Fig. 4; approximate. All curves meet at the 256K reference.</text></svg>
    <div class="lcx-src">Redrawn from Fig. 4 · arXiv:2611.05306</div>
  </div>
</div>

The shape is consistent across three different models and two serving configurations. The exact knee moves — Qwen 3 Coder Next bends earlier and harder, GLM 5.2 stays flatter until 128K — but the direction does not. **The marginal token at 256K is not priced like the marginal token at 16K, even though the API line item says it is.**

Figure 4 shows the same data from the serving side: decode throughput collapses as the configured window grows. The right-hand axis converts the curve into a speedup over the 256K operating point.

<figure class="fig">
  <img src="/images/long-context/fig04-throughput.png" alt="Three panels of decode throughput in tokens per second falling from 16K to 256K context for GLM 5.2, Kimi K2.6, and Qwen 3 Coder Next, with a right axis showing 4x to 7x speedup at short context" width="2800" height="828" loading="lazy" />
  <figcaption><b>Fig. 4 (paper)</b> — Decode throughput collapses as the context window grows. GLM 5.2 keeps ~4× throughput at 16K versus 256K; Kimi K2.6 ~6×; Qwen 3 Coder Next ~7×. What to notice: a shorter window is not a minor tuning knob — it changes the achievable serving economics by the same order of magnitude as aggressive quantization. Source: <a href="https://arxiv.org/abs/2611.05306">Belcak et al., arXiv:2611.05306</a> · <a href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a></figcaption>
</figure>

The local picture is just as blunt. On the DGX Spark, inter-token latency roughly doubles for several models across the measured range, and the memory footprint climbs until MiniMax M2.7 runs out of the ~109GB budget.

<figure class="fig">
  <img src="/images/long-context/fig02-dgx-spark.png" alt="Three panels on an NVIDIA DGX Spark: inter-token latency rises with context length, batch-one throughput falls, and memory consumption approaches the 109GB device limit" width="1903" height="596" loading="lazy" />
  <figcaption><b>Fig. 2 (paper)</b> — The burden of long context on a local device. Latency rises, throughput falls, and memory consumption approaches the device limit; MiniMax M2.7 runs out of memory around 64K tokens. What to notice: the memory panel, not the latency panel. On a desktop-class box, long context does not just cost more — one model stops entirely. Source: <a href="https://arxiv.org/abs/2611.05306">Belcak et al., arXiv:2611.05306</a> · <a href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a></figcaption>
</figure>

<div class="lcx-pull">
  <div class="lcx-pull-mark">“</div>
  <p>The retail price of a token is quoted as if context depth were free. At serving time, depth is the bill.</p>
</div>

This is the economic premise of the paper, and it is worth separating from the rest. Even if compaction did nothing for accuracy, a 3.6–7× serving cost difference would justify asking whether the full history is needed. The accuracy experiments are there to answer the obvious follow-up: *if we stop carrying everything, what breaks?*

<div class="lcx-kicker"><svg class="lcx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#lcx-i-flask-conical"></use></svg>THE EXPERIMENT</div>

## Two kinds of “long,” six plus seven benchmarks

The paper sorts workloads by where the length comes from, and this taxonomy is the most useful thing in it for practitioners.

<div class="lcx-duo">
  <div class="lcx-duo-col">
    <div class="lcx-duo-head"><svg class="lcx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#lcx-i-workflow"></use></svg><span>LONG-HORIZON</span></div>
    <div class="lcx-duo-big">The history grows because the agent acts.</div>
    <p>Repository exploration, terminal tasks, multi-turn tool use. Every action and observation is appended; the context becomes long as a side effect of doing the work.</p>
    <div class="lcx-duo-meta">6 benchmarks · 22 settings per model</div>
  </div>
  <div class="lcx-duo-col">
    <div class="lcx-duo-head"><svg class="lcx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#lcx-i-file-text"></use></svg><span>LONG-INPUT</span></div>
    <div class="lcx-duo-big">The input is long before the agent starts.</div>
    <p>Multi-document QA, needle retrieval, long-code understanding. The question is short; the source material is huge. Nothing about the task requires reading it all at once.</p>
    <div class="lcx-duo-meta">7 benchmarks · selective reading</div>
  </div>
</div>

The benchmark cards below are the full set. Each card says what the benchmark measures and why it belongs in its group. If you already know these benchmarks, skip to the three regimes; the cards are reference material.

<div class="lcx-bench-grid">
  <div class="lcx-bench"><div class="lcx-bench-top"><div class="lcx-bench-ico"><svg class="lcx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#lcx-i-git-branch"></use></svg></div><div><div class="lcx-bench-name">SWE-bench Verified</div><div class="lcx-bench-sub">500 tasks · Python repos</div></div></div><p class="lcx-bench-desc">Resolve real GitHub issues; the patch must pass the repository’s held-out tests. The canonical long-horizon coding benchmark.</p><div class="lcx-bench-stress"><b>WHY IT FITS</b> Exploration, edit, test, debug — a naturally long sequence of dependent actions.</div></div>
  <div class="lcx-bench"><div class="lcx-bench-top"><div class="lcx-bench-ico"><svg class="lcx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#lcx-i-terminal"></use></svg></div><div><div class="lcx-bench-name">SWE-bench Multilingual</div><div class="lcx-bench-sub">300 tasks · 9 languages</div></div></div><p class="lcx-bench-desc">Issue resolution across nine language ecosystems. Same workflow, different repository conventions and toolchains.</p><div class="lcx-bench-stress"><b>WHY IT FITS</b> Tests whether the result survives language and ecosystem changes.</div></div>
  <div class="lcx-bench"><div class="lcx-bench-top"><div class="lcx-bench-ico"><svg class="lcx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#lcx-i-terminal"></use></svg></div><div><div class="lcx-bench-name">Terminal-Bench 2.1</div><div class="lcx-bench-sub">89 tasks · sandboxed CLI</div></div></div><p class="lcx-bench-desc">End-to-end command-line problem solving in containers, scored by per-task verifiers. Broader than a single repository patch.</p><div class="lcx-bench-stress"><b>WHY IT FITS</b> Long command histories, environment state, and recovery from failed commands.</div></div>
  <div class="lcx-bench"><div class="lcx-bench-top"><div class="lcx-bench-ico"><svg class="lcx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#lcx-i-network"></use></svg></div><div><div class="lcx-bench-name">FRAMES</div><div class="lcx-bench-sub">824 multi-hop questions</div></div></div><p class="lcx-bench-desc">Answers require combining facts from 2–15 Wikipedia articles. In this agentic formulation, the model searches and opens articles incrementally.</p><div class="lcx-bench-stress"><b>WHY IT FITS</b> Evidence accumulates across steps, but the agent can choose what to retrieve.</div></div>
  <div class="lcx-bench"><div class="lcx-bench-top"><div class="lcx-bench-ico"><svg class="lcx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#lcx-i-users"></use></svg></div><div><div class="lcx-bench-name">τ²-bench</div><div class="lcx-bench-sub">184 tasks · retail/airline/telecom</div></div></div><p class="lcx-bench-desc">Converse with a simulated user while operating domain tools under policy constraints. Success requires the right answer and the right final state.</p><div class="lcx-bench-stress"><b>WHY IT FITS</b> Early conversation details must remain usable several tool calls later.</div></div>
  <div class="lcx-bench"><div class="lcx-bench-top"><div class="lcx-bench-ico"><svg class="lcx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#lcx-i-layers"></use></svg></div><div><div class="lcx-bench-name">BFCLv3</div><div class="lcx-bench-sub">200 long multi-turn episodes</div></div></div><p class="lcx-bench-desc">Multi-turn tool use in simulated environments. The agent must retain earlier turns and schedule state-changing calls correctly.</p><div class="lcx-bench-stress"><b>WHY IT FITS</b> A clean test of whether early facts survive later turns.</div></div>
  <div class="lcx-bench"><div class="lcx-bench-top"><div class="lcx-bench-ico"><svg class="lcx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#lcx-i-file-text"></use></svg></div><div><div class="lcx-bench-name">LongBench v2</div><div class="lcx-bench-sub">503 questions · 8K–2M words</div></div></div><p class="lcx-bench-desc">Six task families: single- and multi-document QA, long in-context learning, long dialogue, code-repo understanding, structured data.</p><div class="lcx-bench-stress"><b>WHY IT FITS</b> Heterogeneous real documents; the answer rarely needs the whole file.</div></div>
  <div class="lcx-bench"><div class="lcx-bench-top"><div class="lcx-bench-ico"><svg class="lcx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#lcx-i-book-open"></use></svg></div><div><div class="lcx-bench-name">LOONG</div><div class="lcx-bench-sub">1,600 questions · EN/ZH</div></div></div><p class="lcx-bench-desc">Questions over multiple complete financial reports, legal cases, or papers. Locating, comparison, clustering, and chain-of-reasoning tasks.</p><div class="lcx-bench-stress"><b>WHY IT FITS</b> Evidence is distributed across several load-bearing documents.</div></div>
  <div class="lcx-bench"><div class="lcx-bench-top"><div class="lcx-bench-ico"><svg class="lcx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#lcx-i-scale"></use></svg></div><div><div class="lcx-bench-name">AA-LCR</div><div class="lcx-bench-sub">100 questions · ~100K tokens each</div></div></div><p class="lcx-bench-desc">Human-crafted reasoning questions over sets of real reports, consultations, legal documents, and surveys. Multi-step integration, not fact lookup.</p><div class="lcx-bench-stress"><b>WHY IT FITS</b> The input is large, but the relevant evidence is a small subset.</div></div>
  <div class="lcx-bench"><div class="lcx-bench-top"><div class="lcx-bench-ico"><svg class="lcx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#lcx-i-scan-search"></use></svg></div><div><div class="lcx-bench-name">NIAH</div><div class="lcx-bench-sub">125 instances · 16K–500K</div></div></div><p class="lcx-bench-desc">A target sentence is inserted at controlled depth in unrelated essay text; the model must return the fact. The classic needle-in-a-haystack grid.</p><div class="lcx-bench-stress"><b>WHY IT FITS</b> Pure retrieval; if selective reading cannot win here, it cannot win anywhere.</div></div>
  <div class="lcx-bench"><div class="lcx-bench-top"><div class="lcx-bench-ico"><svg class="lcx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#lcx-i-list-filter"></use></svg></div><div><div class="lcx-bench-name">RULER</div><div class="lcx-bench-sub">13 tasks · 256K/500K</div></div></div><p class="lcx-bench-desc">Eight needle variants plus variable tracking, word extraction, and multi-hop QA. Scored by recall of the required answer set.</p><div class="lcx-bench-stress"><b>WHY IT FITS</b> Tests aggregation and tracking, not just a single lexical match.</div></div>
  <div class="lcx-bench"><div class="lcx-bench-top"><div class="lcx-bench-ico"><svg class="lcx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#lcx-i-list-filter"></use></svg></div><div><div class="lcx-bench-name">Counting-Stars</div><div class="lcx-bench-sub">192 questions · EN/ZH</div></div></div><p class="lcx-bench-desc">32 marked numbers are scattered through a long text; the model must recover all of them. The reasoning variant corrects initially wrong counts.</p><div class="lcx-bench-stress"><b>WHY IT FITS</b> Demands exhaustive recall — the hardest case for a lossy summary.</div></div>
  <div class="lcx-bench"><div class="lcx-bench-top"><div class="lcx-bench-ico"><svg class="lcx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#lcx-i-boxes"></use></svg></div><div><div class="lcx-bench-name">BABILong</div><div class="lcx-bench-sub">550 questions · 64K–1M</div></div></div><p class="lcx-bench-desc">Short bAbI facts embedded in book text. Answering requires locating facts and then chaining, counting, negating, or tracking sets.</p><div class="lcx-bench-stress"><b>WHY IT FITS</b> The facts are small; the haystack is enormous; the reasoning is multi-step.</div></div>
</div>

The models are split the same way. Two closed-weight (API-only) frontier models carry the main accuracy experiments — **Claude Opus 4.5** and **GPT 5.6 Sol** — specifically because they come from different providers and different post-training recipes. If compaction helped only one family, the result would be a prompt artifact. Five open-weight (downloadable and self-hostable) models cover the serving and robustness checks: **Qwen 3.6 27B**, **Qwen 3 Coder Next** (80B total, 3B active), **Gemma 4 31B**, **Step 3.7 Flash** (198B total, 11B active), and **MiniMax M2.7** (230B total, 10B active).

The harness is deliberately boring. Both base harnesses run a minimal ReAct loop: the task is the first user message, the model emits **one Bash action at a time**, and the action plus its result are appended to the conversation. `mini-swe-agent` handles software and terminal tasks; `mini-agent` generalizes the same loop to the other benchmarks with benchmark-specific instructions and submission rules. There is no hidden memory layer, no vector database, no retrieval heuristic in the baseline. That is the point: the experiment isolates **context management**, not agent cleverness.

<div class="lcx-kicker"><svg class="lcx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#lcx-i-repeat"></use></svg>THREE REGIMES</div>

## FHA, EoCC, SAC: three ways to carry a conversation

The paper compares three context-management regimes. They differ only in **what the model is allowed to see at the next step**.

<div class="lcx-regime-grid">
  <div class="lcx-regime">
    <div class="lcx-regime-top"><span class="lcx-regime-code">FHA</span><span class="lcx-regime-name">Full-History Accumulation</span></div>
    <p>Append every action and observation. Never remove anything. The context grows monotonically until the task ends or the window overflows.</p>
    <div class="lcx-regime-tag"><svg class="lcx-ico lcx-ico-xs" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#lcx-i-arrow-right"></use></svg>THE DEFAULT</div>
  </div>
  <div class="lcx-regime">
    <div class="lcx-regime-top"><span class="lcx-regime-code">EoCC</span><span class="lcx-regime-name">End-of-Conversation Compaction</span></div>
    <p>Run FHA until the context crosses a threshold. Ask the model for a bounded, task-relevant compaction; start a fresh conversation with the task and that compacted state.</p>
    <div class="lcx-regime-tag"><svg class="lcx-ico lcx-ico-xs" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#lcx-i-scissors"></use></svg>PERIODIC RESET</div>
  </div>
  <div class="lcx-regime">
    <div class="lcx-regime-top"><span class="lcx-regime-code">SAC</span><span class="lcx-regime-name">Single-Action Compaction</span></div>
    <p>Each conversation gets the task and the current semantic state — a written note of what has happened, what is blocked, and what to do next — performs exactly one action, updates the note, and is discarded. No conversational history survives.</p>
    <div class="lcx-regime-tag"><svg class="lcx-ico lcx-ico-xs" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#lcx-i-zap"></use></svg>ONE ACTION</div>
  </div>
</div>

The paper’s Figure 3 draws the three regimes as message stacks. It is worth looking at closely, because the difference between EoCC and SAC is easy to blur.

<figure class="fig">
  <img src="/images/long-context/fig03-regimes.png" alt="Diagram of three context-management regimes: full-history accumulation with an ever-growing conversation, end-of-conversation compaction with periodic summaries, and single-action compaction with one action per conversation" width="2800" height="1020" loading="lazy" />
  <figcaption><b>Fig. 3 (paper)</b> — The three regimes. FHA keeps one conversation that grows without bound. EoCC periodically inserts a compaction and starts a new conversation. SAC carries only a semantic state and performs one action per conversation. What to notice: SAC is not “summarize more often” — it removes the conversational history entirely, leaving a written state as the only bridge. Source: <a href="https://arxiv.org/abs/2611.05306">Belcak et al., arXiv:2611.05306</a> · <a href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a></figcaption>
</figure>

<div class="chamfer-card-wrapper lcx-card">
  <div class="chamfer-card-content">
    <div class="card-tag lcx-tag"><svg class="lcx-ico lcx-ico-xs" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#lcx-i-activity"></use></svg> EXHIBIT // 02 · CONTEXT TRAJECTORIES</div>
    <div class="lcx-card-title">Three regimes, three shapes of memory.</div>
    <p class="lcx-card-sub">A schematic of live context over time. FHA grows without bound; EoCC sawtooths at a threshold; SAC stays flat because every action starts a new conversation.</p>
    <svg class="lcx-chart" viewBox="0 0 440 252" role="img" aria-label="Schematic of live context over actions for three regimes" xmlns="http://www.w3.org/2000/svg"><text x="46" y="10" class="lcx-ch-axis" text-anchor="start">LIVE CONTEXT · SCHEMATIC</text><line x1="46" y1="210.0" x2="336" y2="210.0" class="lcx-ch-grid"/><text x="41" y="212.2" class="lcx-ch-axis" text-anchor="end">0K</text><line x1="46" y1="164.28571428571428" x2="336" y2="164.28571428571428" class="lcx-ch-grid"/><text x="41" y="166.48571428571427" class="lcx-ch-axis" text-anchor="end">50K</text><line x1="46" y1="118.57142857142858" x2="336" y2="118.57142857142858" class="lcx-ch-grid"/><text x="41" y="120.77142857142859" class="lcx-ch-axis" text-anchor="end">100K</text><line x1="46" y1="72.85714285714286" x2="336" y2="72.85714285714286" class="lcx-ch-grid"/><text x="41" y="75.05714285714286" class="lcx-ch-axis" text-anchor="end">150K</text><line x1="46" y1="27.142857142857153" x2="336" y2="27.142857142857153" class="lcx-ch-grid"/><text x="41" y="29.342857142857152" class="lcx-ch-axis" text-anchor="end">200K</text><text x="46.0" y="224" class="lcx-ch-axis" text-anchor="middle">0</text><text x="118.5" y="224" class="lcx-ch-axis" text-anchor="middle">10</text><text x="191.0" y="224" class="lcx-ch-axis" text-anchor="middle">20</text><text x="263.5" y="224" class="lcx-ch-axis" text-anchor="middle">30</text><text x="336.0" y="224" class="lcx-ch-axis" text-anchor="middle">40</text><text x="191.0" y="246" class="lcx-ch-axis" text-anchor="middle">ACTIONS TAKEN</text><path d="M46.0,204.5 L321.5,29.0" class="lcx-ch-line"/><text x="292.5" y="38.11428571428571" class="lcx-ch-note">FHA</text><text x="292.5" y="46.11428571428571" class="lcx-ch-note2">no reset</text><path d="M46.0,204.5 L83.7,173.4 L89.5,204.1 L127.2,173.0 L133.0,203.6 L170.7,172.5 L176.5,203.1 L214.2,172.1 L220.0,202.7 L257.7,171.6 L263.5,202.2 L301.2,171.1" class="lcx-ch-line2"/><text x="270.75" y="151.48571428571427" class="lcx-ch-note">EoCC</text><text x="270.75" y="159.48571428571427" class="lcx-ch-note2">reset at threshold</text><path d="M46.0,207.7 L321.5,207.7" class="lcx-ch-line3"/><text x="220.0" y="203.71428571428572" class="lcx-ch-note">SAC · one action per context</text><line x1="46.0" y1="18" x2="46.0" y2="210" class="lcx-ch-axis-line"/></svg>
    <div class="lcx-src">Schematic · based on §2.4.1 and Fig. 3</div>
  </div>
</div>

The thresholds are written as **total context limit / compaction threshold**. For example, `16K / 12K` means the agent compacts when the running context approaches 12K tokens, and the harness never lets a single conversation exceed 16K. The gap between the two numbers reserves room for the compaction turn itself. This notation matters when reading the tables: the first number is the hard cap, the second is the trigger.

For long-horizon tasks, the authors sweep four settings on most benchmarks: `48K/36K`, `32K/24K`, `24K/18K`, and `16K/12K`. BFCLv3 goes down to `12K/8K`; τ²-bench goes down to `8K/6K`. Every step down is a tighter budget and more frequent compaction. If accuracy were mostly a function of context length, these curves should fall off a cliff. They do not.

For long-input tasks, the trick is different. The documents are not placed in the conversation at all. They are written to the agent’s filesystem as `input01.txt`, `input02.txt`, and so on. The task message names the files; the agent uses ordinary Bash tools to search and read them. The paper calls this **selective input reading**. It converts a long-input task into a long-horizon task: the agent takes actions (`grep` this, `sed` that), observes results, and decides what to read next.

<div class="lcx-callout">
  <svg class="lcx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#lcx-i-folder-open"></use></svg>
  <div><b>The warehouse, not the desk.</b> Pasting a 500K-token document into the prompt is carrying the whole warehouse to your desk. Selective reading is keeping the warehouse, learning its index, and sending a runner for the two boxes you need. The runner’s report is small; the warehouse is still there.</div>
</div>

This is also the paper’s answer to the obvious objection. “What if the agent needs something you compacted away?” Keep the full transcript on disk and give the agent a way to search it. The information does not have to be in the context to be available to the agent. That distinction — **in context** versus **accessible** — is the conceptual core of the whole result.

<div class="lcx-kicker"><svg class="lcx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#lcx-i-gauge"></use></svg>RESULT 1 · LONG-HORIZON</div>

## Compaction is boring on long-horizon tasks — in the best way

The first research question is whether an agent that takes many actions can finish the task without carrying the whole history. The answer, across six benchmarks and two frontier models, is yes — with small, uneven, mostly positive deviations.

<figure class="fig">
  <img src="/images/long-context/fig05-long-horizon.png" alt="Six panels of long-horizon benchmark results showing accuracy changes near zero and cost savings between 2x and 8.8x as the total context limit shrinks" width="3000" height="2344" loading="lazy" />
  <figcaption><b>Fig. 5 (paper)</b> — Long-horizon results as a function of total context limit. Top row: accuracy change versus the full-history baseline; zero is unchanged. Bottom row: estimated cost savings. Orange is Claude Opus 4.5, blue is GPT 5.6 Sol. What to notice: the accuracy lines hover around zero while the cost bars climb — the trade is not “less accuracy for less cost,” it is mostly “same accuracy for less cost.” Source: <a href="https://arxiv.org/abs/2611.05306">Belcak et al., arXiv:2611.05306</a> · <a href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a></figcaption>
</figure>

The aggregate numbers:

- **Accuracy range:** Opus 4.5 spans **−3.7 to +5.6 points** across all benchmarks and thresholds; GPT 5.6 Sol spans **−3.3 to +4.4**.
- **How often it hurts:** for either model, **no more than 5 of 22 threshold configurations** lose more than 2 points versus baseline.
- **Cost:** **2.2×–8.8×** savings for Opus 4.5 and **2.4×–5.0×** for GPT 5.6 Sol.
- **No token-spend blow-up:** compaction did not generally cause the agent to redo work and burn more total tokens. New input tokens rise as the window shrinks, cached tokens fall, and output tokens rise, sharply for GPT at the tightest setting — the expected pattern.

<div class="chamfer-card-wrapper lcx-card">
  <div class="chamfer-card-content">
    <div class="card-tag lcx-tag"><svg class="lcx-ico lcx-ico-xs" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#lcx-i-coins"></use></svg> EXHIBIT // 03 · LONG-HORIZON ECONOMICS</div>
    <div class="lcx-card-title">Same accuracy, 2.2–8.8× cheaper.</div>
    <p class="lcx-card-sub">Estimated cost savings versus the full-history baseline for each long-horizon benchmark. Each bar spans the lowest to the highest setting tested; the dot marks the maximum.</p>
    <svg class="lcx-chart" viewBox="0 0 440 300" role="img" aria-label="Range of estimated cost savings per long-horizon benchmark for two models" xmlns="http://www.w3.org/2000/svg"><text x="130" y="10" class="lcx-ch-axis" text-anchor="start">ESTIMATED COST SAVINGS VS. FULL HISTORY</text><line x1="130.0" y1="26" x2="130.0" y2="236" class="lcx-ch-grid"/><text x="130.0" y="250" class="lcx-ch-axis" text-anchor="middle">1×</text><line x1="189.29411764705884" y1="26" x2="189.29411764705884" y2="236" class="lcx-ch-grid"/><text x="189.29411764705884" y="250" class="lcx-ch-axis" text-anchor="middle">3×</text><line x1="248.58823529411765" y1="26" x2="248.58823529411765" y2="236" class="lcx-ch-grid"/><text x="248.58823529411765" y="250" class="lcx-ch-axis" text-anchor="middle">5×</text><line x1="307.88235294117646" y1="26" x2="307.88235294117646" y2="236" class="lcx-ch-grid"/><text x="307.88235294117646" y="250" class="lcx-ch-axis" text-anchor="middle">7×</text><line x1="367.1764705882353" y1="26" x2="367.1764705882353" y2="236" class="lcx-ch-grid"/><text x="367.1764705882353" y="250" class="lcx-ch-axis" text-anchor="middle">9×</text><line x1="130.0" y1="26" x2="130.0" y2="236" class="lcx-ch-zero"/><text x="0" y="49" class="lcx-ch-label">SWE-bench Verified</text><line x1="195.2" y1="46" x2="299.0" y2="46" class="lcx-ch-range"/><line x1="195.2" y1="43" x2="195.2" y2="49" class="lcx-ch-cap"/><line x1="299.0" y1="43" x2="299.0" y2="49" class="lcx-ch-cap"/><circle cx="299.0" cy="46" r="2.5" class="lcx-ch-dot"/><text x="302.98823529411766" y="48.3" class="lcx-ch-value">6.7×</text><line x1="189.3" y1="56" x2="221.9" y2="56" class="lcx-ch-range2"/><line x1="189.3" y1="53" x2="189.3" y2="59" class="lcx-ch-cap2"/><line x1="221.9" y1="53" x2="221.9" y2="59" class="lcx-ch-cap2"/><circle cx="221.9" cy="56" r="2.3" class="lcx-ch-dot2"/><text x="225.90588235294115" y="58.2" class="lcx-ch-value2">4.1×</text><text x="0" y="83" class="lcx-ch-label">Terminal-Bench 2.1</text><line x1="165.6" y1="80" x2="245.6" y2="80" class="lcx-ch-range"/><line x1="165.6" y1="77" x2="165.6" y2="83" class="lcx-ch-cap"/><line x1="245.6" y1="77" x2="245.6" y2="83" class="lcx-ch-cap"/><circle cx="245.6" cy="80" r="2.5" class="lcx-ch-dot"/><text x="249.6235294117647" y="82.3" class="lcx-ch-value">4.9×</text><line x1="171.5" y1="90" x2="218.9" y2="90" class="lcx-ch-range2"/><line x1="171.5" y1="87" x2="171.5" y2="93" class="lcx-ch-cap2"/><line x1="218.9" y1="87" x2="218.9" y2="93" class="lcx-ch-cap2"/><circle cx="218.9" cy="90" r="2.3" class="lcx-ch-dot2"/><text x="222.94117647058823" y="92.2" class="lcx-ch-value2">4.0×</text><text x="0" y="117" class="lcx-ch-label">SWE-bench Multilingual</text><line x1="210.0" y1="114" x2="361.2" y2="114" class="lcx-ch-range"/><line x1="210.0" y1="111" x2="210.0" y2="117" class="lcx-ch-cap"/><line x1="361.2" y1="111" x2="361.2" y2="117" class="lcx-ch-cap"/><circle cx="361.2" cy="114" r="2.5" class="lcx-ch-dot"/><text x="365.2470588235294" y="116.3" class="lcx-ch-value">8.8×</text><line x1="189.3" y1="124" x2="204.1" y2="124" class="lcx-ch-range2"/><line x1="189.3" y1="121" x2="189.3" y2="127" class="lcx-ch-cap2"/><line x1="204.1" y1="121" x2="204.1" y2="127" class="lcx-ch-cap2"/><circle cx="204.1" cy="124" r="2.3" class="lcx-ch-dot2"/><text x="208.11764705882354" y="126.2" class="lcx-ch-value2">3.5×</text><text x="0" y="151" class="lcx-ch-label">FRAMES</text><line x1="218.9" y1="148" x2="328.6" y2="148" class="lcx-ch-range"/><line x1="218.9" y1="145" x2="218.9" y2="151" class="lcx-ch-cap"/><line x1="328.6" y1="145" x2="328.6" y2="151" class="lcx-ch-cap"/><circle cx="328.6" cy="148" r="2.5" class="lcx-ch-dot"/><text x="332.63529411764705" y="150.3" class="lcx-ch-value">7.7×</text><line x1="183.4" y1="158" x2="213.0" y2="158" class="lcx-ch-range2"/><line x1="183.4" y1="155" x2="183.4" y2="161" class="lcx-ch-cap2"/><line x1="213.0" y1="155" x2="213.0" y2="161" class="lcx-ch-cap2"/><circle cx="213.0" cy="158" r="2.3" class="lcx-ch-dot2"/><text x="217.01176470588234" y="160.2" class="lcx-ch-value2">3.8×</text><text x="0" y="185" class="lcx-ch-label">BFCLv3</text><line x1="218.9" y1="182" x2="251.6" y2="182" class="lcx-ch-range"/><line x1="218.9" y1="179" x2="218.9" y2="185" class="lcx-ch-cap"/><line x1="251.6" y1="179" x2="251.6" y2="185" class="lcx-ch-cap"/><circle cx="251.6" cy="182" r="2.5" class="lcx-ch-dot"/><text x="255.55294117647057" y="184.3" class="lcx-ch-value">5.1×</text><line x1="221.9" y1="192" x2="248.6" y2="192" class="lcx-ch-range2"/><line x1="221.9" y1="189" x2="221.9" y2="195" class="lcx-ch-cap2"/><line x1="248.6" y1="189" x2="248.6" y2="195" class="lcx-ch-cap2"/><circle cx="248.6" cy="192" r="2.3" class="lcx-ch-dot2"/><text x="252.58823529411765" y="194.2" class="lcx-ch-value2">5.0×</text><text x="0" y="219" class="lcx-ch-label">τ²-bench</text><line x1="242.7" y1="216" x2="260.4" y2="216" class="lcx-ch-range"/><line x1="242.7" y1="213" x2="242.7" y2="219" class="lcx-ch-cap"/><line x1="260.4" y1="213" x2="260.4" y2="219" class="lcx-ch-cap"/><circle cx="260.4" cy="216" r="2.5" class="lcx-ch-dot"/><text x="264.44705882352946" y="218.3" class="lcx-ch-value">5.4×</text><line x1="210.0" y1="226" x2="216.0" y2="226" class="lcx-ch-range2"/><line x1="210.0" y1="223" x2="210.0" y2="229" class="lcx-ch-cap2"/><line x1="216.0" y1="223" x2="216.0" y2="229" class="lcx-ch-cap2"/><circle cx="216.0" cy="226" r="2.3" class="lcx-ch-dot2"/><text x="219.9764705882353" y="228.2" class="lcx-ch-value2">3.9×</text><line x1="130" y1="258" x2="144" y2="258" class="lcx-ch-range"/><text x="149" y="260.3" class="lcx-ch-note">Opus 4.5</text><line x1="208" y1="258" x2="222" y2="258" class="lcx-ch-range2"/><text x="227" y="260.3" class="lcx-ch-note">GPT 5.6 Sol</text><text x="436" y="260.3" class="lcx-ch-note" text-anchor="end">dot = highest multiple</text><text x="130" y="288" class="lcx-ch-note">Bar extends from the lowest to the highest observed setting; the dot marks the maximum.</text></svg>
    <div class="lcx-src">Redrawn from Fig. 5 · arXiv:2611.05306</div>
  </div>
</div>

The per-benchmark table is more informative than the range, because the exceptions cluster in predictable places.

<div class="lcx-table-card">
  <div class="lcx-table-head">
    <div class="lcx-table-tag"><svg class="lcx-ico lcx-ico-xs" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#lcx-i-chart-no-axes-column"></use></svg>LONG-HORIZON · ACCURACY AND BEST SETTING</div>
    <div class="lcx-table-title">Where compaction helped, and where it cost a little.</div>
    <p class="lcx-table-sub">Best EoCC accuracy for each benchmark, with the setting that produced it. Δ is versus the full-history baseline. The tightest setting is not always the best one.</p>
  </div>
  <div class="lcx-table-scroll">
    <table class="lcx-results">
      <thead><tr><th>Benchmark</th><th class="num">Opus base</th><th class="num">Opus best</th><th class="num">Δ</th><th>Best setting</th><th class="num">GPT base</th><th class="num">GPT best</th><th class="num">Δ</th><th>Best setting</th></tr></thead>
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
  <div class="lcx-table-foot">Best EoCC accuracy across the settings tested. Source: arXiv:2611.05306, Appendix C, Tables 3–8.</div>
</div>

Three patterns are worth naming.

**First, the wins are largest on coding and terminal work.** Opus gains 4.8 points on SWE-bench Verified, 5.6 on Terminal-Bench, and 1.7 on the multilingual set. This is not what a pure information-loss story predicts. A plausible explanation: compaction forces the model to write down a plan and a current state, which acts as a better working memory than a 30K-token pile of shell output. The paper does not prove that mechanism, but the pattern is consistent with it.

**Second, FRAMES is the one benchmark where compaction reliably loses.** It is also the benchmark where the agent retrieves from a fixed Wikipedia corpus and accumulates evidence over many hops. When the task is *evidence integration across retrieved documents*, a summary that drops the wrong sentence is expensive. The loss is small (1.3–3.7 points for Opus, 1.5–3.3 for GPT), but it is systematic.

**Third, the best setting is often not the tightest.** SWE-bench Verified peaks at 24K/18K for Opus, not 16K/12K. Terminal-Bench peaks at 32K/24K. The relationship is not monotone: too much compaction and the agent loses the thread; too little and it pays for tokens it does not use. The practical implication is that **the budget is a hyperparameter, not a moral position.**

<div class="lcx-pull">
  <div class="lcx-pull-mark">“</div>
  <p>The result is not “shorter is always better.” It is “the optimum is far shorter than the default, and the curve is flat enough that you can find it.”</p>
</div>

### The objection the paper takes seriously

There is an obvious counterexample to “you never need the history”: tasks that require exact recall of an arbitrary sequence. The paper offers a thought experiment. Give an agent a coin-toss tool. The tool reports each outcome. Ask the agent, later, for the *i*-th outcome. With a fixed compaction budget, some compaction must eventually drop some outcomes; when the agent needs the dropped one, it fails. The failure is caused by compaction, not by the model.

The paper’s response is subtle and, I think, correct: **keep the full transcript and make it searchable.** The agent’s conversational history becomes another long input. If it needs the 37th coin toss, it can `grep` the archive. The information does not need to be *in context*; it needs to be *accessible*. That move converts the counterexample from a refutation into a design requirement: **compaction without an archive is lossy; compaction with an archive is a cache.**

This is the same move a database makes. The buffer pool is small; the disk is large; the index decides what to bring in. The paper is arguing that agent memory should look more like a database and less like a ever-growing chat log.

<div class="lcx-kicker"><svg class="lcx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#lcx-i-file-text"></use></svg>RESULT 2 · LONG-INPUT</div>

## Selective reading beats pasting — sometimes by 40 points

The second research question is whether a long input needs to be ingested at all. The baseline receives the entire document in the prompt. The compacting harness receives a filesystem and a set of Bash tools. Both use the same model and the same task.

The result is not close.

<figure class="fig">
  <img src="/images/long-context/fig06-long-input.png" alt="Seven panels of long-input benchmark results showing accuracy gains up to 40 points and cost savings from 4.4x to 233x when the agent reads documents selectively" width="3000" height="3186" loading="lazy" />
  <figcaption><b>Fig. 6 (paper)</b> — Long-input results. Top row of each panel: accuracy change versus the full-input baseline. Bottom row: estimated cost savings. The gains are largest on needle-style benchmarks, but even LOONG and AA-LCR improve. What to notice: the top row of each panel stays flat or above zero while the bottom row climbs. The agent is not trading accuracy for cost; it is getting both. The x-axis is the total context limit, not document size. Source: <a href="https://arxiv.org/abs/2611.05306">Belcak et al., arXiv:2611.05306</a> · <a href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a></figcaption>
</figure>

The aggregate numbers are almost implausible until you look at the mechanism:

- **Accuracy range:** Opus 4.5 **−0.4 to +40.0 points**; GPT 5.6 Sol **+1.0 to +30.9 points**. Only one of fourteen model–benchmark pairs is negative, and it is −0.4.
- **Cost:** **6.5×–54.6×** for Opus 4.5 and **4.4×–233.3×** for GPT 5.6 Sol.
- **Compaction is rare:** on several benchmarks the median number of compactions is **zero**. Selective reading does almost all the work; compaction is the fallback, not the main event.

<div class="chamfer-card-wrapper lcx-card">
  <div class="chamfer-card-content">
    <div class="card-tag lcx-tag"><svg class="lcx-ico lcx-ico-xs" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#lcx-i-trending-down"></use></svg> EXHIBIT // 04 · LONG-INPUT DELTAS</div>
    <div class="lcx-card-title">Selective reading usually wins.</div>
    <p class="lcx-card-sub">Accuracy change versus the full-input baseline, in percentage points. A bar to the right of zero means storing documents as files and reading them with Bash beat pasting everything into the prompt.</p>
    <svg class="lcx-chart" viewBox="0 0 460 310" role="img" aria-label="Accuracy delta for seven long-input benchmarks and two models" xmlns="http://www.w3.org/2000/svg"><text x="126" y="10" class="lcx-ch-axis" text-anchor="start">ACCURACY CHANGE VS. FULL-INPUT BASELINE (PTS)</text><line x1="146.8" y1="26" x2="146.8" y2="236" class="lcx-ch-grid"/><text x="146.8" y="250" class="lcx-ch-axis" text-anchor="middle">+0</text><line x1="216.13333333333333" y1="26" x2="216.13333333333333" y2="236" class="lcx-ch-grid"/><text x="216.13333333333333" y="250" class="lcx-ch-axis" text-anchor="middle">+10</text><line x1="285.4666666666667" y1="26" x2="285.4666666666667" y2="236" class="lcx-ch-grid"/><text x="285.4666666666667" y="250" class="lcx-ch-axis" text-anchor="middle">+20</text><line x1="354.8" y1="26" x2="354.8" y2="236" class="lcx-ch-grid"/><text x="354.8" y="250" class="lcx-ch-axis" text-anchor="middle">+30</text><line x1="424.1333333333333" y1="26" x2="424.1333333333333" y2="236" class="lcx-ch-grid"/><text x="424.1333333333333" y="250" class="lcx-ch-axis" text-anchor="middle">+40</text><line x1="146.8" y1="26" x2="146.8" y2="236" class="lcx-ch-zero"/><text x="0" y="47" class="lcx-ch-label">LongBench v2</text><rect x="144.0" y="38" width="2.8" height="5" class="lcx-ch-bar"/><text x="140.02666666666667" y="42.4" class="lcx-ch-value" text-anchor="end">-0.4</text><rect x="146.8" y="48" width="12.5" height="5" class="lcx-ch-bar2"/><text x="163.28" y="52.4" class="lcx-ch-value2" text-anchor="start">+1.8</text><text x="0" y="77" class="lcx-ch-label">LOONG</text><rect x="146.8" y="68" width="63.8" height="5" class="lcx-ch-bar"/><text x="214.58666666666664" y="72.4" class="lcx-ch-value" text-anchor="start">+9.2</text><rect x="146.8" y="78" width="23.6" height="5" class="lcx-ch-bar2"/><text x="174.37333333333333" y="82.4" class="lcx-ch-value2" text-anchor="start">+3.4</text><text x="0" y="107" class="lcx-ch-label">AA-LCR</text><rect x="146.8" y="98" width="131.7" height="5" class="lcx-ch-bar"/><text x="282.5333333333333" y="102.4" class="lcx-ch-value" text-anchor="start">+19.0</text><rect x="146.8" y="108" width="6.9" height="5" class="lcx-ch-bar2"/><text x="157.73333333333335" y="112.4" class="lcx-ch-value2" text-anchor="start">+1.0</text><text x="0" y="137" class="lcx-ch-label">NIAH</text><rect x="146.8" y="128" width="277.3" height="5" class="lcx-ch-bar"/><text x="428.1333333333333" y="132.4" class="lcx-ch-value" text-anchor="start">+40.0</text><rect x="146.8" y="138" width="138.7" height="5" class="lcx-ch-bar2"/><text x="289.4666666666667" y="142.4" class="lcx-ch-value2" text-anchor="start">+20.0</text><text x="0" y="167" class="lcx-ch-label">RULER</text><rect x="146.8" y="158" width="230.2" height="5" class="lcx-ch-bar"/><text x="380.9866666666667" y="162.4" class="lcx-ch-value" text-anchor="start">+33.2</text><rect x="146.8" y="168" width="214.2" height="5" class="lcx-ch-bar2"/><text x="365.03999999999996" y="172.4" class="lcx-ch-value2" text-anchor="start">+30.9</text><text x="0" y="197" class="lcx-ch-label">Counting-Stars</text><rect x="146.8" y="188" width="111.6" height="5" class="lcx-ch-bar"/><text x="262.4266666666667" y="192.4" class="lcx-ch-value" text-anchor="start">+16.1</text><rect x="146.8" y="198" width="31.9" height="5" class="lcx-ch-bar2"/><text x="182.69333333333333" y="202.4" class="lcx-ch-value2" text-anchor="start">+4.6</text><text x="0" y="227" class="lcx-ch-label">BABILong</text><rect x="146.8" y="218" width="172.6" height="5" class="lcx-ch-bar"/><text x="323.44" y="222.4" class="lcx-ch-value" text-anchor="start">+24.9</text><rect x="146.8" y="228" width="161.5" height="5" class="lcx-ch-bar2"/><text x="312.3466666666667" y="232.4" class="lcx-ch-value2" text-anchor="start">+23.3</text><rect x="126" y="266" width="9" height="5" class="lcx-ch-bar"/><text x="140" y="271" class="lcx-ch-note">Opus 4.5</text><rect x="204" y="266" width="9" height="5" class="lcx-ch-bar2"/><text x="218" y="271" class="lcx-ch-note">GPT 5.6 Sol</text><text x="458" y="271" class="lcx-ch-note" text-anchor="end">best compacted setting</text><text x="126" y="298" class="lcx-ch-note">A bar to the right of zero means selective reading beat pasting the whole document.</text></svg>
    <div class="lcx-src">Redrawn from Fig. 6 and Tables 11–17</div>
  </div>
</div>

The per-benchmark table makes the pattern concrete.

<div class="lcx-table-card">
  <div class="lcx-table-head">
    <div class="lcx-table-tag"><svg class="lcx-ico lcx-ico-xs" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#lcx-i-chart-no-axes-column"></use></svg>LONG-INPUT · BASELINE VS. SELECTIVE READING</div>
    <div class="lcx-table-title">Seven benchmarks, two models, one pattern.</div>
    <p class="lcx-table-sub">Best compacted accuracy versus the full-input baseline. “Perfect” is the exact-answer rate where the benchmark reports one; “mean” is the average score. Cost multiple is the paper’s estimate at the displayed setting.</p>
  </div>
  <div class="lcx-table-scroll">
    <table class="lcx-results lcx-wide">
      <thead><tr><th>Benchmark</th><th class="num">Opus base</th><th class="num">Opus compact</th><th class="num">Δ</th><th class="num">Cost</th><th class="num">GPT base</th><th class="num">GPT compact</th><th class="num">Δ</th><th class="num">Cost</th></tr></thead>
      <tbody>
        <tr><td>LongBench v2</td><td class="num">68.0</td><td class="num">67.6</td><td class="num neg">−0.4</td><td class="num">7.4×</td><td class="num">70.8</td><td class="num strong">72.6</td><td class="num pos">+1.8</td><td class="num">4.4×</td></tr>
        <tr><td>LOONG <span class="lcx-cell-note">avg / perfect</span></td><td class="num">70.1 / 38.9</td><td class="num strong">79.3 / 53.4</td><td class="num pos">+9.2 / +14.5</td><td class="num">13.6×</td><td class="num">79.3 / 44.4</td><td class="num strong">82.7 / 51.9</td><td class="num pos">+3.4 / +7.5</td><td class="num">12.9×</td></tr>
        <tr><td>AA-LCR</td><td class="num">65.0</td><td class="num strong">84.0</td><td class="num pos">+19.0</td><td class="num">9.8×</td><td class="num">82.0</td><td class="num strong">83.0</td><td class="num pos">+1.0</td><td class="num">16.2×</td></tr>
        <tr><td>NIAH</td><td class="num">60.0</td><td class="num strong">100.0</td><td class="num pos">+40.0</td><td class="num">54.6×</td><td class="num">80.0</td><td class="num strong">100.0</td><td class="num pos">+20.0</td><td class="num">233.3×</td></tr>
        <tr><td>RULER <span class="lcx-cell-note">recall</span></td><td class="num">62.5</td><td class="num strong">95.7</td><td class="num pos">+33.2</td><td class="num">42.8×</td><td class="num">65.5</td><td class="num strong">96.4</td><td class="num pos">+30.9</td><td class="num">80.5×</td></tr>
        <tr><td>Counting-Stars <span class="lcx-cell-note">exact</span></td><td class="num">65.1</td><td class="num strong">81.2</td><td class="num pos">+16.1</td><td class="num">25.9×</td><td class="num">76.6</td><td class="num strong">81.2</td><td class="num pos">+4.6</td><td class="num">40.7×</td></tr>
        <tr><td>BABILong</td><td class="num">67.1</td><td class="num strong">92.0</td><td class="num pos">+24.9</td><td class="num">31.5×</td><td class="num">70.7</td><td class="num strong">94.0</td><td class="num pos">+23.3</td><td class="num">88.0×</td></tr>
      </tbody>
    </table>
  </div>
  <div class="lcx-table-foot">Best compacted result per benchmark, with the paper’s estimated optimized retail cost multiple. Source: Appendix F, Tables 11–17, and Figure 6.</div>
</div>

Why does selective reading *beat* pasting? The paper’s explanation is not that the model is smarter with a small context. It is that **retrieval is a filtering step**. A `grep` for a name or a phrase returns a handful of lines; the model then reads a window around them. The irrelevant 99% never enters the context, so it cannot distract the model or dilute attention. Pasting everything makes the model do the filtering internally, with a finite attention budget and no explicit index.

The paper also reports the length relationship directly. Figures 7 and 8 plot total conversation length against document length on a log x-axis. If the agent were ingesting documents proportionally, the points would track the dashed `y = x` line. They do not; conversation length stays in a broad band while document length spans orders of magnitude.

<figure class="fig">
  <img src="/images/long-context/fig07-longbench-scatter.png" alt="Scatter plot of LongBench v2 conversation length versus document length on a logarithmic x-axis; most points sit in a horizontal band far below the equal-length line" width="2400" height="1548" loading="lazy" />
  <figcaption><b>Fig. 7 (paper)</b> — LongBench v2, Opus 4.5 with compaction at 16K/12K. The x-axis is logarithmic; the y-axis is linear; the dashed curve is `y = x`. What to notice: conversations stay roughly bounded as documents grow from 10K to over 1M tokens. The agent is not reading proportionally more; it is searching better. Source: <a href="https://arxiv.org/abs/2611.05306">Belcak et al., arXiv:2611.05306</a> · <a href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a></figcaption>
</figure>

<figure class="fig">
  <img src="/images/long-context/fig08-loong-scatter.png" alt="Scatter plot of LOONG conversation length versus document length; four document-size groups remain in a band around 20K to 100K conversation tokens, below the equal-length line" width="2400" height="1548" loading="lazy" />
  <figcaption><b>Fig. 8 (paper)</b> — LOONG, Opus 4.5 with compaction at 48K/40K, 1,600 questions. The same bounded-conversation pattern across four document-size buckets. What to notice: the vertical spread comes from task difficulty, not from document length. A 300K-token document does not force a 300K-token conversation. Source: <a href="https://arxiv.org/abs/2611.05306">Belcak et al., arXiv:2611.05306</a> · <a href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a></figcaption>
</figure>

The near-zero median compaction count is the tell. On NIAH, neither model compacts at all; on Counting-Stars, neither compacts; on RULER, the median is zero; on BABILong, GPT never compacts and Opus compacts at most once per task. The agent finds the evidence, reads a small window, and answers. The long input is long, but the *working set* is small.

<div class="lcx-callout lcx-callout-warn">
  <svg class="lcx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#lcx-i-triangle-alert"></use></svg>
  <div><b>Don’t over-read the needle results.</b> NIAH and Counting-Stars have lexical handles: names, numbers, distinctive phrases. A `grep` can find them. The paper is candid that this makes the needle benchmarks easier than realistic multi-document reasoning. The stronger evidence is LOONG and AA-LCR, where the agent must locate, compare, and integrate evidence across documents — and still improves.</div>
</div>

The paper also makes a philosophical point that is easy to miss: **needle-in-a-haystack benchmarks assume the existence of long-context tasks.** If the only reason a task produces a long context is that someone pasted a haystack into the prompt, then the benchmark is measuring a self-imposed constraint. The paper’s results suggest that the constraint can be removed without losing the needle.

<div class="lcx-kicker"><svg class="lcx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#lcx-i-zap"></use></svg>RESULT 3 · ONE ACTION</div>

## The most radical version: one action per context

The third question is the one that made me sit up. If compaction works, how often can you do it? Once per conversation? Once per task? The paper pushes it to the limit: **compact after every single action.** Each conversation contains the task, the current semantic state, and exactly one Bash action. Then the conversation is thrown away, and the next one starts from the updated state.

This is not “summarize the history more aggressively.” It is a different execution model: the model never sees its own previous messages, only a written state that it produced. The state is the only bridge between actions.

<div class="lcx-table-card">
  <div class="lcx-table-head">
    <div class="lcx-table-tag"><svg class="lcx-ico lcx-ico-xs" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#lcx-i-chart-no-axes-column"></use></svg>TABLE 2, REDRAWN · SAC VS. FHA VS. EoCC</div>
    <div class="lcx-table-title">One action per context, almost no accuracy cost.</div>
    <p class="lcx-table-sub">Peak context length is median / maximum per task, in thousands of tokens. The best EoCC column uses the setting in parentheses.</p>
  </div>
  <div class="lcx-table-scroll">
    <table class="lcx-results">
      <thead><tr><th>Model · benchmark</th><th class="num">FHA acc.</th><th class="num">Best EoCC</th><th class="num">SAC acc.</th><th class="num">FHA peak</th><th class="num">Best EoCC peak</th><th class="num">SAC peak</th></tr></thead>
      <tbody>
        <tr><td>Opus 4.5 · SWE-bench Verified</td><td class="num">70.0</td><td class="num">74.8 <span class="lcx-cell-note">(24K/18K)</span></td><td class="num strong">70.2</td><td class="num">32 / 200</td><td class="num">19 / 22</td><td class="num strong">8 / 16</td></tr>
        <tr><td>Opus 4.5 · Terminal-Bench</td><td class="num">47.2</td><td class="num">52.8 <span class="lcx-cell-note">(32K/24K)</span></td><td class="num strong">51.8</td><td class="num">27 / 130</td><td class="num">24 / 31</td><td class="num strong">9 / 19</td></tr>
        <tr><td>GPT 5.6 Sol · SWE-bench Verified</td><td class="num">84.4</td><td class="num">88.8 <span class="lcx-cell-note">(48K/36K)</span></td><td class="num">82.4</td><td class="num">18 / 173</td><td class="num">22 / 35</td><td class="num strong">7 / 15</td></tr>
        <tr><td>GPT 5.6 Sol · Terminal-Bench</td><td class="num">87.6</td><td class="num">88.8 <span class="lcx-cell-note">(48K/36K)</span></td><td class="num">84.3</td><td class="num">17 / 133</td><td class="num">23 / 40</td><td class="num strong">8 / 37</td></tr>
      </tbody>
    </table>
  </div>
  <div class="lcx-table-foot">SAC preserves or improves Opus 4.5’s baseline on both benchmarks; GPT 5.6 Sol loses 2.0 and 3.3 points. Peak context is collapsed in every row. Source: arXiv:2611.05306, Table 2.</div>
</div>

<div class="chamfer-card-wrapper lcx-card">
  <div class="chamfer-card-content">
    <div class="card-tag lcx-tag"><svg class="lcx-ico lcx-ico-xs" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#lcx-i-zap"></use></svg> EXHIBIT // 05 · THE SINGLE-ACTION RESULT</div>
    <div class="lcx-card-title">The peak context collapses; accuracy mostly does not.</div>
    <p class="lcx-card-sub">Peak live context per task under the full-history baseline (light) and single-action compaction (dark). The median is the dot; the bar reaches the maximum.</p>
    <svg class="lcx-chart" viewBox="0 0 440 250" role="img" aria-label="Peak context length under full history versus single-action compaction" xmlns="http://www.w3.org/2000/svg"><text x="132" y="10" class="lcx-ch-axis" text-anchor="start">PEAK LIVE CONTEXT PER TASK (K TOKENS)</text><line x1="132.0" y1="28" x2="132.0" y2="196" class="lcx-ch-grid"/><text x="132.0" y="210" class="lcx-ch-axis" text-anchor="middle">0K</text><line x1="192.95238095238096" y1="28" x2="192.95238095238096" y2="196" class="lcx-ch-grid"/><text x="192.95238095238096" y="210" class="lcx-ch-axis" text-anchor="middle">50K</text><line x1="253.9047619047619" y1="28" x2="253.9047619047619" y2="196" class="lcx-ch-grid"/><text x="253.9047619047619" y="210" class="lcx-ch-axis" text-anchor="middle">100K</text><line x1="314.8571428571429" y1="28" x2="314.8571428571429" y2="196" class="lcx-ch-grid"/><text x="314.8571428571429" y="210" class="lcx-ch-axis" text-anchor="middle">150K</text><line x1="375.8095238095238" y1="28" x2="375.8095238095238" y2="196" class="lcx-ch-grid"/><text x="375.8095238095238" y="210" class="lcx-ch-axis" text-anchor="middle">200K</text><line x1="132.0" y1="28" x2="132.0" y2="196" class="lcx-ch-zero"/><text x="0" y="50" class="lcx-ch-label">Opus · SWE-bench Verified</text><line x1="171.0" y1="46" x2="375.8" y2="46" class="lcx-ch-range"/><line x1="171.0" y1="43" x2="171.0" y2="49" class="lcx-ch-cap"/><line x1="375.8" y1="43" x2="375.8" y2="49" class="lcx-ch-cap"/><circle cx="171.0" cy="46" r="2.5" class="lcx-ch-dot2"/><text x="379.8095238095238" y="48.2" class="lcx-ch-note">200K</text><line x1="141.8" y1="57" x2="151.5" y2="57" class="lcx-ch-range-strong"/><line x1="141.8" y1="54" x2="141.8" y2="60" class="lcx-ch-cap-strong"/><line x1="151.5" y1="54" x2="151.5" y2="60" class="lcx-ch-cap-strong"/><circle cx="141.8" cy="57" r="2.8" class="lcx-ch-dot"/><text x="155.5047619047619" y="59.2" class="lcx-ch-value">16K</text><text x="0" y="88" class="lcx-ch-label">Opus · Terminal-Bench</text><line x1="164.9" y1="84" x2="290.5" y2="84" class="lcx-ch-range"/><line x1="164.9" y1="81" x2="164.9" y2="87" class="lcx-ch-cap"/><line x1="290.5" y1="81" x2="290.5" y2="87" class="lcx-ch-cap"/><circle cx="164.9" cy="84" r="2.5" class="lcx-ch-dot2"/><text x="294.4761904761905" y="86.2" class="lcx-ch-note">130K</text><line x1="143.0" y1="95" x2="155.2" y2="95" class="lcx-ch-range-strong"/><line x1="143.0" y1="92" x2="143.0" y2="98" class="lcx-ch-cap-strong"/><line x1="155.2" y1="92" x2="155.2" y2="98" class="lcx-ch-cap-strong"/><circle cx="143.0" cy="95" r="2.8" class="lcx-ch-dot"/><text x="159.16190476190476" y="97.2" class="lcx-ch-value">19K</text><text x="0" y="126" class="lcx-ch-label">GPT · SWE-bench Verified</text><line x1="153.9" y1="122" x2="342.9" y2="122" class="lcx-ch-range"/><line x1="153.9" y1="119" x2="153.9" y2="125" class="lcx-ch-cap"/><line x1="342.9" y1="119" x2="342.9" y2="125" class="lcx-ch-cap"/><circle cx="153.9" cy="122" r="2.5" class="lcx-ch-dot2"/><text x="346.8952380952381" y="124.2" class="lcx-ch-note">173K</text><line x1="140.5" y1="133" x2="150.3" y2="133" class="lcx-ch-range-strong"/><line x1="140.5" y1="130" x2="140.5" y2="136" class="lcx-ch-cap-strong"/><line x1="150.3" y1="130" x2="150.3" y2="136" class="lcx-ch-cap-strong"/><circle cx="140.5" cy="133" r="2.8" class="lcx-ch-dot"/><text x="154.28571428571428" y="135.2" class="lcx-ch-value">15K</text><text x="0" y="164" class="lcx-ch-label">GPT · Terminal-Bench</text><line x1="152.7" y1="160" x2="294.1" y2="160" class="lcx-ch-range"/><line x1="152.7" y1="157" x2="152.7" y2="163" class="lcx-ch-cap"/><line x1="294.1" y1="157" x2="294.1" y2="163" class="lcx-ch-cap"/><circle cx="152.7" cy="160" r="2.5" class="lcx-ch-dot2"/><text x="298.1333333333333" y="162.2" class="lcx-ch-note">133K</text><line x1="141.8" y1="171" x2="177.1" y2="171" class="lcx-ch-range-strong"/><line x1="141.8" y1="168" x2="141.8" y2="174" class="lcx-ch-cap-strong"/><line x1="177.1" y1="168" x2="177.1" y2="174" class="lcx-ch-cap-strong"/><circle cx="141.8" cy="171" r="2.8" class="lcx-ch-dot"/><text x="181.10476190476192" y="173.2" class="lcx-ch-value">37K</text><line x1="132" y1="220" x2="145" y2="220" class="lcx-ch-range"/><circle cx="138" cy="220" r="2.4" class="lcx-ch-dot2"/><text x="150" y="222.3" class="lcx-ch-note">FHA baseline</text><line x1="236" y1="220" x2="249" y2="220" class="lcx-ch-range-strong"/><circle cx="242" cy="220" r="2.6" class="lcx-ch-dot"/><text x="254" y="222.3" class="lcx-ch-note">SAC</text><text x="132" y="242" class="lcx-ch-note">Bar = median to maximum peak context per task; dot = median.</text></svg>
    <div class="lcx-src">Redrawn from Table 2 · arXiv:2611.05306</div>
  </div>
</div>

The split is instructive. Opus 4.5 is **slightly better** under SAC on SWE-bench Verified (70.2 vs. 70.0) and **4.6 points better** on Terminal-Bench (51.8 vs. 47.2). GPT 5.6 Sol is **2.0 points worse** on SWE-bench Verified and **3.3 points worse** on Terminal-Bench. Both models keep working; neither collapses. The maximum peak context falls from 130K–200K to 15K–37K, and the median to 7K–9K.

Why would Opus get *better* with less context? The paper does not answer this directly, but the mechanism is plausible and consistent with the long-horizon results. A single-action conversation is forced to start with a written state that says: here is the task, here is what I have done, here is what I plan next, here are the artifacts that matter. That is a **better prompt** than a 30K-token transcript with the relevant fact buried on page four. The state is a compression, but it is also a curation. Sometimes curation beats completeness.

The analogy I keep coming back to is a **shift handover note**. A hospital nurse finishing a shift does not replay every minute of the day for the next nurse. They write a structured note: patient status, what changed, what is pending, what to watch. The note is lossy. It is also more useful than a video recording, because it is *selected for the next person’s decisions*. A full-history model is the video recording; single-action compaction is the handover note.

The GPT result is the counterweight. A model post-trained to attend over long histories may lose more when the history disappears, especially if its tool-use policy depends on recent examples in the transcript. The paper’s own framing supports this: SAC is a **post-training target** — a target for the instruction-tuning and reinforcement stage after pretraining — not just a harness trick. You can bolt compaction onto any model; whether the model is good at *writing and reading state* is a separate capability.

<div class="lcx-pull">
  <div class="lcx-pull-mark">“</div>
  <p>SAC is not a prompt hack. It is a bet that the model can maintain a state in natural language — and that bet pays off unevenly across models.</p>
</div>

<div class="lcx-kicker"><svg class="lcx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#lcx-i-brain"></use></svg>THE IDEA</div>

## Semantic State Space Models

The paper’s conceptual contribution is a name for what SAC is doing: a **Semantic State Space Model (SSSM)**. The definition has five parts. A SSSM is post-trained to:

1. **Comprehend** a natural-language description of the conversation’s state.
2. **Reason** about the next action, or about the task at hand.
3. **Take** an action.
4. **Register** the outcome.
5. **Update** the natural-language state with the reasoning conclusions, action decisions, and outcomes, in a form that lets a *separate inference instance* continue the conversation.

The last clause is the important one. The state is not a hidden vector passed between layers. It is text, written by the model, readable by the next instance, and auditable by a human. That is what makes it **semantic** rather than neural.

<div class="lcx-compare">
  <div class="lcx-compare-col">
    <div class="lcx-compare-head"><svg class="lcx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#lcx-i-cpu"></use></svg>STATE-SPACE MODEL</div>
    <p>A black-box neural state updated between token generations. Efficient, continuous, hard to inspect. The state is an internal tensor.</p>
    <div class="lcx-compare-foot">OPAQUE · FAST · LEARNED</div>
  </div>
  <div class="lcx-compare-col">
    <div class="lcx-compare-head"><svg class="lcx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#lcx-i-notebook-pen"></use></svg>SEMANTIC STATE SPACE MODEL</div>
    <p>A natural-language state updated between turns. Slower per handoff, but inspectable, editable, portable across model instances, and debuggable.</p>
    <div class="lcx-compare-foot">EXPLAINABLE · PORTABLE · AUDITABLE</div>
  </div>
</div>

The handover note from the SAC section is the right image: an SSSM is a model trained to write and read that note.

The paper argues that SSSMs could be more **data-efficient** to train than full-history models, because the model does not need to learn which patches of a long transcript to attend to. It only needs to learn how to maintain a state. That is a hypothesis, not a result, but it is a reasonable one: attention over long context is a hard, data-hungry skill; state maintenance is a narrower skill with a clearer training signal.

The paper’s closing rhetorical question is sharp: **if SSSMs can match full-history models, why train full-history models at all?** The honest answer is that we do not know yet. The experiments show that compaction is sufficient on these benchmarks; they do not show that a model trained from scratch to maintain state would be better than a model trained to attend. But the burden of proof has shifted.

<div class="lcx-kicker"><svg class="lcx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#lcx-i-notebook-pen"></use></svg>THE RECIPE</div>

## What a good compaction actually contains

Appendix A is the most practical part of the paper, and it is easy to skip. The authors tried the obvious thing first — treat compaction as summarization — and found it suboptimal. Summaries try to give equal weight to everything in the input, and they overemphasize repeated segments of the agent trace. A summary tells you what happened. A good compaction tells the next instance **what to do next**.

The structure that worked across every workflow in the paper has four ingredients:

<div class="lcx-recipe">
  <div class="lcx-recipe-item">
    <div class="lcx-recipe-num">01</div>
    <div class="lcx-recipe-body"><div class="lcx-recipe-title">The task, verbatim or near-verbatim</div><p>Not a paraphrase. The exact requirements, constraints, and acceptance criteria. Paraphrasing the task is how you lose the one clause that mattered.</p></div>
  </div>
  <div class="lcx-recipe-item">
    <div class="lcx-recipe-num">02</div>
    <div class="lcx-recipe-body"><div class="lcx-recipe-title">Current occupation, intentions, and next steps</div><p>What am I doing right now? What did I intend to do next? What is blocked, and why? This is the “shift handover” paragraph.</p></div>
  </div>
  <div class="lcx-recipe-item">
    <div class="lcx-recipe-num">03</div>
    <div class="lcx-recipe-body"><div class="lcx-recipe-title">Artifacts relevant to future execution</div><p>File paths, diffs, test names, error messages, API signatures — the things the next action will actually touch. Not every artifact; the load-bearing ones.</p></div>
  </div>
  <div class="lcx-recipe-item">
    <div class="lcx-recipe-num">04</div>
    <div class="lcx-recipe-body"><div class="lcx-recipe-title">A plan, a definition of done, and pointers</div><p>A decomposed plan from the task, a list of requirements for completion, and pointers to where the rest of the evidence lives. The pointer is what makes the archive usable.</p></div>
  </div>
</div>

The paper’s phrase is worth quoting: the best compactions “are not narratives of the execution history but carefully cherry-picked briefs for further execution.” That is a different objective function from summarization. A summary optimizes for coverage. A brief optimizes for **decision relevance**.

<div class="lcx-callout">
  <svg class="lcx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#lcx-i-scissors"></use></svg>
  <div><b>The anti-pattern.</b> “The agent explored the repository, ran tests, found a bug in the parser, and made some changes.” This is a summary. It has no file name, no failing test, no next step, and no definition of done. The next instance will redo the exploration. A good compaction would say: “Parser bug in <code>src/parse.ts:184</code>; failing test <code>parse.spec.ts::handles CRLF</code>; fix the offset calculation; run <code>bun test parse</code>; do not touch the lexer.”</div>
</div>

The paper also notes that this structure extends beyond software engineering. It was used for every workflow in the study: terminal tasks, web research, tool-use episodes. The common thread is not code; it is **state that a successor can act on**.

<div class="lcx-kicker"><svg class="lcx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#lcx-i-triangle-alert"></use></svg>WHERE IT BREAKS</div>

## The exceptions are the most useful part

The paper is honest about its failure modes, and the honest parts are where builders should spend their attention.

### Open-weight models are not uniformly robust

The main experiments use two frontier closed-weight models. Appendix D repeats the long-horizon test on five open-weight models. The spread is wide.

<div class="chamfer-card-wrapper lcx-card">
  <div class="chamfer-card-content">
    <div class="card-tag lcx-tag"><svg class="lcx-ico lcx-ico-xs" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#lcx-i-triangle-alert"></use></svg> EXHIBIT // 06 · OPEN-WEIGHT BRITTLENESS</div>
    <div class="lcx-card-title">One model falls off a cliff.</div>
    <p class="lcx-card-sub">SWE-bench Verified score for five open-weight models at four context budgets. Qwen 3 Coder Next loses 49.4 points at the tightest setting; the others lose 3.6–13.4.</p>
    <svg class="lcx-chart" viewBox="0 0 440 300" role="img" aria-label="Grouped bars of five open-weight models on SWE-bench Verified as context budget tightens" xmlns="http://www.w3.org/2000/svg"><text x="38" y="10" class="lcx-ch-axis" text-anchor="start">SWE-BENCH VERIFIED · % RESOLVED</text><line x1="38" y1="216.0" x2="424" y2="216.0" class="lcx-ch-grid"/><text x="33" y="218.2" class="lcx-ch-axis" text-anchor="end">0</text><line x1="38" y1="169.0" x2="424" y2="169.0" class="lcx-ch-grid"/><text x="33" y="171.2" class="lcx-ch-axis" text-anchor="end">20</text><line x1="38" y1="122.0" x2="424" y2="122.0" class="lcx-ch-grid"/><text x="33" y="124.2" class="lcx-ch-axis" text-anchor="end">40</text><line x1="38" y1="75.0" x2="424" y2="75.0" class="lcx-ch-grid"/><text x="33" y="77.2" class="lcx-ch-axis" text-anchor="end">60</text><line x1="38" y1="28.0" x2="424" y2="28.0" class="lcx-ch-grid"/><text x="33" y="30.2" class="lcx-ch-axis" text-anchor="end">80</text><rect x="53.0" y="54.8" width="10" height="161.2" class="lcx-ch-bar"/><rect x="65.4" y="52.9" width="10" height="163.1" class="lcx-ch-bar-mid"/><rect x="77.8" y="55.7" width="10" height="160.3" class="lcx-ch-bar-soft"/><rect x="90.2" y="63.2" width="10" height="152.8" class="lcx-ch-bar-pale"/><text x="76.6" y="230" class="lcx-ch-axis" text-anchor="middle">Qwen 3.6</text><text x="76.6" y="238" class="lcx-ch-axis" text-anchor="middle">27B</text><rect x="130.2" y="91.5" width="10" height="124.5" class="lcx-ch-bar"/><rect x="142.6" y="100.4" width="10" height="115.6" class="lcx-ch-bar-mid"/><rect x="155.0" y="121.1" width="10" height="94.9" class="lcx-ch-bar-soft"/><rect x="167.4" y="207.5" width="10" height="8.5" class="lcx-ch-bar-pale"/><text x="153.8" y="230" class="lcx-ch-axis" text-anchor="middle">Qwen Coder</text><text x="153.8" y="238" class="lcx-ch-axis" text-anchor="middle">Next</text><rect x="207.4" y="62.8" width="10" height="153.2" class="lcx-ch-bar"/><rect x="219.8" y="63.2" width="10" height="152.8" class="lcx-ch-bar-mid"/><rect x="232.2" y="61.4" width="10" height="154.6" class="lcx-ch-bar-soft"/><rect x="244.6" y="79.7" width="10" height="136.3" class="lcx-ch-bar-pale"/><text x="231.0" y="230" class="lcx-ch-axis" text-anchor="middle">Gemma 4</text><text x="231.0" y="238" class="lcx-ch-axis" text-anchor="middle">31B</text><rect x="284.6" y="51.5" width="10" height="164.5" class="lcx-ch-bar"/><rect x="297.0" y="59.0" width="10" height="157.0" class="lcx-ch-bar-mid"/><rect x="309.4" y="64.2" width="10" height="151.8" class="lcx-ch-bar-soft"/><rect x="321.8" y="83.0" width="10" height="133.0" class="lcx-ch-bar-pale"/><text x="308.2" y="230" class="lcx-ch-axis" text-anchor="middle">Step 3.7</text><text x="308.2" y="238" class="lcx-ch-axis" text-anchor="middle">Flash</text><rect x="361.8" y="45.4" width="10" height="170.6" class="lcx-ch-bar"/><rect x="374.2" y="44.5" width="10" height="171.6" class="lcx-ch-bar-mid"/><rect x="386.6" y="44.0" width="10" height="172.0" class="lcx-ch-bar-soft"/><rect x="399.0" y="56.7" width="10" height="159.3" class="lcx-ch-bar-pale"/><text x="385.40000000000003" y="230" class="lcx-ch-axis" text-anchor="middle">MiniMax</text><text x="385.40000000000003" y="238" class="lcx-ch-axis" text-anchor="middle">M2.7</text><line x1="38" y1="216" x2="424" y2="216" class="lcx-ch-axis-line"/><text x="194.8" y="194.85" class="lcx-ch-value">3.6</text><rect x="38" y="256" width="8" height="5" class="lcx-ch-bar"/><text x="50" y="261" class="lcx-ch-note">baseline</text><rect x="134" y="256" width="8" height="5" class="lcx-ch-bar-mid"/><text x="146" y="261" class="lcx-ch-note">48K/40K</text><rect x="230" y="256" width="8" height="5" class="lcx-ch-bar-soft"/><text x="242" y="261" class="lcx-ch-note">32K/24K</text><rect x="326" y="256" width="8" height="5" class="lcx-ch-bar-pale"/><text x="338" y="261" class="lcx-ch-note">16K/12K</text><text x="38" y="288" class="lcx-ch-note">Qwen 3 Coder Next (second group) collapses at 16K/12K; the other four lose 3.6–13.4 points.</text></svg>
    <div class="lcx-src">Redrawn from Table 9 · arXiv:2611.05306</div>
  </div>
</div>

<div class="lcx-table-card">
  <div class="lcx-table-head">
    <div class="lcx-table-tag"><svg class="lcx-ico lcx-ico-xs" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#lcx-i-chart-no-axes-column"></use></svg>OPEN-WEIGHT MODELS · SWE-BENCH VERIFIED</div>
    <div class="lcx-table-title">Same harness, very different robustness.</div>
    <p class="lcx-table-sub">Percentage of 500 instances resolved. The tightest setting is 16K/12K. Qwen 3 Coder Next collapses; Qwen 3.6 and MiniMax hold up.</p>
  </div>
  <div class="lcx-table-scroll">
    <table class="lcx-results">
      <thead><tr><th>Model</th><th class="num">Baseline</th><th class="num">48K/40K</th><th class="num">32K/24K</th><th class="num">16K/12K</th><th class="num">Δ at tightest</th></tr></thead>
      <tbody>
        <tr><td>Qwen 3.6 27B</td><td class="num">68.6</td><td class="num">69.4</td><td class="num">68.2</td><td class="num">65.0</td><td class="num neg">−3.6</td></tr>
        <tr><td>Qwen 3 Coder Next</td><td class="num">53.0</td><td class="num">49.2</td><td class="num">40.4</td><td class="num neg strong">3.6</td><td class="num neg strong">−49.4</td></tr>
        <tr><td>Gemma 4 31B</td><td class="num">65.2</td><td class="num">65.0</td><td class="num">65.8</td><td class="num">58.0</td><td class="num neg">−7.2</td></tr>
        <tr><td>Step 3.7 Flash</td><td class="num">70.0</td><td class="num">66.8</td><td class="num">64.6</td><td class="num">56.6</td><td class="num neg">−13.4</td></tr>
        <tr><td>MiniMax M2.7</td><td class="num">72.6</td><td class="num">73.0</td><td class="num">73.2</td><td class="num">67.8</td><td class="num neg">−4.8</td></tr>
      </tbody>
    </table>
  </div>
  <div class="lcx-table-foot">Source: arXiv:2611.05306, Table 9. Terminal-Bench results in Table 10 show a similar spread; Qwen 3.6 and MiniMax retain their baseline scores at the tightest setting.</div>
</div>

The Qwen 3 Coder Next collapse is the most important single number in the paper for anyone who wants to deploy this. It falls from **53.0 to 3.6** at 16K/12K. The paper’s explanation is mechanical: its trajectories are verbose, so a 12K threshold leaves too little room for useful progress between compactions. The model spends its budget re-establishing state instead of solving the task.

This is the general lesson: **compaction robustness is a model property, not just a harness property.** A model that writes compact, information-dense state can survive aggressive budgets. A model that writes long, repetitive traces cannot. If you are choosing a model for an agent with a tight context budget, test its compaction behavior, not just its benchmark score.

### FRAMES and the cost of losing one sentence

FRAMES is the long-horizon benchmark where compaction consistently loses (1.3–3.7 points for Opus, 1.5–3.3 for GPT). The task requires integrating evidence from 2–15 Wikipedia articles across multiple hops. A compaction that drops a bridge fact can break the chain. The loss is small, but it is a reminder that **not all tokens are equally compressible**. A transcript of 50 shell commands may compress to one line; a chain of five dependent facts may not compress at all without breaking.

### The cost multiples are estimates

The paper’s cost model is explicit, and it is a model. It measures throughput on H100s, fits a context-cost ratio (`r = 0.20`), anchors retail prices at the standard output price ($25/M for Opus 4.5, $20/M for GPT 5.6 Sol), and preserves the providers’ 5:1 output-to-input and 10:1 input-to-cached ratios. The resulting “estimated optimized retail cost” is a **counterfactual**: what serving would cost if the provider passed through the context-length savings. It is not a bill you can pay today.

That caveat cuts both ways. The 233× number for GPT on NIAH is not a promise; it is a model output. But the *direction* — shorter contexts are cheaper, often by integer multiples — is supported by direct throughput measurements, not just the cost model. The paper is careful to separate the two, and readers should too.

### “Short” is still 16K–50K

The most common misreading of this paper will be “context windows don’t matter.” That is not the claim. The claim is that **16K–50K is enough for the tasks tested**, and that 256K+ is often unnecessary. A 16K context is still a long short story — roughly 12,000 words. The paper is not advocating amnesia; it is advocating a working set.

### The benchmarks are a sample, not the space

Six long-horizon and seven long-input benchmarks is a broad sample, but it is still a sample. The paper does not test every agentic workload: no multi-modal tasks, no real-time control, no tasks where the input is a single 10M-token genome, no tasks where the model must hold a precise formal proof in mind. The conclusion is “long contexts are not necessary for the completion of ‘long-context’ tasks” — a carefully scoped claim. It is not “long contexts are never useful.”

<div class="lcx-pull">
  <div class="lcx-pull-mark">“</div>
  <p>The paper’s strongest claim is also its most modest: the standard arguments for long context are insufficient, not that long context is never valuable.</p>
</div>

<div class="lcx-kicker"><svg class="lcx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#lcx-i-compass"></use></svg>WHAT I WOULD DO WITH THIS</div>

## A practical playbook for agent builders

The paper is a research result, not a deployment guide. Here is how I would translate it into engineering decisions.

### 1. Treat context as a cache, not a ledger

Keep the full transcript somewhere durable — object storage, a database, a log file. Put only the working set in the prompt. The archive is the source of truth; the context is a cache with a replacement policy. This one architectural decision makes every other technique possible.

### 2. Measure tokens per task, not just accuracy

The paper’s most useful metric is not accuracy; it is **accuracy at a given context budget**. A system that scores 1 point higher but burns 5× the tokens is not obviously better. Instrument: input tokens, cached tokens, output tokens, peak context, number of compactions, and task success. Plot them together.

### 3. Start with EoCC, not SAC

EoCC is the lower-risk intervention. It preserves the conversational structure and only compacts at a threshold. SAC is the more radical bet; it requires a model that writes good state. If you are deploying to a heterogeneous model fleet, EoCC will be more portable.

### 4. Write the compaction prompt like a handover note

Do not ask for “a summary.” Ask for the five ingredients: task verbatim, current state, next steps, load-bearing artifacts, definition of done. Put the schema in the system prompt. Validate that the output contains the fields. A compaction that omits the failing test name is worse than no compaction.

### 5. Give the agent a search tool over its own history

The coin-toss counterexample is real. If the agent might need an exact detail later, the archive must be searchable. `grep` over a transcript file is crude but effective. A structured event log with timestamps and tool names is better.

### 6. Test the tightest budget on your own workload

The paper’s thresholds are a starting point, not a universal constant. The best setting varied by benchmark: 24K/18K for SWE-bench Verified, 32K/24K for Terminal-Bench, 48K/36K for FRAMES. Sweep the budget on a representative sample and pick the knee, not the minimum.

### 7. Watch for verbose-trajectory models

The Qwen 3 Coder Next collapse is a warning. A model that emits long thinking traces and repeated commands will hit the compaction threshold sooner and spend more of its budget re-establishing state. If you must use such a model, raise the threshold or shorten the traces.

<div class="lcx-checklist">
  <div class="lcx-check"><div class="lcx-check-ico"><svg class="lcx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#lcx-i-check"></use></svg></div><div><b>Before you ship:</b> can the agent recover a fact that was compacted away? If not, the archive is not searchable enough.</div></div>
  <div class="lcx-check"><div class="lcx-check-ico"><svg class="lcx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#lcx-i-check"></use></svg></div><div><b>Before you ship:</b> does the compaction include the task’s acceptance criteria, or only a narrative of what happened?</div></div>
  <div class="lcx-check"><div class="lcx-check-ico"><svg class="lcx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#lcx-i-check"></use></svg></div><div><b>Before you ship:</b> have you measured peak context and token spend, not just the final score?</div></div>
  <div class="lcx-check"><div class="lcx-check-ico"><svg class="lcx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#lcx-i-check"></use></svg></div><div><b>Before you ship:</b> does the model you chose still work at the tightest budget you plan to run? Test it; do not assume.</div></div>
</div>

<div class="lcx-kicker"><svg class="lcx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#lcx-i-message-circle"></use></svg>QUESTIONS</div>

## The questions I expect

**Is the paper saying long context is useless?** No. It is saying long context is not *necessary* for the tasks it tested, and that the standard arguments for it are weaker than they look. There are certainly tasks where a large working set helps; the paper does not claim to have found them all.

**Does compaction lose information?** Yes, by construction. The paper’s answer is to keep the full transcript and make it searchable. Compaction is a cache replacement policy, not a deletion policy.

**Why not just use RAG?** Selective reading *is* a form of retrieval, but it is agentic and tool-based rather than embedding-based. The agent chooses what to search for, reads the result, and iterates. The paper’s point is that this loop is often enough; you do not need a separate vector index for every task.

**Is EoCC just summarization?** No. The paper found that summarization is suboptimal. EoCC is a structured brief: task, state, next steps, artifacts, definition of done. The difference is the objective function — decision relevance, not coverage.

**Why does GPT 5.6 Sol lose more under SAC?** The paper does not give a definitive answer. A plausible explanation is that its policy relies more on recent in-context examples; removing the transcript removes those examples. This is exactly the kind of model-specific behavior that a post-training adjustment could fix.

**Is 16K enough for real codebases?** For the tasks tested, often yes — with a search tool and a good compaction. A 16K window cannot hold a large repository, but it does not need to. The agent reads files selectively. The failure mode is not “the repo is too big”; it is “the agent cannot find the right file.”

**What about multimodal or latent state?** The paper is text-only. The SSSM idea is general, but the experiments are not. A multimodal agent might need a different state representation; that is an open question.

**Is this peer-reviewed?** It is an arXiv preprint (v1, submitted November 3, 2026). Treat the numbers as strong evidence, not settled fact. The harness details and prompts are in the appendices; the released mini-swe-agent harness is public. The result is reproducible in principle, though the paper does not release a single reproduction script.

<div class="lcx-kicker"><svg class="lcx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#lcx-i-signpost"></use></svg>THE BOTTOM LINE</div>

## The habit is the expensive part

The paper’s title is a provocation, but its actual claim is more useful than the title suggests. It is not that context windows are bad. It is that **we have been treating a serving parameter as a capability**, and the bill for that confusion is paid in latency, memory, and dollars.

The three results fit together into a coherent engineering philosophy:

- **Keep the archive.** The full history is cheap to store and expensive to carry.
- **Carry a brief.** A good compaction is a handover note, not a summary.
- **Read selectively.** A long input is a filesystem, not a prompt.
- **Measure the budget.** The best context limit is a hyperparameter, not a default.

The deepest implication is about model design. If a model can maintain a natural-language state across actions, then the context window is no longer the center of the architecture. If the hypothesis holds, the state becomes the center. That is what the SSSM idea points at, and it is why the paper’s closing question — *why train full-history models at all?* — is more than rhetoric.

I do not think long context is going away. There will always be tasks where a large working set is the right tool. But the default should change. The next time you paste a 200K-token document into a prompt, ask the paper’s question: **is this information that needs to be in context, or information that needs to be accessible?** The answer will often be the second, and the invoice will be smaller.

<div class="lcx-endnote">
  <div class="lcx-endnote-head"><svg class="lcx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#lcx-i-book-open"></use></svg>SOURCE & METHOD NOTES</div>
  <p><b>Paper:</b> Peter Belcak, Saurav Muralidharan, Jindong Jiang, Yonggan Fu, Wonmin Byeon, Hanrong Ye, Ryan Angilly, Ali Taghibakhshi, Shih-Yang Liu, Siru Ouyang, Greg Heinrich, Pavlo Molchanov. “You don’t need long context.” arXiv:2611.05306v1, submitted 3 November 2026. <a href="https://arxiv.org/abs/2611.05306">arxiv.org/abs/2611.05306</a> · <a href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a>.</p>
  <p><b>Method:</b> this article is a close reading, not an independent replication. All accuracy numbers are percentage points on the benchmark’s own scale. Cost multiples are the paper’s estimated optimized retail cost, not observed invoices. The paper’s figures are reproduced under CC BY 4.0; the redrawn charts are original to this journal and use the paper’s published numbers.</p>
  <p><b>Corrections:</b> if you find an error in the transcription, the source table is linked in each caption. The paper’s Appendix C–F contain the full per-benchmark tables.</p>
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
