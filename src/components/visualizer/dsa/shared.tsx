import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { Pause, Play, RotateCcw, SkipBack, SkipForward } from "lucide-react";

// Shared playback machinery for the DSA visualizers. Each visualizer precomputes an
// array of "frames"; this hook handles play / pause / step / scrub over them.

export function useStepper(length: number, defaultSpeed = 700) {
  const [idx, setIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(defaultSpeed);

  // Reset when the frame set changes size (e.g. new data/algorithm).
  const lenRef = useRef(length);
  useEffect(() => {
    if (lenRef.current !== length) {
      lenRef.current = length;
      setIdx(0);
      setPlaying(false);
    }
  }, [length]);

  useEffect(() => {
    if (!playing) return;
    if (idx >= length - 1) {
      setPlaying(false);
      return;
    }
    const h = setTimeout(() => setIdx((i) => Math.min(i + 1, length - 1)), speed);
    return () => clearTimeout(h);
  }, [playing, idx, length, speed]);

  const atEnd = idx >= length - 1;
  const reset = useCallback(() => {
    setIdx(0);
    setPlaying(false);
  }, []);

  return { idx, setIdx, playing, setPlaying, speed, setSpeed, atEnd, reset };
}

interface ControlsProps {
  stepper: ReturnType<typeof useStepper>;
  length: number;
  label?: string;
}

export function StepControls({ stepper, length, label }: ControlsProps) {
  const { idx, setIdx, playing, setPlaying, speed, setSpeed, atEnd } = stepper;
  return (
    <div className="space-y-2" role="group" aria-label="Animation controls">
      <div className="flex flex-wrap items-center gap-2">
        <button
          className="btn-ghost px-2.5"
          onClick={() => setIdx(Math.max(0, idx - 1))}
          disabled={idx === 0}
          aria-label="Previous"
        >
          <SkipBack className="h-4 w-4" />
        </button>
        <button
          className="btn-primary"
          onClick={() => (atEnd ? (setIdx(0), setPlaying(true)) : setPlaying(!playing))}
        >
          {atEnd ? (
            <>
              <RotateCcw className="h-4 w-4" /> Replay
            </>
          ) : playing ? (
            <>
              <Pause className="h-4 w-4" /> Pause
            </>
          ) : (
            <>
              <Play className="h-4 w-4" /> Play
            </>
          )}
        </button>
        <button
          className="btn-ghost px-2.5"
          onClick={() => setIdx(Math.min(length - 1, idx + 1))}
          disabled={atEnd}
          aria-label="Next"
        >
          <SkipForward className="h-4 w-4" />
        </button>
        <select
          className="select"
          aria-label="Playback speed"
          value={speed}
          onChange={(e) => setSpeed(Number(e.target.value))}
        >
          <option value={1200}>Slow</option>
          <option value={700}>Normal</option>
          <option value={350}>Fast</option>
          <option value={120}>Turbo</option>
        </select>
        <span className="ml-auto text-xs text-slate-400" aria-live="polite">
          {label ?? "Step"} {idx + 1}/{length}
        </span>
      </div>
      <input
        type="range"
        aria-label={`Scrub ${(label ?? "step").toLowerCase()}s`}
        min={0}
        max={Math.max(0, length - 1)}
        value={idx}
        onChange={(e) => {
          setPlaying(false);
          setIdx(Number(e.target.value));
        }}
        className="w-full accent-brand"
      />
    </div>
  );
}

export function VizShell({
  title,
  caption,
  children,
}: {
  title?: string;
  caption?: string;
  children: ReactNode;
}) {
  return (
    <div className="card overflow-hidden">
      {title && (
        <div className="border-b border-ink-600/60 px-4 py-2 text-sm font-semibold text-slate-200">
          📊 {title}
        </div>
      )}
      <div className="space-y-3 p-4">{children}</div>
      {caption && <div className="px-4 pb-3 text-xs text-slate-400">{caption}</div>}
    </div>
  );
}
