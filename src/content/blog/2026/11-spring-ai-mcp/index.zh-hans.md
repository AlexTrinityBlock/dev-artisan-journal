---
title: "Spring AI MCP：把 Java 服务变成 AI 的工具接口"
description: "Spring AI 2.1 把选定的 Spring Bean 变成 MCP 工具。这篇说明服务器模型、两条注解路径、传输选择、安全边界，以及让 Java MCP 服务器无法使用的常见错误。"
pubDate: 2026-11-25
category: "AI"
tags: ["Spring AI", "MCP", "Java", "Spring Boot", "AI 代理"]
featured: false
author: "Alex.Hsiao"
readTime: "14 分钟"
cardImage: "./cover.webp"
cardImageAlt: "Spring AI 的 Java MCP 服务器架构，比较 SSE 与 stdio 传输"
---

# Spring AI MCP：把 Java 服务变成 AI 的工具接口

## MCP 解决的集成难题

Java 服务早就包含最难的部分：交易、验证、授权，以及数据库边界。它缺的不是能力，而是一个能让 AI 主机发现的形式。

在 MCP 出现之前，每个集成都得单独定制。你得为每个主机写 REST 端点、OpenAPI 文档、function calling 的 schema，再补一套验证与授权机制。换一个主机，全部再来一次；换一个服务，也是再来一次。集成矩阵的大小是「主机 × 服务」，而其中大部分胶水代码都不是业务逻辑。

Model Context Protocol 把这个矩阵收敛成一条线。主机连上服务器，询问它能做什么，然后调用找到的工具。传输协议是 JSON-RPC 2.0，原语是工具、资源与提示。同一个服务器可以服务桌面助理、IDE 代理与自定义编排器，不必为每一种主机重写适配层。

<section class="mfig-lead">
  <div class="mfig-lead-head">
    <span class="card-tag">SPRING AI MCP // 00</span>
    <p class="mfig-lead-kicker">Java 服务早就具备逻辑，MCP 给它一个 AI 主机看得懂的形式。</p>
    <h3 class="mfig-lead-title">工具调用是最简单的部分，契约才是真正的工作。</h3>
    <p class="mfig-lead-sub">Spring AI 2.1 把选定的 Spring Bean 变成 MCP 工具：一个服务器、一份 schema、一种传输。</p>
  </div>
  <div class="mfig-lead-grid">
    <div class="mfig-card">
      <div class="mfig-icon"><svg class="mfig-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10 2v2"/><path d="M14 2v2"/><path d="M16 8a1 1 0 0 1 1 1v8a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V9a1 1 0 0 1 1-1h14a4 4 0 1 1 0 8h-1"/><path d="M6 2v2"/></svg></div>
      <div class="mfig-tag">JAVA // SERVICE</div>
      <h4>业务逻辑原本就住在这里</h4>
      <p>交易、验证、授权与数据库边界。</p>
      <div class="mfig-meta">SPRING BOOT · BEANS · TX</div>
    </div>
    <div class="mfig-arrow" aria-hidden="true">→</div>
    <div class="mfig-card">
      <div class="mfig-icon"><svg class="mfig-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 22v-5"/><path d="M9 8V2"/><path d="M15 8V2"/><path d="M18 8v5a4 4 0 0 1-4 4h-4a4 4 0 0 1-4-4V8Z"/></svg></div>
      <div class="mfig-tag">MCP // CONTRACT</div>
      <h4>是工具，不是端点</h4>
      <p>主机在运行时发现名称、描述与 JSON Schema。</p>
      <div class="mfig-meta">TOOLS · RESOURCES · PROMPTS</div>
    </div>
    <div class="mfig-arrow" aria-hidden="true">→</div>
    <div class="mfig-card">
      <div class="mfig-icon"><svg class="mfig-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/></svg></div>
      <div class="mfig-tag">AI // CLIENT</div>
      <h4>一套协议，多种主机</h4>
      <p>Claude、IDE 代理与自定义客户端调用同一个服务器。</p>
      <div class="mfig-meta">STDIO · HTTP · MODERN</div>
    </div>
  </div>
  <div class="mfig-lead-flow mfig-scroll">
  <svg class="mfig-svg" viewBox="0 0 840 170" role="img" aria-labelledby="sai-lead-title sai-lead-desc">
    <title id="sai-lead-title">Spring AI MCP 的路径</title>
    <desc id="sai-lead-desc">Spring Boot 服务把加上注解的方法暴露成 MCP 工具，MCP 服务器发布它的 JSON Schema，AI 主机通过 JSON-RPC 发现并调用，结果再回到模型。</desc>
    <defs>
      <marker id="sai-arrow" viewBox="0 0 5 5" refX="4.4" refY="2.5" markerWidth="5" markerHeight="5" markerUnits="userSpaceOnUse" orient="auto"><path d="M0 0 L5 2.5 L0 5 z" fill="var(--mono-ink)"/></marker>
    </defs>
    <text x="24" y="18" class="f" font-size="7.5" letter-spacing="1.2">一个服务器 // 一份 SCHEMA // 多个主机</text>
    <text x="816" y="18" class="f" font-size="7.5" text-anchor="end" letter-spacing="1">MCP 路径</text>
    <line x1="24" y1="26" x2="816" y2="26" class="rule"/>
    <rect x="24" y="44" width="118" height="72" class="term"/>
    <svg x="34" y="54" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--mono-ink)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M10 2v2"/><path d="M14 2v2"/><path d="M16 8a1 1 0 0 1 1 1v8a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V9a1 1 0 0 1 1-1h14a4 4 0 1 1 0 8h-1"/><path d="M6 2v2"/></svg>
    <text x="52" y="64" class="f" font-size="6.2" letter-spacing="0.6">服务</text>
    <text x="34" y="88" class="t" font-size="9.5" font-weight="800">SPRING BOOT</text>
    <text x="34" y="100" class="m" font-size="6.8">Bean + 方法</text>
    <text x="34" y="112" class="f" font-size="6.2">交易边界</text>
    <line x1="144" y1="80" x2="160" y2="80" class="arrow" marker-end="url(#sai-arrow)"/>
    <rect x="162" y="44" width="118" height="72" class="codebox"/>
    <svg x="172" y="54" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--mono-ink)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>
    <text x="190" y="64" class="f" font-size="6.2" letter-spacing="0.6">注解</text>
    <text x="172" y="88" class="t mono" font-size="9.2" font-weight="800">@McpTool</text>
    <text x="172" y="100" class="m" font-size="6.8">名称 + schema</text>
    <text x="172" y="112" class="f" font-size="6.2">描述很重要</text>
    <line x1="282" y1="80" x2="298" y2="80" class="arrow" marker-end="url(#sai-arrow)"/>
    <rect x="300" y="44" width="118" height="72" class="box"/>
    <svg x="310" y="54" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--mono-ink)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="8" x="2" y="2" rx="2" ry="2"/><rect width="20" height="8" x="2" y="14" rx="2" ry="2"/><line x1="6" x2="6.01" y1="6" y2="6"/><line x1="6" x2="6.01" y1="18" y2="18"/></svg>
    <text x="328" y="64" class="f" font-size="6.2" letter-spacing="0.6">服务器</text>
    <text x="310" y="88" class="t" font-size="9.5" font-weight="800">MCP 服务器</text>
    <text x="310" y="100" class="m" font-size="6.8">tools/list</text>
    <text x="310" y="112" class="f" font-size="6.2">tools/call</text>
    <line x1="420" y1="80" x2="436" y2="80" class="arrow" marker-end="url(#sai-arrow)"/>
    <rect x="438" y="44" width="118" height="72" class="term"/>
    <svg x="448" y="54" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--mono-ink)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"/></svg>
    <text x="466" y="64" class="f" font-size="6.2" letter-spacing="0.6">协议</text>
    <text x="448" y="88" class="t" font-size="9.5" font-weight="800">JSON-RPC 2.0</text>
    <text x="448" y="100" class="m" font-size="6.8">stdio 或 HTTP</text>
    <text x="448" y="112" class="f" font-size="6.2">无状态或会话</text>
    <line x1="558" y1="80" x2="574" y2="80" class="arrow" marker-end="url(#sai-arrow)"/>
    <rect x="576" y="44" width="118" height="72" class="box"/>
    <svg x="586" y="54" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--mono-ink)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/></svg>
    <text x="604" y="64" class="f" font-size="6.2" letter-spacing="0.6">主机</text>
    <text x="586" y="88" class="t" font-size="9.5" font-weight="800">AI 客户端</text>
    <text x="586" y="100" class="m" font-size="6.8">模型选择</text>
    <text x="586" y="112" class="f" font-size="6.2">claude · ide · 自定义</text>
    <line x1="696" y1="80" x2="712" y2="80" class="arrow" marker-end="url(#sai-arrow)"/>
    <rect x="714" y="44" width="118" height="72" class="term"/>
    <svg x="724" y="54" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--mono-ink)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
    <text x="742" y="64" class="f" font-size="6.2" letter-spacing="0.6">返回</text>
    <text x="724" y="88" class="t" font-size="9.5" font-weight="800">结果</text>
    <text x="724" y="100" class="m" font-size="6.8">文本或 JSON</text>
    <text x="724" y="112" class="f" font-size="6.2">模型读取</text>
    <text x="420" y="150" class="f" font-size="6.6" text-anchor="middle" letter-spacing="0.6">MCP 不会让服务变聪明 · 它让服务可以被调用</text>
  </svg>
  </div>
  <p class="mfig-lead-note"><b>MCP 不会让服务变聪明。</b>它让服务可以被调用，而且附上一份模型读得懂的契约。</p>
</section>

<p class="mfig-bridge">Spring AI 2.1 是目前 Java 生态的实现。接下来要谈的是它提供什么、两条注解路径有何差异，以及边界应该划在哪里。</p>

## Spring AI 2.1 究竟提供什么

目前这条版本线很好确认：

| 组件 | 版本 | 日期 |
| :--- | :--- | :--- |
| Spring AI | 2.1.0 GA | 2026 年 11 月 20 日 |
| Spring Boot | 4.2.0 GA | 2026 年 11 月 19 日 |
| MCP Java SDK | 2.2.0 | 2026 年 11 月 16 日 |
| Java 基准版本 | 17 | — |

Spring AI 2.1.0 构建在 Boot 4.2 上，版本说明建议两者一起升级。如果你还停在 Boot 4.0.x 或 4.1.x，请留在 Spring AI 2.0.x，等 Boot 升级完成再说。不要混用不同版本的 Boot 与 Spring AI，再指望 BOM 会自动搞定。

MCP 相关的 artifact 都位于 `org.springframework.ai` 下，由 `spring-ai-bom:2.1.0` 管理：

| 角色 | Artifact |
| :--- | :--- |
| 以 stdio 运行的 MCP 服务器 | `spring-ai-starter-mcp-server` |
| 以 Spring MVC 运行的 MCP 服务器 | `spring-ai-starter-mcp-server-webmvc` |
| 以 WebFlux 运行的 MCP 服务器 | `spring-ai-starter-mcp-server-webflux` |
| 以 JDK HttpClient 运行的 MCP 客户端 | `spring-ai-starter-mcp-client` |
| 以 WebFlux 运行的 MCP 客户端 | `spring-ai-starter-mcp-client-webflux` |

服务器 starter 会自动配置服务器、传输，以及工具、资源与提示的注册。客户端 starter 则会为每个命名连接自动配置一个 `McpSyncClient` 或 `McpAsyncClient`，另外提供一个 `ToolCallbackProvider`，让 `ChatClient` 可以使用远程工具。

如果要提供 HTTP 服务器，WebMVC starter 是最短路径：它运行在团队已经在运维的 Servlet 技术栈上。若服务的其他部分都是响应式，WebFlux starter 更合适。单纯的 server starter 则是给 stdio 用的。

## 两条注解路径，为什么不能混为一谈

这是 Java 团队最容易迷路的第一站。Spring AI 有两套注解，看起来可以互换，实际上不行。

**路径一：`@Tool` 加一个 provider。**`@Tool` 与 `@ToolParam` 来自 `org.springframework.ai.tool.annotation`。它们描述一个方法，但不会把它注册到 MCP 服务器。你必须声明 `ToolCallbackProvider`（通常是 `MethodToolCallbackProvider`）才能把方法暴露出去：

```java
@Bean
ToolCallbackProvider orderTools(OrderService orders) {
    return MethodToolCallbackProvider.builder()
        .toolObjects(orders)
        .build();
}
```

MCP 服务器的自动配置会收集 `ToolCallback` Bean、由它们组成的 List，以及 `ToolCallbackProvider` Bean。这座桥梁才让 `@Tool` 方法被看见。

**路径二：把 `@McpTool` 放在 Spring Bean 上。**`@McpTool`、`@McpToolParam`、`@McpResource`、`@McpPrompt` 与 `@McpComplete` 来自 `org.springframework.ai.mcp.annotation`。注解扫描器会直接在 Spring Bean 上找到它们，不需要 provider Bean：

```java
@Service
public class OrderTools {
    public record Order(String id, String status) {}

    @McpTool(name = "find_order", description = "Find an order by id",
             generateOutputSchema = true)
    public Order findOrder(
        @McpToolParam(description = "Order id, e.g. A-1001", required = true)
        String orderId) {
        return new Order(orderId, "SHIPPED");
    }
}
```

两条路径最后都会生成同样的 `ToolCallback` 契约，差别在于由谁负责注册。`@Tool` 需要 provider；`@McpTool` 靠扫描。混用注解——例如把 `@McpTool` 配上 `@ToolParam`——是文档陷阱，不是支持的组合。

<figure class="mfig-fig">
  <figcaption>
    <span class="card-tag">两条路径 // 01</span>
    <h3 class="mfig-fig-title">同一份契约，不同的注册方式</h3>
    <p class="mfig-fig-sub"><code>@Tool</code> 需要一个 <code>ToolCallbackProvider</code>；<code>@McpTool</code> 则是由 Bean 扫描而来。两者最后都归入同一份工具清单。</p>
  </figcaption>
  <div class="mfig-scroll">
  <svg class="mfig-svg" viewBox="0 0 840 340" role="img" aria-labelledby="sai-f1-title sai-f1-desc">
    <title id="sai-f1-title">Spring AI 的两条注解路径</title>
    <desc id="sai-f1-desc">@Tool 路径经过 MethodToolCallbackProvider；@McpTool 路径经过注解扫描器。两者都生成 ToolCallback 条目，再由 MCP 服务器发布给 AI 主机。</desc>
    <text x="24" y="18" class="f" font-size="7.5" letter-spacing="1.2">两条注解路径 // 一份工具契约</text>
    <text x="816" y="18" class="f" font-size="7.5" text-anchor="end" letter-spacing="1">SPRING AI 2.1</text>
    <line x1="24" y1="26" x2="816" y2="26" class="rule"/>
    <rect x="48" y="52" width="200" height="64" class="term"/>
    <text x="60" y="70" class="f" font-size="6.8" letter-spacing="0.7">SPRING AI 工具</text>
    <text x="60" y="90" class="t mono" font-size="10" font-weight="800">@Tool</text>
    <text x="60" y="104" class="m" font-size="6.6">只有注解 — 尚未注册</text>
    <line x1="148" y1="116" x2="148" y2="150" class="arrow" marker-end="url(#sai-f1-arrow)"/>
    <rect x="48" y="152" width="200" height="64" class="box"/>
    <text x="60" y="170" class="f" font-size="6.8" letter-spacing="0.7">桥接</text>
    <text x="60" y="190" class="t mono" font-size="8.4" font-weight="800">MethodToolCallbackProvider</text>
    <text x="60" y="204" class="m" font-size="6.6">声明成 Bean</text>
    <rect x="620" y="52" width="200" height="64" class="term"/>
    <text x="632" y="70" class="f" font-size="6.8" letter-spacing="0.7">MCP 注解</text>
    <text x="632" y="90" class="t mono" font-size="10" font-weight="800">@McpTool</text>
    <text x="632" y="104" class="m" font-size="6.6">必须放在 Spring Bean 上</text>
    <line x1="720" y1="116" x2="720" y2="150" class="arrow" marker-end="url(#sai-f1-arrow)"/>
    <rect x="620" y="152" width="200" height="64" class="box"/>
    <text x="632" y="170" class="f" font-size="6.8" letter-spacing="0.7">扫描器</text>
    <text x="632" y="190" class="t" font-size="9" font-weight="800">注解扫描</text>
    <text x="632" y="204" class="m" font-size="6.6">默认启用</text>
    <line x1="248" y1="184" x2="346" y2="184" class="arrow" marker-end="url(#sai-f1-arrow)"/>
    <line x1="620" y1="184" x2="522" y2="184" class="arrow" marker-end="url(#sai-f1-arrow)"/>
    <rect x="348" y="152" width="172" height="64" class="codebox"/>
    <text x="360" y="170" class="f" font-size="6.8" letter-spacing="0.7">契约</text>
    <text x="360" y="190" class="t" font-size="9.2" font-weight="800">ToolCallback</text>
    <text x="360" y="204" class="m" font-size="6.6">名称 · 描述 · schema</text>
    <line x1="434" y1="216" x2="434" y2="244" class="arrow" marker-end="url(#sai-f1-arrow)"/>
    <rect x="330" y="246" width="208" height="48" class="box"/>
    <text x="344" y="266" class="f" font-size="6.6" letter-spacing="0.7">发布</text>
    <text x="344" y="284" class="t" font-size="8.8" font-weight="800">MCP 服务器 · tools/list</text>
    <line x1="538" y1="270" x2="618" y2="270" class="arrow" marker-end="url(#sai-f1-arrow)"/>
    <rect x="620" y="246" width="180" height="48" class="term"/>
    <text x="632" y="266" class="f" font-size="6.6" letter-spacing="0.7">发现</text>
    <text x="632" y="284" class="t" font-size="8.8" font-weight="800">AI 主机</text>
    <text x="24" y="328" class="f" font-size="6.2">@ToolPARAM 与 @McpToolPARAM 是不同的注解 · 请用符合该路径的那一个</text>
  </svg>
  </div>
  <p class="mfig-fig-src">@TOOL + PROVIDER · @McpTool + SCANNER · 同一个 TOOLCALLBACK</p>
</figure>

## 一个最小服务器

一个可用的 HTTP 服务器，最短版本只需要一个依赖、三个属性和一个 Bean。

```xml
<dependencyManagement>
  <dependencies>
    <dependency>
      <groupId>org.springframework.ai</groupId>
      <artifactId>spring-ai-bom</artifactId>
      <version>2.1.0</version>
      <type>pom</type>
      <scope>import</scope>
    </dependency>
  </dependencies>
</dependencyManagement>

<dependencies>
  <dependency>
    <groupId>org.springframework.ai</groupId>
    <artifactId>spring-ai-starter-mcp-server-webmvc</artifactId>
  </dependency>
</dependencies>
```

```yaml
spring:
  ai:
    mcp:
      server:
        name: order-tools
        version: 1.0.0
        protocol: STREAMABLE   # default in 2.1; endpoint is /mcp
        type: SYNC
```

```java
@Service
public class OrderTools {
    public record Order(String id, String status) {}

    @McpTool(name = "find_order", description = "Find an order by id",
             generateOutputSchema = true)
    public Order findOrder(
        @McpToolParam(description = "Order id, e.g. A-1001", required = true)
        String orderId) {
        return new Order(orderId, "SHIPPED");
    }
}
```

运行 `./mvnw spring-boot:run`，端点就在 `http://localhost:8080/mcp`。

客户端这边，配置文件为连接命名，`ToolCallbackProvider` 就会提供给 `ChatClient` 使用：

```yaml
spring:
  ai:
    mcp:
      client:
        type: SYNC
        streamable-http:
          connections:
            orders:
              url: http://localhost:8080
```

```java
@Bean
CommandLineRunner demo(ChatClient.Builder builder, ToolCallbackProvider mcpTools) {
    return args -> System.out.println(builder.build()
        .prompt("Where is order A-1001?")
        .tools(mcpTools)
        .call()
        .content());
}
```

客户端仍然需要模型 starter 与凭证。MCP 客户端只负责提供工具。

## 模型实际看到什么

模型看不到你的 Java 方法。它看到的是工具名称、描述，以及根据参数类型生成的 JSON Schema。那才是真正的提示接口，值得用面向用户 API 的标准来审视。

有三个细节要注意：

- **名称就是标识符。** 保持简短、稳定、以动词开头：`find_order`，而不是 `orderServiceFindOrderById`。MCP 客户端实际上会把名称上限设为 64 个字符，而重复名称在两条路径上的处理方式不同。
- **描述就是指令。**「按 id 查找订单」这样的描述，比「按公开 id 查找订单；若不知道 id，先调用 list_orders」要弱。后者告诉模型何时该用这个工具，以及做不到时该怎么办。
- **返回结构就是上下文。** `String` 会以文本返回；对象会序列化成 JSON 文本。`@McpTool(generateOutputSchema = true)` 会为非基本类型的返回值生成 `structuredContent`。若需要完整控制，返回 `McpSchema.CallToolResult`，自行设置文本、结构化内容与 `isError`。

错误也是契约的一部分。使用 `@McpTool` 时，`RuntimeException` 会变成模型看得见的错误结果；受检异常或 `Error` 则会向上抛出，让整个调用失败。从 2.1.0 起，服务器传输不再把异常消息放进协议层的错误响应；这对防止泄露是好事，对调试却不友好，除非你刻意留下记录。

## 传输：stdio 或 Streamable HTTP

<figure class="fig">
  <img src="/images/spring-ai-mcp/java-mcp-server-architecture.webp" alt="Spring AI 的 Java MCP 服务器架构：SSE 客户端共用一个服务器进程与 Web 容器；每个 stdio 客户端则各自在同一个进程里启动 Java MCP 服务器与后端。" width="1600" height="1179" loading="lazy" />
  <figcaption><b>官方图示</b> — Spring AI 的 Java MCP 服务器架构。左半：HTTP/SSE 客户端共用一个服务器进程与 Web 容器。右半：每个 stdio 客户端各自启动一个 Java MCP 服务器与后端应用。传输方式决定的是进程与信任边界，不只是线上格式；Spring AI 2.1 的服务器默认则是 Streamable HTTP。来源：<a href="https://docs.spring.io/spring-ai/reference/api/mcp/mcp-overview.html">Spring AI — MCP overview</a></figcaption>
</figure>

MCP 有两种真正重要的传输。

**stdio** 是一个子进程，JSON-RPC 走 stdin 与 stdout。对会启动本机服务器的桌面主机来说，这是正确选择。它同时也是一条信任边界：客户端会用用户的操作系统权限运行配置中的命令。请把 `command`、`args` 与 `env` 当成代码对待。锁定版本、使用绝对路径、通过环境变量传递敏感信息，并把进程放进沙箱。还有，保持 stdout 干净：Spring Boot 默认把日志写到 stdout，会污染 JSON-RPC 数据流。把 `logging.pattern.console=` 设为空值，日志改写到文件或 stderr。

**Streamable HTTP** 只有一个端点，通常是 `/mcp`；每条消息都是一次 HTTP POST，回复则是 JSON 或针对该请求打开的 SSE 数据流。对放在网关后面的共享服务器来说，这是正确选择。较旧的 HTTP+SSE 传输属于遗留方案；服务器端的 SSE 已弃用。Spring AI 2.1 的服务器默认就是 `STREAMABLE`。

2026-07-28 版的 MCP 修订加入无状态模式：没有 `initialize` 握手，每个请求都自行携带协议版本与客户端能力，服务器发起的交互则变成多轮往返请求。Spring AI 2.1 以 `protocol: MODERN` 支持这个模式。有状态的 Streamable HTTP 仍然使用 `Mcp-Session-Id`；若放在负载均衡器后面，请改用粘性会话，或设置 `protocol: STATELESS`。不要拿旧版客户端去连新版服务器，或反过来，然后期待发现会成功。

## 安全要从工具之前开始

服务器 starter 不涉及验证机制。默认的 HTTP 端点是开放的，默认的传输安全验证器则是空操作：不检查 `Origin` 与 `Host`。即使是 localhost 上的服务器，这也有 DNS 重绑定的风险。

通过传输 builder 加入验证器：

```java
@Bean
McpServerCustomizer<WebMvcStreamableServerTransportProvider.Builder> transportSecurity() {
    return builder -> builder.securityValidator(
        DefaultServerTransportSecurityValidator.builder()
            .allowedOrigin("http://localhost:3000")
            .allowedHost("localhost:8080")
            .build());
}
```

接着决定身份模型。MCP 的授权模型是 OAuth 2.1：服务器是资源服务器，会发布受保护资源的元数据，令牌必须绑定受众，而且禁止令牌透传。若是内部服务对服务的集成，API 密钥可以是合理的部署选择，但它不在规格的 OAuth 模型之内。不要把它叫做「MCP 验证」，就假设自己继承了规格提供的保证。

不论用什么机制，授权要按工具区分，不能只按连接区分。只读的 `find_order` 不该与 `cancel_order` 共享同一份权限。按调用者与工具分别限流。关掉用不到的能力（`resources`、`prompts`、`completions`），并设置 `spring.ai.mcp.server.expose-mcp-client-tools=false`，除非你刻意想让服务器把每个下游客户端工具重新暴露出去。

## 测试与运维

Inspector 是查看「模型看到什么」最快的方式：

```bash
npx @modelcontextprotocol/inspector \
  --server-url http://localhost:8080/mcp --transport http
```

单元测试时，直接调用工具对象。若要测试 schema 生成与 JSON 转换，创建 provider 并调用 callback：

```java
ToolCallback callback = MethodToolCallbackProvider.builder()
    .toolObjects(new OrderTools())
    .build()
    .getToolCallbacks()[0];

var result = callback.call("{\"orderId\":\"A-1001\"}", new ToolContext(Map.of()));
```

集成测试时，让应用在随机端口启动，用 SDK 连上，断言 `listTools()` 包含该名称，然后实际调用。这能捕捉到单元测试抓不到的传输层连接问题。

运维方面，SDK 会在 `io.modelcontextprotocol` 下以 `DEBUG` 级别记录 JSON-RPC，但不附带任何指标或追踪。Spring AI 的工具观测涵盖的是 `ChatClient` 循环，不是 MCP 服务器调用；若需要延迟与错误率，就需要自己为工具方法添加观测。starter 里没有 MCP 专属的健康指示器；用一个合成的 `tools/list` 探测，会比单纯的 HTTP 200 更能确认就绪状态。

## 常见陷阱

- **`@Tool` 没有 provider 就等于不存在。** 方法能通过编译、Bean 能启动，工具清单却是空的。
- **SYNC 与 ASYNC 不能混用。** 同步服务器会忽略返回 `Mono` 的工具；异步服务器会忽略阻塞式工具。启动时不会报错。
- **注解家族不能混用。** `@McpTool` 配 `@ToolParam` 不是支持的组合。
- **重复名称的处理方式因路径而异：有时默默解决，有时直接失败。** 请选用唯一且稳定的名称，并测试 `tools/list`。
- **stdio 搭配控制台日志会污染数据流。** 这是最常见的「服务器连上了，但什么都不动」故障。
- **过大的输出就是上下文。** 返回 2 MB 的 JSON 文档对模型没有帮助；请分页、摘要，或返回一个 handle。
- **异常消息可能泄露。** 详细内容记录在服务器端，返回给模型的是稳定的错误码。
- **客户端会话是共享的。** 自动配置的 MCP 客户端是应用作用域的单例；MCP 会话不是按用户隔离的安全边界。
- **版本漂移是真实存在的。** 锁定 Spring AI BOM，不要独立覆盖 MCP SDK，并让 Boot 与 Spring AI 维持在兼容的版本线。

## 五分钟上手

1. 引入 `spring-ai-bom:2.1.0`，加入 `spring-ai-starter-mcp-server-webmvc`。
2. 在一个 Spring Bean 上写一个 `@McpTool`，描述要说明何时该调用它。
3. 设置 `spring.ai.mcp.server.name`、`version` 与 `protocol: STREAMABLE`。
4. 启动应用程序，把 Inspector 指向 `/mcp`。
5. 在开放给 localhost 以外的范围之前，加上传输安全验证器与真正的身份验证。
6. 在同一个 commit 里锁定 BOM 与 Boot 版本线。

第一个工具很简单。真正决定服务器能不能被代理使用、或者只是占着一个端口的，是契约——名称、描述、schema、错误、传输与身份。

## 参考资料

- [Spring AI MCP 总览](https://docs.spring.io/spring-ai/reference/api/mcp/mcp-overview.html) — 原语、传输与架构。
- [MCP 服务器 starter](https://docs.spring.io/spring-ai/reference/api/mcp/mcp-server-boot-starter-docs.html) — artifact、属性与自动配置。
- [MCP 客户端 starter](https://docs.spring.io/spring-ai/reference/api/mcp/mcp-client-boot-starter-docs.html) — 连接与 `ToolCallbackProvider`。
- [MCP 服务器注解](https://docs.spring.io/spring-ai/reference/api/mcp/mcp-annotations-server.html) — `@McpTool`、`@McpResource`、`@McpPrompt`。
- [Spring AI 2.1.0 发布公告](https://spring.io/blog/2026/11/20/spring-ai-2-1-0-GA-available-now) — Boot 4.2 基准与版本说明。
- [MCP 规格 2026-07-28](https://modelcontextprotocol.io/specification/2026-07-28) — 无状态修订。
- [MCP 传输](https://modelcontextprotocol.io/specification/2026-07-28/basic/transports) — stdio 与 Streamable HTTP。
- [MCP 授权](https://modelcontextprotocol.io/specification/2026-07-28/basic/authorization) — OAuth 2.1 资源服务器模型。
- [MCP 安全最佳实践](https://modelcontextprotocol.io/specification/2026-07-28/basic/security_best_practices) — 混淆代理、令牌直通与会话风险。
- [MCP Inspector](https://modelcontextprotocol.io/docs/tools/inspector) — 参考测试客户端。
- [MCP Java SDK](https://github.com/modelcontextprotocol/java-sdk) — 版本与传输实现。
