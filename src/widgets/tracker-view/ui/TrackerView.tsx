import { useEffect, useState, useMemo } from "react"
import {
  Play,
  Pause,
  Square,
  RotateCcw,
  Sparkles,
  Flag,
  ListChecks,
} from "lucide-react"
import { useTrackerStore } from "@/entities/tracker"
import { Chronograph } from "@/features/chronograph"
import { TokenCommandInput } from "@/features/tracker-command-bar"
import { TodayLogDrawer } from "@/widgets/today-log"
import { AppTooltip, ProjectBadge, BillingBadge } from "@/shared/ui"
import { capitalizeMemo } from "@/shared/lib"

function formatCompactDuration(seconds: number): string {
  const mins = Math.max(1, Math.round(seconds / 60))
  const h = Math.floor(mins / 60)
  const m = mins % 60
  if (h === 0) return `${m}m`
  if (m === 0) return `${h}h`
  return `${h}h ${m}m`
}

export function TrackerView() {
  const {
    timer,
    projects,
    sessions,
    tick,
    pauseTracking,
    resumeTracking,
    stopAndSaveSession,
    discardTracking,
    updateActiveSessionInfo,
  } = useTrackerStore()

  const [isEditingHeader, setIsEditingHeader] = useState(false)
  const [isLogOpen, setIsLogOpen] = useState(false)
  const [saveToast, setSaveToast] = useState<string | null>(null)

  // Precision 1-second interval timer tick
  useEffect(() => {
    if (timer.status !== "running") return

    tick()
    const interval = setInterval(() => {
      tick()
    }, 1000)

    return () => clearInterval(interval)
  }, [timer.status, tick])

  // Keyboard shortcuts (Space = pause/resume, Cmd/Ctrl + Enter = save, Esc = discard, L = toggle Today's Log)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement
      const isInput =
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable

      if (isInput) {
        if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
          e.preventDefault()
          if (timer.status !== "idle") {
            const saved = stopAndSaveSession()
            if (saved) {
              setSaveToast(`Saved to Today's Log: ${saved.memo}`)
              setTimeout(() => setSaveToast(null), 3000)
            }
          }
        }
        return
      }

      // Toggle Today's Log drawer with L
      if ((e.key === "l" || e.key === "L") && !e.metaKey && !e.ctrlKey && !e.altKey) {
        e.preventDefault()
        setIsLogOpen((prev) => !prev)
        return
      }

      // Do not trigger timer shortcuts while log drawer is open
      if (isLogOpen) return

      // Space -> Toggle Pause / Resume
      if (e.code === "Space") {
        e.preventDefault()
        if (timer.status === "running") {
          pauseTracking()
        } else if (timer.status === "paused") {
          resumeTracking()
        }
      }

      // Cmd+Enter or Ctrl+Enter -> Save and Reset
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        e.preventDefault()
        if (timer.status !== "idle") {
          const saved = stopAndSaveSession()
          if (saved) {
            setSaveToast(`Saved to Today's Log: ${saved.memo}`)
            setTimeout(() => setSaveToast(null), 3000)
          }
        }
      }

      // Escape -> Discard
      if (e.key === "Escape" && timer.status !== "idle") {
        e.preventDefault()
        discardTracking()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [
    timer.status,
    isLogOpen,
    pauseTracking,
    resumeTracking,
    stopAndSaveSession,
    discardTracking,
  ])

  const handleSaveSession = () => {
    const saved = stopAndSaveSession()
    if (saved) {
      setSaveToast(
        saved.earnedAmount > 0
          ? `Saved: $${saved.earnedAmount.toFixed(2)} to Today's Log`
          : `Saved to Today's Log: ${saved.memo}`
      )
      setTimeout(() => setSaveToast(null), 3500)
    }
  }

  const activeProject = useMemo(() => {
    return projects.find((p) => p.id === timer.projectId) || projects[0]
  }, [projects, timer.projectId])

  // Today's quick summary for the single floating log pill
  const todayQuickStats = useMemo(() => {
    const start = new Date()
    start.setHours(0, 0, 0, 0)
    const end = new Date()
    end.setHours(23, 59, 59, 999)

    const todayList = sessions.filter(
      (s) => s.startTime >= start.getTime() && s.startTime <= end.getTime()
    )
    const totalSeconds = todayList.reduce((acc, s) => acc + s.durationSeconds, 0)

    let totalValue = 0
    const countedMilestones = new Set<string>()
    const countedFixed = new Set<string>()

    for (const s of todayList) {
      if (s.billingType === "milestone" || s.milestoneId || s.milestoneName) {
        const key = `${s.projectId}:${s.milestoneId || s.milestoneName}`
        if (!countedMilestones.has(key)) {
          countedMilestones.add(key)
          const proj = projects.find((p) => p.id === s.projectId)
          const msObj = proj?.milestones?.find(
            (m) => m.id === s.milestoneId || m.name === s.milestoneName
          )
          totalValue += msObj?.amount ?? s.earnedAmount ?? 0
        }
      } else if (s.billingType === "fixed") {
        if (!countedFixed.has(s.projectId)) {
          countedFixed.add(s.projectId)
          totalValue += s.earnedAmount
        }
      } else if (s.billingType === "hourly") {
        totalValue += s.earnedAmount
      }
    }

    return {
      count: todayList.length,
      time: totalSeconds > 0 ? formatCompactDuration(totalSeconds) : null,
      value: totalValue,
    }
  }, [sessions, projects])

  const isTracking = timer.status !== "idle"

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center select-none overflow-hidden pb-16 sm:pb-0">
      <h1 className="visually-hidden">Kerd Time Tracker</h1>

      {/* Toast notification on save */}
      {saveToast && (
        <div
          role="status"
          aria-live="polite"
          className="fixed top-6 z-50 animate-in fade-in slide-in-from-top-4 flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-black/75 shadow-2xl shadow-black/80 text-sm font-medium text-white backdrop-blur-3xl border-none max-w-[90vw]"
        >
          <Sparkles className="h-4 w-4 text-[#E8D5CE] shrink-0" aria-hidden="true" />
          <span className="truncate">{saveToast}</span>
        </div>
      )}

      {/* 1. IDLE MODE: ONLY THE TWO-ROW BORDERLESS INPUT, PERFECTLY CENTERED */}
      {!isTracking ? (
        <div className="w-full max-w-xl px-4 flex flex-col items-center animate-in fade-in zoom-in-95 duration-500">
          <TokenCommandInput autoFocus={true} />
        </div>
      ) : (
        /* 2. TRACKING MODE: TOP BAR 20PX FROM TOP EDGE + CHRONOGRAPH + CONTROLS */
        <>
          {/* HEADER 20PX FROM TOP OF SCREEN */}
          {isEditingHeader ? (
            <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 w-full max-w-xl px-4 animate-in fade-in zoom-in-95 duration-200">
              <TokenCommandInput
                isEditingActive={true}
                initialMemo={timer.memo}
                initialProjectId={timer.projectId}
                initialBilling={
                  timer.billingType === "hourly"
                    ? { type: "hourly", amount: timer.rate || 0 }
                    : timer.billingType === "fixed"
                    ? { type: "fixed", amount: timer.fixedBudget || 0 }
                    : timer.billingType === "milestone"
                    ? { type: "milestone", amount: timer.fixedBudget || 0 }
                    : { type: "none", amount: 0 }
                }
                onSaveActive={(params) => {
                  updateActiveSessionInfo(params)
                  setIsEditingHeader(false)
                }}
                onClose={() => setIsEditingHeader(false)}
                autoFocus={true}
              />
            </div>
          ) : (
            /* HEADER WITHOUT BACKGROUND, TRANSFORMS INTO INPUT ON CLICK */
            <AppTooltip content="Click to edit session" side="bottom">
              <button
                type="button"
                onClick={() => setIsEditingHeader(true)}
                aria-label="Edit active session details"
                className="fixed top-5 left-1/2 -translate-x-1/2 z-40 flex flex-wrap items-center justify-center gap-2 px-3 py-1.5 rounded-2xl cursor-pointer max-w-[92vw] group hover:opacity-90 transition-all active:scale-[0.98] bg-transparent border-none"
              >
                <span className="text-sm font-medium text-white group-hover:text-amber-100 transition-colors truncate max-w-[200px] sm:max-w-[280px]">
                  {capitalizeMemo(timer.memo) || "What are you working on?"}
                </span>

                {activeProject && (
                  <ProjectBadge project={activeProject} showAtPrefix={true} />
                )}

                {timer.milestoneName && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-white/10 text-white">
                    <Flag className="h-3.5 w-3.5 text-[#E8D5CE]" aria-hidden="true" />
                    <span>{timer.milestoneName}</span>
                  </span>
                )}

                <BillingBadge
                  billingType={timer.billingType}
                  amount={
                    timer.billingType === "hourly"
                      ? timer.rate
                      : timer.fixedBudget
                  }
                />
              </button>
            </AppTooltip>
          )}

          {/* MAIN TIMER IN EXACT PHYSICAL CENTER OF SCREEN */}
          <div className="relative flex items-center justify-center animate-in fade-in zoom-in-95 duration-700">
            <Chronograph size={380} />

            {/* CONTROLS PANEL: POSITIONED BENEATH THE DIAL WITHOUT OFFSETTING DIAL CENTER */}
            <div className="absolute top-full mt-5 sm:mt-7 left-1/2 -translate-x-1/2 flex items-center justify-center gap-4">
              <AppTooltip
                content={timer.status === "running" ? "Pause" : "Resume"}
                shortcut="Space"
                side="bottom"
              >
                <button
                  type="button"
                  aria-label={timer.status === "running" ? "Pause session" : "Resume session"}
                  onClick={timer.status === "running" ? pauseTracking : resumeTracking}
                  className="flex h-11 w-11 items-center justify-center rounded-full bg-transparent text-white/90 hover:text-white hover:bg-white/10 transition-all active:scale-95 border-none shadow-none cursor-pointer"
                >
                  {timer.status === "running" ? (
                    <Pause className="h-5 w-5" aria-hidden="true" />
                  ) : (
                    <Play className="h-5 w-5 fill-current ml-0.5" aria-hidden="true" />
                  )}
                </button>
              </AppTooltip>

              <AppTooltip content="Save session" shortcut="⌘↵" side="bottom">
                <button
                  type="button"
                  aria-label="Save session"
                  onClick={handleSaveSession}
                  className="flex h-11 w-11 items-center justify-center rounded-full bg-white/15 text-white hover:bg-white/25 transition-all active:scale-95 border-none shadow-none cursor-pointer"
                >
                  <Square className="h-4.5 w-4.5 fill-current" aria-hidden="true" />
                </button>
              </AppTooltip>

              <AppTooltip content="Reset session" shortcut="Esc" side="bottom">
                <button
                  type="button"
                  aria-label="Reset session"
                  onClick={discardTracking}
                  className="flex h-11 w-11 items-center justify-center rounded-full bg-transparent text-white/90 hover:text-white hover:bg-white/10 transition-all active:scale-95 border-none shadow-none cursor-pointer"
                >
                  <RotateCcw className="h-5 w-5" aria-hidden="true" />
                </button>
              </AppTooltip>
            </div>
          </div>
        </>
      )}

      {/* SINGLE FLOATING TRIGGER FOR TODAY'S LOG & EXPORT */}
      <div className="fixed bottom-[max(1.25rem,env(safe-area-inset-bottom,0px))] left-1/2 -translate-x-1/2 z-40">
        <AppTooltip content="Open today's log & export" shortcut="L" side="top">
          <button
            type="button"
            onClick={() => setIsLogOpen(true)}
            aria-label={
              todayQuickStats.count > 0
                ? `Open today's log: ${todayQuickStats.count} sessions, ${todayQuickStats.time}, $${todayQuickStats.value.toFixed(0)}`
                : "Open today's log"
            }
            className="flex min-h-[44px] items-center gap-2.5 rounded-full bg-black/55 hover:bg-black/70 px-4 py-2 text-xs sm:text-sm font-medium text-white backdrop-blur-2xl shadow-[0_12px_32px_rgba(0,0,0,0.4)] transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer whitespace-nowrap"
          >
            <ListChecks className="h-4 w-4 text-[#E8D5CE] shrink-0" aria-hidden="true" />
            <span>Today&apos;s Log</span>
            {todayQuickStats.count > 0 && (
              <>
                <span aria-hidden="true" className="h-3.5 w-px bg-white/20" />
                <span className="font-mono text-[#E8D5CE] tabular-nums">
                  {todayQuickStats.time}
                  {todayQuickStats.value > 0 ? ` · $${todayQuickStats.value.toFixed(0)}` : ""}
                </span>
              </>
            )}
          </button>
        </AppTooltip>
      </div>

      {/* TODAY'S LOG & EXPORT SHEET */}
      <TodayLogDrawer isOpen={isLogOpen} onClose={() => setIsLogOpen(false)} />
    </div>
  )
}
