import { useMemo } from "react";
import { StepControls, VizShell, useStepper } from "./shared";

interface Props {
  data?: number[];
  /** "scan" highlights each index in turn; "two-pointer" converges from both ends. */
  mode?: "scan" | "two-pointer";
  title?: string;
  caption?: string;
}

interface Frame {
  highlight: number[];
  note: string;
}

export default function ArrayViz({
  data = [10, 20, 30, 40, 50, 60],
  mode = "scan",
  title,
  caption,
}: Props) {
  const frames = useMemo<Frame[]>(() => {
    if (mode === "two-pointer") {
      const f: Frame[] = [];
      let lo = 0;
      let hi = data.length - 1;
      while (lo <= hi) {
        f.push({ highlight: [lo, hi], note: `left=${lo}, right=${hi}` });
        lo++;
        hi--;
      }
      f.push({ highlight: [], note: "Pointers crossed — done" });
      return f;
    }
    return [
      ...data.map((_, i) => ({ highlight: [i], note: `arr[${i}] = ${data[i]}` })),
      { highlight: [], note: "Traversal complete" },
    ];
  }, [data, mode]);

  const stepper = useStepper(frames.length, 600);
  const frame = frames[stepper.idx];

  return (
    <VizShell title={title ?? "Array"} caption={caption}>
      <div className="well flex flex-wrap items-end justify-center gap-2 p-4">
        {data.map((v, i) => {
          const on = frame.highlight.includes(i);
          return (
            <div key={i} className="flex flex-col items-center">
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-xl border text-lg font-mono font-semibold transition-all ${
                  on
                    ? "scale-110 border-accent-cyan/60 text-white shadow-[0_0_16px_rgba(34,211,238,0.45)]"
                    : "border-white/10 bg-white/5 text-slate-200"
                }`}
                style={
                  on
                    ? { background: "linear-gradient(145deg,#8b5cf6,#22d3ee)" }
                    : undefined
                }
              >
                {v}
              </div>
              <span className="mt-1 text-[10px] text-slate-500">{i}</span>
            </div>
          );
        })}
      </div>
      <div className="text-center text-sm text-slate-300" role="status" aria-live="polite">{frame.note}</div>
      <StepControls stepper={stepper} length={frames.length} />
    </VizShell>
  );
}
