import { useEffect, useState } from "react";
import CodeEditor from "../../editor/CodeEditor";
import OutputConsole from "../../editor/OutputConsole";
import PlotPanel from "../../plot/PlotPanel";
import { pyodideClient, type RunResult } from "../../../pyodide/pyodideClient";
import { usePyodideStore } from "../../../store/pyodideStore";
import type { RunnableBlock } from "../../../types/lesson";

export default function RunnableCode({ block }: { block: RunnableBlock }) {
  const { ready, boot, status } = usePyodideStore();
  const [code, setCode] = useState(block.code);
  const [result, setResult] = useState<RunResult | null>(null);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    boot();
  }, [boot]);

  const run = async () => {
    setRunning(true);
    try {
      const res = await pyodideClient.runCode(code, {
        packages: block.packages,
        expectPlot: block.expectPlot,
      });
      setResult(res);
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="card overflow-hidden">
      {block.title && (
        <div className="border-b border-ink-600/60 px-4 py-2 text-sm font-semibold text-slate-200">
          ▶ {block.title}
        </div>
      )}
      <div className="space-y-3 p-4">
        <CodeEditor
          value={code}
          onChange={setCode}
          height={Math.min(360, 60 + code.split("\n").length * 20)}
        />
        <div className="flex items-center gap-2">
          <button className="btn-primary" onClick={run} disabled={running || !ready}>
            {running ? "Running…" : ready ? "Run ▶" : "Loading Python…"}
          </button>
          <button
            className="btn-ghost"
            onClick={() => {
              setCode(block.code);
              setResult(null);
            }}
          >
            ↺ Reset
          </button>
          {(!ready || (running && status !== "ready")) && (
            <span className="text-xs text-slate-400">{status}</span>
          )}
        </div>
        <OutputConsole stdout={result?.stdout} stderr={result?.stderr} running={running} />
        {result?.plots && <PlotPanel plots={result.plots} />}
      </div>
    </div>
  );
}
