---
title: "The Super-agent Is a System, Not a Session"
description: "A close reading of DeepSeek Harness's Super-agent design and the dsh-superagent-prototype: a resident Router, isolated Workers, event-driven Triggers, a full-duplex ReAct loop, and the separation of compute, state, and environment."
pubDate: 2026-11-26
category: "AI"
tags: ["AI Agents", "DeepSeek", "Harness", "Architecture", "RepoNotes"]
featured: false
author: "Alex.Hsiao"
readTime: "14 min read"
---

> **article.md** — [agent-readable file](/blog/2026/11-superagent-system/article.md)
>
> **English description.** `dsh-superagent` is a proactive coding agent for one GitHub repository, packaged as a bundle for DeepSeek Harness. It listens to GitHub and, optionally, Feishu. When an authorized person asks for work, it opens a work item, works on it in its own agent session and directory, and answers in the original conversation, for example with a pull request. ([source](https://github.com/deepseek-ai/dsh-superagent-prototype))
>
> **Original article.** [Super-agent 设计探索：迈向更自主的 Agent 系统](https://zhuanlan.zhihu.com/p/2099987320443237060)
>
> **Rendering.** Plain Markdown in the site's normal body font; no display face, image-only text, or decorative substitution.

Most agent demos still look the same: one chat window, one model, one task. You type a request, the model calls a few tools, and a result appears. The interesting engineering is inside the loop — how the model plans, how tools are described, how errors are retried.

DeepSeek Harness's article, *Super-agent 设计探索：迈向更自主的 Agent 系统*, starts somewhere else. It argues that the next bottleneck is not the model's ability to finish one task. It is **a person's ability to supervise several tasks at once**. The authors observe that someone can usually keep up with only three to five active sessions. Beyond that, the human becomes the scheduler: switching windows, restating context, remembering which thread asked for what.

If that is the bottleneck, a better chat window does not solve it. A system does. The design in the article — and the open-source prototype that accompanies it — moves session management, event routing, authorization, execution, and recovery out of the human's head and into an agent runtime. The model is still the engine. The product is the organization around it.

This is a close reading of both the design article and the `dsh-superagent-prototype` repository. The short version: **the most important code in an autonomous agent may be the code that decides when not to act.**

## Four properties, five modules

The article defines a Super-agent with four properties:

- **Continuous.** The user can talk to it in an IM thread, a GitHub pull request, or an email chain, and it behaves as one agent rather than a different session per channel.
- **Efficient.** It can accept a new instruction while a long command is still running, and it can advance several independent tasks in parallel.
- **Proactive.** It watches the environment and starts work when a rule allows it, without waiting to be addressed each time.
- **Persistent.** It stays online, reaches the user's real working environment, and recovers from failures over long runs.

Those properties are pleasant adjectives. The architecture is what makes them concrete. The article maps them onto five modules:

| Module | Property it serves | What it actually does |
| --- | --- | --- |
| Two-layer architecture | Continuous + efficient | A resident Router keeps global context; isolated Workers execute tasks |
| Event-driven intake | Proactive | Triggers are filtered, correlated into Threads, and routed to Workers |
| Human-facing interaction | Continuous + efficient | Full-duplex ReAct; channel-specific output |
| Compute / state / environment separation | Persistent | Stateless cloud loop, durable session state, local execution daemon |
| Watchdog | Persistent | An external control loop that checks progress, not just process liveness |

The intellectual move is not that any one of these is new. Every item has a counterpart in operating systems, distributed systems, or queue design. The move is to treat an agent as a **system with schedulable work, durable state, admission control, and failure recovery** rather than as a model with a conversation attached.

That framing explains why the article spends so little time on prompts. Prompts matter, but they are not the architecture. The architecture decides which events reach which context, who is allowed to start work, what happens when a worker dies, and how a human gets pulled back in only when a decision is needed.

## The router does not work; the workers do not speak

The first module is the cleanest idea in the piece.

A single agent session gives the best continuity: everything is in one context. But it gives the worst throughput: one ReAct loop runs one step at a time, and every new message waits behind the current tool call. A fresh session per event gives the best throughput and the worst continuity. The user ends up juggling contexts again.

The Super-agent splits the difference into two layers.

**The Router** is a resident session that owns the global conversation. It receives human messages, keeps the cross-task picture, decides what deserves a Worker, and speaks back to the user. It is a sequence point and a memory, not an executor. The article says it can even be configured without a Bash tool; its job is routing and conversation, not running commands. A lighter model is often enough.

**The Workers** are isolated sessions, each with its own context and directory. A Worker gets the full execution toolset, usually the strongest model, and one task. It does not talk to the user directly. It reports to the Router, and the Router decides what the user sees.

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

The consequence is subtle but important: **a session stops being the user's problem.** The user sees one agent; the system may be running five Workers underneath. The article puts it sharply: a session should be an implementation detail of the system, not a cognitive burden for the user.

There is a second consequence on the Router side. Because the Router is a single resident session, it should be a throughput bottleneck. In practice, it batches. While the Router is thinking, new Triggers queue up. On the next model call, the whole batch goes in together. The input is long, the output is short, and prefill parallelizes the batch. Up to the context limit, more backlog can mean *less* inference time per decision.

The prototype implements this separation directly. `src/core/engine.ts` is the only writer of Triggers, Threads, Decisions, Tickets, and Assignments. `src/executor/dsh.ts` gives each Ticket one Executor session and one directory. The Router is the main session; the Workers are `worker-<ticket id>` sessions. The boundary is enforced by code, not by a prompt that asks the model to behave.

## An event is not a prompt

The second module changes the input.

A normal agent waits for a prompt. A Super-agent listens to an event stream: a GitHub comment, a pull request review, a CI result, an IM mention, an email. The article calls these events **Triggers**. A sequence of Triggers on the same pull request, IM topic, or mail thread forms a **Thread**.

Raw event streams are mostly noise. If every event went to a model, the system would be slow and expensive. The design uses a two-level filter, borrowed from the fast-path / slow-path split in operating systems:

1. **Program layer (fast path).** Deterministic checks on source, group, sender, bot allowlists, and mention rules drop most events before any model call.
2. **Semantic layer (slow path).** The surviving candidates go to the Router, which reads the team's policy and decides whether the event deserves work.

The same split applies to routing. A new Thread takes the slow path: the Router evaluates it and creates a Worker. Once a Worker subscribes to the Thread, follow-ups take the fast path: the Source delivers them straight to the Worker, without the Router forwarding each message. The Router still observes everything for global state, but it only decides what has not already been claimed.

Subscriptions are many-to-many. A Worker can follow several Threads; a Thread can be followed by several Workers. When two Workers touch the same pull request, both receive the new review comment without point-to-point messaging. They can notice each other's work and resolve the conflict in the shared environment. The Router remains the only voice to the user.

Then comes the context problem. A Worker's window is finite, and the event stream is not. The article borrows two operations from cache design:

- **Inline** the information that is likely to be needed now: the current object's ID, a short summary, the adjacent messages, the parent review comment.
- **Spill** everything that is too long or too rare: keep a reference and a truncation point in the window, and let the model read the rest through a tool when it needs it.

Apply that consistently, and you get **Chain of Recall**: every recalled object inlines the IDs of the next-hop objects, so the model can walk from a message to its Thread, from the Thread to a Worker session, from that session to a related review, one hop at a time. The context is not a dump. It is a graph the model can traverse.

The last event-driven idea is **speculative execution**. The agent can start work before it knows the result will be wanted. In an internal DeepSeek Harness group, a "silently reproduce and fix" rule lets the agent reproduce a reported bug and prepare a patch in the background; it speaks only if it confirms the problem and finds a plausible fix. Otherwise it stays quiet. The cost is background compute; the benefit is that the human's next message can be an approval instead of a request.

This is a different economics from a chatbot. You are not paying per answer. You are paying for **attention avoidance**.

## Full duplex, or the chat that does not block

The third module is about the human interface, and it starts from a small observation: the classic ReAct loop is half-duplex.

The model calls `run()`, the tool executes, and the loop blocks until the result comes back. During that time, the session cannot accept a new instruction. If the command takes ten minutes, the user waits or opens another session. That is exactly the behavior the Super-agent is trying to eliminate.

The article replaces the blocking call with an asynchronous pair:

- `start()` returns a "Started" acknowledgement immediately. The tool keeps running in the background.
- When the background work finishes, its result is delivered back into the session as a new event.
- `stop()` lets the model cancel a command that is taking too long.

The loop is now full-duplex: the model can receive a new human message at the next step while a long command runs. The conversation does not have to wait for the shell.

The article notes that this asynchronous mechanism already exists in DeepSeek Harness but is not enabled by default. The prototype follows the same pattern in its Worker sessions: foreground shell commands move to background jobs after five seconds, so the Worker can receive a follow-up instead of blocking on a long build.

There is also a channel-specific output rule, and it is more important than it sounds. A Worker's reasoning and tool calls stay inside the Worker. The Router speaks to the user, and the shape of the reply depends on the channel:

- **IM:** low-noise, short, decision-oriented. The team's hard rule is under 100 words per reply.
- **GitHub, email, documents:** structured, high-density, asynchronous. A pull request gets a full problem statement, change description, and verification notes.

This is not politeness. It is bandwidth matching. A group chat cannot absorb a reasoning trace; a pull request should not be reduced to a 100-word summary. The same agent has to speak differently in different places, and the system — not the user — owns that translation.

## Compute, state, and environment are three different things

The fourth module is the one that makes "persistent" literal.

A local agent ties three things to one machine: the **compute** that runs the loop, the **state** that must survive, and the **environment** the tools operate on. Close the laptop, and all three stop. Move to another machine, and the environment is gone.

The article separates them in two steps.

**Compute and state.** The agent loop runs in stateless elastic containers. Sessions, Tickets, messages, and decisions live in a database. Containers can restart, scale, or be replaced; the session continues from durable state. This is ordinary web-service architecture applied to an agent.

**Compute and environment.** The harder step is the environment. Real work lives in a checkout with uncommitted changes, local credentials, private network services, and a specific toolchain. Copying that into a cloud sandbox is expensive and lossy; asking the user to move everything to the cloud is worse. So the environment stays where it is. A lightweight daemon on the user's machine executes commands and returns results. The cloud loop reads the environment through that daemon; the daemon holds no session state.

The article calls this **BYOM — Bring Your Own Machine**. It is the same shape as Anthropic's "decoupling the brain from the hands," but aimed at personal machines that are sometimes offline rather than at managed cloud sandboxes. A machine can disappear and come back; the cloud agent can pick up the task when it returns.

This is where the security questions begin, and the article knows it. If the cloud loop is compromised or prompt-injected, every connected machine is in scope. Credentials must not enter the model's context; the agent should be able to use a credential without reading it. The prototype is candid about its own posture: Worker sessions run with `danger-full-access` as the operator's OS user, and the wrappers and directories are defaults, not a security boundary. An absolute path bypasses the blocked-command list. A dedicated OS account is the recommended isolation. The design is honest about being a research prototype, not a hardened product.

## The watchdog is another agent

The fifth module is the one most agent frameworks omit: a **Watchdog**.

Long-running distributed systems cannot rely only on the main process to notice its own failure. They use an external control loop. Agent systems need the same, plus something extra: many failures are not crashes. The model can loop, drift from the goal, or keep working on the wrong thing while every process stays healthy.

So the Super-agent runs a separate Watchdog session on a timer. It checks infrastructure errors, failed state recovery, and — more interestingly — whether each Worker is making real progress and whether its direction still matches the goal. It can intervene, retry, or change the system's behavior at runtime. Because the Watchdog is itself a full agent session with tools, an operator can ask it why something failed and have it edit prompts or rules online.

This is a small but consequential design choice. The system that monitors the agent is not a dashboard; it is another agent with a different context and a different job. Monitoring becomes a first-class workload.

## Authorization is the product

If you only read the architecture section, you might conclude that the hard part is routing. The repository suggests the harder part is **permission**.

An agent that can act for a whole team can also waste a whole team's attention, or do the wrong work under the team's name. The prototype's `docs/000-philosophy.md` states the principle: take as little human attention as possible, and give as much value as possible. The second half is easy to say; the first half is an authorization problem.

The prototype separates two kinds of work:

- **Explicit.** Someone on the allowed list addresses the agent and asks for something.
- **Inferred.** The agent sees an event that might deserve work — a bug report, a review comment, a CI failure — without being addressed.

Inferred work is gated by a **Policy**. The policy has rules, a per-source allowlist, and an accept mode:

| Mode | Behavior |
| --- | --- |
| `off` | Inferred candidates are not considered |
| `observe` | Candidates are assessed; a positive result is recorded as "would accept", but nothing runs |
| `auto` | A positive assessment can create a Ticket and start work |

The default is `observe`. That is the right default for an autonomous agent: it can demonstrate judgment before it is allowed to act on it. The panel records the decisions, so a team can review what the agent *would* have done before switching to `auto`.

When a request is accepted, it becomes a **Ticket** with a **Mandate**: the basis on which it was admitted, the matched rules, the requester, and the policy version. The Mandate is revalidated before a paused or ended Ticket resumes. If the requester is no longer allowed, the rule no longer applies, or proactive work is no longer accepted, the Ticket stays ended. A person saying "stop" is an ordinary Trigger; a stop in the panel is a command. The distinction matters because one is a conversation and the other is an override.

This is the part I would steal even if I never built a Super-agent. The agent loop is becoming a commodity. The **admission contract** — who may ask, under which rule, with what evidence, and until when — is what makes an autonomous system tolerable.

## What the prototype actually ships

The repository is `deepseek-ai/dsh-superagent-prototype`, MIT-licensed, written in TypeScript and packaged as a DeepSeek Harness bundle. It is not a mock. It has a real Engine, a SQLite store, a durable effect queue, GitHub and Feishu sources, a web panel, and a setup flow.

The README is unusually candid:

> Research prototype for reference only, not an official DeepSeek product. ... It may still contain bugs, and its coding style and engineering practices may be inconsistent. ... We have adapted it for publication, so it is not identical to our internal version or the implementation described in *Exploring Super-agent Design*.

That gap is part of the story. The article describes a design space; the repo implements a subset and leaves some ideas as future work. Reading both is more useful than reading either alone.

The release shape is also part of the story. This is a one-commit snapshot with no releases, issues disabled, and about 24,600 stars at the time of writing. A run of `pnpm check` on Node 22.23.5 produced 1,196 passing tests and one failing Feishu health test. That is not a reason to dismiss the code. It is a reason to read it as a research artifact, not a dependency.

A rough map:

| Layer | Where to look | What it does |
| --- | --- | --- |
| Engine | `src/core/engine.ts` | The only writer of Triggers, Threads, Decisions, Tickets, Assignments |
| Store | `src/app/store.ts` | One SQLite database, repositories, read queries, settings versions |
| Effects | `src/app/effects.ts` | Durable side-effect queue: assessment, launch, delivery, relay, notice, reply |
| Executor | `src/executor/dsh.ts` | One session and directory per Ticket; worker slots; restart recovery |
| Sources | `src/sources/github*`, `src/sources/feishu*` | Event intake, thread reads, replies |
| Policy | `src/policy.ts` | Authorization, assessment, revalidation, policy effects |
| Panel | `src/client` | What needs a person, decisions, settings, health |
| Setup | `SETUP.md` | An agent-readable installation script for a coding agent |

The setup file is a nice detail. It is written for a coding agent, not a human: ask one question at a time, collect the answers, show one plan, then execute. It is the same philosophy as the Super-agent itself — minimize the operator's attention — applied to installation.

## The 12.4-minute result, and what it measures

The article includes an initial experiment, and it is worth reading carefully because the numbers are easy to misread.

The setup: about 300 messages per run, of which about 20 are work requests; the rest are chat, follow-ups, stops, and CI messages. Coding work is replaced by a tool that only consumes time. The experiment measures **scheduling and collaboration**, not coding quality. Each configuration runs five times, with message intervals and work durations scaled to one quarter.

Four configurations:

- Super-agent.
- Super-agent without the direct subscription path.
- A single session with a subagent tool, neutral prompt.
- A single session with a subagent tool, delegation-biased prompt.

The results are more interesting than the headline:

| Configuration | p50 | p95 | Cache-read tokens | What happened |
| --- | --- | --- | --- | --- |
| Super-agent | 12.4 min | 15.7 min | 23.23M | Router + Workers + direct path |
| Super-agent, direct path removed | 12.6 min | 15.5 min | 31.77M | Same speed; Router decisions +30% |
| Single session, neutral prompt | 20.4 min | 29.5 min | 6.05M | The model never called the subagent in five runs |
| Single session, delegation prompt | 13.8 min | 29.0 min | 10.82M | Delegated in four of five runs; one long tail |

Read the table carefully. Against the **delegation-first** baseline, the median gap is only about 10% — 12.4 versus 13.8 minutes. The large difference is the tail: 15.7 versus 29.0 minutes. The architectural win is not "twice as fast on average." It is **less variance**: fewer tasks get stuck behind an interruption or a bad delegation decision. Against the **neutral** baseline, both median and tail are much worse, because the model never delegated at all.

The token trade is explicit. Super-agent uses 23.23M cache-read tokens, about 3.8× the neutral baseline's 6.05M and about 2.1× the delegation baseline's 10.82M. It buys shorter and more stable completion with more context reads. That is a trade, not a free lunch.

Removing the direct path from the Super-agent did not change completion time much (12.6/15.5 versus 12.4/15.7), but it changed the Router's workload: decisions increased by about 30%, and cache-read tokens rose to 31.77M, about 37%. The direct path is not a quality feature. It is a load-shedding feature.

The Router batching test is separate: trigger arrival rose from about 1 to about 40 per minute. Average batch size rose from 1.0 to 2.8; request latency rose from 2.5 to 3.9 seconds, much slower than the batch growth; per-decision inference time fell from 6.4 to 1.6 seconds. Under this load, a single Router had headroom.

The caveats are real: synthetic workload, a time-only coding tool, five runs, scaled intervals. The experiment is a scheduling sanity check, not a product benchmark. But the direction is consistent with the architecture: the win comes from keeping the global context continuous while letting execution run in parallel.

## What is borrowed, and what is new

Almost every primitive in the Super-agent has a prior art:

- Fast path / slow path: operating systems and network stacks.
- Inline / spill and locality: caches and compilers.
- Speculative execution: CPUs and databases.
- Compute / storage separation: distributed systems.
- Durable outbox and idempotent effects: message queues and transactional systems.
- Watchdog: hardware and distributed control planes.

The article says this explicitly: it did not propose a new theory; it applied classic systems ideas to agents. That is not a criticism. The novelty is in the composition and in the willingness to make the **system**, not the model, the unit of design.

Most agent frameworks optimize the loop: better tool schemas, better planning prompts, better retry logic. The Super-agent optimizes the organization around the loop: who gets to start work, which context sees which event, where execution lives, and what happens when a worker stalls. That is a different layer of the stack, and it is under-served.

The closest analogy is not a chatbot with tools. It is an **operating system for attention**. The Router is the scheduler and the shell; the Workers are processes; the Threads are file descriptors for conversations; the Mandate is a capability; the Watchdog is the kernel's health monitor. The analogy is imperfect, but it explains why the design feels familiar to systems engineers and unfamiliar to prompt engineers.

## The open questions that matter

The article is honest about what it has not solved. Four questions stand out.

**1. Scaling the Router.** A single resident Router is simple and preserves global context. At what point does it need to shard? Sharding trades continuity for throughput, and the article does not claim to have the answer. The experiment shows headroom at 40 triggers per minute, not at organizational scale.

**2. Memory across months.** Chain of Recall handles recent tasks and session history. Long-running memory — what the agent should remember about a project, a person, or a decision six months later — is still an open problem. The prototype's SQLite store is a substrate, not a memory policy.

**3. Agent-to-agent collaboration.** The design assumes one Super-agent instance owns a context boundary. When an organization runs multiple instances with different permissions, A2A collaboration across those boundaries is unresolved. The article names the problem instead of hiding it.

**4. Security and privacy.** The BYOM model connects a cloud loop to personal machines with credentials and private code. Prompt injection, compromised credentials, and a compromised cloud loop are all live risks. The prototype's wrappers are convenience, not a sandbox. Any team running this in production would need a much stronger isolation story.

There is also a softer question: if the agent takes over more of the work, does the human's attention really free up, or does it move to reviewing more agent output? The article's answer is that review is the new bottleneck, and the system should ask for it only when a decision is needed. That is plausible, but it is a design goal, not a measured guarantee.

## How to try it without giving it the keys to the building

The prototype is not a one-click install, and that is probably appropriate. The README's recommended path is to ask a coding agent to read `SETUP.md` and set up the system with you. The setup flow asks one question at a time, shows a plan, and then installs.

A sensible first run:

1. Use a dedicated GitHub account for the agent, not your own. Everything it writes appears under that name.
2. Start with one repository and a short allowlist — ideally just you.
3. Keep the accept mode at `observe`. Read the Decisions the agent would have made.
4. Give it a narrow execution root and a prepare command that creates a checkout. Do not point it at a directory full of credentials.
5. Switch to `auto` only after the observed decisions look boring.
6. Watch the panel and the Watchdog health entries. An agent that is quiet is not necessarily an agent that is working.

The prerequisites are real: Node.js 22.19+ or 24+, pnpm, git, tmux, Python, GitHub CLI, and a working DeepSeek Harness installation with a model provider. The setup is designed to be driven by a coding agent, but the operator still owns the accounts and the permissions.

## The shift

The most useful way to read this project is not as "DeepSeek built a coding agent." It is as a statement about where the difficulty has moved.

Single-task agents are getting good. The model can call tools, recover from errors, and finish a well-scoped task with less supervision than a year ago. As that improves, the constraint moves outward: from the loop to the queue, from the prompt to the policy, from the session to the system.

The Super-agent's contribution is a concrete answer to what that outward layer looks like: a resident Router, isolated Workers, event-driven intake, a full-duplex loop, durable state, a local execution plane, and a Watchdog. None of it is magic. All of it is engineering. And the part that makes it safe to leave running is not the model's intelligence. It is the admission contract that decides when the agent may act, and when it should stay quiet.

That is the sentence I would keep from the whole design: **an agent that can act for a team must first be an agent that knows when not to.**

## References

- [Super-agent 设计探索：迈向更自主的 Agent 系统](https://zhuanlan.zhihu.com/p/2099987320443237060) — DeepSeek Harness team, Zhihu, 31 October 2026 (edited 1 November); English title: “Exploring Super-agent Design: Towards a More Autonomous Agent System.”
- [deepseek-ai/dsh-superagent-prototype](https://github.com/deepseek-ai/dsh-superagent-prototype) — MIT-licensed research prototype, source and documentation.
- [DeepSeek Harness](https://www.deepseek.com/en/harness) — the host runtime.
- [dsh-superagent philosophy](https://github.com/deepseek-ai/dsh-superagent-prototype/blob/main/docs/000-philosophy.md) — the attention-minimization principle.
- [dsh-superagent architecture](https://github.com/deepseek-ai/dsh-superagent-prototype/blob/main/docs/007-architecture.md) — Engine, Store, Effects, Sources, Executor.
- [dsh-superagent execution](https://github.com/deepseek-ai/dsh-superagent-prototype/blob/main/docs/003-execution.md) — Tickets, stages, worker slots, recovery.
- [dsh-superagent authorization](https://github.com/deepseek-ai/dsh-superagent-prototype/blob/main/docs/002-authorization.md) — accept modes, rules, Mandates, revalidation.
- [SETUP.md](https://github.com/deepseek-ai/dsh-superagent-prototype/blob/main/SETUP.md) — the agent-readable installation flow.
