---
title: "跨库查询万能工具 DuckDB"
description: "DuckDB 如何用一个查询联邦 PostgreSQL、MySQL、SQLite、对象存储与 Oracle；以及当发问的是 Oracle 时，需要哪些数据库网关组件。"
pubDate: 2026-11-26
category: "Data"
tags: ["DuckDB", "联邦查询", "Oracle", "ODBC", "数据工程"]
featured: false
author: "Alex.Hsiao"
readTime: "12 分钟"
cardImage: "./cover.webp"
cardImageAlt: "Oracle Database Gateway for ODBC 架构图：客户端、Oracle、dg4odbc 网关与非 Oracle 系统"
---

# 跨库查询万能工具 DuckDB

DuckDB 通常被归类为“跑在进程内的分析数据库”。这句话没错，但低估了它在 2026 年的样子。它也是几个原本不打算相遇的数据库之间，最短的一条路：一张 PostgreSQL 表、一张 MySQL 表、S3 上的一个 Parquet 文件，以及 Oracle 里的一张表，用一句 SQL 在同一个进程里合并。

有意义的词是联邦（federation）。危险的词是万能。DuckDB 能连的来源很多，但它没有把这些来源变成一个数据库。它通过扩展读取每个来源，把需要的数据行搬进同一个进程，然后在本地合并。Oracle 有另一套联邦栈，方向相反。搞清楚“现在是谁在发问”，就是干净架构与一场不存在的分布式事务之间的差别。

<p class="mfig-source-note"><span class="mfig-source-label">来源 // DUCKDB + ORACLE</span> <a href="https://duckdb.org/docs/2.0/">DuckDB 2.0 documentation</a> <em>与</em> <a href="https://docs.oracle.com/en/database/oracle/oracle-database/19/odbcu/database-gateway-odbc-introduction.html">Oracle Database Gateway for ODBC</a></p>

## 两个方向，两套栈

联邦是一种方向，不是一个产品。当 DuckDB 发问，接口是扩展：`postgres`、`mysql`、`sqlite`、`iceberg`、`delta`、`httpfs` 与 `odbc_scanner`。当 Oracle 发问，接口是 Oracle 自己的：异构服务、数据库网关、Oracle Net 与数据库链接。

两套栈可以指向同一批数据，行为却不同。DuckDB 把数据行拉进本地进程，在本地合并。Oracle 通过异构服务翻译查询，送给网关进程，再把结果当成远程表。两者都没有给你一个分布式数据库。它们都只是“用一个问题去问好几个系统”的方法。

## DuckDB 作为查询枢纽

核心技巧是 `ATTACH`。PostgreSQL、MySQL、SQLite 与 Iceberg catalog 都可以挂成数据库；之后它们的表看起来就像带有 catalog 前缀的本地表。DuckDB 2.0 还加了 `CONNECT`，把整个 session 路由到已挂载的 PostgreSQL 或 MySQL，让查询送到该服务器，而不是先把每一行拉回来。对只想合并两个系统一次的分析师来说，`ATTACH` 通常就够了。

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

两个细节比语法更重要。第一，`READ_ONLY` 不是限制，是安全措施。分析用的联邦查询不该意外写进生产数据库。第二，合并在 DuckDB 里发生。PostgreSQL 可以过滤 `customers`，MySQL 可以过滤 `orders`，但两个数据库彼此不知道对方。通过过滤的数据行会来到 DuckDB，在这里相遇。

对象存储的路径一样，只是换扩展：`iceberg_scan`、`delta_scan`，或直接对 `s3://` 读 Parquet。一句查询可以把 MySQL 的维度表跟一整年的 Parquet 事件表合并，这正是那种不值得为它开一座数据仓库的报表工作。

<figure class="mfig-fig mfig-fig-arch">
  <figcaption>
    <span class="card-tag">架构 // 01</span>
    <h3 class="mfig-fig-title">DuckDB 是查询枢纽，不是分布式数据库</h3>
    <p class="mfig-fig-sub">一个进程读取每个来源，把各来源能回答的部分下推，再在本地合并通过的数据行。来源彼此不会看到对方。</p>
  </figcaption>
  <div class="mfig-scroll">
  <svg class="mfig-svg" viewBox="0 0 780 436" role="img" aria-labelledby="duck-f1-title duck-f1-desc">
    <title id="duck-f1-title">DuckDB 作为跨数据库联邦枢纽</title>
    <desc id="duck-f1-desc">DuckDB 通过扩展读取 PostgreSQL、MySQL、SQLite、Iceberg、Delta、Parquet 与 Oracle，尽可能下推过滤与投影，并在自己的进程内执行跨来源合并。结果可以 Arrow、Parquet 或 CSV 输出。枢纽不提供全局快照、分布式提交或集群。</desc>
    <defs>
      <marker id="duck-f1-arrow" viewBox="0 0 5 5" refX="4.4" refY="2.5" markerWidth="5" markerHeight="5" markerUnits="userSpaceOnUse" orient="auto"><path d="M0 0 L5 2.5 L0 5 z" fill="var(--mono-ink)"/></marker>
    </defs>
    <text x="24" y="18" class="f" font-size="9" letter-spacing="1.1">DUCKDB // 联邦查询枢纽</text>
    <text x="756" y="18" class="f" font-size="9" text-anchor="end" letter-spacing="1">一次查询，一次本地合并</text>
    <line x1="24" y1="27" x2="756" y2="27" class="rule"/>
    <text x="24" y="46" class="f" font-size="8.5" letter-spacing="0.8">来源 // 查询时读取</text>
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
    <text x="324" y="91" class="m" font-size="9.5">ATTACH · 本地文件</text>
    <text x="324" y="105" class="m" font-size="9.5">catalog</text>
    <rect x="459" y="54" width="136" height="64" class="term"/>
    <text x="469" y="74" class="t" font-size="12.5" font-weight="800">对象存储</text>
    <text x="469" y="91" class="m" font-size="9.5">Iceberg · Delta</text>
    <text x="469" y="105" class="m" font-size="9.5">S3 上的 Parquet</text>
    <rect x="604" y="54" width="136" height="64" class="box"/>
    <text x="614" y="74" class="t" font-size="12.5" font-weight="800">ORACLE</text>
    <text x="614" y="91" class="m" font-size="9.5">ODBC 表函数</text>
    <text x="614" y="105" class="m" font-size="9.5">oracle_scanner</text>
    <line x1="92" y1="118" x2="92" y2="124" class="rule-soft"/>
    <line x1="237" y1="118" x2="237" y2="124" class="rule-soft"/>
    <line x1="382" y1="118" x2="382" y2="124" class="rule-soft"/>
    <line x1="527" y1="118" x2="527" y2="124" class="rule-soft"/>
    <line x1="672" y1="118" x2="672" y2="124" class="rule-soft"/>
    <line x1="92" y1="124" x2="672" y2="124" class="rule-soft"/>
    <line x1="390" y1="124" x2="390" y2="134" class="arrow" marker-end="url(#duck-f1-arrow)"/>
    <rect x="24" y="134" width="732" height="46" class="codebox"/>
    <text x="36" y="151" class="f" font-size="9" letter-spacing="0.6">扩展 // 翻译、下推、取回</text>
    <text x="36" y="169" class="t" font-size="10.5" font-weight="600">postgres · mysql · sqlite · iceberg/delta/httpfs · odbc / oracle_scanner</text>
    <line x1="390" y1="180" x2="390" y2="198" class="arrow" marker-end="url(#duck-f1-arrow)"/>
    <rect x="24" y="198" width="480" height="118" class="term"/>
    <text x="36" y="218" class="f" font-size="9" letter-spacing="0.6">DUCKDB 引擎 // 单一进程</text>
    <text x="36" y="244" class="t" font-size="13" font-weight="800">本地合并 · 聚合 · 排序</text>
    <text x="36" y="268" class="m" font-size="10.5">过滤与投影下推到各来源</text>
    <text x="36" y="286" class="m" font-size="10.5">通过的数据行在此物化</text>
    <text x="36" y="304" class="f" font-size="9.5">没有全局快照 · 没有跨来源事务</text>
    <rect x="520" y="198" width="236" height="118" class="box"/>
    <text x="532" y="218" class="f" font-size="9" letter-spacing="0.6">结果</text>
    <text x="532" y="244" class="t" font-size="13" font-weight="800">一张表</text>
    <text x="532" y="268" class="m" font-size="10.5">Arrow · Parquet · CSV</text>
    <text x="532" y="286" class="m" font-size="10.5">合并在本地发生</text>
    <text x="532" y="304" class="f" font-size="9.5">来源彼此不会看到对方</text>
    <line x1="506" y1="257" x2="518" y2="257" class="arrow" marker-end="url(#duck-f1-arrow)"/>
    <line x1="24" y1="336" x2="756" y2="336" class="rule"/>
    <text x="24" y="354" class="f" font-size="8.5" letter-spacing="0.8">枢纽不提供什么</text>
    <rect x="24" y="364" width="236" height="58" class="term"/>
    <text x="36" y="386" class="t" font-size="10.5" font-weight="800">全局快照</text>
    <text x="36" y="402" class="m" font-size="9.5">每个来源各自的时间</text>
    <rect x="272" y="364" width="236" height="58" class="box"/>
    <text x="284" y="386" class="t" font-size="10.5" font-weight="800">分布式提交</text>
    <text x="284" y="402" class="m" font-size="9.5">一个事务只能写一个来源</text>
    <rect x="520" y="364" width="236" height="58" class="term"/>
    <text x="532" y="386" class="t" font-size="10.5" font-weight="800">数据仓库</text>
    <text x="532" y="402" class="m" font-size="9.5">单节点，不是集群</text>
  </svg>
  </div>
  <p class="mfig-fig-src">ATTACH · ODBC · ORACLE_SCANNER · 本地合并</p>
</figure>

## 从 DuckDB 查 Oracle：ODBC，或原生扫描器

Oracle 是证明规则的例外。DuckDB 没有核心的 `oracle` 扩展，不能像 `postgres` 那样把 Oracle catalog 挂进来。官方路线是 `odbc_scanner` 扩展，通过 Oracle 的 ODBC 驱动通信。在 Linux 与 macOS 上，这意味着 unixODBC、Oracle Instant Client，以及安装在 DuckDB 主机上的 Oracle ODBC 驱动。

```sql
LOAD odbc;
-- CLI 示例：密码由环境注入。
-- 应用程序里请由 secret manager 传入连接字符串。
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

这是表函数，不是 catalog。`odbc_query` 返回一个结果集；与 PostgreSQL 的合并在 DuckDB 里发生。这个差别会出现在查询计划与性能曲线上。Oracle 在 ODBC 扩展的类型支持是 Tier 1，这比大多数来源都好；但 ODBC 本身是以数据行为单位的 API。扩展文档说得很直白：查询处理严格单线程，而且扩展不允许同一个连接被多个线程同时使用。大量 Oracle 导出时，请开多条连接，或先把工作推回 Oracle SQL，再让结果过网络。

还有一个较新的替代品：社区扩展 `oracle_scanner`。它直接使用 Oracle 的 TNS/TTC 协议，不需要 Instant Client，支持 `ATTACH`、过滤与合并下推、并行扫描，以及 DuckDB 事务内的写入。对较重的 Oracle 工作负载，它可能是更好的工具。它是社区扩展，不是核心扩展，所以版本兼容性与支持要列入评估。官方 ODBC 路线是保守选择；原生扫描器是性能选择。

## Oracle 查其他数据库：异构服务与网关

反方向更老、也更正式。当应用程序住在 Oracle 里，需要通过数据库链接读一张 PostgreSQL 或 MySQL 表，Oracle 不会用 DuckDB。它用异构服务（Heterogeneous Services，HS）加一个数据库网关。ODBC 来源的通用网关是 Oracle Database Gateway for ODBC，通常叫 DG4ODBC。

这条链有五个组件：

1. **Oracle 数据库里的异构服务。** 它把 Oracle SQL 翻译成远程方言、映射元数据，并协调 session。
2. **Oracle Net。** 数据库通过监听器条目连到网关，连接描述符带着 `(HS=OK)`。
3. **网关进程**（`dg4odbc`），放在自己的 Oracle home。它是独立可执行文件，不是数据库内的库。
4. **网关主机上的 ODBC 驱动管理器与驱动。** 驱动必须跟网关在同一台机器；非 Oracle 数据库可以在别处。
5. **Oracle 里的数据库链接。** 链接就是 SQL 接口：`SELECT ... FROM "orders"@erp`。

<figure class="mfig-fig mfig-fig-arch">
  <figcaption>
    <span class="card-tag">另一个方向 // 02</span>
    <h3 class="mfig-fig-title">Oracle 通过网关发问，不是通过 DuckDB</h3>
    <p class="mfig-fig-sub">异构服务翻译查询，Oracle Net 送到 dg4odbc 进程，网关再通过 ODBC 驱动连接到非 Oracle 数据库。数据库链接是应用程序唯一看到的 SQL 接口。</p>
  </figcaption>
  <div class="mfig-scroll">
  <svg class="mfig-svg" viewBox="0 0 780 410" role="img" aria-labelledby="duck-f2-title duck-f2-desc">
    <title id="duck-f2-title">Oracle Database Gateway for ODBC 架构</title>
    <desc id="duck-f2-desc">Oracle 数据库解析查询，经由异构服务与 Oracle Net 送到 dg4odbc 网关；网关再用 ODBC 驱动管理器与驱动连接到非 Oracle 数据库。数据库链接是 SQL 接口。网关仅支持单一站点：没有分布式事务、没有共享数据库链接、没有 CONNECT BY、ROWID、EXPLAIN PLAN 或存储过程。</desc>
    <defs>
      <marker id="duck-f2-arrow" viewBox="0 0 5 5" refX="4.4" refY="2.5" markerWidth="5" markerHeight="5" markerUnits="userSpaceOnUse" orient="auto"><path d="M0 0 L5 2.5 L0 5 z" fill="var(--mono-ink)"/></marker>
    </defs>
    <text x="24" y="18" class="f" font-size="9" letter-spacing="1.1">ORACLE // 异构服务</text>
    <text x="756" y="18" class="f" font-size="9" text-anchor="end" letter-spacing="1">联邦查询的另一个方向</text>
    <line x1="24" y1="27" x2="756" y2="27" class="rule"/>
    <text x="24" y="46" class="f" font-size="8.5" letter-spacing="0.8">ORACLE 发问 // 一个数据库链接，五个组件</text>
    <rect x="24" y="50" width="180" height="92" class="term"/>
    <text x="36" y="70" class="f" font-size="9" letter-spacing="0.6">ORACLE 数据库</text>
    <text x="36" y="94" class="t" font-size="13" font-weight="800">SQL + HS</text>
    <text x="36" y="112" class="m" font-size="9.5">异构服务</text>
    <text x="36" y="127" class="m" font-size="9.5">翻译 + 协调</text>
    <rect x="224" y="64" width="100" height="64" class="box"/>
    <text x="236" y="84" class="f" font-size="9" letter-spacing="0.6">ORACLE NET</text>
    <text x="236" y="106" class="t" font-size="11" font-weight="800">(HS=OK)</text>
    <text x="236" y="122" class="f" font-size="8.5">监听器</text>
    <rect x="344" y="64" width="140" height="64" class="codebox"/>
    <text x="356" y="84" class="f" font-size="9" letter-spacing="0.6">DG4ODBC</text>
    <text x="356" y="106" class="t" font-size="11" font-weight="800">网关</text>
    <text x="356" y="122" class="f" font-size="8.5">initSID.ora</text>
    <rect x="504" y="64" width="110" height="64" class="box"/>
    <text x="516" y="84" class="f" font-size="9" letter-spacing="0.6">ODBC</text>
    <text x="516" y="106" class="t" font-size="11" font-weight="800">驱动</text>
    <text x="516" y="122" class="f" font-size="8.5">管理器 + 驱动</text>
    <rect x="634" y="64" width="122" height="64" class="term"/>
    <text x="646" y="84" class="f" font-size="9" letter-spacing="0.6">非 ORACLE</text>
    <text x="646" y="106" class="t" font-size="11" font-weight="800">数据库</text>
    <text x="646" y="122" class="f" font-size="8.5">Postgres · MySQL</text>
    <line x1="204" y1="96" x2="222" y2="96" class="arrow" marker-end="url(#duck-f2-arrow)"/>
    <line x1="324" y1="96" x2="342" y2="96" class="arrow" marker-end="url(#duck-f2-arrow)"/>
    <line x1="484" y1="96" x2="502" y2="96" class="arrow" marker-end="url(#duck-f2-arrow)"/>
    <line x1="614" y1="96" x2="632" y2="96" class="arrow" marker-end="url(#duck-f2-arrow)"/>
    <path d="M114 142 V164 H414 V130" class="dash" fill="none" marker-end="url(#duck-f2-arrow)"/>
    <text x="264" y="180" class="f" font-size="8.5" text-anchor="middle" letter-spacing="0.5">DATABASE LINK // TNS 别名 → (HS=OK)</text>
    <line x1="24" y1="198" x2="756" y2="198" class="rule"/>
    <text x="24" y="216" class="f" font-size="8.5" letter-spacing="0.8">必要组件 // 每个 ODBC 来源一个网关 SID</text>
    <rect x="24" y="226" width="136" height="56" class="box"/>
    <text x="34" y="246" class="t mono" font-size="10" font-weight="800">网关 HOME</text>
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
    <text x="24" y="320" class="f" font-size="8.5" letter-spacing="0.8">网关不做什么</text>
    <rect x="24" y="330" width="236" height="64" class="term"/>
    <text x="36" y="352" class="t" font-size="10.5" font-weight="800">分布式事务</text>
    <text x="36" y="370" class="m" font-size="9.5">仅单一站点；没有两阶段提交</text>
    <rect x="272" y="330" width="236" height="64" class="box"/>
    <text x="284" y="352" class="t" font-size="10.5" font-weight="800">共享 DB LINK</text>
    <text x="284" y="370" class="m" font-size="9.5">每个 session 一个 agent</text>
    <rect x="520" y="330" width="236" height="64" class="term"/>
    <text x="532" y="352" class="t" font-size="10.5" font-weight="800">完整 SQL</text>
    <text x="532" y="370" class="m" font-size="9.5">没有 CONNECT BY / ROWID / 存储过程</text>
  </svg>
  </div>
  <p class="mfig-fig-src">ORACLE 19c 文档 // DATABASE GATEWAY FOR ODBC · HETEROGENEOUS SERVICES</p>
</figure>

<figure class="fig">
  <img src="/images/duckdb-oracle/fig-oracle-gateway.webp" alt="Oracle Database Gateway for ODBC 官方架构图：客户端经 Oracle Net 连接到 Oracle 数据库，数据库再通过网关与 ODBC 驱动程序访问非 Oracle 系统。" width="548" height="444" loading="lazy" />
  <figcaption><b>官方图示</b> — Oracle Database Gateway for ODBC 文档 Figure 1-1。客户端经 Oracle Net 进入 Oracle 数据库；数据库把查询经异构服务与 Oracle Net 交给同一台机器上的 <code>dg4odbc</code> 网关，网关再经 ODBC 驱动管理器和驱动程序到达非 Oracle 系统。虚线框是 Oracle 标注的非 Oracle 组件。上面的手绘图就是把这幅图重新排版，并补上单一来源与事务限制。来源：<a href="https://docs.oracle.com/en/database/oracle/oracle-database/19/odbcu/database-gateway-odbc-introduction.html">Oracle Database Gateway for ODBC — Introduction</a></figcaption>
</figure>

最小配置长这样。把示例 `initdg4odbc.ora` 复制成 `init<sid>.ora`，指向一个 ODBC 来源：

```ini
# $ORACLE_HOME/hs/admin/initSID.ora
HS_FDS_CONNECT_INFO=ORCL_ODBC
HS_FDS_TRACE_LEVEL=OFF
```

`ORCL_ODBC` 是网关主机上的 DSN。在 Linux 上，驱动注册在 `odbcinst.ini`，DSN 放在 `odbc.ini`；在 Windows 上，用 ODBC 数据源管理器。网关与驱动必须在同一台机器。

监听器为这个 SID 启动 `dg4odbc`：

```ini
# listener.ora
SID_LIST_LISTENER=
  (SID_LIST=
    (SID_DESC=
      (SID_NAME=dg4odbc)
      (ORACLE_HOME=/u01/app/oracle/product/gateway)
      (PROGRAM=dg4odbc)))
```

Oracle 数据库需要一个带 `(HS=OK)` 的连接描述符：

```ini
# tnsnames.ora
DG4ODBC=
  (DESCRIPTION=
    (ADDRESS=(PROTOCOL=TCP)(HOST=gw.internal)(PORT=1521))
    (CONNECT_DATA=(SID=dg4odbc))
    (HS=OK))
```

然后建立链接：

```sql
CREATE PUBLIC DATABASE LINK erp
  CONNECT TO "reader" IDENTIFIED BY "..." USING 'DG4ODBC';

SELECT * FROM "orders"@erp WHERE ROWNUM <= 10;
```

本地表与远程表可以在同一个 Oracle 查询里相遇：

```sql
SELECT d.name, sum(o.total) AS revenue
FROM departments d
JOIN "orders"@erp o ON o.dept_id = d.id
GROUP BY d.name;
```

每个 ODBC 来源都需要自己的网关 SID 与初始化文件；一个网关实例不是不相关来源的多路复用器。每个用户 session 也会拿到自己的 agent 进程。Oracle 文档把 ODBC 网关称为低端数据集成方案，这是对它范围的准确描述：它是用来对非 Oracle 系统做动态查询，不是用来大量搬数据或持续复制。如果来源是 SQL Server，Oracle 也有针对特定来源的网关；如果需求是变更捕获，GoldenGate 才是正确的工具类别，不是网关。如果远程是另一个 Oracle 数据库，普通数据库链接就够了，不需要网关。

限制才是决定架构的部分。Oracle 自己的清单说，网关不能参与分布式事务，只支持单一站点事务。它不支持存储过程、共享数据库链接、`CONNECT BY`、`ROWID`、`EXPLAIN PLAN`。`DBMS_HS_PASSTHROUGH` 的透传 SQL 可以补一些缺口，但那是逃生通道，不是通解。把本地 Oracle 表跟远程表合并的查询可以工作；同时写两边、要求原子性的事务不会。

## 合并到底在哪里发生

两套栈在图上看起来对称，负载下行为不同。DuckDB 里，引擎为每个已挂载的数据库开一个事务，读取每个来源，在本地合并。`ATTACH` 文档说得很清楚：事务只在各自数据库内原子，不是跨已挂载数据库；单个事务只能写入一个已挂载数据库。联邦不会改变这件事。

Oracle 里，数据库解析查询，HS 尽可能翻译，网关通过 ODBC 取回行，Oracle 通常在这个阶段执行合并。网关不是拥有远程完整统计信息的对等优化器，它是翻译器与管道。复杂的远程查询，通过 `DBMS_HS_PASSTHROUGH` 送原生 SQL 可能更好，让远程数据库用自己的计划。

| 问题 | DuckDB 发问 | Oracle 发问 |
| :--- | :--- | :--- |
| 谁解析查询？ | DuckDB | Oracle |
| 合并在哪里执行？ | DuckDB 进程内 | Oracle 内，网关取回行之后 |
| 来源如何暴露？ | `ATTACH` catalog 或表函数 | 通过网关 SID 的数据库链接 |
| 什么会下推？ | 过滤与投影；部分扩展更多 | HS 与 ODBC 驱动能翻译的部分 |
| 事务呢？ | 一个事务一个写入来源；没有跨来源原子性 | 仅单一站点；没有分布式提交 |
| 最适合 | 分析师合并、导出、原型 | 需要链接的 Oracle 中心应用 |

这张表就是整个论点。联邦是一种查询模式，不是一致性模型。如果你需要全局快照、跨来源事务，或可重复的历史，你需要复制、CDC 或数据仓库。DuckDB 与 Oracle 网关都只是“问”的方法；两者都不是“保证”。

## 上线后会坏在哪里

- **数据搬迁就是成本。** 下推减少过网络的数据行，但跨来源合并仍会物化通过的数据行。看起来本地的查询，可能搬了几 GB。
- **没有全局快照。** 每个来源在自己的时间被读取。PostgreSQL 扫描与 Oracle 扫描之间，一行可能已经改了。`oracle_scanner` 可以为自己的 Oracle 读取钉住一个 SCN；它不能钉住 PostgreSQL。
- **事务在来源边界停止。** DuckDB 一个事务只能写一个已挂载数据库。Oracle 网关是单一站点。不要建立假设两阶段提交的工作流。
- **类型映射是惊喜所在。** 没有精度声明的 Oracle `NUMBER`、`TIMESTAMP WITH TIME ZONE`、`CLOB`、`BLOB` 是常客。测你真的用到的列，不要只测 `COUNT(*)`。
- **凭证与网络路径会变多。** 一个 DuckDB 脚本可能持有四个系统的连接字符串；Oracle 网关再加上网关 home、监听器、DSN 与数据库链接。用 secret、最小权限的只读账号，以及说得清楚的网络路径。
- **ODBC 不是高速的批量接口。** 以行为单位的抓取与单线程查询处理，让它不适合反复的大量导出。如果合并每小时跑一次，先把 Oracle 数据落到 Parquet 或 DuckDB。

## 一条决策规则

用 DuckDB：查询属于分析师、来源可以只读、数据量中等、结果只用一次。用 Oracle Database Gateway for ODBC：应用程序已经住在 Oracle 里、需要对非 Oracle 系统开数据库链接、量不大。两者都不要用：需求是持续复制、全局历史，或定时跑的高量合并；那是数据管道的问题，应该由管道工具负责。

DuckDB 配得上“万能”的地方，是一个引擎能对很多来源说话。它配不上的地方，是取代这些来源的优化器、事务与治理。有用的架构，是能说清楚三件事的架构：谁在发问、数据行在哪里移动、事务在哪里结束。这三个答案一旦明确，SQL 就简单了。

## 参考资料

- [Announcing DuckDB 2.0.1 LTS](https://duckdb.org/2026/11/20/announcing-duckdb-201.html) — 现行 LTS 版本与支持期。
- [DuckDB PostgreSQL extension](https://duckdb.org/docs/2.0/core_extensions/postgres/overview.html) — `ATTACH`、连接字符串、下推与事务。
- [DuckDB MySQL extension](https://duckdb.org/docs/2.0/core_extensions/mysql.html) — MySQL 与 MariaDB 的同一套模式。
- [DuckDB SQLite extension](https://duckdb.org/docs/2.0/core_extensions/sqlite.html) — 挂载本地数据库文件。
- [DuckDB ODBC extension](https://duckdb.org/docs/2.0/core_extensions/odbc/overview.html) — Oracle 类型支持、驱动配置与并发限制。
- [DuckDB `ATTACH` and `DETACH`](https://duckdb.org/docs/2.0/sql/statements/attach.html) — 跨已挂载数据库的事务语义。
- [DuckDB Iceberg extension](https://duckdb.org/docs/2.0/core_extensions/iceberg/overview.html) — 从对象存储读 Iceberg 表。
- [DuckDB Delta extension](https://duckdb.org/docs/2.0/core_extensions/delta.html) — 从对象存储读 Delta Lake 表。
- [DuckDB `oracle_scanner` community extension](https://duckdb.org/community_extensions/extensions/oracle_scanner.html) — 原生 TNS/TTC 替代方案。
- [Oracle Database Gateway for ODBC: Introduction](https://docs.oracle.com/en/database/oracle/oracle-database/19/odbcu/database-gateway-odbc-introduction.html) — HS 与网关架构。
- [Oracle Database Gateway for ODBC: Features and Restrictions](https://docs.oracle.com/en/database/oracle/oracle-database/19/odbcu/database-gateway-odbc-features.html) — 决定设计的限制。
- [Configuring Oracle Database Gateway for ODBC](https://docs.oracle.com/en/database/oracle/oracle-database/19/otgiw/config-odbc-gateway.html) — 初始化文件、监听器、`tnsnames.ora` 与数据库链接。
- [Oracle Database Heterogeneous Connectivity User's Guide](https://docs.oracle.com/en/database/oracle/oracle-database/19/heter/index.html) — 每个网关背后的通用 HS 行为。
