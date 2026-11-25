---
title: "alint: The Linter for the Repository Around Your Code"
description: "Code linters check what is inside a file. alint checks the shape around it — missing READMEs, unpinned Actions, stray artifacts, and versions that drift — with one .alint.yml, one static binary, and the same findings in CI, pre-commit, and your editor."
pubDate: 2026-11-25
category: "DevOps"
tags: ["alint", "Linting", "GitHub Actions", "CI", "DevOps"]
featured: false
author: "Alex.Hsiao"
readTime: "14 min read"
---

# alint: The Linter for the Repository Around Your Code

## The gap: a clean file, a drifting repository

<section class="alint-lead">
  <div class="alint-lead-head">
    <span class="card-tag">THE REPOSITORY LINTER // 00</span>
    <p class="alint-lead-kicker">Every repository has a shape it is supposed to keep. Most of that shape is enforced by memory.</p>
    <h3 class="alint-lead-title">The code can be clean. The repository can still be wrong.</h3>
    <p class="alint-lead-sub">alint checks the files, names, values, and relationships a code linter never sees.</p>
  </div>
  <div class="alint-lead-grid">
    <div class="alint-lead-card">
      <div class="alint-lead-icon"><svg class="alint-lead-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="m10 13-2 2 2 2"/><path d="m14 17 2-2-2-2"/></svg></div>
      <div class="alint-lead-tag">CODE // LINTED</div>
      <h4>The inside of a file</h4>
      <p>ESLint, Clippy, and Ruff check syntax, types, and style. They stop at the file boundary.</p>
      <div class="alint-lead-meta">SYNTAX · TYPES · STYLE</div>
    </div>
    <div class="alint-lead-arrow" aria-hidden="true">→</div>
    <div class="alint-lead-card">
      <div class="alint-lead-icon"><svg class="alint-lead-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 10a1 1 0 0 0 1-1V6a1 1 0 0 0-1-1h-2.5a1 1 0 0 1-.8-.4l-.9-1.2A1 1 0 0 0 15 3h-4a1 1 0 0 0-1 1v5a1 1 0 0 0 1 1Z"/><path d="M20 21a1 1 0 0 0 1-1v-3a1 1 0 0 0-1-1h-2.5a1 1 0 0 1-.8-.4l-.9-1.2a1 1 0 0 0-.8-.4H11a1 1 0 0 0-1 1v5a1 1 0 0 0 1 1Z"/><path d="M3 5a2 2 0 0 0 2 2h3"/><path d="M3 3v13a2 2 0 0 0 2 2h3"/></svg></div>
      <div class="alint-lead-tag">REPO // DRIFTED</div>
      <h4>The shape around it</h4>
      <p>A README, a pinned Action, a version that must match. These live in review memory.</p>
      <div class="alint-lead-meta">README · PINS · VERSIONS</div>
    </div>
    <div class="alint-lead-arrow" aria-hidden="true">→</div>
    <div class="alint-lead-card">
      <div class="alint-lead-icon"><svg class="alint-lead-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 7V5a2 2 0 0 1 2-2h2"/><path d="M17 3h2a2 2 0 0 1 2 2v2"/><path d="M21 17v2a2 2 0 0 1-2 2h-2"/><path d="M7 21H5a2 2 0 0 1-2-2v-2"/><circle cx="12" cy="12" r="3"/><path d="m16 16-1.9-1.9"/></svg></div>
      <div class="alint-lead-tag">ALINT // ENFORCED</div>
      <h4>The shape, as a rule</h4>
      <p>One <code>.alint.yml</code>, one static binary. The same findings in CI, pre-commit, and the editor.</p>
      <div class="alint-lead-meta">ONE CONFIG · ONE PASS</div>
    </div>
  </div>
  <div class="alint-lead-flow alint-scroll">
  <svg class="alint-svg" viewBox="0 0 840 170" role="img" aria-labelledby="alint-lead-title alint-lead-desc">
    <title id="alint-lead-title">The alint pipeline at a glance</title>
    <desc id="alint-lead-desc">A repository is read by one .alint.yml config, checked in one pass, rendered as findings, and either fixed or used to gate CI.</desc>
    <defs>
      <marker id="alint-arrow" viewBox="0 0 5 5" refX="4.4" refY="2.5" markerWidth="5" markerHeight="5" markerUnits="userSpaceOnUse" orient="auto"><path d="M0 0 L5 2.5 L0 5 z" fill="var(--mono-ink)"/></marker>
      <marker id="alint-arrow-muted" viewBox="0 0 5 5" refX="4.4" refY="2.5" markerWidth="5" markerHeight="5" markerUnits="userSpaceOnUse" orient="auto"><path d="M0 0 L5 2.5 L0 5 z" fill="var(--mono-l5)"/></marker>
    </defs>
    <text x="24" y="18" class="f" font-size="7.5" letter-spacing="1.2">ONE REPOSITORY // ONE CONFIG // ONE PASS</text>
    <text x="816" y="18" class="f" font-size="7.5" text-anchor="end" letter-spacing="1">THE ALINT PIPELINE</text>
    <line x1="24" y1="26" x2="816" y2="26" class="rule"/>
    <rect x="24" y="44" width="128" height="72" class="term"/>
    <svg x="36" y="54" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--mono-ink)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10a1 1 0 0 0 1-1V6a1 1 0 0 0-1-1h-2.5a1 1 0 0 1-.8-.4l-.9-1.2A1 1 0 0 0 15 3h-4a1 1 0 0 0-1 1v5a1 1 0 0 0 1 1Z"/><path d="M20 21a1 1 0 0 0 1-1v-3a1 1 0 0 0-1-1h-2.5a1 1 0 0 1-.8-.4l-.9-1.2a1 1 0 0 0-.8-.4H11a1 1 0 0 0-1 1v5a1 1 0 0 0 1 1Z"/><path d="M3 5a2 2 0 0 0 2 2h3"/><path d="M3 3v13a2 2 0 0 0 2 2h3"/></svg>
    <text x="58" y="63" class="f" font-size="6.2" letter-spacing="0.6">REPO</text>
    <text x="36" y="88" class="t" font-size="9.5" font-weight="800" letter-spacing="-0.01em">MANY FILES</text>
    <text x="36" y="100" class="m" font-size="6.8">README · ci.yml</text>
    <text x="36" y="112" class="f" font-size="6.2">manifests · locales</text>
    <line x1="156" y1="80" x2="186" y2="80" class="arrow" marker-end="url(#alint-arrow)"/>
    <rect x="190" y="44" width="128" height="72" class="box"/>
    <svg x="202" y="54" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--mono-ink)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M8 13h2"/><path d="M8 17h2"/><path d="M14 13h2"/><path d="M14 17h2"/></svg>
    <text x="224" y="63" class="f" font-size="6.2" letter-spacing="0.6">CONFIG</text>
    <text x="202" y="88" class="t mono" font-size="9.2" font-weight="800">.ALINT.YML</text>
    <text x="202" y="100" class="m" font-size="6.8">one config</text>
    <text x="202" y="112" class="f" font-size="6.2">extends + rules</text>
    <line x1="322" y1="80" x2="352" y2="80" class="arrow" marker-end="url(#alint-arrow)"/>
    <rect x="356" y="44" width="128" height="72" class="codebox"/>
    <svg x="368" y="54" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--mono-ink)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7V5a2 2 0 0 1 2-2h2"/><path d="M17 3h2a2 2 0 0 1 2 2v2"/><path d="M21 17v2a2 2 0 0 1-2 2h-2"/><path d="M7 21H5a2 2 0 0 1-2-2v-2"/><circle cx="12" cy="12" r="3"/><path d="m16 16-1.9-1.9"/></svg>
    <text x="390" y="63" class="f" font-size="6.2" letter-spacing="0.6">ENGINE</text>
    <text x="368" y="88" class="t" font-size="9.5" font-weight="800" letter-spacing="-0.01em">ONE PASS</text>
    <text x="368" y="100" class="m" font-size="6.8">walk · scan</text>
    <text x="368" y="112" class="f" font-size="6.2">read each file once</text>
    <line x1="488" y1="80" x2="518" y2="80" class="arrow" marker-end="url(#alint-arrow)"/>
    <rect x="522" y="44" width="128" height="72" class="term"/>
    <svg x="534" y="54" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--mono-ink)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="m3 17 2 2 4-4"/><path d="m3 7 2 2 4-4"/><path d="M13 6h8"/><path d="M13 12h8"/><path d="M13 18h8"/></svg>
    <text x="556" y="63" class="f" font-size="6.2" letter-spacing="0.6">REPORT</text>
    <text x="534" y="88" class="t" font-size="9.5" font-weight="800" letter-spacing="-0.01em">FINDINGS</text>
    <text x="534" y="100" class="m" font-size="6.8">8 formats</text>
    <text x="534" y="112" class="f" font-size="6.2">human · SARIF · agent</text>
    <line x1="654" y1="80" x2="684" y2="80" class="arrow" marker-end="url(#alint-arrow)"/>
    <rect x="688" y="44" width="128" height="72" class="box"/>
    <svg x="700" y="54" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--mono-ink)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>
    <text x="722" y="63" class="f" font-size="6.2" letter-spacing="0.6">EXIT</text>
    <text x="700" y="88" class="t" font-size="9.5" font-weight="800" letter-spacing="-0.01em">FIX / GATE</text>
    <text x="700" y="100" class="m" font-size="6.8">26 fix ops</text>
    <text x="700" y="112" class="f" font-size="6.2">baseline · CI</text>
    <text x="420" y="150" class="f" font-size="6.6" text-anchor="middle" letter-spacing="0.6">THE SAME RULES RUN IN CI, PRE-COMMIT, THE EDITOR, AND THE AGENT</text>
  </svg>
  </div>
  <p class="alint-lead-note"><b>A repository is more than the code inside it.</b> alint is the linter that says so out loud.</p>
</section>

<p class="alint-lead-bridge">The rest of this article is what that shape includes, how one pass finds it, and how to adopt the tool without a flag day.</p>

A code linter can report zero problems on a repository that is still wrong.

The README is missing from a new package. A workflow runs `actions/checkout@v4` instead of a commit SHA. Someone committed `target/` again. `package.json` says `1.4.0`, and `Cargo.toml` still says `1.3.0`. None of these are syntax errors, type errors, or style violations. They are facts about the repository: which files exist, what they are named, what they contain, and how they relate.

ESLint, Clippy, and Ruff read one file at a time and ask whether the code inside is valid. They have no opinion about whether the file should exist, whether its name is portable, or whether its version matches a sibling manifest. Those rules usually live in a reviewer's head or a paragraph of `CONTRIBUTING.md`. Nothing fails when a pull request ignores them.

alint is a bet that these rules deserve the same treatment as code rules: a declarative config, a deterministic check, and an exit code.

## What alint is

alint describes itself as "a fast, general linter." The qualifier matters. It is not a faster ESLint. It checks the repository around the code.

- One static Rust binary, dual-licensed Apache-2.0 or MIT.
- 104 rule kinds across 13 families, plus 11 aliases.
- 24 bundled rulesets, compiled into the binary and resolved offline.
- 26 fix operations, split into safe, unsafe, and suggestion tiers.
- 8 output formats, including SARIF, GitHub annotations, and an agent-shaped JSON report.
- No Node, JVM, or Python runtime in the path; no telemetry; no network access at runtime except the `extends:` URLs you write yourself.

It takes over where Repolinter left off — Repolinter was archived in February 2026 — and runs alongside the code linters rather than replacing them. The project publishes benchmarks on every release: about 1.5 seconds for 100,000 files, under 20 seconds for one million.

The tool is young. v0.23.0 shipped on 22 November 2026; the repository itself dates from April 2026. That is a reason to pin the version, not a reason to ignore it. The core model is small and stable: a config, a walk, a set of rules, a report.

## A rule is three things

A config lives at the repo root as `.alint.yml`. The shortest useful version adopts a bundled ruleset:

```yaml
version: 1
extends:
  - alint://bundled/oss-baseline@v1
```

`extends:` composes rulesets. A ruleset can be a bundled one (compiled into the binary, addressed as `alint://bundled/<name>@v1`), a local file, or an HTTPS URL pinned by a SHA-256 hash. alint resolves them, cycle-checks them, and field-merges each layer by rule `id`. Your own rules sit on top; you can override a rule's severity or switch it off by redeclaring its id.

A rule is three things:

1. **A kind.** The check to run, such as `file_exists`, `filename_case`, or `pair`.
2. **Paths.** The files or globs it applies to.
3. **A severity.** `error`, `warning`, `info`, or `off`.

A rule can also carry a `when:` condition (run only on the default branch, or only when a file exists) and a `fix:` operation.

Here is a config that adopts two rulesets and adds one local rule:

```yaml
version: 1
extends:
  - alint://bundled/oss-baseline@v1
  - alint://bundled/ci/github-actions@v1
rules:
  - id: no-focused-tests
    kind: file_content_forbidden
    paths: ["**/*.test.ts"]
    pattern: '\.only\('
    message: "Remove .only() so CI runs the whole suite, not one test"
    level: error
```

The first ruleset asks for the open-source basics: a README, a license, no merge markers. The second hardens GitHub Actions: pin third-party actions to a full commit SHA, declare a read-only token, give every workflow a name. The third is local and specific: no focused test left in a pull request.

The rule model is deliberately boring. There is no plugin API in the hot path, no dynamically loaded code, and no per-language runtime. The engine, the rules, the formatters, and the language server are one binary. When no built-in kind fits, an opt-in `command` kind can run a tool you already trust and turn its exit code into a violation. That is the escape hatch, not the foundation.

## What it can see

The 104 kinds group into a handful of surfaces. The exact list is in the rule reference; the categories are what matter:

| Surface | What it catches | Example kinds |
| :--- | :--- | :--- |
| Files and structure | A missing README or license; a committed `target/`; a directory that is too deep; a file that is too large | `file_exists`, `file_absent`, `file_max_size` |
| Names and content | A module in the wrong case; a missing license header; a merge marker; trailing whitespace | `filename_case`, `file_header`, `file_content_forbidden` |
| Config values | A `package.json` without a license; a workflow without `permissions:`; a version that is not semver | `json_path_matches`, `yaml_path_absent`, `json_schema_passes` |
| Cross-file relations | Every package has a README; every `.proto` has a generated binding; every locale has the reference keys; no import cycles | `every_matching_has`, `pair`, `key_parity`, `file_graph` |
| Security and encoding | An unpinned Action; a Trojan-Source bidi control; a zero-width character; a byte-order mark | `pinned_references`, `no_bidi_controls` |
| Git and metadata | A commit subject that breaks the convention; a missing sign-off; a file mode that will not survive checkout | `git_commit_message`, `pair_changed_together` |

The cross-file row is the part most tools do not have. A code linter sees one file. A filesystem linter can see the whole tree, which means it can assert relationships: `pair` says every `.proto` has a generated binding; `key_parity` says every locale file declares the same keys as the reference; `file_graph` says the import graph has no cycles; `generated_file_fresh` says a checked-in generated file still matches its source.

That is also where the structured queries live. alint can read JSON, YAML, TOML, XML, dotenv, INI, `.properties`, and HCL, query them with RFC 9535 JSONPath, and assert a value, match a pattern, forbid a key, or validate the file against a JSON Schema. A rule can require `license` in every `package.json`, `publish = false` in every internal crate, or a read-only token in every workflow.

Here is a cross-file rule for locale parity:

```yaml
version: 1
rules:
  - id: locales-match-english
    kind: key_parity
    reference: locales/en.json
    peers: "locales/*.json"
    level: error
```

If `locales/fr.json` is missing `nav.about`, the rule reports the key, not the value. If every locale declares the reference key set, the rule passes. No script, no bespoke test, no reviewer memory.

## One config, one walk, one report

The execution model is the reason alint is fast, and it is simple enough to hold in your head.

1. **Assemble the config.** alint finds `.alint.yml`, resolves every `extends:` source, caches it, cycle-checks it, and field-merges the layers by rule id. This is also the trust boundary: a process-spawning rule or a custom fact that arrives through `extends:` is rejected at load, so adopting someone else's ruleset cannot make your machine run their commands.
2. **Walk the repository once.** The walk is parallel, honors `.gitignore`, `.ignore`, git excludes, and your own `ignore:` globs, and builds one deterministic, sorted `FileIndex`. The sort is what makes the output reproducible: the same tree produces byte-identical output every time.
3. **Evaluate facts, once.** Any `facts:` you declared are evaluated a single time against that index. Then each rule's `when:` expression is checked, and rules whose condition is false are dropped before their files are scanned. Listing the Rust, Node, Python, and Go rulesets in a repo that is only one of them costs almost nothing.
4. **Scan each file once.** Per-file rules run file-major: alint reads each matched file's bytes at most once and hands that one read to every rule that applies. Cross-file rules run rule-major: each scans the whole index to assert a relationship no single file can. Both classes run in parallel across cores.
5. **Aggregate and emit.** Violations are merged, re-sorted, and rendered in the chosen format. The process exits `0` for clean, `1` for violations, `2` for a config error, or `3` for an internal error.

The design goal is one config, one pass, one report. Adding more per-file rules barely changes the cost, because the file is already in memory. The expensive rules are the cross-file ones, and there are fewer of them.

<figure class="alint-fig">
  <figcaption>
    <span class="card-tag">THE PIPELINE // 01</span>
    <h3 class="alint-fig-title">One config, one walk, one report</h3>
    <p class="alint-fig-sub">alint assembles the effective config, indexes the repository once, filters rules by <code>when:</code>, reads each file at most once, and emits one report.</p>
  </figcaption>
  <div class="alint-scroll">
  <svg class="alint-svg" viewBox="0 0 840 330" role="img" aria-labelledby="alint-f1-title alint-f1-desc">
    <title id="alint-f1-title">The alint execution pipeline</title>
    <desc id="alint-f1-desc">Five stages: assemble the config from .alint.yml and its extends, walk the repository into a sorted index, evaluate facts and filter rules by when, scan each file once with per-file and cross-file rules, then aggregate the report and return an exit code.</desc>
    <text x="24" y="18" class="f" font-size="7.5" letter-spacing="1.2">THE PIPELINE // CONFIG TO EXIT CODE</text>
    <text x="816" y="18" class="f" font-size="7.5" text-anchor="end" letter-spacing="1">ONE PASS · DETERMINISTIC OUTPUT</text>
    <line x1="24" y1="26" x2="816" y2="26" class="rule"/>
    <rect x="36" y="56" width="136" height="120" class="term"/>
    <text x="48" y="78" class="f" font-size="7" letter-spacing="0.8">01 · CONFIG</text>
    <text x="48" y="106" class="t mono" font-size="9.4" font-weight="800">.ALINT.YML</text>
    <text x="48" y="124" class="m" font-size="6.8">extends:</text>
    <text x="48" y="138" class="m" font-size="6.8">merge by id</text>
    <text x="48" y="152" class="f" font-size="6.2">trust gate</text>
    <line x1="172" y1="116" x2="190" y2="116" class="arrow" marker-end="url(#alint-arrow)"/>
    <rect x="194" y="56" width="136" height="120" class="box"/>
    <text x="206" y="78" class="f" font-size="7" letter-spacing="0.8">02 · WALK</text>
    <text x="206" y="106" class="t" font-size="9.4" font-weight="800">ONE PASS</text>
    <text x="206" y="124" class="m" font-size="6.8">.gitignore</text>
    <text x="206" y="138" class="m" font-size="6.8">sorted index</text>
    <text x="206" y="152" class="f" font-size="6.2">parallel</text>
    <line x1="330" y1="116" x2="348" y2="116" class="arrow" marker-end="url(#alint-arrow)"/>
    <rect x="352" y="56" width="136" height="120" class="box"/>
    <text x="364" y="78" class="f" font-size="7" letter-spacing="0.8">03 · FACTS</text>
    <text x="364" y="106" class="t" font-size="9.4" font-weight="800">FACTS ONCE</text>
    <text x="364" y="124" class="m" font-size="6.8">when:</text>
    <text x="364" y="138" class="m" font-size="6.8">drop rules</text>
    <text x="364" y="152" class="f" font-size="6.2">before scanning</text>
    <line x1="488" y1="116" x2="506" y2="116" class="arrow" marker-end="url(#alint-arrow)"/>
    <rect x="510" y="56" width="136" height="120" class="codebox"/>
    <text x="522" y="78" class="f" font-size="7" letter-spacing="0.8">04 · SCAN</text>
    <text x="522" y="106" class="t" font-size="9.4" font-weight="800">READ ONCE</text>
    <text x="522" y="124" class="m" font-size="6.8">per-file</text>
    <text x="522" y="138" class="m" font-size="6.8">cross-file</text>
    <text x="522" y="152" class="f" font-size="6.2">parallel across cores</text>
    <line x1="646" y1="116" x2="664" y2="116" class="arrow" marker-end="url(#alint-arrow)"/>
    <rect x="668" y="56" width="136" height="120" class="term"/>
    <text x="680" y="78" class="f" font-size="7" letter-spacing="0.8">05 · REPORT</text>
    <text x="680" y="106" class="t" font-size="9.4" font-weight="800">MERGE</text>
    <text x="680" y="124" class="m" font-size="6.8">8 formats</text>
    <text x="680" y="138" class="m" font-size="6.8">exit 0/1/2/3</text>
    <text x="680" y="152" class="f" font-size="6.2">one report</text>
    <rect x="36" y="200" width="768" height="48" class="term"/>
    <text x="48" y="220" class="t mono" font-size="7.2" font-weight="700">ONE FILE READ → EVERY MATCHING RULE</text>
    <text x="792" y="220" class="m mono" font-size="7.2" text-anchor="end">CROSS-FILE RULES SCAN THE SAME INDEX</text>
    <line x1="36" y1="270" x2="804" y2="270" class="dash"/>
    <text x="36" y="292" class="f" font-size="6.8">DETERMINISTIC OUTPUT · SAME FINDINGS IN CI, PRE-COMMIT, EDITOR, AND AGENT</text>
    <text x="36" y="312" class="f" font-size="6.8">CONFIG TRUST BOUNDARY: COMMAND RULES FROM extends ARE REJECTED AT LOAD</text>
  </svg>
  </div>
  <p class="alint-fig-src">CONFIG → WALK → FACTS → SCAN → REPORT</p>
</figure>

## Fix the mechanical, surface the rest

A linter that only reports is a linter people turn off. alint ships 26 fix operations, but it separates the mechanical from the meaningful.

- **Safe fixes** apply on a plain `alint fix`: whitespace and newline hygiene, line endings, header placement, sorting a marked block, reindentation.
- **Unsafe fixes** change meaning or remove content, so they wait for `alint fix --unsafe-fixes`: deleting a file, a regex replacement, dropping a committed artifact from git's index.
- **Suggestions** are reported but never written, for violations with no mechanical repair.

Preview with `alint fix --dry-run`, or `alint fix --diff` for the exact edits. alint batches a file's edits in memory, writes each file once, and re-runs until the tree stops changing; files above 1 MiB are skipped rather than rewritten.

There is a trust rule inside the fixer, too. Because `extends:` can pull a ruleset from a URL, a fix from a remote or nested ruleset that injects content or points it at a remote destination is demoted to a suggestion unless you list that source under `trusted_extends:`. A fix that shells out is refused from anywhere but your own top-level config. The point is that a shared ruleset can suggest a repair without silently rewriting your repository.

## Adopt it without a flag day

Turning on a structural linter in an established repository has a chicken-and-egg problem: the first run reports thousands of violations the current pull request did not introduce. alint's answer is baseline mode.

```bash
alint baseline
# writes .alint-baseline.json; commit it

alint check --baseline .alint-baseline.json
# fails only on findings that are new relative to the baseline
```

The baseline is not a line-number suppression list. Each violation is fingerprinted as a SHA-256 over its rule, its path, and a content discriminator: the offending line's text, or a rule-specific key, or the path alone for a whole-file rule. The line number is never part of the hash. Inserting or deleting unrelated lines does not churn the baseline; editing the offending line does, so a new problem cannot hide behind an old entry.

The file is JSON Lines: a header, then one sorted entry per grandfathered finding. That makes it merge-friendly and byte-for-byte reproducible on an unchanged tree. The `count` in each entry is a budget: identical findings collapse into one entry, and if the tree later holds more occurrences than recorded, the excess is reported as new.

Re-running `alint baseline` will not silently grandfather new debt. If the run would add a fingerprint or raise a count, it refuses to write and tells you to fix the problem or pass `--accept-new`. Pruning entries for findings you have fixed is always safe. `--strict-baseline` turns stale-entry warnings into a hard failure, so a baseline cannot quietly rot.

This is the ratchet: stop the bleeding now, pay the backlog down on your own schedule. It is the same way you would introduce a type checker to an untyped codebase.

## Where it runs

One config is only useful if it follows the work. alint runs in four places, and the report changes shape while the rules stay the same.

**Pull requests.** The official `asamarts/alint` GitHub Action wraps the install and the invocation into one step. By default it runs `alint check --format github`, which emits workflow commands that GitHub renders as inline annotations on the pull request. `alint check --changed` lints only the files the pull request touched. For Code Scanning, set `format: sarif` and upload the result; the SARIF carries stable `partialFingerprints`, so alerts are deduped across runs.

```yaml
name: lint
on: [pull_request]
permissions:
  contents: read
jobs:
  alint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1 # v7.0.1
      - uses: asamarts/alint@465e70c48ec13774c8cb3bb58856b58b71e3a93d # v0.23.0
        with:
          format: github
```

The action is pinned to a commit SHA, not a tag, because that is exactly the rule the `ci/github-actions` ruleset enforces. The Action runs on Linux and macOS runners only. On Windows, install alint in a `run:` step (`pip install alint`, `npm install -g @asamarts/alint`, or `cargo install alint`) and invoke it directly.

**Commits.** The `alint-pre-commit` mirror installs a prebuilt wheel, so the hook needs no Rust toolchain:

```yaml
repos:
  - repo: https://github.com/asamarts/alint-pre-commit
    rev: v0.23.0
    hooks:
      - id: alint
```

The `alint` hook checks every commit; `alint-fix` is registered under `stages: [manual]` because it mutates the working tree. Run it explicitly when you want the mechanical repairs.

**Editors.** `alint lsp` is a language server with diagnostics, hover-to-explain, and apply-fix code actions. There are marketplace extensions for VS Code and JetBrains, a source extension for Zed, and ready configs for Neovim, Sublime Text, Emacs, and Helix.

**Coding agents.** The `agent` output format carries a per-violation instruction and fix command. `alint export-agents-md` keeps the directives in `AGENTS.md` or `CLAUDE.md` in step with the rules alint enforces, so the agent and CI agree on the contract.

<figure class="alint-fig">
  <figcaption>
    <span class="card-tag">THE SURFACES // 02</span>
    <h3 class="alint-fig-title">One config, four surfaces</h3>
    <p class="alint-fig-sub">The same <code>.alint.yml</code> drives the pull request, the commit hook, the editor, and the coding agent. The report changes shape; the rules do not.</p>
  </figcaption>
  <div class="alint-scroll">
  <svg class="alint-svg" viewBox="0 0 840 360" role="img" aria-labelledby="alint-f2-title alint-f2-desc">
    <title id="alint-f2-title">Where alint runs</title>
    <desc id="alint-f2-desc">One .alint.yml feeds four surfaces: pull request annotations and SARIF, the pre-commit hook, the editor language server, and the coding agent output. The rules stay the same; the report format changes.</desc>
    <text x="24" y="18" class="f" font-size="7.5" letter-spacing="1.2">ONE CONFIG // FOUR SURFACES</text>
    <text x="816" y="18" class="f" font-size="7.5" text-anchor="end" letter-spacing="1">SAME RULES, DIFFERENT REPORT</text>
    <line x1="24" y1="26" x2="816" y2="26" class="rule"/>
    <rect x="48" y="48" width="220" height="72" class="box"/>
    <text x="60" y="68" class="f" font-size="7" letter-spacing="0.8">PULL REQUEST</text>
    <text x="60" y="92" class="t" font-size="9.4" font-weight="800">ANNOTATIONS · SARIF</text>
    <text x="60" y="108" class="m" font-size="6.8">alint check --changed</text>
    <rect x="572" y="48" width="220" height="72" class="box"/>
    <text x="584" y="68" class="f" font-size="7" letter-spacing="0.8">PRE-COMMIT</text>
    <text x="584" y="92" class="t" font-size="9.4" font-weight="800">CHECK EVERY COMMIT</text>
    <text x="584" y="108" class="m" font-size="6.8">alint · alint-fix</text>
    <rect x="48" y="240" width="220" height="72" class="box"/>
    <text x="60" y="260" class="f" font-size="7" letter-spacing="0.8">EDITOR</text>
    <text x="60" y="284" class="t" font-size="9.4" font-weight="800">LSP · CODE ACTIONS</text>
    <text x="60" y="300" class="m" font-size="6.8">diagnostics · hover-to-explain</text>
    <rect x="572" y="240" width="220" height="72" class="box"/>
    <text x="584" y="260" class="f" font-size="7" letter-spacing="0.8">CODING AGENT</text>
    <text x="584" y="284" class="t" font-size="9.4" font-weight="800">AGENT FORMAT</text>
    <text x="584" y="300" class="m" font-size="6.8">export-agents-md</text>
    <rect x="320" y="140" width="200" height="80" class="codebox"/>
    <text x="332" y="160" class="f" font-size="7" letter-spacing="0.8">CONFIG</text>
    <text x="332" y="184" class="t mono" font-size="10" font-weight="800">.ALINT.YML</text>
    <text x="332" y="200" class="m" font-size="6.8">extends + rules</text>
    <text x="332" y="214" class="f" font-size="6.2">baseline: .alint-baseline.json</text>
    <path d="M320 160 H268 V120" class="arrow" fill="none" marker-end="url(#alint-arrow)"/>
    <path d="M520 160 H572 V120" class="arrow" fill="none" marker-end="url(#alint-arrow)"/>
    <path d="M320 200 H268 V240" class="arrow" fill="none" marker-end="url(#alint-arrow)"/>
    <path d="M520 200 H572 V240" class="arrow" fill="none" marker-end="url(#alint-arrow)"/>
    <line x1="24" y1="328" x2="816" y2="328" class="dash"/>
    <text x="420" y="346" class="f" font-size="6.6" text-anchor="middle" letter-spacing="0.4">8 OUTPUT FORMATS · 13 SUBCOMMANDS · EXIT 0 CLEAN / 1 VIOLATIONS / 2 CONFIG / 3 INTERNAL</text>
  </svg>
  </div>
  <p class="alint-fig-src">PULL REQUEST · PRE-COMMIT · EDITOR · AGENT · ANY CI</p>
</figure>

The same config also runs in any CI: eight output formats cover human terminals, JSON consumers, SARIF, GitHub, Markdown, JUnit, GitLab, and agents. Exit codes are stable, and warnings do not fail the build unless you pass `--fail-on-warning`.

## What it is not

alint checks the shape and contents of a repository, not the semantics of the code inside it. It is deliberately not:

- a code or AST linter — use ESLint, Clippy, or Ruff;
- a SAST scanner — use Semgrep or CodeQL;
- an IaC scanner — use Checkov or Conftest;
- a full commit-message linter — use commitlint for conventional-commit grammars, scopes, and body/footer rules;
- a secret scanner — use gitleaks or TruffleHog.

It runs underneath those tools. The division is clean: they keep their rules on the code; alint keeps its rules on the filesystem.

A few practical caveats:

- **It is young.** v0.23.0 is three days old. Pin the binary, the Action, and the pre-commit `rev:`; read the changelog before upgrading.
- **Rulesets are non-blocking by default.** Bundled rulesets ship at `info` or `warning`, with `error` reserved for unambiguous bugs. Redeclare a rule id to make it blocking.
- **Fixes have tiers.** Review `alint fix --diff` before `--unsafe-fixes`; a deletion is not a whitespace fix.
- **The Action is Linux/macOS only.** Windows CI needs a direct install step.
- **Remote rulesets are a trust boundary.** HTTPS `extends:` must be SRI-pinned; process-spawning rules and custom facts from extended configs are rejected at load; content-injecting fixes from remote rulesets are demoted to suggestions unless trusted.
- **It does not see GitHub settings.** Branch protection, code review rules, and signed releases live outside the repository; use OpenSSF Scorecard for those.

## A five-minute start

1. Install the binary.

```bash
curl -fsSL https://alint.org/install.sh | bash
```

2. Let it detect your ecosystems, or write the three-line config yourself.

```bash
alint init
alint check
```

3. Preview the mechanical repairs, then apply the safe ones.

```bash
alint fix --dry-run
alint fix
```

4. Record the existing debt and gate the delta.

```bash
alint baseline
alint check --baseline .alint-baseline.json
```

5. Add the GitHub Action or the pre-commit hook, pinned to a release.

6. Try one local rule that your code linters cannot express: no focused tests, a required license field, a version that must match a sibling manifest.

The first run is the expensive one. After that, the repository has a shape that fails the build when it drifts.

## References

- [alint](https://alint.org/) — the project home, quickstart, and benchmark method.
- [asamarts/alint on GitHub](https://github.com/asamarts/alint) — source, releases, and the full README.
- [How alint works](https://alint.org/docs/concepts/start-here/how-alint-works/) — the config, walk, facts, scan, and report pipeline.
- [Rule reference](https://alint.org/docs/rules/) — all 104 kinds, with examples.
- [Bundled rulesets](https://alint.org/docs/bundled-rulesets/) — the 24 rulesets and their defaults.
- [Fixing](https://alint.org/docs/concepts/adoption/fixing/) — safe, unsafe, and suggestion tiers.
- [Baseline mode](https://alint.org/docs/concepts/adoption/baseline/) — fingerprints, counts, and the ratchet.
- [GitHub Actions](https://alint.org/docs/integrations/github-actions/) — inline annotations, SARIF, and SHA pinning.
- [pre-commit](https://alint.org/docs/integrations/pre-commit/) — the `alint` and `alint-fix` hooks.
- [How alint compares](https://alint.org/compare/) — Repolinter, ls-lint, actionlint, and the rest.
- [Repolinter](https://github.com/todogroup/repolinter) — the archived predecessor.
- [actionlint](https://github.com/rhysd/actionlint) — workflow semantics and ShellCheck integration.
- [OpenSSF Scorecard](https://github.com/ossf/scorecard) — repository settings outside the filesystem.

<style>
  .prose-inner .alint-lead {
    margin: 26px 0;
    padding: 20px 18px 16px;
    border: 0.7px solid var(--mono-grid);
    background: var(--mono-paper);
  }

  .prose-inner .alint-lead-head {
    margin-bottom: 14px;
  }

  .prose-inner .alint-lead-kicker {
    margin: 0 0 6px;
    font-size: 11.5px;
    line-height: 1.55;
    color: var(--mono-muted);
  }

  .prose-inner .alint-lead-title {
    margin: 0 0 4px;
    font-size: 20px;
    font-weight: 800;
    letter-spacing: -0.02em;
    line-height: 1.25;
    color: var(--mono-ink);
  }

  .prose-inner .alint-lead-sub {
    margin: 0 0 14px;
    font-size: 12px;
    line-height: 1.55;
    color: var(--mono-l2);
  }

  .prose-inner .alint-lead-grid {
    display: grid;
    grid-template-columns: 1fr 26px 1fr 26px 1fr;
    align-items: stretch;
    margin-bottom: 14px;
  }

  .prose-inner .alint-lead-card {
    display: flex;
    flex-direction: column;
    padding: 16px 14px 12px;
    border: 0.7px solid var(--mono-grid);
    background: var(--mono-paper);
  }

  .prose-inner .alint-lead-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 46px;
    height: 46px;
    margin-bottom: 12px;
    border: 0.7px solid var(--mono-grid);
    background: var(--mono-bg-subtle);
    color: var(--mono-ink);
  }

  .prose-inner .alint-lead-ico {
    display: block;
    width: 24px;
    height: 24px;
  }

  .prose-inner .alint-lead-tag {
    margin-bottom: 5px;
    font-family: var(--mono-font-mono);
    font-size: 8px;
    font-weight: 600;
    letter-spacing: 0.1em;
    color: var(--mono-muted);
  }

  .prose-inner .alint-lead-card h4 {
    margin: 0 0 5px;
    font-size: 14px;
    font-weight: 700;
    letter-spacing: -0.01em;
    line-height: 1.35;
    color: var(--mono-ink);
  }

  .prose-inner .alint-lead-card p {
    margin: 0 0 12px;
    font-size: 11.5px;
    line-height: 1.55;
    color: var(--mono-l2);
  }

  .prose-inner .alint-lead-card code {
    font-size: 0.9em;
  }

  .prose-inner .alint-lead-meta {
    margin-top: auto;
    padding-top: 8px;
    border-top: 0.7px solid var(--mono-grid);
    font-family: var(--mono-font-mono);
    font-size: 7.5px;
    font-weight: 600;
    letter-spacing: 0.05em;
    color: var(--mono-faint);
  }

  .prose-inner .alint-lead-arrow {
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: var(--mono-font-mono);
    font-size: 12px;
    color: var(--mono-faint);
  }

  .prose-inner .alint-lead-flow {
    margin-bottom: 12px;
  }

  .prose-inner .alint-lead-note {
    margin: 0;
    padding-top: 10px;
    border-top: 0.7px solid var(--mono-grid);
    font-size: 12px;
    line-height: 1.55;
    color: var(--mono-l2);
  }

  .prose-inner .alint-lead-note b {
    color: var(--mono-ink);
  }

  .prose-inner .alint-lead-bridge {
    margin: 0 0 6px;
    font-size: 11.5px;
    line-height: 1.55;
    color: var(--mono-muted);
  }

  .prose-inner .alint-fig {
    margin: 26px 0;
    padding: 20px 18px 14px;
    border: 0.7px solid var(--mono-grid);
    background: var(--mono-paper);
  }

  .prose-inner .alint-fig figcaption {
    margin-bottom: 14px;
  }

  .prose-inner .alint-fig-title {
    margin: 4px 0 3px;
    font-size: 15.5px;
    font-weight: 700;
    letter-spacing: -0.02em;
    line-height: 1.3;
    color: var(--mono-ink);
  }

  .prose-inner .alint-fig-sub {
    margin: 0;
    font-size: 11.5px;
    line-height: 1.55;
    color: var(--mono-muted);
  }

  .prose-inner .alint-fig-sub code {
    font-size: 0.9em;
  }

  .prose-inner .alint-fig-src {
    margin-top: 12px;
    padding-top: 8px;
    border-top: 0.7px solid var(--mono-grid);
    font-family: var(--mono-font-mono);
    font-size: 8.5px;
    font-weight: 600;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--mono-faint);
  }

  .prose-inner .alint-scroll {
    overflow-x: auto;
  }

  .prose-inner .alint-svg {
    display: block;
    width: 100%;
    height: auto;
  }

  .prose-inner .alint-svg text {
    font-family: var(--mono-font);
  }

  .prose-inner .alint-svg .t {
    fill: var(--mono-ink);
  }

  .prose-inner .alint-svg .m {
    fill: var(--mono-muted);
  }

  .prose-inner .alint-svg .f {
    fill: var(--mono-faint);
    font-family: var(--mono-font-mono);
  }

  .prose-inner .alint-svg .mono {
    font-family: var(--mono-font-mono);
  }

  .prose-inner .alint-svg .box {
    fill: var(--mono-paper);
    stroke: var(--mono-grid);
    stroke-width: 0.7;
  }

  .prose-inner .alint-svg .term {
    fill: var(--mono-bg-subtle);
    stroke: var(--mono-grid);
    stroke-width: 0.7;
  }

  .prose-inner .alint-svg .codebox {
    fill: var(--mono-bg-subtle);
    stroke: var(--mono-grid);
    stroke-width: 0.7;
  }

  .prose-inner .alint-svg .rule {
    stroke: var(--mono-grid);
    stroke-width: 0.7;
  }

  .prose-inner .alint-svg .rule-soft {
    stroke: var(--mono-grid);
    stroke-width: 0.5;
  }

  .prose-inner .alint-svg .dash {
    fill: none;
    stroke: var(--mono-l5);
    stroke-width: 0.7;
    stroke-dasharray: 2 3;
  }

  .prose-inner .alint-svg .arrow {
    fill: none;
    stroke: var(--mono-ink);
    stroke-width: 0.8;
  }

  @media (max-width: 700px) {
    .prose-inner .alint-lead-grid {
      grid-template-columns: 1fr;
    }

    .prose-inner .alint-lead-arrow {
      height: 22px;
      transform: rotate(90deg);
    }

    .prose-inner .alint-lead-title {
      font-size: 18px;
    }

    .prose-inner .alint-svg {
      min-width: 760px;
    }
  }
</style>
