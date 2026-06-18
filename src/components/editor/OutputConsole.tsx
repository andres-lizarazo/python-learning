import { Terminal } from "lucide-react";

interface Props {
  stdout?: string;
  stderr?: string;
  running?: boolean;
  placeholder?: string;
}

export default function OutputConsole({
  stdout = "",
  stderr = "",
  running = false,
  placeholder = "Output appears here. Press Run ▸",
}: Props) {
  const empty = !stdout && !stderr && !running;
  return (
    <div className="overflow-hidden rounded-xl border border-white/10 bg-[#070710]/80">
      <div className="flex items-center justify-between border-b border-white/10 px-3 py-1.5">
        <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">
          <Terminal className="h-3.5 w-3.5 text-accent-cyan" /> Console
        </span>
        {running && <span className="pill text-accent-cyan">running…</span>}
      </div>
      <pre
        className="max-h-64 overflow-auto px-3 py-2 font-mono text-[13px] leading-relaxed"
        aria-live="polite"
        aria-label="Program output"
      >
        {empty && <span className="text-slate-400">{placeholder}</span>}
        {stdout && <span className="text-slate-100">{stdout}</span>}
        {stderr && <span className="text-brand-red">{stderr}</span>}
      </pre>
    </div>
  );
}
