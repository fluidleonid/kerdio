import { useEffect, useMemo, useState } from "react"
import {
  X,
  Copy,
  Check,
  FileSpreadsheet,
  Flag,
  Trash2,
  Clock,
  DollarSign,
  Layers,
} from "lucide-react"
import { useTrackerStore } from "@/entities/tracker"
import { Button } from "@/shared/ui"
import { capitalizeMemo } from "@/shared/lib"

interface TodayLogDrawerProps {
  isOpen: boolean
  onClose: () => void
}

function formatDuration(seconds: number): string {
  const totalMins = Math.max(1, Math.round(seconds / 60))
  const h = Math.floor(totalMins / 60)
  const m = totalMins % 60
  if (h === 0) return `${m}m`
  if (m === 0) return `${h}h`
  return `${h}h ${m}m`
}

function format24h(timestamp: number): string {
  const d = new Date(timestamp)
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`
}

export function TodayLogDrawer({ isOpen, onClose }: TodayLogDrawerProps) {
  const { sessions, projects, deleteSession } = useTrackerStore()
  const [copied, setCopied] = useState(false)

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault()
        onClose()
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isOpen, onClose])

  // Filter strictly to today's sessions (newest first)
  const todaySessions = useMemo(() => {
    const start = new Date()
    start.setHours(0, 0, 0, 0)
    const end = new Date()
    end.setHours(23, 59, 59, 999)

    return sessions
      .filter((s) => s.startTime >= start.getTime() && s.startTime <= end.getTime())
      .sort((a, b) => b.startTime - a.startTime)
  }, [sessions])

  // Roll up milestones tracked today (sum time, count sessions, show payout & effective rate)
  const milestoneRollups = useMemo(() => {
    const map = new Map<
      string,
      {
        key: string
        name: string
        projectName: string
        projectColor: string
        totalSeconds: number
        sessionCount: number
        payout: number
        currency: string
      }
    >()

    for (const s of todaySessions) {
      if (!s.milestoneName && !s.milestoneId) continue
      const project = projects.find((p) => p.id === s.projectId)
      const msObj = project?.milestones?.find(
        (m) => m.id === s.milestoneId || m.name === s.milestoneName
      )
      const msName = msObj?.name || s.milestoneName || "Milestone"
      const key = `${s.projectId}:${msObj?.id || msName.toLowerCase()}`

      const existing = map.get(key)
      if (existing) {
        existing.totalSeconds += s.durationSeconds
        existing.sessionCount += 1
      } else {
        map.set(key, {
          key,
          name: msName,
          projectName: project?.name || "Project",
          projectColor: project?.color || "#F97316",
          totalSeconds: s.durationSeconds,
          sessionCount: 1,
          payout: msObj?.amount ?? s.earnedAmount ?? project?.fixedBudget ?? 0,
          currency: s.currency || project?.currency || "$",
        })
      }
    }

    return Array.from(map.values())
  }, [todaySessions, projects])

  // Overall today stats (sum hourly earned + unique milestone/fixed payouts tracked today)
  const todayStats = useMemo(() => {
    const totalSeconds = todaySessions.reduce((acc, s) => acc + s.durationSeconds, 0)

    // Sum hourly sessions directly; avoid double-counting same milestone payout across multiple blocks
    let totalValue = 0
    const countedMilestones = new Set<string>()
    const countedFixedProjects = new Set<string>()

    for (const s of todaySessions) {
      if (s.billingType === "milestone" || s.milestoneId || s.milestoneName) {
        const msKey = `${s.projectId}:${s.milestoneId || s.milestoneName}`
        if (!countedMilestones.has(msKey)) {
          countedMilestones.add(msKey)
          const proj = projects.find((p) => p.id === s.projectId)
          const msObj = proj?.milestones?.find(
            (m) => m.id === s.milestoneId || m.name === s.milestoneName
          )
          totalValue += msObj?.amount ?? s.earnedAmount ?? 0
        }
      } else if (s.billingType === "fixed") {
        if (!countedFixedProjects.has(s.projectId)) {
          countedFixedProjects.add(s.projectId)
          totalValue += s.earnedAmount
        }
      } else if (s.billingType === "hourly") {
        totalValue += s.earnedAmount
      }
    }

    return {
      totalSeconds,
      formattedTime: totalSeconds > 0 ? formatDuration(totalSeconds) : "0m",
      totalValue: totalValue.toFixed(2),
      count: todaySessions.length,
    }
  }, [todaySessions, projects])

  const todayLabel = useMemo(() => {
    return new Date().toLocaleDateString("en-US", {
      weekday: "long",
      month: "short",
      day: "numeric",
    })
  }, [])

  const handleCopySummary = async () => {
    if (todaySessions.length === 0) return

    const lines = [
      `Kerd — Daily Log (${todayLabel})`,
      `==================================`,
      `Total Time: ${todayStats.formattedTime}`,
      `Total Value: $${todayStats.totalValue}`,
      `Sessions: ${todayStats.count}`,
    ]

    if (milestoneRollups.length > 0) {
      lines.push(``, `Milestones Summary:`)
      for (const m of milestoneRollups) {
        const hours = m.totalSeconds / 3600
        const effRate = hours > 0 && m.payout > 0 ? ` (~${m.currency}${Math.round(m.payout / hours)}/h)` : ""
        lines.push(
          `• ${m.name} (@${m.projectName}): ${formatDuration(m.totalSeconds)} across ${m.sessionCount} ${
            m.sessionCount === 1 ? "session" : "sessions"
          } — ${m.currency}${m.payout}${effRate}`
        )
      }
    }

    lines.push(``, `Sessions:`)
    for (const s of [...todaySessions].reverse()) {
      const proj = projects.find((p) => p.id === s.projectId)
      const end = s.endTime || s.startTime + s.durationSeconds * 1000
      const msPart = s.milestoneName ? ` [${s.milestoneName}]` : ""
      const valuePart =
        s.billingType === "hourly" && s.earnedAmount > 0
          ? ` (+$${s.earnedAmount.toFixed(2)})`
          : s.earnedAmount === 0
          ? " (Focus)"
          : ""
      lines.push(
        `• ${format24h(s.startTime)}–${format24h(end)} | @${proj?.name || "Project"}${msPart} — ${capitalizeMemo(
          s.memo
        )} (${formatDuration(s.durationSeconds)})${valuePart}`
      )
    }

    await navigator.clipboard.writeText(lines.join("\n"))
    setCopied(true)
    setTimeout(() => setCopied(false), 2200)
  }

  const handleExportCsv = () => {
    if (todaySessions.length === 0) return

    const headers = [
      "Date",
      "Start",
      "End",
      "Project",
      "Milestone",
      "Memo",
      "Duration (min)",
      "Billing",
      "Rate ($/h)",
      "Earned ($)",
    ]

    const rows = [...todaySessions].reverse().map((s) => {
      const proj = projects.find((p) => p.id === s.projectId)
      const dateStr = new Date(s.startTime).toLocaleDateString("en-US")
      const end = s.endTime || s.startTime + s.durationSeconds * 1000
      const mins = Math.max(1, Math.round(s.durationSeconds / 60))
      return [
        `"${dateStr}"`,
        `"${format24h(s.startTime)}"`,
        `"${format24h(end)}"`,
        `"${proj?.name || s.projectId}"`,
        `"${(s.milestoneName || "").replace(/"/g, '""')}"`,
        `"${capitalizeMemo(s.memo).replace(/"/g, '""')}"`,
        mins,
        `"${s.billingType}"`,
        s.rateSnapshot || 0,
        s.earnedAmount.toFixed(2),
      ].join(",")
    })

    const csvContent = "\uFEFF" + [headers.join(","), ...rows].join("\n")
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `kerd_today_${new Date().toISOString().slice(0, 10)}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  if (!isOpen) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="today-log-title"
      className="fixed inset-0 z-50 flex items-end sm:items-stretch sm:justify-end glass-overlay animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-h-[86dvh] sm:max-h-[calc(100dvh-2rem)] sm:my-4 sm:mr-4 sm:max-w-[460px] flex flex-col overflow-hidden rounded-t-3xl sm:rounded-3xl bg-black/75 backdrop-blur-3xl shadow-[0_24px_64px_rgba(0,0,0,0.55)] border-t border-white/15 sm:border animate-in slide-in-from-bottom-6 sm:slide-in-from-right-6 duration-250"
      >
        {/* Mobile Sheet Drag Handle */}
        <div aria-hidden="true" className="flex justify-center pt-3 pb-1 sm:hidden">
          <span className="h-1 w-10 rounded-full bg-white/25" />
        </div>

        {/* Header */}
        <div className="flex items-start justify-between gap-3 px-5 sm:px-6 pt-3 sm:pt-6 pb-4 border-b border-white/10">
          <div>
            <h2 id="today-log-title" className="text-xl font-bold tracking-tight text-white">
              Today&apos;s Log
            </h2>
            <p className="text-xs font-medium text-[#E8D5CE] mt-0.5">{todayLabel}</p>
          </div>

          <button
            type="button"
            aria-label="Close today's log"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-2xl text-[#E8D5CE] hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto px-5 sm:px-6 py-4 space-y-5">
          {/* Today's 3-Metric Strip */}
          <div className="grid grid-cols-3 gap-2.5">
            <div className="rounded-2xl bg-white/[0.06] p-3">
              <div className="flex items-center gap-1.5 text-[11px] font-medium text-[#CBB2AA]">
                <Clock className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                <span>Time</span>
              </div>
              <div className="text-base sm:text-lg font-bold font-mono text-white tabular-nums mt-1">
                {todayStats.formattedTime}
              </div>
            </div>

            <div className="rounded-2xl bg-white/[0.06] p-3">
              <div className="flex items-center gap-1.5 text-[11px] font-medium text-[#CBB2AA]">
                <DollarSign className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                <span>Value</span>
              </div>
              <div className="text-base sm:text-lg font-bold font-mono text-white tabular-nums mt-1 truncate">
                ${todayStats.totalValue}
              </div>
            </div>

            <div className="rounded-2xl bg-white/[0.06] p-3">
              <div className="flex items-center gap-1.5 text-[11px] font-medium text-[#CBB2AA]">
                <Layers className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                <span>Blocks</span>
              </div>
              <div className="text-base sm:text-lg font-bold font-mono text-white tabular-nums mt-1">
                {todayStats.count}
              </div>
            </div>
          </div>

          {/* Milestones Rollup (Aggregated time & payout per milestone tracked today) */}
          {milestoneRollups.length > 0 && (
            <section aria-label="Milestones summary" className="space-y-2.5">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[#CBB2AA] flex items-center gap-1.5">
                <Flag className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Milestones Today</span>
              </h3>
              <ul className="space-y-2">
                {milestoneRollups.map((ms) => {
                  const hours = ms.totalSeconds / 3600
                  const effRate =
                    hours > 0 && ms.payout > 0 ? Math.round(ms.payout / hours) : null

                  return (
                    <li
                      key={ms.key}
                      className="rounded-2xl bg-white/[0.06] p-3.5 flex items-center justify-between gap-3"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span
                            aria-hidden="true"
                            className="h-2 w-2 rounded-full shrink-0"
                            style={{ backgroundColor: ms.projectColor }}
                          />
                          <span className="text-sm font-semibold text-white truncate">
                            {ms.name}
                          </span>
                        </div>
                        <div className="text-xs text-[#CBB2AA] font-mono mt-0.5">
                          @{ms.projectName} · {formatDuration(ms.totalSeconds)} ({ms.sessionCount}{" "}
                          {ms.sessionCount === 1 ? "block" : "blocks"})
                        </div>
                      </div>

                      <div className="text-right shrink-0 font-mono">
                        <div className="text-sm font-bold text-white tabular-nums">
                          {ms.currency}
                          {ms.payout}
                        </div>
                        {effRate !== null && (
                          <div className="text-[11px] text-[#CBB2AA] tabular-nums">
                            ~{ms.currency}
                            {effRate}/h
                          </div>
                        )}
                      </div>
                    </li>
                  )
                })}
              </ul>
            </section>
          )}

          {/* Sessions List */}
          <section aria-label="Tracked sessions" className="space-y-2.5">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#CBB2AA]">
              Sessions ({todaySessions.length})
            </h3>

            {todaySessions.length > 0 ? (
              <ul className="space-y-2">
                {todaySessions.map((session) => {
                  const project = projects.find((p) => p.id === session.projectId)
                  const endTime =
                    session.endTime || session.startTime + session.durationSeconds * 1000

                  return (
                    <li
                      key={session.id}
                      className="group rounded-2xl bg-white/[0.05] hover:bg-white/[0.09] transition-colors p-3.5"
                    >
                      <div className="min-w-0 space-y-1.5">
                        <div className="flex items-center justify-between gap-2">
                          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#E8D5CE] truncate">
                            <span
                              aria-hidden="true"
                              className="h-2 w-2 rounded-full shrink-0"
                              style={{ backgroundColor: project?.color || "#F97316" }}
                            />
                            <span className="truncate">@{project?.name || "Project"}</span>
                          </span>
                          <span className="text-xs font-mono text-[#CBB2AA] tabular-nums shrink-0">
                            {format24h(session.startTime)} – {format24h(endTime)}
                          </span>
                        </div>

                        <div className="text-sm font-semibold text-white leading-snug">
                          {capitalizeMemo(session.memo)}
                        </div>

                        {session.milestoneName && (
                          <div className="inline-flex items-center gap-1 text-xs text-[#E8D5CE] font-mono">
                            <Flag className="h-3 w-3 text-[#CBB2AA] shrink-0" aria-hidden="true" />
                            <span className="truncate">{session.milestoneName}</span>
                          </div>
                        )}

                        <div className="flex items-center justify-between gap-2 pt-1.5 border-t border-white/10">
                          <div className="flex items-center gap-3 text-xs font-mono">
                            <span className="text-[#CBB2AA] tabular-nums">
                              {formatDuration(session.durationSeconds)}
                            </span>
                            {session.billingType === "hourly" && session.earnedAmount > 0 ? (
                              <span className="font-semibold text-white tabular-nums">
                                +${session.earnedAmount.toFixed(2)}
                              </span>
                            ) : session.billingType === "milestone" ? (
                              <span className="text-[#E8D5CE]">Milestone</span>
                            ) : session.billingType === "fixed" && session.earnedAmount > 0 ? (
                              <span className="text-white font-semibold">
                                Fixed ${session.earnedAmount.toFixed(0)}
                              </span>
                            ) : (
                              <span className="text-[#CBB2AA]">Focus</span>
                            )}
                          </div>

                          <button
                            type="button"
                            aria-label={`Delete session ${capitalizeMemo(session.memo)}`}
                            onClick={() => deleteSession(session.id)}
                            className="flex h-8 w-8 items-center justify-center rounded-xl text-[#CBB2AA] hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                          >
                            <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                          </button>
                        </div>
                      </div>
                    </li>
                  )
                })}
              </ul>
            ) : (
              <div className="rounded-2xl bg-white/[0.04] py-10 px-4 text-center space-y-2">
                <p className="text-sm font-semibold text-white">No sessions logged today</p>
                <p className="text-xs text-[#E8D5CE] max-w-xs mx-auto">
                  Start a timer from the command bar — completed blocks and milestones will appear
                  here ready to export.
                </p>
              </div>
            )}
          </section>
        </div>

        {/* Sticky Export Footer */}
        <div className="border-t border-white/10 px-5 sm:px-6 pt-3.5 pb-[max(1rem,env(safe-area-inset-bottom,0px))] flex items-center gap-2.5 bg-black/40">
          <Button
            type="button"
            variant="outline"
            disabled={todaySessions.length === 0}
            onClick={handleCopySummary}
            className="flex-1 h-11 gap-2 rounded-2xl border-none bg-white/10 text-white hover:bg-white/20 disabled:opacity-40 cursor-pointer"
          >
            {copied ? (
              <Check className="h-4 w-4 text-white" aria-hidden="true" />
            ) : (
              <Copy className="h-4 w-4" aria-hidden="true" />
            )}
            <span aria-live="polite">{copied ? "Copied" : "Copy Summary"}</span>
          </Button>

          <Button
            type="button"
            disabled={todaySessions.length === 0}
            onClick={handleExportCsv}
            className="flex-1 h-11 gap-2 rounded-2xl bg-[#C2410C] hover:bg-[#D44B12] text-white disabled:opacity-40 shadow-none cursor-pointer"
          >
            <FileSpreadsheet className="h-4 w-4" aria-hidden="true" />
            <span>Export CSV</span>
          </Button>
        </div>
      </div>
    </div>
  )
}
