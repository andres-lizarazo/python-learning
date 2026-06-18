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

### Design polish (round 4) — refine Aurora Glass
- [x] Surface harmonization: glass control primitives (`.panel`/`.well`/`.select`/`.callout`)
      + global `:focus-visible` ring; ExecutionVisualizer panels/controls and all DSA
      visualizer chart areas/dropdowns moved off the old `ink` styling
- [x] Premium viz fills: gradient sorting bars, array/stack/linked-list tiles, and
      SVG gradient + glow for tree/graph nodes
- [x] Dark, theme-matched plots: matplotlib dark `rcParams` + `transparent` savefig in the
      worker, seaborn lessons switched to a dark theme, PlotPanel on a dark glass panel
- [x] Motion: route page transitions (AnimatePresence on location) + sliding sidebar active
      indicator (`layoutId`)
- [x] **Level-Up** moment: watcher in Layout fires `LevelUpToast` + big confetti on level gain
- [x] **Profile / Achievements** page (`/profile`): level ring, stats, per-module progress,
      badges grid (`lib/badges.ts`), reset progress; linked from the TopBar
- [x] Loading/branding: Monaco skeleton, SVG favicon + theme-color, hero glow + tech chips

### Frontend / UI-UX overhaul (round 3) — "Aurora Glass"
- [x] Design system: deep base + animated **aurora** background + grain; **glassmorphism**
      surfaces; violet→cyan→lime accent spectrum; display/sans/mono font trio
      (Space Grotesk / Inter / JetBrains Mono); glow shadows; reduced-motion support
      (`tailwind.config.js`, `src/index.css`, `index.html`)
- [x] Deps: `framer-motion`, `lucide-react`, `canvas-confetti`
- [x] Reusable UI primitives: `ui/{Aurora,Logo,XPBar,StreakFlame,AnimatedCounter,Reveal}`
- [x] Gamification: XP→level math (`lib/level.ts`), level bar, animated streak flame,
      animated XP counter, **confetti** on challenge solve / lesson complete / module finish
      (`lib/confetti.ts`), module-complete badges; per-module accent identity (`lib/moduleTheme.ts`)
- [x] Redesigned Layout (aurora + animated drawer), TopBar (glass + level/streak/XP),
      Sidebar (glass + per-module dots + animated active bar)
- [x] Home hero (gradient display headline, floating code card, stat chips, staggered
      module grid with hover lift/glow), Module & Lesson pages, Playground
- [x] Component polish: Monaco glass "window" frame + matched theme, terminal-style console,
      glass plot panel, lucide transport icons on visualizers, restyled challenge runner & quiz

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
- Main JS bundle is ~625 KB (≈197 KB gzip) after adding Framer Motion + lucide; Vite warns
  about the 500 KB chunk threshold. Not a runtime problem, but Phase A code-splitting should
  bring it down.

## Roadmap — what's next 🗺️

Prioritized, phase by phase. Each phase is independently shippable.

> **Current execution scope (local-only):** building all in-app, client-side features.
> Infra items (deploy/hosting, accounts & cross-device sync, leaderboard, real Spark
> backend) are **deferred** — they need external services and can't be done while keeping
> everything local. Marked 🚧 below.

### Phase A — Polish & hardening (DONE except where noted)
- [x] Performance: route-level code-splitting (`React.lazy` + `Suspense`) — initial JS bundle
      dropped 625 KB → **395 KB** (130 KB gzip); pages load on demand
- [x] Persist editor edits per lesson via `lib/useCodeDraft.ts` (localStorage), wired into
      runnable/visualized/challenge blocks + Playground; "Continue where you left off" on Home
      (`progressStore.lastLesson`)
- [x] Tests: Vitest unit tests for `lib/level.ts`, `lib/badges.ts`, and `lib/harness.ts`
      (extracted from ChallengeRunner) — 12 tests green; `npm test`
- [x] Playwright e2e smoke (`tests/e2e/smoke.spec.ts`, `npm run test:e2e`): home renders,
      **boots Pyodide and runs Python in the browser**, and the challenge runner executes
      tests — 3 tests green against the production preview
- [x] PWA + offline: `vite-plugin-pwa` (autoUpdate) precaches the app and runtime-caches the
      Pyodide CDN + Google Fonts (CacheFirst) → offline-capable reloads
- [x] Accessibility: skip-to-content link + focus moved to `<main>` on route change; ARIA
      labels on visualizer sliders/selects, `role="img"` + label on the tree/graph SVGs,
      `aria-live` step/note/output regions, and contrast bumps

### Phase B — Deeper learning experience (mostly DONE)
- [x] Command palette (⌘K / Ctrl+K) + search over all lessons/modules/pages
      (`components/ui/CommandPalette.tsx`); TopBar search affordance
- [x] Hints per challenge (progressive reveal via `ChallengeBlock.hints`) + "explain my
      error" friendly tips (`lib/explainError.ts`) shown on failed tests
- [x] **Practice** / challenge bank page (`/practice`): all challenges with module + solved/
      unsolved filters (covers the "review" need); links back to each lesson
- [x] Lesson bookmarks (`progressStore.bookmarks`), toggle on the lesson header, surfaced on
      the Profile page
- [ ] Per-lesson notes + full spaced-repetition scheduling — still pending

### Phase C — Richer visualizers (DONE)
- [x] Execution Visualizer: **call-stack panel** (tracer captures the active call stack per
      step) + **watch/pin variables** (filter the variable table to named vars)
- [x] New visualizers: **hash table** (chaining), **heap / priority queue** (tree + array,
      sift-up), **sliding window**, **backtracking** (subsets decision tree) — each wired
      into a lesson
- [x] **Object/heap reference diagram** in the Execution Visualizer (Table ⟷ Objects toggle):
      the tracer serializes structured values + object ids (with caps), so shared references
      / aliasing are visible; demoed in the Lists lesson
- [x] **Drive a visualizer from the learner's own code**: a `record(arr, active, note)` helper
      captures frames that animate as bars (`user-viz` block); demoed in the Sorting lesson
- [x] Weighted graphs + **Dijkstra** visualizer + lesson

> Phase C is now complete. Only Phase E (infra) remains on the roadmap.

### Phase D — More content (DONE)
- [x] DSA: **Sliding Window**, **Heaps & Priority Queues**, **Backtracking**, **Tries**,
      **DP — Coin Change** lessons (each with a visualizer/visualized code + challenge + hints)
- [x] Pandas: **Time Series** (datetime, period group-by, rolling) and **Reshape & Method
      Chaining** (pivot_table/melt) lessons with challenges
- [x] New module **Intro to ML (scikit-learn)**: train/test split, fit/evaluate, decision-tree
      classifier — 2 lessons + challenges, runs sklearn in Pyodide
- [x] Knowledge-check quiz added to the pandas-plotting viz lesson
- [x] All new pandas/sklearn/DSA challenge solutions verified against real libraries (uv venv)

### Phase D — More content
- [ ] DSA: heaps, tries, sliding window, two-heaps, backtracking, more DP patterns
- [ ] Pandas: time series, window functions, pivot/melt, method chaining
- [ ] New module: **scikit-learn / intro ML** (train/test split, a simple model, metrics)
- [ ] Add challenges to the visualization lessons; grow every starter idea into full depth

### Phase E — Platform & accounts
- [x] Deploy the static app to **GitHub Pages** via Actions (`.github/workflows/deploy.yml`,
      `DEPLOY_BASE` subpath + router basename + `404.html` fallback). Local dev unchanged at
      `localhost:5173/`. Live: https://andres-lizarazo.github.io/python-learning/

> **Decision (2026-06-18): keep it personal-study / local-only for now.** Progress (XP, streak,
> completion, bookmarks, editor drafts) lives in each visitor's browser `localStorage` — it is
> **per-browser and private**: every visitor has their own independent progress, nothing is
> shared across people, and nothing syncs across a user's devices. This is intentional for a
> no-friction personal study tool. **To revisit later** (each needs work):
> - **Export/Import profile** (no backend): a code/URL to carry your own progress between your
>   devices manually. Fully local-doable.
> - **Accounts + cloud sync + leaderboard** (needs a backend, e.g. Supabase/Firebase): real
>   multi-user, cross-device progress and a shared leaderboard. Deferred until we choose to.
- [ ] 🚧 Optional accounts + cross-device sync (e.g. Supabase) for progress/XP
- [ ] 🚧 Leaderboard, daily goals, shareable profile/achievement cards
- [ ] 🚧 Optional **FastAPI + Spark (Docker)** backend so PySpark lessons run for real
- [ ] 🚧 i18n: ES/EN content + UI toggle

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
