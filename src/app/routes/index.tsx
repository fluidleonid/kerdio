import { Routes, Route } from "react-router-dom"
import { Sidebar } from "@/widgets/sidebar"
import { TrackerPage } from "@/pages/tracker"
import { JournalPage } from "@/pages/journal"
import { ProjectsPage } from "@/pages/projects"
import { ReportsPage } from "@/pages/reports"
import { NotFoundPage } from "@/pages/not-found"
import { ROUTES } from "@/shared/config"

export function AppRouter() {
  return (
    <div className="min-h-screen flex text-foreground antialiased selection:bg-orange-500/30 selection:text-orange-200">
      <Sidebar />
      <main className="flex-1 pl-16 min-h-screen flex flex-col">
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
