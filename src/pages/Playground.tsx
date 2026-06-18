import { useEffect, useState } from "react";
import CodeEditor from "../components/editor/CodeEditor";
import OutputConsole from "../components/editor/OutputConsole";
import PlotPanel from "../components/plot/PlotPanel";
import { pyodideClient, type RunResult } from "../pyodide/pyodideClient";
import { usePyodideStore } from "../store/pyodideStore";

const DEFAULT = `# Free playground — write anything and Run.
# numpy / pandas / matplotlib / seaborn are available (installed on first use).

for i in range(1, 6):
    print(i, "squared is", i * i)
`;

export default function Playground() {
  const { ready, boot, status } = usePyodideStore();
  const [code, setCode] = useState(DEFAULT);
  const [result, setResult] = useState<RunResult | null>(null);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    boot();
  }, [boot]);

  const run = async () => {
    setRunning(true);
    try {
      // matplotlib/seaborn figures are captured automatically when the code draws one.
      setResult(await pyodideClient.runCode(code));
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-5 py-8">
      <h1 className="text-2xl font-bold text-white">🎮 Playground</h1>
      <p className="mb-4 text-slate-400">
        A scratchpad running real Python in your browser. Nothing is sent to a server.
      </p>

      <div className="space-y-3">
        <CodeEditor value={code} onChange={setCode} height={340} />
        <div className="flex flex-wrap items-center gap-3">
          <button className="btn-primary" onClick={run} disabled={running || !ready}>
            {running ? "Running…" : ready ? "Run ▶" : "Loading Python…"}
          </button>
          <button
            className="btn-ghost"
            onClick={() => {
              setCode(DEFAULT);
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
