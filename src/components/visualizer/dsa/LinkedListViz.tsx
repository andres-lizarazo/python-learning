import { useMemo } from "react";
import { StepControls, VizShell, useStepper } from "./shared";

interface Op {
  op: "append" | "prepend" | "delete";
  value: number;
}

interface Props {
  initial?: number[];
  ops?: Op[];
  title?: string;
  caption?: string;
}

interface Frame {
  nodes: number[];
  active: number | null;
  note: string;
}

const DEFAULT_OPS: Op[] = [
  { op: "append", value: 30 },
  { op: "prepend", value: 5 },
  { op: "delete", value: 20 },
];

export default function LinkedListViz({
  initial = [10, 20],
  ops = DEFAULT_OPS,
  title,
  caption,
}: Props) {
  const frames = useMemo<Frame[]>(() => {
    const f: Frame[] = [{ nodes: [...initial], active: null, note: "Initial list" }];
    const nodes = [...initial];
    for (const o of ops) {
      if (o.op === "append") {
        nodes.push(o.value);
        f.push({ nodes: [...nodes], active: nodes.length - 1, note: `append(${o.value}) — new tail` });
      } else if (o.op === "prepend") {
        nodes.unshift(o.value);
        f.push({ nodes: [...nodes], active: 0, note: `prepend(${o.value}) — new head` });
      } else if (o.op === "delete") {
        const i = nodes.indexOf(o.value);
        if (i >= 0) {
          f.push({ nodes: [...nodes], active: i, note: `delete(${o.value}) — relink neighbors` });
          nodes.splice(i, 1);
          f.push({ nodes: [...nodes], active: null, note: `removed ${o.value}` });
        }
      }
    }
    return f;
  }, [initial, ops]);

  const stepper = useStepper(frames.length, 850);
  const frame = frames[stepper.idx];

  return (
    <VizShell title={title ?? "Singly Linked List"} caption={caption}>
      <div className="well flex min-h-[8rem] flex-wrap items-center gap-1 p-4">
        {frame.nodes.length === 0 && <span className="text-sm text-slate-500">null</span>}
        {frame.nodes.map((v, i) => {
          const active = frame.active === i;
          return (
            <div key={`${i}-${v}`} className="flex items-center">
              <div
                className={`flex items-center overflow-hidden rounded-xl border font-mono ${
                  active ? "border-amber-300/50 shadow-[0_0_12px_rgba(245,158,11,0.4)]" : "border-white/10"
                }`}
              >
                <span
                  className="px-3 py-2 font-semibold text-white"
                  style={{
                    background: active
                      ? "linear-gradient(145deg,#fcd34d,#f59e0b)"
                      : "rgba(255,255,255,0.05)",
                  }}
                >
                  {v}
                </span>
                <span className="border-l border-white/10 bg-white/[0.02] px-2 py-2 text-xs text-slate-400">
                  next
                </span>
              </div>
              <span className="px-1 text-slate-600">→</span>
            </div>
          );
        })}
        <span className="text-sm text-slate-500">null</span>
      </div>
      <div className="text-center text-sm text-slate-300" role="status" aria-live="polite">{frame.note}</div>
      <StepControls stepper={stepper} length={frames.length} label="Op" />
    </VizShell>
  );
}
