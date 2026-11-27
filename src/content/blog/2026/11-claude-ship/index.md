---
title: "Claude Ship and the Last Mile of Agentic Coding"
description: "Claude Ship splits the pull request into three powers: Code Review finds, PR Steward fixes, and Claude Approvals decides. The interesting part is the policy boundary, not the patch."
pubDate: 2026-11-25
category: "AI"
tags: ["Claude Ship", "Code Review", "AI Agents", "CI", "Governance"]
featured: false
author: "Alex.Hsiao"
readTime: "12 min read"
cardImage: "./cover.webp"
cardImageAlt: "Claude Ship workflow diagram: Code Review finds issues, PR Steward fixes them, Claude Approvals decides the merge"
---

# Claude Ship and the Last Mile of Agentic Coding

## The review bottleneck

An agent can open a pull request faster than a person can read it. That asymmetry is the new shape of the problem.

When writing code was the slow part, review could be a checkpoint at the end of the work. When generation is cheap, review becomes the throughput limit, and the pull request turns into a queue. The queue is not only latency. Every item costs a context switch: reload the diff, reconstruct the intent, check the tests, remember what the service does at the edges. An agent-authored PR is worse in one specific way. The reviewer did not write it, so the first read is the only read.

Anthropic's framing is explicit: on the Claude Code team, Claude writes most of the code, and everything after the PR had to move at the same speed. That is the product thesis behind Claude Ship, announced on 23 November 2026 and available in beta on Claude Team and Enterprise plans for repositories on GitHub. The interesting question is not whether it can review a diff. It is what the team did with the decision that follows.

Most descriptions of the PR loop collapse three different acts into one person: finding problems, fixing them, and deciding to merge. They fail differently. A reviewer can be thorough and slow. A fixer can be fast and optimistic. An approver can be careful and still wrong. Bundling them means the same person who wants the patch to pass is also the person who signs off on it, a familiar conflict of interest that we tolerate in humans because accountability is attached to a name.

<section class="mfig-lead">
  <div class="mfig-lead-head">
    <span class="card-tag">CLAUDE SHIP // 00</span>
    <p class="mfig-lead-kicker">Claude Ship splits the pull request into three powers. The merge decision is the part worth governing.</p>
    <h3 class="mfig-lead-title">Review finds. Steward fixes. Approvals decides.</h3>
    <p class="mfig-lead-sub">One loop, three roles, and a policy file that can say no.</p>
  </div>
  <div class="mfig-lead-grid">
    <div class="mfig-card">
      <div class="mfig-icon"><svg class="mfig-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg></div>
      <div class="mfig-tag">REVIEW // FIND</div>
      <h4>Findings, not a verdict</h4>
      <p>Multiple lenses, adversarial verification, and categorized comments on the PR.</p>
      <div class="mfig-meta">QUICK · STANDARD · DEEP</div>
    </div>
    <div class="mfig-arrow" aria-hidden="true">→</div>
    <div class="mfig-card">
      <div class="mfig-icon"><svg class="mfig-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 1 1 7.94-7.94l-3.76 3.76z"/></svg></div>
      <div class="mfig-tag">STEWARD // FIX</div>
      <h4>Fixes, without the keys</h4>
      <p>CI, conflicts, and feedback. Every push explains itself and how to undo it.</p>
      <div class="mfig-meta">CI · CONFLICTS · @CLAUDE STOP</div>
    </div>
    <div class="mfig-arrow" aria-hidden="true">→</div>
    <div class="mfig-card">
      <div class="mfig-icon"><svg class="mfig-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/></svg></div>
      <div class="mfig-tag">APPROVALS // DECIDE</div>
      <h4>A decision with a paper trail</h4>
      <p>A repository policy reads findings and classifiers, then allows, asks, or blocks.</p>
      <div class="mfig-meta">POLICY FILE · SIGNALS · OBSERVE</div>
    </div>
  </div>
  <div class="mfig-lead-flow mfig-scroll">
  <svg class="mfig-svg" viewBox="0 0 840 128" role="img" aria-labelledby="ship-lead-title ship-lead-desc">
    <title id="ship-lead-title">The Claude Ship loop</title>
    <desc id="ship-lead-desc">A pull request is opened, Code Review finds issues, PR Steward fixes them, the repository policy is evaluated, and the change merges. No role holds two powers.</desc>
    <defs>
      <marker id="ship-arrow" viewBox="0 0 5 5" refX="4.4" refY="2.5" markerWidth="5" markerHeight="5" markerUnits="userSpaceOnUse" orient="auto"><path d="M0 0 L5 2.5 L0 5 z" fill="var(--mono-ink)"/></marker>
    </defs>
    <text x="24" y="16" class="f" font-size="7.5" letter-spacing="1.2">THE LOOP // FROM PR TO MERGE</text>
    <text x="816" y="16" class="f" font-size="7.5" text-anchor="end" letter-spacing="1">ONE POLICY</text>
    <line x1="24" y1="24" x2="816" y2="24" class="rule"/>
    <rect x="32" y="38" width="128" height="50" class="term"/>
    <text x="44" y="52" class="f" font-size="6" letter-spacing="0.6">01</text>
    <text x="44" y="66" class="t" font-size="9.5" font-weight="800">PR</text>
    <text x="44" y="78" class="m" font-size="6.2">opened</text>
    <line x1="160" y1="63" x2="192" y2="63" class="arrow" marker-end="url(#ship-arrow)"/>
    <rect x="196" y="38" width="128" height="50" class="box"/>
    <text x="208" y="52" class="f" font-size="6" letter-spacing="0.6">02</text>
    <text x="208" y="66" class="t" font-size="9.5" font-weight="800">REVIEW</text>
    <text x="208" y="78" class="m" font-size="6.2">finds</text>
    <line x1="324" y1="63" x2="356" y2="63" class="arrow" marker-end="url(#ship-arrow)"/>
    <rect x="360" y="38" width="128" height="50" class="box"/>
    <text x="372" y="52" class="f" font-size="6" letter-spacing="0.6">03</text>
    <text x="372" y="66" class="t" font-size="9.5" font-weight="800">FIX</text>
    <text x="372" y="78" class="m" font-size="6.2">steward</text>
    <line x1="488" y1="63" x2="520" y2="63" class="arrow" marker-end="url(#ship-arrow)"/>
    <rect x="524" y="38" width="128" height="50" class="codebox"/>
    <text x="536" y="52" class="f" font-size="6" letter-spacing="0.6">04</text>
    <text x="536" y="66" class="t" font-size="9.5" font-weight="800">POLICY</text>
    <text x="536" y="78" class="m" font-size="6.2">file</text>
    <line x1="652" y1="63" x2="684" y2="63" class="arrow" marker-end="url(#ship-arrow)"/>
    <rect x="688" y="38" width="128" height="50" class="term"/>
    <text x="700" y="52" class="f" font-size="6" letter-spacing="0.6">05</text>
    <text x="700" y="66" class="t" font-size="9.5" font-weight="800">MERGE</text>
    <text x="700" y="78" class="m" font-size="6.2">decides</text>
    <text x="420" y="108" class="f" font-size="6.4" text-anchor="middle" letter-spacing="0.6">NO ROLE HOLDS TWO POWERS</text>
    <text x="420" y="120" class="f" font-size="6.2" text-anchor="middle">THE STEWARD CANNOT APPROVE · APPROVALS CANNOT EDIT CODE</text>
  </svg>
  </div>
  <p class="mfig-lead-note"><b>The separation is the point.</b> The agent that fixes a PR is explicitly not allowed to approve or merge it.</p>
</section>

<figure class="fig">
  <img src="/images/claude-ship/claude-ship-loop.webp" alt="Anthropic's official Claude Ship workflow diagram: Code Review posts findings, PR Steward pushes fixes, and Claude Approvals applies team policy before a pull request is ready to merge" width="1600" height="816" loading="lazy" />
  <figcaption><b>Official figure</b> — Anthropic's view of the Claude Ship loop: Code Review finds, PR Steward fixes, and Claude Approvals applies team policy before a pull request is ready to merge. The footer is Anthropic's own warning that Claude Ship uses AI and may miss bugs or security issues. Source: <a href="https://claude.com/resources/articles/introducing-claude-ship">Anthropic, "Introducing Claude Ship"</a> (2026)</figcaption>
</figure>

<p class="mfig-bridge">The rest of this essay is about that separation: why it exists, where the permission boundary sits, what a policy file should contain, and what the numbers from Anthropic's own team do and do not prove.</p>

## What Claude Ship is: one loop, three roles

Claude Ship is not a new model or a new editor. It is a composition of three agents around the pull request. Code Review is already generally available. PR Steward and Claude Approvals are the two beta agents. All three are available together on Claude Team and Enterprise plans, for repositories on GitHub.

**Code Review finds.** It performs an in-depth review of the pull request against the codebase through multiple lenses. It collects findings, verifies them adversarially, categorizes them, and posts them to the PR. Each repository can choose a Quick, Standard, or Deep review level. The adversarial step matters: a finding that survives an attempt to refute it is more useful than a list of plausible concerns.

**PR Steward fixes.** It works to keep a PR green, and it is designed not to approve or merge. It handles failing CI checks, merge conflicts, and review feedback from Code Review, other review tools, or team members. After every push it comments with what it changed and how to undo it. A developer can comment `@claude` to steer the work or `@claude stop` to make it step back.

**Claude Approvals decides.** It applies an approval policy written as a file in the repository, which Anthropic describes as working like a smarter CODEOWNERS file. If the policy allows, it can approve routine changes on its own. If the policy requires it, it can demand human sign-off for specific scenarios. Its signals can include Code Review findings or custom classifiers written in natural language. Anthropic recommends starting in observe-only mode before making its green light a requirement in branch protection.

Read as a system, the three roles are not a pipeline. They are a loop with a gate. The Steward's push changes the diff, which can change the findings, which can change whether the policy allows the merge. The only stable object in that cycle is the policy, which is why it lives in the repository and not in a settings page.

The roles are split by authority, not by task. Review produces claims. Steward produces commits. Approvals produces a decision. Only one of them can say yes, and that one cannot write code. Each role can be wrong without being able to hide the error inside another role's output.

<figure class="mfig-fig">
  <figcaption>
    <span class="card-tag">THE THREE-ROLE LOOP // 01</span>
    <h3 class="mfig-fig-title">One loop, three roles, two prohibitions</h3>
    <p class="mfig-fig-sub">Code Review produces findings, PR Steward pushes fixes, Claude Approvals reads the policy and the signals. The fixer cannot approve; the approver cannot edit code.</p>
  </figcaption>
  <div class="mfig-scroll">
  <svg class="mfig-svg" viewBox="0 0 840 400" role="img" aria-labelledby="ship-f1-title ship-f1-desc">
    <title id="ship-f1-title">The three-role loop</title>
    <desc id="ship-f1-desc">A pull request is opened and reviewed by Code Review. Findings go to PR Steward, which fixes CI failures, conflicts, and feedback and pushes commits back to the PR. Claude Approvals evaluates the policy file and signals from review and the repository, then merges or requires human sign-off. PR Steward cannot approve or merge; Claude Approvals cannot edit code.</desc>
    <defs>
      <marker id="ship-f1-arrow" viewBox="0 0 5 5" refX="4.4" refY="2.5" markerWidth="5" markerHeight="5" markerUnits="userSpaceOnUse" orient="auto"><path d="M0 0 L5 2.5 L0 5 z" fill="var(--mono-ink)"/></marker>
    </defs>
    <text x="24" y="18" class="f" font-size="7.5" letter-spacing="1.2">THREE ROLES // THREE POWERS</text>
    <text x="816" y="18" class="f" font-size="7.5" text-anchor="end" letter-spacing="1">ONE MERGE DECISION</text>
    <line x1="24" y1="26" x2="816" y2="26" class="rule"/>
    <rect x="24" y="54" width="136" height="78" class="term"/>
    <text x="36" y="72" class="f" font-size="6.4" letter-spacing="0.7">INPUT</text>
    <text x="36" y="92" class="t" font-size="9.2" font-weight="800">PR OPENED</text>
    <text x="36" y="106" class="m" font-size="6.2">diff · intent · tests</text>
    <text x="36" y="118" class="f" font-size="6">developer or /ship</text>
    <line x1="160" y1="93" x2="192" y2="93" class="arrow" marker-end="url(#ship-f1-arrow)"/>
    <rect x="196" y="54" width="198" height="78" class="box"/>
    <text x="208" y="72" class="f" font-size="6.4" letter-spacing="0.7">CODE REVIEW // FINDS</text>
    <text x="208" y="92" class="t" font-size="9.2" font-weight="800">MULTIPLE LENSES</text>
    <text x="208" y="106" class="m" font-size="6.2">collect · verify · categorize</text>
    <text x="208" y="118" class="f" font-size="6">posts findings to the PR</text>
    <line x1="394" y1="93" x2="516" y2="93" class="arrow" marker-end="url(#ship-f1-arrow)"/>
    <text x="455" y="84" class="f" font-size="6" text-anchor="middle">FINDINGS</text>
    <rect x="520" y="54" width="182" height="78" class="term"/>
    <text x="532" y="72" class="f" font-size="6.4" letter-spacing="0.7">CLAUDE APPROVALS // DECIDES</text>
    <text x="532" y="92" class="t" font-size="9.2" font-weight="800">POLICY + SIGNALS</text>
    <text x="532" y="106" class="m" font-size="6.2">allow · ask · block</text>
    <text x="532" y="118" class="f" font-size="6">cannot edit code</text>
    <line x1="702" y1="93" x2="726" y2="93" class="arrow" marker-end="url(#ship-f1-arrow)"/>
    <rect x="730" y="54" width="86" height="78" class="codebox"/>
    <text x="773" y="86" class="t" font-size="9" font-weight="800" text-anchor="middle">MERGE</text>
    <text x="773" y="100" class="m" font-size="6" text-anchor="middle">or human</text>
    <text x="773" y="112" class="f" font-size="6" text-anchor="middle">sign-off</text>
    <line x1="295" y1="132" x2="295" y2="244" class="arrow" marker-end="url(#ship-f1-arrow)"/>
    <text x="303" y="176" class="f" font-size="6.2">FINDINGS</text>
    <text x="303" y="188" class="f" font-size="6.2">+ FEEDBACK</text>
    <rect x="196" y="248" width="198" height="92" class="box"/>
    <text x="208" y="266" class="f" font-size="6.4" letter-spacing="0.7">PR STEWARD // FIXES</text>
    <text x="208" y="286" class="t" font-size="9.2" font-weight="800">KEEPS IT GREEN</text>
    <text x="208" y="300" class="m" font-size="6.2">CI · conflicts · review feedback</text>
    <text x="208" y="312" class="f" font-size="6">comments after every push</text>
    <text x="208" y="324" class="f" font-size="6">what changed · how to undo</text>
    <path d="M196 292 H176 V120 H160" class="dash" fill="none" marker-end="url(#ship-f1-arrow)"/>
    <text x="84" y="156" class="f" font-size="6">PUSH + UNDO NOTE</text>
    <text x="84" y="168" class="f" font-size="6">@claude / @claude stop</text>
    <path d="M394 292 H462 V112 H516" class="arrow" fill="none" marker-end="url(#ship-f1-arrow)"/>
    <text x="470" y="196" class="f" font-size="6">GREEN CHECKS</text>
    <text x="470" y="208" class="f" font-size="6">+ DIFF</text>
    <line x1="611" y1="132" x2="611" y2="196" class="arrow" marker-end="url(#ship-f1-arrow)"/>
    <rect x="520" y="200" width="182" height="64" class="box"/>
    <text x="532" y="218" class="f" font-size="6.4" letter-spacing="0.7">IF POLICY SAYS ASK</text>
    <text x="532" y="238" class="t" font-size="8.6" font-weight="800">HUMAN SIGN-OFF</text>
    <text x="532" y="252" class="m" font-size="6.2">a person decides</text>
    <line x1="196" y1="356" x2="816" y2="356" class="rule-soft"/>
    <text x="196" y="372" class="f" font-size="6.4">✕ PR STEWARD CANNOT APPROVE OR MERGE</text>
    <text x="520" y="372" class="f" font-size="6.4">✕ CLAUDE APPROVALS CANNOT EDIT CODE</text>
  </svg>
  </div>
  <p class="mfig-fig-src">REVIEW FINDS · STEWARD FIXES · APPROVALS DECIDES · NO ROLE HOLDS TWO POWERS</p>
</figure>

## Separation of powers

The prohibition on PR Steward is the most interesting line in the announcement. A fixing agent is optimized to make checks pass. That is a proxy objective, and a good one for a fixer. It is the wrong objective for an approver. The approver's question is not "can this be made green?" but "should this exist on main?" Those questions diverge exactly when the change is risky.

There is also an epistemic reason. If one model both finds and fixes, "no findings" becomes ambiguous. It can mean the code is clean, or it can mean the finder and the fixer share a blind spot. Separating the decision does not eliminate the blind spot. It forces the decision to be made against a rule rather than against the model's own confidence that it is done.

The policy is a file in the repository. That choice carries most of the governance value:

- **It is versioned.** Every change to the rules is a diff with an author and a date.
- **It is reviewable.** The policy can go through the same PR process it governs.
- **It is scoped.** A repository can have stricter rules than its neighbor without a central exception.
- **It is legible.** A developer can read the reason a change was allowed or held.

Anthropic describes it as working "like a smarter CODEOWNERS file." The comparison is useful if you keep the right half of it. CODEOWNERS answers a narrow question: who must review this path? It is deterministic, path-based, and it fails closed. If the owner is missing or the file is malformed, the requirement cannot be satisfied, so the merge waits. A Claude Approvals policy answers a larger question: may this change merge without a person? It can consider content, findings, and classifiers, not just a path. The "smarter" part is conditional judgment. The part worth preserving is the failure mode: when the policy is absent, ambiguous, or broken, the result should be a human, not a merge.

That is why the recursion matters. The policy governs pull requests, and changing the policy is itself a pull request. In principle this is elegant: the rules change through the process they constrain. In practice it creates an obvious attack surface. An agent that can edit the policy can grant itself authority. A policy file that is not protected is not a control; it is a suggestion. Whatever the file is called, it needs an owner, a human-review requirement, and an explicit rule that changes to it are never auto-approved.

The last property is the one that makes the design a governance pattern rather than a workflow: the policy can say no. It can allow a routine change, require a person for a consequential one, or block a change outright. A policy that can only say yes is a rubber stamp with a schema.

## Two entry points, one permission boundary

Claude Ship has two ways in, and they are aimed at different people.

For a developer, there is `/ship` in Claude Code. When a change is ready, the developer runs the command. Claude pushes the change, opens the PR, reviews it, and works on feedback and failing checks to help get it ready to merge. What can actually merge depends on the developer's permissions and the repository's branch rules.

For an admin or an engineering leader, there is repository-wide automation. Turning Claude Ship on for a repository puts it to work across the team's pull requests without anyone invoking `/ship`. An admin enables Code Review and PR Steward per repository. Claude Approvals starts when a connected repository has a policy file on its default branch, and an admin can turn it off. Each repository gets its own review level, review schedule, and spend limits. The system works with existing branch protection and required checks.

The important invariant is that the command is a convenience, not a permission. `/ship` does not grant the agent authority the developer did not already have. It shortens the distance between "the change is ready" and "the loop is running." The repo-wide path does not create a second, looser system; it removes the need for each developer to remember the command.

There are two delegations underneath, and they should not be confused. The developer delegates the act of pushing and fixing, bounded by their own permissions. The admin delegates the act of approving, bounded by the policy and branch protection. `/ship` lives in the first delegation. Claude Approvals lives in the second. A developer cannot widen the second by running a command, and an admin cannot widen the first by writing a policy. That is the permission boundary, and it is the same in both entry points.

## The policy as code

Anthropic's advice is to start in observe-only mode, and it is the right advice for a reason that is easy to miss. A policy is a hypothesis about which changes are routine. Until you run it against real pull requests, you do not know whether the hypothesis is true. Observe-only is the experiment: Claude Approvals evaluates each PR and records what it would have done, while branch protection stays unchanged and a human still merges.

The signals available to the policy are of different kinds. Code Review findings are structured evidence: a severity, a category, a location, and a verification status. Custom classifiers are natural-language rules evaluated by a model. Branch protection and required checks are the enforcement layer, not a judgment. A good policy keeps those categories distinct. It uses deterministic path and size rules where it can, review findings where they are reliable, and model classifiers only where a rule cannot be written as a predicate.

Classifiers are the most seductive part and the easiest to overuse. "Changes that alter invoice totals, tax, or refunds require a human" is a useful classifier. "Decide whether this change is safe" is not; it delegates the entire judgment back to the model, with no rule to audit. A classifier is a model call, so it costs tokens and can drift as models change. Write narrow classifiers, give examples, and make the unknown case fall through to a human rather than to an allow.

The cost model follows the same shape. Claude Ship is billed on tokens. Admins can set spend limits for Code Review and PR Steward. Claude Approvals has no base charge, but classifiers are billed on the tokens they use, and a policy that uses Claude's review triggers a billed Code Review even in observe mode. Observe-only is therefore a discount on enforcement, not a free tier. Budget for the policy's own review calls before you turn it on.

The audit trail has two halves. PR Steward comments after every push with what it changed and how to undo it. That is not a status update; it is an undo protocol. The second half is the approval decision: which policy line applied, which signals were present, and who or what said yes. If you cannot reconstruct that from the PR, the policy is decoration. The policy file's git history explains the rules; the PR timeline explains the decisions. Together they answer the only question that matters after an incident: why did this merge?

What should a good policy file contain? Not a maximal list of conditions. A short document with a fail-closed default:

1. **A default of human sign-off.** Auto-approval is the exception, named explicitly.
2. **Sensitive paths that are always human.** Authentication, payments, migrations, infrastructure, CI configuration, and the policy file itself.
3. **Risk triggers that are cheap to evaluate.** Size, dependency changes, schema changes, and changes to public behavior.
4. **Finding rules.** A blocking finding is never auto-approved; an unverified finding is treated as open.
5. **Narrow classifiers with examples.** Each one has an owner and a reason, and the unknown case escalates.
6. **A short allowlist of routine work.** Documentation, tests, and patch-level dependency bumps are the usual candidates.
7. **An observation switch and a review cadence.** The policy is re-read on a schedule and after every incident.

The syntax below is an illustrative shape, not Anthropic's documented schema. The point is the structure: default, exceptions, signals, and a switch that keeps the whole thing in observe mode until someone trusts it.

```yaml
# Illustrative shape, not Anthropic's documented schema.
default: require_human

paths:                           # never auto-approve these
  "src/auth/**": human
  "db/migrations/**": human
  ".github/workflows/**": human
  "**/approval-policy*": human   # the policy governs itself

findings:
  blocking: human                # any open blocking finding
  unverified: human              # review could not confirm or dismiss

classifiers:
  - name: billing-behavior
    rule: "Changes that alter invoice totals, tax, or refunds"
    action: human
  - name: dependency-major
    rule: "A major-version dependency bump"
    action: human

limits:
  max_files: 40                  # larger changes need a person
  max_added_lines: 800

allow:
  - "docs/**"
  - "**/*.test.ts"
  - "patch bumps with green checks"

observe: true                    # log the decision, do not gate yet
```

Two anti-patterns are worth naming. The first is "approve anything Code Review did not flag." That makes Code Review the only gate and collapses the separation of powers: the finder becomes the decider by omission. Absence of findings is not evidence of safety; it is evidence that this reviewer, on this run, did not find anything. The second is a policy too long to read. A policy that nobody reviews is a configuration file with extra steps. Keep it short enough that a new engineer can read it in one sitting and explain it to a reviewer.

<figure class="mfig-fig">
  <figcaption>
    <span class="card-tag">THE POLICY DECISION // 02</span>
    <h3 class="mfig-fig-title">The policy file is the decision surface</h3>
    <p class="mfig-fig-sub">A policy on the default branch reads review findings, natural-language classifiers, and repository context, then allows, requires a human, or blocks. Observe-only records the same decision without enforcing it.</p>
  </figcaption>
  <div class="mfig-scroll">
  <svg class="mfig-svg" viewBox="0 0 840 400" role="img" aria-labelledby="ship-f2-title ship-f2-desc">
    <title id="ship-f2-title">How the approval policy decides</title>
    <desc id="ship-f2-desc">The policy file defines a default of human sign-off, sensitive paths, finding rules, classifiers, size limits, and a routine allowlist. Claude Approvals combines it with review findings, custom classifiers, and repository context. The outcomes are allow, require human, or block. In observe-only mode the decision is recorded but branch protection is unchanged.</desc>
    <defs>
      <marker id="ship-f2-arrow" viewBox="0 0 5 5" refX="4.4" refY="2.5" markerWidth="5" markerHeight="5" markerUnits="userSpaceOnUse" orient="auto"><path d="M0 0 L5 2.5 L0 5 z" fill="var(--mono-ink)"/></marker>
    </defs>
    <text x="24" y="18" class="f" font-size="7.5" letter-spacing="1.2">POLICY // SIGNALS // DECISION</text>
    <text x="816" y="18" class="f" font-size="7.5" text-anchor="end" letter-spacing="1">DEFAULT: HUMAN</text>
    <line x1="24" y1="26" x2="816" y2="26" class="rule"/>
    <rect x="24" y="44" width="224" height="152" class="term"/>
    <text x="36" y="62" class="f" font-size="6.4" letter-spacing="0.7">POLICY FILE // DEFAULT BRANCH</text>
    <line x1="36" y1="70" x2="236" y2="70" class="rule-soft"/>
    <text x="36" y="86" class="mono t" font-size="6.6" font-weight="700">default: require_human</text>
    <text x="36" y="100" class="mono m" font-size="6.4">paths.auth: human</text>
    <text x="36" y="112" class="mono m" font-size="6.4">paths.migrations: human</text>
    <text x="36" y="124" class="mono m" font-size="6.4">findings.blocking: human</text>
    <text x="36" y="136" class="mono m" font-size="6.4">classifiers: billing → human</text>
    <text x="36" y="148" class="mono m" font-size="6.4">allow: docs, tests, bumps</text>
    <line x1="36" y1="158" x2="236" y2="158" class="rule-soft"/>
    <text x="36" y="176" class="mono t" font-size="6.6" font-weight="700">observe: true</text>
    <text x="132" y="176" class="f" font-size="6">← start here</text>
    <path d="M136 196 V232" class="dash" fill="none" marker-end="url(#ship-f2-arrow)"/>
    <rect x="24" y="236" width="224" height="74" class="codebox"/>
    <text x="36" y="254" class="f" font-size="6.4" letter-spacing="0.7">OBSERVE-ONLY</text>
    <text x="36" y="274" class="t" font-size="8.4" font-weight="800">RECORD, DO NOT GATE</text>
    <text x="36" y="288" class="m" font-size="6.2">the decision is logged</text>
    <text x="36" y="300" class="f" font-size="6">branch protection unchanged</text>
    <rect x="592" y="44" width="224" height="152" class="box"/>
    <text x="604" y="62" class="f" font-size="6.4" letter-spacing="0.7">SIGNALS // PER PR</text>
    <line x1="604" y1="70" x2="804" y2="70" class="rule-soft"/>
    <text x="604" y="88" class="t" font-size="7.6" font-weight="800">REVIEW FINDINGS</text>
    <text x="604" y="100" class="m" font-size="6.2">severity · category · open</text>
    <line x1="604" y1="110" x2="804" y2="110" class="rule-soft"/>
    <text x="604" y="128" class="t" font-size="7.6" font-weight="800">CUSTOM CLASSIFIERS</text>
    <text x="604" y="140" class="m" font-size="6.2">natural-language rules</text>
    <line x1="604" y1="150" x2="804" y2="150" class="rule-soft"/>
    <text x="604" y="168" class="t" font-size="7.6" font-weight="800">REPO CONTEXT</text>
    <text x="604" y="180" class="m" font-size="6.2">branch protection · checks</text>
    <rect x="316" y="70" width="204" height="92" class="term"/>
    <text x="328" y="88" class="f" font-size="6.4" letter-spacing="0.7">CLAUDE APPROVALS</text>
    <text x="328" y="110" class="t" font-size="9" font-weight="800">EVALUATE</text>
    <text x="328" y="124" class="m" font-size="6.2">policy + signals</text>
    <text x="328" y="136" class="f" font-size="6">one decision per PR</text>
    <text x="328" y="150" class="f" font-size="6">can say no</text>
    <line x1="248" y1="120" x2="312" y2="120" class="arrow" marker-end="url(#ship-f2-arrow)"/>
    <line x1="588" y1="120" x2="524" y2="120" class="arrow" marker-end="url(#ship-f2-arrow)"/>
    <line x1="418" y1="162" x2="418" y2="204" class="rule"/>
    <line x1="370" y1="204" x2="733" y2="204" class="rule"/>
    <line x1="370" y1="204" x2="370" y2="232" class="arrow" marker-end="url(#ship-f2-arrow)"/>
    <line x1="550" y1="204" x2="550" y2="232" class="arrow" marker-end="url(#ship-f2-arrow)"/>
    <line x1="733" y1="204" x2="733" y2="232" class="arrow" marker-end="url(#ship-f2-arrow)"/>
    <rect x="290" y="236" width="160" height="70" class="box"/>
    <text x="302" y="254" class="f" font-size="6.4" letter-spacing="0.7">OUTCOME 01</text>
    <text x="302" y="274" class="t" font-size="9" font-weight="800">ALLOW</text>
    <text x="302" y="288" class="m" font-size="6.2">routine change</text>
    <text x="302" y="300" class="f" font-size="6">Claude approves</text>
    <rect x="470" y="236" width="160" height="70" class="box"/>
    <text x="482" y="254" class="f" font-size="6.4" letter-spacing="0.7">OUTCOME 02</text>
    <text x="482" y="274" class="t" font-size="9" font-weight="800">REQUIRE HUMAN</text>
    <text x="482" y="288" class="m" font-size="6.2">consequential</text>
    <text x="482" y="300" class="f" font-size="6">a person signs off</text>
    <rect x="650" y="236" width="166" height="70" class="box"/>
    <text x="662" y="254" class="f" font-size="6.4" letter-spacing="0.7">OUTCOME 03</text>
    <text x="662" y="274" class="t" font-size="9" font-weight="800">BLOCK</text>
    <text x="662" y="288" class="m" font-size="6.2">policy forbids</text>
    <text x="662" y="300" class="f" font-size="6">no merge</text>
    <line x1="24" y1="330" x2="816" y2="330" class="rule-soft"/>
    <text x="420" y="348" class="f" font-size="6.4" text-anchor="middle" letter-spacing="0.6">BRANCH PROTECTION ENFORCES THE RESULT · OBSERVE MODE LEAVES IT UNCHANGED</text>
    <text x="420" y="366" class="f" font-size="6.2" text-anchor="middle">A POLICY THAT CAN ONLY SAY YES IS A RUBBER STAMP</text>
  </svg>
  </div>
  <p class="mfig-fig-src">POLICY FILE · REVIEW FINDINGS · CLASSIFIERS · BRANCH PROTECTION · OBSERVE FIRST</p>
</figure>

## The Claude Code team's reported result

Anthropic reports that on the Claude Code team, merged PRs more than doubled from June to September 2026, while the share of PRs that were reverted fell by more than 40%. The same passage notes that Claude's review is one layer of a broader process. That attribution matters. This is an internal result from one team that writes most of its code with the tool, not a controlled benchmark across companies.

The pair of numbers is more interesting than either one alone. Merge volume can rise for a trivial reason: more pull requests were opened. A rising merge count with a flat revert share would tell you the team got faster at the same quality. A falling revert share is the quality counterweight. What Anthropic describes is both at once: more merged work and less rework, on a team that was already using agents heavily. If the numbers hold up, the constraint that moved was coordination, not code production.

They do not prove that Claude Ship caused all of it. The period covers broader adoption of Claude Code, changes in team process, and a changing mix of work. "More than doubled" is a relative change with an unspecified base. "Fell by more than 40%" is a relative decline in the revert share, not a 40-point drop, and it depends on how a revert is counted. There is no control group, no public definition of the cohort, and no independent audit. The honest reading is narrower: at least one high-volume team reports that the loop absorbed more PRs without a larger share of reversions. That is an existence proof, not a benchmark you can copy into a forecast.

One customer detail supports the same reading. TELUS's director of engineering says Code Review caught real issues before human reviewers reached the PR, PR Steward helped contributors fix them, and the human's time now goes to the changes that need it. That is a statement about where attention moved, not a claim that the human left. The queue got shorter; the judgment stayed.

## Limits and costs

The disclaimer is not boilerplate, and it should be quoted rather than paraphrased: "Claude Ship uses AI and may miss bugs, security vulnerabilities, or other issues." A green approval is a statement about the policy, not a proof about the code. The policy can only certify what its signals can see, and the signals are produced by models that can be wrong in the same direction.

Several limits are structural:

- **It is beta.** PR Steward and Claude Approvals can change. Do not build a compliance dependency on their current semantics without a fallback.
- **It is GitHub-only.** Repositories on other forges are out of scope for now.
- **It is Team and Enterprise only.** Small teams and individual developers cannot adopt it directly.
- **Some organizations are excluded.** It is not available to organizations with Zero Data Retention, the HIPAA configuration, or customer-managed encryption keys. For those teams, the governance pattern is still portable, but this implementation is not.
- **It costs tokens.** The amount depends on the number and size of pull requests, the review level, how often reviews run, and how much work PR Steward does. A policy that invokes Claude's review triggers a billed Code Review even in observe mode.
- **It reviews; it does not prove.** The human sign-off path is not a formality to be optimized away. It is the control that catches what the models miss.

The cost discussion usually stops at the invoice. The more important cost is attention. A policy that sends 5% of changes to a human produces careful review, because the reviewer knows the queue is small and the cases are selected. A policy that sends 60% produces a rubber stamp, because no one can sustain that level of scrutiny on top of their own work. The policy's thresholds do not just allocate work; they determine whether human review remains meaningful. That is a design decision, not a billing detail.

There is also a security boundary around the policy itself. The policy file is privileged configuration, closer to production IAM than to a README. If an agent can edit it, the agent can widen its own authority. If a developer can change it in the same PR that changes the code, the policy becomes part of the diff it is supposed to judge. Protect the file with the strongest review requirement you have, and keep its changes out of the auto-approval path.

## A practical adoption path

The adoption path that matches the design is incremental and measurable. It does not start with the most critical repository, and it does not start with enforcement.

1. **Pick one repository.** Choose a repo with real PR volume and a bounded blast radius. A service with good tests and a clear owner is a better first candidate than the monorepo everyone is afraid of.
2. **Turn on Code Review first.** Use Quick or Standard. Read the findings for two weeks and check the false-positive rate before adding anything that can block.
3. **Add PR Steward, but watch the undo notes.** The comments after each push are the audit trail. If they are vague, the automation is not ready for more authority.
4. **Write the policy in observe-only mode.** Keep the default at human sign-off. Add only the paths and findings you are confident about. Set a monthly spend limit before the first classifier runs.
5. **Measure the loop, not the demo.** Track review latency, merge rate, revert share, human minutes per PR, and the policy override rate. A high override rate means the policy is wrong or the reviewers do not trust it; both are fixable, but only if you see them.
6. **Enforce narrowly.** Once the observe log matches your judgment, require Claude Approvals in branch protection for the allowlist only. Keep sensitive paths on human review. Expand the allowlist one class of change at a time.
7. **Review the policy on a schedule.** Quarterly, and after every incident. Give the file an owner. Treat a policy change like a code change, because it is one.

| Signal | What it tells you | How it misleads |
| :--- | :--- | :--- |
| Review latency | Whether the queue is moving | Fast merges of bad code look like success |
| Revert share | Whether rework is rising or falling | Teams can stop reverting and call it improvement |
| Human minutes per PR | Whether review moved or disappeared | A low number can mean trust or neglect |
| Policy override rate | Whether the policy matches reality | Silent overrides hide a broken policy |
| Escaped defects | The outcome that matters | Noisy and lagging, so it needs a long window |

Define the kill criteria before turning enforcement on. If the revert share rises, if reviewers cannot explain why a change was approved, or if overrides become routine, turn the gate off and go back to observe mode. A governance system that cannot be rolled back is not a control; it is a commitment.

Eligible Claude Enterprise organizations can claim at least $10,000 in Claude Ship credits, to use within 30 days of claiming, with claims due by 15 January 2027 and terms applying. Credits are a reason to run the experiment, not a reason to skip the measurement.

## Conclusion: the merge decision is the last mile

Writing the patch was never the hard part of shipping. The hard part is deciding that the patch is safe to merge, and being able to explain that decision later.

Claude Ship is interesting because it treats that decision as a separate power. Code Review finds. PR Steward fixes, and is explicitly barred from approving or merging. Claude Approvals decides against a policy file that lives in the repository, can require a person, and can say no. The design is not a feature list; it is a separation of powers for a loop that otherwise concentrates too much judgment in the agent that is trying to finish.

The beta caveats do not weaken the pattern. They define the adoption path: observe first, enforce narrowly, keep a human on the changes that matter, and measure the revert share as carefully as the merge count. Anthropic's own disclaimer is the right frame. The system may miss things. That is exactly why the policy has to be able to say no, and why a person has to own the file that says it.

An agent that can fix anything still should not be the one that decides it shipped.

## References

- [Anthropic: Introducing Claude Ship](https://claude.com/resources/articles/introducing-claude-ship) — announcement, 23 November 2026.
- [Claude Ship documentation](https://code.claude.com/docs/en/claude-ship) — setup and administration.
- [Code Review setup guide](https://code.claude.com/docs/en/code-review-setup) — connecting GitHub and enabling a repository.
- [Anthropic: Code Review is now generally available](https://claude.com/resources/articles/code-review-is-now-generally-available) — the review layer.
- [Anthropic: Solving code review at Anthropic](https://claude.dev/blog/solving-code-review-at-anthropic/) — the team's reported results.
- [GitHub: About CODEOWNERS](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-code-owners) — the file Claude Approvals is compared to.
- [GitHub: About protected branches](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches) — the enforcement layer.
- [Claude Enterprise: Code Review promotional credits](https://support.claude.com/en/articles/17603594-free-code-review-promotional-credits-for-claude-enterprise) — eligibility and terms.
