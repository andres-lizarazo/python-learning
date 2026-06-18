import { Link } from "react-router-dom";
import { Menu, Search, Sparkles, Target } from "lucide-react";
import { useProgressStore } from "../../store/progressStore";
import { usePyodideStore } from "../../store/pyodideStore";
import Logo from "../ui/Logo";
import XPBar from "../ui/XPBar";
import StreakFlame from "../ui/StreakFlame";

export default function TopBar({ onToggleSidebar }: { onToggleSidebar: () => void }) {
  const xp = useProgressStore((s) => s.xp);
  const streak = useProgressStore((s) => s.streakDays);
  const { ready, booting, status } = usePyodideStore();

  return (
    <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-white/10 bg-ink-900/60 px-4 py-2.5 backdrop-blur-xl">
      <button
        className="btn-ghost px-2 md:hidden"
        onClick={onToggleSidebar}
        aria-label="Toggle menu"
      >
        <Menu className="h-5 w-5" />
      </button>
      <Logo />

      <button
        className="ml-4 hidden items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-400 transition-colors hover:border-white/20 hover:text-slate-200 lg:flex"
        onClick={() => window.dispatchEvent(new Event("pylearn:open-command"))}
        aria-label="Open search"
      >
        <Search className="h-3.5 w-3.5" />
        Search…
        <kbd className="pill border-white/10 bg-white/5 text-[10px]">⌘K</kbd>
      </button>

      <div className="ml-auto flex items-center gap-2 text-sm">
        <span
          className="hidden items-center gap-1.5 pill border-white/10 bg-white/5 text-slate-300 sm:inline-flex"
          title="Python interpreter status"
        >
          <span
            className={`inline-block h-2 w-2 rounded-full ${
              ready
                ? "bg-accent-lime shadow-[0_0_8px_2px_rgba(163,230,53,0.6)]"
                : booting
                  ? "animate-pulse bg-accent-cyan"
                  : "bg-slate-500"
            }`}
          />
          {ready ? "Python ready" : booting ? status : "Python idle"}
        </span>
        <Link
          to="/profile"
          className="flex items-center gap-2 rounded-xl px-1 transition-opacity hover:opacity-80"
          title="View your profile & achievements"
        >
          <StreakFlame days={streak} />
          <XPBar xp={xp} />
        </Link>
        <Link to="/practice" className="btn-ghost hidden md:inline-flex">
          <Target className="h-4 w-4 text-accent-lime" />
          Practice
        </Link>
        <Link to="/playground" className="btn-ghost hidden sm:inline-flex">
          <Sparkles className="h-4 w-4 text-accent-cyan" />
          Playground
        </Link>
      </div>
    </header>
  );
}
