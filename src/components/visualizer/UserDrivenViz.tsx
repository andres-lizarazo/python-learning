import { useEffect, useState } from "react";
import { Play, RotateCcw } from "lucide-react";
import CodeEditor from "../editor/CodeEditor";
import { StepControls, useStepper } from "./dsa/shared";
import { pyodideClient } from "../../pyodide/pyodideClient";
import { usePyodideStore } from "../../store/pyodideStore";
import { useCodeDraft } from "../../lib/useCodeDraft";
import type { UserVizBlock } from "../../types/lesson";

const MARKER = "__PL_FRAMES__";
const BAR_AREA_PX = 168;

interface VizFrame {
  arr: number[];
  active: number[];
  note: string;
}

// Preamble that exposes `record(...)` to the learner's code and prints captured frames.
function buildHarness(userCode: string): string {
  return [
    "import json as __pl_json",
    "__pl_frames = []",
    "def record(arr, active=None, note=''):",
    "    if active is None: a = []",
    "    elif isinstance(active, int): a = [active]",
    "    else: a = list(active)",
    "    __pl_frames.append({'arr': [int(x) for x in arr], 'active': [int(i) for i in a], 'note': str(note)})",
    "",
    userCode,
    "",
    `print('${MARKER}' + __pl_json.dumps(__pl_frames))`,
  ].join("\n");
}

export default function UserDrivenViz({
  block,
  draftKey,
}: {
  block: UserVizBlock;
  draftKey?: string;
}) {
  const { ready, boot, status } = usePyodideStore();
  const [code, setCode, resetCode] = useCodeDraft(draftKey, block.starterCode);
  const [frames, setFrames] = useState<VizFrame[]>([]);
  const [error, setError] = useState("");
  const [running, setRunning] = useState(false);

  useEffect(() => {
    boot();
  }, [boot]);

  const stepper = useStepper(frames.length, 500);
  const frame = frames[stepper.idx];
  const max = Math.max(1, ...frames.flatMap((f) => f.arr));

  const run = async () => {
    setRunning(true);
    setError("");
    try {
      const res = await pyodideClient.runCode(buildHarness(code), {
        packages: block.packages,
      });
      const line = res.stdout.split("\n").find((l) => l.startsWith(MARKER));
      if (!res.ok || !line) {
        setError(res.stderr || "Your code errored before any frames were recorded.");
        setFrames([]);
        return;
      }
      const parsed = JSON.parse(line.slice(MARKER.length)) as VizFrame[];
      setFrames(parsed);
      stepper.setIdx(0);
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="glass overflow-hidden">
      <div className="border-b border-white/10 px-4 py-2 text-sm font-semibold text-slate-200">
        🛠 {block.title ?? "Visualize your own code"}
      </div>
      <div className="space-y-3 p-4">
        <p className="text-sm text-slate-400">
          Call <code className="rounded bg-white/10 px-1 font-mono text-accent-cyan">record(arr, active, note)</code>{" "}
          anywhere in your code to capture a frame, then press Run to animate it.
        </p>
        <CodeEditor value={code} onChange={setCode} height={260} />
        <div className="flex items-center gap-2">
          <button className="btn-primary" onClick={run} disabled={running || !ready}>
            <Play className="h-4 w-4" />
            {running ? "Running…" : ready ? "Run & animate" : "Loading Python…"}
          </button>
          <button
            className="btn-ghost"
            onClick={() => {
              resetCode();
              setFrames([]);
              setError("");
            }}
          >
            <RotateCcw className="h-4 w-4" /> Reset
          </button>
          {(!ready || (running && status !== "ready")) && (
            <span className="text-xs text-slate-400">{status}</span>
          )}
        </div>

        {error && (
          <pre className="overflow-auto rounded-lg border border-brand-red/40 bg-brand-red/10 px-3 py-2 font-mono text-xs text-brand-red">
            {error}
          </pre>
        )}

        {frames.length > 0 && frame && (
          <div className="space-y-3">
            <div className="well flex h-56 items-end justify-center gap-1.5 p-3">
              {frame.arr.map((v, i) => {
                const on = frame.active.includes(i);
                const barPx = Math.max(6, Math.round((v / max) * BAR_AREA_PX));
                return (
                  <div key={i} className="flex flex-1 flex-col items-center justify-end">
                    <span className="mb-1 text-[10px] font-semibold text-slate-300">{v}</span>
                    <div
                      className="w-full rounded-t transition-all duration-200"
                      style={{
                        height: barPx,
                        background: on
                          ? "linear-gradient(180deg,#fcd34d,#f59e0b)"
                          : "linear-gradient(180deg,#a78bfa,#6366f1)",
                        boxShadow: on ? "0 0 14px rgba(245,158,11,0.5)" : "none",
                      }}
                    />
                    <span className="mt-1 text-[10px] text-slate-500">{i}</span>
                  </div>
                );
              })}
            </div>
            <div className="text-center text-sm text-slate-300" role="status" aria-live="polite">
              {frame.note || `Frame ${stepper.idx + 1}`}
            </div>
            <StepControls stepper={stepper} length={frames.length} label="Frame" />
          </div>
        )}
      </div>
    </div>
  );
}
