import type { DiagramCell, HeapNode } from "../../pyodide/pyodideClient";

// A lightweight "objects in the heap" view (pythontutor-style, without drawn arrows):
// variables on the left reference heap objects by id; shared ids reveal aliasing.

const PRIM_COLOR: Record<string, string> = {
  num: "text-sky-300",
  str: "text-amber-300",
  bool: "text-fuchsia-300",
  none: "text-slate-500",
};
const KIND_LABEL: Record<string, string> = {
  list: "list",
  tuple: "tuple",
  dict: "dict",
  set: "set",
};

function Cell({ cell }: { cell: DiagramCell }) {
  if (cell.t === "ref") {
    return (
      <span className="rounded-md border border-accent-violet/40 bg-accent-violet/15 px-1.5 py-0.5 font-mono text-xs text-accent-violet">
        →#{cell.id}
      </span>
    );
  }
  return (
    <span className={`font-mono text-xs ${PRIM_COLOR[cell.t] ?? "text-slate-200"}`}>
      {cell.v}
    </span>
  );
}

function HeapNodeView({ id, node }: { id: string; node: HeapNode }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.03] p-2">
      <div className="mb-1 flex items-center gap-2">
        <span className="rounded bg-white/10 px-1.5 font-mono text-[10px] text-slate-300">
          #{id}
        </span>
        <span className="text-[10px] uppercase tracking-wide text-slate-500">
          {KIND_LABEL[node.kind]}
        </span>
      </div>
      {(node.kind === "list" || node.kind === "tuple") && (
        <div className="flex flex-wrap gap-1">
          {(node.items as DiagramCell[]).map((c, i) => (
            <span key={i} className="flex flex-col items-center">
              <span className="rounded border border-white/10 bg-ink-900/60 px-2 py-1">
                <Cell cell={c} />
              </span>
              <span className="text-[9px] text-slate-600">{i}</span>
            </span>
          ))}
          {node.more > 0 && <span className="self-center text-xs text-slate-500">+{node.more}</span>}
        </div>
      )}
      {node.kind === "dict" && (
        <div className="space-y-0.5">
          {(node.items as [string, DiagramCell][]).map(([k, v], i) => (
            <div key={i} className="flex items-center gap-1.5 text-xs">
              <span className="font-mono text-emerald-300">{k}</span>
              <span className="text-slate-600">:</span>
              <Cell cell={v} />
            </div>
          ))}
          {node.more > 0 && <div className="text-xs text-slate-500">+{node.more} more</div>}
        </div>
      )}
      {node.kind === "set" && (
        <div className="flex flex-wrap gap-1">
          {(node.items as string[]).map((v, i) => (
            <span
              key={i}
              className="rounded border border-white/10 bg-ink-900/60 px-2 py-0.5 font-mono text-xs text-slate-200"
            >
              {v}
            </span>
          ))}
          {node.more > 0 && <span className="text-xs text-slate-500">+{node.more}</span>}
        </div>
      )}
    </div>
  );
}

export default function ObjectDiagram({
  refs,
  heap,
}: {
  refs: Record<string, DiagramCell>;
  heap: Record<string, HeapNode>;
}) {
  const varNames = Object.keys(refs);
  const heapIds = Object.keys(heap).sort((a, b) => Number(a) - Number(b));

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <div>
        <div className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
          Variables
        </div>
        <div className="space-y-1">
          {varNames.length === 0 && <p className="text-sm text-slate-500">none yet</p>}
          {varNames.map((name) => (
            <div
              key={name}
              className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-2.5 py-1"
            >
              <span className="font-mono text-xs font-semibold text-white">{name}</span>
              <span className="text-slate-600">=</span>
              <Cell cell={refs[name]} />
            </div>
          ))}
        </div>
      </div>
      <div>
        <div className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
          Objects (heap)
        </div>
        <div className="space-y-2">
          {heapIds.length === 0 && (
            <p className="text-sm text-slate-500">no objects — only primitives</p>
          )}
          {heapIds.map((id) => (
            <HeapNodeView key={id} id={id} node={heap[id]} />
          ))}
        </div>
      </div>
    </div>
  );
}
