import { useMemo } from "react";
import { StepControls, VizShell, useStepper } from "./shared";

interface Props {
  func?: "factorial" | "fibonacci";
  n?: number;
  title?: string;
  caption?: string;
}

interface StackFrame {
  label: string;
  returning?: number;
}
interface Frame {
  stack: StackFrame[];
  note: string;
}

export default function RecursionViz({
  func = "factorial",
  n = 4,
  title,
  caption,
}: Props) {
  const frames = useMemo<Frame[]>(() => {
    const f: Frame[] = [];
    const stack: StackFrame[] = [];

    function snap(note: string) {
      f.push({ stack: stack.map((s) => ({ ...s })), note });
    }

    if (func === "factorial") {
      (function fact(k: number): number {
        stack.push({ label: `factorial(${k})` });
        snap(`Call factorial(${k})`);
        let result: number;
        if (k <= 1) {
          result = 1;
          snap(`Base case: factorial(${k}) = 1`);
        } else {
          result = k * fact(k - 1);
        }
        stack[stack.length - 1].returning = result;
        snap(`Return ${result} from factorial(${k})`);
        stack.pop();
        return result;
      })(n);
    } else {
      (function fib(k: number): number {
        stack.push({ label: `fib(${k})` });
        snap(`Call fib(${k})`);
        let result: number;
        if (k < 2) {
          result = k;
          snap(`Base case: fib(${k}) = ${k}`);
        } else {
          result = fib(k - 1) + fib(k - 2);
        }
        stack[stack.length - 1].returning = result;
        snap(`Return ${result} from fib(${k})`);
        stack.pop();
        return result;
      })(n);
    }
    return f;
  }, [func, n]);

  const stepper = useStepper(frames.length, 650);
  const frame = frames[stepper.idx];

  return (
    <VizShell title={title ?? `Recursion — ${func}(${n})`} caption={caption}>
      <div className="well flex min-h-[12rem] flex-col-reverse items-center justify-end gap-1.5 p-4">
        {frame.stack.length === 0 && (
          <span className="text-sm text-slate-500">call stack empty</span>
        )}
        {frame.stack.map((s, i) => {
          const isTop = i === frame.stack.length - 1;
          return (
            <div
              key={i}
              className={`flex w-56 items-center justify-between rounded-xl border px-3 py-2 font-mono text-sm transition-all ${
                s.returning !== undefined
                  ? "border-accent-cyan/40 bg-accent-cyan/10 text-accent-cyan"
                  : isTop
                    ? "border-amber-300/40 bg-amber-400/10 text-amber-200"
                    : "border-white/10 bg-white/5 text-slate-300"
              }`}
            >
              <span>{s.label}</span>
              {s.returning !== undefined && <span>→ {s.returning}</span>}
            </div>
          );
        })}
      </div>
      <div className="text-center text-sm text-slate-300" role="status" aria-live="polite">{frame.note}</div>
      <p className="text-center text-xs text-slate-500">
        Frames stack downward; the top frame (yellow) is currently executing. Green =
        returning a value.
      </p>
      <StepControls stepper={stepper} length={frames.length} />
    </VizShell>
  );
}
