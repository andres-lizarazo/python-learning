import type { Module } from "../../../types/lesson";

// PostgreSQL — the SQL track's first (and currently only) subsection. Ported from the
// sql-learning notes (concepts.md), made interactive: every example runs against the
// seeded e-commerce database (src/sql/seeds.ts) via PGlite (real Postgres in WASM), and
// most lessons end with a checked exercise. The "vs MySQL" callouts are preserved.

export const postgres: Module = {
  id: "postgres",
  title: "PostgreSQL",
  blurb: "Query a real Postgres database in your browser — SELECT to window functions, JSONB, and plpgsql.",
  track: "SQL",
  level: "Intermediate",
  icon: "🐘",
  status: "deep",
  lessons: [
    // ───────────────────────────────────────────────────────── 1. SELECT + WHERE
    {
      id: "select-where",
      title: "SELECT & WHERE",
      summary: "Read rows, filter them, sort and paginate — plus DISTINCT and DISTINCT ON.",
      minutes: 12,
      blocks: [
        {
          kind: "prose",
          markdown: `## The basic building block

Postgres evaluates a query in this order — worth memorizing:

\`\`\`
FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY → LIMIT
\`\`\`

\`WHERE\` keeps only the rows you want. Combine conditions with \`AND\` / \`OR\` / \`NOT\`, match
lists with \`IN\`, ranges with \`BETWEEN\`, and text with \`LIKE\` (\`%\` = any chars, \`_\` = one).
\`ILIKE\` is case-insensitive.

> **Gotcha:** \`col = NULL\` never matches — NULL is "unknown". Always use \`IS NULL\` / \`IS NOT NULL\`.

> **vs MySQL:** \`ILIKE\` doesn't exist in MySQL (\`LIKE\` is already case-insensitive there). \`DISTINCT ON\` is Postgres-only. In ASC sorts, MySQL puts NULLs first; Postgres puts them last.`,
        },
        {
          kind: "sql-runnable",
          title: "Filter, sort, and limit",
          sql: `SELECT id, name, price, price * 1.19 AS price_with_tax
FROM products
WHERE price > 100
  AND name ILIKE '%a%'
ORDER BY price DESC
LIMIT 5;`,
        },
        {
          kind: "prose",
          markdown: `## DISTINCT and DISTINCT ON

\`DISTINCT\` returns unique rows. \`DISTINCT ON (col)\` — a Postgres special — returns the **first
row per group**; the \`ORDER BY\` must *start* with the same column(s).`,
        },
        {
          kind: "sql-runnable",
          title: "Cheapest product per category (DISTINCT ON)",
          sql: `SELECT DISTINCT ON (category_id)
    category_id, name, price
FROM products
ORDER BY category_id, price ASC;`,
        },
        {
          kind: "sql-challenge",
          title: "Premium products",
          prompt:
            "Return the `name` and `price` of every product that costs **more than 1000**, cheapest first.",
          starterSql: "SELECT name, price\nFROM products\n-- your turn\n;",
          solution: "SELECT name, price FROM products WHERE price > 1000 ORDER BY price ASC;",
          ordered: true,
          hints: ["Filter with `WHERE price > 1000`.", "Sort ascending with `ORDER BY price`."],
          xp: 40,
        },
      ],
    },

    // ───────────────────────────────────────────────────────────────── 2. JOINs
    {
      id: "joins",
      title: "JOINs",
      summary: "Combine tables: INNER, LEFT, FULL OUTER, self-joins, and LATERAL.",
      minutes: 15,
      blocks: [
        {
          kind: "prose",
          markdown: `## Joining tables

A join stitches rows from two tables on a condition.

- **INNER JOIN** — only rows with a match in both.
- **LEFT JOIN** — all left rows; NULLs on the right when there's no match.
- **FULL OUTER JOIN** — all rows from both sides.
- **Self-join** — a table joined to itself (e.g. category → parent).

> **Gotcha:** Putting a \`WHERE right.col = x\` on a LEFT JOIN silently turns it into an INNER JOIN
> (NULLs fail the test). Keep that filter in the \`ON\` clause instead.

> **vs MySQL:** \`FULL OUTER JOIN\` doesn't exist in MySQL (emulate with \`LEFT JOIN UNION RIGHT JOIN\`).`,
        },
        {
          kind: "prose",
          markdown: `## 🧭 Which join — and JOIN vs. EXISTS

- **INNER JOIN** — keep only rows that **match in both** tables.
- **LEFT JOIN** — keep **all left rows**, NULLs where the right has no match ("every user, plus their orders if any"). Add \`WHERE right.id IS NULL\` to find the **non-matches** (anti-join).
- **FULL OUTER JOIN** — unmatched rows from **both** sides (rare; reconciliation/diffing).
- **CROSS JOIN / LATERAL** — every combination, or "for each left row, run this subquery" (top-N per row).

**JOIN vs. EXISTS for "has a related row":**
- **\`EXISTS\`** when you only need to *test* for a match and want each left row **once** — a JOIN can multiply rows when the match is one-to-many.
- **JOIN** when you actually need the related table's **columns** in the output.

**Rule of thumb:** need their columns → JOIN; only checking existence → \`EXISTS\`; need rows with *no* match → LEFT JOIN + \`IS NULL\` (or \`NOT EXISTS\`).`,
        },
        {
          kind: "sql-runnable",
          title: "Orders with full detail (multi-table join)",
          sql: `SELECT u.name AS customer, o.id AS order_id, p.name AS product,
       oi.qty, oi.unit_price, (oi.qty * oi.unit_price) AS subtotal, o.status
FROM orders o
JOIN users u        ON u.id = o.user_id
JOIN order_items oi ON oi.order_id = o.id
JOIN products p     ON p.id = oi.product_id
ORDER BY o.created_at, u.name;`,
        },
        {
          kind: "sql-runnable",
          title: "Every user, even those with no orders (LEFT JOIN)",
          sql: `SELECT u.name, COUNT(o.id) AS total_orders
FROM users u
LEFT JOIN orders o ON o.user_id = u.id
GROUP BY u.id, u.name
ORDER BY total_orders DESC, u.name;`,
        },
        {
          kind: "prose",
          markdown: `## LATERAL — "for each row, run this subquery"

\`LATERAL\` lets a subquery in \`FROM\` reference columns to its left. Perfect for "most recent N per
row". The \`ON true\` is required because the correlation lives in the subquery's \`WHERE\`.`,
        },
        {
          kind: "sql-runnable",
          title: "Most recent order per user (LATERAL)",
          sql: `SELECT u.name, latest.total, latest.created_at
FROM users u
LEFT JOIN LATERAL (
    SELECT total, created_at
    FROM orders o
    WHERE o.user_id = u.id
    ORDER BY created_at DESC
    LIMIT 1
) AS latest ON true
ORDER BY u.name;`,
        },
        {
          kind: "sql-challenge",
          title: "Paid orders by value",
          prompt:
            "For every order with status `'paid'`, show the customer `name` and the order `total`, **highest total first**.",
          starterSql: "SELECT u.name, o.total\nFROM orders o\n-- join users and filter\n;",
          solution:
            "SELECT u.name, o.total FROM orders o JOIN users u ON u.id = o.user_id WHERE o.status = 'paid' ORDER BY o.total DESC;",
          ordered: true,
          hints: [
            "`JOIN users u ON u.id = o.user_id`.",
            "Filter `WHERE o.status = 'paid'`, then `ORDER BY o.total DESC`.",
          ],
          xp: 50,
        },
      ],
    },

    // ─────────────────────────────────────────────────── 3. GROUP BY + HAVING
    {
      id: "group-by",
      title: "GROUP BY, HAVING & Aggregates",
      summary: "Collapse rows into summaries — COUNT/SUM/AVG, HAVING, FILTER, and percentiles.",
      minutes: 14,
      blocks: [
        {
          kind: "prose",
          markdown: `## Aggregating

Aggregate functions (\`COUNT\`, \`SUM\`, \`AVG\`, \`MIN\`, \`MAX\`) collapse many rows into one per group.
\`WHERE\` filters rows **before** grouping; \`HAVING\` filters groups **after**.

Every non-aggregated column in \`SELECT\` must appear in \`GROUP BY\`.

The \`FILTER (WHERE …)\` clause does conditional aggregation cleanly — count/sum only matching rows.

> **vs MySQL:** \`FILTER\`, \`PERCENTILE_CONT\`, and \`GROUPING SETS\` don't exist in MySQL; \`string_agg\` is \`GROUP_CONCAT\`.`,
        },
        {
          kind: "prose",
          markdown: `## 🧭 WHERE vs. HAVING, and GROUP BY vs. window

- **WHERE** filters **individual rows before** grouping; **HAVING** filters **groups after** aggregation. If a condition doesn't involve an aggregate, put it in WHERE — it's cheaper (fewer rows to group). Use HAVING only for conditions on \`COUNT/SUM/AVG/...\`.
- **GROUP BY** when you want **one row per group** (the detail rows collapse).
- **Window function** (\`… OVER (PARTITION BY …)\`) when you want the aggregate **next to every original row** — running totals, "each row vs. its group's average", ranking. Rows are **kept**, not collapsed.

**Rule of thumb:** filtering raw rows → WHERE; filtering aggregates → HAVING. Need a per-group summary → GROUP BY; need the summary **and** the detail rows → window function.`,
        },
        {
          kind: "sql-runnable",
          title: "Per-user order summary with FILTER and CASE tiers",
          sql: `SELECT
    u.name,
    COUNT(o.id)                                            AS total_orders,
    COUNT(*) FILTER (WHERE o.status = 'paid')              AS paid_orders,
    SUM(o.total) FILTER (WHERE o.status = 'paid')          AS total_paid,
    ROUND(AVG(o.total) FILTER (WHERE o.status = 'paid'), 2) AS avg_paid
FROM users u
JOIN orders o ON o.user_id = u.id
GROUP BY u.id, u.name
HAVING COUNT(o.id) > 0
ORDER BY total_paid DESC NULLS LAST;`,
        },
        {
          kind: "sql-runnable",
          title: "Median & quartiles (ordered-set aggregates)",
          sql: `SELECT
    PERCENTILE_CONT(0.5)  WITHIN GROUP (ORDER BY price) AS median_price,
    PERCENTILE_CONT(0.25) WITHIN GROUP (ORDER BY price) AS p25,
    PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY price) AS p75
FROM products;`,
        },
        {
          kind: "sql-challenge",
          title: "Orders per status",
          prompt:
            "Count how many orders exist for each `status`. Return two columns: `status` and the count.",
          starterSql: "SELECT status, COUNT(*)\nFROM orders\n-- group it\n;",
          solution: "SELECT status, COUNT(*) AS n FROM orders GROUP BY status;",
          hints: ["`GROUP BY status`.", "`COUNT(*)` counts rows in each group."],
          xp: 40,
        },
      ],
    },

    // ─────────────────────────────────────────────────────────────────── 4. CASE
    {
      id: "case",
      title: "CASE expressions",
      summary: "SQL's if/else — in SELECT, ORDER BY, and inside aggregates for manual pivots.",
      minutes: 9,
      blocks: [
        {
          kind: "prose",
          markdown: `## CASE — conditional logic

\`CASE\` is SQL's if/else. The **searched** form tests boolean conditions; the **simple** form tests
equality against one expression. It works in \`SELECT\`, \`WHERE\`, \`ORDER BY\`, \`GROUP BY\`, and inside
aggregates (great for conditional sums and manual pivots).`,
        },
        {
          kind: "sql-runnable",
          title: "Bucket products into price tiers",
          sql: `SELECT name, price,
    CASE
        WHEN price < 50   THEN 'budget'
        WHEN price < 1000 THEN 'mid-range'
        ELSE 'premium'
    END AS price_tier
FROM products
ORDER BY price;`,
        },
        {
          kind: "sql-runnable",
          title: "Manual pivot — revenue by status, in columns",
          sql: `SELECT
    SUM(total) FILTER (WHERE status = 'paid')     AS paid,
    SUM(total) FILTER (WHERE status = 'refunded') AS refunded,
    SUM(total) FILTER (WHERE status = 'pending')  AS pending
FROM orders;`,
        },
        {
          kind: "sql-challenge",
          title: "Label products by price",
          prompt:
            "Return each product's `name` and a column `tier` that is `'expensive'` when `price >= 1000`, otherwise `'cheap'`. Order by `name`.",
          starterSql: "SELECT name,\n  -- CASE here AS tier\nFROM products\nORDER BY name;",
          solution:
            "SELECT name, CASE WHEN price >= 1000 THEN 'expensive' ELSE 'cheap' END AS tier FROM products ORDER BY name;",
          ordered: true,
          hints: ["`CASE WHEN price >= 1000 THEN 'expensive' ELSE 'cheap' END`."],
          xp: 40,
        },
      ],
    },

    // ───────────────────────────────────────────────── 5. Subqueries & EXISTS
    {
      id: "subqueries",
      title: "Subqueries & EXISTS",
      summary: "Queries inside queries — scalar, IN, correlated, EXISTS, and the NOT IN / NULL trap.",
      minutes: 12,
      blocks: [
        {
          kind: "prose",
          markdown: `## Subqueries

A subquery is a \`SELECT\` nested in another query:

- **Scalar** — returns one value, usable anywhere a value is.
- **IN (…)** — match against a set.
- **Correlated** — references the outer row; runs per row.
- **EXISTS** — true if the subquery returns *any* row (stops at the first; efficient).

> **Gotcha:** \`NOT IN (subquery)\` breaks if the subquery returns a NULL — the whole condition becomes
> UNKNOWN and you get **zero rows**. Prefer \`NOT EXISTS\` or a \`LEFT JOIN … WHERE IS NULL\`.`,
        },
        {
          kind: "prose",
          markdown: `## 🧭 When to use a subquery vs. a CTE vs. a JOIN

- **Scalar / \`IN\` subquery** — a quick, one-off filter returning a single value or a single column for \`WHERE x IN (…)\`. Inline, 1–2 lines, used in exactly one place; no need to name it.
- **CTE (\`WITH\`)** — multi-step logic you want to read top-to-bottom, a derived result you reference **more than once** in the same query, or recursion. Naming each step beats deeply nested subqueries for readability.
- **JOIN** — when you actually need **columns from the other table** in your output, not just a yes/no filter.

**Matching rows — \`IN\` vs \`EXISTS\` vs \`JOIN\`:**
- \`IN (list)\` — a small, simple set of values; very readable.
- \`EXISTS\` — "does at least one related row exist?" Stops at the first match and is **NULL-safe** — prefer it for correlated checks, especially \`NOT EXISTS\`.
- \`JOIN\` — when you need the matched table's **columns** (but beware row duplication if the match is one-to-many).

**Rule of thumb:** filter only → subquery / \`EXISTS\`; need their columns → JOIN; complex, reused, or recursive → CTE. Never use \`NOT IN\` against a subquery that can return NULL — it silently yields zero rows; use \`NOT EXISTS\`.`,
        },
        {
          kind: "sql-runnable",
          title: "Products priced above their category's average (correlated)",
          sql: `SELECT name, price, category_id
FROM products p
WHERE price > (
    SELECT AVG(price) FROM products WHERE category_id = p.category_id
)
ORDER BY category_id, price;`,
        },
        {
          kind: "sql-runnable",
          title: "Users with no orders (NOT EXISTS)",
          sql: `SELECT name
FROM users u
WHERE NOT EXISTS (
    SELECT 1 FROM orders o WHERE o.user_id = u.id
);`,
        },
        {
          kind: "sql-challenge",
          title: "Customers who paid",
          prompt:
            "Using `EXISTS`, list the `name` of every user who has at least one order with status `'paid'`.",
          starterSql: "SELECT name\nFROM users u\nWHERE EXISTS (\n  -- a paid order for this user\n);",
          solution:
            "SELECT name FROM users u WHERE EXISTS (SELECT 1 FROM orders o WHERE o.user_id = u.id AND o.status = 'paid');",
          hints: ["Inside EXISTS, correlate with `o.user_id = u.id` and add `AND o.status = 'paid'`."],
          xp: 50,
        },
      ],
    },

    // ────────────────────────────────────────────────────────────── 6. CTEs
    {
      id: "ctes",
      title: "CTEs (WITH) & Recursion",
      summary: "Name intermediate results for readability — including recursive hierarchy walks.",
      minutes: 13,
      blocks: [
        {
          kind: "prose",
          markdown: `## Common Table Expressions

A CTE (\`WITH name AS (…)\`) names a subquery so complex logic reads top-to-bottom. Chain several,
and reference earlier ones. A **recursive** CTE walks hierarchies (org charts, category trees): a
base case \`UNION ALL\` a recursive step that joins back to the CTE.

> **vs MySQL:** CTEs (incl. recursive) arrived in MySQL 8.0. In Postgres a CTE is an optimization
> fence by default — use \`WITH … AS NOT MATERIALIZED (…)\` (PG12+) if you need the planner to inline it.`,
        },
        {
          kind: "prose",
          markdown: `## 🧭 When to reach for a CTE

- **CTE over a nested subquery** when the query has **distinct steps** (aggregate → filter → join) — naming them makes intent obvious and reviewable.
- **CTE over copy-pasting a subquery** when you need the **same derived set twice** — define it once, reference it many times.
- **Recursive CTE** for **hierarchies / graphs of unknown depth** (org charts, category trees, bill-of-materials) — anything you'd otherwise solve with a loop.
- **Temp table** instead of a CTE when the intermediate set is **large and reused across many separate queries** (not just within one statement), or you want to index it.

**Performance:** in modern Postgres a CTE is usually **inlined** (optimized like a subquery). Force it with \`AS NOT MATERIALIZED\`, or pin it with \`AS MATERIALIZED\` when you *want* an expensive step computed **once** and reused.

**Rule of thumb:** default to a CTE for anything past a trivial one-liner — readability wins and the planner usually treats it like a subquery anyway.`,
        },
        {
          kind: "sql-runnable",
          title: "Top spender vs. the average (chained CTEs)",
          sql: `WITH spending AS (
    SELECT u.id, u.name,
           SUM(o.total) FILTER (WHERE o.status = 'paid') AS total_paid
    FROM users u
    JOIN orders o ON o.user_id = u.id
    GROUP BY u.id, u.name
),
stats AS (
    SELECT AVG(total_paid) AS avg_spending FROM spending WHERE total_paid IS NOT NULL
)
SELECT s.name, s.total_paid,
       st.avg_spending::numeric(10,2)              AS avg_all_users,
       (s.total_paid - st.avg_spending)::numeric(10,2) AS above_avg
FROM spending s, stats st
WHERE s.total_paid IS NOT NULL
ORDER BY s.total_paid DESC;`,
        },
        {
          kind: "sql-runnable",
          title: "Category tree (recursive CTE)",
          sql: `WITH RECURSIVE cat_tree AS (
    SELECT id, name, parent_id, name AS full_path, 0 AS depth
    FROM categories
    WHERE parent_id IS NULL
  UNION ALL
    SELECT c.id, c.name, c.parent_id,
           ct.full_path || ' > ' || c.name, ct.depth + 1
    FROM categories c
    JOIN cat_tree ct ON ct.id = c.parent_id
)
SELECT full_path, depth FROM cat_tree ORDER BY full_path;`,
        },
        {
          kind: "sql-challenge",
          title: "Big spenders",
          prompt:
            "Using a CTE that sums each user's **paid** order totals, return the `name` of users whose paid total is **greater than 1000**.",
          starterSql:
            "WITH spending AS (\n  -- sum paid totals per user\n)\nSELECT name FROM spending WHERE total_paid > 1000;",
          solution:
            "WITH spending AS (SELECT u.name, SUM(o.total) FILTER (WHERE o.status='paid') AS total_paid FROM users u JOIN orders o ON o.user_id=u.id GROUP BY u.id, u.name) SELECT name FROM spending WHERE total_paid > 1000;",
          hints: [
            "In the CTE: `SUM(o.total) FILTER (WHERE o.status='paid') AS total_paid`, grouped per user.",
            "Then filter `WHERE total_paid > 1000`.",
          ],
          xp: 60,
        },
      ],
    },

    // ───────────────────────────────────────────────────── 7. Window Functions
    {
      id: "window-functions",
      title: "Window Functions",
      summary: "Compute across related rows without collapsing them — ranking, LAG/LEAD, running totals.",
      minutes: 16,
      blocks: [
        {
          kind: "prose",
          markdown: `## Windows: aggregate without collapsing

A window function computes over a set of rows *related to the current row*, but keeps every row:

\`\`\`
function() OVER (PARTITION BY … ORDER BY … ROWS BETWEEN …)
\`\`\`

- **Ranking:** \`ROW_NUMBER\` (unique), \`RANK\` (gaps on ties), \`DENSE_RANK\` (no gaps), \`NTILE(n)\`.
- **Offset:** \`LAG\`/\`LEAD\` (previous/next row), \`FIRST_VALUE\`/\`LAST_VALUE\`.
- **Running aggregates:** \`SUM(...) OVER (ORDER BY … ROWS UNBOUNDED PRECEDING)\`.

> **Gotcha:** You can't use a window function in \`WHERE\`/\`HAVING\` — wrap it in a subquery/CTE and filter outside.`,
        },
        {
          kind: "prose",
          markdown: `## 🧭 ROW_NUMBER vs. RANK vs. DENSE_RANK

- **\`ROW_NUMBER()\`** — strict 1, 2, 3… with **no ties**; every row unique. Use for "exactly one row per group" (top-1, dedupe-keep-latest, pagination cursors).
- **\`RANK()\`** — ties share a rank, then it **skips** (1, 1, 3). Use for leaderboards where "two in 1st ⇒ next is 3rd".
- **\`DENSE_RANK()\`** — ties share a rank, **no gaps** (1, 1, 2). Use for "**Nth distinct** value" (2nd-highest salary).
- **\`NTILE(n)\`** — split rows into n equal buckets (quartiles, deciles).

**Window vs. GROUP BY:** use a window function whenever you must **keep every row** and still compute across a group. If you only need the collapsed summary, GROUP BY is simpler and cheaper.

**Rule of thumb:** unique pick → \`ROW_NUMBER\`; ranking with gaps → \`RANK\`; ranking without gaps / "Nth distinct" → \`DENSE_RANK\`. You can't filter a window result in \`WHERE\` — wrap it in a subquery/CTE and filter \`rn\`/\`rnk\` outside.`,
        },
        {
          kind: "sql-runnable",
          title: "Rank, running total, and change vs. previous",
          sql: `SELECT o.created_at, u.name, o.total,
    RANK()       OVER (ORDER BY o.total DESC)                          AS rank_by_amount,
    SUM(o.total) OVER (ORDER BY o.created_at ROWS UNBOUNDED PRECEDING) AS running_total,
    LAG(o.total) OVER (PARTITION BY o.user_id ORDER BY o.created_at)   AS prev_order
FROM orders o
JOIN users u ON u.id = o.user_id
ORDER BY o.created_at;`,
        },
        {
          kind: "sql-runnable",
          title: "Top product per category (ROW_NUMBER + filter outside)",
          sql: `SELECT category_name, product_name, price FROM (
    SELECT cat.name AS category_name, p.name AS product_name, p.price,
           ROW_NUMBER() OVER (PARTITION BY cat.id ORDER BY p.price DESC) AS rn
    FROM products p
    JOIN categories cat ON cat.id = p.category_id
) ranked
WHERE rn = 1
ORDER BY category_name;`,
        },
        {
          kind: "sql-challenge",
          title: "Rank orders by value",
          prompt:
            "Return each order's `id` and its `rnk` — a `RANK()` over all orders ordered by `total` **descending** (highest = rank 1).",
          starterSql: "SELECT id,\n  -- RANK() OVER (...) AS rnk\nFROM orders;",
          solution: "SELECT id, RANK() OVER (ORDER BY total DESC) AS rnk FROM orders;",
          hints: ["`RANK() OVER (ORDER BY total DESC) AS rnk`."],
          xp: 50,
        },
      ],
    },

    // ──────────────────────────────────────────────────────── 8. Set Operations
    {
      id: "set-operations",
      title: "Set Operations",
      summary: "Combine result sets — UNION, UNION ALL, INTERSECT, EXCEPT.",
      minutes: 8,
      blocks: [
        {
          kind: "prose",
          markdown: `## Combining queries

Both queries must have the same number of columns with compatible types.

- **UNION** — combine and remove duplicates. **UNION ALL** — keep duplicates (faster).
- **INTERSECT** — rows in *both*. **EXCEPT** — rows in the first but *not* the second.`,
        },
        {
          kind: "prose",
          markdown: `## 🧭 UNION vs. UNION ALL (and vs. OR)

- **\`UNION ALL\`** — concatenate and **keep duplicates**. Faster (no dedup sort). Use when the inputs can't overlap, or duplicates are fine.
- **\`UNION\`** — concatenate and **remove duplicates** (an implicit \`DISTINCT\` → sort/hash). Use only when you truly need dedup; it's measurably slower on large sets.
- **A single \`WHERE a OR b\`** — if the "two sets" are just two filters on the **same table**, one query beats UNION.
- **\`INTERSECT\` / \`EXCEPT\`** — whole-row set membership ("in both" / "in A not B"); \`EXCEPT\` is a clean anti-join.

**Rule of thumb:** default to **\`UNION ALL\`** and only upgrade to \`UNION\` when you must remove duplicates — don't pay for a \`DISTINCT\` you don't need.`,
        },
        {
          kind: "sql-runnable",
          title: "Users who paid but never got a refund (EXCEPT)",
          sql: `SELECT user_id FROM orders WHERE status = 'paid'
EXCEPT
SELECT user_id FROM orders WHERE status = 'refunded'
ORDER BY user_id;`,
        },
        {
          kind: "sql-challenge",
          title: "Paid ∩ pending users",
          prompt:
            "Using `INTERSECT`, find the `user_id`s that appear in **both** a paid order and a pending order. (There may be none — return whatever the data says.)",
          starterSql:
            "SELECT user_id FROM orders WHERE status = 'paid'\n-- INTERSECT ...\n;",
          solution:
            "SELECT user_id FROM orders WHERE status = 'paid' INTERSECT SELECT user_id FROM orders WHERE status = 'pending';",
          hints: ["Two SELECTs joined by `INTERSECT`, each filtering a different status."],
          xp: 40,
        },
      ],
    },

    // ───────────────────────────────────────── 9. INSERT / UPDATE / DELETE / UPSERT
    {
      id: "modifying-data",
      title: "INSERT, UPDATE, DELETE & UPSERT",
      summary: "Write data — multi-row inserts, RETURNING, joined updates, and ON CONFLICT upserts.",
      minutes: 14,
      blocks: [
        {
          kind: "prose",
          markdown: `## Changing data

\`INSERT … RETURNING\` hands back generated columns (like a new \`id\`). \`UPDATE … FROM\` and
\`DELETE … USING\` let you join another table. **Upsert** = \`INSERT … ON CONFLICT (col) DO UPDATE\`,
where \`EXCLUDED\` is the row you tried to insert.

> Each runnable below **resets the sample database first** (note the badge), so your experiments
> never leak into other lessons.

> **vs MySQL:** \`RETURNING\` doesn't exist in MySQL (use \`LAST_INSERT_ID()\`); upsert is
> \`ON DUPLICATE KEY UPDATE\`; \`UPDATE … FROM\` is written \`UPDATE a JOIN b … SET\`.`,
        },
        {
          kind: "prose",
          markdown: `## 🧭 Writing data — pick the right tool

- **\`DELETE … WHERE\`** — remove specific rows; transactional, fires triggers, supports \`RETURNING\`.
- **\`TRUNCATE\`** — wipe **all** rows fast (no per-row work; \`RESTART IDENTITY\` resets sequences). Can't filter, heavier lock. Use to empty a table.
- **\`INSERT … ON CONFLICT (key) DO UPDATE\`** — the go-to **upsert** on a unique/PK conflict; supports \`RETURNING\`.
- **\`MERGE\`** — when you need **branching** (insert *and* update *and* delete) against a joined source. More powerful, but no \`RETURNING\`.
- **\`UPDATE … FROM\` / \`DELETE … USING\`** — when the change depends on **another table** (join inside the write).

**Rule of thumb:** plain upsert on a key → \`ON CONFLICT\`; multi-branch / join-driven → \`MERGE\`; empty a whole table → \`TRUNCATE\`; everything else → \`DELETE/UPDATE … WHERE\`.`,
        },
        {
          kind: "sql-runnable",
          title: "Insert and get the new id back",
          resetBefore: true,
          sql: `INSERT INTO products (name, category_id, price, tags, metadata)
VALUES ('AirPods Pro', 3, 249.00, ARRAY['apple','audio'], '{"warranty":1}')
RETURNING id, name, price;`,
        },
        {
          kind: "sql-runnable",
          title: "Upsert with ON CONFLICT",
          resetBefore: true,
          sql: `INSERT INTO products (id, name, category_id, price)
VALUES (1, 'iPhone 15 Pro', 3, 1099.00)
ON CONFLICT (id) DO UPDATE
    SET name = EXCLUDED.name, price = EXCLUDED.price
RETURNING id, name, price;`,
        },
        {
          kind: "sql-challenge",
          title: "Discount everything 10%",
          prompt:
            "Give every product a **10% discount** and return `name` and the new `price` (rounded to 2 decimals), ordered by `name`. Use `UPDATE … RETURNING`.",
          starterSql:
            "UPDATE products\nSET price = -- 90% of price, rounded\nRETURNING name, price;",
          solution:
            "UPDATE products SET price = ROUND(price * 0.9, 2) RETURNING name, price ORDER BY name;",
          ordered: true,
          hints: [
            "`SET price = ROUND(price * 0.9, 2)`.",
            "`RETURNING name, price ORDER BY name` to shape the output.",
          ],
          xp: 60,
        },
      ],
    },

    // ─────────────────────────────────────────────────────────── 10. Transactions
    {
      id: "transactions",
      title: "Transactions",
      summary: "All-or-nothing units of work — BEGIN/COMMIT/ROLLBACK, savepoints, isolation levels.",
      minutes: 10,
      blocks: [
        {
          kind: "prose",
          markdown: `## ACID in practice

A transaction groups statements so they all commit or all roll back. \`BEGIN\` starts one, \`COMMIT\`
saves, \`ROLLBACK\` undoes. \`SAVEPOINT\` allows a partial rollback.

| Isolation level | Dirty read | Non-repeatable | Phantom |
|---|---|---|---|
| READ COMMITTED (default) | No | Yes | Yes |
| REPEATABLE READ | No | No | No* |
| SERIALIZABLE | No | No | No |

*Postgres' REPEATABLE READ also blocks phantoms.`,
        },
        {
          kind: "sql-runnable",
          title: "Roll back and prove nothing changed",
          resetBefore: true,
          sql: `BEGIN;
  UPDATE products SET price = 0 WHERE id = 1;
ROLLBACK;

-- The price is back to 999.00 because we rolled back:
SELECT id, name, price FROM products WHERE id = 1;`,
        },
        {
          kind: "quiz",
          question:
            "You need every read inside a transaction to see one consistent snapshot, even if other sessions commit meanwhile. Which isolation level is the simplest fit?",
          options: [
            { text: "READ COMMITTED" },
            { text: "REPEATABLE READ", correct: true },
            { text: "READ UNCOMMITTED" },
            { text: "No isolation can do this" },
          ],
          explanation:
            "REPEATABLE READ gives the transaction a stable snapshot for its whole duration (and in Postgres also prevents phantom reads). SERIALIZABLE is even stricter but heavier than needed here.",
        },
      ],
    },

    // ───────────────────────────────────────────────────── 11. DDL & Constraints
    {
      id: "ddl-constraints",
      title: "DDL & Constraints",
      summary: "Create and alter tables; enforce integrity with keys, CHECK, UNIQUE, and foreign keys.",
      minutes: 12,
      blocks: [
        {
          kind: "prose",
          markdown: `## Defining structure

\`CREATE TABLE\` defines columns and **constraints**: \`PRIMARY KEY\`, \`UNIQUE\`, \`NOT NULL\`, \`CHECK\`,
\`DEFAULT\`, and \`FOREIGN KEY … REFERENCES … ON DELETE CASCADE\`. \`SERIAL\` (or \`GENERATED ALWAYS AS
IDENTITY\`) auto-numbers a column. \`ALTER TABLE\` adds/drops columns and constraints later.

> **vs MySQL:** \`SERIAL\` → \`INT AUTO_INCREMENT\`; \`DROP TABLE … CASCADE\` isn't available (drop children first).`,
        },
        {
          kind: "sql-runnable",
          title: "Create a table with constraints, then use it",
          resetBefore: true,
          sql: `CREATE TABLE coupons (
    code        TEXT PRIMARY KEY,
    pct_off     INTEGER NOT NULL CHECK (pct_off BETWEEN 1 AND 100),
    created_at  TIMESTAMPTZ DEFAULT now()
);

INSERT INTO coupons (code, pct_off) VALUES ('WELCOME10', 10), ('VIP25', 25);

SELECT code, pct_off FROM coupons ORDER BY pct_off;`,
        },
        {
          kind: "sql-runnable",
          title: "A CHECK constraint rejecting bad data",
          resetBefore: true,
          sql: `ALTER TABLE products ADD CONSTRAINT chk_price_positive CHECK (price >= 0);

-- This violates the constraint and raises an error (that's the point!):
INSERT INTO products (name, category_id, price) VALUES ('Freebie?', 3, -5);`,
        },
        {
          kind: "quiz",
          question:
            "A `FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE` — what happens to a user's orders when that user is deleted?",
          options: [
            { text: "The delete is blocked while orders exist" },
            { text: "The orders are deleted too", correct: true },
            { text: "The orders' user_id becomes NULL" },
            { text: "Nothing — orders keep the old id" },
          ],
          explanation:
            "ON DELETE CASCADE propagates the delete to dependent rows. `SET NULL` would null the FK; `RESTRICT`/`NO ACTION` would block the delete.",
        },
      ],
    },

    // ────────────────────────────────────────────────── 12. Indexes & EXPLAIN
    {
      id: "indexes-explain",
      title: "Indexes & EXPLAIN",
      summary: "Speed up reads with the right index, and read query plans with EXPLAIN.",
      minutes: 12,
      blocks: [
        {
          kind: "prose",
          markdown: `## Making queries fast

Indexes trade slower writes for faster reads. **B-tree** (default) serves equality, ranges,
\`ORDER BY\`, and \`LIKE 'prefix%'\`. **GIN** indexes arrays, JSONB, and full-text. **Partial** indexes
cover a subset (\`WHERE status='pending'\`). Build with \`CREATE INDEX CONCURRENTLY\` in production.

\`EXPLAIN\` shows the plan; \`EXPLAIN ANALYZE\` runs it and reports real timings. A \`Seq Scan\` on a
big table usually means a missing index.

> **vs MySQL:** No GIN/GiST/BRIN or partial indexes in MySQL; it has FULLTEXT/SPATIAL instead.`,
        },
        {
          kind: "prose",
          markdown: `## 🧭 Which index — and when NOT to

- **B-tree (default)** — equality, ranges (\`<, >, BETWEEN\`), \`ORDER BY\`, and \`LIKE 'prefix%'\`. ~90% of indexes.
- **GIN** — "many values per row": arrays (\`@>\`, \`&&\`), JSONB (\`@>\`, \`?\`), full-text (\`tsvector\`).
- **BRIN** — huge tables with **natural ordering** (append-only timestamps/ids); tiny, cheap, great for time-series ranges.
- **Partial index** (\`… WHERE status = 'pending'\`) — index only the hot subset; smaller and faster.
- **Expression index** (\`LOWER(email)\`) — when you query a function of a column.

**When NOT to index:** high-write tables (every write maintains every index), tiny tables (a seq scan is faster), and very low-cardinality columns (a plain boolean rarely helps).

**Rule of thumb:** start with a B-tree on the columns you filter/sort by; switch to GIN for arrays/JSONB/FTS; then confirm it's used with \`EXPLAIN\` (look for *Index Scan*, not *Seq Scan*).`,
        },
        {
          kind: "sql-runnable",
          title: "Create an index, then read the plan",
          resetBefore: true,
          sql: `CREATE INDEX idx_orders_status ON orders (status);

EXPLAIN SELECT * FROM orders WHERE status = 'paid';`,
        },
        {
          kind: "sql-runnable",
          title: "GIN index for array membership",
          resetBefore: true,
          sql: `CREATE INDEX idx_products_tags ON products USING GIN (tags);

SELECT name, tags FROM products WHERE tags @> ARRAY['apple'];`,
        },
        {
          kind: "quiz",
          question: "Which index type would you reach for to speed up `WHERE tags @> ARRAY['apple']` on a `text[]` column?",
          options: [
            { text: "B-tree" },
            { text: "GIN", correct: true },
            { text: "BRIN" },
            { text: "No index can help array containment" },
          ],
          explanation:
            "GIN (Generalized Inverted Index) is built for multi-value columns — arrays, JSONB, and full-text vectors — and accelerates containment/overlap operators like `@>` and `&&`.",
        },
      ],
    },

    // ───────────────────────────────────────────────────────────────── 13. Arrays
    {
      id: "arrays",
      title: "Arrays",
      summary: "Postgres' first-class array type — store, search, and expand multi-value columns.",
      minutes: 11,
      blocks: [
        {
          kind: "prose",
          markdown: `## Arrays are first-class

Postgres can store and query arrays directly. Indexing is **1-based**.

- \`'x' = ANY(arr)\` — contains a value.
- \`arr @> ARRAY['a','b']\` — contains all. \`arr && ARRAY['a','b']\` — overlaps (any in common).
- \`unnest(arr)\` — expand to one row per element. \`array_agg(x)\` — collapse rows into an array.

> **vs MySQL:** No native array type — people emulate with JSON or a join table.`,
        },
        {
          kind: "prose",
          markdown: `## 🧭 Array column vs. a join table vs. JSONB

- **Array column** (\`text[]\`) — a **small, bounded list of scalars** that belongs to the row and you mostly read whole or test membership (tags, flags). Index with GIN for \`@>\`/\`&&\`.
- **Join table** (the normalized default) — when the items are **entities** with their own attributes, need foreign keys/constraints, or you aggregate across them ("top tags overall", "products per tag"). The right call for real relationships.
- **JSONB** — heterogeneous or nested structure whose shape varies per row.

**Rule of thumb:** a few simple labels read with the row → array; anything you'd join, count, or constrain on → a proper join table. Arrays trade query flexibility for locality.`,
        },
        {
          kind: "sql-runnable",
          title: "Search by tags (overlap) and expand (unnest)",
          sql: `SELECT name, tags
FROM products
WHERE tags && ARRAY['apple', 'samsung']
ORDER BY name;`,
        },
        {
          kind: "sql-runnable",
          title: "Every distinct tag in the catalog",
          sql: `SELECT DISTINCT unnest(tags) AS tag
FROM products
ORDER BY tag;`,
        },
        {
          kind: "sql-challenge",
          title: "Apple products",
          prompt:
            "Return the `name` of every product whose `tags` array contains `'apple'`, ordered by `name`.",
          starterSql: "SELECT name FROM products\n-- where tags has 'apple'\nORDER BY name;",
          solution: "SELECT name FROM products WHERE 'apple' = ANY(tags) ORDER BY name;",
          ordered: true,
          hints: ["`WHERE 'apple' = ANY(tags)` — or `tags @> ARRAY['apple']`."],
          xp: 50,
        },
      ],
    },

    // ───────────────────────────────────────────────────────────────── 14. JSONB
    {
      id: "jsonb",
      title: "JSONB",
      summary: "Store and query semi-structured data — operators, containment, and key tests.",
      minutes: 13,
      blocks: [
        {
          kind: "prose",
          markdown: `## Querying JSON

\`JSONB\` stores JSON in a binary, indexable form (prefer it over \`JSON\`). Access it with:

- \`->\` returns JSONB, \`->>\` returns **text** (use \`->>\` to compare/cast).
- \`#>> '{a,b}'\` follows a path. \`@>\` tests containment of a sub-document.
- \`? 'key'\` tests key existence; \`?|\` / \`?&\` test any/all of several keys.

> **vs MySQL:** MySQL's \`JSON\` is closer to PG's \`JSON\` (no GIN, no \`@>\`/\`?\`); use \`JSON_EXTRACT\`/\`JSON_CONTAINS\`.`,
        },
        {
          kind: "prose",
          markdown: `## 🧭 JSONB vs. JSON vs. plain columns

- **Plain columns** — for fields you **filter, join, sort, or constrain** on. Always prefer real columns for known, structured attributes: typed, indexable, validated.
- **JSONB** — **semi-structured / variable** data (per-row differing keys, third-party payloads, sparse attributes). Binary, GIN-indexable, supports \`@>\`, \`?\`, \`->>\`.
- **JSON (text)** — only when you must **preserve exact formatting/key order** and won't query inside it. No GIN, slower access. Rare.

**Rule of thumb:** structured & queried → columns; flexible & queried → JSONB; raw blob you just store → JSON. Don't model your whole schema as one JSONB column — you lose constraints and the planner's help.`,
        },
        {
          kind: "sql-runnable",
          title: "Extract and cast nested fields",
          sql: `SELECT name,
    metadata->>'color'           AS color,
    (metadata->>'warranty')::int AS warranty_years
FROM products
WHERE metadata @> '{"warranty": 1}'
  AND metadata ? 'color'
ORDER BY name;`,
        },
        {
          kind: "sql-runnable",
          title: "Expand a JSON array of sizes into rows",
          sql: `SELECT name, jsonb_array_elements_text(metadata->'sizes') AS size
FROM products
WHERE metadata ? 'sizes';`,
        },
        {
          kind: "sql-challenge",
          title: "One-year warranty",
          prompt:
            "Return the `name` of every product whose `metadata` says `warranty` is `1`. Order by `name`. (Hint: containment with `@>`.)",
          starterSql: "SELECT name FROM products\n-- metadata contains warranty 1\nORDER BY name;",
          solution: "SELECT name FROM products WHERE metadata @> '{\"warranty\": 1}' ORDER BY name;",
          ordered: true,
          hints: ["`WHERE metadata @> '{\"warranty\": 1}'` — note JSON numbers aren't quoted."],
          xp: 50,
        },
      ],
    },

    // ─────────────────────────────────────────────── 15. Views & Materialized Views
    {
      id: "views",
      title: "Views & Materialized Views",
      summary: "Save queries as virtual tables; cache expensive ones with materialized views.",
      minutes: 10,
      blocks: [
        {
          kind: "prose",
          markdown: `## Views vs. materialized views

A **view** is a saved query — no data stored, always fresh, recomputed on each read. A
**materialized view** stores the result physically (fast reads) and must be \`REFRESH\`ed to update.

Use a view for frequently-changing data; a materialized view for expensive aggregations that can be
slightly stale.

> **vs MySQL:** Materialized views don't exist in MySQL — emulate with a table refreshed on a schedule.`,
        },
        {
          kind: "prose",
          markdown: `## 🧭 View vs. Materialized View vs. CTE

- **View** — a named query, **always fresh**, recomputed on each read. Use to encapsulate/standardize logic over **frequently-changing** data. No storage, no staleness.
- **Materialized View** — stores the **precomputed result** for fast reads; must be \`REFRESH\`ed. Use for **expensive aggregations** where slightly stale data is OK (dashboards, reports).
- **CTE** — scoped to a **single query**, not reusable elsewhere. Use for readability within one statement, not as a persistent object.
- **Table** — when you need to write to it, index it heavily, or share a large result widely.

**Rule of thumb:** reusable logic that must be live → view; expensive and staleness-tolerant → materialized view (refresh on a schedule); one-query readability → CTE.`,
        },
        {
          kind: "sql-runnable",
          title: "Create a view and query it",
          resetBefore: true,
          sql: `CREATE VIEW paid_orders AS
SELECT o.id, u.name AS customer, o.total
FROM orders o
JOIN users u ON u.id = o.user_id
WHERE o.status = 'paid';

SELECT * FROM paid_orders ORDER BY total DESC;`,
        },
        {
          kind: "sql-runnable",
          title: "A materialized view of revenue",
          resetBefore: true,
          sql: `CREATE MATERIALIZED VIEW revenue_by_status AS
SELECT status, SUM(total) AS revenue, COUNT(*) AS orders
FROM orders
GROUP BY status;

SELECT * FROM revenue_by_status ORDER BY revenue DESC;`,
        },
        {
          kind: "quiz",
          question: "Your dashboard runs an expensive aggregation that's fine to be a few minutes stale. Which fits best?",
          options: [
            { text: "A regular view" },
            { text: "A materialized view, refreshed on a schedule", correct: true },
            { text: "A CTE" },
            { text: "A temporary table per request" },
          ],
          explanation:
            "A materialized view stores the precomputed result for fast reads; a scheduled REFRESH keeps it acceptably fresh. A plain view would re-run the expensive query on every read.",
        },
      ],
    },

    // ─────────────────────────────────────── 16. Functions, Procedures & Triggers
    {
      id: "functions-plpgsql",
      title: "Functions, Procedures & Triggers",
      summary: "Encapsulate logic in PL/pgSQL — scalar/table functions, procedures, and triggers.",
      minutes: 15,
      blocks: [
        {
          kind: "prose",
          markdown: `## Server-side logic

A **function** returns a value (scalar or a table) and is used in SQL: \`SELECT my_fn(…)\`. A
**procedure** is called with \`CALL\` and can \`COMMIT\`/\`ROLLBACK\`. A **trigger** runs a function
automatically on \`INSERT\`/\`UPDATE\`/\`DELETE\`, with \`NEW\`/\`OLD\` rows available.

PL/pgSQL adds control flow: \`DECLARE\`, \`IF/ELSIF\`, \`LOOP\`/\`WHILE\`/\`FOR\`, and \`RAISE\`.`,
        },
        {
          kind: "sql-runnable",
          title: "A scalar function with a CASE-based tier",
          resetBefore: true,
          sql: `CREATE OR REPLACE FUNCTION price_tier(p NUMERIC)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN CASE
        WHEN p >= 1000 THEN 'premium'
        WHEN p >= 100  THEN 'mid'
        ELSE 'budget'
    END;
END;
$$;

SELECT name, price, price_tier(price) AS tier
FROM products
ORDER BY price DESC;`,
        },
        {
          kind: "sql-runnable",
          title: "A trigger that timestamps updates",
          resetBefore: true,
          sql: `ALTER TABLE products ADD COLUMN updated_at TIMESTAMPTZ;

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    NEW.updated_at := now();
    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_products_updated
BEFORE UPDATE ON products
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

UPDATE products SET price = price WHERE id = 1;
SELECT id, name, (updated_at IS NOT NULL) AS got_timestamp FROM products WHERE id = 1;`,
        },
        {
          kind: "quiz",
          question: "Which is true of a PL/pgSQL **procedure** (vs. a function)?",
          options: [
            { text: "It can COMMIT/ROLLBACK transactions and is invoked with CALL", correct: true },
            { text: "It must return a value" },
            { text: "It can be used inside a SELECT list" },
            { text: "It cannot take parameters" },
          ],
          explanation:
            "Procedures are called with `CALL`, return nothing (or via INOUT params), and—unlike functions—can manage transactions internally. Functions return a value and are usable in SQL expressions.",
        },
      ],
    },

    // ─────────────────────────────────────────────────── 17. Built-in Functions
    {
      id: "builtin-functions",
      title: "String, Date, Math & NULL Functions",
      summary: "The everyday toolbox — text manipulation, date math, rounding, and NULL handling.",
      minutes: 13,
      blocks: [
        {
          kind: "prose",
          markdown: `## The everyday toolbox

- **Strings:** \`||\` concatenates, \`upper/lower/initcap\`, \`trim\`, \`substring\`, \`split_part\`,
  \`replace\`, \`length\`, \`to_char\`, regex with \`~\` / \`regexp_replace\`. Aggregate with \`string_agg\`.
- **Dates:** \`now()\`, \`current_date\`, \`extract(field FROM ts)\`, \`date_trunc('month', ts)\`,
  interval math (\`now() - interval '7 days'\`), \`to_char\`/\`to_date\`, and \`generate_series\` to fill gaps.
- **Math/NULL:** \`round/floor/ceil\`, \`coalesce(a,b)\` (first non-null), \`nullif(a,b)\` (null when equal —
  great for safe division: \`x / nullif(y,0)\`).

> **vs MySQL:** \`||\` is logical OR in MySQL — use \`CONCAT()\`; \`string_agg\`→\`GROUP_CONCAT\`;
> \`date_trunc\`/\`generate_series\` don't exist (emulate with \`DATE_FORMAT\` / a numbers table).`,
        },
        {
          kind: "sql-runnable",
          title: "String & date formatting",
          sql: `SELECT
    upper(name)                          AS shout,
    split_part(email, '@', 2)            AS domain,
    to_char(created_at, 'YYYY-MM')       AS signup_month,
    extract(year FROM created_at)::int   AS signup_year
FROM users
ORDER BY name;`,
        },
        {
          kind: "sql-runnable",
          title: "Fill date gaps with generate_series",
          sql: `SELECT cal.month::date AS month,
       COALESCE(SUM(o.total) FILTER (WHERE o.status = 'paid'), 0) AS revenue
FROM generate_series('2025-01-01'::date, '2025-09-01'::date, '1 month'::interval) AS cal(month)
LEFT JOIN orders o ON date_trunc('month', o.created_at) = cal.month
GROUP BY cal.month
ORDER BY cal.month;`,
        },
        {
          kind: "sql-challenge",
          title: "Signup month per user",
          prompt:
            "Return each user's `name` and their signup month as text in `YYYY-MM` format (call it `month`), ordered by `name`.",
          starterSql: "SELECT name, -- to_char(...) AS month\nFROM users\nORDER BY name;",
          solution: "SELECT name, to_char(created_at, 'YYYY-MM') AS month FROM users ORDER BY name;",
          ordered: true,
          hints: ["`to_char(created_at, 'YYYY-MM')`."],
          xp: 50,
        },
      ],
    },

    // ──────────────────────────────────────────────────── 18. Full-Text Search
    {
      id: "full-text-search",
      title: "Full-Text Search",
      summary: "Search natural-language text with tsvector / tsquery and rank the matches.",
      minutes: 10,
      blocks: [
        {
          kind: "prose",
          markdown: `## Searching text properly

\`to_tsvector(lang, text)\` turns text into normalized lexemes; \`to_tsquery\` / \`plainto_tsquery\` /
\`websearch_to_tsquery\` build a query; the \`@@\` operator tests a match. \`ts_rank\` scores results,
and a **GIN** index on the tsvector makes it fast.

> **vs MySQL:** MySQL uses \`MATCH … AGAINST\` with a \`FULLTEXT\` index — no \`tsvector\`/\`tsquery\`/\`ts_rank\`.`,
        },
        {
          kind: "sql-runnable",
          title: "Match product names",
          sql: `SELECT name
FROM products
WHERE to_tsvector('english', name) @@ to_tsquery('english', 'macbook | iphone')
ORDER BY name;`,
        },
        {
          kind: "sql-runnable",
          title: "Rank matches by relevance",
          sql: `SELECT name,
       ts_rank(to_tsvector('english', name), query) AS rank
FROM products, to_tsquery('english', 'pro | air | book') query
WHERE to_tsvector('english', name) @@ query
ORDER BY rank DESC, name;`,
        },
        {
          kind: "quiz",
          question: "Why prefer `to_tsvector(...) @@ to_tsquery(...)` over `name ILIKE '%book%'` for search?",
          options: [
            { text: "It normalizes words (stemming) and can use a GIN index for speed/ranking", correct: true },
            { text: "ILIKE cannot be used in WHERE" },
            { text: "tsquery is the only way to do case-insensitive matching" },
            { text: "There is no real difference" },
          ],
          explanation:
            "Full-text search lemmatizes tokens (so 'running' matches 'run'), ignores stop-words, supports boolean/phrase queries and ranking, and is index-accelerated with GIN — far beyond a `LIKE` substring scan.",
        },
      ],
    },

    // ────────────────────────────────────────────────────── 19. Interview Patterns
    {
      id: "interview-patterns",
      title: "Interview Patterns",
      summary: "The recurring question shapes — Nth highest, orphans, dedupe, running totals.",
      minutes: 16,
      blocks: [
        {
          kind: "prose",
          markdown: `## Patterns that show up again and again

Memorize the *shape*, adapt to the problem:

1. **Nth highest** — \`ORDER BY x DESC LIMIT 1 OFFSET n-1\`, or \`DENSE_RANK()\` filtered to \`= n\`.
2. **Orphans / no-match** — \`LEFT JOIN … WHERE right.id IS NULL\` (or \`NOT EXISTS\`).
3. **Delete duplicates** — keep \`MIN(id)\` per key, delete the rest.
4. **Running total that resets per group** — \`SUM(x) OVER (PARTITION BY g ORDER BY t ROWS UNBOUNDED PRECEDING)\`.
5. **Pivot** — \`SUM(CASE WHEN … THEN … END)\` grouped.`,
        },
        {
          kind: "prose",
          markdown: `## 🧭 "Find rows with no match" — three ways

- **\`LEFT JOIN … WHERE right.id IS NULL\`** — usually the **fastest** anti-join (the planner uses a hash/merge anti-join). Great default.
- **\`NOT EXISTS\` (correlated)** — equally correct and **NULL-safe**; reads clearly as "no such row". Often planned identically to the LEFT JOIN form.
- **\`NOT IN (subquery)\`** — **avoid** when the subquery column can be NULL: a single NULL makes the predicate UNKNOWN and you get **zero rows**. Only safe if the column is \`NOT NULL\` (or you add \`WHERE col IS NOT NULL\`).

**Rule of thumb:** default to \`NOT EXISTS\` or \`LEFT JOIN … IS NULL\`; never \`NOT IN\` against a nullable subquery.`,
        },
        {
          kind: "sql-runnable",
          title: "Second-highest distinct price — three ways",
          sql: `-- 1) OFFSET
SELECT DISTINCT price FROM products ORDER BY price DESC LIMIT 1 OFFSET 1;`,
        },
        {
          kind: "sql-challenge",
          title: "Second-highest price",
          prompt:
            "Return a single value: the **second-highest distinct** product `price`. (The highest is 1299.00.)",
          starterSql: "SELECT DISTINCT price FROM products\n-- order, then skip the top one\n;",
          solution: "SELECT DISTINCT price FROM products ORDER BY price DESC LIMIT 1 OFFSET 1;",
          ordered: true,
          hints: ["`ORDER BY price DESC` then `LIMIT 1 OFFSET 1`.", "`DISTINCT` guards against ties."],
          xp: 60,
        },
        {
          kind: "sql-challenge",
          title: "Customers with zero orders",
          prompt:
            "Return the `name` of every user who has **no orders at all**, ordered by `name`. Use a `LEFT JOIN … IS NULL` or `NOT EXISTS`.",
          starterSql: "SELECT u.name\nFROM users u\nLEFT JOIN orders o ON o.user_id = u.id\n-- keep only the unmatched\nORDER BY u.name;",
          solution:
            "SELECT u.name FROM users u LEFT JOIN orders o ON o.user_id = u.id WHERE o.id IS NULL ORDER BY u.name;",
          ordered: true,
          hints: ["After the LEFT JOIN, keep rows where `o.id IS NULL`."],
          xp: 60,
        },
      ],
    },

    // ─────────────────────────────────────────── 20. Advanced Query Workshop
    {
      id: "advanced-queries",
      title: "Advanced Query Workshop",
      summary:
        "Build big multi-step queries with confidence — chained CTEs combining UNNEST, window functions, FILTER, ROLLUP, and gaps-and-islands. Live-coding prep.",
      minutes: 30,
      blocks: [
        {
          kind: "prose",
          markdown: `## Reading & building a big query

In a live-coding test you'll be handed a wall of SQL — or asked to write one. The trick is that a
**multi-CTE query is just a pipeline**: each \`WITH\` block is one transformation, and you read it
**top to bottom** like a script. Final \`SELECT\` at the bottom assembles the pieces.

A reliable way to *build* one under pressure:

1. **Shape the rows** — \`FROM\`/\`JOIN\`/\`UNNEST\` to get one row per "thing" (per event, per order line).
2. **Number / rank within groups** — \`ROW_NUMBER()\`/\`RANK()\` \`OVER (PARTITION BY … ORDER BY …)\`.
3. **Aggregate** — \`GROUP BY\` with \`COUNT(DISTINCT …)\`, \`SUM(…) FILTER (WHERE …)\`, etc.
4. **Assemble** — join the CTEs back together and filter (e.g. \`WHERE rn = 1\`).

Everything below runs against the sample database (or a tiny self-contained one) — **edit and re-run**.`,
        },
        {
          kind: "prose",
          markdown: `## 1. Sessionization — "first page + unique pages per session"

This is the pattern from a classic question: events are stored as an **array per session**; explode
them, find each session's **first** page, and count its **distinct** pages.

**Is this PostgreSQL-compatible?** Yes — with one requirement: \`events\` must be an *array of a
composite (row) type* (here \`event_t(page, ts)\`). Then \`UNNEST(events) AS e(page, ts)\` expands each
element into columns. (In some setups you'd write \`(e).page\`; the \`AS e(page, ts)\` column-alias form
is the portable way. If your events were \`jsonb\` instead, you'd swap \`UNNEST\` for
\`jsonb_to_recordset(events) AS e(page text, ts timestamptz)\`.)`,
        },
        {
          kind: "sql-runnable",
          title: "Sessionization (UNNEST + ROW_NUMBER + COUNT DISTINCT + JOIN USING)",
          sql: `-- Self-contained: builds its own table so you can run it repeatedly.
DROP TABLE IF EXISTS activity_logs;
DROP TYPE  IF EXISTS event_t CASCADE;
CREATE TYPE event_t AS (page text, ts timestamptz);
CREATE TABLE activity_logs (user_id int, session_id int, events event_t[]);
INSERT INTO activity_logs VALUES
  (1, 100, ARRAY[ROW('/home','2026-01-01 10:00')::event_t,
                 ROW('/search','2026-01-01 10:02')::event_t,
                 ROW('/home','2026-01-01 10:05')::event_t]),
  (1, 101, ARRAY[ROW('/cart','2026-01-02 09:00')::event_t,
                 ROW('/checkout','2026-01-02 09:03')::event_t]),
  (2, 200, ARRAY[ROW('/home','2026-01-01 11:00')::event_t,
                 ROW('/product','2026-01-01 11:01')::event_t,
                 ROW('/home','2026-01-01 11:10')::event_t]);

WITH events AS (                              -- 1) UNNEST: explode the event array
    SELECT user_id, session_id, e.page AS page, e.ts AS ts
    FROM activity_logs, UNNEST(events) AS e(page, ts)
),
ranked AS (                                   -- 2) PARTITION BY: first page per session
    SELECT user_id, session_id, page, ts,
           ROW_NUMBER() OVER (PARTITION BY user_id, session_id ORDER BY ts) AS rn
    FROM events
),
unique_pages AS (                             -- 3) distinct pages per session
    SELECT user_id, session_id, COUNT(DISTINCT page) AS total_unique_pages
    FROM events
    GROUP BY user_id, session_id
)
SELECT r.user_id, r.session_id,
       r.page AS first_page,
       u.total_unique_pages
FROM ranked r
JOIN unique_pages u USING (user_id, session_id)  -- JOIN USING: shorthand when keys share names
WHERE r.rn = 1
ORDER BY r.user_id, r.session_id;`,
        },
        {
          kind: "prose",
          markdown: `**Step by step** — exactly the moves an interviewer wants to hear you narrate:

- **\`events\` CTE** — \`FROM activity_logs, UNNEST(events) AS e(page, ts)\` is an implicit
  \`CROSS JOIN LATERAL\`: for each log row, emit one row per array element. Now we have flat
  \`(user_id, session_id, page, ts)\`.
- **\`ranked\` CTE** — \`ROW_NUMBER() OVER (PARTITION BY user_id, session_id ORDER BY ts)\` numbers
  events **within each session** by time. The earliest event gets \`rn = 1\`.
- **\`unique_pages\` CTE** — a plain \`GROUP BY\` with \`COUNT(DISTINCT page)\` for the per-session
  distinct count (window functions can't \`DISTINCT\`-count, so this stays a separate aggregate).
- **Final \`SELECT\`** — join the two CTEs on the session key (\`USING (user_id, session_id)\`) and keep
  only \`rn = 1\` to collapse to one row per session: its first page + its unique-page count.`,
        },
        {
          kind: "prose",
          markdown: `## 2. Top item per group (the #1 interview pattern)

"Per category, what's the best-selling product?" → aggregate, **rank within the group**, keep rank 1.`,
        },
        {
          kind: "sql-runnable",
          title: "Best-selling product per category",
          sql: `WITH sales AS (                                  -- units sold per product
    SELECT p.category_id, p.name AS product, SUM(oi.qty) AS units
    FROM order_items oi
    JOIN products p ON p.id = oi.product_id
    GROUP BY p.category_id, p.name
),
ranked AS (                                      -- rank products inside each category
    SELECT s.*, c.name AS category,
           ROW_NUMBER() OVER (PARTITION BY s.category_id ORDER BY s.units DESC, s.product) AS rn
    FROM sales s
    JOIN categories c ON c.id = s.category_id
)
SELECT category, product, units
FROM ranked
WHERE rn = 1
ORDER BY category;`,
        },
        {
          kind: "prose",
          markdown: `## 3. Window frames — running totals & share of total

Two windows on one query: a **running total** (an ordered frame) and a **share of the whole**
(\`OVER ()\` — an empty window = the entire result set, no collapsing).`,
        },
        {
          kind: "sql-runnable",
          title: "Running paid revenue + each order's share of the total",
          sql: `SELECT
    o.created_at,
    o.total,
    SUM(o.total) OVER (ORDER BY o.created_at ROWS UNBOUNDED PRECEDING)  AS running_total,
    ROUND(100.0 * o.total / SUM(o.total) OVER (), 1)                    AS pct_of_all_paid
FROM orders o
WHERE o.status = 'paid'
ORDER BY o.created_at;`,
        },
        {
          kind: "prose",
          markdown: `## 4. Pivot + subtotals with FILTER and ROLLUP

\`FILTER (WHERE …)\` pivots statuses into columns; \`GROUP BY ROLLUP(col)\` adds a grand-total row
(where \`col\` is NULL) in the same pass.`,
        },
        {
          kind: "sql-runnable",
          title: "Category revenue, paid vs. gross, with a TOTAL row",
          sql: `SELECT
    COALESCE(c.name, 'TOTAL') AS category,
    SUM(oi.qty * oi.unit_price) FILTER (WHERE o.status = 'paid') AS paid_revenue,
    SUM(oi.qty * oi.unit_price)                                  AS gross_revenue
FROM order_items oi
JOIN orders o     ON o.id = oi.order_id
JOIN products p   ON p.id = oi.product_id
JOIN categories c ON c.id = p.category_id
GROUP BY ROLLUP(c.name)
ORDER BY category;`,
        },
        {
          kind: "prose",
          markdown: `## 5. Gaps & islands — consecutive streaks

The famous trick: subtract a \`ROW_NUMBER()\` from the date. Consecutive days share the **same**
difference, so that difference becomes a group key for each "island" (streak).`,
        },
        {
          kind: "sql-runnable",
          title: "Login streaks per user",
          sql: `DROP TABLE IF EXISTS logins;
CREATE TABLE logins (user_id int, login_date date);
INSERT INTO logins VALUES
  (1,'2026-01-01'),(1,'2026-01-02'),(1,'2026-01-03'),(1,'2026-01-05'),
  (2,'2026-01-10'),(2,'2026-01-11');

WITH grouped AS (
    SELECT user_id, login_date,
           login_date - (ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY login_date))::int AS grp
    FROM logins
)
SELECT user_id,
       MIN(login_date) AS streak_start,
       MAX(login_date) AS streak_end,
       COUNT(*)        AS streak_length
FROM grouped
GROUP BY user_id, grp
ORDER BY user_id, streak_start;`,
        },
        {
          kind: "prose",
          markdown: `## Now you — graded exercises

These run against the sample e-commerce database (resets before each check). Reach for the patterns
above. Order matters where the prompt says so.`,
        },
        {
          kind: "sql-challenge",
          title: "Top product per category",
          prompt:
            "For each category, return `category` (the category name), the `product` that sold the **most units** (sum of `order_items.qty`), and `units`. One row per category, ordered by `category`. Break ties by product name.\n\n*Combines: JOIN → GROUP BY → ROW_NUMBER over PARTITION → filter rn = 1.*",
          starterSql:
            "WITH sales AS (\n  -- units per product (join order_items to products, group)\n),\nranked AS (\n  -- ROW_NUMBER() OVER (PARTITION BY category ORDER BY units DESC)\n)\nSELECT category, product, units\nFROM ranked\n-- keep the winner per category\nORDER BY category;",
          solution:
            "WITH sales AS (SELECT p.category_id, p.name AS product, SUM(oi.qty) AS units FROM order_items oi JOIN products p ON p.id = oi.product_id GROUP BY p.category_id, p.name), ranked AS (SELECT s.*, c.name AS category, ROW_NUMBER() OVER (PARTITION BY s.category_id ORDER BY s.units DESC, s.product) AS rn FROM sales s JOIN categories c ON c.id = s.category_id) SELECT category, product, units FROM ranked WHERE rn = 1 ORDER BY category;",
          ordered: true,
          hints: [
            "First CTE: `SUM(oi.qty)` grouped by product (and its category).",
            "Second CTE: `ROW_NUMBER() OVER (PARTITION BY category_id ORDER BY units DESC, product)`.",
            "Final: `WHERE rn = 1`.",
          ],
          xp: 80,
        },
        {
          kind: "sql-challenge",
          title: "Category share of paid revenue",
          prompt:
            "Among **paid** orders only, return each `category` (name), its `paid_rev` (sum of `qty * unit_price`), and `pct` — that category's percentage of total paid revenue, rounded to 1 decimal. Highest revenue first.\n\n*Combines: multi-join with a filter → GROUP BY → a window `SUM() OVER ()` for the grand total.*",
          starterSql:
            "WITH rev AS (\n  -- paid revenue per category\n)\nSELECT category, paid_rev,\n  -- ROUND(100.0 * paid_rev / SUM(paid_rev) OVER (), 1) AS pct\nFROM rev\nORDER BY paid_rev DESC;",
          solution:
            "WITH rev AS (SELECT c.name AS category, SUM(oi.qty * oi.unit_price) AS paid_rev FROM order_items oi JOIN orders o ON o.id = oi.order_id AND o.status = 'paid' JOIN products p ON p.id = oi.product_id JOIN categories c ON c.id = p.category_id GROUP BY c.name) SELECT category, paid_rev, ROUND(100.0 * paid_rev / SUM(paid_rev) OVER (), 1) AS pct FROM rev ORDER BY paid_rev DESC;",
          ordered: true,
          hints: [
            "Filter to paid orders inside the join: `JOIN orders o ON o.id = oi.order_id AND o.status = 'paid'`.",
            "`SUM(paid_rev) OVER ()` (empty window) is the total across all categories.",
          ],
          xp: 90,
        },
        {
          kind: "sql-challenge",
          title: "Rank customers by lifetime value",
          prompt:
            "Return every user's `name` and `rnk` — their `DENSE_RANK()` by lifetime **paid** value (sum of paid order totals; users with none count as 0), highest value = rank 1. Include users with no orders. Order by `rnk`, then `name`.\n\n*Combines: LEFT JOIN → conditional SUM with FILTER → DENSE_RANK.*",
          starterSql:
            "WITH ltv AS (\n  -- paid lifetime value per user (LEFT JOIN so everyone appears)\n)\nSELECT name,\n  -- DENSE_RANK() OVER (ORDER BY value DESC) AS rnk\nFROM ltv\nORDER BY rnk, name;",
          solution:
            "WITH ltv AS (SELECT u.name, COALESCE(SUM(o.total) FILTER (WHERE o.status = 'paid'), 0) AS v FROM users u LEFT JOIN orders o ON o.user_id = u.id GROUP BY u.name) SELECT name, DENSE_RANK() OVER (ORDER BY v DESC) AS rnk FROM ltv ORDER BY rnk, name;",
          ordered: true,
          hints: [
            "`COALESCE(SUM(o.total) FILTER (WHERE o.status='paid'), 0)` handles users with no paid orders.",
            "`DENSE_RANK()` (no gaps) so ties share a rank and the next is consecutive.",
          ],
          xp: 90,
        },
        {
          kind: "sql-challenge",
          title: "Each user's first order",
          prompt:
            "Return one row per user who has orders: `user_id`, `first_order_id` (their earliest order by `created_at`), and that order's `total`. Order by `user_id`.\n\n*Combines: ROW_NUMBER over PARTITION → filter to the first row.*",
          starterSql:
            "SELECT user_id, id AS first_order_id, total\nFROM (\n  -- number each user's orders by created_at\n) x\nWHERE rn = 1\nORDER BY user_id;",
          solution:
            "SELECT user_id, id AS first_order_id, total FROM (SELECT o.*, ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY created_at) AS rn FROM orders o) x WHERE rn = 1 ORDER BY user_id;",
          ordered: true,
          hints: [
            "Inner query: `ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY created_at) AS rn`.",
            "Outer: keep `WHERE rn = 1`.",
          ],
          xp: 80,
        },
      ],
    },

    // ───────────────────────────────── 21. Analytics Patterns (Interview Pack)
    {
      id: "analytics-patterns",
      title: "Analytics Patterns (Interview Pack)",
      summary:
        "The patterns analytics/DE interviews keep reusing — period-over-period (LAG), rolling averages, gap-based sessionization, dedupe-keep-latest, NTILE segmentation, and cohort retention. All Postgres, all runnable.",
      minutes: 32,
      blocks: [
        {
          kind: "prose",
          markdown: `## The shapes ~90% of SQL tests reduce to

Interviewers reuse a small set of patterns. You've already met several earlier in this track:

| Pattern | Where |
|---|---|
| Filter & aggregate | *GROUP BY* lesson |
| Conditional joins (LEFT JOIN + IS NULL) | *JOINs* / *Interview Patterns* |
| Top-N per group | *Window Functions* / *Advanced Workshop* |
| Hierarchy / manager chain (recursive CTE / self-join) | *CTEs* / *JOINs* |

This lesson drills the **analytics-flavored** ones that separate "writes SQL" from "writes
*analytical* SQL": **period-over-period change, rolling windows, sessionization by inactivity gap,
deduplication keeping the latest row, NTILE segmentation, and cohort retention.** Edit and re-run each.`,
        },

        {
          kind: "prose",
          markdown: `## 1. Period-over-period — month-over-month growth %

The go-to for any "compare this period to the previous one". \`LAG(x) OVER (ORDER BY period)\` pulls
the previous row; guard the division with \`NULLIF(prev, 0)\` so a zero or missing prior period doesn't
blow up.`,
        },
        {
          kind: "sql-runnable",
          title: "Month-over-month revenue growth",
          sql: `DROP TABLE IF EXISTS monthly_rev;
CREATE TABLE monthly_rev (month date, revenue numeric);
INSERT INTO monthly_rev VALUES
  ('2026-01-01',1000),('2026-02-01',1500),('2026-03-01',1200),('2026-04-01',1800);

SELECT
    month,
    revenue,
    LAG(revenue) OVER (ORDER BY month) AS prev_month,
    ROUND(100.0 * (revenue - LAG(revenue) OVER (ORDER BY month))
          / NULLIF(LAG(revenue) OVER (ORDER BY month), 0), 1) AS mom_growth_pct
FROM monthly_rev
ORDER BY month;`,
        },

        {
          kind: "prose",
          markdown: `## 2. Rolling window — 7-day moving average

A frame of \`ROWS BETWEEN 6 PRECEDING AND CURRENT ROW\` is exactly 7 rows (today + the 6 before it).
Swap \`AVG\` for \`SUM\`/\`COUNT\` for rolling totals. This is the canonical "7-day rolling DAU" question.`,
        },
        {
          kind: "sql-runnable",
          title: "7-day rolling average of daily active users",
          sql: `DROP TABLE IF EXISTS dau;
CREATE TABLE dau (d date, users int);
INSERT INTO dau
SELECT g::date, 10 + EXTRACT(day FROM g)::int
FROM generate_series('2026-01-01','2026-01-10','1 day'::interval) g;

SELECT
    d,
    users,
    ROUND(AVG(users) OVER (ORDER BY d ROWS BETWEEN 6 PRECEDING AND CURRENT ROW), 1) AS rolling_7d_avg
FROM dau
ORDER BY d;`,
        },

        {
          kind: "prose",
          markdown: `## 3. Sessionization by inactivity gap (the "30-minute rule")

The other sessionization question (the *Advanced Workshop* did the array-of-events version): raw hit
rows, and a **new session starts after 30+ minutes of inactivity**. The trick is a two-step window:

1. Flag a row as a session start when the gap from the previous hit exceeds 30 min (or it's the user's
   first hit) — \`ts - LAG(ts) OVER (…) > interval '30 minutes'\`.
2. A **running \`SUM\` of those flags** assigns an increasing session number per user — every flag bumps
   it by one. This "cumulative sum of a boolean" is a pattern worth memorizing.`,
        },
        {
          kind: "sql-runnable",
          title: "Assign session ids from a 30-minute inactivity gap",
          sql: `DROP TABLE IF EXISTS hits;
CREATE TABLE hits (user_id int, ts timestamptz, page text);
INSERT INTO hits VALUES
  (1,'2026-01-01 10:00','/a'),(1,'2026-01-01 10:10','/b'),
  (1,'2026-01-01 10:55','/c'),(1,'2026-01-01 11:00','/d'),
  (2,'2026-01-01 09:00','/x'),(2,'2026-01-01 12:00','/y');

WITH flagged AS (                                  -- 1) mark each session's first hit
    SELECT user_id, ts, page,
        CASE
            WHEN ts - LAG(ts) OVER (PARTITION BY user_id ORDER BY ts) > interval '30 minutes'
              OR LAG(ts) OVER (PARTITION BY user_id ORDER BY ts) IS NULL
            THEN 1 ELSE 0
        END AS is_new_session
    FROM hits
),
sessions AS (                                      -- 2) running SUM of flags = session number
    SELECT user_id, ts, page,
        SUM(is_new_session) OVER (PARTITION BY user_id ORDER BY ts) AS session_no
    FROM flagged
)
SELECT user_id, session_no, COUNT(*) AS hits, MIN(ts) AS started, MAX(ts) AS ended
FROM sessions
GROUP BY user_id, session_no
ORDER BY user_id, session_no;`,
        },

        {
          kind: "prose",
          markdown: `## 4. Deduplicate — keep the **latest** row per key

"One row per user — their most recent order." Number rows within each key by a descending sort, keep
\`rn = 1\`. (Add a tiebreaker like \`id DESC\` so it's deterministic when timestamps collide.) Same idea
as top-N, applied to dedup.`,
        },
        {
          kind: "sql-runnable",
          title: "Most recent order per user",
          sql: `SELECT user_id, id AS latest_order_id, created_at, total
FROM (
    SELECT o.*,
           ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY created_at DESC, id DESC) AS rn
    FROM orders o
) ranked
WHERE rn = 1
ORDER BY user_id;`,
        },

        {
          kind: "prose",
          markdown: `## 5. Segmentation — NTILE buckets

\`NTILE(n)\` splits ordered rows into \`n\` roughly equal buckets — quartiles, deciles, "top 10%". The
staple of customer segmentation, A/B cohorts, and fraud scoring.`,
        },
        {
          kind: "sql-runnable",
          title: "Bucket products into price quartiles",
          sql: `SELECT
    name,
    price,
    NTILE(4) OVER (ORDER BY price DESC) AS price_quartile
FROM products
ORDER BY price DESC;`,
        },

        {
          kind: "prose",
          markdown: `## 6. Cohort retention

The product-DS classic: group users by the period of their **first** activity (their *cohort*), then
measure how many are still active N periods later. Steps: find each user's first month, compute each
activity's **month offset** from that cohort, then pivot the distinct user counts per offset with
\`COUNT(DISTINCT …) FILTER (WHERE month_no = k)\`.`,
        },
        {
          kind: "sql-runnable",
          title: "Cohort table — month-0 and month-1 retention",
          sql: `DROP TABLE IF EXISTS activity;
CREATE TABLE activity (user_id int, activity_month date);
INSERT INTO activity VALUES
  (1,'2026-01-01'),(1,'2026-02-01'),       -- user 1: Jan cohort, retained in Feb
  (2,'2026-01-01'),                          -- user 2: Jan cohort, churned
  (3,'2026-02-01'),(3,'2026-03-01');         -- user 3: Feb cohort, retained in Mar

WITH first_m AS (
    SELECT user_id, MIN(activity_month) AS cohort
    FROM activity GROUP BY user_id
),
offsets AS (
    SELECT f.cohort, a.user_id,
        (EXTRACT(year FROM a.activity_month) * 12 + EXTRACT(month FROM a.activity_month))
      - (EXTRACT(year FROM f.cohort)         * 12 + EXTRACT(month FROM f.cohort)) AS month_no
    FROM first_m f
    JOIN activity a USING (user_id)
)
SELECT
    cohort,
    COUNT(DISTINCT user_id) FILTER (WHERE month_no = 0) AS month_0,
    COUNT(DISTINCT user_id) FILTER (WHERE month_no = 1) AS month_1
FROM offsets
GROUP BY cohort
ORDER BY cohort;`,
        },

        {
          kind: "prose",
          markdown: `## Graded exercises

These run against the sample e-commerce DB (reset before each check). Order matters where stated.`,
        },
        {
          kind: "sql-challenge",
          title: "Keep each user's latest order",
          prompt:
            "Return one row per user who has orders: `user_id`, `order_id` (their **most recent** order by `created_at`), and that order's `total`. Order by `user_id`.\n\n*Pattern: dedupe-keep-latest — ROW_NUMBER ordered DESC, keep rn = 1.*",
          starterSql:
            "SELECT user_id, id AS order_id, total\nFROM (\n  -- ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY created_at DESC, id DESC)\n) x\nWHERE rn = 1\nORDER BY user_id;",
          solution:
            "SELECT user_id, id AS order_id, total FROM (SELECT o.*, ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY created_at DESC, id DESC) AS rn FROM orders o) x WHERE rn = 1 ORDER BY user_id;",
          ordered: true,
          hints: [
            "Sort **descending** inside the window so the newest gets `rn = 1`.",
            "Add `id DESC` as a tiebreaker for determinism.",
          ],
          xp: 80,
        },
        {
          kind: "sql-challenge",
          title: "Change vs. the user's previous paid order",
          prompt:
            "For each **paid** order, return `user_id`, `total`, and `vs_prev` — the total minus that user's *previous* paid order total (NULL for their first). Order by `user_id`, then `created_at`.\n\n*Pattern: period-over-period with LAG partitioned per user.*",
          starterSql:
            "SELECT user_id, total,\n  -- total - LAG(total) OVER (PARTITION BY user_id ORDER BY created_at) AS vs_prev\nFROM orders\nWHERE status = 'paid'\nORDER BY user_id, created_at;",
          solution:
            "SELECT user_id, total, total - LAG(total) OVER (PARTITION BY user_id ORDER BY created_at) AS vs_prev FROM orders WHERE status = 'paid' ORDER BY user_id, created_at;",
          ordered: true,
          hints: ["`LAG(total) OVER (PARTITION BY user_id ORDER BY created_at)` is the previous total."],
          xp: 80,
        },
        {
          kind: "sql-challenge",
          title: "Split products into two price tiers",
          prompt:
            "Using `NTILE(2)` over `price` **descending**, return each product's `name` and its `tier` (1 = pricier half, 2 = cheaper half). Order by `price` descending, then `name`.\n\n*Pattern: NTILE segmentation.*",
          starterSql:
            "SELECT name,\n  -- NTILE(2) OVER (ORDER BY price DESC) AS tier\nFROM products\nORDER BY price DESC, name;",
          solution:
            "SELECT name, NTILE(2) OVER (ORDER BY price DESC) AS tier FROM products ORDER BY price DESC, name;",
          ordered: true,
          hints: ["`NTILE(2) OVER (ORDER BY price DESC)` splits the 5 rows into a 3/2 top/bottom."],
          xp: 70,
        },
      ],
    },

    // ─────────────────────────────────────────────────── 22. Funnel Conversion
    {
      id: "funnel-conversion",
      title: "Funnel Conversion",
      summary:
        "Measure drop-off through a sequence of steps — loose vs. strict (ordered) funnels, conversion rates, and building a funnel from existing tables.",
      minutes: 18,
      blocks: [
        {
          kind: "prose",
          markdown: `## What a funnel measures

A **funnel** tracks how many users make it through an ordered sequence of steps —
\`view → cart → checkout → purchase\` — and where they drop off. Two flavors come up in interviews:

- **Loose funnel** — count distinct users who hit *each* step, independently. Simple, but it can
  **overcount** late steps (someone might \`purchase\` without a recorded \`cart\`).
- **Strict / ordered funnel** — a user only counts at step *k* if they completed every prior step
  **in order** (by time). More faithful to "real" conversion.`,
        },
        {
          kind: "sql-runnable",
          title: "Loose funnel — users per step + conversion rates",
          sql: `DROP TABLE IF EXISTS funnel_events;
CREATE TABLE funnel_events (user_id int, step text, ts timestamptz);
INSERT INTO funnel_events VALUES
  (1,'view','2026-01-01 10:00'),(1,'cart','2026-01-01 10:05'),(1,'checkout','2026-01-01 10:08'),(1,'purchase','2026-01-01 10:10'),
  (2,'view','2026-01-01 11:00'),(2,'cart','2026-01-01 11:02'),
  (3,'view','2026-01-01 12:00'),
  (4,'view','2026-01-02 09:00'),(4,'cart','2026-01-02 09:01'),(4,'checkout','2026-01-02 09:02'),(4,'purchase','2026-01-02 09:03'),
  (5,'view','2026-01-02 10:00'),(5,'purchase','2026-01-02 10:01');   -- bought without cart/checkout!

WITH step_users AS (
    SELECT step,
           COUNT(DISTINCT user_id) AS users,
           CASE step WHEN 'view' THEN 1 WHEN 'cart' THEN 2
                     WHEN 'checkout' THEN 3 WHEN 'purchase' THEN 4 END AS ord
    FROM funnel_events
    GROUP BY step
)
SELECT step, users,
    ROUND(100.0 * users / FIRST_VALUE(users) OVER (ORDER BY ord), 1) AS pct_of_top,
    ROUND(100.0 * users / LAG(users)        OVER (ORDER BY ord), 1) AS pct_of_prev
FROM step_users
ORDER BY ord;`,
        },
        {
          kind: "prose",
          markdown: `Spot the bug: \`purchase\` shows **3** users and \`pct_of_prev\` of **150%** — impossible for a real
funnel. User 5 purchased with no \`cart\`/\`checkout\` row, so the independent per-step count overcounts.
The **strict** funnel fixes this.

## Strict funnel — enforce order with timestamps

Pivot each user's **first** timestamp per step (\`MIN(ts) FILTER (WHERE step = …)\`), then a user counts
at a step only if their timestamps are **monotonic** (each step at/after the previous).`,
        },
        {
          kind: "sql-runnable",
          title: "Strict ordered funnel",
          sql: `WITH u AS (
    SELECT user_id,
        MIN(ts) FILTER (WHERE step = 'view')     AS t_view,
        MIN(ts) FILTER (WHERE step = 'cart')     AS t_cart,
        MIN(ts) FILTER (WHERE step = 'checkout') AS t_checkout,
        MIN(ts) FILTER (WHERE step = 'purchase') AS t_purchase
    FROM funnel_events
    GROUP BY user_id
)
SELECT
    COUNT(*) FILTER (WHERE t_view IS NOT NULL)                                                AS viewed,
    COUNT(*) FILTER (WHERE t_cart     >= t_view)                                              AS carted,
    COUNT(*) FILTER (WHERE t_checkout >= t_cart AND t_cart >= t_view)                         AS checked_out,
    COUNT(*) FILTER (WHERE t_purchase >= t_checkout AND t_checkout >= t_cart AND t_cart >= t_view) AS purchased
FROM u;`,
        },
        {
          kind: "prose",
          markdown: `Now \`purchased = 2\` (only users 1 and 4 went all the way in order) — user 5's out-of-order purchase
is correctly excluded. \`NULL >= …\` is unknown, so missing steps fail the filter automatically.

## You don't always need an events table

A funnel is just **counts at successively stricter conditions**. You can build one straight from
existing tables — which is exactly the next exercise.`,
        },
        {
          kind: "sql-challenge",
          title: "Signup → order → paid funnel",
          prompt:
            "Build a 3-stage funnel from the sample database and return `step` and `users` (the count), in funnel order:\n\n1. `registered` — all users.\n2. `ordered` — distinct users who placed **any** order.\n3. `paid` — distinct users with at least one **paid** order.\n\nOrder the rows registered → ordered → paid.",
          starterSql:
            "WITH funnel(step, users, ord) AS (\n  SELECT 'registered', (SELECT COUNT(*) FROM users), 1\n  -- UNION ALL the other two stages\n)\nSELECT step, users FROM funnel ORDER BY ord;",
          solution:
            "WITH funnel(step, users, ord) AS (SELECT 'registered', (SELECT COUNT(*) FROM users), 1 UNION ALL SELECT 'ordered', (SELECT COUNT(DISTINCT user_id) FROM orders), 2 UNION ALL SELECT 'paid', (SELECT COUNT(DISTINCT user_id) FROM orders WHERE status = 'paid'), 3) SELECT step, users FROM funnel ORDER BY ord;",
          ordered: true,
          hints: [
            "Each stage is a scalar subquery: `(SELECT COUNT(DISTINCT user_id) FROM orders …)`.",
            "Carry an `ord` column so the rows come out registered → ordered → paid.",
          ],
          xp: 80,
        },
        {
          kind: "quiz",
          question:
            "Counting `COUNT(DISTINCT user_id)` per step independently can report MORE conversions at a late step than is real. Why?",
          options: [
            {
              text: "It counts users who reached a step without completing the earlier steps in order",
              correct: true,
            },
            { text: "COUNT(DISTINCT) is not supported in Postgres" },
            { text: "Window functions can't be used on events tables" },
            { text: "It always undercounts, never overcounts" },
          ],
          explanation:
            "A per-step distinct count treats steps independently, so out-of-order or skipped-step events (e.g. a purchase with no cart) still count. A strict funnel enforces the ordering with per-user timestamps.",
        },
      ],
    },

    // ──────────────────────────────────── 23. Recursive CTEs — Manager Chains
    {
      id: "recursive-hierarchies",
      title: "Recursive CTEs — Manager Chains & Trees",
      summary:
        "Walk hierarchies of unknown depth — org charts down (descendants) and management chains up (ancestors), with depth, paths, and cycle safety.",
      minutes: 18,
      blocks: [
        {
          kind: "prose",
          markdown: `## Recursion for hierarchies

When a table references itself (\`employees.manager_id → employees.id\`, \`categories.parent_id\`), you
can't know the depth in advance — so you **recurse**. A recursive CTE has two parts joined by
\`UNION ALL\`:

1. **Anchor** — the starting rows (the roots, or one specific node).
2. **Recursive member** — joins the table back to the CTE to fetch the next level, repeating until no
   new rows appear.

You can walk **down** (a manager's descendants) or **up** (an employee's chain to the CEO) — just flip
which side of the join is the CTE.`,
        },
        {
          kind: "sql-runnable",
          title: "Org chart — walk DOWN from the top (depth + path)",
          sql: `DROP TABLE IF EXISTS employees;
CREATE TABLE employees (id int, name text, manager_id int);
INSERT INTO employees VALUES
  (1,'Alice',NULL),(2,'Bob',1),(3,'Carol',1),(4,'Dave',2),(5,'Eve',2),(6,'Frank',4);

WITH RECURSIVE tree AS (
    SELECT id, name, manager_id, name AS path, 0 AS depth          -- anchor: the CEO (no manager)
    FROM employees
    WHERE manager_id IS NULL
  UNION ALL
    SELECT e.id, e.name, e.manager_id,                              -- recursive: each report
           t.path || ' > ' || e.name, t.depth + 1
    FROM employees e
    JOIN tree t ON t.id = e.manager_id
)
SELECT depth, path
FROM tree
ORDER BY path;`,
        },
        {
          kind: "prose",
          markdown: `## Walk UP — an employee's management chain

Flip the join (\`e.id = chain.manager_id\`) and anchor on one employee to climb to the root. This is the
"who are Frank's managers, all the way up?" question.`,
        },
        {
          kind: "sql-runnable",
          title: "Management chain above Frank (ancestors)",
          sql: `WITH RECURSIVE chain AS (
    SELECT id, name, manager_id, 0 AS level_up
    FROM employees
    WHERE name = 'Frank'                       -- anchor: the employee
  UNION ALL
    SELECT e.id, e.name, e.manager_id, c.level_up + 1
    FROM employees e
    JOIN chain c ON e.id = c.manager_id        -- step to THIS row's manager
)
SELECT level_up, name
FROM chain
ORDER BY level_up;`,
        },
        {
          kind: "prose",
          markdown: `## Same idea on the sample DB

The sample \`categories\` table is a hierarchy too (\`parent_id\`). Walk **up** carrying the root, and
every category learns which top-level section it belongs to.

> **Cycle safety:** \`UNION ALL\` won't stop if the data has a loop (A manages B manages A). Guard with a
> depth cap (\`WHERE depth < 100\`), track visited ids in an array (\`NOT id = ANY(path_ids)\`), or use
> \`UNION\` (dedupes, but slower). Real org/category data is usually a clean tree.

> **vs MySQL:** recursive CTEs need MySQL 8.0+; the \`WITH RECURSIVE\` syntax is the same.`,
        },
        {
          kind: "sql-runnable",
          title: "Each category's top-level root (walk up parent_id)",
          sql: `WITH RECURSIVE up AS (
    SELECT id, name, parent_id, name AS root
    FROM categories
    WHERE parent_id IS NULL
  UNION ALL
    SELECT c.id, c.name, c.parent_id, u.root
    FROM categories c
    JOIN up u ON c.parent_id = u.id
)
SELECT name, root
FROM up
ORDER BY name;`,
        },
        {
          kind: "sql-challenge",
          title: "Category depth",
          prompt:
            "Using a **recursive CTE**, return every category's `name` and its `depth` — top-level categories are depth `0`, their children depth `1`, and so on. Order by `depth`, then `name`.",
          starterSql:
            "WITH RECURSIVE tree AS (\n  -- anchor: top-level categories (parent_id IS NULL) at depth 0\n  UNION ALL\n  -- recursive: children, depth + 1\n)\nSELECT name, depth FROM tree ORDER BY depth, name;",
          solution:
            "WITH RECURSIVE tree AS (SELECT id, name, parent_id, 0 AS depth FROM categories WHERE parent_id IS NULL UNION ALL SELECT c.id, c.name, c.parent_id, t.depth + 1 FROM categories c JOIN tree t ON t.id = c.parent_id) SELECT name, depth FROM tree ORDER BY depth, name;",
          ordered: true,
          hints: [
            "Anchor: `WHERE parent_id IS NULL` with `0 AS depth`.",
            "Recursive: `JOIN tree t ON t.id = c.parent_id`, selecting `t.depth + 1`.",
          ],
          xp: 80,
        },
        {
          kind: "sql-challenge",
          title: "Everyone under a manager",
          prompt:
            "The sample DB doesn't have employees, so use `categories` as the tree: starting from **Electronics**, return the `name` of Electronics **and all categories beneath it** (its descendants, any depth). Order by `name`.\n\n*Pattern: recursive walk DOWN from one node.*",
          starterSql:
            "WITH RECURSIVE sub AS (\n  -- anchor: the 'Electronics' category\n  UNION ALL\n  -- recursive: its children\n)\nSELECT name FROM sub ORDER BY name;",
          solution:
            "WITH RECURSIVE sub AS (SELECT id, name, parent_id FROM categories WHERE name = 'Electronics' UNION ALL SELECT c.id, c.name, c.parent_id FROM categories c JOIN sub s ON c.parent_id = s.id) SELECT name FROM sub ORDER BY name;",
          ordered: true,
          hints: [
            "Anchor on the single row `WHERE name = 'Electronics'`.",
            "Recursive member: `JOIN sub s ON c.parent_id = s.id` to pull each level of children.",
          ],
          xp: 80,
        },
      ],
    },

    // ───────────────────────────────────────────────────── 24. Pivot & Unpivot
    {
      id: "pivot-unpivot",
      title: "Pivot & Unpivot",
      summary:
        "Rotate rows into columns and back — the portable FILTER/CASE pivot, the crosstab caveat, and unpivot with VALUES + LATERAL.",
      minutes: 14,
      blocks: [
        {
          kind: "prose",
          markdown: `## Pivot: rows → columns

"Pivoting" turns row values into columns — e.g. one column per status. The **portable** way (works
everywhere, no extensions) is **conditional aggregation**: \`SUM(...) FILTER (WHERE …)\` (or
\`SUM(CASE WHEN … THEN … END)\`), one expression per target column.

> **crosstab():** Postgres also ships a \`crosstab()\` function in the \`tablefunc\` **extension**
> (\`CREATE EXTENSION tablefunc\`). It's terser but needs the extension installed (it isn't here, and
> often isn't in managed setups), and the column list must be declared up front. For interviews and
> portability, **reach for \`FILTER\` first.**`,
        },
        {
          kind: "sql-runnable",
          title: "Pivot revenue by status, per quarter (FILTER)",
          sql: `SELECT
    date_trunc('quarter', created_at)::date        AS quarter,
    SUM(total) FILTER (WHERE status = 'paid')      AS paid,
    SUM(total) FILTER (WHERE status = 'refunded')  AS refunded,
    SUM(total) FILTER (WHERE status = 'pending')   AS pending,
    SUM(total)                                     AS gross
FROM orders
GROUP BY 1
ORDER BY 1;`,
        },
        {
          kind: "prose",
          markdown: `## Unpivot: columns → rows

The reverse — a wide table (one column per quarter) into tall \`(key, value)\` rows — is cleanest with
\`CROSS JOIN LATERAL (VALUES …)\` (or \`unnest(ARRAY[…])\`). Each source row is paired with one row per
column you list.`,
        },
        {
          kind: "sql-runnable",
          title: "Unpivot a wide quarterly table",
          sql: `DROP TABLE IF EXISTS q_sales;
CREATE TABLE q_sales (region text, q1 numeric, q2 numeric, q3 numeric, q4 numeric);
INSERT INTO q_sales VALUES ('North',10,20,30,40), ('South',5,15,25,35);

SELECT region, v.quarter, v.amount
FROM q_sales
CROSS JOIN LATERAL (VALUES
    ('q1', q1), ('q2', q2), ('q3', q3), ('q4', q4)
) AS v(quarter, amount)
ORDER BY region, quarter;`,
        },
        {
          kind: "sql-challenge",
          title: "Order counts per status, in one row",
          prompt:
            "Pivot the orders into a single row with three columns — `paid`, `pending`, `refunded` — each the **count** of orders with that status.",
          starterSql:
            "SELECT\n  -- COUNT(*) FILTER (WHERE status = 'paid')   AS paid,\n  -- ... pending, refunded\nFROM orders;",
          solution:
            "SELECT COUNT(*) FILTER (WHERE status = 'paid') AS paid, COUNT(*) FILTER (WHERE status = 'pending') AS pending, COUNT(*) FILTER (WHERE status = 'refunded') AS refunded FROM orders;",
          hints: ["One `COUNT(*) FILTER (WHERE status = '…')` per column; no GROUP BY needed."],
          xp: 70,
        },
      ],
    },

    // ──────────────────────────────── 25. Statistics, Percentiles & Histograms
    {
      id: "statistics-distributions",
      title: "Statistics, Percentiles & Histograms",
      summary:
        "Median two ways (incl. without PERCENTILE_CONT), percent_rank vs cume_dist, mode, and width_bucket histograms.",
      minutes: 16,
      blocks: [
        {
          kind: "prose",
          markdown: `## Median — the clean way and the "no percentile" way

The clean way is the ordered-set aggregate \`PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY x)\`. But
interviewers love asking for the median **without** it — to see if you understand the definition. The
trick: number the rows, count them, and average the **middle one or two**:

- Odd count → one middle row at \`(n+1)/2\`.
- Even count → average the two middle rows.

\`rn IN (FLOOR((c+1)/2.0), CEIL((c+1)/2.0))\` selects exactly those, and \`AVG\` finishes the job for both
cases at once.`,
        },
        {
          kind: "sql-runnable",
          title: "Median price — both methods agree",
          sql: `SELECT
    (SELECT PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY price) FROM products) AS median_builtin,
    (SELECT AVG(price)
     FROM (
        SELECT price,
               ROW_NUMBER() OVER (ORDER BY price) AS rn,
               COUNT(*)     OVER ()               AS c
        FROM products
     ) t
     WHERE rn IN (FLOOR((c + 1) / 2.0), CEIL((c + 1) / 2.0))) AS median_manual;`,
        },
        {
          kind: "prose",
          markdown: `## Relative rank: percent_rank, cume_dist, mode

- \`percent_rank()\` — where a row sits in the distribution, 0 to 1 (its rank minus 1, over n−1).
- \`cume_dist()\` — cumulative distribution: fraction of rows at or below this one.
- \`mode() WITHIN GROUP (ORDER BY x)\` — the most frequent value.`,
        },
        {
          kind: "sql-runnable",
          title: "Where does each price sit?",
          sql: `SELECT
    name,
    price,
    ROUND(percent_rank() OVER (ORDER BY price)::numeric, 2) AS pct_rank,
    ROUND(cume_dist()    OVER (ORDER BY price)::numeric, 2) AS cume_dist
FROM products
ORDER BY price;`,
        },
        {
          kind: "prose",
          markdown: `## Histograms with width_bucket

\`width_bucket(value, low, high, n)\` assigns a value to one of \`n\` equal-width buckets — the standard
way to build a histogram in SQL.`,
        },
        {
          kind: "sql-runnable",
          title: "Price histogram (3 buckets, 0–1500)",
          sql: `SELECT
    width_bucket(price, 0, 1500, 3) AS bucket,
    COUNT(*)                        AS products,
    MIN(price)                      AS min_price,
    MAX(price)                      AS max_price
FROM products
GROUP BY 1
ORDER BY 1;`,
        },
        {
          kind: "sql-challenge",
          title: "Median order total — no PERCENTILE_CONT",
          prompt:
            "Return a single value `median` — the median of all `orders.total` — **without** using `PERCENTILE_CONT`/`PERCENTILE_DISC`. Use the ROW_NUMBER + COUNT trick.\n\n*(There are 6 orders, so the answer is the average of the 3rd and 4th totals.)*",
          starterSql:
            "SELECT AVG(total) AS median\nFROM (\n  -- number rows by total, and get the total count\n) t\nWHERE rn IN ( /* the middle one or two */ );",
          solution:
            "SELECT AVG(total) AS median FROM (SELECT total, ROW_NUMBER() OVER (ORDER BY total) AS rn, COUNT(*) OVER () AS c FROM orders) t WHERE rn IN (FLOOR((c + 1) / 2.0), CEIL((c + 1) / 2.0));",
          hints: [
            "Inner query: `ROW_NUMBER() OVER (ORDER BY total)` and `COUNT(*) OVER ()`.",
            "Keep rows where `rn IN (FLOOR((c+1)/2.0), CEIL((c+1)/2.0))`, then `AVG`.",
          ],
          xp: 90,
        },
      ],
    },

    // ──────────────────────────────── 26. Data-Modifying CTEs & MERGE
    {
      id: "writable-ctes-merge",
      title: "Data-Modifying CTEs & MERGE",
      summary:
        "Postgres power tools: writable CTEs (INSERT/UPDATE/DELETE … RETURNING inside WITH) for multi-step atomic writes, and MERGE for conditional upserts.",
      minutes: 16,
      blocks: [
        {
          kind: "prose",
          markdown: `## Writable CTEs — multiple mutations in one statement

A CTE can be an \`INSERT\`/\`UPDATE\`/\`DELETE … RETURNING\`. Chain them to do several writes **atomically**
in one statement — e.g. move rows between tables, or insert a parent and its children together. All
sub-statements see the **same snapshot**, so a writable CTE reads the table as it was *before* the
statement ran.

> Each runnable below **resets the sample DB first** (badge), so your writes don't leak.`,
        },
        {
          kind: "sql-runnable",
          title: "Insert a category and a product that references it — one statement",
          resetBefore: true,
          sql: `WITH new_cat AS (
    INSERT INTO categories (name, parent_id)
    VALUES ('Tablets', 1)
    RETURNING id
)
INSERT INTO products (name, category_id, price)
SELECT 'iPad', id, 599.00 FROM new_cat
RETURNING name, category_id, price;`,
        },
        {
          kind: "sql-runnable",
          title: "Move rows between tables atomically (DELETE … then INSERT)",
          sql: `-- Self-contained so it runs repeatedly.
DROP TABLE IF EXISTS tasks;
DROP TABLE IF EXISTS tasks_archive;
CREATE TABLE tasks (id int, title text, done boolean);
INSERT INTO tasks VALUES (1,'spec',true), (2,'build',false), (3,'ship',true);
CREATE TABLE tasks_archive (LIKE tasks);

-- One statement: delete the done tasks AND archive exactly those rows.
WITH moved AS (
    DELETE FROM tasks
    WHERE done
    RETURNING *
)
INSERT INTO tasks_archive
SELECT * FROM moved;

SELECT (SELECT COUNT(*) FROM tasks)         AS tasks_left,
       (SELECT COUNT(*) FROM tasks_archive) AS archived;`,
        },
        {
          kind: "prose",
          markdown: `## MERGE — conditional upsert (Postgres 15+)

\`MERGE\` matches a target against a source and runs different actions per case: \`WHEN MATCHED\` update/
delete, \`WHEN NOT MATCHED\` insert. It's the SQL-standard sibling of \`INSERT … ON CONFLICT\` and handles
update *and* insert *and* delete in one pass.`,
        },
        {
          kind: "sql-runnable",
          title: "Upsert a price list with MERGE",
          resetBefore: true,
          sql: `MERGE INTO products p
USING (VALUES (1, 'iPhone 15 Pro', 1099.00),
              (99, 'New Gadget',     49.00)) AS s(id, name, price)
ON p.id = s.id
WHEN MATCHED THEN
    UPDATE SET name = s.name, price = s.price
WHEN NOT MATCHED THEN
    INSERT (id, name, category_id, price) VALUES (s.id, s.name, 3, s.price);

SELECT id, name, price FROM products WHERE id IN (1, 99) ORDER BY id;`,
        },
        {
          kind: "prose",
          markdown: `> **MERGE vs ON CONFLICT:** \`ON CONFLICT\` is simpler and great for "insert-or-update on a unique key".
> \`MERGE\` is more general (multiple match branches, deletes, a join-based source) but can't use
> \`RETURNING\` and has different concurrency semantics. For a plain upsert, \`ON CONFLICT\` is usually the
> pick; reach for \`MERGE\` when you need branching logic.`,
        },
        {
          kind: "sql-challenge",
          title: "Discount Apple products and return them — one statement",
          prompt:
            "In a **single statement** using a writable CTE, give every product tagged `'apple'` a 10% discount (round the new price to 2 decimals) and return their `name` and new `price`, ordered by `name`.",
          starterSql:
            "WITH upd AS (\n  UPDATE products SET price = -- 90%, rounded\n  WHERE 'apple' = ANY(tags)\n  RETURNING name, price\n)\nSELECT name, price FROM upd ORDER BY name;",
          solution:
            "WITH upd AS (UPDATE products SET price = ROUND(price * 0.9, 2) WHERE 'apple' = ANY(tags) RETURNING name, price) SELECT name, price FROM upd ORDER BY name;",
          ordered: true,
          hints: [
            "`UPDATE … SET price = ROUND(price * 0.9, 2) WHERE 'apple' = ANY(tags) RETURNING name, price`.",
            "Wrap it in `WITH upd AS (…)` and `SELECT … FROM upd ORDER BY name`.",
          ],
          xp: 90,
        },
      ],
    },

    // ──────────────────────────────── 27. Pagination & Performance
    {
      id: "pagination-performance",
      title: "Pagination & Performance",
      summary:
        "Keyset (seek) pagination vs slow OFFSET, EXISTS vs IN, anti-joins, and reading the plan to confirm an index is used.",
      minutes: 14,
      blocks: [
        {
          kind: "prose",
          markdown: `## OFFSET is a trap for deep pages

\`ORDER BY … LIMIT 20 OFFSET 100000\` still **scans and discards** 100,000 rows — it gets slower the
deeper you page. **Keyset / "seek" pagination** instead remembers the last row's sort key and asks for
"the next rows after it", which an index can jump straight to:

\`\`\`sql
-- Page 1
SELECT * FROM orders ORDER BY created_at, id LIMIT 20;
-- Next page: pass the last row's (created_at, id) as the cursor
SELECT * FROM orders
WHERE (created_at, id) > ('2025-05-20', 2)   -- row-value comparison
ORDER BY created_at, id
LIMIT 20;
\`\`\`

The \`(a, b) > (x, y)\` **row-value comparison** is the clean way to seek on a composite sort key.`,
        },
        {
          kind: "sql-runnable",
          title: "Keyset pagination — the next orders after a cursor",
          sql: `SELECT id, created_at, total
FROM orders
WHERE (created_at, id) > ('2025-05-01'::date, 0)
ORDER BY created_at, id
LIMIT 3;`,
        },
        {
          kind: "prose",
          markdown: `## EXISTS vs IN, and anti-joins

- **\`EXISTS\` (semi-join)** stops at the first match and handles NULLs safely — prefer it for
  "has at least one related row".
- **\`NOT EXISTS\` (anti-join)** is the safe "has none" — unlike \`NOT IN\`, which returns nothing if the
  subquery yields a NULL.
- A \`LEFT JOIN … WHERE right.id IS NULL\` is the other anti-join form and is often the fastest.`,
        },
        {
          kind: "sql-runnable",
          title: "EXISTS semi-join + EXPLAIN the plan",
          sql: `EXPLAIN
SELECT name
FROM users u
WHERE EXISTS (SELECT 1 FROM orders o WHERE o.user_id = u.id);`,
        },
        {
          kind: "prose",
          markdown: `> **Tip:** to make keyset pagination fast, index the exact sort key
> (\`CREATE INDEX ON orders (created_at, id)\`). Then the plan shows an **Index Scan** instead of a
> \`Seq Scan\` + \`Sort\`, and each page is O(log n) to locate. Revisit the *Indexes & EXPLAIN* lesson for
> reading plans.`,
        },
        {
          kind: "sql-challenge",
          title: "Keyset: the page after price 999",
          prompt:
            "Using keyset-style filtering (no `OFFSET`), return the products **priced above 999** as `name`, `price`, ordered by `price` ascending — i.e. the next page after the cursor price `999`.",
          starterSql:
            "SELECT name, price\nFROM products\n-- seek past the cursor price, then order + limit\n;",
          solution:
            "SELECT name, price FROM products WHERE price > 999 ORDER BY price ASC;",
          ordered: true,
          hints: ["`WHERE price > 999` is the seek; then `ORDER BY price`."],
          xp: 70,
        },
      ],
    },

    // ─────────────────────────────── 28. Data Engineering & ETL Patterns
    {
      id: "etl-patterns",
      title: "Data Engineering & ETL Patterns",
      summary:
        "The DE/ETL/BI patterns interviewers reuse — incremental load (watermark), SCD Type 2, calendar/date dimension, dynamic pivot — in real PostgreSQL (not T-SQL).",
      minutes: 22,
      blocks: [
        {
          kind: "prose",
          markdown: `## Most "Advanced SQL Patterns" lists are SQL Server — here they are in Postgres

Popular interview cheat-sheets are usually written in **T-SQL (SQL Server)**. The *ideas* port
directly, but the **syntax doesn't**. Quick translation:

| T-SQL (SQL Server) | PostgreSQL |
|---|---|
| \`DATEADD(DAY, n, d)\` | \`d + n * interval '1 day'\` |
| \`DATEDIFF(MINUTE, a, b)\` | \`EXTRACT(epoch FROM b - a) / 60\` |
| recursive CTE + \`OPTION(MAXRECURSION n)\` | recursive CTE (no cap needed) — or just \`generate_series\` |
| \`PIVOT (… FOR col IN (…))\` | \`SUM(…) FILTER (WHERE col = …)\` (or \`crosstab\`) |
| \`STRING_AGG(x, ',')\` | \`string_agg(x, ',')\` ✓ (same) / \`array_agg\` |
| \`OFFSET 10 ROWS FETCH NEXT 10 ROWS ONLY\` | \`LIMIT 10 OFFSET 10\` (or keyset) |
| \`OPENJSON(@json)\` | \`jsonb_array_elements\` / \`jsonb_to_recordset\` |
| \`ISNULL(a,b)\` / \`GETDATE()\` | \`COALESCE(a,b)\` / \`now()\` |

**Coverage map** — most of those "20 patterns" you already practiced here:

| Pattern | Lesson |
|---|---|
| Gap & island, Top-N per group, Running total | *Window Functions*, *Advanced Workshop* |
| Moving average, Sessionization, Dedupe/Latest record | *Analytics Patterns* |
| Recursive hierarchy | *Recursive CTEs* |
| Sequence generator, Calendar (date spine) | *String/Date Functions* (+ below) |
| String aggregation, Find duplicates, Nth highest | *String Functions*, *GROUP BY*, *Interview Patterns* |
| Lead/Lag, Pagination, Anti-join, MERGE, JSON parsing | *Window Functions*, *Pagination*, *Interview Patterns*, *MERGE*, *JSONB* |

This lesson fills the remaining **ETL-flavored** gaps: incremental load, SCD Type 2, a real date
dimension, and dynamic pivot.`,
        },

        {
          kind: "prose",
          markdown: `## 1. Incremental load (high-water-mark)

The backbone of every incremental pipeline: only pull rows **newer than the last successful load**.
Keep a watermark (the max timestamp loaded) and filter the source against it.`,
        },
        {
          kind: "sql-runnable",
          title: "Pull only rows past the watermark",
          sql: `DROP TABLE IF EXISTS src;
DROP TABLE IF EXISTS load_audit;
CREATE TABLE src (id int, updated_at date);
INSERT INTO src VALUES (1,'2026-01-01'), (2,'2026-02-01'), (3,'2026-03-01');
CREATE TABLE load_audit (last_loaded date);
INSERT INTO load_audit VALUES ('2026-01-15');   -- last successful load

SELECT *
FROM src
WHERE updated_at > (SELECT MAX(last_loaded) FROM load_audit)
ORDER BY id;`,
        },

        {
          kind: "prose",
          markdown: `## 2. SCD Type 2 — keep full history

A **Slowly Changing Dimension Type 2** never overwrites: when an attribute changes, you **close** the
current row (set \`valid_to\` / \`is_current = false\`) and **insert a new version**. A writable CTE does
both atomically — the classic "latest record via \`rn = 1\`" only finds the current row; SCD2 stores the
whole timeline.`,
        },
        {
          kind: "sql-runnable",
          title: "Apply a change as a new version (close + insert)",
          sql: `DROP TABLE IF EXISTS dim_customer;
CREATE TABLE dim_customer (
    sk          serial PRIMARY KEY,
    customer_id int, name text, city text,
    valid_from  date, valid_to date, is_current boolean
);
INSERT INTO dim_customer (customer_id, name, city, valid_from, valid_to, is_current)
VALUES (100, 'Alice', 'NYC', '2026-01-01', NULL, true);

-- Alice moves to LA on 2026-06-01: close the old version, open a new one.
WITH closed AS (
    UPDATE dim_customer
    SET valid_to = '2026-06-01', is_current = false
    WHERE customer_id = 100 AND is_current
    RETURNING customer_id
)
INSERT INTO dim_customer (customer_id, name, city, valid_from, valid_to, is_current)
SELECT 100, 'Alice', 'LA', '2026-06-01', NULL, true
FROM closed;

SELECT customer_id, name, city, valid_from, valid_to, is_current
FROM dim_customer
ORDER BY valid_from;`,
        },

        {
          kind: "prose",
          markdown: `## 3. Calendar / date dimension

A date dimension (\`dim_date\`) powers BI — it lets you join sparse facts onto a complete calendar and
slice by month/quarter/weekday. In Postgres you don't need a recursive CTE (the T-SQL way): just
\`generate_series\` plus \`EXTRACT\`/\`to_char\` for the attributes.`,
        },
        {
          kind: "sql-runnable",
          title: "Build a date dimension with generate_series",
          sql: `SELECT
    d::date                                AS date,
    EXTRACT(year   FROM d)::int            AS year,
    EXTRACT(quarter FROM d)::int           AS quarter,
    EXTRACT(month  FROM d)::int            AS month,
    to_char(d, 'Dy')                       AS weekday,
    EXTRACT(isodow FROM d) IN (6, 7)       AS is_weekend
FROM generate_series('2026-01-01', '2026-01-07', '1 day'::interval) AS d
ORDER BY d;`,
        },

        {
          kind: "prose",
          markdown: `## 4. Dynamic pivot

Postgres has **no \`PIVOT\` operator**. For a **fixed** set of columns you use \`FILTER\` (see the *Pivot &
Unpivot* lesson). For a **dynamic** set (you don't know the categories ahead of time), the interview
answer is: **generate the pivot SQL as a string**, then run it with \`EXECUTE\` inside a PL/pgSQL function.
Here's the generation step — note how \`format(%L, …)\` safely quotes literals and \`%I\` quotes identifiers:`,
        },
        {
          kind: "sql-runnable",
          title: "Generate a pivot query dynamically",
          sql: `SELECT 'SELECT '
    || string_agg(
         format('SUM(total) FILTER (WHERE status = %L) AS %I', status, status),
         ', ' ORDER BY status)
    || ' FROM orders' AS generated_sql
FROM (SELECT DISTINCT status FROM orders) s;`,
        },
        {
          kind: "prose",
          markdown: `In a function you'd wrap it as \`EXECUTE (that string)\` (or \`RETURN QUERY EXECUTE …\`). The other option
is \`crosstab()\` from the \`tablefunc\` extension — terser, but it needs the extension installed and an
explicit column list, so it isn't always available (it isn't in this browser engine).`,
        },

        {
          kind: "prose",
          markdown: `## Graded exercises`,
        },
        {
          kind: "sql-challenge",
          title: "Incremental load from a watermark",
          prompt:
            "The last load watermark is `2025-06-01`. Return `id` and `created_at` for the `orders` that have been created **after** the watermark (`created_at > '2025-06-01'`), ordered by `id`.",
          starterSql:
            "SELECT id, created_at\nFROM orders\n-- only rows past the watermark\nORDER BY id;",
          solution:
            "SELECT id, created_at FROM orders WHERE created_at > '2025-06-01' ORDER BY id;",
          ordered: true,
          hints: ["`WHERE created_at > '2025-06-01'` — in a real pipeline the literal is `(SELECT MAX(last_loaded) FROM load_audit)`."],
          xp: 70,
        },
        {
          kind: "sql-challenge",
          title: "Build a 5-day date dimension",
          prompt:
            "Using `generate_series`, return a date dimension for **March 1–5, 2026**: columns `date` (a date) and `dow` (the ISO day-of-week, 1 = Monday … 7 = Sunday), ordered by `date`.",
          starterSql:
            "SELECT d::date AS date, /* ISO dow */ \nFROM generate_series( /* start, end, step */ ) AS d\nORDER BY d;",
          solution:
            "SELECT d::date AS date, EXTRACT(isodow FROM d)::int AS dow FROM generate_series('2026-03-01','2026-03-05','1 day'::interval) AS d ORDER BY d;",
          ordered: true,
          hints: [
            "`generate_series('2026-03-01','2026-03-05','1 day'::interval)`.",
            "`EXTRACT(isodow FROM d)::int` gives 1–7 (Mon–Sun).",
          ],
          xp: 80,
        },
      ],
    },
  ],
};
