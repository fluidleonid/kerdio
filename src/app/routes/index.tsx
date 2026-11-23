import { useEffect } from "react"
import { Routes, Route } from "react-router-dom"
import { TrackerPage } from "@/pages/tracker"

export function AppRouter() {
  useEffect(() => {
    document.title = "Kerd • Focused Time & Value Tracker"
  }, [])

  return (
    <div className="min-h-dvh flex text-foreground antialiased selection:bg-orange-500/30 selection:text-orange-100">
      <a href="#main-content" className="visually-hidden skip-link">
        Skip to main content
      </a>
      <main
        id="main-content"
        tabIndex={-1}
        className="flex-1 min-w-0 min-h-dvh flex flex-col outline-none"
      >
        <Routes>
          <Route path="*" element={<TrackerPage />} />
        </Routes>
      </main>
    </div>
  )
}
