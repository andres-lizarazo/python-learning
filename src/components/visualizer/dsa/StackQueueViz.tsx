import { useMemo } from "react";
import { StepControls, VizShell, useStepper } from "./shared";

interface Op {
  op: "push" | "pop" | "enqueue" | "dequeue";
  value?: number;
}

interface Props {
  structure?: "stack" | "queue";
  ops?: Op[];
  title?: string;
  caption?: string;
}

interface Frame {
  items: number[];
  note: string;
  changed?: number;
}

const DEFAULT_STACK: Op[] = [
  { op: "push", value: 1 },
  { op: "push", value: 2 },
  { op: "push", value: 3 },
  { op: "pop" },
  { op: "push", value: 4 },
  { op: "pop" },
];
const DEFAULT_QUEUE: Op[] = [
  { op: "enqueue", value: 1 },
  { op: "enqueue", value: 2 },
  { op: "enqueue", value: 3 },
  { op: "dequeue" },
  { op: "enqueue", value: 4 },
  { op: "dequeue" },
];

export default function StackQueueViz({
  structure = "stack",
  ops,
  title,
  caption,
}: Props) {
  const program = ops ?? (structure === "stack" ? DEFAULT_STACK : DEFAULT_QUEUE);

  const frames = useMemo<Frame[]>(() => {
    const f: Frame[] = [{ items: [], note: "Empty" }];
    const items: number[] = [];
    for (const o of program) {
      if (o.op === "push" || o.op === "enqueue") {
        items.push(o.value!);
        f.push({ items: [...items], note: `${o.op}(${o.value})`, changed: items.length - 1 });
      } else if (o.op === "pop") {
        const v = items.pop();
        f.push({ items: [...items], note: `pop() → ${v} (LIFO: from top)` });
      } else if (o.op === "dequeue") {
        const v = items.shift();
        f.push({ items: [...items], note: `dequeue() → ${v} (FIFO: from front)` });
      }
    }
    return f;
  }, [program]);

  const stepper = useStepper(frames.length, 800);
  const frame = frames[stepper.idx];
  const isStack = structure === "stack";

  return (
    <VizShell title={title ?? (isStack ? "Stack (LIFO)" : "Queue (FIFO)")} caption={caption}>
      <div
        className={`well flex min-h-[12rem] items-center gap-2 p-4 ${
          isStack ? "flex-col-reverse justify-start" : "flex-row justify-start"
        }`}
      >
        {frame.items.length === 0 && <span className="text-sm text-slate-500">empty</span>}
        {frame.items.map((v, i) => {
          const isEnd = isStack ? i === frame.items.length - 1 : i === 0;
          const highlight = frame.changed === i;
          return (
            <div
              key={`${i}-${v}`}
              className={`flex h-11 w-20 items-center justify-center rounded-xl border font-mono font-semibold text-white transition-all ${
                highlight
                  ? "border-amber-300/50 shadow-[0_0_14px_rgba(245,158,11,0.45)]"
                  : isEnd
                    ? "border-accent-cyan/50"
                    : "border-white/10 bg-white/5 text-slate-200"
              }`}
              style={
                highlight
                  ? { background: "linear-gradient(145deg,#fcd34d,#f59e0b)" }
                  : isEnd
                    ? { background: "linear-gradient(145deg,#8b5cf6,#22d3ee)" }
                    : undefined
              }
            >
              {v}
            </div>
          );
        })}
      </div>
      <div className="text-center text-sm text-slate-300" role="status" aria-live="polite">{frame.note}</div>
      <StepControls stepper={stepper} length={frames.length} label="Op" />
    </VizShell>
  );
}
