import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Check, Eye, EyeOff, Lightbulb, Play, RotateCcw, Trophy, X } from "lucide-react";
import CodeEditor from "../editor/CodeEditor";
import { pyodideClient } from "../../pyodide/pyodideClient";
import { usePyodideStore } from "../../store/pyodideStore";
import { useProgressStore } from "../../store/progressStore";
import { celebrate } from "../../lib/confetti";
import { useCodeDraft } from "../../lib/useCodeDraft";
import { RESULT_MARKER, buildHarness } from "../../lib/harness";
import { explainError } from "../../lib/explainError";
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

export default function ChallengeRunner({ block, id }: Props) {
  const { ready, boot, status } = usePyodideStore();
  const solveChallenge = useProgressStore((s) => s.solveChallenge);
  const alreadySolved = useProgressStore((s) => s.isChallengeSolved(id));

  const [code, setCode, resetCode] = useCodeDraft(id, block.starterCode);
  const [results, setResults] = useState<TestResult[] | null>(null);
  const [running, setRunning] = useState(false);
  const [runtimeMs, setRuntimeMs] = useState<number | null>(null);
  const [showSolution, setShowSolution] = useState(false);
  const [stderr, setStderr] = useState("");
  const [revealedHints, setRevealedHints] = useState(0);
  const hints = block.hints ?? [];

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
        if (!alreadySolved) celebrate();
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
    <div className="glass overflow-hidden">
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-2.5">
        <span className="flex items-center gap-2 text-sm font-semibold text-slate-100">
          <Trophy className="h-4 w-4 text-accent-lime" /> {block.title}
        </span>
        {(alreadySolved || allPass) && (
          <span className="pill border-accent-lime/30 bg-accent-lime/10 text-accent-lime">
            <Check className="h-3 w-3" /> Solved
          </span>
        )}
      </div>

      <div className="space-y-4 p-4">
        <div className="prose-pylearn text-sm text-slate-300">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{block.prompt}</ReactMarkdown>
        </div>

        <CodeEditor value={code} onChange={setCode} height={260} />

        <div className="flex flex-wrap items-center gap-2">
          <button className="btn-primary" onClick={submit} disabled={running || !ready}>
            <Play className="h-4 w-4" />
            {running ? "Running tests…" : ready ? "Submit" : "Loading Python…"}
          </button>
          <button
            className="btn-ghost"
            onClick={() => {
              resetCode();
              setResults(null);
              setStderr("");
            }}
          >
            <RotateCcw className="h-4 w-4" /> Reset
          </button>
          {revealedHints < hints.length && (
            <button
              className="btn-ghost"
              onClick={() => setRevealedHints((n) => n + 1)}
            >
              <Lightbulb className="h-4 w-4 text-amber-300" />
              {revealedHints === 0 ? "Hint" : `Hint ${revealedHints + 1}/${hints.length}`}
            </button>
          )}
          {block.solution && (
            <button className="btn-ghost" onClick={() => setShowSolution((s) => !s)}>
              {showSolution ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
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

        {revealedHints > 0 && (
          <ul className="space-y-1.5">
            {hints.slice(0, revealedHints).map((h, i) => (
              <li
                key={i}
                className="flex items-start gap-2 rounded-lg border border-amber-300/20 bg-amber-400/5 px-3 py-2 text-sm text-amber-100"
              >
                <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" />
                <span>{h}</span>
              </li>
            ))}
          </ul>
        )}

        {stderr && (
          <pre className="overflow-auto rounded-lg border border-brand-red/40 bg-brand-red/10 px-3 py-2 font-mono text-xs text-brand-red">
            {stderr}
          </pre>
        )}

        {results && (
          <div className="space-y-1.5">
            <div className="text-sm font-medium text-slate-200">
              {passed} / {total} tests passed{" "}
              {allPass && <span className="text-accent-lime">— nice! 🎉</span>}
            </div>
            <ul className="space-y-1">
              {results.map((r, i) => (
                <li
                  key={i}
                  className={`flex items-start gap-2 rounded-lg border px-3 py-1.5 text-sm ${
                    r.ok
                      ? "border-accent-lime/30 bg-accent-lime/10"
                      : "border-brand-red/30 bg-brand-red/10"
                  }`}
                >
                  {r.ok ? (
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent-lime" />
                  ) : (
                    <X className="mt-0.5 h-4 w-4 shrink-0 text-brand-red" />
                  )}
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
                    {!r.ok && explainError(r.error) && (
                      <div className="mt-0.5 flex items-start gap-1.5 text-xs text-amber-200">
                        <Lightbulb className="mt-0.5 h-3 w-3 shrink-0 text-amber-300" />
                        {explainError(r.error)}
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
