import Editor from "@monaco-editor/react";
import { useEffect, useRef } from "react";

// Loose Monaco types — we avoid a hard dependency on the `monaco-editor` package
// (it is loaded from a CDN by @monaco-editor/loader at runtime).
type AnyEditor = {
  deltaDecorations: (oldIds: string[], newDecos: unknown[]) => string[];
  revealLineInCenterIfOutsideViewport: (line: number) => void;
};
type AnyMonaco = {
  Range: new (a: number, b: number, c: number, d: number) => unknown;
  editor: { defineTheme: (name: string, theme: unknown) => void };
};

// A Monaco theme tuned to the Aurora-Glass palette (transparent bg blends into glass).
const PYLEARN_THEME = {
  base: "vs-dark",
  inherit: true,
  rules: [
    { token: "comment", foreground: "6b7280", fontStyle: "italic" },
    { token: "keyword", foreground: "c4b5fd" },
    { token: "string", foreground: "bef264" },
    { token: "number", foreground: "67e8f9" },
    { token: "function", foreground: "67e8f9" },
  ],
  colors: {
    "editor.background": "#0a0a16",
    "editor.lineHighlightBackground": "#ffffff0a",
    "editorLineNumber.foreground": "#3b3b5c",
    "editorCursor.foreground": "#a3e635",
    "editor.selectionBackground": "#8b5cf640",
  },
};

interface Props {
  value: string;
  onChange?: (v: string) => void;
  height?: number | string;
  readOnly?: boolean;
  /** 1-based line to highlight (used by the ExecutionVisualizer). */
  highlightLine?: number | null;
  /** Optional filename shown in the window chrome. */
  filename?: string;
}

export default function CodeEditor({
  value,
  onChange,
  height = 240,
  readOnly = false,
  highlightLine = null,
  filename,
}: Props) {
  const editorRef = useRef<AnyEditor | null>(null);
  const monacoRef = useRef<AnyMonaco | null>(null);
  const decorationsRef = useRef<string[]>([]);

  // Re-apply the current-line decoration whenever highlightLine changes.
  useEffect(() => {
    const ed = editorRef.current;
    const monaco = monacoRef.current;
    if (!ed || !monaco) return;
    decorationsRef.current = ed.deltaDecorations(
      decorationsRef.current,
      highlightLine
        ? [
            {
              range: new monaco.Range(highlightLine, 1, highlightLine, 1),
              options: { isWholeLine: true, className: "exec-current-line" },
            },
          ]
        : [],
    );
    if (highlightLine) ed.revealLineInCenterIfOutsideViewport(highlightLine);
  }, [highlightLine]);

  return (
    <div className="overflow-hidden rounded-xl border border-white/10 bg-[#0a0a16]">
      {/* Window chrome */}
      <div className="flex items-center gap-1.5 border-b border-white/10 px-3 py-2" aria-hidden>
        <span className="h-2.5 w-2.5 rounded-full bg-rose-400/70" />
        <span className="h-2.5 w-2.5 rounded-full bg-amber-400/70" />
        <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/70" />
        <span className="ml-2 font-mono text-xs text-slate-500">
          {filename ?? (readOnly ? "solution.py" : "main.py")}
        </span>
      </div>
      <Editor
        height={height}
        defaultLanguage="python"
        theme="pylearn"
        value={value}
        loading={
          <div className="flex h-full w-full flex-col gap-2 p-4">
            {[80, 55, 70, 40, 60].map((w, i) => (
              <div
                key={i}
                className="h-3 animate-pulse rounded bg-white/5"
                style={{ width: `${w}%` }}
              />
            ))}
          </div>
        }
        onChange={(v) => onChange?.(v ?? "")}
        beforeMount={(monaco) => {
          (monaco as unknown as AnyMonaco).editor.defineTheme("pylearn", PYLEARN_THEME);
        }}
        options={{
          readOnly,
          minimap: { enabled: false },
          fontSize: 14,
          fontFamily: "JetBrains Mono, Fira Code, monospace",
          fontLigatures: true,
          scrollBeyondLastLine: false,
          lineNumbers: "on",
          tabSize: 4,
          renderLineHighlight: "all",
          automaticLayout: true,
          padding: { top: 10, bottom: 10 },
        }}
        onMount={(ed, monaco) => {
          editorRef.current = ed as unknown as AnyEditor;
          monacoRef.current = monaco as unknown as AnyMonaco;
        }}
      />
    </div>
  );
}
