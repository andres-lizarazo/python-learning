# PyLearn — Implementation Plan

## Overview

PyLearn is an interactive, visual platform for learning Python — from basics through
data structures, data wrangling/visualization, and a dedicated DSA track. It is a
CodeSignal-style experience that runs **entirely in the browser**: a full CPython
interpreter (Pyodide/WebAssembly) executes user code client-side, with step-by-step
execution visualization and animated DSA components. Local-first; deployment later.

## Architecture

- **Frontend:** React + Vite + TypeScript + Tailwind. Monaco editor. React Router.
- **Python runtime:** Pyodide in a **Web Worker** (`src/pyodide/worker.ts`), accessed
  through a typed promise client (`src/pyodide/pyodideClient.ts`). Capabilities:
  `run` (stdout/stderr + matplotlib PNGs), `trace` (sys.settrace step recorder in
  `tracer.py`), `install` (loadPackage/micropip).
- **State:** Zustand. `pyodideStore` (boot/ready/status), `progressStore`
  (completed lessons, XP, streak — persisted to localStorage).
- **Content:** typed `Module`/`Lesson` data in `src/content/modules/*.ts`, indexed by
  `src/content/curriculum.ts`. Lessons are ordered **blocks** rendered by
  `LessonRenderer`: `prose | runnable | visualized | dsa-viz | challenge | quiz`.
- **Visualizers:** `ExecutionVisualizer` (line highlight + animated variable table +
  play/step/scrub) and `components/visualizer/dsa/*` (array, sorting, linked-list,
  stack/queue, tree/BST, graph BFS/DFS, recursion call stack).

## Implementation Checklist

### Platform
- [x] Vite + React + TS + Tailwind scaffold and build config
- [x] Pyodide Web Worker + typed client (run / trace / install / plots)
- [x] `sys.settrace` step recorder (`tracer.py`)
- [x] UI shell: Layout, Sidebar (curriculum tree + progress), TopBar (XP/streak/status)
- [x] Routing: Home, Module page, Lesson page, Playground
- [x] Monaco CodeEditor (with reactive current-line highlight), OutputConsole, PlotPanel
- [x] LessonRenderer + block components (prose, runnable, visualized, dsa-viz, quiz)
- [x] ChallengeRunner (isolated test harness, pass/fail, runtime, solution reveal)
- [x] ExecutionVisualizer (flagship "see loops flow")
- [x] DSA visualizers: Array, Sorting (bubble/insertion/selection/merge/quick),
      LinkedList, Stack/Queue, Tree (in/pre/post/level traversals), Graph (BFS/DFS),
      Recursion call stack
- [x] Progress store: XP, streak, lesson completion, challenge solves (localStorage)
- [x] Markdown styling, dark theme, mobile sidebar drawer

### Content — deep modules
- [x] Python Basics (8 lessons): types, operators, strings, conditionals,
      **loops (visualized)**, functions, comprehensions, errors — each with challenges
- [x] Data Structures (5 lessons): lists, tuples, dicts, sets, stacks/queues + visuals
- [x] DSA (10 lessons): two pointers, hashing, recursion, sorting, binary search,
      linked lists, trees, graphs, intro DP — each pairing a visualizer + challenge

### Content — deepened modules (now "deep")
- [x] Core Libraries: collections/itertools, datetime/random/json, math/statistics,
      functools — with challenges
- [x] NumPy: arrays & vectorization, indexing/reshaping, aggregations/broadcasting —
      with challenges
- [x] Pandas: DataFrames, selecting/filtering, cleaning, group-by/agg, merge/join —
      with challenges
- [x] Data Visualization: matplotlib, customizing plots, pandas plotting, seaborn
      (distribution + categorical/heatmaps)

### Content — starter (conceptual)
- [x] PySpark (conceptual): Spark model + quiz; pandas↔PySpark cheat sheet

### Review pass (round 2)
- [x] Fix: SortingViz bars rendered at 0-height → px-based bar heights with labels
- [x] Fix: editable code persisted across lessons → `key={lesson.id}` remount in LessonPage
- [x] Auto-render matplotlib/seaborn figures after every run (worker always calls
      `__pylearn_render_plots`, which also closes figures); removed Playground checkbox
- [x] Challenges support `packages` (numpy/pandas challenges install deps before running)
- [x] Surface live install/boot status while a run/trace is in progress
- [x] Reuse Pyodide helper proxies in the worker (no per-call PyProxy leak)
- [x] Verified all new numpy/pandas/libraries challenges pass against real numpy/pandas

### Docs
- [x] README.md (overview, curriculum, architecture, quickstart, authoring)
- [x] CLAUDE.md (project rules, commands, gotchas)
- [x] implementation_plan.md (this file)

## Known Issues / Bugs
- First Pyodide boot downloads ~6–10 MB; `seaborn` (with scipy) can take ~15–30s to
  install on first use. Expected, not a bug — surfaced via status text.
- The Execution Visualizer caps steps (`MAX_STEPS` in `tracer.py`); very long loops are
  truncated with a warning.
- `tracer.py` records data-like locals only (skips functions/modules) to keep the table
  focused; this is intentional.

## Stretch / Future 🔮
- [ ] 🔮 Persist editor edits per lesson; "reset all progress" UI in settings
- [ ] 🔮 More DSA: heaps/priority queues, Dijkstra on weighted graphs
- [ ] 🔮 Instrument user code to drive DSA visualizers from their own implementations
- [ ] 🔮 Achievements/badges; shareable progress
- [ ] 🔮 Optional FastAPI+Spark Docker backend to make PySpark lessons live
- [ ] 🔮 Deployment (static host) + offline/PWA caching of the Pyodide runtime

## Decisions Log
- **Pyodide over a backend kernel:** zero-install, local-first, trivially deployable as
  static files; keeps everything client-side. Trade-off: no JVM → PySpark stays conceptual.
- **Web Worker for Pyodide:** the interpreter is blocking; a worker keeps the UI responsive.
- **Lessons as typed TS data (not MDX):** type-safe authoring, no markdown/MDX build
  pipeline, and interactive blocks are just structured data.
- **`sys.settrace` recorder over embedding Python Tutor:** full control over the UI and
  no external iframe/runtime dependency.
- **Custom DSA frame generators in TS:** deterministic, controllable animations decoupled
  from Python execution (fast and offline-friendly).
