import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import CodeEditor from "../editor/CodeEditor";
import {
  pyodideClient,
  type TraceResult,
  type TraceStep,
} from "../../pyodide/pyodideClient";
import { usePyodideStore } from "../../store/pyodideStore";

interface Props {
  initialCode: string;
  title?: string;
}

const KIND_COLORS: Record<string, string> = {
  int: "text-sky-300",
  float: "text-sky-300",
  bool: "text-fuchsia-300",
  str: "text-amber-300",
  list: "text-emerald-300",
  tuple: "text-emerald-300",
  dict: "text-emerald-300",
  set: "text-emerald-300",
  none: "text-slate-500",
  object: "text-slate-200",
};

export default function ExecutionVisualizer({ initialCode, title }: Props) {
  const { ready, boot, status } = usePyodideStore();
  const [code, setCode] = useState(initialCode);
  const [trace, setTrace] = useState<TraceResult | null>(null);
  const [idx, setIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(600); // ms per step
  const [loading, setLoading] = useState(false);
  const prevLocals = useRef<Record<string, string>>({});

  useEffect(() => {
    boot();
  }, [boot]);

  const steps = trace?.steps ?? [];
  const current: TraceStep | undefined = steps[idx];

  const run = useCallback(async () => {
    setLoading(true);
    setPlaying(false);
    setTrace(null);
    setIdx(0);
    try {
      const t = await pyodideClient.trace(code);
      setTrace(t);
    } finally {
      setLoading(false);
    }
  }, [code]);

  // Auto-advance while playing.
  useEffect(() => {
    if (!playing) return;
    if (idx >= steps.length - 1) {
      setPlaying(false);
      return;
    }
    const h = setTimeout(
      () => setIdx((i) => Math.min(i + 1, steps.length - 1)),
      speed,
    );
    return () => clearTimeout(h);
  }, [playing, idx, steps.length, speed]);

  // Track which variables changed since the previous step (for the pulse highlight).
  const changed = useMemo(() => {
    const set = new Set<string>();
    if (!current) return set;
    for (const [name, info] of Object.entries(current.locals)) {
      if (prevLocals.current[name] !== info.repr) set.add(name);
    }
    return set;
  }, [current]);

  useEffect(() => {
    if (current) {
      const snap: Record<string, string> = {};
      for (const [n, info] of Object.entries(current.locals)) snap[n] = info.repr;
      prevLocals.current = snap;
    }
  }, [current]);

  const atEnd = idx >= steps.length - 1;

  return (
    <div className="card overflow-hidden">
      {title && (
        <div className="border-b border-ink-600/60 px-4 py-2 text-sm font-semibold text-slate-200">
          🔎 {title}
        </div>
      )}
      <div className="grid gap-4 p-4 md:grid-cols-2">
        {/* Left: code with current line highlighted */}
        <div className="space-y-3">
          <CodeEditor
            value={code}
            onChange={setCode}
            height={260}
            highlightLine={current?.line ?? null}
          />
          <div className="flex flex-wrap items-center gap-2">
            <button
              className="btn-primary"
              onClick={run}
              disabled={loading || (!ready && status !== "ready")}
            >
              {loading ? "Tracing…" : ready ? "▶ Visualize" : "Loading Python…"}
            </button>
            {!ready && <span className="text-xs text-slate-400">{status}</span>}
            {steps.length > 0 && (
              <>
                <button
                  className="btn-ghost"
                  onClick={() => setIdx((i) => Math.max(0, i - 1))}
                  disabled={idx === 0}
                >
                  ◀ Prev
                </button>
                <button
                  className="btn-ghost"
                  onClick={() => (atEnd ? setIdx(0) : setPlaying((p) => !p))}
                >
                  {atEnd ? "↻ Restart" : playing ? "⏸ Pause" : "▶ Play"}
                </button>
                <button
                  className="btn-ghost"
                  onClick={() => setIdx((i) => Math.min(steps.length - 1, i + 1))}
                  disabled={atEnd}
                >
                  Next ▶
                </button>
                <select
                  className="rounded-lg border border-ink-600 bg-ink-700 px-2 py-1 text-xs"
                  value={speed}
                  onChange={(e) => setSpeed(Number(e.target.value))}
                >
                  <option value={1000}>0.5×</option>
                  <option value={600}>1×</option>
                  <option value={300}>2×</option>
                  <option value={120}>4×</option>
                </select>
              </>
            )}
          </div>

          {steps.length > 0 && (
            <div className="space-y-1">
              <input
                type="range"
                min={0}
                max={steps.length - 1}
                value={idx}
                onChange={(e) => {
                  setPlaying(false);
                  setIdx(Number(e.target.value));
                }}
                className="w-full accent-brand"
              />
              <div className="flex justify-between text-xs text-slate-400">
                <span>
                  Step {idx + 1} / {steps.length}
                </span>
                <span>
                  line {current?.line} · <code>{current?.func}</code>
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Right: variable table + output */}
        <div className="space-y-3">
          <div className="rounded-lg border border-ink-600/60 bg-ink-900/60">
            <div className="border-b border-ink-600/60 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">
              Variables {current && current.depth > 0 && `· depth ${current.depth}`}
            </div>
            <div className="max-h-56 overflow-auto p-2">
              {!current && (
                <p className="px-1 py-2 text-sm text-slate-500">
                  Press <b>Visualize</b> then step through to watch variables change.
                </p>
              )}
              {current && Object.keys(current.locals).length === 0 && (
                <p className="px-1 py-2 text-sm text-slate-500">
                  No local variables yet at this line.
                </p>
              )}
              {current && (
                <table className="w-full text-sm">
                  <tbody>
                    {Object.entries(current.locals).map(([name, info]) => (
                      <tr
                        key={name}
                        className={`align-top ${changed.has(name) ? "var-changed" : ""}`}
                      >
                        <td className="w-1/3 py-1 pr-2 font-mono font-semibold text-slate-200">
                          {name}
                        </td>
                        <td
                          className={`py-1 font-mono ${KIND_COLORS[info.kind] ?? "text-slate-200"}`}
                        >
                          {info.repr}
                          <span className="ml-2 text-[10px] text-slate-500">
                            {info.kind}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          <div className="rounded-lg border border-ink-600/60 bg-ink-900/80">
            <div className="border-b border-ink-600/60 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">
              Output so far
            </div>
            <pre className="max-h-32 overflow-auto px-3 py-2 font-mono text-[13px] text-slate-100">
              {current?.stdout || (
                <span className="text-slate-500">— nothing printed yet —</span>
              )}
            </pre>
          </div>

          {trace?.error && (
            <pre className="rounded-lg border border-brand-red/40 bg-brand-red/10 px-3 py-2 font-mono text-xs text-brand-red">
              {trace.error}
            </pre>
          )}
          {trace?.truncated && (
            <p className="text-xs text-brand-yellow">
              ⚠ Execution was long — only the first steps are shown.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
