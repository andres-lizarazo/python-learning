/// <reference lib="webworker" />
//
// Pyodide host worker. Runs CPython (compiled to WebAssembly) off the main thread
// so long-running Python never freezes the UI. The main thread talks to it through
// a small promise-based protocol (see pyodideClient.ts).
//
// Pyodide itself is loaded from the jsDelivr CDN at a pinned version.

import tracerSource from "./tracer.py?raw";

const PYODIDE_VERSION = "0.26.4";
const INDEX_URL = `https://cdn.jsdelivr.net/pyodide/v${PYODIDE_VERSION}/full/`;

// Minimal typings — we treat the loaded interpreter loosely.
type PyCallable = ((arg?: unknown) => unknown) & { destroy?: () => void };
type Pyodide = {
  loadPackage: (names: string | string[]) => Promise<void>;
  runPython: (code: string) => unknown;
  pyimport: (mod: string) => any;
  globals: { get: (name: string) => PyCallable };
};

let pyodide: Pyodide | null = null;
let readyPromise: Promise<void> | null = null;
const installed = new Set<string>();

// Helper callables defined by BOOTSTRAP / tracer.py, fetched once (avoids leaking a
// PyProxy on every message).
let pyRun: PyCallable | null = null;
let pyRenderPlots: PyCallable | null = null;
let pyTrace: PyCallable | null = null;

function post(message: Record<string, unknown>) {
  (self as unknown as Worker).postMessage(message);
}

function status(message: string) {
  post({ type: "status", message });
}

// Python bootstrap that defines the run + plot-rendering helpers. Kept here (rather
// than a .py file) because it's small and tightly coupled to the worker protocol.
const BOOTSTRAP = `
import sys, io, base64, json, traceback
import contextlib

def __pylearn_run(code):
    out, err = io.StringIO(), io.StringIO()
    ok = True
    with contextlib.redirect_stdout(out), contextlib.redirect_stderr(err):
        try:
            ns = {"__name__": "__main__"}
            exec(compile(code, "<exec>", "exec"), ns)
        except SystemExit:
            pass
        except BaseException:
            ok = False
            err.write(traceback.format_exc())
    return json.dumps({
        "ok": ok,
        "stdout": out.getvalue(),
        "stderr": err.getvalue(),
    })

def __pylearn_render_plots():
    figs = []
    try:
        import matplotlib
        matplotlib.use("AGG")
        import matplotlib.pyplot as plt
        for num in plt.get_fignums():
            fig = plt.figure(num)
            buf = io.BytesIO()
            fig.savefig(buf, format="png", dpi=110, bbox_inches="tight")
            figs.append(base64.b64encode(buf.getvalue()).decode("ascii"))
        plt.close("all")
    except Exception:
        pass
    return json.dumps(figs)
`;

async function ensureReady(): Promise<void> {
  if (readyPromise) return readyPromise;
  readyPromise = (async () => {
    status("Downloading Python runtime…");
    // Dynamic import of the Pyodide ESM bundle from the CDN.
    const mod = await import(/* @vite-ignore */ `${INDEX_URL}pyodide.mjs`);
    status("Booting interpreter…");
    pyodide = await mod.loadPyodide({ indexURL: INDEX_URL });
    status("Loading helpers…");
    pyodide!.runPython(BOOTSTRAP);
    pyodide!.runPython(tracerSource);
    // Grab the helper callables once and reuse them for every request.
    pyRun = pyodide!.globals.get("__pylearn_run");
    pyRenderPlots = pyodide!.globals.get("__pylearn_render_plots");
    pyTrace = pyodide!.globals.get("trace_to_json");
    status("ready");
  })();
  return readyPromise;
}

async function ensurePackages(packages: string[]): Promise<void> {
  const toGet = packages.filter((p) => !installed.has(p));
  if (toGet.length === 0) return;
  // Built-in (loadPackage) packages vs. pure-Python wheels (micropip).
  const builtin = new Set([
    "numpy",
    "pandas",
    "matplotlib",
    "scipy",
    "scikit-learn",
    "micropip",
    "packaging",
  ]);
  const direct = toGet.filter((p) => builtin.has(p));
  const viaPip = toGet.filter((p) => !builtin.has(p));
  if (direct.length) {
    status(`Installing ${direct.join(", ")}…`);
    await pyodide!.loadPackage(direct);
  }
  if (viaPip.length) {
    status(`Installing ${viaPip.join(", ")} (pip)…`);
    await pyodide!.loadPackage("micropip");
    const micropip = pyodide!.pyimport("micropip");
    await micropip.install(viaPip);
  }
  for (const p of toGet) installed.add(p);
}

self.onmessage = async (e: MessageEvent) => {
  const { id, type, payload } = e.data ?? {};
  try {
    if (type === "init") {
      await ensureReady();
      post({ id, ok: true, result: { ready: true } });
      return;
    }

    await ensureReady();

    if (type === "install") {
      await ensurePackages(payload?.packages ?? []);
      post({ id, ok: true, result: { installed: [...installed] } });
      return;
    }

    if (type === "run") {
      if (payload?.packages?.length) await ensurePackages(payload.packages);
      const parsed = JSON.parse(pyRun!(payload.code) as string);
      // Always capture any matplotlib figures the code produced (and close them, so
      // figures never carry over between runs). Empty when no plot was drawn.
      const plots: string[] = JSON.parse(pyRenderPlots!() as string);
      post({ id, ok: true, result: { ...parsed, plots } });
      return;
    }

    if (type === "trace") {
      post({ id, ok: true, result: JSON.parse(pyTrace!(payload.code) as string) });
      return;
    }

    post({ id, ok: false, error: `Unknown message type: ${type}` });
  } catch (err) {
    post({ id, ok: false, error: err instanceof Error ? err.message : String(err) });
  }
};
