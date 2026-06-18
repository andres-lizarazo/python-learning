import { useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { getLesson, lessonSequence } from "../content/curriculum";
import LessonRenderer from "../components/lesson/LessonRenderer";
import { useProgressStore } from "../store/progressStore";

export default function LessonPage() {
  const { moduleId, lessonId } = useParams();
  const found = moduleId && lessonId ? getLesson(moduleId, lessonId) : undefined;

  const completeLesson = useProgressStore((s) => s.completeLesson);
  const isComplete = useProgressStore((s) =>
    lessonId ? s.isLessonComplete(lessonId) : false,
  );

  const nav = useMemo(() => {
    const seq = lessonSequence();
    const i = seq.findIndex((s) => s.moduleId === moduleId && s.lessonId === lessonId);
    return { prev: seq[i - 1], next: seq[i + 1] };
  }, [moduleId, lessonId]);

  if (!found) {
    return <div className="p-8 text-slate-300">Lesson not found.</div>;
  }
  const { module, lesson } = found;

  return (
    <div className="mx-auto max-w-3xl px-5 py-8">
      <div className="flex items-center gap-2 text-sm text-slate-400">
        <Link to={`/learn/${module.id}`} className="hover:text-brand">
          {module.icon} {module.title}
        </Link>
        <span>/</span>
        <span className="text-slate-300">{lesson.title}</span>
      </div>

      <h1 className="mt-2 text-2xl font-bold text-white">{lesson.title}</h1>
      <p className="mb-6 text-slate-400">{lesson.summary}</p>

      {/* key forces a fresh mount per lesson so editable code blocks reset
          (otherwise React reuses component instances across route changes). */}
      <LessonRenderer key={lesson.id} lessonId={lesson.id} blocks={lesson.blocks} />

      <div className="mt-8 flex flex-col gap-3 border-t border-ink-600/60 pt-5 sm:flex-row sm:items-center">
        <button
          className={isComplete ? "btn-ghost" : "btn-primary"}
          onClick={() => completeLesson(lesson.id)}
          disabled={isComplete}
        >
          {isComplete ? "✓ Completed" : "Mark lesson complete (+20 XP)"}
        </button>
        <div className="flex gap-2 sm:ml-auto">
          {nav.prev && (
            <Link
              to={`/learn/${nav.prev.moduleId}/${nav.prev.lessonId}`}
              className="btn-ghost"
            >
              ← Previous
            </Link>
          )}
          {nav.next && (
            <Link
              to={`/learn/${nav.next.moduleId}/${nav.next.lessonId}`}
              className="btn-primary"
            >
              Next →
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
