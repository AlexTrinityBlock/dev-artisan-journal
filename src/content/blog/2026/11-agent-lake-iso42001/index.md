---
title: "How LangChain Passed ISO/IEC 42001 AI Governance Certification"
description: "How LangChain used its agent lake and LangSmith to pass ISO/IEC 42001 — and what traces alone still cannot prove."
pubDate: 2026-11-25
category: "AI"
tags: ["Agent Governance", "ISO 42001", "Observability", "LangSmith", "AI Management"]
featured: false
author: "Alex.Hsiao"
readTime: "14 min read"
cardImage: "./cover.webp"
cardImageAlt: "LangChain agent lake flow: production traces enter the lake, compute finds signals, improvements return to production"
---

# How LangChain Passed ISO/IEC 42001 AI Governance Certification

An agent can do everything right and still leave no evidence that it did. That is the gap an AI management system is supposed to close, and the gap an agent lake can narrow — but not close on its own.

In November 2026, LangChain published two essays that are usually read separately. One describes [the agent lake](https://www.langchain.com/blog/the-agent-lake): storage and compute for agent traces and outcomes. The other describes [how LangChain used LangSmith to earn ISO/IEC 42001 certification](https://www.langchain.com/blog/ai-governance-iso-iec-42001-langsmith). Read together, they make a larger claim than either makes alone: the artifacts engineers use to debug agents are the same artifacts an auditor can use to govern them. This essay takes that claim seriously, then asks where it stops.

<p class="mfig-source-note"><span class="mfig-source-label">SOURCE // LANGCHAIN</span> <a href="https://www.langchain.com/blog/ai-governance-iso-iec-42001-langsmith">How We Achieved ISO 42001 with LangSmith</a> <em>and</em> <a href="https://www.langchain.com/blog/the-agent-lake">The Agent Lake</a></p>

<section class="mfig-lead">
  <div class="mfig-lead-head">
    <span class="card-tag">AGENT LAKE // 00</span>
    <p class="mfig-lead-kicker">A trace is not a compliance program. It is the raw material one can be built from.</p>
    <h3 class="mfig-lead-title">The lake holds the evidence. The management system decides what it means.</h3>
    <p class="mfig-lead-sub">LangChain's agent lake and its ISO/IEC 42001 audit point at the same architecture — and at the same limit.</p>
  </div>
  <div class="mfig-lead-grid">
    <div class="mfig-card">
      <div class="mfig-icon"><svg class="mfig-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 3v16a2 2 0 0 0 2 2h16"/><path d="M7 16h8"/><path d="M7 11h12"/><path d="M7 6h3"/></svg></div>
      <div class="mfig-tag">TRACE // RECORD</div>
      <h4>Every step, one record</h4>
      <p>Input, model calls, tool calls, output, errors, approvals — grouped into threads that can be read as one interaction.</p>
      <div class="mfig-meta">TRACE · THREAD · SPAN</div>
    </div>
    <div class="mfig-arrow" aria-hidden="true">→</div>
    <div class="mfig-card">
      <div class="mfig-icon"><svg class="mfig-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg></div>
      <div class="mfig-tag">EVAL // PROOF</div>
      <h4>Scores that can be repeated</h4>
      <p>A pinned dataset and a fixed evaluator turn a release into a testable claim instead of an anecdote.</p>
      <div class="mfig-meta">DATASET · EVALUATOR · RELEASE</div>
    </div>
    <div class="mfig-arrow" aria-hidden="true">→</div>
    <div class="mfig-card">
      <div class="mfig-icon"><svg class="mfig-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12a9 9 0 1 1-9-9"/><path d="M21 3v6h-6"/><path d="M9 12l2 2 4-4"/></svg></div>
      <div class="mfig-tag">AIMS // LOOP</div>
      <h4>Governance with a paper trail</h4>
      <p>Policy, roles, risk assessment, and corrective action around the agents — not only instrumentation inside them.</p>
      <div class="mfig-meta">POLICY · RISK · AUDIT</div>
    </div>
  </div>
  <div class="mfig-lead-flow mfig-scroll">
  <svg class="mfig-svg" viewBox="0 0 780 138" role="img" aria-labelledby="lake-lead-title lake-lead-desc">
    <title id="lake-lead-title">From one agent run to one piece of evidence</title>
    <desc id="lake-lead-desc">A trace records what happened, an outcome records whether it mattered, an evaluation records whether it passed, an issue records what recurs, a fix records what changed, and the combined record becomes evidence for an audit.</desc>
    <defs>
      <marker id="lake-lead-arrow" viewBox="0 0 5 5" refX="4.4" refY="2.5" markerWidth="5" markerHeight="5" markerUnits="userSpaceOnUse" orient="auto"><path d="M0 0 L5 2.5 L0 5 z" fill="var(--mono-ink)"/></marker>
    </defs>
    <text x="24" y="16" class="f" font-size="9" letter-spacing="1.1">ONE RUN // SIX ARTIFACTS</text>
    <text x="756" y="16" class="f" font-size="9" text-anchor="end" letter-spacing="1">THE EVIDENCE CHAIN</text>
    <line x1="24" y1="25" x2="756" y2="25" class="rule"/>
    <rect x="24" y="40" width="114" height="44" class="term"/>
    <text x="81" y="62" class="t mono" font-size="11.5" font-weight="800" text-anchor="middle">TRACE</text>
    <text x="81" y="100" class="m" font-size="9" text-anchor="middle">what happened</text>
    <line x1="140" y1="62" x2="146" y2="62" class="arrow" marker-end="url(#lake-lead-arrow)"/>
    <rect x="148" y="40" width="114" height="44" class="box"/>
    <text x="205" y="62" class="t mono" font-size="11.5" font-weight="800" text-anchor="middle">OUTCOME</text>
    <text x="205" y="100" class="m" font-size="9" text-anchor="middle">whether it mattered</text>
    <line x1="264" y1="62" x2="270" y2="62" class="arrow" marker-end="url(#lake-lead-arrow)"/>
    <rect x="272" y="40" width="114" height="44" class="term"/>
    <text x="329" y="62" class="t mono" font-size="11.5" font-weight="800" text-anchor="middle">EVAL</text>
    <text x="329" y="100" class="m" font-size="9" text-anchor="middle">whether it passed</text>
    <line x1="388" y1="62" x2="394" y2="62" class="arrow" marker-end="url(#lake-lead-arrow)"/>
    <rect x="396" y="40" width="114" height="44" class="box"/>
    <text x="453" y="62" class="t mono" font-size="11.5" font-weight="800" text-anchor="middle">ISSUE</text>
    <text x="453" y="100" class="m" font-size="9" text-anchor="middle">what recurs</text>
    <line x1="512" y1="62" x2="518" y2="62" class="arrow" marker-end="url(#lake-lead-arrow)"/>
    <rect x="520" y="40" width="114" height="44" class="term"/>
    <text x="577" y="62" class="t mono" font-size="11.5" font-weight="800" text-anchor="middle">FIX</text>
    <text x="577" y="100" class="m" font-size="9" text-anchor="middle">what changed</text>
    <line x1="636" y1="62" x2="642" y2="62" class="arrow" marker-end="url(#lake-lead-arrow)"/>
    <rect x="644" y="40" width="114" height="44" class="codebox"/>
    <text x="701" y="62" class="t mono" font-size="11.5" font-weight="800" text-anchor="middle">EVIDENCE</text>
    <text x="701" y="100" class="m" font-size="9" text-anchor="middle">what proves it</text>
    <text x="390" y="126" class="f" font-size="9" text-anchor="middle" letter-spacing="0.5">EACH STEP WRITES A RECORD // THE RECORD IS ONLY USEFUL IF THE SCHEMA HOLDS</text>
  </svg>
  </div>
  <p class="mfig-lead-note"><b>Evidence is not the same as compliance.</b> The lake supplies evidence for the four audit questions; the management system decides whether the answers are acceptable.</p>
</section>

<p class="mfig-bridge">That distinction is the argument of this essay: what the lake stores, what an auditor can ask of it, and what still has to live outside it.</p>

<figure class="fig">
  <img src="/images/agent-lake/agent-lake-flow.webp" alt="LangChain official agent lake flow diagram: production agents send traces to the lake, compute finds high-signal traces and automates improvements, and improvements return to production" width="1600" height="743" loading="lazy" />
  <figcaption><b>Official diagram</b> — LangChain's agent lake flow: production traces land in SmithDB, compute finds high-signal traces and turns recurring failures into improvements, and the loop returns to production. Source: <a href="https://www.langchain.com/blog/the-agent-lake">LangChain, "The Agent Lake"</a> (2026)</figcaption>
</figure>

## The gap between a policy and a run

Most AI governance starts as a document. It names the systems, assigns owners, forbids some actions, requires review for others, and promises monitoring. The document is necessary. It is also, from an evidentiary point of view, a statement of intent.

An agent is not a service with a fixed contract. The same input can produce a different plan, a different tool sequence, and a different side effect. A run can succeed at the wrong task, or fail while leaving a customer record changed. Traditional monitoring catches latency, error rates, and uptime. It does not catch the sentence that matters: the agent emailed the wrong tier of customer, correctly.

The audit question is narrower and harder than "is the agent good?" It is: what was the agent allowed to do, how do you know it works, what did it actually do, and what changed after it failed? Those four questions need four kinds of evidence. Only one of them is a dashboard.

Observability supplies the execution record. Governance supplies the authority, the risk decision, and the correction. An agent lake is interesting because it sits between them: it is a place where the execution record and the judgment about the execution can be stored together, joined by the same identifiers.

The commercial framing is LangChain's. The architectural argument is broader, and it survives the marketing: any organization running agents with real permissions needs a way to reconstruct what happened and connect it to whether it should have happened.

## What the agent lake actually holds

LangChain defines an agent lake as "a platform that combines storage optimized for agent traces with intelligent compute to query, analyze, and learn from them, powering continuous agent improvement."

Strip the marketing and the definition has three parts. Storage is optimized for traces, not for rows. Compute is designed to find meaning in unstructured reasoning, not only to aggregate numbers. And the purpose is a loop: production data becomes evaluation data, evaluation data becomes a change, and the change returns to production.

A trace records every step of a run: the user's input, each model call, each tool call, and the final output. Multi-turn interactions are grouped into threads, so a conversation can be read as one unit rather than a pile of disconnected requests. This matters because the interesting failure is often a sequence: a plausible retrieval, a confident tool call, a silent error, a fluent apology.

The lake also holds outcomes. An outcome is the impact of the work, and it can map to a trace or thread one-to-one or many-to-many. A thumbs down belongs to one response; a merged pull request may be opened by one thread and contributed to by several; a copied code snippet may be the only signal that the answer was useful. Outcomes arrive from four kinds of sources: users, direct observation of the system the agent acts on, LLM-as-a-judge proxies, and human annotation.

The pairing is the design. A trace without an outcome is an anecdote. An outcome without a trace is a number nobody can act on. Put them in the same store with a stable join, and the question changes from "what is our success rate?" to "which trajectories produce success, for which users, under which permissions?"

Each outcome source has a different bias. Users report what annoyed them. Systems report what completed. Judges report what looks right. Annotators report what they were paid to look for. An evidence layer that records only one source will overfit to it. The lake is more trustworthy when the outcome table is allowed to disagree with itself.

LangChain's scale claims are large: SmithDB is its purpose-built trace database; LangSmith ingests traces from billions of agent runs per month; one customer, Clay, sends hundreds of millions of events per day. I have not independently verified those figures, and they are LangChain's published claims, not audit measurements. Scale matters for a practical reason: at billions of runs, no one reads traces. People query them. The compute layer is not a convenience; it is the only way a human finds the one run that matters.

This is also why a traditional data lake is not enough. A general-purpose lake can store the JSON. What it cannot do cheaply is answer trace-shaped questions: reconstruct a parent-child span tree, window a thread, join feedback to a specific step, filter semantically for "threads where the user got frustrated" or "traces that contain PII," and apply different retention rules to prompts, outputs, and tool payloads. You can build all of that on Snowflake or Databricks. Teams do. But you are building a trace database inside a general lake, and the schema is the hard part.

LangChain's compute layer is easiest to read as four jobs. Online evaluators and AI Search find the interesting traces; decision models make that filtering cheap enough to run continuously. Insights clusters traffic into categories, so new use cases and shifting failure modes become visible. Engine turns recurring failures into issues, investigates root cause, and proposes a pull request. SmithTune fine-tunes a model on the best trajectories and compares it with the base model. The vendor reports that Engine has analyzed more than 60 million production traces, and that a Kimi K3 model tuned on Engine trajectories scored 96 on an internal IssueBench subset, against 90 for base Kimi K3 and 87 for GPT-5.6 Sol. Those are vendor benchmark numbers from an internal benchmark, not a guarantee for anyone else's task.

The important claim is not that every company needs all five tools. It is that storage and compute share one schema. The lake is not a bigger log store. It is a structure for turning operational exhaust into evidence.

<figure class="mfig-fig mfig-fig-arch">
  <figcaption>
    <span class="card-tag">THE ARCHITECTURE // 01</span>
    <h3 class="mfig-fig-title">The lake is a pipeline with a governance rail</h3>
    <p class="mfig-fig-sub">Agents, tools, users, and outcomes enter through ingestion; SmithDB holds the execution record and the judgment together; compute turns them into issues, fixes, and tests. The rail is not stored in the lake, but every stage depends on it.</p>
  </figcaption>
  <div class="mfig-scroll">
  <svg class="mfig-svg" viewBox="0 0 780 500" role="img" aria-labelledby="lake-f1-title lake-f1-desc">
    <title id="lake-f1-title">Architecture of an agent lake with a governance rail</title>
    <desc id="lake-f1-desc">Agents, tools, users, and outcomes feed an ingestion layer with batching, streaming, redaction, sampling, schema checks, and retention. SmithDB holds traces, threads, spans, feedback, and outcomes. Intelligent compute runs online evaluators, AI Search, Insights, Engine, and SmithTune over the store. Results become a tagged deployment, then production runs return as new evidence. A vertical governance rail on the right lists policy, roles, risk register, provenance, human oversight, and corrective action as elements outside the lake but inside the audit.</desc>
    <defs>
      <marker id="lake-f1-arrow" viewBox="0 0 5 5" refX="4.4" refY="2.5" markerWidth="5" markerHeight="5" markerUnits="userSpaceOnUse" orient="auto"><path d="M0 0 L5 2.5 L0 5 z" fill="var(--mono-ink)"/></marker>
    </defs>
    <text x="24" y="18" class="f" font-size="9" letter-spacing="1.1">THE AGENT LAKE // TRACES + OUTCOMES + COMPUTE</text>
    <text x="600" y="18" class="f" font-size="9" text-anchor="end" letter-spacing="1">EVIDENCE, NOT COMPLIANCE</text>
    <line x1="24" y1="27" x2="600" y2="27" class="rule"/>
    <line x1="616" y1="27" x2="756" y2="27" class="rule"/>
    <text x="24" y="48" class="f" font-size="8.5" letter-spacing="0.8">SOURCES</text>
    <rect x="24" y="56" width="138" height="58" class="box"/>
    <text x="34" y="74" class="f" font-size="8.5" letter-spacing="0.5">AGENTS</text>
    <text x="34" y="93" class="t" font-size="12.5" font-weight="800">RUNS</text>
    <text x="34" y="107" class="m" font-size="9.5">plans · threads</text>
    <rect x="170" y="56" width="138" height="58" class="term"/>
    <text x="180" y="74" class="f" font-size="8.5" letter-spacing="0.5">TOOLS</text>
    <text x="180" y="93" class="t" font-size="12.5" font-weight="800">CALLS</text>
    <text x="180" y="107" class="m" font-size="9.5">side effects</text>
    <rect x="316" y="56" width="138" height="58" class="box"/>
    <text x="326" y="74" class="f" font-size="8.5" letter-spacing="0.5">USERS</text>
    <text x="326" y="93" class="t" font-size="12.5" font-weight="800">FEEDBACK</text>
    <text x="326" y="107" class="m" font-size="9.5">approvals</text>
    <rect x="462" y="56" width="138" height="58" class="term"/>
    <text x="472" y="74" class="f" font-size="8.5" letter-spacing="0.5">OUTCOMES</text>
    <text x="472" y="93" class="t" font-size="12.5" font-weight="800">IMPACT</text>
    <text x="472" y="107" class="m" font-size="9.5">PRs · scores · labels</text>
    <line x1="93" y1="114" x2="93" y2="121" class="rule-soft"/>
    <line x1="239" y1="114" x2="239" y2="121" class="rule-soft"/>
    <line x1="385" y1="114" x2="385" y2="121" class="rule-soft"/>
    <line x1="531" y1="114" x2="531" y2="121" class="rule-soft"/>
    <line x1="93" y1="121" x2="531" y2="121" class="rule-soft"/>
    <line x1="312" y1="121" x2="312" y2="130" class="arrow" marker-end="url(#lake-f1-arrow)"/>
    <rect x="24" y="130" width="576" height="64" class="codebox"/>
    <text x="36" y="148" class="f" font-size="9" letter-spacing="0.6">INGEST // ONE PATH IN</text>
    <text x="36" y="171" class="t" font-size="11" font-weight="600">BATCH · STREAM · REDACT · SAMPLE · SCHEMA CHECK · RETENTION</text>
    <line x1="312" y1="194" x2="312" y2="202" class="rule-soft"/>
    <line x1="139" y1="202" x2="383" y2="202" class="rule-soft"/>
    <line x1="139" y1="202" x2="139" y2="210" class="arrow" marker-end="url(#lake-f1-arrow)"/>
    <line x1="383" y1="202" x2="383" y2="210" class="arrow" marker-end="url(#lake-f1-arrow)"/>
    <rect x="24" y="210" width="230" height="182" class="term"/>
    <text x="36" y="230" class="f" font-size="9" letter-spacing="0.6">TRACE + OUTCOME STORE</text>
    <text x="36" y="256" class="t mono" font-size="16" font-weight="800">SmithDB</text>
    <line x1="36" y1="266" x2="242" y2="266" class="rule-soft"/>
    <text x="36" y="286" class="m" font-size="11">trace</text>
    <text x="36" y="306" class="m" font-size="11">thread</text>
    <text x="36" y="326" class="m" font-size="11">span</text>
    <text x="142" y="286" class="m" font-size="11">feedback</text>
    <text x="142" y="306" class="m" font-size="11">outcome</text>
    <line x1="36" y1="340" x2="242" y2="340" class="rule-soft"/>
    <text x="36" y="356" class="m" font-size="9.5">append-only · high cardinality</text>
    <text x="36" y="370" class="m" font-size="9.5">trace-shaped schema</text>
    <text x="36" y="383" class="f" font-size="8.5">billions of runs/mo · LANGCHAIN CLAIM</text>
    <rect x="266" y="210" width="226" height="182" class="box"/>
    <text x="278" y="230" class="f" font-size="9" letter-spacing="0.6">INTELLIGENT COMPUTE</text>
    <text x="278" y="252" class="t" font-size="11" font-weight="800">ONLINE EVALS</text>
    <text x="278" y="264" class="m" font-size="9.5">hallucination · toxicity</text>
    <text x="278" y="282" class="t" font-size="11" font-weight="800">AI SEARCH</text>
    <text x="278" y="294" class="m" font-size="9.5">natural-language queries</text>
    <text x="278" y="312" class="t" font-size="11" font-weight="800">INSIGHTS</text>
    <text x="278" y="324" class="m" font-size="9.5">traffic clusters</text>
    <text x="278" y="342" class="t" font-size="11" font-weight="800">ENGINE</text>
    <text x="278" y="354" class="m" font-size="9.5">issue → cause → PR</text>
    <text x="278" y="372" class="t" font-size="11" font-weight="800">SMITHTUNE</text>
    <text x="278" y="384" class="m" font-size="9.5">best trajectories</text>
    <line x1="256" y1="300" x2="264" y2="300" class="arrow" marker-end="url(#lake-f1-arrow)"/>
    <line x1="494" y1="300" x2="502" y2="300" class="arrow" marker-end="url(#lake-f1-arrow)"/>
    <rect x="504" y="210" width="96" height="102" class="codebox"/>
    <text x="524" y="230" class="f" font-size="9" letter-spacing="0.6">DEPLOY</text>
    <text x="524" y="254" class="t" font-size="15" font-weight="800">v+1</text>
    <text x="524" y="270" class="m" font-size="9.5">tagged</text>
    <text x="524" y="282" class="m" font-size="9.5">reviewed</text>
    <text x="524" y="294" class="m" font-size="9.5">rollback</text>
    <text x="524" y="306" class="m" font-size="8.5">approval gate</text>
    <line x1="552" y1="312" x2="552" y2="322" class="arrow" marker-end="url(#lake-f1-arrow)"/>
    <rect x="504" y="322" width="96" height="70" class="box"/>
    <text x="524" y="340" class="f" font-size="9" letter-spacing="0.6">PRODUCTION</text>
    <text x="524" y="362" class="t" font-size="11" font-weight="800">NEW RUNS</text>
    <text x="524" y="376" class="m" font-size="9.5">new traces</text>
    <text x="524" y="388" class="m" font-size="9.5">new outcomes</text>
    <path d="M552 392 V412 H139 V394" class="arrow" fill="none" marker-end="url(#lake-f1-arrow)"/>
    <text x="340" y="428" class="f" font-size="9.5" text-anchor="middle" letter-spacing="0.6">NEW RUNS RETURN AS NEW EVIDENCE</text>
    <rect x="616" y="40" width="140" height="372" class="dash"/>
    <text x="628" y="60" class="f" font-size="8.5" letter-spacing="0.8">GOVERNANCE</text>
    <text x="628" y="78" class="t mono" font-size="11" font-weight="800">EVIDENCE RAIL</text>
    <line x1="628" y1="86" x2="744" y2="86" class="rule-soft"/>
    <text x="628" y="102" class="f" font-size="8.5">OUTSIDE THE LAKE</text>
    <text x="628" y="114" class="f" font-size="8.5">INSIDE THE AUDIT</text>
    <text x="628" y="140" class="m" font-size="10.5">POLICY</text>
    <text x="628" y="176" class="m" font-size="10.5">ROLES</text>
    <text x="628" y="212" class="m" font-size="10.5">RISK REGISTER</text>
    <text x="628" y="248" class="m" font-size="10.5">DATA PROVENANCE</text>
    <text x="628" y="284" class="m" font-size="10.5">HUMAN OVERSIGHT</text>
    <text x="628" y="320" class="m" font-size="10.5">CORRECTIVE ACTION</text>
    <line x1="628" y1="338" x2="744" y2="338" class="rule-soft"/>
    <text x="628" y="358" class="f" font-size="8.5">applies to every stage</text>
    <text x="628" y="370" class="f" font-size="8.5">not stored in the lake</text>
    <line x1="24" y1="440" x2="756" y2="440" class="rule"/>
    <text x="24" y="458" class="f" font-size="8.5" letter-spacing="0.8">WHAT THE LAKE PROVES</text>
    <text x="24" y="474" class="t" font-size="11" font-weight="800">execution + outcome</text>
    <text x="24" y="488" class="m" font-size="9.5">joined by stable IDs</text>
    <text x="280" y="458" class="f" font-size="8.5" letter-spacing="0.8">WHAT THE RAIL ADDS</text>
    <text x="280" y="474" class="t" font-size="11" font-weight="800">authority + risk + correction</text>
    <text x="280" y="488" class="m" font-size="9.5">decisions the lake cannot make</text>
    <text x="536" y="458" class="f" font-size="8.5" letter-spacing="0.8">WHAT THE AUDIT ASKS</text>
    <text x="536" y="474" class="t" font-size="11" font-weight="800">allowed · works · did · improves</text>
    <text x="536" y="488" class="m" font-size="9.5">four questions, four evidence classes</text>
  </svg>
  </div>
  <p class="mfig-fig-src">TRACE + OUTCOME · SMITHDB · COMPUTE · DEPLOY · GOVERNANCE RAIL</p>
</figure>

## Four questions an auditor will ask

LangChain says its ISO/IEC 42001 audit came down to four questions for every AI system in scope: What is the agent allowed to do? How do you prove the agent works? How do you prove what the agent did? How do you improve the agent? I use them here because they are a good vendor-neutral checklist, whether or not you ever seek certification.

| Question | Evidence artifact | What it can prove | What it still misses |
| :--- | :--- | :--- | :--- |
| Allowed | Workspace permissions, credential model, per-tool Auto/Ask, prompt tags | The boundary was defined and enforced in the demonstrated run | Whether the boundary matches the risk assessment, and who accepted the residual risk |
| Works | Versioned datasets, fixed evaluators, release experiments, data provenance | The release was tested against a reproducible definition of correct | Whether the test distribution matches production, and whether the evaluator is right |
| Did | Traces with tool calls, errors, approvals, evaluation feedback | An execution record exists and a run can be reconstructed | Whether the record is complete, tamper-evident, or true |
| Improves | Issues, root-cause analysis, pull requests, regression tests | Failures were detected and routed into change | Whether the change addressed the cause and stayed fixed |

**Allowed.** In LangSmith Fleet, LangChain demonstrates three layers of control: workspace permissions decide which integrations exist and who can add capabilities; agent settings decide whose credentials the agent uses and who can invoke it, with the shared-versus-invoking-user OAuth choice fixed at creation; tool settings decide whether a tool runs automatically or pauses for human review. The audit demo used a Slack tool set to Ask. The run paused, the reviewer rejected the call with a reason, and the agent reported the rejection without retrying.

The important detail is not that approval existed. It is that the trace recorded the pause, the rejection, the reason, and the absence of a retry. A configuration screenshot proves intent. A trace proves enforcement. Prompt and context versioning adds the same distinction for instructions: commits and movable tags show what changed, who changed it, and which release was live.

**Works.** Reproducibility in agent evaluation is not reproducibility of output. It is reproducibility of the test. LangChain kept the dataset and the evaluator fixed so that a change in score could be attributed to the agent rather than to the exam. Its supporting controls are worth copying: evaluation data comes only from systems LangChain runs itself, never from customer workspaces; each eval test records where its examples came from and includes the scoring code; changes go through code review; tests that a blank answer can pass are discarded; and each grader is checked with an answer known to be correct.

Each control answers a different failure. Provenance answers "where did the data come from?" Code review answers "who changed the test?" Blank-answer removal answers "does the test measure anything?" Grader calibration answers "is the judge correct?" Together they turn an eval score from a number into a defensible measurement.

**Did.** The trace is the strongest evidence class and the most fragile. It shows inputs and outputs, tool calls and errors, and the pause and resume of an approval in one record. The same evaluations used before release can run on production traces, attaching feedback to the run so a reviewer can open a flagged answer and see the actions that led to it. A correction saved with the trace can feed the next evaluation.

This is what an auditor means by a record of activity. It is not a log line that says the request succeeded. It is a reconstructable path through the system, with the decision points visible.

**Improves.** Engine groups recurring failures into issues, investigates the root cause in the agent's source code, opens a pull request, and can test the fix against an eval set before review. The auditor followed one change through review and into the codebase, then saw the traces become examples in a regression dataset. That last step is the one most teams skip. A merged pull request is a change record. It becomes corrective action only when it is linked to a finding and followed by an effectiveness check.

The "still misses" column is the thesis of this essay. Each artifact answers its question well enough to be useful and poorly enough to be dangerous if treated as the whole answer.

## Where ISO/IEC 42001 enters

ISO/IEC 42001 is the international standard for AI management systems. It is certifiable, built on the harmonized management-system structure that ISO uses across standards, and organized around the Plan-Do-Check-Act cycle. Its Annex A groups controls by policy, internal organization, resources, impact assessment, AI system life cycle, data, information for interested parties, use of AI systems, and third-party relationships.

Certification is not a product review. It starts with an internal audit of the management system. An accredited external auditor then checks that the system operates as documented. Surveillance audits repeat the check annually. LangChain says its scope covers the management system behind generally available LangSmith features that run inference on a model LangChain manages, and that new AI features will be added to the scope each year.

The scope is the first thing to read in any certificate. A narrow scope can be entirely honest and still say little about the parts of the product outside it. "We govern what we run" is a defensible boundary. It is not the same as "we govern everything a customer builds with us."

The PDCA cycle is where evidence and management meet. Plan covers scope, policy, roles, risk and impact assessment, and objectives. Do covers lifecycle controls, data handling, and operations. Check covers monitoring, measurement, internal audit, and management review. Act covers nonconformity, corrective action, and continual improvement. Evidence flows into every stage, but it does not replace any stage. A trace can satisfy a recording control. It cannot satisfy the policy control, the roles control, or the impact-assessment control.

The Annex A mapping in LangChain's appendix is a useful example of tracing controls to artifacts: Fleet configuration to A.6.2.2, tool approval to A.6.2.3 and A.9.3, dataset versioning and provenance to A.7.2 and A.7.5, experiments to A.6.2.4, tracing to A.6.2.8, online evaluation and alerts to A.6.2.6 and clause 9.1, and Engine to clause 10.1 and 10.2. The mapping is LangChain's, not the auditor's. An auditor decides whether an artifact actually satisfies a control. A table in a blog post is a claim about fitness, not proof of it. Used carefully, though, the mapping shows the shape of a real evidence program: each control should point to an artifact, an owner, and a test.

<figure class="mfig-fig mfig-fig-arch">
  <figcaption>
    <span class="card-tag">THE EVIDENCE MAP // 02</span>
    <h3 class="mfig-fig-title">Four questions, one management loop, and the artifacts in between</h3>
    <p class="mfig-fig-sub">Each audit question maps to an evidence class and to a stage of the Plan-Do-Check-Act cycle. The artifacts come from the lake. Policy, roles, impact assessment, risk acceptance, and management review do not.</p>
  </figcaption>
  <div class="mfig-scroll">
  <svg class="mfig-svg" viewBox="0 0 780 524" role="img" aria-labelledby="lake-f2-title lake-f2-desc">
    <title id="lake-f2-title">ISO/IEC 42001 evidence map</title>
    <desc id="lake-f2-desc">Four audit questions — allowed, works, did, improves — map to permissions and prompt tags, versioned evaluations and provenance, traces and approvals, and issues and regression tests. Each maps to a Plan, Do, Check, or Act stage and to Annex A clauses. Policy, roles, impact assessment, risk acceptance, internal audit, and management review sit outside the lake but inside the management system.</desc>
    <defs>
      <marker id="lake-f2-arrow" viewBox="0 0 5 5" refX="4.4" refY="2.5" markerWidth="5" markerHeight="5" markerUnits="userSpaceOnUse" orient="auto"><path d="M0 0 L5 2.5 L0 5 z" fill="var(--mono-ink)"/></marker>
    </defs>
    <text x="24" y="18" class="f" font-size="9" letter-spacing="1.1">ISO/IEC 42001 // EVIDENCE MAP</text>
    <text x="756" y="18" class="f" font-size="9" text-anchor="end" letter-spacing="1">FOUR QUESTIONS // ONE LOOP</text>
    <line x1="24" y1="27" x2="756" y2="27" class="rule"/>
    <rect x="24" y="40" width="210" height="70" class="term"/>
    <text x="36" y="56" class="f" font-size="8.5" letter-spacing="0.6">Q1 // ALLOWED</text>
    <text x="36" y="78" class="t" font-size="12.5" font-weight="800">What may it do?</text>
    <text x="36" y="94" class="m" font-size="9.5">authority and oversight</text>
    <rect x="242" y="40" width="308" height="70" class="box"/>
    <text x="256" y="56" class="f" font-size="8.5" letter-spacing="0.6">EVIDENCE</text>
    <text x="256" y="74" class="m" font-size="10.5">workspace permissions</text>
    <text x="256" y="89" class="m" font-size="10.5">credential model · Auto / Ask</text>
    <text x="256" y="104" class="m" font-size="10.5">prompt tags · approver identity</text>
    <rect x="558" y="40" width="104" height="70" class="codebox"/>
    <text x="570" y="56" class="f" font-size="8.5" letter-spacing="0.6">ANNEX A</text>
    <text x="570" y="78" class="t mono" font-size="10.5">A.6.2.2</text>
    <text x="570" y="94" class="t mono" font-size="10.5">A.6.2.3</text>
    <rect x="670" y="40" width="86" height="70" class="box"/>
    <text x="682" y="56" class="f" font-size="8.5" letter-spacing="0.6">STAGE</text>
    <text x="682" y="86" class="t mono" font-size="11.5" font-weight="800">PLAN</text>
    <rect x="24" y="118" width="210" height="70" class="box"/>
    <text x="36" y="134" class="f" font-size="8.5" letter-spacing="0.6">Q2 // WORKS</text>
    <text x="36" y="156" class="t" font-size="12.5" font-weight="800">How do you prove it works?</text>
    <text x="36" y="172" class="m" font-size="9.5">verification and validation</text>
    <rect x="242" y="118" width="308" height="70" class="term"/>
    <text x="256" y="134" class="f" font-size="8.5" letter-spacing="0.6">EVIDENCE</text>
    <text x="256" y="152" class="m" font-size="10.5">versioned datasets · fixed evaluators</text>
    <text x="256" y="167" class="m" font-size="10.5">release experiments</text>
    <text x="256" y="182" class="m" font-size="10.5">data provenance · source lineage</text>
    <rect x="558" y="118" width="104" height="70" class="codebox"/>
    <text x="570" y="134" class="f" font-size="8.5" letter-spacing="0.6">ANNEX A</text>
    <text x="570" y="156" class="t mono" font-size="10.5">A.6.2.4</text>
    <text x="570" y="172" class="t mono" font-size="10.5">A.7.2 · A.7.5</text>
    <rect x="670" y="118" width="86" height="70" class="term"/>
    <text x="682" y="134" class="f" font-size="8.5" letter-spacing="0.6">STAGE</text>
    <text x="682" y="164" class="t mono" font-size="11.5" font-weight="800">DO · CHECK</text>
    <rect x="24" y="196" width="210" height="70" class="term"/>
    <text x="36" y="212" class="f" font-size="8.5" letter-spacing="0.6">Q3 // DID</text>
    <text x="36" y="234" class="t" font-size="12.5" font-weight="800">What did it do?</text>
    <text x="36" y="250" class="m" font-size="9.5">recording and monitoring</text>
    <rect x="242" y="196" width="308" height="70" class="box"/>
    <text x="256" y="212" class="f" font-size="8.5" letter-spacing="0.6">EVIDENCE</text>
    <text x="256" y="230" class="m" font-size="10.5">traces · tool calls · errors</text>
    <text x="256" y="245" class="m" font-size="10.5">approvals · pause / resume</text>
    <text x="256" y="260" class="m" font-size="10.5">evaluation feedback · corrections</text>
    <rect x="558" y="196" width="104" height="70" class="codebox"/>
    <text x="570" y="212" class="f" font-size="8.5" letter-spacing="0.6">ANNEX A</text>
    <text x="570" y="234" class="t mono" font-size="10.5">A.6.2.8</text>
    <text x="570" y="250" class="t mono" font-size="10.5">CLAUSE 9.1</text>
    <rect x="670" y="196" width="86" height="70" class="box"/>
    <text x="682" y="212" class="f" font-size="8.5" letter-spacing="0.6">STAGE</text>
    <text x="682" y="242" class="t mono" font-size="11.5" font-weight="800">CHECK</text>
    <rect x="24" y="274" width="210" height="70" class="box"/>
    <text x="36" y="290" class="f" font-size="8.5" letter-spacing="0.6">Q4 // IMPROVES</text>
    <text x="36" y="312" class="t" font-size="12.5" font-weight="800">How do you improve it?</text>
    <text x="36" y="328" class="m" font-size="9.5">corrective action</text>
    <rect x="242" y="274" width="308" height="70" class="term"/>
    <text x="256" y="290" class="f" font-size="8.5" letter-spacing="0.6">EVIDENCE</text>
    <text x="256" y="308" class="m" font-size="10.5">issues · root-cause analysis</text>
    <text x="256" y="323" class="m" font-size="10.5">pull requests · regression tests</text>
    <text x="256" y="338" class="m" font-size="10.5">effectiveness check</text>
    <rect x="558" y="274" width="104" height="70" class="codebox"/>
    <text x="570" y="290" class="f" font-size="8.5" letter-spacing="0.6">ANNEX A</text>
    <text x="570" y="312" class="t mono" font-size="10.5">10.1</text>
    <text x="570" y="328" class="t mono" font-size="10.5">10.2</text>
    <rect x="670" y="274" width="86" height="70" class="term"/>
    <text x="682" y="290" class="f" font-size="8.5" letter-spacing="0.6">STAGE</text>
    <text x="682" y="320" class="t mono" font-size="11.5" font-weight="800">ACT</text>
    <text x="24" y="364" class="f" font-size="9" letter-spacing="0.6">THE MANAGEMENT SYSTEM // PDCA</text>
    <rect x="24" y="372" width="177" height="72" class="box"/>
    <text x="36" y="392" class="f" font-size="9" letter-spacing="0.6">PLAN</text>
    <text x="36" y="412" class="m" font-size="9.5">scope · policy · roles</text>
    <text x="36" y="428" class="m" font-size="9.5">risk + impact · objectives</text>
    <rect x="209" y="372" width="177" height="72" class="term"/>
    <text x="221" y="392" class="f" font-size="9" letter-spacing="0.6">DO</text>
    <text x="221" y="412" class="m" font-size="9.5">lifecycle · data handling</text>
    <text x="221" y="428" class="m" font-size="9.5">operations · controls</text>
    <rect x="394" y="372" width="177" height="72" class="box"/>
    <text x="406" y="392" class="f" font-size="9" letter-spacing="0.6">CHECK</text>
    <text x="406" y="412" class="m" font-size="9.5">monitoring · measurement</text>
    <text x="406" y="428" class="m" font-size="9.5">internal audit · review</text>
    <rect x="579" y="372" width="177" height="72" class="term"/>
    <text x="591" y="392" class="f" font-size="9" letter-spacing="0.6">ACT</text>
    <text x="591" y="412" class="m" font-size="9.5">nonconformity</text>
    <text x="591" y="428" class="m" font-size="9.5">corrective action · effectiveness</text>
    <line x1="24" y1="460" x2="756" y2="460" class="rule"/>
    <text x="24" y="478" class="f" font-size="9.5">OUTSIDE THE LAKE, INSIDE THE AIMS: policy · roles · accountability · impact assessment</text>
    <text x="24" y="492" class="f" font-size="9.5">risk acceptance · statement of applicability · internal audit · management review</text>
    <text x="24" y="510" class="t" font-size="10.5" font-weight="800">A TRACE ANSWERS WHAT HAPPENED. THE AIMS ANSWERS WHO WAS ALLOWED TO DECIDE.</text>
  </svg>
  </div>
  <p class="mfig-fig-src">ALLOWED · WORKS · DID · IMPROVES · PLAN · DO · CHECK · ACT</p>
</figure>

The most interesting part of the case study is the Security Agent. LangChain built it on Deep Agents, runs it on LangSmith, uses it to scale a two-person governance program, and keeps its own runs traced with the same approval settings as everything else. Policies, assessments, and audit responses run through the agent; its knowledge of the environment, inventory, code, and past decisions compounds with each run.

The recursion is the point. If the governance function is itself an agent, its runs, permissions, and approvals have to be in the same evidence layer. Otherwise the most powerful agent in the system is the one with the least evidence. LangChain's answer is human review and corrections that feed back into the agent. That is a reasonable control, but it needs its own record: who reviewed, what they changed, and how they knew the change was right.

The case study is not a template. A two-person team with a narrow scope can automate much of its documentation. A large enterprise with legacy systems, sector regulators, and works councils has a different problem, and a different risk appetite. What transfers is the architecture of evidence, not the org chart.

## The improvement loop is a control

The improvement loop is usually described as a feature chain: online evals, AI Search, Insights, Engine, SmithTune. It is more useful to read it as a control chain, where each link converts a signal into a different kind of record.

Online evaluators define failure. Hallucination, toxicity, and user satisfaction are not neutral measurements; they are policy choices expressed as scores. The moment you define an evaluator, you define what counts as a defect. That is a governance decision disguised as a metric, and it belongs in the risk assessment, not only in the observability dashboard.

AI Search and Insights define the population. AI Search lets someone ask a question in natural language, with a decision model applying a semantic filter over the results. Insights groups recent traces into categories and keeps sorting new conversations into them. Clustering tells you which failures are common. It does not tell you which are severe. Severity is a risk judgment, and it has to come from outside the cluster.

Engine defines the fix. It scans traces on a schedule, groups recurring failures into issues, investigates root cause, and opens a pull request; since version 2 it can test the fix against an eval set before a human sees it. The control is not the automation. The control is the review gate: a person confirms the issue is real, the cause is plausible, and the fix is acceptable. Automation without that gate produces a faster queue of unreviewed changes.

The pull request and the regression test define the memory. A fix that is not captured as a test is a fix the organization can lose. LangChain's loop turns the traces behind a failure into examples in an evaluation dataset, so the failure becomes a regression test for later releases. That is the difference between repairing an agent and improving it.

SmithTune defines the model. Fine-tuning on the best trajectories is attractive because the lake already holds the corpus. LangChain's reported result — a tuned Kimi K3 scoring 96 against 90 for the base model and 87 for GPT-5.6 Sol on a subset of its internal IssueBench — is a vendor benchmark on a vendor task. It is evidence that the method can work, not evidence that it will work on your traffic. A tuned model is also a new release. It needs the same evaluation, approval, and rollback path as any other change, not a victory lap.

Human approval and prompt versioning are controls, not features. Auto versus Ask matters only if the approval is recorded, the approver is authorized, the rejection is respected, and the record is retained. Versioning matters only if releases are tagged, diffs are reviewed, and rollback is possible. A button that says "require approval" is configuration. The trace of a rejected action is evidence that the control operated.

This is where clauses 10.1 and 10.2 become concrete. Continual improvement needs a finding, a cause, an action, and an effectiveness review. Nonconformity and corrective action need the same chain, with the addition of a decision about what to do with the output that was already wrong. A pull request without a finding is maintenance. A finding without an effectiveness check is a hope.

## What to copy without LangSmith

You do not need SmithDB to build an evidence layer. You need a schema, a retention policy, and the discipline to treat evidence as a product with users. The checklist below is deliberately vendor-neutral. For each item, the test is not "do we have a tool?" but "can we produce the artifact on request?"

1. **A trace schema.** Spans with parent-child links, a thread identifier, model and tool versions, start and end times, status, approval events, and explicit redaction markers. The test: can you reconstruct a run from one query without joining five application logs?
2. **Outcome linkage.** Stable identifiers from trace or thread to outcome, declared cardinality, source, timestamp, and negative outcomes as well as positive ones. The test: can you compute success rate per release and per use case, and explain the denominator?
3. **Immutable retention.** Append-only storage, a hash or signature per record, a trusted clock, and a deletion policy that distinguishes expiry from legal hold. The test: can an administrator silently edit a trace? The answer should be no.
4. **Evaluation versioning.** A content hash for the dataset, a version for the evaluator and the judge model, the run configuration, and a CI job that pins all three. The test: when a score changes, can you tell whether the agent, the data, or the judge changed?
5. **Approval records.** Who approved or rejected, what exactly they saw, when, under which policy, and why. Bind the record to the tool call it authorized. The test: can you show a rejected action and prove it did not execute?
6. **Data provenance.** Origin system, consent or license, transformations, and whether customer data was excluded. Keep lineage down to the individual eval example. The test: can you trace every test case to a permitted source?
7. **Access control.** Least privilege on the evidence store, because traces contain prompts, outputs, and sometimes personal data. Log read access, not only writes. The test: who can read PII-bearing traces, and is that access audited?
8. **A risk register.** An inventory of agents, use cases, autonomy levels, data classes, affected parties, owners, and residual-risk acceptance. The test: does every production agent have a named owner and a current assessment?
9. **Corrective action.** A finding, a cause, an action, an owner, a due date, an effectiveness check, and a closure record. The test: can you show a failure that recurred after a fix, and what happened next?

A minimal record can be small. The point is that the fields exist before the audit asks for them:

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

If you build only two things, build the trace schema and the outcome link. Everything else is easier once those exist, because every later artifact — eval example, issue, pull request, regression test — can hang from the same identifiers.

The organizational items are not optional add-ons. A lake cannot assign accountability, decide residual risk, or chair a management review. Those are management-system functions, and they are exactly what ISO/IEC 42001 certifies.

## Where the evidence breaks

Evidence has failure modes, and an essay that only lists benefits is a sales document. The serious ones are structural.

**Traces are not truth.** A trace is the agent's account of its own behavior, mediated by the SDK and the instrumentation. Spans can be missing, sampling can hide the bad run, payloads can be truncated, redaction can remove the detail that mattered, and a tool can report success while doing something else. A trace proves that the system recorded an event. It does not prove the event happened as recorded.

**PII and retention.** The evidence you need and the data you should not keep are often the same bytes. Long retention increases audit value and privacy risk at the same time. Legal hold, erasure requests, cross-border transfer, and role-based access all apply to the lake. Redaction protects people, but it also destroys evidence. The policy has to choose, per field, which risk it is accepting.

**Evaluator drift.** An LLM judge is a measurement instrument that changes when its model, prompt, or calibration changes. A score from March and the same score in November may not mean the same thing. Version the judge, re-calibrate it against known answers, and keep a human-labeled sample as a reference. Otherwise the improvement loop is optimizing against a moving definition of good.

**Over-automation.** Engine can open pull requests faster than a team can review them. Approval fatigue turns a control into a click. A review queue that never rejects anything is indistinguishable from no review at all. The fix is not less automation; it is sampling, escalation thresholds, and periodic tests of the control itself, including deliberate rejections.

**Audit-trail integrity.** Who can delete a trace? Who can edit a retention rule? Who can turn off an evaluator before a release? If the answer is "an administrator, silently," the evidence layer has an insider-risk problem. Separate the administrative plane from the evidence plane, make deletion a recorded event, and export signed copies for the audit.

**Coverage.** The lake only holds what is instrumented. Agents built outside the platform, human steps between agent calls, third-party agents reached through MCP, and the spreadsheet where someone records the real decision are all outside the schema. The audit scope is a boundary, and the boundary is a management decision, not a technical default.

**Cost.** Full-fidelity traces are expensive to store and expensive to query. Sampling reduces cost and weakens evidence. Tiering helps, but only if the retention policy is designed before the volume arrives. The cheapest evidence is the evidence you decided to keep.

**Vendor lock-in.** A certification evidence set may need to outlive the vendor contract. Ask for export in an open format, schema documentation, OpenTelemetry-compatible traces, and clear deletion terms. A certificate is not a data-portability guarantee.

There is also a fifth question the four do not ask: should this agent exist? The four questions test whether an agent is governed. They do not test whether it is justified, who benefits, who bears the risk, or what happens when it is wrong. That is the impact assessment, and it is where governance actually starts. Efficiency is not authorization.

## The audit is a query

If the schema is right, an audit is mostly a query. Show the permissions and the approval record for the agent that touched the system. Show the dataset, the evaluator version, and the release experiment. Show the trace for the run in the complaint. Show the issue, the pull request, and the regression test that followed. The auditor is not asking for a story. The auditor is asking for the rows.

But the query only works if someone designed the schema before the audit. That is the practical lesson of the agent lake, and it is larger than LangChain. Instrument the decision points, not only the outputs. Store the outcome next to the trace, and the change next to the finding. Keep the management system authoritative: the lake is a sensor, not a constitution. Policy, risk acceptance, roles, and corrective action live outside it, and no amount of tracing can substitute for them.

LangChain's certification is a useful existence proof. It shows that audit evidence can come from the same traces engineers already use to debug agents, and that a small governance team can automate part of its own documentation without losing the human review that makes the automation safe. It does not show that a lake makes a company compliant, or that a vendor's scope covers yours.

The lake can tell you what happened. Only a management system can tell you whether it was allowed.
