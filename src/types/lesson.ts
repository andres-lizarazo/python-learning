// Core content model for PyLearn.
//
// A curriculum is a list of Modules. Each Module has Lessons. Each Lesson is an
// ordered list of Blocks. Blocks are rendered by LessonRenderer -> a component per
// `kind`. Lessons are plain typed data (no markdown files to parse at build time),
// which keeps authoring simple and type-safe.

export type BlockKind =
  | "prose"
  | "runnable"
  | "visualized"
  | "dsa-viz"
  | "challenge"
  | "quiz";

/** Markdown prose. Supports GitHub-flavored markdown. */
export interface ProseBlock {
  kind: "prose";
  markdown: string;
}

/** An editable code snippet the learner can run; shows stdout/stderr (+ plots). */
export interface RunnableBlock {
  kind: "runnable";
  title?: string;
  code: string;
  /** Pyodide packages to ensure are installed before running (e.g. ["numpy"]). */
  packages?: string[];
  /** If true, a matplotlib figure is expected and rendered into the plot panel. */
  expectPlot?: boolean;
}

/** Code shown with the step-by-step ExecutionVisualizer ("see loops flow"). */
export interface VisualizedBlock {
  kind: "visualized";
  title?: string;
  code: string;
}

/** A canned DSA animation driven by a named visualizer + its config. */
export interface DsaVizBlock {
  kind: "dsa-viz";
  title?: string;
  viz:
    | "array"
    | "sorting"
    | "linked-list"
    | "stack-queue"
    | "tree"
    | "graph"
    | "recursion";
  /** Initial data for the visualizer (interpretation depends on `viz`). */
  data?: unknown;
  /** Sorting algorithm to animate, when viz === "sorting". */
  algorithm?: "bubble" | "insertion" | "selection" | "merge" | "quick";
  /** Graph traversal to animate, when viz === "graph". */
  traversal?: "bfs" | "dfs";
  caption?: string;
}

/** One test case run against the learner's solution. */
export interface TestCase {
  /** Human label shown in the results list. */
  name: string;
  /**
   * Python expression/statements appended after the user's code. It must `assert`
   * the expected behavior. Keep visible cases readable.
   */
  assertion: string;
  /** Hidden cases are run but their assertion text is not shown to the learner. */
  hidden?: boolean;
}

/** CodeSignal-style coding challenge. */
export interface ChallengeBlock {
  kind: "challenge";
  title: string;
  prompt: string; // markdown problem statement
  starterCode: string;
  tests: TestCase[];
  /** Pyodide packages to ensure are installed before running (e.g. ["numpy"]). */
  packages?: string[];
  /** Optional reference solution revealed via "Show solution". */
  solution?: string;
  /** XP awarded the first time the learner passes all tests. */
  xp?: number;
}

export interface QuizOption {
  text: string;
  correct?: boolean;
}

/** Multiple-choice knowledge check. */
export interface QuizBlock {
  kind: "quiz";
  question: string;
  options: QuizOption[];
  explanation?: string;
}

export type Block =
  | ProseBlock
  | RunnableBlock
  | VisualizedBlock
  | DsaVizBlock
  | ChallengeBlock
  | QuizBlock;

export interface Lesson {
  id: string; // unique within the whole curriculum, kebab-case
  title: string;
  summary: string;
  /** Rough minutes to complete; shown as a hint. */
  minutes?: number;
  blocks: Block[];
}

export type ModuleLevel = "Beginner" | "Intermediate" | "Advanced";

export interface Module {
  id: string; // kebab-case, used in the URL
  title: string;
  /** One-line description for cards. */
  blurb: string;
  level: ModuleLevel;
  /** Emoji or short icon shown in the sidebar/cards. */
  icon: string;
  /** "deep" modules are fully built; "starter" are seeded and expandable. */
  status: "deep" | "starter";
  lessons: Lesson[];
}
