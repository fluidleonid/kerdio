import { useEffect } from "react"
import { Routes, Route, useLocation } from "react-router-dom"
import { Sidebar } from "@/widgets/sidebar"
import { TrackerPage } from "@/pages/tracker"
import { JournalPage } from "@/pages/journal"
import { ProjectsPage } from "@/pages/projects"
import { ReportsPage } from "@/pages/reports"
import { NotFoundPage } from "@/pages/not-found"
import { ROUTES } from "@/shared/config"

const PAGE_TITLES: Record<string, string> = {
  [ROUTES.TRACKER]: "Tracker | Kerd",
  [ROUTES.JOURNAL]: "Journal | Kerd",
  [ROUTES.PROJECTS]: "Projects & Billing | Kerd",
  [ROUTES.REPORTS]: "Reports & Value | Kerd",
}

export function AppRouter() {
  const location = useLocation()

  useEffect(() => {
    document.title = PAGE_TITLES[location.pathname] || "Page Not Found | Kerd"
    window.scrollTo({ top: 0, behavior: "instant" })
  }, [location.pathname])

  return (
    <div className="min-h-dvh flex text-foreground antialiased selection:bg-orange-500/30 selection:text-orange-100">
      <a href="#main-content" className="visually-hidden skip-link">
        Skip to main content
      </a>
      <Sidebar />
      <main
        id="main-content"
        tabIndex={-1}
        className="flex-1 min-w-0 pl-0 md:pl-16 pb-[calc(5.25rem+env(safe-area-inset-bottom,0px))] md:pb-0 min-h-dvh flex flex-col outline-none"
      >
        <Routes>
          <Route path={ROUTES.TRACKER} element={<TrackerPage />} />
          <Route path={ROUTES.JOURNAL} element={<JournalPage />} />
          <Route path={ROUTES.PROJECTS} element={<ProjectsPage />} />
          <Route path={ROUTES.REPORTS} element={<ReportsPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
    </div>
  )
}
