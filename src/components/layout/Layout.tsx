import { Suspense, useEffect, useRef, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import Aurora from "../ui/Aurora";
import CommandPalette from "../ui/CommandPalette";
import LevelUpToast from "../ui/LevelUpToast";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";
import { useProgressStore } from "../../store/progressStore";
import { levelFromXp } from "../../lib/level";
import { bigCelebrate } from "../../lib/confetti";

export default function Layout() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const mainRef = useRef<HTMLElement>(null);

  // Move focus to the main region on navigation (screen-reader / keyboard friendly).
  useEffect(() => {
    mainRef.current?.focus();
  }, [location.pathname]);

  // Watch for level-ups (XP crossing a threshold) and celebrate once.
  const xp = useProgressStore((s) => s.xp);
  const prevLevel = useRef(levelFromXp(xp));
  const [levelUp, setLevelUp] = useState<number | null>(null);
  useEffect(() => {
    const lvl = levelFromXp(xp);
    if (lvl > prevLevel.current) {
      setLevelUp(lvl);
      bigCelebrate();
      const t = setTimeout(() => setLevelUp(null), 3200);
      prevLevel.current = lvl;
      return () => clearTimeout(t);
    }
    prevLevel.current = lvl;
  }, [xp]);

  return (
    <div className="relative flex h-full flex-col">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-3 focus:top-3 focus:z-50 focus:rounded-lg focus:bg-accent-violet focus:px-3 focus:py-2 focus:text-sm focus:text-white"
      >
        Skip to content
      </a>
      <Aurora />
      <CommandPalette />
      <TopBar onToggleSidebar={() => setOpen((o) => !o)} />

      <AnimatePresence>
        {levelUp !== null && <LevelUpToast key={levelUp} level={levelUp} />}
      </AnimatePresence>

      <div className="relative z-10 flex min-h-0 flex-1">
        {/* Desktop sidebar */}
        <aside className="hidden w-72 shrink-0 md:block">
          <Sidebar />
        </aside>

        {/* Mobile drawer */}
        <AnimatePresence>
          {open && (
            <div className="fixed inset-0 z-30 md:hidden">
              <motion.div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setOpen(false)}
              />
              <motion.aside
                className="absolute left-0 top-0 h-full w-72"
                initial={{ x: -300 }}
                animate={{ x: 0 }}
                exit={{ x: -300 }}
                transition={{ type: "spring", stiffness: 320, damping: 32 }}
              >
                <Sidebar onNavigate={() => setOpen(false)} />
              </motion.aside>
            </div>
          )}
        </AnimatePresence>

        <main
          id="main"
          ref={mainRef}
          tabIndex={-1}
          className="min-w-0 flex-1 overflow-y-auto outline-none"
        >
          {/* Subtle page transition keyed on the route. */}
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
            >
              <Suspense
                fallback={
                  <div className="grid place-items-center py-32 text-slate-400">
                    <Loader2 className="h-6 w-6 animate-spin text-accent-violet" />
                  </div>
                }
              >
                <Outlet />
              </Suspense>
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
