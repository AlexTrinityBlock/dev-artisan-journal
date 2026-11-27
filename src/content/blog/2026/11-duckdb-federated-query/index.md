---
title: "DuckDB: The Universal Cross-Database Query Tool"
description: "How DuckDB federates PostgreSQL, MySQL, SQLite, object storage, and Oracle in one query — and which Oracle gateway components you need when Oracle is the one asking."
pubDate: 2026-11-26
category: "Data"
tags: ["DuckDB", "Federated Query", "Oracle", "ODBC", "Data Engineering"]
featured: false
author: "Alex.Hsiao"
readTime: "12 min read"
cardImage: "./cover.webp"
cardImageAlt: "Oracle Database Gateway for ODBC architecture: a client, Oracle, a dg4odbc gateway, and a non-Oracle system"
---

# DuckDB: The Universal Cross-Database Query Tool

DuckDB is usually described as an analytics database that runs inside your process. That is accurate, and it undersells what the tool has become. In 2026, DuckDB is also the shortest path between databases that were never designed to meet: a PostgreSQL table, a MySQL table, a Parquet file on S3, and a table in Oracle, joined by one SQL statement.

The useful word for this is federation. The dangerous word is universal. DuckDB can reach a remarkable number of sources, but it does not turn them into one database. It reads each source through an extension, moves the rows it needs into one process, and performs the join locally. Oracle has a second federation stack for the opposite direction. Knowing which side is asking is the difference between a clean architecture and a distributed transaction that never was.

<p class="mfig-source-note"><span class="mfig-source-label">SOURCES // DUCKDB + ORACLE</span> <a href="https://duckdb.org/docs/2.0/">DuckDB 2.0 documentation</a> <em>and</em> <a href="https://docs.oracle.com/en/database/oracle/oracle-database/19/odbcu/database-gateway-odbc-introduction.html">Oracle Database Gateway for ODBC</a></p>

<figure class="fig">
  <img src="/images/duckdb-oracle/fig-oracle-gateway.webp" alt="Oracle Database Gateway for ODBC architecture: a client reaches Oracle through Oracle Net, and Oracle passes the query through a gateway and ODBC driver to a non-Oracle system." width="548" height="444" loading="lazy" />
  <figcaption><b>Official figure</b> — Oracle Database Gateway for ODBC, Figure 1-1. A client reaches Oracle through Oracle Net; the database passes the query through Heterogeneous Services and Oracle Net to a <code>dg4odbc</code> gateway on the same machine, which reaches the non-Oracle system through an ODBC driver manager and driver. Dashed components are non-Oracle. A redrawn plate later in this article reworks this architecture and adds the single-source and transaction limits. Source: <a href="https://docs.oracle.com/en/database/oracle/oracle-database/19/odbcu/database-gateway-odbc-introduction.html">Oracle Database Gateway for ODBC — Introduction</a></figcaption>
</figure>

## Two directions, two stacks

Federation is a direction, not a product. When DuckDB asks, the extensions are the interface: `postgres`, `mysql`, `sqlite`, `iceberg`, `delta`, `httpfs`, and `odbc_scanner`. When Oracle asks, the interface is Oracle's own: Heterogeneous Services, a database gateway, Oracle Net, and a database link.

The two stacks can point at the same data and still behave differently. DuckDB pulls rows into a local process and joins them there. Oracle translates a query through Heterogeneous Services, sends it to a gateway process, and treats the result like a remote table. Neither one gives you a distributed database. Both are ways to ask several systems one question.

## DuckDB as the query hub

The core trick is `ATTACH`. PostgreSQL, MySQL, SQLite, and Iceberg catalogs can be attached as databases; after that, their tables look like local tables with a catalog prefix. DuckDB 2.0 also added `CONNECT`, which routes a session to an attached PostgreSQL or MySQL database and ships the query to that server instead of pulling every row first. For an analyst who wants to join two systems once, `ATTACH` is usually enough.

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

Two details matter more than the syntax. First, `READ_ONLY` is not a limitation; it is a safety measure. Analytical federation should not accidentally write to an operational database. Second, the join runs in DuckDB. PostgreSQL may filter `customers` and MySQL may filter `orders`, but neither database knows about the other. The rows that survive the filters travel to DuckDB and meet there.

For object storage, the pattern is the same with different extensions: `iceberg_scan`, `delta_scan`, or a direct `read_parquet` over `s3://`. A single query can join a MySQL dimension table to a year of Parquet events, which is a common shape for a reporting job that does not justify a warehouse.

<figure class="mfig-fig mfig-fig-arch">
  <figcaption>
    <span class="card-tag">THE ARCHITECTURE // 01</span>
    <h3 class="mfig-fig-title">DuckDB is a query hub, not a distributed database</h3>
    <p class="mfig-fig-sub">One process reads every source through an extension, pushes down what each source can answer, and joins the surviving rows locally. The sources never see each other.</p>
  </figcaption>
  <div class="mfig-scroll">
  <svg class="mfig-svg" viewBox="0 0 780 436" role="img" aria-labelledby="duck-f1-title duck-f1-desc">
    <title id="duck-f1-title">DuckDB as a cross-database federation hub</title>
    <desc id="duck-f1-desc">DuckDB reads PostgreSQL, MySQL, SQLite, Iceberg, Delta, Parquet, and Oracle through extensions, pushes filters and projections where it can, and performs the cross-source join in its own process. The result can leave as Arrow, Parquet, or CSV. The hub does not provide a global snapshot, a distributed commit, or a cluster.</desc>
    <defs>
      <marker id="duck-f1-arrow" viewBox="0 0 5 5" refX="4.4" refY="2.5" markerWidth="5" markerHeight="5" markerUnits="userSpaceOnUse" orient="auto"><path d="M0 0 L5 2.5 L0 5 z" fill="var(--mono-ink)"/></marker>
    </defs>
    <text x="24" y="18" class="f" font-size="9" letter-spacing="1.1">DUCKDB // FEDERATION HUB</text>
    <text x="756" y="18" class="f" font-size="9" text-anchor="end" letter-spacing="1">ONE QUERY, ONE LOCAL JOIN</text>
    <line x1="24" y1="27" x2="756" y2="27" class="rule"/>
    <text x="24" y="46" class="f" font-size="8.5" letter-spacing="0.8">SOURCES // READ AT QUERY TIME</text>
    <rect x="24" y="54" width="136" height="64" class="box"/>
    <text x="34" y="74" class="t" font-size="12.5" font-weight="800">POSTGRESQL</text>
    <text x="34" y="91" class="m" font-size="9.5">ATTACH · pushdown</text>
    <text x="34" y="105" class="m" font-size="9.5">catalog</text>
    <rect x="169" y="54" width="136" height="64" class="term"/>
    <text x="179" y="74" class="t" font-size="12.5" font-weight="800">MYSQL</text>
    <text x="179" y="91" class="m" font-size="9.5">ATTACH · pushdown</text>
    <text x="179" y="105" class="m" font-size="9.5">catalog</text>
    <rect x="314" y="54" width="136" height="64" class="box"/>
    <text x="324" y="74" class="t" font-size="12.5" font-weight="800">SQLITE</text>
    <text x="324" y="91" class="m" font-size="9.5">ATTACH · local file</text>
    <text x="324" y="105" class="m" font-size="9.5">catalog</text>
    <rect x="459" y="54" width="136" height="64" class="term"/>
    <text x="469" y="74" class="t" font-size="12.5" font-weight="800">OBJECT STORE</text>
    <text x="469" y="91" class="m" font-size="9.5">Iceberg · Delta</text>
    <text x="469" y="105" class="m" font-size="9.5">Parquet on S3</text>
    <rect x="604" y="54" width="136" height="64" class="box"/>
    <text x="614" y="74" class="t" font-size="12.5" font-weight="800">ORACLE</text>
    <text x="614" y="91" class="m" font-size="9.5">ODBC table function</text>
    <text x="614" y="105" class="m" font-size="9.5">oracle_scanner</text>
    <line x1="92" y1="118" x2="92" y2="124" class="rule-soft"/>
    <line x1="237" y1="118" x2="237" y2="124" class="rule-soft"/>
    <line x1="382" y1="118" x2="382" y2="124" class="rule-soft"/>
    <line x1="527" y1="118" x2="527" y2="124" class="rule-soft"/>
    <line x1="672" y1="118" x2="672" y2="124" class="rule-soft"/>
    <line x1="92" y1="124" x2="672" y2="124" class="rule-soft"/>
    <line x1="390" y1="124" x2="390" y2="134" class="arrow" marker-end="url(#duck-f1-arrow)"/>
    <rect x="24" y="134" width="732" height="46" class="codebox"/>
    <text x="36" y="151" class="f" font-size="9" letter-spacing="0.6">EXTENSIONS // TRANSLATE, PUSH DOWN, FETCH</text>
    <text x="36" y="169" class="t" font-size="10.5" font-weight="600">postgres · mysql · sqlite · iceberg/delta/httpfs · odbc / oracle_scanner</text>
    <line x1="390" y1="180" x2="390" y2="198" class="arrow" marker-end="url(#duck-f1-arrow)"/>
    <rect x="24" y="198" width="480" height="118" class="term"/>
    <text x="36" y="218" class="f" font-size="9" letter-spacing="0.6">DUCKDB ENGINE // SINGLE PROCESS</text>
    <text x="36" y="244" class="t" font-size="13" font-weight="800">LOCAL JOIN · AGGREGATE · SORT</text>
    <text x="36" y="268" class="m" font-size="10.5">filters and projections pushed to each source</text>
    <text x="36" y="286" class="m" font-size="10.5">the rows that survive are materialized here</text>
    <text x="36" y="304" class="f" font-size="9.5">no global snapshot · no cross-source transaction</text>
    <rect x="520" y="198" width="236" height="118" class="box"/>
    <text x="532" y="218" class="f" font-size="9" letter-spacing="0.6">RESULT</text>
    <text x="532" y="244" class="t" font-size="13" font-weight="800">ONE TABLE</text>
    <text x="532" y="268" class="m" font-size="10.5">Arrow · Parquet · CSV</text>
    <text x="532" y="286" class="m" font-size="10.5">the join is local</text>
    <text x="532" y="304" class="f" font-size="9.5">the sources never see each other</text>
    <line x1="506" y1="257" x2="518" y2="257" class="arrow" marker-end="url(#duck-f1-arrow)"/>
    <line x1="24" y1="336" x2="756" y2="336" class="rule"/>
    <text x="24" y="354" class="f" font-size="8.5" letter-spacing="0.8">WHAT THE HUB DOES NOT PROVIDE</text>
    <rect x="24" y="364" width="236" height="58" class="term"/>
    <text x="36" y="386" class="t" font-size="10.5" font-weight="800">GLOBAL SNAPSHOT</text>
    <text x="36" y="402" class="m" font-size="9.5">each source at its own time</text>
    <rect x="272" y="364" width="236" height="58" class="box"/>
    <text x="284" y="386" class="t" font-size="10.5" font-weight="800">DISTRIBUTED COMMIT</text>
    <text x="284" y="402" class="m" font-size="9.5">one writer per transaction</text>
    <rect x="520" y="364" width="236" height="58" class="term"/>
    <text x="532" y="386" class="t" font-size="10.5" font-weight="800">A DATA WAREHOUSE</text>
    <text x="532" y="402" class="m" font-size="9.5">single node, not a cluster</text>
  </svg>
  </div>
  <p class="mfig-fig-src">ATTACH · ODBC · ORACLE_SCANNER · LOCAL JOIN</p>
</figure>

## Oracle from DuckDB: ODBC, or a native scanner

Oracle is the exception that proves the rule. There is no core `oracle` extension that attaches an Oracle catalog the way `postgres` does. The official route is the `odbc_scanner` extension, which talks to Oracle through its ODBC driver. On Linux and macOS that means unixODBC, Oracle Instant Client, and the Oracle ODBC driver installed on the machine running DuckDB.

```sql
LOAD odbc;
-- CLI example: inject the password from the environment.
-- In an application, pass the connection string from your secret manager.
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

This is a table function, not a catalog. `odbc_query` returns a result set; the join with PostgreSQL happens in DuckDB. That difference is visible in the query plan and in the performance profile. Oracle is Tier 1 in the ODBC extension's type coverage, which is better than most sources get, but ODBC itself is a row-oriented API. The extension's own documentation is blunt: query processing is strictly single-threaded, and the extension does not allow the same connection to be used from multiple threads. For a large Oracle extract, use several connections or move the work into Oracle SQL before it crosses the wire.

There is a newer alternative: the community `oracle_scanner` extension. It speaks Oracle's TNS/TTC protocol directly, needs no Instant Client, and supports `ATTACH`, filter and join pushdown, parallel scans, and writes inside DuckDB transactions. For a heavy Oracle workload it can be the better tool. It is a community extension, not a core one, so version compatibility and support are part of the evaluation. The official ODBC path is the conservative choice; the native scanner is the performance choice.

## Oracle to everything else: Heterogeneous Services and a gateway

The opposite direction is older and more formal. When an application lives in Oracle and needs to read a PostgreSQL or MySQL table through a database link, Oracle does not use DuckDB. It uses Heterogeneous Services (HS) plus a database gateway. The generic gateway for an ODBC source is Oracle Database Gateway for ODBC, usually called DG4ODBC.

The chain has five pieces:

1. **Heterogeneous Services** inside the Oracle database. It translates Oracle SQL into the remote dialect, maps metadata, and coordinates the session.
2. **Oracle Net.** The database connects to the gateway through a listener entry, and the connect descriptor carries `(HS=OK)`.
3. **The gateway process** (`dg4odbc`) in its own Oracle home. It is a separate executable, not a library inside the database.
4. **An ODBC driver manager and driver** on the gateway host. The driver must be on the same machine as the gateway; the non-Oracle database can be elsewhere.
5. **A database link** in Oracle. The link is the SQL surface: `SELECT ... FROM "orders"@erp`.

<figure class="mfig-fig mfig-fig-arch">
  <figcaption>
    <span class="card-tag">THE OTHER DIRECTION // 02</span>
    <h3 class="mfig-fig-title">Oracle asks through a gateway, not through DuckDB</h3>
    <p class="mfig-fig-sub">Heterogeneous Services translates the query, Oracle Net carries it to a dg4odbc process, and the gateway reaches the non-Oracle database through an ODBC driver. The database link is the only SQL surface the application sees.</p>
  </figcaption>
  <div class="mfig-scroll">
  <svg class="mfig-svg" viewBox="0 0 780 410" role="img" aria-labelledby="duck-f2-title duck-f2-desc">
    <title id="duck-f2-title">Oracle Database Gateway for ODBC architecture</title>
    <desc id="duck-f2-desc">An Oracle database parses a query and passes it through Heterogeneous Services and Oracle Net to a dg4odbc gateway, which uses an ODBC driver manager and driver to reach a non-Oracle database. A database link is the SQL surface. The gateway is single-site: no distributed transactions, no shared database links, no CONNECT BY, ROWID, EXPLAIN PLAN, or stored procedures.</desc>
    <defs>
      <marker id="duck-f2-arrow" viewBox="0 0 5 5" refX="4.4" refY="2.5" markerWidth="5" markerHeight="5" markerUnits="userSpaceOnUse" orient="auto"><path d="M0 0 L5 2.5 L0 5 z" fill="var(--mono-ink)"/></marker>
    </defs>
    <text x="24" y="18" class="f" font-size="9" letter-spacing="1.1">ORACLE // HETEROGENEOUS SERVICES</text>
    <text x="756" y="18" class="f" font-size="9" text-anchor="end" letter-spacing="1">THE OTHER FEDERATION DIRECTION</text>
    <line x1="24" y1="27" x2="756" y2="27" class="rule"/>
    <text x="24" y="46" class="f" font-size="8.5" letter-spacing="0.8">ORACLE ASKS // ONE DATABASE LINK, FIVE COMPONENTS</text>
    <rect x="24" y="50" width="180" height="92" class="term"/>
    <text x="36" y="70" class="f" font-size="9" letter-spacing="0.6">ORACLE DATABASE</text>
    <text x="36" y="94" class="t" font-size="13" font-weight="800">SQL + HS</text>
    <text x="36" y="112" class="m" font-size="9.5">Heterogeneous Services</text>
    <text x="36" y="127" class="m" font-size="9.5">translates + coordinates</text>
    <rect x="224" y="64" width="100" height="64" class="box"/>
    <text x="236" y="84" class="f" font-size="9" letter-spacing="0.6">ORACLE NET</text>
    <text x="236" y="106" class="t" font-size="11" font-weight="800">(HS=OK)</text>
    <text x="236" y="122" class="f" font-size="8.5">listener</text>
    <rect x="344" y="64" width="140" height="64" class="codebox"/>
    <text x="356" y="84" class="f" font-size="9" letter-spacing="0.6">DG4ODBC</text>
    <text x="356" y="106" class="t" font-size="11" font-weight="800">GATEWAY</text>
    <text x="356" y="122" class="f" font-size="8.5">initSID.ora</text>
    <rect x="504" y="64" width="110" height="64" class="box"/>
    <text x="516" y="84" class="f" font-size="9" letter-spacing="0.6">ODBC</text>
    <text x="516" y="106" class="t" font-size="11" font-weight="800">DRIVER</text>
    <text x="516" y="122" class="f" font-size="8.5">manager + driver</text>
    <rect x="634" y="64" width="122" height="64" class="term"/>
    <text x="646" y="84" class="f" font-size="9" letter-spacing="0.6">NON-ORACLE</text>
    <text x="646" y="106" class="t" font-size="11" font-weight="800">DATABASE</text>
    <text x="646" y="122" class="f" font-size="8.5">Postgres · MySQL</text>
    <line x1="204" y1="96" x2="222" y2="96" class="arrow" marker-end="url(#duck-f2-arrow)"/>
    <line x1="324" y1="96" x2="342" y2="96" class="arrow" marker-end="url(#duck-f2-arrow)"/>
    <line x1="484" y1="96" x2="502" y2="96" class="arrow" marker-end="url(#duck-f2-arrow)"/>
    <line x1="614" y1="96" x2="632" y2="96" class="arrow" marker-end="url(#duck-f2-arrow)"/>
    <path d="M114 142 V164 H414 V130" class="dash" fill="none" marker-end="url(#duck-f2-arrow)"/>
    <text x="264" y="180" class="f" font-size="8.5" text-anchor="middle" letter-spacing="0.5">DATABASE LINK // TNS ALIAS → (HS=OK)</text>
    <line x1="24" y1="198" x2="756" y2="198" class="rule"/>
    <text x="24" y="216" class="f" font-size="8.5" letter-spacing="0.8">REQUIRED COMPONENTS // ONE GATEWAY SID PER ODBC SOURCE</text>
    <rect x="24" y="226" width="136" height="56" class="box"/>
    <text x="34" y="246" class="t mono" font-size="10" font-weight="800">GATEWAY HOME</text>
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
    <text x="24" y="320" class="f" font-size="8.5" letter-spacing="0.8">WHAT THE GATEWAY DOES NOT DO</text>
    <rect x="24" y="330" width="236" height="64" class="term"/>
    <text x="36" y="352" class="t" font-size="10.5" font-weight="800">DISTRIBUTED TRANSACTIONS</text>
    <text x="36" y="370" class="m" font-size="9.5">single-site only; no two-phase commit</text>
    <rect x="272" y="330" width="236" height="64" class="box"/>
    <text x="284" y="352" class="t" font-size="10.5" font-weight="800">SHARED DB LINKS</text>
    <text x="284" y="370" class="m" font-size="9.5">one agent process per session</text>
    <rect x="520" y="330" width="236" height="64" class="term"/>
    <text x="532" y="352" class="t" font-size="10.5" font-weight="800">FULL SQL</text>
    <text x="532" y="370" class="m" font-size="9.5">no CONNECT BY / ROWID / procedures</text>
  </svg>
  </div>
  <p class="mfig-fig-src">ORACLE 19c DOCS // DATABASE GATEWAY FOR ODBC · HETEROGENEOUS SERVICES</p>
</figure>

A minimal configuration looks like this. Copy the sample `initdg4odbc.ora` to `init<sid>.ora` and point it at one ODBC source:

```ini
# $ORACLE_HOME/hs/admin/initSID.ora
HS_FDS_CONNECT_INFO=ORCL_ODBC
HS_FDS_TRACE_LEVEL=OFF
```

`ORCL_ODBC` is the DSN on the gateway host. On Linux, register the driver in `odbcinst.ini` and the DSN in `odbc.ini`; on Windows, use the ODBC Data Source Administrator. The gateway and the driver must be on the same machine.

The listener starts `dg4odbc` for that SID:

```ini
# listener.ora
SID_LIST_LISTENER=
  (SID_LIST=
    (SID_DESC=
      (SID_NAME=dg4odbc)
      (ORACLE_HOME=/u01/app/oracle/product/gateway)
      (PROGRAM=dg4odbc)))
```

The Oracle database needs a connect descriptor with `(HS=OK)`:

```ini
# tnsnames.ora
DG4ODBC=
  (DESCRIPTION=
    (ADDRESS=(PROTOCOL=TCP)(HOST=gw.internal)(PORT=1521))
    (CONNECT_DATA=(SID=dg4odbc))
    (HS=OK))
```

Then the link:

```sql
CREATE PUBLIC DATABASE LINK erp
  CONNECT TO "reader" IDENTIFIED BY "..." USING 'DG4ODBC';

SELECT * FROM "orders"@erp WHERE ROWNUM <= 10;
```

A local table and a remote table can meet in one Oracle query:

```sql
SELECT d.name, sum(o.total) AS revenue
FROM departments d
JOIN "orders"@erp o ON o.dept_id = d.id
GROUP BY d.name;
```

Each ODBC source needs its own gateway SID and its own initialization file; a gateway instance is not a multiplexer for unrelated sources. Each user session also gets its own agent process. Oracle's documentation calls the ODBC gateway a low-end data integration solution, and that is a fair description of its scope: it is for dynamic queries against a non-Oracle system, not for bulk movement or continuous replication. If the source is SQL Server, Oracle also documents a source-specific gateway; if the requirement is change capture, GoldenGate is the right category of tool, not a gateway. And if the remote system is another Oracle database, a database link is enough; no gateway is involved.

The restrictions are the part that decides architectures. Oracle's own list says the gateway cannot participate in distributed transactions and supports only single-site transactions. It does not support stored procedures, shared database links, `CONNECT BY`, `ROWID`, or `EXPLAIN PLAN`. Pass-through SQL through `DBMS_HS_PASSTHROUGH` can cover some gaps, but it is an escape hatch, not a general solution. A query that joins a local Oracle table to a remote table can work. A transaction that writes both sides atomically will not.

## Where the join actually happens

The two stacks look symmetrical in a diagram and behave differently under load. In DuckDB, the engine opens one transaction per attached database, reads each source, and joins the rows locally. DuckDB's `ATTACH` documentation is explicit: transactions are atomic within each database, not across attached databases, and a single transaction can write to only one attached database. Federation does not change that.

In Oracle, the database parses the query, HS translates what it can, the gateway fetches rows through ODBC, and Oracle normally performs the join. The gateway is not a peer optimizer with full statistics about the remote system. It is a translator and a pipe. Complex remote queries may be better sent through `DBMS_HS_PASSTHROUGH` as native SQL, where the remote database can use its own plan.

| Question | DuckDB asks | Oracle asks |
| :--- | :--- | :--- |
| Who parses the query? | DuckDB | Oracle |
| Where does the join run? | In the DuckDB process | In Oracle, after the gateway fetches rows |
| How is the source exposed? | `ATTACH` catalog or table function | Database link through a gateway SID |
| What is pushed down? | Filters and projections; more in some extensions | What HS and the ODBC driver can translate |
| What about transactions? | One writer per transaction; no cross-source atomicity | Single-site only; no distributed commit |
| Best fit | Analyst joins, exports, prototypes | Oracle-centric apps that need a link |

The table is the whole argument. Federation is a query pattern, not a consistency model. If you need a global snapshot, a cross-source transaction, or a repeatable history, you need replication, CDC, or a warehouse. DuckDB and the Oracle gateway are both ways to ask; neither is a way to promise.

## What breaks in production

- **Data movement is the cost.** Pushdown reduces the rows that cross the network, but a cross-source join still materializes the surviving rows. A query that looks local can move gigabytes.
- **There is no global snapshot.** Each source is read at its own time. A row can change between the PostgreSQL scan and the Oracle scan. The `oracle_scanner` extension can pin one SCN for its own Oracle reads; it cannot pin PostgreSQL.
- **Transactions stop at the source boundary.** DuckDB writes to one attached database per transaction. Oracle's gateway is single-site. Do not build a workflow that assumes a two-phase commit.
- **Type mapping is where surprises live.** Oracle `NUMBER` without precision, `TIMESTAMP WITH TIME ZONE`, `CLOB`, and `BLOB` are the usual suspects. Test the columns you actually use, not just `COUNT(*)`.
- **Credentials and network paths multiply.** A DuckDB script may hold connection strings for four systems; an Oracle gateway adds a gateway home, a listener, a DSN, and a database link. Use secrets, least-privilege readers, and a network path you can explain.
- **ODBC is not a fast bulk interface.** Row-oriented fetch and single-threaded query processing make it a poor fit for repeated large extracts. If the join is run every hour, land the Oracle data in Parquet or DuckDB first.

## A decision rule

Use DuckDB when the query belongs to an analyst, the sources can be read-only, the data volume is moderate, and the result is consumed once. Use Oracle Database Gateway for ODBC when the application already lives in Oracle and needs a database link to a non-Oracle system with modest volume. Use neither when the requirement is continuous replication, a global history, or a high-volume join that runs on a schedule; that is a data pipeline problem, and a pipeline tool should own it.

DuckDB earns the word "universal" in the sense that one engine can speak to many sources. It does not earn it in the sense that it replaces their optimizers, transactions, or governance. The useful architecture is the one that says which side is asking, where the rows move, and where the transaction ends. Once those three answers are explicit, the SQL is easy.

## References

- [Announcing DuckDB 2.0.1 LTS](https://duckdb.org/2026/11/20/announcing-duckdb-201.html) — the current LTS release and its support window.
- [DuckDB PostgreSQL extension](https://duckdb.org/docs/2.0/core_extensions/postgres/overview.html) — `ATTACH`, connection strings, pushdown, and transactions.
- [DuckDB MySQL extension](https://duckdb.org/docs/2.0/core_extensions/mysql.html) — the same pattern for MySQL and MariaDB.
- [DuckDB SQLite extension](https://duckdb.org/docs/2.0/core_extensions/sqlite.html) — attaching a local database file.
- [DuckDB ODBC extension](https://duckdb.org/docs/2.0/core_extensions/odbc/overview.html) — Oracle type coverage, driver setup, and concurrency limits.
- [DuckDB `ATTACH` and `DETACH`](https://duckdb.org/docs/2.0/sql/statements/attach.html) — transaction semantics across attached databases.
- [DuckDB Iceberg extension](https://duckdb.org/docs/2.0/core_extensions/iceberg/overview.html) — reading Iceberg tables from object storage.
- [DuckDB Delta extension](https://duckdb.org/docs/2.0/core_extensions/delta.html) — reading Delta Lake tables from object storage.
- [DuckDB `oracle_scanner` community extension](https://duckdb.org/community_extensions/extensions/oracle_scanner.html) — the native TNS/TTC alternative.
- [Oracle Database Gateway for ODBC: Introduction](https://docs.oracle.com/en/database/oracle/oracle-database/19/odbcu/database-gateway-odbc-introduction.html) — the HS and gateway architecture.
- [Oracle Database Gateway for ODBC: Features and Restrictions](https://docs.oracle.com/en/database/oracle/oracle-database/19/odbcu/database-gateway-odbc-features.html) — the limits that decide the design.
- [Configuring Oracle Database Gateway for ODBC](https://docs.oracle.com/en/database/oracle/oracle-database/19/otgiw/config-odbc-gateway.html) — the initialization file, listener, `tnsnames.ora`, and database link.
- [Oracle Database Heterogeneous Connectivity User's Guide](https://docs.oracle.com/en/database/oracle/oracle-database/19/heter/index.html) — the generic HS behavior behind every gateway.
