import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Pause, Play, RotateCcw, Search, SkipBack, SkipForward } from "lucide-react";
import CodeEditor from "../editor/CodeEditor";
import {
  pyodideClient,
  type TraceResult,
  type TraceStep,
} from "../../pyodide/pyodideClient";
import { usePyodideStore } from "../../store/pyodideStore";
import { useCodeDraft } from "../../lib/useCodeDraft";
import ObjectDiagram from "./ObjectDiagram";

interface Props {
  initialCode: string;
  title?: string;
  draftKey?: string;
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

export default function ExecutionVisualizer({ initialCode, title, draftKey }: Props) {
  const { ready, boot, status } = usePyodideStore();
  const [code, setCode] = useCodeDraft(draftKey, initialCode);
  const [trace, setTrace] = useState<TraceResult | null>(null);
  const [idx, setIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(600); // ms per step
  const [loading, setLoading] = useState(false);
  const [watch, setWatch] = useState(""); // comma-separated names to pin
  const [view, setView] = useState<"table" | "objects">("table");
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

  // Optional watch filter: when set, the variable table shows only these names.
  const watched = watch
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const visibleLocals = current
    ? Object.entries(current.locals).filter(
        ([name]) => watched.length === 0 || watched.includes(name),
      )
    : [];

  return (
    <div className="glass overflow-hidden">
      {title && (
        <div className="flex items-center gap-2 border-b border-white/10 px-4 py-2 text-sm font-semibold text-slate-200">
          <Search className="h-4 w-4 text-accent-cyan" /> {title}
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
              {loading ? (
                "Tracing…"
              ) : ready ? (
                <>
                  <Play className="h-4 w-4" /> Visualize
                </>
              ) : (
                "Loading Python…"
              )}
            </button>
            {!ready && <span className="text-xs text-slate-400">{status}</span>}
            {steps.length > 0 && (
              <>
                <button
                  className="btn-ghost px-2.5"
                  onClick={() => setIdx((i) => Math.max(0, i - 1))}
                  disabled={idx === 0}
                  aria-label="Previous step"
                >
                  <SkipBack className="h-4 w-4" />
                </button>
                <button
                  className="btn-ghost"
                  onClick={() => (atEnd ? setIdx(0) : setPlaying((p) => !p))}
                >
                  {atEnd ? (
                    <>
                      <RotateCcw className="h-4 w-4" /> Restart
                    </>
                  ) : playing ? (
                    <>
                      <Pause className="h-4 w-4" /> Pause
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4" /> Play
                    </>
                  )}
                </button>
                <button
                  className="btn-ghost px-2.5"
                  onClick={() => setIdx((i) => Math.min(steps.length - 1, i + 1))}
                  disabled={atEnd}
                  aria-label="Next step"
                >
                  <SkipForward className="h-4 w-4" />
                </button>
                <select
                  className="select"
                  aria-label="Playback speed"
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
                aria-label="Scrub execution steps"
                min={0}
                max={steps.length - 1}
                value={idx}
                onChange={(e) => {
                  setPlaying(false);
                  setIdx(Number(e.target.value));
                }}
                className="w-full accent-brand"
              />
              <div
                className="flex justify-between text-xs text-slate-400"
                aria-live="polite"
              >
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

        {/* Right: call stack + variable table + output */}
        <div className="space-y-3">
          {current && current.stack && current.stack.length > 1 && (
            <div className="panel">
              <div className="border-b border-white/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">
                Call stack
              </div>
              <div className="flex flex-col-reverse gap-1 p-2" aria-live="polite">
                {current.stack.map((fn, i) => {
                  const isTop = i === current.stack.length - 1;
                  const label = fn === "<module>" ? "main" : `${fn}()`;
                  return (
                    <div
                      key={i}
                      className={`rounded-lg border px-2.5 py-1 font-mono text-xs ${
                        isTop
                          ? "border-accent-violet/40 bg-accent-violet/15 text-white"
                          : "border-white/10 bg-white/[0.03] text-slate-400"
                      }`}
                    >
                      {label}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          <div className="panel">
            <div className="flex items-center gap-2 border-b border-white/10 px-3 py-1.5">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Variables {current && current.depth > 0 && `· depth ${current.depth}`}
              </span>
              <div className="ml-auto flex items-center gap-2">
                {view === "table" && (
                  <input
                    value={watch}
                    onChange={(e) => setWatch(e.target.value)}
                    placeholder="watch (e.g. i, total)"
                    aria-label="Watch variables (comma-separated)"
                    className="w-32 rounded-md border border-white/10 bg-white/5 px-2 py-0.5 text-xs text-slate-200 outline-none placeholder:text-slate-600"
                  />
                )}
                <div className="flex overflow-hidden rounded-md border border-white/10">
                  {(["table", "objects"] as const).map((v) => (
                    <button
                      key={v}
                      onClick={() => setView(v)}
                      className={`px-2 py-0.5 text-[11px] capitalize transition-colors ${
                        view === v ? "bg-white/10 text-white" : "text-slate-400 hover:bg-white/5"
                      }`}
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="max-h-56 overflow-auto p-2">
              {!current && (
                <p className="px-1 py-2 text-sm text-slate-500">
                  Press <b>Visualize</b> then step through to watch variables change.
                </p>
              )}
              {current && view === "objects" && (
                <ObjectDiagram refs={current.refs ?? {}} heap={current.heap ?? {}} />
              )}
              {current && view === "table" && visibleLocals.length === 0 && (
                <p className="px-1 py-2 text-sm text-slate-500">
                  {watched.length > 0
                    ? "No watched variables in scope here."
                    : "No local variables yet at this line."}
                </p>
              )}
              {current && view === "table" && visibleLocals.length > 0 && (
                <table className="w-full text-sm">
                  <tbody>
                    {visibleLocals.map(([name, info]) => (
                      <tr
                        key={name}
                        className={`align-top rounded ${changed.has(name) ? "var-changed" : ""}`}
                      >
                        <td className="w-1/3 py-1 pl-2 pr-2 font-mono font-semibold text-accent-violet">
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

          <div className="panel">
            <div className="border-b border-white/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">
              Output so far
            </div>
            <pre
              className="max-h-32 overflow-auto px-3 py-2 font-mono text-[13px] text-slate-100"
              aria-live="polite"
              aria-label="Program output so far"
            >
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
