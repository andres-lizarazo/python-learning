// Main-thread client for the Pyodide worker. Exposes a typed, promise-based API and
// a subscribe-able status string so the UI can show boot/install progress.

export interface RunResult {
  ok: boolean;
  stdout: string;
  stderr: string;
  plots: string[]; // base64 PNGs
}

/** A value cell in the reference diagram: a primitive (shown inline) or a heap ref. */
export type DiagramCell =
  | { t: "num" | "str" | "bool" | "none"; v: string }
  | { t: "ref"; id: number };

export interface HeapNode {
  kind: "list" | "tuple" | "dict" | "set";
  /** list/tuple: DiagramCell[]; dict: [keyRepr, DiagramCell][]; set: string[]. */
  items: DiagramCell[] | [string, DiagramCell][] | string[];
  more: number;
}

export interface TraceStep {
  line: number;
  event: "line" | "return";
  func: string;
  depth: number;
  /** Function names currently on the call stack (bottom → top). */
  stack: string[];
  locals: Record<string, { repr: string; kind: string }>;
  /** Variable name → value cell (for the object/reference diagram). */
  refs: Record<string, DiagramCell>;
  /** Heap objects addressed by id (string-keyed in JSON). */
  heap: Record<string, HeapNode>;
  stdout: string;
}

export interface TraceResult {
  steps: TraceStep[];
  stdout: string;
  error: string | null;
  truncated: boolean;
}

type Pending = {
  resolve: (v: unknown) => void;
  reject: (e: Error) => void;
};

class PyodideClient {
  private worker: Worker | null = null;
  private seq = 0;
  private pending = new Map<number, Pending>();
  private statusListeners = new Set<(s: string) => void>();

  status = "idle";
  ready = false;

  private ensureWorker() {
    if (this.worker) return;
    this.worker = new Worker(new URL("./worker.ts", import.meta.url), {
      type: "module",
    });
    this.worker.onmessage = (e: MessageEvent) => {
      const msg = e.data;
      if (msg?.type === "status") {
        this.status = msg.message;
        if (msg.message === "ready") this.ready = true;
        this.statusListeners.forEach((l) => l(msg.message));
        return;
      }
      const p = this.pending.get(msg.id);
      if (!p) return;
      this.pending.delete(msg.id);
      if (msg.ok) p.resolve(msg.result);
      else p.reject(new Error(msg.error));
    };
  }

  private call<T>(type: string, payload?: unknown): Promise<T> {
    this.ensureWorker();
    const id = ++this.seq;
    return new Promise<T>((resolve, reject) => {
      this.pending.set(id, {
        resolve: resolve as (v: unknown) => void,
        reject,
      });
      this.worker!.postMessage({ id, type, payload });
    });
  }

  onStatus(listener: (s: string) => void): () => void {
    this.statusListeners.add(listener);
    return () => this.statusListeners.delete(listener);
  }

  /** Boot the interpreter. Safe to call repeatedly; only the first does work. */
  init(): Promise<{ ready: boolean }> {
    return this.call("init");
  }

  installPackages(packages: string[]): Promise<{ installed: string[] }> {
    return this.call("install", { packages });
  }

  runCode(
    code: string,
    opts?: { packages?: string[]; expectPlot?: boolean },
  ): Promise<RunResult> {
    return this.call("run", {
      code,
      packages: opts?.packages ?? [],
      expectPlot: opts?.expectPlot ?? false,
    });
  }

  trace(code: string): Promise<TraceResult> {
    return this.call("trace", { code });
  }
}

// One shared interpreter for the whole app.
export const pyodideClient = new PyodideClient();
