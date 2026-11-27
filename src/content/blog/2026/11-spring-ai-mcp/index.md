---
title: "Spring AI MCP: Turning a Java Service into an AI Tool Surface"
description: "Spring AI 2.1 turns selected Spring beans into MCP tools. Here is the server model, the two annotation routes, the transport choice, the security boundary, and the mistakes that make a Java MCP server unusable."
pubDate: 2026-11-25
category: "AI"
tags: ["Spring AI", "MCP", "Java", "Spring Boot", "AI Agents"]
featured: false
author: "Alex.Hsiao"
readTime: "14 min read"
cardImage: "./cover.webp"
cardImageAlt: "Spring AI Java MCP server architecture for SSE and stdio transports"
---

# Spring AI MCP: Turning a Java Service into an AI Tool Surface

## The integration problem MCP solves

A Java service already contains the hard part: transactions, validation, authorization, and the database boundary. What it does not contain is a shape an AI host can discover.

Before MCP, every integration was bespoke. You wrote a REST endpoint, an OpenAPI document, a function-calling schema, and an auth story for each host. Then you did it again for the next host, and again for the next service. The matrix grows as hosts × services, and most of the glue is not business logic.

The Model Context Protocol collapses that matrix. A host connects to a server, asks what it can do, and calls the tools it finds. The transport is JSON-RPC 2.0. The primitives are tools, resources, and prompts. The same server can serve a desktop assistant, an IDE agent, and a custom orchestrator without a new adapter for each.

<section class="mfig-lead">
  <div class="mfig-lead-head">
    <span class="card-tag">SPRING AI MCP // 00</span>
    <p class="mfig-lead-kicker">A Java service already has the logic. MCP gives it a shape an AI host can discover.</p>
    <h3 class="mfig-lead-title">The tool call is the easy part. The contract is the work.</h3>
    <p class="mfig-lead-sub">Spring AI 2.1 turns selected Spring beans into MCP tools: one server, one schema, one transport.</p>
  </div>
  <div class="mfig-lead-grid">
    <div class="mfig-card">
      <div class="mfig-icon"><svg class="mfig-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10 2v2"/><path d="M14 2v2"/><path d="M16 8a1 1 0 0 1 1 1v8a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V9a1 1 0 0 1 1-1h14a4 4 0 1 1 0 8h-1"/><path d="M6 2v2"/></svg></div>
      <div class="mfig-tag">JAVA // SERVICE</div>
      <h4>Business logic already lives here</h4>
      <p>Transactions, validation, authorization, and the database boundary.</p>
      <div class="mfig-meta">SPRING BOOT · BEANS · TX</div>
    </div>
    <div class="mfig-arrow" aria-hidden="true">→</div>
    <div class="mfig-card">
      <div class="mfig-icon"><svg class="mfig-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 22v-5"/><path d="M9 8V2"/><path d="M15 8V2"/><path d="M18 8v5a4 4 0 0 1-4 4h-4a4 4 0 0 1-4-4V8Z"/></svg></div>
      <div class="mfig-tag">MCP // CONTRACT</div>
      <h4>Tools, not endpoints</h4>
      <p>The host discovers names, descriptions, and JSON Schema at runtime.</p>
      <div class="mfig-meta">TOOLS · RESOURCES · PROMPTS</div>
    </div>
    <div class="mfig-arrow" aria-hidden="true">→</div>
    <div class="mfig-card">
      <div class="mfig-icon"><svg class="mfig-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/></svg></div>
      <div class="mfig-tag">AI // CLIENT</div>
      <h4>One protocol, many hosts</h4>
      <p>Claude, IDE agents, and custom clients call the same server.</p>
      <div class="mfig-meta">STDIO · HTTP · MODERN</div>
    </div>
  </div>
  <div class="mfig-lead-flow mfig-scroll">
  <svg class="mfig-svg" viewBox="0 0 840 170" role="img" aria-labelledby="sai-lead-title sai-lead-desc">
    <title id="sai-lead-title">The Spring AI MCP path</title>
    <desc id="sai-lead-desc">A Spring Boot service exposes an annotated method as an MCP tool, the MCP server publishes its JSON Schema, an AI host discovers and calls it over JSON-RPC, and the result returns to the model.</desc>
    <defs>
      <marker id="sai-arrow" viewBox="0 0 5 5" refX="4.4" refY="2.5" markerWidth="5" markerHeight="5" markerUnits="userSpaceOnUse" orient="auto"><path d="M0 0 L5 2.5 L0 5 z" fill="var(--mono-ink)"/></marker>
    </defs>
    <text x="24" y="18" class="f" font-size="7.5" letter-spacing="1.2">ONE SERVER // ONE SCHEMA // MANY HOSTS</text>
    <text x="816" y="18" class="f" font-size="7.5" text-anchor="end" letter-spacing="1">THE MCP PATH</text>
    <line x1="24" y1="26" x2="816" y2="26" class="rule"/>
    <rect x="24" y="44" width="118" height="72" class="term"/>
    <svg x="34" y="54" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--mono-ink)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M10 2v2"/><path d="M14 2v2"/><path d="M16 8a1 1 0 0 1 1 1v8a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V9a1 1 0 0 1 1-1h14a4 4 0 1 1 0 8h-1"/><path d="M6 2v2"/></svg>
    <text x="52" y="64" class="f" font-size="6.2" letter-spacing="0.6">SERVICE</text>
    <text x="34" y="88" class="t" font-size="9.5" font-weight="800">SPRING BOOT</text>
    <text x="34" y="100" class="m" font-size="6.8">bean + method</text>
    <text x="34" y="112" class="f" font-size="6.2">transaction boundary</text>
    <line x1="144" y1="80" x2="160" y2="80" class="arrow" marker-end="url(#sai-arrow)"/>
    <rect x="162" y="44" width="118" height="72" class="codebox"/>
    <svg x="172" y="54" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--mono-ink)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>
    <text x="190" y="64" class="f" font-size="6.2" letter-spacing="0.6">ANNOTATION</text>
    <text x="172" y="88" class="t mono" font-size="9.2" font-weight="800">@McpTool</text>
    <text x="172" y="100" class="m" font-size="6.8">name + schema</text>
    <text x="172" y="112" class="f" font-size="6.2">description matters</text>
    <line x1="282" y1="80" x2="298" y2="80" class="arrow" marker-end="url(#sai-arrow)"/>
    <rect x="300" y="44" width="118" height="72" class="box"/>
    <svg x="310" y="54" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--mono-ink)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="8" x="2" y="2" rx="2" ry="2"/><rect width="20" height="8" x="2" y="14" rx="2" ry="2"/><line x1="6" x2="6.01" y1="6" y2="6"/><line x1="6" x2="6.01" y1="18" y2="18"/></svg>
    <text x="328" y="64" class="f" font-size="6.2" letter-spacing="0.6">SERVER</text>
    <text x="310" y="88" class="t" font-size="9.5" font-weight="800">MCP SERVER</text>
    <text x="310" y="100" class="m" font-size="6.8">tools/list</text>
    <text x="310" y="112" class="f" font-size="6.2">tools/call</text>
    <line x1="420" y1="80" x2="436" y2="80" class="arrow" marker-end="url(#sai-arrow)"/>
    <rect x="438" y="44" width="118" height="72" class="term"/>
    <svg x="448" y="54" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--mono-ink)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"/></svg>
    <text x="466" y="64" class="f" font-size="6.2" letter-spacing="0.6">PROTOCOL</text>
    <text x="448" y="88" class="t" font-size="9.5" font-weight="800">JSON-RPC 2.0</text>
    <text x="448" y="100" class="m" font-size="6.8">stdio or HTTP</text>
    <text x="448" y="112" class="f" font-size="6.2">stateless or session</text>
    <line x1="558" y1="80" x2="574" y2="80" class="arrow" marker-end="url(#sai-arrow)"/>
    <rect x="576" y="44" width="118" height="72" class="box"/>
    <svg x="586" y="54" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--mono-ink)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/></svg>
    <text x="604" y="64" class="f" font-size="6.2" letter-spacing="0.6">HOST</text>
    <text x="586" y="88" class="t" font-size="9.5" font-weight="800">AI CLIENT</text>
    <text x="586" y="100" class="m" font-size="6.8">model chooses</text>
    <text x="586" y="112" class="f" font-size="6.2">claude · ide · custom</text>
    <line x1="696" y1="80" x2="712" y2="80" class="arrow" marker-end="url(#sai-arrow)"/>
    <rect x="714" y="44" width="118" height="72" class="term"/>
    <svg x="724" y="54" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--mono-ink)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
    <text x="742" y="64" class="f" font-size="6.2" letter-spacing="0.6">RETURN</text>
    <text x="724" y="88" class="t" font-size="9.5" font-weight="800">RESULT</text>
    <text x="724" y="100" class="m" font-size="6.8">text or JSON</text>
    <text x="724" y="112" class="f" font-size="6.2">model reads it</text>
    <text x="420" y="150" class="f" font-size="6.6" text-anchor="middle" letter-spacing="0.6">MCP DOES NOT MAKE A SERVICE INTELLIGENT · IT MAKES THE SERVICE CALLABLE</text>
  </svg>
  </div>
  <p class="mfig-lead-note"><b>MCP does not make a service intelligent.</b> It makes the service callable, with a contract the model can read.</p>
</section>

<p class="mfig-bridge">Spring AI 2.1 is the current Java implementation. The rest of this article is what it provides, how the two annotation routes differ, and where the boundary should sit.</p>

<figure class="fig">
  <img src="/images/spring-ai-mcp/java-mcp-server-architecture.webp" alt="Spring AI Java MCP server architecture: SSE clients share one server process and web container, while each stdio client launches its own Java MCP server and backend in a single process." width="1600" height="1179" loading="lazy" />
  <figcaption><b>Official diagram</b> — Spring AI's Java MCP server architecture. Left: HTTP/SSE clients share one server process and web container. Right: each stdio client launches its own Java MCP server and backend in a single process. The transport fixes the process and trust boundary, not just the wire format; Spring AI 2.1 defaults the server to Streamable HTTP. Source: <a href="https://docs.spring.io/spring-ai/reference/api/mcp/mcp-overview.html">Spring AI — MCP overview</a></figcaption>
</figure>

## What Spring AI 2.1 actually provides

The current line is easy to pin:

| Component | Version | Date |
| :--- | :--- | :--- |
| Spring AI | 2.1.0 GA | 20 Nov 2026 |
| Spring Boot | 4.2.0 GA | 19 Nov 2026 |
| MCP Java SDK | 2.2.0 | 16 Nov 2026 |
| Java baseline | 17 | — |

Spring AI 2.1.0 is built on Boot 4.2 and the release notes say to upgrade both together. If you are still on Boot 4.0.x or 4.1.x, stay on Spring AI 2.0.x until the Boot upgrade is done. Do not mix a Boot line and a Spring AI line and hope the BOM sorts it out.

The MCP artifacts are under `org.springframework.ai` and managed by `spring-ai-bom:2.1.0`:

| Role | Artifact |
| :--- | :--- |
| MCP server over stdio | `spring-ai-starter-mcp-server` |
| MCP server over Spring MVC | `spring-ai-starter-mcp-server-webmvc` |
| MCP server over WebFlux | `spring-ai-starter-mcp-server-webflux` |
| MCP client over JDK HttpClient | `spring-ai-starter-mcp-client` |
| MCP client over WebFlux | `spring-ai-starter-mcp-client-webflux` |

The server starters auto-configure the server, the transport, and the registration of tools, resources, and prompts. The client starters auto-configure a `McpSyncClient` or `McpAsyncClient` per named connection, plus a `ToolCallbackProvider` that lets a `ChatClient` use the remote tools.

For an HTTP server, the WebMVC starter is the shortest path: it runs on the servlet stack your team already operates. The WebFlux starter is the better fit when the rest of the service is reactive. The plain server starter is for stdio.

## Two annotation routes, and why they are not the same

This is the first place a Java team gets lost. Spring AI has two annotation families that look interchangeable and are not.

**Route one: `@Tool` plus a provider.** `@Tool` and `@ToolParam` come from `org.springframework.ai.tool.annotation`. They describe a method, but they do not register it with an MCP server. You expose the method by declaring a `ToolCallbackProvider`, usually a `MethodToolCallbackProvider`:

```java
@Bean
ToolCallbackProvider orderTools(OrderService orders) {
    return MethodToolCallbackProvider.builder()
        .toolObjects(orders)
        .build();
}
```

The MCP server auto-configuration picks up `ToolCallback` beans, lists of them, and `ToolCallbackProvider` beans. That bridge is what makes an `@Tool` method visible.

**Route two: `@McpTool` on a Spring bean.** `@McpTool`, `@McpToolParam`, `@McpResource`, `@McpPrompt`, and `@McpComplete` come from `org.springframework.ai.mcp.annotation`. The annotation scanner finds them directly on Spring beans. No provider bean is required:

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

Both routes eventually produce the same `ToolCallback` contract. The difference is who does the registration. `@Tool` needs a provider; `@McpTool` is scanned. Mixing the annotations — `@McpTool` with `@ToolParam`, for example — is a documentation trap, not a supported combination.

<figure class="mfig-fig">
  <figcaption>
    <span class="card-tag">THE TWO ROUTES // 01</span>
    <h3 class="mfig-fig-title">Same contract, different registration</h3>
    <p class="mfig-fig-sub"><code>@Tool</code> needs a <code>ToolCallbackProvider</code>; <code>@McpTool</code> is scanned from the bean. Both end at the same tool list.</p>
  </figcaption>
  <div class="mfig-scroll">
  <svg class="mfig-svg" viewBox="0 0 840 340" role="img" aria-labelledby="sai-f1-title sai-f1-desc">
    <title id="sai-f1-title">The two Spring AI annotation routes</title>
    <desc id="sai-f1-desc">The @Tool route goes through MethodToolCallbackProvider. The @McpTool route goes through the annotation scanner. Both produce ToolCallback entries that the MCP server publishes to the AI host.</desc>
    <text x="24" y="18" class="f" font-size="7.5" letter-spacing="1.2">TWO ANNOTATION ROUTES // ONE TOOL CONTRACT</text>
    <text x="816" y="18" class="f" font-size="7.5" text-anchor="end" letter-spacing="1">SPRING AI 2.1</text>
    <line x1="24" y1="26" x2="816" y2="26" class="rule"/>
    <rect x="48" y="52" width="200" height="64" class="term"/>
    <text x="60" y="70" class="f" font-size="6.8" letter-spacing="0.7">SPRING AI TOOL</text>
    <text x="60" y="90" class="t mono" font-size="10" font-weight="800">@Tool</text>
    <text x="60" y="104" class="m" font-size="6.6">annotation only — not registered</text>
    <line x1="148" y1="116" x2="148" y2="150" class="arrow" marker-end="url(#sai-f1-arrow)"/>
    <rect x="48" y="152" width="200" height="64" class="box"/>
    <text x="60" y="170" class="f" font-size="6.8" letter-spacing="0.7">BRIDGE</text>
    <text x="60" y="190" class="t mono" font-size="8.4" font-weight="800">MethodToolCallbackProvider</text>
    <text x="60" y="204" class="m" font-size="6.6">declare it as a bean</text>
    <rect x="620" y="52" width="200" height="64" class="term"/>
    <text x="632" y="70" class="f" font-size="6.8" letter-spacing="0.7">MCP ANNOTATION</text>
    <text x="632" y="90" class="t mono" font-size="10" font-weight="800">@McpTool</text>
    <text x="632" y="104" class="m" font-size="6.6">must sit on a Spring bean</text>
    <line x1="720" y1="116" x2="720" y2="150" class="arrow" marker-end="url(#sai-f1-arrow)"/>
    <rect x="620" y="152" width="200" height="64" class="box"/>
    <text x="632" y="170" class="f" font-size="6.8" letter-spacing="0.7">SCANNER</text>
    <text x="632" y="190" class="t" font-size="9" font-weight="800">ANNOTATION SCAN</text>
    <text x="632" y="204" class="m" font-size="6.6">enabled by default</text>
    <line x1="248" y1="184" x2="346" y2="184" class="arrow" marker-end="url(#sai-f1-arrow)"/>
    <line x1="620" y1="184" x2="522" y2="184" class="arrow" marker-end="url(#sai-f1-arrow)"/>
    <rect x="348" y="152" width="172" height="64" class="codebox"/>
    <text x="360" y="170" class="f" font-size="6.8" letter-spacing="0.7">CONTRACT</text>
    <text x="360" y="190" class="t" font-size="9.2" font-weight="800">ToolCallback</text>
    <text x="360" y="204" class="m" font-size="6.6">name · description · schema</text>
    <line x1="434" y1="216" x2="434" y2="244" class="arrow" marker-end="url(#sai-f1-arrow)"/>
    <rect x="330" y="246" width="208" height="48" class="box"/>
    <text x="344" y="266" class="f" font-size="6.6" letter-spacing="0.7">PUBLISH</text>
    <text x="344" y="284" class="t" font-size="8.8" font-weight="800">MCP SERVER · tools/list</text>
    <line x1="538" y1="270" x2="618" y2="270" class="arrow" marker-end="url(#sai-f1-arrow)"/>
    <rect x="620" y="246" width="180" height="48" class="term"/>
    <text x="632" y="266" class="f" font-size="6.6" letter-spacing="0.7">DISCOVER</text>
    <text x="632" y="284" class="t" font-size="8.8" font-weight="800">AI HOST</text>
    <text x="24" y="328" class="f" font-size="6.2">@ToolPARAM AND @McpToolPARAM ARE DIFFERENT ANNOTATIONS · USE THE ONE THAT MATCHES THE ROUTE</text>
  </svg>
  </div>
  <p class="mfig-fig-src">@TOOL + PROVIDER · @McpTool + SCANNER · ONE TOOLCALLBACK</p>
</figure>

## A minimal server

The shortest useful HTTP server has one dependency, three properties, and one bean.

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

Run `./mvnw spring-boot:run`; the endpoint is `http://localhost:8080/mcp`.

For the client side, the configuration names a connection and the `ToolCallbackProvider` becomes available to the `ChatClient`:

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

The client still needs a model starter and credentials. The MCP client only supplies the tools.

## What the model sees

The model does not see your Java method. It sees a tool name, a description, and a JSON Schema generated from the parameter types. That is the actual prompt surface, and it deserves the same review as any user-facing API.

Three details matter:

- **Names are identifiers.** Keep them short, stable, and verb-led: `find_order`, not `orderServiceFindOrderById`. MCP clients effectively cap names at 64 characters, and duplicate names are resolved differently by each route.
- **Descriptions are instructions.** "Find an order by id" is weaker than "Find an order by its public id; call list_orders first if the id is unknown." The second tells the model when to use the tool and what to do when it cannot.
- **Return shape is context.** A `String` returns as text; an object is serialized to JSON text. `@McpTool(generateOutputSchema = true)` emits `structuredContent` for non-primitive returns. If you need full control, return `McpSchema.CallToolResult` and set text, structured content, and `isError` yourself.

Errors are part of the contract too. With `@McpTool`, a `RuntimeException` becomes an error result the model can see. A checked exception or an `Error` propagates and fails the call. Since 2.1.0, server transports no longer put exception messages into protocol-level error responses, which is good for leaks and bad for debugging unless you log deliberately.

## Transport: stdio or Streamable HTTP

MCP has two transports that matter.

**stdio** is a subprocess with JSON-RPC on stdin and stdout. It is the right choice for a desktop host that launches a local server. It is also a trust boundary: the client executes the configured command with the user's OS permissions. Treat `command`, `args`, and `env` as code. Pin versions, use absolute paths, pass secrets through the environment, and sandbox the process. And keep stdout clean: Spring Boot logs to stdout by default, which corrupts the JSON-RPC stream. Set `logging.pattern.console=` and log to a file or stderr.

**Streamable HTTP** is one endpoint, usually `/mcp`, where each message is an HTTP POST and replies are JSON or a request-scoped SSE stream. It is the right choice for a shared server behind a gateway. The older HTTP+SSE transport is legacy; server-side SSE is deprecated. Spring AI 2.1 defaults the server to `STREAMABLE`.

The 2026-07-28 MCP revision adds a stateless mode: no `initialize` handshake, every request carries its protocol version and client capabilities, and server-initiated interactions become multi-round-trip requests. Spring AI 2.1 supports it with `protocol: MODERN`. Stateful Streamable HTTP still uses `Mcp-Session-Id`; behind a load balancer, either use sticky sessions or set `protocol: STATELESS`. Do not point a legacy client at a modern server or the reverse and expect discovery to work.

## Security starts before the tool

The server starters are authentication-agnostic. The default HTTP endpoint is open, and the default transport security validator is a no-op: `Origin` and `Host` are not checked. That is a DNS-rebinding risk even for a localhost server.

Add a validator through the transport builder:

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

Then decide the identity model. MCP's authorization model is OAuth 2.1: the server is a resource server, protected-resource metadata is published, tokens must be audience-bound, and token passthrough is forbidden. For an internal service-to-service integration, an API key can be a reasonable deployment choice, but it is outside the spec's OAuth model. Do not call it "MCP auth" and assume you inherited the spec's guarantees.

Whatever the mechanism, authorize per tool, not just per connection. A read-only `find_order` and a `cancel_order` should not share the same authority. Rate-limit per caller and per tool. Disable capabilities you do not use (`resources`, `prompts`, `completions`) and set `spring.ai.mcp.server.expose-mcp-client-tools=false` unless you deliberately want to re-expose every downstream client tool through your server.

## Testing and operations

The Inspector is the fastest way to see what the model sees:

```bash
npx @modelcontextprotocol/inspector \
  --server-url http://localhost:8080/mcp --transport http
```

For unit tests, call the tool object directly. To test schema generation and JSON conversion, build the provider and invoke the callback:

```java
ToolCallback callback = MethodToolCallbackProvider.builder()
    .toolObjects(new OrderTools())
    .build()
    .getToolCallbacks()[0];

var result = callback.call("{\"orderId\":\"A-1001\"}", new ToolContext(Map.of()));
```

For integration tests, start the app on a random port, connect with the SDK, assert `listTools()` contains the name, and call it. That catches transport wiring that a unit test cannot.

Operationally, the SDK logs JSON-RPC at `DEBUG` under `io.modelcontextprotocol`, but it ships no metrics or tracing. Spring AI's tool observations cover the `ChatClient` loop, not MCP server invocations, so instrument the tool methods yourself if you need latency and error rates. There is no MCP-specific health indicator in the starters; a synthetic `tools/list` probe is a better readiness check than a generic HTTP 200.

## Pitfalls

- **`@Tool` without a provider is invisible.** The method compiles, the bean starts, and the tool list is empty.
- **SYNC and ASYNC do not mix.** A sync server ignores `Mono`-returning tools; an async server ignores blocking ones. There is no startup failure.
- **Annotation families do not mix.** `@McpTool` with `@ToolParam` is not a supported pair.
- **Duplicate names are resolved silently or fatally, depending on the route.** Pick unique, stable names and test `tools/list`.
- **stdio with console logging corrupts the stream.** This is the most common "the server connects but nothing works" failure.
- **Big outputs are context.** Returning a 2 MB JSON document does not help the model; paginate, summarize, or return a handle.
- **Exception messages can leak.** Log the detail server-side, return a stable error code to the model.
- **Client sessions are shared.** Auto-configured MCP clients are application-scoped singletons; the MCP session is not a per-user security boundary.
- **Version drift is real.** Pin the Spring AI BOM, do not override the MCP SDK independently, and keep Boot and Spring AI on compatible lines.

## A five-minute start

1. Import `spring-ai-bom:2.1.0` and add `spring-ai-starter-mcp-server-webmvc`.
2. Write one `@McpTool` on a Spring bean, with a description that says when to call it.
3. Set `spring.ai.mcp.server.name`, `version`, and `protocol: STREAMABLE`.
4. Run the app and point the Inspector at `/mcp`.
5. Add a transport security validator and a real identity check before exposing it beyond localhost.
6. Pin the BOM and the Boot line in the same commit.

The first tool is easy. The contract — names, descriptions, schemas, errors, transport, identity — is the part that decides whether the server is usable by an agent or merely present on a port.

## References

- [Spring AI MCP overview](https://docs.spring.io/spring-ai/reference/api/mcp/mcp-overview.html) — primitives, transports, and architecture.
- [MCP server starters](https://docs.spring.io/spring-ai/reference/api/mcp/mcp-server-boot-starter-docs.html) — artifacts, properties, and auto-configuration.
- [MCP client starters](https://docs.spring.io/spring-ai/reference/api/mcp/mcp-client-boot-starter-docs.html) — connections and `ToolCallbackProvider`.
- [MCP server annotations](https://docs.spring.io/spring-ai/reference/api/mcp/mcp-annotations-server.html) — `@McpTool`, `@McpResource`, `@McpPrompt`.
- [Spring AI 2.1.0 announcement](https://spring.io/blog/2026/11/20/spring-ai-2-1-0-GA-available-now) — Boot 4.2 baseline and release notes.
- [MCP specification 2026-07-28](https://modelcontextprotocol.io/specification/2026-07-28) — stateless revision.
- [MCP transports](https://modelcontextprotocol.io/specification/2026-07-28/basic/transports) — stdio and Streamable HTTP.
- [MCP authorization](https://modelcontextprotocol.io/specification/2026-07-28/basic/authorization) — OAuth 2.1 resource-server model.
- [MCP security best practices](https://modelcontextprotocol.io/specification/2026-07-28/basic/security_best_practices) — confused deputy, token passthrough, and session risks.
- [MCP Inspector](https://modelcontextprotocol.io/docs/tools/inspector) — the reference test client.
- [MCP Java SDK](https://github.com/modelcontextprotocol/java-sdk) — releases and transport implementations.
