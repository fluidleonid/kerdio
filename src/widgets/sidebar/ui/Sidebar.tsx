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
    <aside
      className="fixed top-auto bottom-0 left-0 right-0 z-50 select-none border-t border-white/15 bg-black/85 backdrop-blur-2xl px-2 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom,0px))] md:left-0 md:right-auto md:top-0 md:bottom-0 md:flex md:w-16 md:flex-col md:items-center md:justify-center md:border-none md:bg-transparent md:px-0 md:py-6 md:backdrop-blur-none"
    >
      {/* Single semantic navigation landmark: Bottom Tab Bar on mobile (<768px), Icon Rail on desktop (>=768px) */}
      <nav
        aria-label="Primary"
        className="mx-auto grid max-w-md grid-cols-4 items-center gap-1 md:mx-0 md:flex md:max-w-none md:flex-col md:items-center md:gap-3"
      >
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
                aria-current={isActive ? "page" : undefined}
                aria-label={item.label}
                className={`relative flex min-h-[52px] flex-col items-center justify-center gap-1 rounded-2xl px-2 py-2 transition-all md:h-11 md:w-11 md:min-h-[44px] md:flex-row md:p-0 ${
                  isActive
                    ? "bg-white/20 text-white font-semibold md:scale-105 ring-1 ring-white/25"
                    : "text-[#DCDCDC] hover:bg-white/10 hover:text-white"
                }`}
              >
                {/* Non-color shape indicator for active route (WCAG 1.4.1) */}
                {isActive && (
                  <span
                    aria-hidden="true"
                    className="absolute -top-2 h-0.5 w-8 rounded-full bg-white md:top-1/2 md:-left-2 md:h-5 md:w-1 md:-translate-y-1/2"
                  />
                )}
                <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
                <span className="text-[11px] leading-none tracking-wide md:hidden">
                  {item.label}
                </span>
              </Link>
            </AppTooltip>
          )
        })}
      </nav>
    </aside>
  )
}
