---
title: "Spring AI MCP：把 Java 服務變成 AI 的工具介面"
description: "Spring AI 2.1 把選定的 Spring Bean 變成 MCP 工具。這篇說明伺服器模型、兩條註解路徑、傳輸選擇、安全邊界，以及讓 Java MCP 伺服器無法使用的常見錯誤。"
pubDate: 2026-11-25
category: "AI"
tags: ["Spring AI", "MCP", "Java", "Spring Boot", "AI 代理"]
featured: false
author: "Alex.Hsiao"
readTime: "14 分鐘"
cardImage: "./cover.webp"
cardImageAlt: "Spring AI 的 Java MCP 伺服器架構，比較 SSE 與 stdio 傳輸"
---

# Spring AI MCP：把 Java 服務變成 AI 的工具介面

## MCP 解決的整合難題

Java 服務早就包含最難的部分：交易、驗證、授權，以及資料庫邊界。它缺的不是能力，而是一個能讓 AI 主機探索的形式。

在 MCP 出現之前，每個整合都是量身打造。你得為每個主機寫 REST 端點、OpenAPI 文件、function calling 的 schema，再補一套驗證與授權機制。換一個主機，全部再來一次；換一個服務，也是再來一次。整合矩陣的大小是「主機 × 服務」，而其中大部分黏著程式碼都不是業務邏輯。

Model Context Protocol 把這個矩陣收斂成一條線。主機連上伺服器，詢問它能做什麼，然後呼叫找到的工具。傳輸協定是 JSON-RPC 2.0，基本元素是工具、資源與提示。同一個伺服器可以服務桌面助理、IDE 代理與自訂編排器，不必為每一種主機重寫轉接層。

<section class="mfig-lead">
  <div class="mfig-lead-head">
    <span class="card-tag">SPRING AI MCP // 00</span>
    <p class="mfig-lead-kicker">Java 服務早就具備邏輯，MCP 給它一個 AI 主機看得懂的形式。</p>
    <h3 class="mfig-lead-title">工具呼叫是最簡單的部分，契約才是真正的工作。</h3>
    <p class="mfig-lead-sub">Spring AI 2.1 把選定的 Spring Bean 變成 MCP 工具：一個伺服器、一份 schema、一種傳輸。</p>
  </div>
  <div class="mfig-lead-grid">
    <div class="mfig-card">
      <div class="mfig-icon"><svg class="mfig-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10 2v2"/><path d="M14 2v2"/><path d="M16 8a1 1 0 0 1 1 1v8a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V9a1 1 0 0 1 1-1h14a4 4 0 1 1 0 8h-1"/><path d="M6 2v2"/></svg></div>
      <div class="mfig-tag">JAVA // SERVICE</div>
      <h4>業務邏輯原本就住在這裡</h4>
      <p>交易、驗證、授權與資料庫邊界。</p>
      <div class="mfig-meta">SPRING BOOT · BEANS · TX</div>
    </div>
    <div class="mfig-arrow" aria-hidden="true">→</div>
    <div class="mfig-card">
      <div class="mfig-icon"><svg class="mfig-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 22v-5"/><path d="M9 8V2"/><path d="M15 8V2"/><path d="M18 8v5a4 4 0 0 1-4 4h-4a4 4 0 0 1-4-4V8Z"/></svg></div>
      <div class="mfig-tag">MCP // CONTRACT</div>
      <h4>是工具，不是端點</h4>
      <p>主機在執行期探索名稱、描述與 JSON Schema。</p>
      <div class="mfig-meta">TOOLS · RESOURCES · PROMPTS</div>
    </div>
    <div class="mfig-arrow" aria-hidden="true">→</div>
    <div class="mfig-card">
      <div class="mfig-icon"><svg class="mfig-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/></svg></div>
      <div class="mfig-tag">AI // CLIENT</div>
      <h4>一套協定，多種主機</h4>
      <p>Claude、IDE 代理與自訂用戶端呼叫同一個伺服器。</p>
      <div class="mfig-meta">STDIO · HTTP · MODERN</div>
    </div>
  </div>
  <div class="mfig-lead-flow mfig-scroll">
  <svg class="mfig-svg" viewBox="0 0 840 170" role="img" aria-labelledby="sai-lead-title sai-lead-desc">
    <title id="sai-lead-title">Spring AI MCP 的路徑</title>
    <desc id="sai-lead-desc">Spring Boot 服務把加上註解的方法暴露成 MCP 工具，MCP 伺服器發布它的 JSON Schema，AI 主機透過 JSON-RPC 探索並呼叫，結果再回到模型。</desc>
    <defs>
      <marker id="sai-arrow" viewBox="0 0 5 5" refX="4.4" refY="2.5" markerWidth="5" markerHeight="5" markerUnits="userSpaceOnUse" orient="auto"><path d="M0 0 L5 2.5 L0 5 z" fill="var(--mono-ink)"/></marker>
    </defs>
    <text x="24" y="18" class="f" font-size="7.5" letter-spacing="1.2">一個伺服器 // 一份 SCHEMA // 多個主機</text>
    <text x="816" y="18" class="f" font-size="7.5" text-anchor="end" letter-spacing="1">MCP 路徑</text>
    <line x1="24" y1="26" x2="816" y2="26" class="rule"/>
    <rect x="24" y="44" width="118" height="72" class="term"/>
    <svg x="34" y="54" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--mono-ink)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M10 2v2"/><path d="M14 2v2"/><path d="M16 8a1 1 0 0 1 1 1v8a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V9a1 1 0 0 1 1-1h14a4 4 0 1 1 0 8h-1"/><path d="M6 2v2"/></svg>
    <text x="52" y="64" class="f" font-size="6.2" letter-spacing="0.6">服務</text>
    <text x="34" y="88" class="t" font-size="9.5" font-weight="800">SPRING BOOT</text>
    <text x="34" y="100" class="m" font-size="6.8">Bean + 方法</text>
    <text x="34" y="112" class="f" font-size="6.2">交易邊界</text>
    <line x1="144" y1="80" x2="160" y2="80" class="arrow" marker-end="url(#sai-arrow)"/>
    <rect x="162" y="44" width="118" height="72" class="codebox"/>
    <svg x="172" y="54" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--mono-ink)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>
    <text x="190" y="64" class="f" font-size="6.2" letter-spacing="0.6">註解</text>
    <text x="172" y="88" class="t mono" font-size="9.2" font-weight="800">@McpTool</text>
    <text x="172" y="100" class="m" font-size="6.8">名稱 + schema</text>
    <text x="172" y="112" class="f" font-size="6.2">描述很重要</text>
    <line x1="282" y1="80" x2="298" y2="80" class="arrow" marker-end="url(#sai-arrow)"/>
    <rect x="300" y="44" width="118" height="72" class="box"/>
    <svg x="310" y="54" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--mono-ink)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="8" x="2" y="2" rx="2" ry="2"/><rect width="20" height="8" x="2" y="14" rx="2" ry="2"/><line x1="6" x2="6.01" y1="6" y2="6"/><line x1="6" x2="6.01" y1="18" y2="18"/></svg>
    <text x="328" y="64" class="f" font-size="6.2" letter-spacing="0.6">伺服器</text>
    <text x="310" y="88" class="t" font-size="9.5" font-weight="800">MCP 伺服器</text>
    <text x="310" y="100" class="m" font-size="6.8">tools/list</text>
    <text x="310" y="112" class="f" font-size="6.2">tools/call</text>
    <line x1="420" y1="80" x2="436" y2="80" class="arrow" marker-end="url(#sai-arrow)"/>
    <rect x="438" y="44" width="118" height="72" class="term"/>
    <svg x="448" y="54" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--mono-ink)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"/></svg>
    <text x="466" y="64" class="f" font-size="6.2" letter-spacing="0.6">協定</text>
    <text x="448" y="88" class="t" font-size="9.5" font-weight="800">JSON-RPC 2.0</text>
    <text x="448" y="100" class="m" font-size="6.8">stdio 或 HTTP</text>
    <text x="448" y="112" class="f" font-size="6.2">無狀態或工作階段</text>
    <line x1="558" y1="80" x2="574" y2="80" class="arrow" marker-end="url(#sai-arrow)"/>
    <rect x="576" y="44" width="118" height="72" class="box"/>
    <svg x="586" y="54" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--mono-ink)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/></svg>
    <text x="604" y="64" class="f" font-size="6.2" letter-spacing="0.6">主機</text>
    <text x="586" y="88" class="t" font-size="9.5" font-weight="800">AI 用戶端</text>
    <text x="586" y="100" class="m" font-size="6.8">模型選擇</text>
    <text x="586" y="112" class="f" font-size="6.2">claude · ide · 自訂</text>
    <line x1="696" y1="80" x2="712" y2="80" class="arrow" marker-end="url(#sai-arrow)"/>
    <rect x="714" y="44" width="118" height="72" class="term"/>
    <svg x="724" y="54" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--mono-ink)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
    <text x="742" y="64" class="f" font-size="6.2" letter-spacing="0.6">回傳</text>
    <text x="724" y="88" class="t" font-size="9.5" font-weight="800">結果</text>
    <text x="724" y="100" class="m" font-size="6.8">文字或 JSON</text>
    <text x="724" y="112" class="f" font-size="6.2">模型讀取</text>
    <text x="420" y="150" class="f" font-size="6.6" text-anchor="middle" letter-spacing="0.6">MCP 不會讓服務變聰明 · 它讓服務可以被呼叫</text>
  </svg>
  </div>
  <p class="mfig-lead-note"><b>MCP 不會讓服務變聰明。</b>它讓服務可以被呼叫，而且附上一份模型讀得懂的契約。</p>
</section>

<p class="mfig-bridge">Spring AI 2.1 是目前 Java 生態的實作。接下來要談的是它提供什麼、兩條註解路徑有何差異，以及邊界應該劃在哪裡。</p>

## Spring AI 2.1 究竟提供什麼

目前這條版本線很好確認：

| 元件 | 版本 | 日期 |
| :--- | :--- | :--- |
| Spring AI | 2.1.0 GA | 2026 年 11 月 20 日 |
| Spring Boot | 4.2.0 GA | 2026 年 11 月 19 日 |
| MCP Java SDK | 2.2.0 | 2026 年 11 月 16 日 |
| Java 基準版本 | 17 | — |

Spring AI 2.1.0 建構在 Boot 4.2 上，版本說明建議兩者一起升級。如果你還停在 Boot 4.0.x 或 4.1.x，請留在 Spring AI 2.0.x，等 Boot 升級完成再說。不要混用不同版本的 Boot 與 Spring AI，再指望 BOM 會自動搞定。

MCP 相關的 artifact 都放在 `org.springframework.ai` 之下，由 `spring-ai-bom:2.1.0` 管理：

| 角色 | Artifact |
| :--- | :--- |
| 以 stdio 運作的 MCP 伺服器 | `spring-ai-starter-mcp-server` |
| 以 Spring MVC 運作的 MCP 伺服器 | `spring-ai-starter-mcp-server-webmvc` |
| 以 WebFlux 運作的 MCP 伺服器 | `spring-ai-starter-mcp-server-webflux` |
| 以 JDK HttpClient 運作的 MCP 用戶端 | `spring-ai-starter-mcp-client` |
| 以 WebFlux 運作的 MCP 用戶端 | `spring-ai-starter-mcp-client-webflux` |

伺服器 starter 會自動設定伺服器、傳輸，以及工具、資源與提示的註冊。用戶端 starter 則會為每個具名連線自動設定一個 `McpSyncClient` 或 `McpAsyncClient`，另外提供一個 `ToolCallbackProvider`，讓 `ChatClient` 可以使用遠端工具。

若要提供 HTTP 伺服器，WebMVC starter 是最短路徑：它運行在團隊已經在維運的 Servlet 堆疊上。若服務的其他部分都是 reactive，WebFlux starter 更合適。單純的 server starter 則是給 stdio 用的。

## 兩條註解路徑，為什麼不能混為一談

這是 Java 團隊最容易迷路的第一站。Spring AI 有兩套註解，看起來可以互換，實際上不行。

**路徑一：`@Tool` 加一個 provider。**`@Tool` 與 `@ToolParam` 來自 `org.springframework.ai.tool.annotation`。它們描述一個方法，但不會把它註冊到 MCP 伺服器。你必須宣告 `ToolCallbackProvider`（通常是 `MethodToolCallbackProvider`）才能把方法暴露出去：

```java
@Bean
ToolCallbackProvider orderTools(OrderService orders) {
    return MethodToolCallbackProvider.builder()
        .toolObjects(orders)
        .build();
}
```

MCP 伺服器的自動設定會收集 `ToolCallback` Bean、由它們組成的 List，以及 `ToolCallbackProvider` Bean。這座橋才讓 `@Tool` 方法被看見。

**路徑二：把 `@McpTool` 放在 Spring Bean 上。**`@McpTool`、`@McpToolParam`、`@McpResource`、`@McpPrompt` 與 `@McpComplete` 來自 `org.springframework.ai.mcp.annotation`。註解掃描器會直接在 Spring Bean 上找到它們，不需要 provider Bean：

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

兩條路徑最後都會產生同樣的 `ToolCallback` 契約，差別在於由誰負責註冊。`@Tool` 需要 provider；`@McpTool` 靠掃描。混用註解——例如把 `@McpTool` 配上 `@ToolParam`——是文件陷阱，不是支援的組合。

<figure class="mfig-fig">
  <figcaption>
    <span class="card-tag">兩條路徑 // 01</span>
    <h3 class="mfig-fig-title">同一份契約，不同的註冊方式</h3>
    <p class="mfig-fig-sub"><code>@Tool</code> 需要一個 <code>ToolCallbackProvider</code>；<code>@McpTool</code> 則是由 Bean 掃描而來。兩者最後都歸入同一份工具清單。</p>
  </figcaption>
  <div class="mfig-scroll">
  <svg class="mfig-svg" viewBox="0 0 840 340" role="img" aria-labelledby="sai-f1-title sai-f1-desc">
    <title id="sai-f1-title">Spring AI 的兩條註解路徑</title>
    <desc id="sai-f1-desc">@Tool 路徑經過 MethodToolCallbackProvider；@McpTool 路徑經過註解掃描器。兩者都產生 ToolCallback 項目，再由 MCP 伺服器發布給 AI 主機。</desc>
    <text x="24" y="18" class="f" font-size="7.5" letter-spacing="1.2">兩條註解路徑 // 一份工具契約</text>
    <text x="816" y="18" class="f" font-size="7.5" text-anchor="end" letter-spacing="1">SPRING AI 2.1</text>
    <line x1="24" y1="26" x2="816" y2="26" class="rule"/>
    <rect x="48" y="52" width="200" height="64" class="term"/>
    <text x="60" y="70" class="f" font-size="6.8" letter-spacing="0.7">SPRING AI 工具</text>
    <text x="60" y="90" class="t mono" font-size="10" font-weight="800">@Tool</text>
    <text x="60" y="104" class="m" font-size="6.6">只有註解 — 尚未註冊</text>
    <line x1="148" y1="116" x2="148" y2="150" class="arrow" marker-end="url(#sai-f1-arrow)"/>
    <rect x="48" y="152" width="200" height="64" class="box"/>
    <text x="60" y="170" class="f" font-size="6.8" letter-spacing="0.7">橋接</text>
    <text x="60" y="190" class="t mono" font-size="8.4" font-weight="800">MethodToolCallbackProvider</text>
    <text x="60" y="204" class="m" font-size="6.6">宣告成 Bean</text>
    <rect x="620" y="52" width="200" height="64" class="term"/>
    <text x="632" y="70" class="f" font-size="6.8" letter-spacing="0.7">MCP 註解</text>
    <text x="632" y="90" class="t mono" font-size="10" font-weight="800">@McpTool</text>
    <text x="632" y="104" class="m" font-size="6.6">必須放在 Spring Bean 上</text>
    <line x1="720" y1="116" x2="720" y2="150" class="arrow" marker-end="url(#sai-f1-arrow)"/>
    <rect x="620" y="152" width="200" height="64" class="box"/>
    <text x="632" y="170" class="f" font-size="6.8" letter-spacing="0.7">掃描器</text>
    <text x="632" y="190" class="t" font-size="9" font-weight="800">註解掃描</text>
    <text x="632" y="204" class="m" font-size="6.6">預設啟用</text>
    <line x1="248" y1="184" x2="346" y2="184" class="arrow" marker-end="url(#sai-f1-arrow)"/>
    <line x1="620" y1="184" x2="522" y2="184" class="arrow" marker-end="url(#sai-f1-arrow)"/>
    <rect x="348" y="152" width="172" height="64" class="codebox"/>
    <text x="360" y="170" class="f" font-size="6.8" letter-spacing="0.7">契約</text>
    <text x="360" y="190" class="t" font-size="9.2" font-weight="800">ToolCallback</text>
    <text x="360" y="204" class="m" font-size="6.6">名稱 · 描述 · schema</text>
    <line x1="434" y1="216" x2="434" y2="244" class="arrow" marker-end="url(#sai-f1-arrow)"/>
    <rect x="330" y="246" width="208" height="48" class="box"/>
    <text x="344" y="266" class="f" font-size="6.6" letter-spacing="0.7">發布</text>
    <text x="344" y="284" class="t" font-size="8.8" font-weight="800">MCP 伺服器 · tools/list</text>
    <line x1="538" y1="270" x2="618" y2="270" class="arrow" marker-end="url(#sai-f1-arrow)"/>
    <rect x="620" y="246" width="180" height="48" class="term"/>
    <text x="632" y="266" class="f" font-size="6.6" letter-spacing="0.7">探索</text>
    <text x="632" y="284" class="t" font-size="8.8" font-weight="800">AI 主機</text>
    <text x="24" y="328" class="f" font-size="6.2">@ToolPARAM 與 @McpToolPARAM 是不同的註解 · 請用符合該路徑的那一個</text>
  </svg>
  </div>
  <p class="mfig-fig-src">@TOOL + PROVIDER · @McpTool + SCANNER · 同一個 TOOLCALLBACK</p>
</figure>

## 一個最小伺服器

一個可用的 HTTP 伺服器，最短版本只需要一個相依性、三個屬性和一個 Bean。

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

執行 `./mvnw spring-boot:run`，端點就在 `http://localhost:8080/mcp`。

用戶端這邊，設定檔為連線命名，`ToolCallbackProvider` 就會提供給 `ChatClient` 使用：

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

用戶端仍然需要模型 starter 與憑證。MCP 用戶端只負責提供工具。

## 模型實際看到什麼

模型看不到你的 Java 方法。它看到的是工具名稱、描述，以及依照參數型別產生的 JSON Schema。那才是真正的提示介面，值得用面向使用者 API 的標準來審視。

有三個細節要注意：

- **名稱就是識別碼。** 保持簡短、穩定、以動詞開頭：`find_order`，而不是 `orderServiceFindOrderById`。MCP 用戶端實際上會把名稱上限設為 64 個字元，而重複名稱在兩條路徑上的處理方式不同。
- **描述就是指令。**「依 id 尋找訂單」比「依公開 id 尋找訂單；若不知道 id，先呼叫 list_orders」來得弱。後者告訴模型何時該用這個工具，以及做不到時該怎麼辦。
- **回傳結構就是上下文。** `String` 會以文字回傳；物件會序列化成 JSON 文字。`@McpTool(generateOutputSchema = true)` 會為非基本型別的回傳值產生 `structuredContent`。若需要完整控制，回傳 `McpSchema.CallToolResult`，自行設定文字、結構化內容與 `isError`。

錯誤也是契約的一部分。使用 `@McpTool` 時，`RuntimeException` 會變成模型看得見的錯誤結果；受檢例外或 `Error` 則會向上拋出，讓整個呼叫失敗。從 2.1.0 起，伺服器傳輸不再把例外訊息放進協定層的錯誤回應；這對防外洩是好事，對除錯卻不友善，除非你刻意留下記錄。

## 傳輸：stdio 或 Streamable HTTP

<figure class="fig">
  <img src="/images/spring-ai-mcp/java-mcp-server-architecture.webp" alt="Spring AI 的 Java MCP 伺服器架構：SSE 用戶端共用一個伺服器行程與 Web 容器；每個 stdio 用戶端則各自在同一個行程裡啟動 Java MCP 伺服器與後端。" width="1600" height="1179" loading="lazy" />
  <figcaption><b>官方圖示</b> — Spring AI 的 Java MCP 伺服器架構。左半：HTTP/SSE 用戶端共用一個伺服器行程與 Web 容器。右半：每個 stdio 用戶端各自啟動一個 Java MCP 伺服器與後端應用。傳輸方式決定的是行程與信任邊界，不只是線上格式；Spring AI 2.1 的伺服器預設則是 Streamable HTTP。資料來源：<a href="https://docs.spring.io/spring-ai/reference/api/mcp/mcp-overview.html">Spring AI — MCP overview</a></figcaption>
</figure>

MCP 有兩種真正重要的傳輸。

**stdio** 是一個子程序，JSON-RPC 走 stdin 與 stdout。對會啟動本機伺服器的桌面主機來說，這是正確選擇。它同時也是一條信任邊界：用戶端會用使用者的作業系統權限執行設定中的命令。請把 `command`、`args` 與 `env` 當成程式碼對待。鎖定版本、使用絕對路徑、透過環境變數傳遞機密，並把程序放進沙箱。還有，保持 stdout 乾淨：Spring Boot 預設把日誌寫到 stdout，會汙染 JSON-RPC 串流。把 `logging.pattern.console=` 設為空值，日誌改寫到檔案或 stderr。

**Streamable HTTP** 只有一個端點，通常是 `/mcp`；每個訊息都是一次 HTTP POST，回覆則是 JSON 或針對該請求開啟的 SSE 串流。對放在閘道後面的共用伺服器來說，這是正確選擇。較舊的 HTTP+SSE 傳輸屬於舊版；伺服器端的 SSE 已棄用。Spring AI 2.1 的伺服器預設就是 `STREAMABLE`。

2026-07-28 版的 MCP 修訂加入無狀態模式：沒有 `initialize` 握手，每個請求都自行攜帶協定版本與用戶端能力，伺服器發起的互動則變成多輪往返請求。Spring AI 2.1 以 `protocol: MODERN` 支援這個模式。有狀態的 Streamable HTTP 仍然使用 `Mcp-Session-Id`；若放在負載平衡器後面，請改用黏性工作階段，或設定 `protocol: STATELESS`。不要拿舊版用戶端去連新版伺服器，或反過來，然後期待探索會成功。

## 安全要從工具之前開始

伺服器 starter 不涉及驗證機制。預設的 HTTP 端點是開放的，預設的傳輸安全驗證器則是空操作：不檢查 `Origin` 與 `Host`。即使是 localhost 上的伺服器，這也有 DNS 重綁定的風險。

透過傳輸 builder 加入驗證器：

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

接著決定身分模型。MCP 的授權模型是 OAuth 2.1：伺服器是資源伺服器，會發布受保護資源的中繼資料，權杖必須綁定受眾，而且禁止權杖直通。若是內部服務對服務的整合，API 金鑰可以是合理的部署選擇，但它不在規格的 OAuth 模型之內。不要把它叫做「MCP 驗證」，就假設自己繼承了規格提供的保證。

不論用什麼機制，授權要依工具區分，不能只依連線區分。唯讀的 `find_order` 不該與 `cancel_order` 共用同一份權限。依呼叫者與工具分別限流。關掉用不到的能力（`resources`、`prompts`、`completions`），並設定 `spring.ai.mcp.server.expose-mcp-client-tools=false`，除非你刻意想讓伺服器把每個下游用戶端工具重新暴露出去。

## 測試與維運

Inspector 是查看「模型看到什麼」最快的方式：

```bash
npx @modelcontextprotocol/inspector \
  --server-url http://localhost:8080/mcp --transport http
```

單元測試時，直接呼叫工具物件。若要測試 schema 產生與 JSON 轉換，建立 provider 並呼叫 callback：

```java
ToolCallback callback = MethodToolCallbackProvider.builder()
    .toolObjects(new OrderTools())
    .build()
    .getToolCallbacks()[0];

var result = callback.call("{\"orderId\":\"A-1001\"}", new ToolContext(Map.of()));
```

整合測試時，讓應用程式在隨機埠啟動，用 SDK 連上，斷言 `listTools()` 包含該名稱，然後實際呼叫。這能捕捉到單元測試抓不到的傳輸層連接問題。

維運方面，SDK 會在 `io.modelcontextprotocol` 之下以 `DEBUG` 層級記錄 JSON-RPC，但不附帶任何指標或追蹤。Spring AI 的工具觀測涵蓋的是 `ChatClient` 迴圈，不是 MCP 伺服器呼叫；若需要延遲與錯誤率，得自己為工具方法加上觀測。starter 裡沒有 MCP 專屬的健康指示器；用一個合成的 `tools/list` 探測，會比單純的 HTTP 200 更能確認就緒狀態。

## 常見陷阱

- **`@Tool` 沒有 provider 就等於不存在。** 方法能通過編譯、Bean 能啟動，工具清單卻是空的。
- **SYNC 與 ASYNC 不能混用。** 同步伺服器會忽略回傳 `Mono` 的工具；非同步伺服器會忽略阻塞式工具。啟動時不會報錯。
- **註解家族不能混用。** `@McpTool` 配 `@ToolParam` 不是支援的組合。
- **重複名稱的處理方式依路徑而異：有時默默解決，有時直接失敗。** 請選用唯一且穩定的名稱，並測試 `tools/list`。
- **stdio 搭配主控台日誌會汙染串流。** 這是最常見的「伺服器連上了，但什麼都不動」故障。
- **過大的輸出就是上下文。** 回傳 2 MB 的 JSON 文件對模型沒有幫助；請分頁、摘要，或回傳一個 handle。
- **例外訊息可能外洩。** 詳細內容記錄在伺服器端，回給模型的是穩定的錯誤碼。
- **用戶端工作階段是共用的。** 自動設定的 MCP 用戶端是應用程式作用域的單例；MCP 工作階段不是依使用者區隔的安全邊界。
- **版本漂移是真實存在的。** 鎖定 Spring AI BOM，不要獨立覆寫 MCP SDK，並讓 Boot 與 Spring AI 維持在相容的版本線上。

## 五分鐘上手

1. 匯入 `spring-ai-bom:2.1.0`，加入 `spring-ai-starter-mcp-server-webmvc`。
2. 在一個 Spring Bean 上寫一個 `@McpTool`，描述要說明何時該呼叫它。
3. 設定 `spring.ai.mcp.server.name`、`version` 與 `protocol: STREAMABLE`。
4. 啟動應用程式，把 Inspector 指向 `/mcp`。
5. 在開放給 localhost 以外的範圍之前，加上傳輸安全驗證器與真正的身分驗證。
6. 在同一個 commit 裡鎖定 BOM 與 Boot 版本線。

第一個工具很簡單。真正決定伺服器能不能被代理使用、或者只是佔著一個埠的，是契約——名稱、描述、schema、錯誤、傳輸與身分。

## 參考資料

- [Spring AI MCP 總覽](https://docs.spring.io/spring-ai/reference/api/mcp/mcp-overview.html) — 基本元素、傳輸與架構。
- [MCP 伺服器 starter](https://docs.spring.io/spring-ai/reference/api/mcp/mcp-server-boot-starter-docs.html) — artifact、屬性與自動設定。
- [MCP 用戶端 starter](https://docs.spring.io/spring-ai/reference/api/mcp/mcp-client-boot-starter-docs.html) — 連線與 `ToolCallbackProvider`。
- [MCP 伺服器註解](https://docs.spring.io/spring-ai/reference/api/mcp/mcp-annotations-server.html) — `@McpTool`、`@McpResource`、`@McpPrompt`。
- [Spring AI 2.1.0 發布公告](https://spring.io/blog/2026/11/20/spring-ai-2-1-0-GA-available-now) — Boot 4.2 基準與版本說明。
- [MCP 規格 2026-07-28](https://modelcontextprotocol.io/specification/2026-07-28) — 無狀態修訂。
- [MCP 傳輸](https://modelcontextprotocol.io/specification/2026-07-28/basic/transports) — stdio 與 Streamable HTTP。
- [MCP 授權](https://modelcontextprotocol.io/specification/2026-07-28/basic/authorization) — OAuth 2.1 資源伺服器模型。
- [MCP 安全最佳實務](https://modelcontextprotocol.io/specification/2026-07-28/basic/security_best_practices) — 混淆代理人、權杖直通與工作階段風險。
- [MCP Inspector](https://modelcontextprotocol.io/docs/tools/inspector) — 參考測試用戶端。
- [MCP Java SDK](https://github.com/modelcontextprotocol/java-sdk) — 版本與傳輸實作。
