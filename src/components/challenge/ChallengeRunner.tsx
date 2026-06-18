import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import CodeEditor from "../editor/CodeEditor";
import { pyodideClient } from "../../pyodide/pyodideClient";
import { usePyodideStore } from "../../store/pyodideStore";
import { useProgressStore } from "../../store/progressStore";
import type { ChallengeBlock } from "../../types/lesson";

interface Props {
  block: ChallengeBlock;
  /** Stable id for progress tracking. */
  id: string;
}

interface TestResult {
  name: string;
  ok: boolean;
  error?: string;
  hidden?: boolean;
}

const RESULT_MARKER = "__PL_RESULTS__";

function indent(src: string, spaces = 4): string {
  const pad = " ".repeat(spaces);
  return src
    .split("\n")
    .map((l) => (l.trim() ? pad + l : l))
    .join("\n");
}

/** Build a Python harness that runs each test in isolation and prints a JSON line. */
function buildHarness(userCode: string, tests: ChallengeBlock["tests"]): string {
  const parts: string[] = [userCode, "", "import json as __pl_json", "__pl_results = []"];
  tests.forEach((t, i) => {
    parts.push(`def __pl_test_${i}():`);
    parts.push(indent(t.assertion || "pass"));
    parts.push("try:");
    parts.push(`    __pl_test_${i}()`);
    parts.push(`    __pl_results.append({"ok": True})`);
    parts.push("except BaseException as __e:");
    parts.push("    import traceback as __tb");
    parts.push(
      '    __pl_results.append({"ok": False, "error": "".join(__tb.format_exception_only(type(__e), __e)).strip()})',
    );
  });
  parts.push(`print("${RESULT_MARKER}" + __pl_json.dumps(__pl_results))`);
  return parts.join("\n");
}

export default function ChallengeRunner({ block, id }: Props) {
  const { ready, boot, status } = usePyodideStore();
  const solveChallenge = useProgressStore((s) => s.solveChallenge);
  const alreadySolved = useProgressStore((s) => s.isChallengeSolved(id));

  const [code, setCode] = useState(block.starterCode);
  const [results, setResults] = useState<TestResult[] | null>(null);
  const [running, setRunning] = useState(false);
  const [runtimeMs, setRuntimeMs] = useState<number | null>(null);
  const [showSolution, setShowSolution] = useState(false);
  const [stderr, setStderr] = useState("");

  useEffect(() => {
    boot();
  }, [boot]);

  const submit = async () => {
    setRunning(true);
    setResults(null);
    setStderr("");
    const t0 = performance.now();
    try {
      const harness = buildHarness(code, block.tests);
      const res = await pyodideClient.runCode(harness, { packages: block.packages });
      setRuntimeMs(Math.round(performance.now() - t0));

      // A compile/runtime error before tests ran.
      if (!res.ok || !res.stdout.includes(RESULT_MARKER)) {
        setStderr(res.stderr || "Your code raised an error before tests could run.");
        setResults(
          block.tests.map((t) => ({ name: t.name, ok: false, hidden: t.hidden })),
        );
        return;
      }

      const line = res.stdout.split("\n").find((l) => l.startsWith(RESULT_MARKER))!;
      const parsed = JSON.parse(line.slice(RESULT_MARKER.length)) as {
        ok: boolean;
        error?: string;
      }[];
      const merged: TestResult[] = block.tests.map((t, i) => ({
        name: t.name,
        ok: parsed[i]?.ok ?? false,
        error: parsed[i]?.error,
        hidden: t.hidden,
      }));
      setResults(merged);

      if (merged.every((r) => r.ok)) {
        solveChallenge(id, block.xp ?? 50);
      }
    } finally {
      setRunning(false);
    }
  };

  const passed = results?.filter((r) => r.ok).length ?? 0;
  const total = block.tests.length;
  const allPass = results !== null && passed === total;

  return (
    <div className="card overflow-hidden">
      <div className="flex items-center justify-between border-b border-ink-600/60 px-4 py-2.5">
        <span className="text-sm font-semibold text-slate-100">🏆 {block.title}</span>
        {(alreadySolved || allPass) && (
          <span className="pill bg-brand-green/20 text-brand-green">✓ Solved</span>
        )}
      </div>

      <div className="space-y-4 p-4">
        <div className="prose-pylearn text-sm text-slate-300">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{block.prompt}</ReactMarkdown>
        </div>

        <CodeEditor value={code} onChange={setCode} height={260} />

        <div className="flex flex-wrap items-center gap-2">
          <button className="btn-primary" onClick={submit} disabled={running || !ready}>
            {running ? "Running tests…" : ready ? "Submit ▶" : "Loading Python…"}
          </button>
          <button
            className="btn-ghost"
            onClick={() => {
              setCode(block.starterCode);
              setResults(null);
              setStderr("");
            }}
          >
            ↺ Reset
          </button>
          {block.solution && (
            <button className="btn-ghost" onClick={() => setShowSolution((s) => !s)}>
              {showSolution ? "Hide solution" : "Show solution"}
            </button>
          )}
          {running && status !== "ready" && (
            <span className="text-xs text-slate-400">{status}</span>
          )}
          {runtimeMs !== null && !running && (
            <span className="ml-auto text-xs text-slate-400">{runtimeMs} ms</span>
          )}
        </div>

        {stderr && (
          <pre className="overflow-auto rounded-lg border border-brand-red/40 bg-brand-red/10 px-3 py-2 font-mono text-xs text-brand-red">
            {stderr}
          </pre>
        )}

        {results && (
          <div className="space-y-1.5">
            <div className="text-sm font-medium text-slate-200">
              {passed} / {total} tests passed{" "}
              {allPass && <span className="text-brand-green">— nice! 🎉</span>}
            </div>
            <ul className="space-y-1">
              {results.map((r, i) => (
                <li
                  key={i}
                  className={`flex items-start gap-2 rounded-md border px-3 py-1.5 text-sm ${
                    r.ok
                      ? "border-brand-green/30 bg-brand-green/10"
                      : "border-brand-red/30 bg-brand-red/10"
                  }`}
                >
                  <span>{r.ok ? "✅" : "❌"}</span>
                  <div className="min-w-0">
                    <div className="text-slate-200">
                      {r.name}{" "}
                      {r.hidden && <span className="text-xs text-slate-500">(hidden)</span>}
                    </div>
                    {!r.ok && r.error && (
                      <div className="truncate font-mono text-xs text-brand-red">
                        {r.error}
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {showSolution && block.solution && (
          <div>
            <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
              Reference solution
            </div>
            <CodeEditor value={block.solution} height={200} readOnly />
          </div>
        )}
      </div>
    </div>
  );
}
