---
title: "alint：为代码周围的仓库而生的检查器"
description: "代码检查器只看文件内部。alint 检查文件之外的形状——缺少的 README、没有固定版本的 Action、被提交的产物、对不上的版本——用一份 .alint.yml、一个静态二进制文件，让 CI、pre-commit 与编辑器看到相同结果。"
pubDate: 2026-11-25
category: "DevOps"
tags: ["alint", "静态检查", "GitHub Actions", "CI", "DevOps"]
featured: false
author: "Alex.Hsiao"
readTime: "14 分钟"
cardImage: "./cover.webp"
cardImageAlt: "alint 官方容器图：alint 内部的 CLI、LSP 服务器与开发工具，外围是 CI、编辑器与被检查的仓库。"
---

# alint：为代码周围的仓库而生的检查器

## 破口：文件很干净，仓库却在漂移

<section class="alint-lead">
  <div class="alint-lead-head">
    <span class="card-tag">仓库检查器 // 00</span>
    <p class="alint-lead-kicker">每个仓库都有一个它应该维持的形状。那个形状大多靠记忆在把关。</p>
    <h3 class="alint-lead-title">代码可以很干净，仓库却仍然是错的。</h3>
    <p class="alint-lead-sub">alint 检查的是文件、名称、配置值与文件之间的关系——这些都是代码检查器看不到的。</p>
  </div>
  <div class="alint-lead-grid">
    <div class="alint-lead-card">
      <div class="alint-lead-icon"><svg class="alint-lead-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="m10 13-2 2 2 2"/><path d="m14 17 2-2-2-2"/></svg></div>
      <div class="alint-lead-tag">代码 // 已检查</div>
      <h4>文件内部</h4>
      <p>ESLint、Clippy 与 Ruff 检查语法、类型与风格。它们只看到文件边界为止。</p>
      <div class="alint-lead-meta">语法 · 类型 · 风格</div>
    </div>
    <div class="alint-lead-arrow" aria-hidden="true">→</div>
    <div class="alint-lead-card">
      <div class="alint-lead-icon"><svg class="alint-lead-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 10a1 1 0 0 0 1-1V6a1 1 0 0 0-1-1h-2.5a1 1 0 0 1-.8-.4l-.9-1.2A1 1 0 0 0 15 3h-4a1 1 0 0 0-1 1v5a1 1 0 0 0 1 1Z"/><path d="M20 21a1 1 0 0 0 1-1v-3a1 1 0 0 0-1-1h-2.5a1 1 0 0 1-.8-.4l-.9-1.2a1 1 0 0 0-.8-.4H11a1 1 0 0 0-1 1v5a1 1 0 0 0 1 1Z"/><path d="M3 5a2 2 0 0 0 2 2h3"/><path d="M3 3v13a2 2 0 0 0 2 2h3"/></svg></div>
      <div class="alint-lead-tag">仓库 // 已漂移</div>
      <h4>文件之外的形状</h4>
      <p>一个 README、一个固定版本的 Action、一个必须对上的版本号。这些都住在审查者的记忆里。</p>
      <div class="alint-lead-meta">README · 版本固定 · 版本号</div>
    </div>
    <div class="alint-lead-arrow" aria-hidden="true">→</div>
    <div class="alint-lead-card">
      <div class="alint-lead-icon"><svg class="alint-lead-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 7V5a2 2 0 0 1 2-2h2"/><path d="M17 3h2a2 2 0 0 1 2 2v2"/><path d="M21 17v2a2 2 0 0 1-2 2h-2"/><path d="M7 21H5a2 2 0 0 1-2-2v-2"/><circle cx="12" cy="12" r="3"/><path d="m16 16-1.9-1.9"/></svg></div>
      <div class="alint-lead-tag">ALINT // 已强制</div>
      <h4>把形状写成规则</h4>
      <p>一份 <code>.alint.yml</code>、一个静态二进制文件。CI、pre-commit 与编辑器看到相同的结果。</p>
      <div class="alint-lead-meta">一份配置 · 一次扫描</div>
    </div>
  </div>
  <div class="alint-lead-flow alint-scroll">
  <svg class="alint-svg" viewBox="0 0 840 170" role="img" aria-labelledby="alint-lead-title alint-lead-desc">
    <title id="alint-lead-title">alint 流程一眼看尽</title>
    <desc id="alint-lead-desc">一个仓库由一份 .alint.yml 配置读取，一次扫描完成检查，输出成检查结果，然后被修复或用来把关 CI。</desc>
    <defs>
      <marker id="alint-arrow" viewBox="0 0 5 5" refX="4.4" refY="2.5" markerWidth="5" markerHeight="5" markerUnits="userSpaceOnUse" orient="auto"><path d="M0 0 L5 2.5 L0 5 z" fill="var(--mono-ink)"/></marker>
      <marker id="alint-arrow-muted" viewBox="0 0 5 5" refX="4.4" refY="2.5" markerWidth="5" markerHeight="5" markerUnits="userSpaceOnUse" orient="auto"><path d="M0 0 L5 2.5 L0 5 z" fill="var(--mono-l5)"/></marker>
    </defs>
    <text x="24" y="18" class="f" font-size="7.5" letter-spacing="1.2">一个仓库 // 一份配置 // 一次扫描</text>
    <text x="816" y="18" class="f" font-size="7.5" text-anchor="end" letter-spacing="1">ALINT 流程</text>
    <line x1="24" y1="26" x2="816" y2="26" class="rule"/>
    <rect x="24" y="44" width="128" height="72" class="term"/>
    <svg x="36" y="54" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--mono-ink)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10a1 1 0 0 0 1-1V6a1 1 0 0 0-1-1h-2.5a1 1 0 0 1-.8-.4l-.9-1.2A1 1 0 0 0 15 3h-4a1 1 0 0 0-1 1v5a1 1 0 0 0 1 1Z"/><path d="M20 21a1 1 0 0 0 1-1v-3a1 1 0 0 0-1-1h-2.5a1 1 0 0 1-.8-.4l-.9-1.2a1 1 0 0 0-.8-.4H11a1 1 0 0 0-1 1v5a1 1 0 0 0 1 1Z"/><path d="M3 5a2 2 0 0 0 2 2h3"/><path d="M3 3v13a2 2 0 0 0 2 2h3"/></svg>
    <text x="58" y="63" class="f" font-size="6.2" letter-spacing="0.6">仓库</text>
    <text x="36" y="88" class="t" font-size="9.5" font-weight="800" letter-spacing="-0.01em">大量文件</text>
    <text x="36" y="100" class="m" font-size="6.8">README · ci.yml</text>
    <text x="36" y="112" class="f" font-size="6.2">manifest · 语言文件</text>
    <line x1="156" y1="80" x2="186" y2="80" class="arrow" marker-end="url(#alint-arrow)"/>
    <rect x="190" y="44" width="128" height="72" class="box"/>
    <svg x="202" y="54" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--mono-ink)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M8 13h2"/><path d="M8 17h2"/><path d="M14 13h2"/><path d="M14 17h2"/></svg>
    <text x="224" y="63" class="f" font-size="6.2" letter-spacing="0.6">配置</text>
    <text x="202" y="88" class="t mono" font-size="9.2" font-weight="800">.ALINT.YML</text>
    <text x="202" y="100" class="m" font-size="6.8">一份配置</text>
    <text x="202" y="112" class="f" font-size="6.2">extends + 规则</text>
    <line x1="322" y1="80" x2="352" y2="80" class="arrow" marker-end="url(#alint-arrow)"/>
    <rect x="356" y="44" width="128" height="72" class="codebox"/>
    <svg x="368" y="54" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--mono-ink)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7V5a2 2 0 0 1 2-2h2"/><path d="M17 3h2a2 2 0 0 1 2 2v2"/><path d="M21 17v2a2 2 0 0 1-2 2h-2"/><path d="M7 21H5a2 2 0 0 1-2-2v-2"/><circle cx="12" cy="12" r="3"/><path d="m16 16-1.9-1.9"/></svg>
    <text x="390" y="63" class="f" font-size="6.2" letter-spacing="0.6">引擎</text>
    <text x="368" y="88" class="t" font-size="9.5" font-weight="800" letter-spacing="-0.01em">一次扫描</text>
    <text x="368" y="100" class="m" font-size="6.8">遍历 · 扫描</text>
    <text x="368" y="112" class="f" font-size="6.2">每个文件只读一次</text>
    <line x1="488" y1="80" x2="518" y2="80" class="arrow" marker-end="url(#alint-arrow)"/>
    <rect x="522" y="44" width="128" height="72" class="term"/>
    <svg x="534" y="54" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--mono-ink)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="m3 17 2 2 4-4"/><path d="m3 7 2 2 4-4"/><path d="M13 6h8"/><path d="M13 12h8"/><path d="M13 18h8"/></svg>
    <text x="556" y="63" class="f" font-size="6.2" letter-spacing="0.6">报告</text>
    <text x="534" y="88" class="t" font-size="9.5" font-weight="800" letter-spacing="-0.01em">检查结果</text>
    <text x="534" y="100" class="m" font-size="6.8">8 种格式</text>
    <text x="534" y="112" class="f" font-size="6.2">human · SARIF · agent</text>
    <line x1="654" y1="80" x2="684" y2="80" class="arrow" marker-end="url(#alint-arrow)"/>
    <rect x="688" y="44" width="128" height="72" class="box"/>
    <svg x="700" y="54" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--mono-ink)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>
    <text x="722" y="63" class="f" font-size="6.2" letter-spacing="0.6">出口</text>
    <text x="700" y="88" class="t" font-size="9.5" font-weight="800" letter-spacing="-0.01em">修复 / 把关</text>
    <text x="700" y="100" class="m" font-size="6.8">26 种修复</text>
    <text x="700" y="112" class="f" font-size="6.2">基线 · CI</text>
    <text x="420" y="150" class="f" font-size="6.6" text-anchor="middle" letter-spacing="0.6">相同规则会在 CI、PRE-COMMIT、编辑器与代理中执行</text>
  </svg>
  </div>
  <p class="alint-lead-note"><b>仓库不只是里面的代码。</b> alint 是把这句话说出来的检查器。</p>
</section>

<p class="alint-lead-bridge">接下来是这句话背后的机制：这个形状包含什么、一次扫描如何找到它，以及如何不用一次性大清理就能采用这个工具。</p>

一个代码检查器可以在一个仍然有问题的仓库上报告零个问题。

新包缺少 README。某个工作流跑的是 `actions/checkout@v4`，而不是 commit SHA。又有人把 `target/` 提交进去了。`package.json` 写着 `1.4.0`，`Cargo.toml` 还停在 `1.3.0`。这些都不是语法错误、类型错误或风格违规。它们是关于仓库的事实：哪些文件存在、叫什么名字、内容是什么，以及它们之间如何关联。

ESLint、Clippy 与 Ruff 一次读一个文件，问里面的代码是否有效。它们对「这个文件该不该存在」、「它的名字能不能跨平台」、「它的版本有没有跟隔壁的 manifest 对上」没有意见。这些规则通常住在审查者的脑袋里，或 `CONTRIBUTING.md` 的某一段。当一个拉取请求忽略它们时，没有任何东西会失败。

alint 的赌注是：这些规则值得和代码规则一样的待遇——一份声明式配置、一次确定性检查，以及一个退出码。

## alint 是什么

alint 自称「一个快速、通用的检查器」。这个修饰词很重要。它不是更快的 ESLint。它检查的是代码周围的仓库。

- 一个静态 Rust 二进制文件，Apache-2.0 或 MIT 双许可。
- 13 个规则家族、104 种规则类型，外加 11 个别名。
- 24 个内置规则集，编译进二进制文件，离线解析。
- 26 种修复操作，分成安全、不安全与建议三个层级。
- 8 种输出格式，包括 SARIF、GitHub 标注，以及给代理用的 JSON 报告。
- 执行路径上没有 Node、JVM 或 Python 执行环境；没有遥测；执行时不连网，除非你自己写了 `extends:` URL。

它接手 Repolinter 留下的位置——Repolinter 已于 2026 年 2 月归档——并且与代码检查器并肩运作，而不是取代它们。项目每次发布都会公布基准测试：10 万个文件约 1.5 秒，100 万个文件不到 20 秒。

这个工具很年轻。v0.23.0 在 2026 年 11 月 22 日发布；仓库本身则成立于 2026 年 4 月。这是把版本固定下来的理由，不是忽略它的理由。核心模型很小也很稳定：一份配置、一次遍历、一组规则、一份报告。

<figure class="fig">
  <img src="/images/alint-repo-linter/alint-execution-pipeline.webp" alt="alint 官方执行流程图：依次横跨 Developer、alint、alint-dsl、alint-core、alint-rules 与 alint-output，从步骤 1（alint check）到步骤 10（报告并退出）。" width="1600" height="810" loading="lazy" />
  <figcaption><b>官方图解</b> — <code>alint check</code> 的执行流程：从加载配置与 <code>extends:</code> 信任边界，经过单次遍历、分派、聚合，到输出。来源：<a href="https://alint.org/docs/about/architecture-diagrams/">alint docs — Architecture diagrams</a></figcaption>
</figure>

## 一条规则是三件事

配置放在仓库根目录的 `.alint.yml`。最短的有用版本只采用一个内置规则集：

```yaml
version: 1
extends:
  - alint://bundled/oss-baseline@v1
```

`extends:` 用来组合规则集。规则集可以是内置的（编译进二进制文件，以 `alint://bundled/<name>@v1` 寻址）、本地文件，或是以 SHA-256 哈希固定的 HTTPS URL。alint 会解析它们、做循环检查，并按规则 `id` 逐层合并字段。你自己的规则叠在最上面；你可以重新声明某个规则的 id 来覆盖严重程度，或把它关掉。

一条规则是三件事：

1. **一个类型。** 要执行的检查，例如 `file_exists`、`filename_case` 或 `pair`。
2. **路径。** 它应用的文件或 glob。
3. **一个严重程度。** `error`、`warning`、`info` 或 `off`。

规则还可以带一个 `when:` 条件（只在默认分支执行，或只在某个文件存在时执行）以及一个 `fix:` 操作。

以下配置采用两个规则集，并加入一条本地规则：

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

第一个规则集涵盖开源项目的基本要求：一个 README、一个许可证、没有合并冲突标记。第二个强化 GitHub Actions：把第三方 Action 固定到完整的 commit SHA、声明只读的令牌、让每个工作流都有名字。第三条是本地且具体的：不要在拉取请求里留下 focused test。

规则模型刻意无聊。热路径上没有插件 API、没有动态加载的代码、没有逐语言的执行环境。引擎、规则、格式化器与语言服务器都是同一个二进制文件。当内置类型都不合适时，一个需要明确启用的 `command` 类型可以执行你原本就信任的工具，并把它的退出码变成违规。那是逃生通道，不是基础。

## 它看得见什么

104 种规则类型分成几个层面。完整列表在规则参考里；真正重要的是分类：

| 层面 | 它抓到什么 | 规则类型示例 |
| :--- | :--- | :--- |
| 文件与结构 | 缺少 README 或许可证；被提交的 `target/`；太深的目录；太大的文件 | `file_exists`、`file_absent`、`file_max_size` |
| 名称与内容 | 大小写错误的模块；缺少许可证头；合并冲突标记；行尾空白 | `filename_case`、`file_header`、`file_content_forbidden` |
| 配置值 | 没有许可证字段的 `package.json`；没有 `permissions:` 的工作流；不是 semver 的版本 | `json_path_matches`、`yaml_path_absent`、`json_schema_passes` |
| 跨文件关系 | 每个包都有 README；每个 `.proto` 都有生成的绑定；每个语言都有参考键；没有导入循环 | `every_matching_has`、`pair`、`key_parity`、`file_graph` |
| 安全与编码 | 没有固定版本的 Action；Trojan-Source 双向控制字符；零宽字符；字节顺序标记 | `pinned_references`、`no_bidi_controls` |
| Git 与元数据 | 违反惯例的提交主旨；缺少签名；无法在 checkout 后保留的文件模式 | `git_commit_message`、`pair_changed_together` |

跨文件那一列是大多数工具没有的部分。代码检查器只看一个文件。文件系统检查器可以看到整棵树，这意味着它可以断言关系：`pair` 说每个 `.proto` 都有一个生成的绑定；`key_parity` 说每个语言文件都声明了与参考文件相同的键；`file_graph` 说导入图没有循环；`generated_file_fresh` 说签入的生成文件仍然与它的来源相符。

结构化查询也在这里。alint 可以读 JSON、YAML、TOML、XML、dotenv、INI、`.properties` 与 HCL，用 RFC 9535 JSONPath 查询，并断言某个值、匹配某个模式、禁止某个键，或按 JSON Schema 验证整个文件。规则可以要求每个 `package.json` 都有 `license`、每个内部 crate 都有 `publish = false`，或每个工作流都使用只读令牌。

以下是一条检查语言键一致性的跨文件规则：

```yaml
version: 1
rules:
  - id: locales-match-english
    kind: key_parity
    reference: locales/en.json
    peers: "locales/*.json"
    level: error
```

如果 `locales/fr.json` 缺少 `nav.about`，规则会报告这个键，而不是值。如果每个语言都声明了参考键集，规则就通过。没有脚本、没有临时测试、没有审查者的记忆。

## 一份配置，一次遍历，一份报告

执行模型是 alint 快的原因，而且简单到可以放在脑子里。

1. **组装配置。** alint 找到 `.alint.yml`，解析每个 `extends:` 来源，缓存、做循环检查，并按规则 id 逐层合并字段。这里也是信任边界：从 `extends:` 进来的进程启动规则或自定义事实会在加载时被拒绝，所以采用别人的规则集不会让你的机器执行他们的命令。
2. **把仓库遍历一次。** 遍历是并行的，遵守 `.gitignore`、`.ignore`、git 排除规则与你自己的 `ignore:` glob，并建立一个确定性、排序过的 `FileIndex`。排序是输出可复现的原因：同一棵树每次都产生逐字节相同的输出。
3. **事实只算一次。** 你声明的任何 `facts:` 都只针对这份索引评估一次。接着检查每条规则的 `when:` 表达式，条件为假的规则会在扫描文件之前被丢弃。在一个只有 Rust 的仓库里列出 Rust、Node、Python 与 Go 规则集，几乎不花成本。
4. **每个文件只扫一次。** 逐文件规则以文件为主：alint 每个匹配文件的字节最多读取一次，并把这一次读取交给所有应用的规则。跨文件规则以规则为主：每条规则扫描整份索引，断言任何单一文件无法断言的关系。两类规则都跨核心并行执行。
5. **合并与输出。** 违规会被合并、重新排序，并以选定的格式呈现。程序以 `0` 表示干净、`1` 表示有违规、`2` 表示配置错误、`3` 表示内部错误。

设计目标是一份配置、一次扫描、一份报告。加入更多逐文件规则几乎不改变成本，因为文件已经在内存里。昂贵的是跨文件规则，而它们的数量比较少。

<figure class="alint-fig">
  <figcaption>
    <span class="card-tag">流程 // 01</span>
    <h3 class="alint-fig-title">一份配置，一次遍历，一份报告</h3>
    <p class="alint-fig-sub">alint 组出有效配置、把仓库索引一次、依 <code>when:</code> 过滤规则、每个文件最多读一次，然后输出单一报告。</p>
  </figcaption>
  <div class="alint-scroll">
  <svg class="alint-svg" viewBox="0 0 840 330" role="img" aria-labelledby="alint-f1-title alint-f1-desc">
    <title id="alint-f1-title">alint 的执行流程</title>
    <desc id="alint-f1-desc">五个阶段：从 .alint.yml 与其 extends 组装配置、把仓库遍历成排序索引、评估事实并依 when 过滤规则、用逐文件与跨文件规则各扫描一次，最后合并报告并回传退出码。</desc>
    <text x="24" y="18" class="f" font-size="7.5" letter-spacing="1.2">流程 // 从配置到退出码</text>
    <text x="816" y="18" class="f" font-size="7.5" text-anchor="end" letter-spacing="1">一次扫描 · 确定性输出</text>
    <line x1="24" y1="26" x2="816" y2="26" class="rule"/>
    <rect x="36" y="56" width="136" height="120" class="term"/>
    <text x="48" y="78" class="f" font-size="7" letter-spacing="0.8">01 · 配置</text>
    <text x="48" y="106" class="t mono" font-size="9.4" font-weight="800">.ALINT.YML</text>
    <text x="48" y="124" class="m" font-size="6.8">extends:</text>
    <text x="48" y="138" class="m" font-size="6.8">依 id 合并</text>
    <text x="48" y="152" class="f" font-size="6.2">信任闸门</text>
    <line x1="172" y1="116" x2="190" y2="116" class="arrow" marker-end="url(#alint-arrow)"/>
    <rect x="194" y="56" width="136" height="120" class="box"/>
    <text x="206" y="78" class="f" font-size="7" letter-spacing="0.8">02 · 遍历</text>
    <text x="206" y="106" class="t" font-size="9.4" font-weight="800">一次扫描</text>
    <text x="206" y="124" class="m" font-size="6.8">.gitignore</text>
    <text x="206" y="138" class="m" font-size="6.8">排序索引</text>
    <text x="206" y="152" class="f" font-size="6.2">并行</text>
    <line x1="330" y1="116" x2="348" y2="116" class="arrow" marker-end="url(#alint-arrow)"/>
    <rect x="352" y="56" width="136" height="120" class="box"/>
    <text x="364" y="78" class="f" font-size="7" letter-spacing="0.8">03 · 事实</text>
    <text x="364" y="106" class="t" font-size="9.4" font-weight="800">事实只算一次</text>
    <text x="364" y="124" class="m" font-size="6.8">when:</text>
    <text x="364" y="138" class="m" font-size="6.8">先剔除规则</text>
    <text x="364" y="152" class="f" font-size="6.2">扫描之前</text>
    <line x1="488" y1="116" x2="506" y2="116" class="arrow" marker-end="url(#alint-arrow)"/>
    <rect x="510" y="56" width="136" height="120" class="codebox"/>
    <text x="522" y="78" class="f" font-size="7" letter-spacing="0.8">04 · 扫描</text>
    <text x="522" y="106" class="t" font-size="9.4" font-weight="800">只读一次</text>
    <text x="522" y="124" class="m" font-size="6.8">逐文件</text>
    <text x="522" y="138" class="m" font-size="6.8">跨文件</text>
    <text x="522" y="152" class="f" font-size="6.2">跨核心并行</text>
    <line x1="646" y1="116" x2="664" y2="116" class="arrow" marker-end="url(#alint-arrow)"/>
    <rect x="668" y="56" width="136" height="120" class="term"/>
    <text x="680" y="78" class="f" font-size="7" letter-spacing="0.8">05 · 报告</text>
    <text x="680" y="106" class="t" font-size="9.4" font-weight="800">合并</text>
    <text x="680" y="124" class="m" font-size="6.8">8 formats</text>
    <text x="680" y="138" class="m" font-size="6.8">退出码 0/1/2/3</text>
    <text x="680" y="152" class="f" font-size="6.2">一份报告</text>
    <rect x="36" y="200" width="768" height="48" class="term"/>
    <text x="48" y="220" class="t mono" font-size="7.2" font-weight="700">每个文件只读一次 → 所有匹配的规则</text>
    <text x="792" y="220" class="m mono" font-size="7.2" text-anchor="end">跨文件规则扫描同一份索引</text>
    <line x1="36" y1="270" x2="804" y2="270" class="dash"/>
    <text x="36" y="292" class="f" font-size="6.8">确定性输出 · CI、PRE-COMMIT、编辑器与代理看到相同结果</text>
    <text x="36" y="312" class="f" font-size="6.8">配置信任边界：来自 extends 的 command 规则会在加载时被拒绝</text>
  </svg>
  </div>
  <p class="alint-fig-src">配置 → 遍历 → 事实 → 扫描 → 报告</p>
</figure>

## 修复机械性的，暴露需要判断的

一个只会报告的检查器，是会被关掉的检查器。alint 可以就地修复 26 种违规，但它把机械性的问题与有意义的问题分开。

- **安全修复**会在单纯的 `alint fix` 时应用：空白与换行规范、行尾、头部位置、排序标记区块、重新缩进。
- **不安全修复**会改变意义或移除内容，所以要等 `alint fix --unsafe-fixes`：删除文件、正则表达式替换、把已提交的产物从 git 索引移除。
- **建议**只会被报告，永远不会写入，用于没有机械修复方式的违规。

用 `alint fix --dry-run` 预览，或用 `alint fix --diff` 看确切编辑。alint 会在内存里批处理一个文件的编辑、每个文件只写一次，并重跑到树不再变动为止；超过 1 MiB 的文件会被跳过，而不是被重写。

修复器里也有一条信任规则。因为 `extends:` 可以从 URL 拉取规则集，来自远程或嵌套规则集、会注入内容或把内容指向远程的修复，会降级为建议，除非你把该来源列在 `trusted_extends:`。会调用 shell 的修复，除了你自己的顶层配置之外，一律拒绝。重点是：共享规则集可以建议修复，但不能默默改写你的仓库。

## 不用一次性大清理也能采用

在一个已经成形的仓库里打开结构检查器，会遇到先有鸡还是先有蛋的问题：第一次执行会报告几千个不是当前拉取请求造成的违规。alint 的答案是基线模式。

```bash
alint baseline
# 写出 .alint-baseline.json；把它提交

alint check --baseline .alint-baseline.json
# 只对相对于基线的新问题失败
```

基线不是行号抑制列表。每个违规都会被指纹化：对规则、路径与一个内容判别项做 SHA-256。内容判别项可能是违规行的文本、规则特定的键，或整个文件规则的路径。行号永远不是哈希的一部分。插入或删除无关的行不会让基线震荡；编辑违规的那一行则会，所以新问题不能躲在旧条目后面。

文件是 JSON Lines：第一行是头部，接着每个被纳入基线的检查结果一行，排序过。这让它容易合并，而且在树没变时可以逐字节复现。每个条目里的 `count` 是预算：相同的检查结果会收敛成一个条目，如果树后来出现比记录更多的次数，多出来的部分会以新问题报告。

重新执行 `alint baseline` 不会默默把新债纳入。如果这次执行会新增指纹或提高计数，它会拒绝写入，并告诉你要么修复问题，要么加上 `--accept-new`。修剪你已经修好的条目永远安全。`--strict-baseline` 会把过期条目的警告变成硬失败，所以基线不会悄悄腐烂。

这就是棘轮：现在先止血，待办列表照自己的步调慢慢还。这和你把类型检查器引进一个没有类型的代码库是同一个做法。

## 它在哪里执行

一份配置只有在能跟着工作跑时才有用。alint 在四个地方执行，报告改变形状，规则不变。

**拉取请求。** 官方的 `asamarts/alint` GitHub Action 把安装与调用包成一步。默认它执行 `alint check --format github`，输出 GitHub 会渲染成拉取请求行内标注的工作流命令。`alint check --changed` 只检查拉取请求碰过的文件。要进 Code Scanning，设 `format: sarif` 并上传结果；SARIF 带有稳定的 `partialFingerprints`，所以告警会跨执行去重。

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

这个 Action 固定在 commit SHA，而不是标签，因为那正是 `ci/github-actions` 规则集所强制的。Action 只在 Linux 与 macOS runner 上执行。在 Windows 上，请在 `run:` 步骤安装 alint（`pip install alint`、`npm install -g @asamarts/alint` 或 `cargo install alint`），然后直接调用它。

**提交。** `alint-pre-commit` 镜像会安装预构建的 wheel，所以钩子不需要 Rust 工具链：

```yaml
repos:
  - repo: https://github.com/asamarts/alint-pre-commit
    rev: v0.23.0
    hooks:
      - id: alint
```

`alint` 钩子会检查每次提交；`alint-fix` 注册在 `stages: [manual]` 下面，因为它会改动工作树。想要机械性修复时再显式执行它。

**编辑器。** `alint lsp` 是一个语言服务器，提供诊断、悬停说明与应用修复的代码操作。VS Code 与 JetBrains 有市场扩展，Zed 有源码扩展，Neovim、Sublime Text、Emacs 与 Helix 也有现成配置。

**编码代理。** `agent` 输出格式会带着每个违规的指示与修复命令。`alint export-agents-md` 会让 `AGENTS.md` 或 `CLAUDE.md` 里的指示与 alint 强制的规则保持同步，所以代理与 CI 对同一份契约有共识。

<figure class="alint-fig">
  <figcaption>
    <span class="card-tag">接触面 // 02</span>
    <h3 class="alint-fig-title">一份配置，四个接触面</h3>
    <p class="alint-fig-sub">同一份 <code>.alint.yml</code> 驱动拉取请求、提交钩子、编辑器与编码代理。报告改变形状，规则不变。</p>
  </figcaption>
  <div class="alint-scroll">
  <svg class="alint-svg" viewBox="0 0 840 360" role="img" aria-labelledby="alint-f2-title alint-f2-desc">
    <title id="alint-f2-title">alint 在哪里执行</title>
    <desc id="alint-f2-desc">一份 .alint.yml 喂给四个接触面：拉取请求标注与 SARIF、pre-commit 钩子、编辑器语言服务器，以及编码代理输出。规则不变，报告格式改变。</desc>
    <text x="24" y="18" class="f" font-size="7.5" letter-spacing="1.2">一份配置 // 四个接触面</text>
    <text x="816" y="18" class="f" font-size="7.5" text-anchor="end" letter-spacing="1">相同规则，不同报告</text>
    <line x1="24" y1="26" x2="816" y2="26" class="rule"/>
    <rect x="48" y="48" width="220" height="72" class="box"/>
    <text x="60" y="68" class="f" font-size="7" letter-spacing="0.8">拉取请求</text>
    <text x="60" y="92" class="t" font-size="9.4" font-weight="800">标注 · SARIF</text>
    <text x="60" y="108" class="m" font-size="6.8">alint check --changed</text>
    <rect x="572" y="48" width="220" height="72" class="box"/>
    <text x="584" y="68" class="f" font-size="7" letter-spacing="0.8">PRE-COMMIT</text>
    <text x="584" y="92" class="t" font-size="9.4" font-weight="800">每次提交都检查</text>
    <text x="584" y="108" class="m" font-size="6.8">alint · alint-fix</text>
    <rect x="48" y="240" width="220" height="72" class="box"/>
    <text x="60" y="260" class="f" font-size="7" letter-spacing="0.8">编辑器</text>
    <text x="60" y="284" class="t" font-size="9.4" font-weight="800">LSP · 代码操作</text>
    <text x="60" y="300" class="m" font-size="6.8">诊断 · 悬停说明</text>
    <rect x="572" y="240" width="220" height="72" class="box"/>
    <text x="584" y="260" class="f" font-size="7" letter-spacing="0.8">编码代理</text>
    <text x="584" y="284" class="t" font-size="9.4" font-weight="800">代理格式</text>
    <text x="584" y="300" class="m" font-size="6.8">export-agents-md</text>
    <rect x="320" y="140" width="200" height="80" class="codebox"/>
    <text x="332" y="160" class="f" font-size="7" letter-spacing="0.8">配置</text>
    <text x="332" y="184" class="t mono" font-size="10" font-weight="800">.ALINT.YML</text>
    <text x="332" y="200" class="m" font-size="6.8">extends + 规则</text>
    <text x="332" y="214" class="f" font-size="6.2">baseline: .alint-baseline.json</text>
    <path d="M320 160 H268 V120" class="arrow" fill="none" marker-end="url(#alint-arrow)"/>
    <path d="M520 160 H572 V120" class="arrow" fill="none" marker-end="url(#alint-arrow)"/>
    <path d="M320 200 H268 V240" class="arrow" fill="none" marker-end="url(#alint-arrow)"/>
    <path d="M520 200 H572 V240" class="arrow" fill="none" marker-end="url(#alint-arrow)"/>
    <line x1="24" y1="328" x2="816" y2="328" class="dash"/>
    <text x="420" y="346" class="f" font-size="6.6" text-anchor="middle" letter-spacing="0.4">8 种输出格式 · 13 个子命令 · 退出码 0 干净 / 1 违规 / 2 配置错误 / 3 内部错误</text>
  </svg>
  </div>
  <p class="alint-fig-src">拉取请求 · PRE-COMMIT · 编辑器 · 代理 · 任何 CI</p>
</figure>

同一份配置也可以在任何 CI 里执行：八种输出格式涵盖人类终端、JSON 消费者、SARIF、GitHub、Markdown、JUnit、GitLab 与代理。退出码稳定，警告默认不会让构建失败，除非你加上 `--fail-on-warning`。

## 它不是什么

alint 检查的是仓库的形状与内容，不是里面代码的语义。它刻意不是：

- 代码或 AST 检查器——请用 ESLint、Clippy 或 Ruff；
- SAST 扫描器——请用 Semgrep 或 CodeQL；
- IaC 扫描器——请用 Checkov 或 Conftest；
- 完整的提交信息检查器——conventional commit 的语法、scope 与 body/footer 规则请用 commitlint；
- 机密扫描器——请用 gitleaks 或 TruffleHog。

它在这些工具下面执行。分工很干净：它们把规则放在代码上；alint 把规则放在文件系统上。

几个实践上的提醒：

- **它很年轻。** v0.23.0 才三天大。把二进制文件、Action 与 pre-commit 的 `rev:` 固定下来；升级前先读 changelog。
- **规则集默认不阻挡。** 内置规则集以 `info` 或 `warning` 发布，`error` 只留给没有歧义的 bug。重新声明规则 id 就能让它变成阻挡。
- **修复有层级。** 在 `--unsafe-fixes` 之前先看 `alint fix --diff`；删除文件不是空白修复。
- **Action 只支持 Linux/macOS。** Windows CI 需要直接安装的步骤。
- **远程规则集是信任边界。** HTTPS 的 `extends:` 必须有 SRI 固定；来自扩充配置的进程启动规则与自定义事实会在加载时被拒绝；来自远程规则集、会注入内容的修复会降级为建议，除非你信任它。
- **它看不到 GitHub 配置。** 分支保护、代码审查规则与签名发布都在仓库之外；请用 OpenSSF Scorecard。

## 五分钟开始

1. 安装二进制文件。

```bash
curl -fsSL https://alint.org/install.sh | bash
```

2. 让它检测你的生态系统，或自己写三行配置。

```bash
alint init
alint check
```

3. 预览机械性修复，然后应用安全的部分。

```bash
alint fix --dry-run
alint fix
```

4. 记录既有债务，只对增量把关。

```bash
alint baseline
alint check --baseline .alint-baseline.json
```

5. 加入 GitHub Action 或 pre-commit 钩子，固定在一个发布版本上。

6. 试一条你的代码检查器表达不了的本地规则：不要 focused test、要求许可证字段、版本必须跟隔壁 manifest 对上。

第一次执行是最贵的。之后，仓库就有了一个会在漂移时让构建失败的形状。

## 参考资料

- [alint](https://alint.org/) — 项目首页、快速开始与基准测试方法。
- [asamarts/alint on GitHub](https://github.com/asamarts/alint) — 源码、发布与完整 README。
- [How alint works](https://alint.org/docs/concepts/start-here/how-alint-works/) — 配置、遍历、事实、扫描与报告的流程。
- [Rule reference](https://alint.org/docs/rules/) — 全部 104 种规则类型与示例。
- [Bundled rulesets](https://alint.org/docs/bundled-rulesets/) — 24 个规则集与它们的默认值。
- [Fixing](https://alint.org/docs/concepts/adoption/fixing/) — 安全、不安全与建议层级。
- [Baseline mode](https://alint.org/docs/concepts/adoption/baseline/) — 指纹、计数与棘轮。
- [GitHub Actions](https://alint.org/docs/integrations/github-actions/) — 行内标注、SARIF 与 SHA 固定。
- [pre-commit](https://alint.org/docs/integrations/pre-commit/) — `alint` 与 `alint-fix` 钩子。
- [How alint compares](https://alint.org/compare/) — Repolinter、ls-lint、actionlint 与其他工具。
- [Repolinter](https://github.com/todogroup/repolinter) — 已归档的前身。
- [actionlint](https://github.com/rhysd/actionlint) — 工作流语义与 ShellCheck 整合。
- [OpenSSF Scorecard](https://github.com/ossf/scorecard) — 文件系统之外的仓库配置。


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
