import { useEffect, useState, useMemo } from "react"
import {
  Play,
  Pause,
  Square,
  RotateCcw,
  Sparkles,
} from "lucide-react"
import { useTrackerStore } from "@/entities/tracker"
import { Chronograph } from "@/features/chronograph"
import { TokenCommandInput } from "@/features/tracker-command-bar"
import { AppTooltip, ProjectBadge, BillingBadge } from "@/shared/ui"
import { capitalizeMemo } from "@/shared/lib"

export function TrackerView() {
  const {
    timer,
    projects,
    tick,
    pauseTracking,
    resumeTracking,
    stopAndSaveSession,
    discardTracking,
    updateActiveSessionInfo,
  } = useTrackerStore()

  const [isEditingHeader, setIsEditingHeader] = useState(false)
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

  // Keyboard shortcut listener (Space = pause/resume, Cmd/Ctrl + Enter = save, Esc = discard)
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
              setSaveToast(`Saved to Journal: ${saved.memo}`)
              setTimeout(() => setSaveToast(null), 3000)
            }
          }
        }
        return
      }

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
            setSaveToast(`Saved to Journal: ${saved.memo}`)
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
  }, [timer.status, pauseTracking, resumeTracking, stopAndSaveSession, discardTracking])

  const handleSaveSession = () => {
    const saved = stopAndSaveSession()
    if (saved) {
      setSaveToast(`Saved: $${saved.earnedAmount.toFixed(2)} to Journal`)
      setTimeout(() => setSaveToast(null), 3500)
    }
  }

  const activeProject = useMemo(() => {
    return projects.find((p) => p.id === timer.projectId) || projects[0]
  }, [projects, timer.projectId])

  const isTracking = timer.status !== "idle"

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center select-none overflow-hidden">
      {/* Toast notification on save */}
      {saveToast && (
        <div className="fixed top-8 z-50 animate-in fade-in slide-in-from-top-4 flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-black/60 shadow-2xl shadow-black/80 text-sm font-medium text-white backdrop-blur-3xl border-none">
          <Sparkles className="h-4 w-4 text-orange-400" />
          <span>{saveToast}</span>
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
            /* HEADER WITHOUT BACKGROUND ("без бэкграунда"), TRANSFORMS INTO INPUT ON CLICK */
            <AppTooltip content="Click to edit session" side="bottom">
              <div
                onClick={() => setIsEditingHeader(true)}
                className="fixed top-5 left-1/2 -translate-x-1/2 z-40 flex items-center justify-center gap-2.5 px-3 py-1 cursor-pointer max-w-[90vw] group hover:opacity-90 transition-all active:scale-[0.98]"
              >
                {/* Memo text (14px font-medium text-white, no container background) */}
                <span className="text-sm font-medium text-white group-hover:text-amber-100 transition-colors truncate max-w-[280px]">
                  {capitalizeMemo(timer.memo) || "What are you working on?"}
                </span>

                {/* Project Tag */}
                {activeProject && (
                  <ProjectBadge
                    project={activeProject}
                    showAtPrefix={true}
                  />
                )}

                {/* Billing Tag */}
                <BillingBadge
                  billingType={timer.billingType}
                  amount={
                    timer.billingType === "hourly"
                      ? timer.rate
                      : timer.fixedBudget
                  }
                />
              </div>
            </AppTooltip>
          )}

          {/* MAIN TIMER IN EXACT PHYSICAL CENTER OF SCREEN */}
          <div className="relative flex items-center justify-center animate-in fade-in zoom-in-95 duration-700">
            {/* THE CHRONOGRAPH */}
            <Chronograph size={380} />

            {/* CONTROLS PANEL: POSITIONED BENEATH THE DIAL WITHOUT OFFSETTING DIAL CENTER */}
            <div className="absolute top-full mt-7 left-1/2 -translate-x-1/2 flex items-center justify-center gap-4">
              {/* 1. Pause / Resume icon button (GHOST) */}
              <AppTooltip
                content={timer.status === "running" ? "Pause" : "Resume"}
                shortcut="Space"
                side="bottom"
              >
                <button
                  type="button"
                  onClick={timer.status === "running" ? pauseTracking : resumeTracking}
                  className="flex h-11 w-11 items-center justify-center rounded-full bg-transparent text-white/80 hover:text-white hover:bg-white/10 transition-all active:scale-95 border-none shadow-none cursor-pointer"
                >
                  {timer.status === "running" ? (
                    <Pause className="h-5 w-5" />
                  ) : (
                    <Play className="h-5 w-5 fill-current ml-0.5" />
                  )}
                </button>
              </AppTooltip>

              {/* 2. Save Session icon button (MONOCHROMATIC, NO COLOR SEPARATION) */}
              <AppTooltip content="Save session" shortcut="⌘↵" side="bottom">
                <button
                  type="button"
                  onClick={handleSaveSession}
                  className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-all active:scale-95 border-none shadow-none cursor-pointer"
                >
                  <Square className="h-4.5 w-4.5 fill-current" />
                </button>
              </AppTooltip>

              {/* 3. Reset Session icon button (GHOST) */}
              <AppTooltip content="Reset session" shortcut="Esc" side="bottom">
                <button
                  type="button"
                  onClick={discardTracking}
                  className="flex h-11 w-11 items-center justify-center rounded-full bg-transparent text-white/80 hover:text-white hover:bg-white/10 transition-all active:scale-95 border-none shadow-none cursor-pointer"
                >
                  <RotateCcw className="h-5 w-5" />
                </button>
              </AppTooltip>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
