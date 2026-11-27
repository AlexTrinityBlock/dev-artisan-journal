---
title: "跨庫查詢萬能工具 DuckDB"
description: "DuckDB 如何用一個查詢聯邦 PostgreSQL、MySQL、SQLite、物件儲存與 Oracle；以及當發問的是 Oracle 時，需要哪些資料庫閘道元件。"
pubDate: 2026-11-26
category: "Data"
tags: ["DuckDB", "聯邦查詢", "Oracle", "ODBC", "資料工程"]
featured: false
author: "Alex.Hsiao"
readTime: "12 分鐘"
cardImage: "./cover.webp"
cardImageAlt: "Oracle Database Gateway for ODBC 架構圖：用戶端、Oracle、dg4odbc 閘道與非 Oracle 系統"
---

# 跨庫查詢萬能工具 DuckDB

DuckDB 通常被歸類為「跑在行程內的分析資料庫」。這句話沒錯，但低估了它在 2026 年的樣子。它也是幾個原本不打算相遇的資料庫之間，最短的一條路：一張 PostgreSQL 表、一張 MySQL 表、S3 上的一個 Parquet 檔，以及 Oracle 裡的一張表，用一句 SQL 在同一個行程裡合併。

有意義的詞是聯邦（federation）。危險的詞是萬能。DuckDB 能連的來源很多，但它沒有把這些來源變成一個資料庫。它透過擴充套件讀取每個來源，把需要的資料列搬進同一個行程，然後在本機合併。Oracle 有另一套聯邦堆疊，方向相反。搞清楚「現在是誰在發問」，就是乾淨架構與一場不存在的分散式交易之間的差別。

<p class="mfig-source-note"><span class="mfig-source-label">來源 // DUCKDB + ORACLE</span> <a href="https://duckdb.org/docs/2.0/">DuckDB 2.0 documentation</a> <em>與</em> <a href="https://docs.oracle.com/en/database/oracle/oracle-database/19/odbcu/database-gateway-odbc-introduction.html">Oracle Database Gateway for ODBC</a></p>

## 兩個方向，兩套堆疊

聯邦是一種方向，不是一個產品。當 DuckDB 發問，介面是擴充套件：`postgres`、`mysql`、`sqlite`、`iceberg`、`delta`、`httpfs` 與 `odbc_scanner`。當 Oracle 發問，介面是 Oracle 自己的：異質服務、資料庫閘道、Oracle Net 與資料庫連結。

兩套堆疊可以指向同一批資料，行為卻不同。DuckDB 把資料列拉進本機行程，在本機合併。Oracle 透過異質服務轉譯查詢，送給閘道行程，再把結果當成遠端資料表。兩者都沒有給你一個分散式資料庫。它們都只是「用一個問題去問好幾個系統」的方法。

## DuckDB 作為查詢樞紐

核心技巧是 `ATTACH`。PostgreSQL、MySQL、SQLite 與 Iceberg catalog 都可以掛成資料庫；之後它們的表看起來就像帶有 catalog 前綴的本機表。DuckDB 2.0 還加了 `CONNECT`，把整個 session 路由到已掛載的 PostgreSQL 或 MySQL，讓查詢送到該伺服器，而不是先把每一列拉回來。對只想合併兩個系統一次的分析師來說，`ATTACH` 通常就夠了。

```sql
ATTACH 'host=pg.internal dbname=app user=reader' AS pg
  (TYPE postgres, READ_ONLY);
ATTACH 'host=mysql.internal database=shop user=reader' AS shop
  (TYPE mysql, READ_ONLY);

SELECT c.region,
       count(*) AS orders,
       sum(o.total) AS revenue
FROM pg.public.customers c
JOIN shop.orders o ON o.customer_id = c.id
WHERE o.created_at >= DATE '2026-01-01'
GROUP BY c.region
ORDER BY revenue DESC;
```

兩個細節比語法更重要。第一，`READ_ONLY` 不是限制，是安全措施。分析用的聯邦查詢不該意外寫進營運資料庫。第二，合併在 DuckDB 裡發生。PostgreSQL 可以過濾 `customers`，MySQL 可以過濾 `orders`，但兩個資料庫彼此不知道對方。通過過濾的資料列會來到 DuckDB，在這裡相遇。

物件儲存的路徑一樣，只是換擴充套件：`iceberg_scan`、`delta_scan`，或直接對 `s3://` 讀 Parquet。一句查詢可以把 MySQL 的維度表跟一整年的 Parquet 事件表合併，這正是那種不值得為它開一座資料倉儲的報表工作。

<figure class="mfig-fig mfig-fig-arch">
  <figcaption>
    <span class="card-tag">架構 // 01</span>
    <h3 class="mfig-fig-title">DuckDB 是查詢樞紐，不是分散式資料庫</h3>
    <p class="mfig-fig-sub">一個行程讀取每個來源，把各來源能回答的部分下推，再在本機合併通過的資料列。來源彼此不會看到對方。</p>
  </figcaption>
  <div class="mfig-scroll">
  <svg class="mfig-svg" viewBox="0 0 780 436" role="img" aria-labelledby="duck-f1-title duck-f1-desc">
    <title id="duck-f1-title">DuckDB 作為跨資料庫聯邦樞紐</title>
    <desc id="duck-f1-desc">DuckDB 透過擴充套件讀取 PostgreSQL、MySQL、SQLite、Iceberg、Delta、Parquet 與 Oracle，盡可能下推濾鏡與投影，並在自己的行程內執行跨來源合併。結果可以 Arrow、Parquet 或 CSV 輸出。樞紐不提供全域快照、分散式提交或叢集。</desc>
    <defs>
      <marker id="duck-f1-arrow" viewBox="0 0 5 5" refX="4.4" refY="2.5" markerWidth="5" markerHeight="5" markerUnits="userSpaceOnUse" orient="auto"><path d="M0 0 L5 2.5 L0 5 z" fill="var(--mono-ink)"/></marker>
    </defs>
    <text x="24" y="18" class="f" font-size="9" letter-spacing="1.1">DUCKDB // 聯邦查詢樞紐</text>
    <text x="756" y="18" class="f" font-size="9" text-anchor="end" letter-spacing="1">一次查詢，一次本地合併</text>
    <line x1="24" y1="27" x2="756" y2="27" class="rule"/>
    <text x="24" y="46" class="f" font-size="8.5" letter-spacing="0.8">來源 // 查詢時讀取</text>
    <rect x="24" y="54" width="136" height="64" class="box"/>
    <text x="34" y="74" class="t" font-size="12.5" font-weight="800">POSTGRESQL</text>
    <text x="34" y="91" class="m" font-size="9.5">ATTACH · 下推</text>
    <text x="34" y="105" class="m" font-size="9.5">catalog</text>
    <rect x="169" y="54" width="136" height="64" class="term"/>
    <text x="179" y="74" class="t" font-size="12.5" font-weight="800">MYSQL</text>
    <text x="179" y="91" class="m" font-size="9.5">ATTACH · 下推</text>
    <text x="179" y="105" class="m" font-size="9.5">catalog</text>
    <rect x="314" y="54" width="136" height="64" class="box"/>
    <text x="324" y="74" class="t" font-size="12.5" font-weight="800">SQLITE</text>
    <text x="324" y="91" class="m" font-size="9.5">ATTACH · 本機檔</text>
    <text x="324" y="105" class="m" font-size="9.5">catalog</text>
    <rect x="459" y="54" width="136" height="64" class="term"/>
    <text x="469" y="74" class="t" font-size="12.5" font-weight="800">物件儲存</text>
    <text x="469" y="91" class="m" font-size="9.5">Iceberg · Delta</text>
    <text x="469" y="105" class="m" font-size="9.5">S3 上的 Parquet</text>
    <rect x="604" y="54" width="136" height="64" class="box"/>
    <text x="614" y="74" class="t" font-size="12.5" font-weight="800">ORACLE</text>
    <text x="614" y="91" class="m" font-size="9.5">ODBC 資料表函式</text>
    <text x="614" y="105" class="m" font-size="9.5">oracle_scanner</text>
    <line x1="92" y1="118" x2="92" y2="124" class="rule-soft"/>
    <line x1="237" y1="118" x2="237" y2="124" class="rule-soft"/>
    <line x1="382" y1="118" x2="382" y2="124" class="rule-soft"/>
    <line x1="527" y1="118" x2="527" y2="124" class="rule-soft"/>
    <line x1="672" y1="118" x2="672" y2="124" class="rule-soft"/>
    <line x1="92" y1="124" x2="672" y2="124" class="rule-soft"/>
    <line x1="390" y1="124" x2="390" y2="134" class="arrow" marker-end="url(#duck-f1-arrow)"/>
    <rect x="24" y="134" width="732" height="46" class="codebox"/>
    <text x="36" y="151" class="f" font-size="9" letter-spacing="0.6">擴充 // 轉譯、下推、取回</text>
    <text x="36" y="169" class="t" font-size="10.5" font-weight="600">postgres · mysql · sqlite · iceberg/delta/httpfs · odbc / oracle_scanner</text>
    <line x1="390" y1="180" x2="390" y2="198" class="arrow" marker-end="url(#duck-f1-arrow)"/>
    <rect x="24" y="198" width="480" height="118" class="term"/>
    <text x="36" y="218" class="f" font-size="9" letter-spacing="0.6">DUCKDB 引擎 // 單一行程</text>
    <text x="36" y="244" class="t" font-size="13" font-weight="800">本地合併 · 聚合 · 排序</text>
    <text x="36" y="268" class="m" font-size="10.5">濾鏡與投影下推到各來源</text>
    <text x="36" y="286" class="m" font-size="10.5">通過的資料列在此具體化</text>
    <text x="36" y="304" class="f" font-size="9.5">沒有全域快照 · 沒有跨來源交易</text>
    <rect x="520" y="198" width="236" height="118" class="box"/>
    <text x="532" y="218" class="f" font-size="9" letter-spacing="0.6">結果</text>
    <text x="532" y="244" class="t" font-size="13" font-weight="800">一張表</text>
    <text x="532" y="268" class="m" font-size="10.5">Arrow · Parquet · CSV</text>
    <text x="532" y="286" class="m" font-size="10.5">合併在本地發生</text>
    <text x="532" y="304" class="f" font-size="9.5">來源彼此不會看到對方</text>
    <line x1="506" y1="257" x2="518" y2="257" class="arrow" marker-end="url(#duck-f1-arrow)"/>
    <line x1="24" y1="336" x2="756" y2="336" class="rule"/>
    <text x="24" y="354" class="f" font-size="8.5" letter-spacing="0.8">樞紐不提供什麼</text>
    <rect x="24" y="364" width="236" height="58" class="term"/>
    <text x="36" y="386" class="t" font-size="10.5" font-weight="800">全域快照</text>
    <text x="36" y="402" class="m" font-size="9.5">每個來源各自的時間</text>
    <rect x="272" y="364" width="236" height="58" class="box"/>
    <text x="284" y="386" class="t" font-size="10.5" font-weight="800">分散式提交</text>
    <text x="284" y="402" class="m" font-size="9.5">一個交易只能寫一個來源</text>
    <rect x="520" y="364" width="236" height="58" class="term"/>
    <text x="532" y="386" class="t" font-size="10.5" font-weight="800">資料倉儲</text>
    <text x="532" y="402" class="m" font-size="9.5">單節點，不是叢集</text>
  </svg>
  </div>
  <p class="mfig-fig-src">ATTACH · ODBC · ORACLE_SCANNER · 本地合併</p>
</figure>

## 從 DuckDB 查 Oracle：ODBC，或原生掃描器

Oracle 是證明規則的例外。DuckDB 沒有核心的 `oracle` 擴充套件，不能像 `postgres` 那樣把 Oracle catalog 掛進來。官方路線是 `odbc_scanner` 擴充套件，透過 Oracle 的 ODBC 驅動程式溝通。在 Linux 與 macOS 上，這意味著 unixODBC、Oracle Instant Client，以及安裝在 DuckDB 主機上的 Oracle ODBC 驅動程式。

```sql
LOAD odbc;
-- CLI 範例：密碼由環境注入。
-- 應用程式裡請由 secret manager 傳入連線字串。
SET VARIABLE ora = odbc_connect(
  'Driver={Oracle in instantclient_23_0};DBQ=//ora.internal:1521/ORCLPDB1',
  'reader', getenv('ORA_PASSWORD')
);

WITH oracle_orders AS (
  FROM odbc_query(getvariable('ora'), '
    SELECT customer_id, sum(total) AS total
    FROM orders
    WHERE created_at >= DATE ''2026-01-01''
    GROUP BY customer_id')
)
SELECT c.region, sum(o.total) AS revenue
FROM oracle_orders o
JOIN pg.public.customers c ON c.id = o.customer_id
GROUP BY c.region
ORDER BY revenue DESC;
```

這是資料表函式，不是 catalog。`odbc_query` 回傳一個結果集；與 PostgreSQL 的合併在 DuckDB 裡發生。這個差別會出現在查詢計畫與效能曲線上。Oracle 在 ODBC 擴充套件的型別支援是 Tier 1，這比大多數來源都好；但 ODBC 本身是以資料列為單位的 API。擴充套件文件說得很直白：查詢處理嚴格單執行緒，而且擴充套件不允許同一個連線被多個執行緒同時使用。大量 Oracle 匯出時，請開多條連線，或先把工作推回 Oracle SQL，再讓結果過網路。

還有一個較新的替代品：社群擴充套件 `oracle_scanner`。它直接使用 Oracle 的 TNS/TTC 協定，不需要 Instant Client，支援 `ATTACH`、濾鏡與合併下推、平行掃描，以及 DuckDB 交易內的寫入。對較重的 Oracle 工作負載，它可能是更好的工具。它是社群擴充套件，不是核心擴充套件，所以版本相容性與支援要列入評估。官方 ODBC 路線是保守選擇；原生掃描器是效能選擇。

## Oracle 查其他資料庫：異質服務與閘道

反方向更老、也更正式。當應用程式住在 Oracle 裡，需要透過資料庫連結讀一張 PostgreSQL 或 MySQL 表，Oracle 不會用 DuckDB。它用異質服務（Heterogeneous Services，HS）加一個資料庫閘道。ODBC 來源的通用閘道是 Oracle Database Gateway for ODBC，通常叫 DG4ODBC。

這條鏈有五個元件：

1. **Oracle 資料庫裡的異質服務。** 它把 Oracle SQL 轉譯成遠端方言、對映中介資料，並協調 session。
2. **Oracle Net。** 資料庫透過監聽器項目連到閘道，連線描述子帶著 `(HS=OK)`。
3. **閘道行程**（`dg4odbc`），放在自己的 Oracle home。它是獨立執行檔，不是資料庫裡的函式庫。
4. **閘道主機上的 ODBC 驅動程式管理員與驅動程式。** 驅動程式必須跟閘道在同一台機器；非 Oracle 資料庫可以在別處。
5. **Oracle 裡的資料庫連結。** 連結就是 SQL 介面：`SELECT ... FROM "orders"@erp`。

<figure class="mfig-fig mfig-fig-arch">
  <figcaption>
    <span class="card-tag">另一個方向 // 02</span>
    <h3 class="mfig-fig-title">Oracle 透過閘道發問，不是透過 DuckDB</h3>
    <p class="mfig-fig-sub">異質服務轉譯查詢，Oracle Net 送到 dg4odbc 行程，閘道再透過 ODBC 驅動程式連到非 Oracle 資料庫。資料庫連結是應用程式唯一看到的 SQL 介面。</p>
  </figcaption>
  <div class="mfig-scroll">
  <svg class="mfig-svg" viewBox="0 0 780 410" role="img" aria-labelledby="duck-f2-title duck-f2-desc">
    <title id="duck-f2-title">Oracle Database Gateway for ODBC 架構</title>
    <desc id="duck-f2-desc">Oracle 資料庫解析查詢，經由異質服務與 Oracle Net 送到 dg4odbc 閘道；閘道再用 ODBC 驅動程式管理員與驅動程式連到非 Oracle 資料庫。資料庫連結是 SQL 介面。閘道僅支援單一站點：沒有分散式交易、沒有共享資料庫連結、沒有 CONNECT BY、ROWID、EXPLAIN PLAN 或預存程序。</desc>
    <defs>
      <marker id="duck-f2-arrow" viewBox="0 0 5 5" refX="4.4" refY="2.5" markerWidth="5" markerHeight="5" markerUnits="userSpaceOnUse" orient="auto"><path d="M0 0 L5 2.5 L0 5 z" fill="var(--mono-ink)"/></marker>
    </defs>
    <text x="24" y="18" class="f" font-size="9" letter-spacing="1.1">ORACLE // 異質服務</text>
    <text x="756" y="18" class="f" font-size="9" text-anchor="end" letter-spacing="1">聯邦查詢的另一個方向</text>
    <line x1="24" y1="27" x2="756" y2="27" class="rule"/>
    <text x="24" y="46" class="f" font-size="8.5" letter-spacing="0.8">ORACLE 發問 // 一個資料庫連結，五個元件</text>
    <rect x="24" y="50" width="180" height="92" class="term"/>
    <text x="36" y="70" class="f" font-size="9" letter-spacing="0.6">ORACLE 資料庫</text>
    <text x="36" y="94" class="t" font-size="13" font-weight="800">SQL + HS</text>
    <text x="36" y="112" class="m" font-size="9.5">異質服務</text>
    <text x="36" y="127" class="m" font-size="9.5">轉譯 + 協調</text>
    <rect x="224" y="64" width="100" height="64" class="box"/>
    <text x="236" y="84" class="f" font-size="9" letter-spacing="0.6">ORACLE NET</text>
    <text x="236" y="106" class="t" font-size="11" font-weight="800">(HS=OK)</text>
    <text x="236" y="122" class="f" font-size="8.5">監聽器</text>
    <rect x="344" y="64" width="140" height="64" class="codebox"/>
    <text x="356" y="84" class="f" font-size="9" letter-spacing="0.6">DG4ODBC</text>
    <text x="356" y="106" class="t" font-size="11" font-weight="800">閘道</text>
    <text x="356" y="122" class="f" font-size="8.5">initSID.ora</text>
    <rect x="504" y="64" width="110" height="64" class="box"/>
    <text x="516" y="84" class="f" font-size="9" letter-spacing="0.6">ODBC</text>
    <text x="516" y="106" class="t" font-size="11" font-weight="800">驅動程式</text>
    <text x="516" y="122" class="f" font-size="8.5">管理員 + 驅動</text>
    <rect x="634" y="64" width="122" height="64" class="term"/>
    <text x="646" y="84" class="f" font-size="9" letter-spacing="0.6">非 ORACLE</text>
    <text x="646" y="106" class="t" font-size="11" font-weight="800">資料庫</text>
    <text x="646" y="122" class="f" font-size="8.5">Postgres · MySQL</text>
    <line x1="204" y1="96" x2="222" y2="96" class="arrow" marker-end="url(#duck-f2-arrow)"/>
    <line x1="324" y1="96" x2="342" y2="96" class="arrow" marker-end="url(#duck-f2-arrow)"/>
    <line x1="484" y1="96" x2="502" y2="96" class="arrow" marker-end="url(#duck-f2-arrow)"/>
    <line x1="614" y1="96" x2="632" y2="96" class="arrow" marker-end="url(#duck-f2-arrow)"/>
    <path d="M114 142 V164 H414 V130" class="dash" fill="none" marker-end="url(#duck-f2-arrow)"/>
    <text x="264" y="180" class="f" font-size="8.5" text-anchor="middle" letter-spacing="0.5">DATABASE LINK // TNS 別名 → (HS=OK)</text>
    <line x1="24" y1="198" x2="756" y2="198" class="rule"/>
    <text x="24" y="216" class="f" font-size="8.5" letter-spacing="0.8">必要元件 // 每個 ODBC 來源一個閘道 SID</text>
    <rect x="24" y="226" width="136" height="56" class="box"/>
    <text x="34" y="246" class="t mono" font-size="10" font-weight="800">閘道 HOME</text>
    <text x="34" y="262" class="f" font-size="8.5">dg4odbc + HS admin</text>
    <rect x="169" y="226" width="136" height="56" class="term"/>
    <text x="179" y="246" class="t mono" font-size="10" font-weight="800">initSID.ora</text>
    <text x="179" y="262" class="f" font-size="8.5">HS_FDS_CONNECT_INFO</text>
    <rect x="314" y="226" width="136" height="56" class="box"/>
    <text x="324" y="246" class="t mono" font-size="10" font-weight="800">listener.ora</text>
    <text x="324" y="262" class="f" font-size="8.5">PROGRAM=dg4odbc</text>
    <rect x="459" y="226" width="136" height="56" class="term"/>
    <text x="469" y="246" class="t mono" font-size="10" font-weight="800">tnsnames.ora</text>
    <text x="469" y="262" class="f" font-size="8.5">(HS=OK)</text>
    <rect x="604" y="226" width="136" height="56" class="box"/>
    <text x="614" y="246" class="t mono" font-size="10" font-weight="800">DATABASE LINK</text>
    <text x="614" y="262" class="f" font-size="8.5">USING 'tns_alias'</text>
    <line x1="24" y1="302" x2="756" y2="302" class="rule"/>
    <text x="24" y="320" class="f" font-size="8.5" letter-spacing="0.8">閘道不做什麼</text>
    <rect x="24" y="330" width="236" height="64" class="term"/>
    <text x="36" y="352" class="t" font-size="10.5" font-weight="800">分散式交易</text>
    <text x="36" y="370" class="m" font-size="9.5">僅單一站點；沒有兩階段提交</text>
    <rect x="272" y="330" width="236" height="64" class="box"/>
    <text x="284" y="352" class="t" font-size="10.5" font-weight="800">共享 DB LINK</text>
    <text x="284" y="370" class="m" font-size="9.5">每個 session 一個 agent</text>
    <rect x="520" y="330" width="236" height="64" class="term"/>
    <text x="532" y="352" class="t" font-size="10.5" font-weight="800">完整 SQL</text>
    <text x="532" y="370" class="m" font-size="9.5">沒有 CONNECT BY / ROWID / 預存程序</text>
  </svg>
  </div>
  <p class="mfig-fig-src">ORACLE 19c 文件 // DATABASE GATEWAY FOR ODBC · HETEROGENEOUS SERVICES</p>
</figure>

<figure class="fig">
  <img src="/images/duckdb-oracle/fig-oracle-gateway.webp" alt="Oracle Database Gateway for ODBC 官方架構圖：用戶端經 Oracle Net 連到 Oracle 資料庫，資料庫再透過閘道與 ODBC 驅動程式存取非 Oracle 系統。" width="548" height="444" loading="lazy" />
  <figcaption><b>官方圖示</b> — Oracle Database Gateway for ODBC 文件 Figure 1-1。用戶端經 Oracle Net 進入 Oracle 資料庫；資料庫把查詢經異質服務與 Oracle Net 交給同一台機器上的 <code>dg4odbc</code> 閘道，閘道再經 ODBC 驅動管理員與驅動程式抵達非 Oracle 系統。虛線框是 Oracle 標示的非 Oracle 元件。上面的手繪盤面就是把這張圖重新排版，並補上單一來源與交易限制。資料來源：<a href="https://docs.oracle.com/en/database/oracle/oracle-database/19/odbcu/database-gateway-odbc-introduction.html">Oracle Database Gateway for ODBC — Introduction</a></figcaption>
</figure>

最小設定長這樣。把範例 `initdg4odbc.ora` 複製成 `init<sid>.ora`，指向一個 ODBC 來源：

```ini
# $ORACLE_HOME/hs/admin/initSID.ora
HS_FDS_CONNECT_INFO=ORCL_ODBC
HS_FDS_TRACE_LEVEL=OFF
```

`ORCL_ODBC` 是閘道主機上的 DSN。在 Linux 上，驅動程式註冊在 `odbcinst.ini`，DSN 放在 `odbc.ini`；在 Windows 上，用 ODBC 資料來源管理員。閘道與驅動程式必須在同一台機器。

監聽器為這個 SID 啟動 `dg4odbc`：

```ini
# listener.ora
SID_LIST_LISTENER=
  (SID_LIST=
    (SID_DESC=
      (SID_NAME=dg4odbc)
      (ORACLE_HOME=/u01/app/oracle/product/gateway)
      (PROGRAM=dg4odbc)))
```

Oracle 資料庫需要一個帶 `(HS=OK)` 的連線描述子：

```ini
# tnsnames.ora
DG4ODBC=
  (DESCRIPTION=
    (ADDRESS=(PROTOCOL=TCP)(HOST=gw.internal)(PORT=1521))
    (CONNECT_DATA=(SID=dg4odbc))
    (HS=OK))
```

然後建立連結：

```sql
CREATE PUBLIC DATABASE LINK erp
  CONNECT TO "reader" IDENTIFIED BY "..." USING 'DG4ODBC';

SELECT * FROM "orders"@erp WHERE ROWNUM <= 10;
```

本機資料表與遠端資料表可以在同一個 Oracle 查詢裡相遇：

```sql
SELECT d.name, sum(o.total) AS revenue
FROM departments d
JOIN "orders"@erp o ON o.dept_id = d.id
GROUP BY d.name;
```

每個 ODBC 來源都需要自己的閘道 SID 與初始化檔；一個閘道實例不是不相關來源的多工器。每個使用者 session 也會拿到自己的 agent 行程。Oracle 文件把 ODBC 閘道稱為低階資料整合方案，這是對它範圍的準確描述：它是用來對非 Oracle 系統做動態查詢，不是用來大量搬資料或持續複寫。如果來源是 SQL Server，Oracle 也有針對特定來源的閘道；如果需求是變更捕捉，GoldenGate 才是正確的工具類別，不是閘道。如果遠端是另一個 Oracle 資料庫，一般資料庫連結就夠了，不需要閘道。

限制才是決定架構的部分。Oracle 自己的清單說，閘道不能參與分散式交易，只支援單一站點交易。它不支援預存程序、共享資料庫連結、`CONNECT BY`、`ROWID`、`EXPLAIN PLAN`。`DBMS_HS_PASSTHROUGH` 的透通 SQL 可以補一些缺口，但那是逃生門，不是通解。把本機 Oracle 表跟遠端表合併的查詢可以運作；同時寫兩邊、要求原子性的交易不會。

## 合併到底在哪裡發生

兩套堆疊在圖上看起來對稱，負載下行為不同。DuckDB 裡，引擎為每個已掛載的資料庫開一個交易，讀取每個來源，在本機合併。`ATTACH` 文件說得很清楚：交易只在各自資料庫內原子，不是跨已掛載資料庫；單一交易只能寫入一個已掛載資料庫。聯邦不會改變這件事。

Oracle 裡，資料庫解析查詢，HS 盡可能轉譯，閘道透過 ODBC 取回列，Oracle 通常在這個階段執行合併。閘道不是擁有遠端完整統計資訊的對等的最佳化器，它是轉譯器與管線。複雜的遠端查詢，透過 `DBMS_HS_PASSTHROUGH` 送原生 SQL 可能更好，讓遠端資料庫用自己的計畫。

| 問題 | DuckDB 發問 | Oracle 發問 |
| :--- | :--- | :--- |
| 誰解析查詢？ | DuckDB | Oracle |
| 合併在哪裡執行？ | DuckDB 行程內 | Oracle 內，閘道取回列之後 |
| 來源如何暴露？ | `ATTACH` catalog 或資料表函式 | 透過閘道 SID 的資料庫連結 |
| 什麼會下推？ | 濾鏡與投影；部分擴充套件更多 | HS 與 ODBC 驅動程式能轉譯的部分 |
| 交易呢？ | 一個交易一個寫入來源；沒有跨來源原子性 | 僅單一站點；沒有分散式提交 |
| 最適合 | 分析師合併、匯出、原型 | 需要連結的 Oracle 中心應用 |

這張表就是整個論點。聯邦是一種查詢模式，不是一致性模型。如果你需要全域快照、跨來源交易，或可重複的歷史，你需要複寫、CDC 或資料倉儲。DuckDB 與 Oracle 閘道都只是「問」的方法；兩者都不是「保證」。

## 上線後會壞在哪裡

- **資料搬遷就是成本。** 下推減少過網路的資料列，但跨來源合併仍會具體化通過的資料列。看起來本機的查詢，可能搬了幾 GB。
- **沒有全域快照。** 每個來源在自己的時間被讀取。PostgreSQL 掃描與 Oracle 掃描之間，一列可能已經改了。`oracle_scanner` 可以為自己的 Oracle 讀取釘住一個 SCN；它不能釘住 PostgreSQL。
- **交易在來源邊界停止。** DuckDB 一個交易只能寫一個已掛載資料庫。Oracle 閘道是單一站點。不要建立假設兩階段提交的工作流。
- **型別對映是驚喜所在。** 沒有精度宣告的 Oracle `NUMBER`、`TIMESTAMP WITH TIME ZONE`、`CLOB`、`BLOB` 是常客。測你真的用到的欄位，不要只測 `COUNT(*)`。
- **憑證與網路路徑會變多。** 一個 DuckDB 腳本可能持有四個系統的連線字串；Oracle 閘道再加上閘道 home、監聽器、DSN 與資料庫連結。用 secret、最小權限的唯讀帳號，以及說得清楚的網路路徑。
- **ODBC 不是高速的批量介面。** 以列為單位的抓取與單執行緒查詢處理，讓它不適合反覆的大量匯出。如果合併每小時跑一次，先把 Oracle 資料落到 Parquet 或 DuckDB。

## 一條決策規則

用 DuckDB：查詢屬於分析師、來源可以唯讀、資料量中等、結果只用一次。用 Oracle Database Gateway for ODBC：應用程式已經住在 Oracle 裡、需要對非 Oracle 系統開資料庫連結、量不大。兩者都不要用：需求是持續複寫、全域歷史，或排程跑的高量合併；那是資料管線的問題，應該由管線工具負責。

DuckDB 配得上「萬能」的地方，是一個引擎能對很多來源說話。它配不上的地方，是取代這些來源的最佳化器、交易與治理。有用的架構，是能說清楚三件事的架構：誰在發問、資料列在哪裡移動、交易在哪裡結束。這三個答案一旦明確，SQL 就簡單了。

## 參考資料

- [Announcing DuckDB 2.0.1 LTS](https://duckdb.org/2026/11/20/announcing-duckdb-201.html) — 現行 LTS 版本與支援期間。
- [DuckDB PostgreSQL extension](https://duckdb.org/docs/2.0/core_extensions/postgres/overview.html) — `ATTACH`、連線字串、下推與交易。
- [DuckDB MySQL extension](https://duckdb.org/docs/2.0/core_extensions/mysql.html) — MySQL 與 MariaDB 的同一套模式。
- [DuckDB SQLite extension](https://duckdb.org/docs/2.0/core_extensions/sqlite.html) — 掛載本機資料庫檔案。
- [DuckDB ODBC extension](https://duckdb.org/docs/2.0/core_extensions/odbc/overview.html) — Oracle 型別支援、驅動程式設定與並行限制。
- [DuckDB `ATTACH` and `DETACH`](https://duckdb.org/docs/2.0/sql/statements/attach.html) — 跨已掛載資料庫的交易語意。
- [DuckDB Iceberg extension](https://duckdb.org/docs/2.0/core_extensions/iceberg/overview.html) — 從物件儲存讀 Iceberg 表。
- [DuckDB Delta extension](https://duckdb.org/docs/2.0/core_extensions/delta.html) — 從物件儲存讀 Delta Lake 表。
- [DuckDB `oracle_scanner` community extension](https://duckdb.org/community_extensions/extensions/oracle_scanner.html) — 原生 TNS/TTC 替代方案。
- [Oracle Database Gateway for ODBC: Introduction](https://docs.oracle.com/en/database/oracle/oracle-database/19/odbcu/database-gateway-odbc-introduction.html) — HS 與閘道架構。
- [Oracle Database Gateway for ODBC: Features and Restrictions](https://docs.oracle.com/en/database/oracle/oracle-database/19/odbcu/database-gateway-odbc-features.html) — 決定設計的限制。
- [Configuring Oracle Database Gateway for ODBC](https://docs.oracle.com/en/database/oracle/oracle-database/19/otgiw/config-odbc-gateway.html) — 初始化檔、監聽器、`tnsnames.ora` 與資料庫連結。
- [Oracle Database Heterogeneous Connectivity User's Guide](https://docs.oracle.com/en/database/oracle/oracle-database/19/heter/index.html) — 每個閘道背後的通用 HS 行為。
