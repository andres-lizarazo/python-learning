import { create } from "zustand";
import { persist } from "zustand/middleware";

// Tracks learner progress + light gamification (XP, streak), persisted to
// localStorage so it survives reloads. CodeSignal-style motivation loop.

interface ProgressState {
  completedLessons: Record<string, true>;
  solvedChallenges: Record<string, true>;
  bookmarks: Record<string, true>;
  xp: number;
  streakDays: number;
  lastActiveDay: string | null; // YYYY-MM-DD
  lastModuleId: string | null;
  lastLessonId: string | null;

  isLessonComplete: (id: string) => boolean;
  isChallengeSolved: (id: string) => boolean;
  isBookmarked: (id: string) => boolean;
  toggleBookmark: (id: string) => void;
  completeLesson: (id: string, xp?: number) => void;
  solveChallenge: (id: string, xp?: number) => void;
  addXp: (amount: number) => void;
  setLastLesson: (moduleId: string, lessonId: string) => void;
  reset: () => void;
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

function touchStreak(state: {
  streakDays: number;
  lastActiveDay: string | null;
}): { streakDays: number; lastActiveDay: string } {
  const day = today();
  if (state.lastActiveDay === day) {
    return { streakDays: state.streakDays || 1, lastActiveDay: day };
  }
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  const streakDays =
    state.lastActiveDay === yesterday ? state.streakDays + 1 : 1;
  return { streakDays, lastActiveDay: day };
}

export const useProgressStore = create<ProgressState>()(
  persist(
    (set, get) => ({
      completedLessons: {},
      solvedChallenges: {},
      bookmarks: {},
      xp: 0,
      streakDays: 0,
      lastActiveDay: null,
      lastModuleId: null,
      lastLessonId: null,

      isLessonComplete: (id) => !!get().completedLessons[id],
      isChallengeSolved: (id) => !!get().solvedChallenges[id],
      isBookmarked: (id) => !!get().bookmarks[id],

      toggleBookmark: (id) =>
        set((s) => {
          const next = { ...s.bookmarks };
          if (next[id]) delete next[id];
          else next[id] = true;
          return { bookmarks: next };
        }),

      completeLesson: (id, xp = 20) =>
        set((s) => {
          if (s.completedLessons[id]) return s;
          return {
            completedLessons: { ...s.completedLessons, [id]: true },
            xp: s.xp + xp,
            ...touchStreak(s),
          };
        }),

      solveChallenge: (id, xp = 50) =>
        set((s) => {
          if (s.solvedChallenges[id]) return s;
          return {
            solvedChallenges: { ...s.solvedChallenges, [id]: true },
            xp: s.xp + xp,
            ...touchStreak(s),
          };
        }),

      addXp: (amount) => set((s) => ({ xp: s.xp + amount, ...touchStreak(s) })),

      setLastLesson: (moduleId, lessonId) =>
        set({ lastModuleId: moduleId, lastLessonId: lessonId }),

      reset: () =>
        set({
          completedLessons: {},
          solvedChallenges: {},
          bookmarks: {},
          xp: 0,
          streakDays: 0,
          lastActiveDay: null,
          lastModuleId: null,
          lastLessonId: null,
        }),
    }),
    { name: "pylearn-progress" },
  ),
);
