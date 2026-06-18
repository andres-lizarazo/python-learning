import { useMemo } from "react";
import { StepControls, VizShell, useStepper } from "./shared";

type Algo = "bubble" | "insertion" | "selection" | "merge" | "quick";

// Max bar height in px inside the h-56 (224px) chart area, leaving room for the
// value label above and the index label below each bar.
const BAR_AREA_PX = 168;

interface Frame {
  arr: number[];
  active: number[]; // indices being compared/moved
  sorted: number[]; // indices known sorted
  note: string;
}

interface Props {
  data?: number[];
  algorithm?: Algo;
  title?: string;
  caption?: string;
}

function range(n: number): number[] {
  return Array.from({ length: n }, (_, i) => i);
}
function range2(lo: number, hi: number): number[] {
  return Array.from({ length: hi - lo }, (_, i) => lo + i);
}

function genBubble(input: number[]): Frame[] {
  const a = [...input];
  const frames: Frame[] = [{ arr: [...a], active: [], sorted: [], note: "Start" }];
  const sorted: number[] = [];
  for (let i = 0; i < a.length - 1; i++) {
    for (let j = 0; j < a.length - 1 - i; j++) {
      frames.push({
        arr: [...a],
        active: [j, j + 1],
        sorted: [...sorted],
        note: `Compare ${a[j]} and ${a[j + 1]}`,
      });
      if (a[j] > a[j + 1]) {
        [a[j], a[j + 1]] = [a[j + 1], a[j]];
        frames.push({ arr: [...a], active: [j, j + 1], sorted: [...sorted], note: "Swap" });
      }
    }
    sorted.unshift(a.length - 1 - i);
  }
  frames.push({ arr: [...a], active: [], sorted: a.map((_, i) => i), note: "Sorted ✓" });
  return frames;
}

function genInsertion(input: number[]): Frame[] {
  const a = [...input];
  const frames: Frame[] = [{ arr: [...a], active: [], sorted: [0], note: "Start" }];
  for (let i = 1; i < a.length; i++) {
    const key = a[i];
    let j = i - 1;
    frames.push({ arr: [...a], active: [i], sorted: range(i), note: `Insert ${key}` });
    while (j >= 0 && a[j] > key) {
      a[j + 1] = a[j];
      frames.push({ arr: [...a], active: [j, j + 1], sorted: range(i), note: `Shift ${a[j]} right` });
      j--;
    }
    a[j + 1] = key;
    frames.push({ arr: [...a], active: [j + 1], sorted: range(i + 1), note: `Place ${key}` });
  }
  frames.push({ arr: [...a], active: [], sorted: a.map((_, i) => i), note: "Sorted ✓" });
  return frames;
}

function genSelection(input: number[]): Frame[] {
  const a = [...input];
  const frames: Frame[] = [{ arr: [...a], active: [], sorted: [], note: "Start" }];
  for (let i = 0; i < a.length; i++) {
    let min = i;
    for (let j = i + 1; j < a.length; j++) {
      frames.push({ arr: [...a], active: [min, j], sorted: range(i), note: "Find min in rest" });
      if (a[j] < a[min]) min = j;
    }
    if (min !== i) [a[i], a[min]] = [a[min], a[i]];
    frames.push({ arr: [...a], active: [i], sorted: range(i + 1), note: `Place min ${a[i]}` });
  }
  frames.push({ arr: [...a], active: [], sorted: a.map((_, i) => i), note: "Sorted ✓" });
  return frames;
}

function genMerge(input: number[]): Frame[] {
  const a = [...input];
  const frames: Frame[] = [{ arr: [...a], active: [], sorted: [], note: "Start" }];
  function mergeSort(lo: number, hi: number) {
    if (hi - lo <= 1) return;
    const mid = (lo + hi) >> 1;
    mergeSort(lo, mid);
    mergeSort(mid, hi);
    const merged: number[] = [];
    let i = lo;
    let j = mid;
    while (i < mid && j < hi) {
      frames.push({ arr: [...a], active: [i, j], sorted: [], note: `Merge: compare ${a[i]} & ${a[j]}` });
      if (a[i] <= a[j]) merged.push(a[i++]);
      else merged.push(a[j++]);
    }
    while (i < mid) merged.push(a[i++]);
    while (j < hi) merged.push(a[j++]);
    for (let k = 0; k < merged.length; k++) a[lo + k] = merged[k];
    frames.push({ arr: [...a], active: range2(lo, hi), sorted: [], note: `Merged [${lo}..${hi - 1}]` });
  }
  mergeSort(0, a.length);
  frames.push({ arr: [...a], active: [], sorted: a.map((_, i) => i), note: "Sorted ✓" });
  return frames;
}

function genQuick(input: number[]): Frame[] {
  const a = [...input];
  const frames: Frame[] = [{ arr: [...a], active: [], sorted: [], note: "Start" }];
  function quick(lo: number, hi: number) {
    if (lo >= hi) return;
    const pivot = a[hi];
    let i = lo;
    frames.push({ arr: [...a], active: [hi], sorted: [], note: `Pivot = ${pivot}` });
    for (let j = lo; j < hi; j++) {
      frames.push({ arr: [...a], active: [j, hi], sorted: [], note: `Compare ${a[j]} with pivot` });
      if (a[j] < pivot) {
        [a[i], a[j]] = [a[j], a[i]];
        i++;
      }
    }
    [a[i], a[hi]] = [a[hi], a[i]];
    frames.push({ arr: [...a], active: [i], sorted: [i], note: `Pivot placed at ${i}` });
    quick(lo, i - 1);
    quick(i + 1, hi);
  }
  quick(0, a.length - 1);
  frames.push({ arr: [...a], active: [], sorted: a.map((_, i) => i), note: "Sorted ✓" });
  return frames;
}

const GENERATORS: Record<Algo, (a: number[]) => Frame[]> = {
  bubble: genBubble,
  insertion: genInsertion,
  selection: genSelection,
  merge: genMerge,
  quick: genQuick,
};

function cap(s: string): string {
  return s[0].toUpperCase() + s.slice(1);
}

export default function SortingViz({
  data = [5, 2, 8, 1, 9, 3, 7, 4],
  algorithm = "bubble",
  title,
  caption,
}: Props) {
  const frames = useMemo(() => GENERATORS[algorithm]([...data]), [data, algorithm]);
  const stepper = useStepper(frames.length, 500);
  const frame = frames[stepper.idx];
  const max = Math.max(...data, 1);

  return (
    <VizShell title={title ?? `${cap(algorithm)} Sort`} caption={caption}>
      <div className="well flex h-56 items-end justify-center gap-1.5 p-3">
        {frame.arr.map((v, i) => {
          const isActive = frame.active.includes(i);
          const isSorted = frame.sorted.includes(i);
          // Gradient fill per state: active = amber, sorted = cyan→lime, default = violet.
          const gradient = isActive
            ? "linear-gradient(180deg,#fcd34d,#f59e0b)"
            : isSorted
              ? "linear-gradient(180deg,#67e8f9,#a3e635)"
              : "linear-gradient(180deg,#a78bfa,#6366f1)";
          const glow = isActive ? "0 0 14px rgba(245,158,11,0.5)" : "none";
          // Bar height in px, leaving room for the value label below each bar.
          const barPx = Math.max(6, Math.round((v / max) * BAR_AREA_PX));
          return (
            <div key={i} className="flex flex-1 flex-col items-center justify-end">
              <span className="mb-1 text-[10px] font-semibold text-slate-300">{v}</span>
              <div
                className="w-full rounded-t transition-all duration-300 ease-out"
                style={{ height: barPx, background: gradient, boxShadow: glow }}
              />
              <span className="mt-1 text-[10px] text-slate-500">{i}</span>
            </div>
          );
        })}
      </div>
      <div className="text-center text-sm text-slate-300" role="status" aria-live="polite">{frame.note}</div>
      <StepControls stepper={stepper} length={frames.length} label="Frame" />
    </VizShell>
  );
}
