# PyLearn 🐍

An interactive, **visual** platform to learn Python — CodeSignal-style, but everything
runs **100% in your browser**. Write code, press Run, and *watch loops and algorithms
animate step by step*. No backend, no install of Python required: a full CPython
interpreter runs client-side via [Pyodide](https://pyodide.org) (WebAssembly).

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
- **Track progress** — XP, daily streak, and per-lesson completion, saved locally.

## Curriculum

| Module | Status | Highlights |
|---|---|---|
| 🐍 Python Basics | **deep** | types, operators, strings, conditionals, **loops (visualized)**, functions, comprehensions, errors |
| 🧱 Data Structures | **deep** | lists, tuples, dicts, sets, stacks/queues (with visualizers) |
| 🧠 DSA — Algorithms | **deep** | two pointers, hashing, recursion, sorting (animated), binary search, linked lists, trees, graphs (BFS/DFS), intro DP |
| 📦 Core Libraries | **deep** | collections/itertools, datetime/random/json, math/statistics, functools (+ challenges) |
| 🔢 NumPy | **deep** | arrays & vectorization, indexing/reshaping, aggregations/broadcasting (+ challenges) |
| 🐼 Pandas | **deep** | DataFrames, selecting/filtering, cleaning, group-by/agg, merge/join (+ challenges) |
| 📈 Data Visualization | **deep** | matplotlib, customizing plots, plotting from pandas, seaborn (distribution & categorical) |
| ⚡ PySpark | starter (conceptual) | Spark model, lazy eval, pandas↔PySpark cheat sheet |

> Plots render **automatically** whenever your code draws a matplotlib/seaborn figure —
> no `plt.show()` needed.

> **Why PySpark is conceptual:** Spark needs a JVM and a cluster, which cannot run in
> the browser. This module teaches the model and API (with a pandas↔Spark mapping) so
> the code is familiar when you run it on a real cluster.

## Architecture

```
React + Vite + TypeScript + Tailwind
   │
   ├─ Monaco editor ........... code editing
   ├─ Pyodide (Web Worker) .... runs Python off the main thread
   │     ├─ run  → stdout/stderr (+ matplotlib PNGs)
   │     ├─ trace → sys.settrace step recorder (ExecutionVisualizer)
   │     └─ install → micropip / loadPackage
   ├─ Zustand ................. progress + XP (persisted to localStorage)
   └─ Content as typed TS ..... src/content/modules/*.ts
```

Key directories:

- `src/pyodide/` — `worker.ts` (interpreter host), `pyodideClient.ts` (typed promise
  API), `tracer.py` (the step recorder behind the visualizer).
- `src/components/visualizer/` — `ExecutionVisualizer.tsx` and `dsa/*` animations.
- `src/components/challenge/ChallengeRunner.tsx` — the test-case runner.
- `src/content/` — `curriculum.ts` (the index) + `modules/*.ts` (lessons).

## Quickstart

```bash
npm install
npm run dev      # open the printed localhost URL (http://localhost:5173)
```

The first time you run any code, Pyodide downloads (~6–10 MB) and boots — the top bar
shows progress and flips to **“Python ready”**. NumPy/pandas/etc. install on first use.

Build for production: `npm run build` then `npm run preview`.

## Adding a lesson

Lessons are plain typed data — no markdown files to wire up. Edit the relevant module
in `src/content/modules/`, appending a `Lesson` whose `blocks` array mixes:

`prose` · `runnable` · `visualized` · `dsa-viz` · `challenge` · `quiz`

See `src/types/lesson.ts` for the full shape, and `modules/basics.ts` for examples.

## Roadmap

See [`implementation_plan.md`](./implementation_plan.md) for what's built and what's next.
