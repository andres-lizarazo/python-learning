import { useEffect, useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, Bookmark, BookmarkCheck, Check, ChevronRight } from "lucide-react";
import { getLesson, getModule, lessonSequence } from "../content/curriculum";
import LessonRenderer from "../components/lesson/LessonRenderer";
import { useProgressStore } from "../store/progressStore";
import { moduleGradient } from "../lib/moduleTheme";
import { celebrate, bigCelebrate } from "../lib/confetti";

export default function LessonPage() {
  const { moduleId, lessonId } = useParams();
  const found = moduleId && lessonId ? getLesson(moduleId, lessonId) : undefined;

  const completeLesson = useProgressStore((s) => s.completeLesson);
  const isComplete = useProgressStore((s) =>
    lessonId ? s.isLessonComplete(lessonId) : false,
  );
  const completedMap = useProgressStore((s) => s.completedLessons);
  const setLastLesson = useProgressStore((s) => s.setLastLesson);
  const toggleBookmark = useProgressStore((s) => s.toggleBookmark);
  const bookmarked = useProgressStore((s) =>
    lessonId ? s.isBookmarked(lessonId) : false,
  );

  // Remember this as the "continue where you left off" target.
  useEffect(() => {
    if (moduleId && lessonId) setLastLesson(moduleId, lessonId);
  }, [moduleId, lessonId, setLastLesson]);

  const nav = useMemo(() => {
    const seq = lessonSequence();
    const i = seq.findIndex((s) => s.moduleId === moduleId && s.lessonId === lessonId);
    return { prev: seq[i - 1], next: seq[i + 1] };
  }, [moduleId, lessonId]);

  if (!found) {
    return <div className="p-8 text-slate-300">Lesson not found.</div>;
  }
  const { module, lesson } = found;

  const handleComplete = () => {
    completeLesson(lesson.id);
    celebrate();
    // If this was the module's last remaining lesson, throw a bigger party.
    const mod = getModule(module.id);
    if (mod) {
      const remaining = mod.lessons.filter(
        (l) => l.id !== lesson.id && !completedMap[l.id],
      ).length;
      if (remaining === 0) setTimeout(bigCelebrate, 250);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-5 py-10">
      <div className="flex items-center gap-1 text-sm text-slate-400">
        <Link to="/" className="hover:text-white">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <Link to={`/learn/${module.id}`} className="ml-1 hover:text-white">
          {module.icon} {module.title}
        </Link>
        <ChevronRight className="h-4 w-4 text-slate-600" />
        <span className="text-slate-300">{lesson.title}</span>
      </div>

      <div className="mt-3">
        <span
          className="mb-3 block h-1 w-16 rounded-full"
          style={{ background: moduleGradient(module.id) }}
        />
        <div className="flex items-start justify-between gap-3">
          <h1 className="font-display text-3xl font-bold tracking-tight text-white">
            {lesson.title}
          </h1>
          <button
            className="btn-ghost shrink-0"
            onClick={() => toggleBookmark(lesson.id)}
            aria-label={bookmarked ? "Remove bookmark" : "Bookmark this lesson"}
          >
            {bookmarked ? (
              <BookmarkCheck className="h-4 w-4 text-accent-lime" />
            ) : (
              <Bookmark className="h-4 w-4" />
            )}
            <span className="hidden sm:inline">{bookmarked ? "Saved" : "Save"}</span>
          </button>
        </div>
        <p className="mb-7 mt-1 text-slate-400">{lesson.summary}</p>
      </div>

      {/* key forces a fresh mount per lesson so editable code blocks reset. */}
      <LessonRenderer key={lesson.id} lessonId={lesson.id} blocks={lesson.blocks} />

      <div className="mt-9 flex flex-col gap-3 border-t border-white/10 pt-6 sm:flex-row sm:items-center">
        <button
          className={isComplete ? "btn-ghost" : "btn-primary"}
          onClick={handleComplete}
          disabled={isComplete}
        >
          {isComplete ? (
            <>
              <Check className="h-4 w-4" /> Completed
            </>
          ) : (
            "Mark lesson complete (+20 XP)"
          )}
        </button>
        <div className="flex gap-2 sm:ml-auto">
          {nav.prev && (
            <Link
              to={`/learn/${nav.prev.moduleId}/${nav.prev.lessonId}`}
              className="btn-ghost"
            >
              <ArrowLeft className="h-4 w-4" /> Previous
            </Link>
          )}
          {nav.next && (
            <Link
              to={`/learn/${nav.next.moduleId}/${nav.next.lessonId}`}
              className="btn-primary"
            >
              Next <ArrowRight className="h-4 w-4" />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
