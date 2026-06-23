# Data Learning 🐍🐘

An interactive, **visual** platform to learn **Python and SQL** — CodeSignal-style, but
everything runs **100% in your browser**. Write code, press Run, and *watch loops and
algorithms animate step by step* — or query a **real PostgreSQL database**. No backend,
no installs: a full CPython interpreter runs client-side via
[Pyodide](https://pyodide.org), and a full Postgres engine via
[PGlite](https://pglite.dev) — both WebAssembly.

The platform is organized into two **tracks**:

- **Python** — basics → data structures → DSA → libraries → NumPy/Pandas → viz → ML.
- **SQL** — a **PostgreSQL** subsection where every example runs against a seeded
  e-commerce database and most lessons end with a checked query exercise.

## What you can do

- **Learn by doing** — every concept comes with an editable, runnable code block.
- **See loops flow** — the **Execution Visualizer** steps through your code line by
  line, highlighting the current line and animating the variable table on each
  iteration (inspired by pythontutor.com).
- **Visualize DSA** — animated views of arrays, sorting, linked lists, stacks/queues,
  binary trees (BST traversals), graphs (BFS/DFS), and the recursion call stack.
- **Solve challenges** — CodeSignal-style problems with visible + hidden test cases,
  instant pass/fail, and XP rewards.
- **Real data libraries** — `numpy`, `pandas`, `matplotlib`, and `seaborn` run in the
  browser; plots render inline.
- **Query real SQL** — a full **PostgreSQL** engine (PGlite/WASM) runs in the browser.
  SQL lessons render results as a grid, ship a **schema explorer** for the sample DB, and
  grade exercises by comparing your result set to a reference solution. There's also a
  free-form **SQL Playground**.
- **Track progress** — XP, daily streak, and per-lesson completion, saved locally.

## Curriculum

| Module | Status | Highlights |
|---|---|---|
| 🐍 Python Basics | **deep** | types, operators, strings, conditionals, **loops (visualized)**, functions, comprehensions, errors |
| 🧱 Data Structures | **deep** | lists, tuples, dicts, sets, stacks/queues (with visualizers) |
| 🧠 DSA — Algorithms | **deep** | two pointers, hashing (hash-table viz), sliding window, recursion, backtracking, sorting, binary search, linked lists, trees, heaps, graphs (BFS/DFS), tries, DP (incl. coin change) — with a call-stack panel + watch variables in the visualizer |
| 🤖 Intro to ML | starter | scikit-learn in the browser: train/test split, fit/evaluate, decision-tree classifier |
| 📦 Core Libraries | **deep** | collections/itertools, datetime/random/json, math/statistics, functools (+ challenges) |
| 🔢 NumPy | **deep** | arrays & vectorization, indexing/reshaping, aggregations/broadcasting (+ challenges) |
| 🐼 Pandas | **deep** | DataFrames, selecting/filtering, cleaning, group-by/agg, merge/join (+ challenges) |
| 📈 Data Visualization | **deep** | matplotlib, customizing plots, plotting from pandas, seaborn (distribution & categorical) |
| ⚡ PySpark | starter (conceptual) | Spark model, lazy eval, pandas↔PySpark cheat sheet |

### SQL track

| Module | Status | Highlights |
|---|---|---|
| 🐘 PostgreSQL | **deep** | 27 lessons: SELECT/WHERE, JOINs (+LATERAL), GROUP BY/HAVING/FILTER, CASE, subqueries/EXISTS, CTEs (+recursive), window functions, set ops, INSERT/UPDATE/DELETE/UPSERT, transactions, DDL/constraints, indexes/EXPLAIN, arrays, JSONB, views/matviews, functions/triggers (PL/pgSQL), string/date/math/NULL functions, full-text search, interview patterns, an **Advanced Query Workshop** (multi-CTE pipelines: UNNEST + window + FILTER + ROLLUP + gaps-and-islands), an **Analytics Patterns (Interview Pack)** (period-over-period/LAG, rolling averages, gap-based sessionization, dedupe-keep-latest, NTILE segmentation, cohort retention), a **Funnel Conversion** lesson (loose vs. strict ordered funnels), a **Recursive CTEs — Manager Chains & Trees** lesson (walk hierarchies up/down), **Pivot & Unpivot** (FILTER pivot + VALUES/LATERAL unpivot), **Statistics, Percentiles & Histograms** (median with/without `PERCENTILE_CONT`, `percent_rank`/`cume_dist`, `width_bucket`), **Data-Modifying CTEs & MERGE** (writable CTEs + `MERGE` upserts), and **Pagination & Performance** (keyset/seek pagination, EXISTS vs IN, anti-joins) — each runnable against a seeded e-commerce DB, most with a graded exercise. Includes "vs MySQL" notes throughout. |

> Plots render **automatically** whenever your code draws a matplotlib/seaborn figure —
> no `plt.show()` needed.

> **Why PySpark is conceptual:** Spark needs a JVM and a cluster, which cannot run in
> the browser. This module teaches the model and API (with a pandas↔Spark mapping) so
> the code is familiar when you run it on a real cluster.

## Design

**"Aurora Glass"** — a dark, premium aesthetic: an animated aurora gradient-mesh
background, **glassmorphism** panels (translucent + blur + hairline borders), a
violet→cyan→lime accent spectrum, and a Space Grotesk / Inter / JetBrains Mono type
trio. Motion via Framer Motion (entrance/hover springs, animated counters), icons via
lucide-react, and gamification with XP **levels**, an animated streak flame, and
**confetti** on solves/completions. Respects `prefers-reduced-motion`.

## Architecture

```
React + Vite + TypeScript + Tailwind
   │
   ├─ Monaco editor ........... code editing (Python + SQL)
   ├─ Pyodide (Web Worker) .... runs Python off the main thread
   │     ├─ run  → stdout/stderr (+ matplotlib PNGs)
   │     ├─ trace → sys.settrace step recorder (ExecutionVisualizer)
   │     └─ install → micropip / loadPackage
   ├─ PGlite (WASM) ........... real PostgreSQL in the browser
   │     ├─ exec  → result grid / affected rows / errors
   │     └─ reset → reload the seeded e-commerce DB
   ├─ Zustand ................. progress + XP (persisted to localStorage)
   └─ Content as typed TS ..... src/content/modules/**/*.ts
```

Key directories:

- `src/pyodide/` — `worker.ts` (interpreter host), `pyodideClient.ts` (typed promise
  API), `tracer.py` (the step recorder behind the visualizer).
- `src/sql/` — `sqlClient.ts` (PGlite wrapper: `exec`/`reset`/`queryRows` + status) and
  `seeds.ts` (the e-commerce schema/data + schema description).
- `src/components/visualizer/` — `ExecutionVisualizer.tsx` and `dsa/*` animations.
- `src/components/challenge/` — `ChallengeRunner.tsx` (Python tests) and
  `SqlChallengeRunner.tsx` (compares your result set to a reference solution).
- `src/components/sql/` — `SqlResultTable.tsx`, `SchemaExplorer.tsx`.
- `src/content/` — `curriculum.ts` (the index, grouped by `track`) + `modules/**/*.ts`
  (lessons; SQL lives in `modules/sql/postgres.ts`).

## Quickstart

```bash
npm install
npm run dev      # open the printed localhost URL (http://localhost:5173)
```

The first time you run Python, Pyodide downloads (~6–10 MB) and boots; NumPy/pandas/etc.
install on first use. The first time you run SQL, PGlite's Postgres WASM (~10 MB) downloads
and boots, then seeds the sample database. Both are cached by the service worker for
offline use after the first visit.

Build for production: `npm run build` then `npm run preview`.

## Adding a lesson

Lessons are plain typed data — no markdown files to wire up. Edit the relevant module
in `src/content/modules/`, appending a `Lesson` whose `blocks` array mixes:

`prose` · `runnable` · `visualized` · `dsa-viz` · `challenge` · `quiz` ·
`sql-runnable` · `sql-challenge`

A module's `track` field (`"Python"` | `"SQL"`, default `"Python"`) controls which
section it appears under in the sidebar/home. SQL blocks run against the seeded DB in
`src/sql/seeds.ts`; a `sql-challenge` is graded by comparing your result set to its
`solution` query (order-insensitive unless `ordered: true`). See `src/types/lesson.ts`
for the full shape, `modules/basics.ts` for Python examples, and
`modules/sql/postgres.ts` for SQL.

## Deployment

The app is a static SPA, deployed to **GitHub Pages** via GitHub Actions
(`.github/workflows/deploy.yml`) on every push to `main`:

- Live URL: **https://andres-lizarazo.github.io/data-learning/**
- The production build sets `DEPLOY_BASE=/data-learning/` (Vite `base`) so assets/routes
  resolve under the project subpath; the router uses `import.meta.env.BASE_URL` as its
  `basename`. A `404.html` (copy of `index.html`) handles deep-link refreshes.
- **Local dev is unaffected** — `npm run dev` still serves at `http://localhost:5173/` (base `/`).

Pyodide and fonts load from their CDNs at runtime and are cached by the service worker, so
the deployed app works offline after the first visit.

## Roadmap

See [`implementation_plan.md`](./implementation_plan.md) for what's built and what's next.
