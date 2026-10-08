import { useEffect } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { Timer, Calendar, FolderGit2, TrendingUp } from "lucide-react"
import { ROUTES } from "@/shared/config"
import { AppTooltip } from "@/shared/ui"

interface NavItem {
  label: string
  shortcut: string
  path: string
  icon: typeof Timer
}

export function Sidebar() {
  const location = useLocation()
  const navigate = useNavigate()

  const navItems: NavItem[] = [
    { label: "Tracker", shortcut: "⇧1", path: ROUTES.TRACKER, icon: Timer },
    { label: "Journal", shortcut: "⇧2", path: ROUTES.JOURNAL, icon: Calendar },
    { label: "Projects", shortcut: "⇧3", path: ROUTES.PROJECTS, icon: FolderGit2 },
    { label: "Reports", shortcut: "⇧4", path: ROUTES.REPORTS, icon: TrendingUp },
  ]

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Must have Shift pressed
      if (!e.shiftKey) return
      // Ignore if Cmd, Ctrl, or Alt are held
      if (e.metaKey || e.ctrlKey || e.altKey) return

      // Do not intercept if user is typing in an input, textarea, or contentEditable
      const target = e.target as HTMLElement | null
      const isInput =
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable)

      if (isInput) return

      let targetPath: string | null = null

      if (
        e.code === "Digit1" ||
        e.code === "Numpad1" ||
        e.key === "1" ||
        e.key === "!"
      ) {
        targetPath = ROUTES.TRACKER
      } else if (
        e.code === "Digit2" ||
        e.code === "Numpad2" ||
        e.key === "2" ||
        e.key === "@" ||
        e.key === '"'
      ) {
        targetPath = ROUTES.JOURNAL
      } else if (
        e.code === "Digit3" ||
        e.code === "Numpad3" ||
        e.key === "3" ||
        e.key === "#" ||
        e.key === "№"
      ) {
        targetPath = ROUTES.PROJECTS
      } else if (
        e.code === "Digit4" ||
        e.code === "Numpad4" ||
        e.key === "4" ||
        e.key === "$" ||
        e.key === ";"
      ) {
        targetPath = ROUTES.REPORTS
      }

      if (targetPath) {
        e.preventDefault()
        navigate(targetPath)
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [navigate])

  return (
    <aside className="fixed left-0 top-0 bottom-0 z-50 flex w-16 flex-col items-center justify-center py-6 select-none bg-transparent border-none">
      {/* Navigation Icons Stack - No background, no borders, no logo, no theme switcher */}
      <nav className="flex flex-col items-center gap-3">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = location.pathname === item.path

          return (
            <AppTooltip
              key={item.path}
              content={item.label}
              shortcut={item.shortcut}
              side="right"
              sideOffset={12}
            >
              <Link
                to={item.path}
                className={`flex h-11 w-11 items-center justify-center rounded-2xl transition-all ${
                  isActive
                    ? "bg-white/20 text-white scale-105"
                    : "text-[#806060] hover:bg-white/10 hover:text-white"
                }`}
              >
                <Icon className="h-5 w-5" />
              </Link>
            </AppTooltip>
          )
        })}
      </nav>
    </aside>
  )
}
