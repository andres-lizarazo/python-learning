import { useMemo } from "react";
import { StepControls, VizShell, useStepper } from "./shared";

interface Props {
  /** Values inserted (in order) into a binary search tree. */
  data?: number[];
  traversal?: "inorder" | "preorder" | "postorder" | "bfs";
  title?: string;
  caption?: string;
}

interface Node {
  value: number;
  left: Node | null;
  right: Node | null;
  x: number;
  y: number;
}

function insert(root: Node | null, value: number): Node {
  if (!root) return { value, left: null, right: null, x: 0, y: 0 };
  if (value < root.value) root.left = insert(root.left, value);
  else root.right = insert(root.right, value);
  return root;
}

function cap(s: string): string {
  return s[0].toUpperCase() + s.slice(1);
}

export default function TreeViz({
  data = [50, 30, 70, 20, 40, 60, 80],
  traversal = "inorder",
  title,
  caption,
}: Props) {
  const { nodes, edges, order } = useMemo(() => {
    let root: Node | null = null;
    for (const v of data) root = insert(root, v);

    // Assign x by in-order position, y by depth.
    let counter = 0;
    const all: Node[] = [];
    const edgeList: { from: Node; to: Node }[] = [];
    (function layout(n: Node | null, depth: number) {
      if (!n) return;
      layout(n.left, depth + 1);
      n.x = counter++;
      n.y = depth;
      all.push(n);
      if (n.left) edgeList.push({ from: n, to: n.left });
      if (n.right) edgeList.push({ from: n, to: n.right });
      layout(n.right, depth + 1);
    })(root, 0);

    // Visiting order for the chosen traversal.
    const visit: number[] = [];
    if (traversal === "bfs") {
      const q: Node[] = root ? [root] : [];
      while (q.length) {
        const n = q.shift()!;
        visit.push(n.value);
        if (n.left) q.push(n.left);
        if (n.right) q.push(n.right);
      }
    } else {
      (function trav(n: Node | null) {
        if (!n) return;
        if (traversal === "preorder") visit.push(n.value);
        trav(n.left);
        if (traversal === "inorder") visit.push(n.value);
        trav(n.right);
        if (traversal === "postorder") visit.push(n.value);
      })(root);
    }
    return { nodes: all, edges: edgeList, order: visit };
  }, [data, traversal]);

  const frames = useMemo(
    () => [
      { visited: [] as number[], note: `${cap(traversal)} traversal` },
      ...order.map((_, i) => ({
        visited: order.slice(0, i + 1),
        note: `Visit ${order[i]} → [${order.slice(0, i + 1).join(", ")}]`,
      })),
    ],
    [order, traversal],
  );

  const stepper = useStepper(frames.length, 700);
  const frame = frames[stepper.idx];

  const cols = Math.max(1, nodes.length);
  const depth = Math.max(...nodes.map((n) => n.y), 0);
  const W = cols * 64;
  const H = (depth + 1) * 80 + 20;
  const px = (n: Node) => n.x * 64 + 32;
  const py = (n: Node) => n.y * 80 + 30;

  return (
    <VizShell title={title ?? "Binary Search Tree"} caption={caption}>
      <div className="well overflow-auto p-3">
        <svg
          width={W}
          height={H}
          className="mx-auto"
          role="img"
          aria-label={`Binary search tree ${traversal} traversal diagram`}
        >
          <defs>
            <linearGradient id="tv-visited" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#67e8f9" />
              <stop offset="1" stopColor="#a3e635" />
            </linearGradient>
            <linearGradient id="tv-current" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#a78bfa" />
              <stop offset="1" stopColor="#22d3ee" />
            </linearGradient>
            <filter id="tv-glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" result="b" />
              <feMerge>
                <feMergeNode in="b" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          {edges.map((e, i) => (
            <line
              key={i}
              x1={px(e.from)}
              y1={py(e.from)}
              x2={px(e.to)}
              y2={py(e.to)}
              stroke="rgba(255,255,255,0.14)"
              strokeWidth={2}
            />
          ))}
          {nodes.map((n) => {
            const on = frame.visited.includes(n.value);
            const isLast = frame.visited[frame.visited.length - 1] === n.value;
            const fill = isLast
              ? "url(#tv-current)"
              : on
                ? "url(#tv-visited)"
                : "rgba(255,255,255,0.05)";
            return (
              <g key={n.value} filter={isLast ? "url(#tv-glow)" : undefined}>
                <circle
                  cx={px(n)}
                  cy={py(n)}
                  r={18}
                  fill={fill}
                  stroke={on ? "transparent" : "rgba(139,92,246,0.5)"}
                  strokeWidth={2}
                />
                <text
                  x={px(n)}
                  y={py(n) + 5}
                  textAnchor="middle"
                  fontSize={13}
                  fontFamily="monospace"
                  fill={on ? "#070710" : "#e6ebf5"}
                  fontWeight="bold"
                >
                  {n.value}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
      <div className="text-center text-sm text-slate-300" role="status" aria-live="polite">{frame.note}</div>
      <StepControls stepper={stepper} length={frames.length} />
    </VizShell>
  );
}
