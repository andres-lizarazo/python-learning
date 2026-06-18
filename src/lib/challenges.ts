import { curriculum } from "../content/curriculum";
import type { ChallengeBlock } from "../types/lesson";

// Flattens every challenge across the curriculum into a single list for the Practice
// page. The `id` matches the one ChallengeRunner uses (`lessonId::blockIndex`), so it
// lines up with `solvedChallenges` in the progress store.
export interface ChallengeEntry {
  id: string;
  title: string;
  xp: number;
  moduleId: string;
  moduleTitle: string;
  moduleIcon: string;
  lessonId: string;
  lessonTitle: string;
}

export function allChallenges(): ChallengeEntry[] {
  const out: ChallengeEntry[] = [];
  for (const m of curriculum) {
    for (const l of m.lessons) {
      l.blocks.forEach((b, i) => {
        if (b.kind === "challenge") {
          const c = b as ChallengeBlock;
          out.push({
            id: `${l.id}::${i}`,
            title: c.title,
            xp: c.xp ?? 50,
            moduleId: m.id,
            moduleTitle: m.title,
            moduleIcon: m.icon,
            lessonId: l.id,
            lessonTitle: l.title,
          });
        }
      });
    }
  }
  return out;
}
