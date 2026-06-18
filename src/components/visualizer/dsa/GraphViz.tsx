import { useMemo } from "react";
import { StepControls, VizShell, useStepper } from "./shared";

interface Props {
  /** Adjacency list keyed by node label. */
  adjacency?: Record<string, string[]>;
  traversal?: "bfs" | "dfs";
  start?: string;
  title?: string;
  caption?: string;
}

const DEFAULT_ADJ: Record<string, string[]> = {
  A: ["B", "C"],
  B: ["A", "D", "E"],
  C: ["A", "F"],
  D: ["B"],
  E: ["B", "F"],
  F: ["C", "E"],
};

interface Frame {
  visited: string[];
  frontier: string[];
  current: string | null;
  note: string;
}

export default function GraphViz({
  adjacency = DEFAULT_ADJ,
  traversal = "bfs",
  start = "A",
  title,
  caption,
}: Props) {
  const labels = useMemo(() => Object.keys(adjacency), [adjacency]);

  // Circular layout.
  const positions = useMemo(() => {
    const pos: Record<string, { x: number; y: number }> = {};
    const R = 90;
    const cx = 140;
    const cy = 120;
    labels.forEach((l, i) => {
      const a = (i / labels.length) * Math.PI * 2 - Math.PI / 2;
      pos[l] = { x: cx + R * Math.cos(a), y: cy + R * Math.sin(a) };
    });
    return pos;
  }, [labels]);

  const edges = useMemo(() => {
    const seen = new Set<string>();
    const list: [string, string][] = [];
    for (const [u, vs] of Object.entries(adjacency)) {
      for (const v of vs) {
        const key = [u, v].sort().join("-");
        if (!seen.has(key)) {
          seen.add(key);
          list.push([u, v]);
        }
      }
    }
    return list;
  }, [adjacency]);

  const frames = useMemo<Frame[]>(() => {
    const f: Frame[] = [];
    const visited: string[] = [];
    const isBfs = traversal === "bfs";
    const frontier: string[] = [start];
    const enqueued = new Set<string>([start]);
    f.push({ visited: [], frontier: [...frontier], current: null, note: `Start at ${start}` });

    while (frontier.length) {
      const node = isBfs ? frontier.shift()! : frontier.pop()!;
      if (visited.includes(node)) continue;
      visited.push(node);
      f.push({
        visited: [...visited],
        frontier: [...frontier],
        current: node,
        note: `Visit ${node} → [${visited.join(", ")}]`,
      });
      for (const nb of adjacency[node] ?? []) {
        if (!enqueued.has(nb)) {
          enqueued.add(nb);
          frontier.push(nb);
        }
      }
    }
    f.push({ visited: [...visited], frontier: [], current: null, note: "Traversal complete ✓" });
    return f;
  }, [adjacency, traversal, start]);

  const stepper = useStepper(frames.length, 750);
  const frame = frames[stepper.idx];

  return (
    <VizShell title={title ?? `Graph — ${traversal.toUpperCase()}`} caption={caption}>
      <div className="grid gap-3 md:grid-cols-[1fr_auto]">
        <div className="well overflow-auto p-2">
          <svg
            width={280}
            height={240}
            className="mx-auto"
            role="img"
            aria-label={`Graph ${traversal.toUpperCase()} traversal diagram`}
          >
            <defs>
              <linearGradient id="gv-current" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="#fcd34d" />
                <stop offset="1" stopColor="#f59e0b" />
              </linearGradient>
              <linearGradient id="gv-visited" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="#67e8f9" />
                <stop offset="1" stopColor="#a3e635" />
              </linearGradient>
              <linearGradient id="gv-frontier" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="#a78bfa" />
                <stop offset="1" stopColor="#6366f1" />
              </linearGradient>
              <filter id="gv-glow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="3.5" result="b" />
                <feMerge>
                  <feMergeNode in="b" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            {edges.map(([u, v], i) => (
              <line
                key={i}
                x1={positions[u].x}
                y1={positions[u].y}
                x2={positions[v].x}
                y2={positions[v].y}
                stroke="rgba(255,255,255,0.14)"
                strokeWidth={2}
              />
            ))}
            {labels.map((l) => {
              const visited = frame.visited.includes(l);
              const current = frame.current === l;
              const inFrontier = frame.frontier.includes(l);
              const fill = current
                ? "url(#gv-current)"
                : visited
                  ? "url(#gv-visited)"
                  : inFrontier
                    ? "url(#gv-frontier)"
                    : "rgba(255,255,255,0.05)";
              const light = current || visited;
              return (
                <g key={l} filter={current ? "url(#gv-glow)" : undefined}>
                  <circle
                    cx={positions[l].x}
                    cy={positions[l].y}
                    r={18}
                    fill={fill}
                    stroke={light || inFrontier ? "transparent" : "rgba(139,92,246,0.45)"}
                    strokeWidth={2}
                  />
                  <text
                    x={positions[l].x}
                    y={positions[l].y + 5}
                    textAnchor="middle"
                    fontSize={13}
                    fontFamily="monospace"
                    fontWeight="bold"
                    fill={light ? "#070710" : "#e6ebf5"}
                  >
                    {l}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
        <div className="space-y-2 text-sm">
          <div>
            <div className="text-xs uppercase text-slate-400">
              {traversal === "bfs" ? "Queue (FIFO)" : "Stack (LIFO)"}
            </div>
            <div className="font-mono text-brand">[{frame.frontier.join(", ")}]</div>
          </div>
          <div>
            <div className="text-xs uppercase text-slate-400">Visited</div>
            <div className="font-mono text-brand-green">[{frame.visited.join(", ")}]</div>
          </div>
        </div>
      </div>
      <div className="text-center text-sm text-slate-300" role="status" aria-live="polite">{frame.note}</div>
      <StepControls stepper={stepper} length={frames.length} />
    </VizShell>
  );
}
