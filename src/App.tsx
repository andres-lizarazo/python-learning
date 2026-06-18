import { lazy } from "react";
import { Route, Routes } from "react-router-dom";
import Layout from "./components/layout/Layout";

// Route-level code-splitting: each page (and its heavy deps — react-markdown,
// visualizers, etc.) loads on demand, keeping the initial bundle small.
const Home = lazy(() => import("./pages/Home"));
const ModulePage = lazy(() => import("./pages/ModulePage"));
const LessonPage = lazy(() => import("./pages/LessonPage"));
const Playground = lazy(() => import("./pages/Playground"));
const Profile = lazy(() => import("./pages/Profile"));
const Practice = lazy(() => import("./pages/Practice"));

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="learn/:moduleId" element={<ModulePage />} />
        <Route path="learn/:moduleId/:lessonId" element={<LessonPage />} />
        <Route path="playground" element={<Playground />} />
        <Route path="profile" element={<Profile />} />
        <Route path="practice" element={<Practice />} />
        <Route path="*" element={<Home />} />
      </Route>
    </Routes>
  );
}
