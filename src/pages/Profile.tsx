import { Link } from "react-router-dom";
import { Bookmark, Flame, RotateCcw, Star, Target, Trophy } from "lucide-react";
import { curriculum, totalLessons } from "../content/curriculum";
import { useProgressStore } from "../store/progressStore";
import { levelProgress } from "../lib/level";
import { computeBadges } from "../lib/badges";
import { moduleGradient } from "../lib/moduleTheme";
import ProgressRing from "../components/ui/ProgressRing";
import Badge from "../components/ui/Badge";
import Reveal from "../components/ui/Reveal";

export default function Profile() {
  const { completedLessons, solvedChallenges, bookmarks, xp, streakDays, reset } =
    useProgressStore();

  // Resolve bookmarked lesson ids to their module/lesson for links.
  const bookmarked = curriculum.flatMap((m) =>
    m.lessons
      .filter((l) => bookmarks[l.id])
      .map((l) => ({ moduleId: m.id, lessonId: l.id, title: l.title, moduleTitle: m.title })),
  );
  const { level, pct, intoLevel, span } = levelProgress(xp);
  const lessonsDone = Object.keys(completedLessons).length;
  const solved = Object.keys(solvedChallenges).length;
  const badges = computeBadges({ completedLessons, solvedChallenges, xp, streakDays });
  const unlocked = badges.filter((b) => b.unlocked).length;

  const stats = [
    { label: "XP", value: xp, icon: Star, color: "text-accent-violet" },
    { label: "Day streak", value: streakDays, icon: Flame, color: "text-orange-400" },
    { label: "Lessons", value: `${lessonsDone}/${totalLessons()}`, icon: Trophy, color: "text-accent-cyan" },
    { label: "Challenges", value: solved, icon: Target, color: "text-accent-lime" },
  ];

  return (
    <div className="mx-auto max-w-4xl px-5 py-10">
      <h1 className="mb-6 font-display text-2xl font-bold text-white">Your profile</h1>

      {/* Level + stats */}
      <div className="glass flex flex-col items-center gap-6 p-6 sm:flex-row sm:items-center">
        <ProgressRing pct={pct}>
          <div>
            <div className="font-display text-3xl font-bold text-white">{level}</div>
            <div className="text-[10px] uppercase tracking-wide text-slate-400">Level</div>
          </div>
        </ProgressRing>
        <div className="flex-1">
          <div className="mb-3 text-sm text-slate-400">
            {intoLevel}/{span} XP to level {level + 1}
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {stats.map((s) => {
              const Icon = s.icon;
              return (
                <div key={s.label} className="panel p-3">
                  <Icon className={`h-4 w-4 ${s.color}`} />
                  <div className="mt-1 font-display text-xl font-bold text-white">{s.value}</div>
                  <div className="text-xs text-slate-400">{s.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Per-module progress */}
      <h2 className="mb-3 mt-8 font-display text-lg font-bold text-white">Module progress</h2>
      <div className="space-y-2.5">
        {curriculum.map((m) => {
          const done = m.lessons.filter((l) => completedLessons[l.id]).length;
          const mpct = Math.round((done / m.lessons.length) * 100);
          return (
            <div key={m.id} className="glass flex items-center gap-3 p-3">
              <span
                className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-lg"
                style={{ background: moduleGradient(m.id, 145) }}
              >
                {m.icon}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex justify-between text-sm">
                  <span className="text-white">{m.title}</span>
                  <span className="text-slate-400">
                    {done}/{m.lessons.length}
                  </span>
                </div>
                <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/5">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${mpct}%`, background: moduleGradient(m.id) }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Badges */}
      <div className="mb-3 mt-8 flex items-center justify-between">
        <h2 className="font-display text-lg font-bold text-white">Achievements</h2>
        <span className="pill border-white/10 bg-white/5 text-slate-300">
          {unlocked}/{badges.length} unlocked
        </span>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {badges.map((b, i) => (
          <Reveal key={b.id} delay={i * 0.03}>
            <Badge badge={b} />
          </Reveal>
        ))}
      </div>

      {/* Bookmarks */}
      {bookmarked.length > 0 && (
        <>
          <h2 className="mb-3 mt-8 flex items-center gap-2 font-display text-lg font-bold text-white">
            <Bookmark className="h-5 w-5 text-accent-lime" /> Saved lessons
          </h2>
          <div className="space-y-2">
            {bookmarked.map((b) => (
              <Link
                key={b.lessonId}
                to={`/learn/${b.moduleId}/${b.lessonId}`}
                className="glass flex items-center gap-3 p-3 transition-shadow hover:glow-ring"
              >
                <Bookmark className="h-4 w-4 shrink-0 text-accent-lime" />
                <span className="flex-1 truncate text-sm text-white">{b.title}</span>
                <span className="text-xs text-slate-400">{b.moduleTitle}</span>
              </Link>
            ))}
          </div>
        </>
      )}

      {/* Danger zone */}
      <div className="mt-10 border-t border-white/10 pt-5">
        <button
          className="btn-ghost text-brand-red"
          onClick={() => {
            if (confirm("Reset all progress? This cannot be undone.")) reset();
          }}
        >
          <RotateCcw className="h-4 w-4" /> Reset all progress
        </button>
      </div>
    </div>
  );
}
