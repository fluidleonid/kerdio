import { useEffect, useMemo, useState } from "react"
import { X, Copy, Check, FileSpreadsheet, Trash2 } from "lucide-react"
import { useTrackerStore } from "@/entities/tracker"
import type { TimeSession } from "@/entities/session"
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

  // Today's sessions (newest first)
  const todaySessions = useMemo(() => {
    const start = new Date()
    start.setHours(0, 0, 0, 0)
    const end = new Date()
    end.setHours(23, 59, 59, 999)

    return sessions
      .filter((s) => s.startTime >= start.getTime() && s.startTime <= end.getTime())
      .sort((a, b) => b.startTime - a.startTime)
  }, [sessions])

  // Group sessions by project with per-project totals and milestone rollups
  const projectGroups = useMemo(() => {
    const map = new Map<
      string,
      {
        projectId: string
        projectName: string
        projectColor: string
        currency: string
        sessions: TimeSession[]
        totalSeconds: number
        totalValue: number
        milestones: Array<{
          key: string
          name: string
          totalSeconds: number
          payout: number
        }>
      }
    >()

    for (const s of todaySessions) {
      const project = projects.find((p) => p.id === s.projectId)
      const projectName = project?.name || "Project"
      const projectColor = project?.color || "#F97316"
      const currency = s.currency || project?.currency || "$"

      let group = map.get(s.projectId)
      if (!group) {
        group = {
          projectId: s.projectId,
          projectName,
          projectColor,
          currency,
          sessions: [],
          totalSeconds: 0,
          totalValue: 0,
          milestones: [],
        }
        map.set(s.projectId, group)
      }

      group.sessions.push(s)
      group.totalSeconds += s.durationSeconds
    }

    // Calculate accurate value & milestone rollups per project group
    for (const group of map.values()) {
      const project = projects.find((p) => p.id === group.projectId)
      const msMap = new Map<
        string,
        { key: string; name: string; totalSeconds: number; payout: number }
      >()
      let value = 0
      const countedFixed = new Set<string>()

      for (const s of group.sessions) {
        if (s.billingType === "milestone" || s.milestoneId || s.milestoneName) {
          const msObj = project?.milestones?.find(
            (m) => m.id === s.milestoneId || m.name === s.milestoneName
          )
          const msName = msObj?.name || s.milestoneName || "Milestone"
          const key = msObj?.id || msName.toLowerCase()
          const payout = msObj?.amount ?? s.earnedAmount ?? project?.fixedBudget ?? 0
          const existing = msMap.get(key)
          if (existing) {
            existing.totalSeconds += s.durationSeconds
          } else {
            msMap.set(key, { key, name: msName, totalSeconds: s.durationSeconds, payout })
            value += payout
          }
        } else if (s.billingType === "fixed") {
          if (!countedFixed.has(group.projectId)) {
            countedFixed.add(group.projectId)
            value += s.earnedAmount
          }
        } else if (s.billingType === "hourly") {
          value += s.earnedAmount
        }
      }

      group.totalValue = value
      group.milestones = Array.from(msMap.values())
    }

    return Array.from(map.values())
  }, [todaySessions, projects])

  // Overall today totals
  const todayTotals = useMemo(() => {
    const totalSeconds = projectGroups.reduce((acc, g) => acc + g.totalSeconds, 0)
    const totalValue = projectGroups.reduce((acc, g) => acc + g.totalValue, 0)
    return {
      time: totalSeconds > 0 ? formatDuration(totalSeconds) : "0m",
      value: totalValue,
    }
  }, [projectGroups])

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
      `Kerd — ${todayLabel}`,
      `Total: ${todayTotals.time}${todayTotals.value > 0 ? ` · $${todayTotals.value.toFixed(2)}` : ""}`,
      ``,
    ]

    for (const group of projectGroups) {
      lines.push(
        `@${group.projectName} (${formatDuration(group.totalSeconds)}${
          group.totalValue > 0 ? ` · ${group.currency}${group.totalValue.toFixed(2)}` : ""
        })`
      )
      for (const s of [...group.sessions].reverse()) {
        const end = s.endTime || s.startTime + s.durationSeconds * 1000
        const msPart = s.milestoneName ? ` [${s.milestoneName}]` : ""
        const valPart =
          s.billingType === "hourly" && s.earnedAmount > 0
            ? ` · $${s.earnedAmount.toFixed(2)}`
            : ""
        lines.push(
          `  • ${capitalizeMemo(s.memo)}${msPart} — ${format24h(s.startTime)}–${format24h(
            end
          )} (${formatDuration(s.durationSeconds)}${valPart})`
        )
      }
      if (group.milestones.length > 0) {
        for (const ms of group.milestones) {
          lines.push(
            `  Milestone: ${ms.name} — ${formatDuration(ms.totalSeconds)} · ${group.currency}${ms.payout}`
          )
        }
      }
      lines.push(``)
    }

    await navigator.clipboard.writeText(lines.join("\n").trim())
    setCopied(true)
    setTimeout(() => setCopied(false), 2200)
  }

  const handleExportCsv = () => {
    if (todaySessions.length === 0) return

    const headers = [
      "Date",
      "Project",
      "Memo",
      "Milestone",
      "Start",
      "End",
      "Duration (min)",
      "Billing",
      "Rate ($/h)",
      "Amount ($)",
    ]

    const rows = [...todaySessions].reverse().map((s) => {
      const proj = projects.find((p) => p.id === s.projectId)
      const dateStr = new Date(s.startTime).toLocaleDateString("en-US")
      const end = s.endTime || s.startTime + s.durationSeconds * 1000
      const mins = Math.max(1, Math.round(s.durationSeconds / 60))
      return [
        `"${dateStr}"`,
        `"${proj?.name || s.projectId}"`,
        `"${capitalizeMemo(s.memo).replace(/"/g, '""')}"`,
        `"${(s.milestoneName || "").replace(/"/g, '""')}"`,
        `"${format24h(s.startTime)}"`,
        `"${format24h(end)}"`,
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
        {/* Mobile Drag Handle */}
        <div aria-hidden="true" className="flex justify-center pt-3 pb-1 sm:hidden">
          <span className="h-1 w-10 rounded-full bg-white/25" />
        </div>

        {/* Minimalist Header */}
        <div className="flex items-start justify-between gap-3 px-5 sm:px-6 pt-3 sm:pt-6 pb-4 border-b border-white/10">
          <div>
            <h2 id="today-log-title" className="text-lg font-bold tracking-tight text-white">
              Today&apos;s Log
            </h2>
            <p className="text-xs font-mono text-[#E8D5CE] mt-0.5 tabular-nums">
              {todayLabel}
              {todaySessions.length > 0 && (
                <>
                  {" · "}
                  {todayTotals.time}
                  {todayTotals.value > 0 ? ` · $${todayTotals.value.toFixed(2)}` : ""}
                </>
              )}
            </p>
          </div>

          <button
            type="button"
            aria-label="Close today's log"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-[#E8D5CE] hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        {/* Project-Grouped Sessions List */}
        <div className="flex-1 overflow-y-auto px-5 sm:px-6 py-4 space-y-5">
          {projectGroups.length > 0 ? (
            projectGroups.map((group) => (
              <section key={group.projectId} aria-label={group.projectName} className="space-y-2">
                {/* Project Group Header */}
                <div className="flex items-center justify-between gap-2 px-1">
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      aria-hidden="true"
                      className="h-2 w-2 rounded-full shrink-0"
                      style={{ backgroundColor: group.projectColor }}
                    />
                    <h3 className="text-xs font-semibold text-white truncate">
                      {group.projectName}
                    </h3>
                  </div>
                  <span className="text-xs font-mono text-[#E8D5CE] tabular-nums shrink-0">
                    {formatDuration(group.totalSeconds)}
                    {group.totalValue > 0
                      ? ` · ${group.currency}${group.totalValue.toFixed(0)}`
                      : ""}
                  </span>
                </div>

                {/* Grouped Entry Rows */}
                <ul className="rounded-2xl bg-white/[0.05] divide-y divide-white/[0.08] overflow-hidden">
                  {group.sessions.map((session) => {
                    const endTime =
                      session.endTime || session.startTime + session.durationSeconds * 1000
                    const durationText = formatDuration(session.durationSeconds)
                    const amountText =
                      session.billingType === "hourly" && session.earnedAmount > 0
                        ? `${group.currency}${session.earnedAmount.toFixed(2)}`
                        : session.billingType === "milestone" && session.earnedAmount > 0
                        ? `${group.currency}${session.earnedAmount.toFixed(0)}`
                        : null

                    return (
                      <li
                        key={session.id}
                        className="group flex items-start justify-between gap-3 px-3.5 py-3 hover:bg-white/[0.04] transition-colors"
                      >
                        {/* Left: Memo + Milestone underneath */}
                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-medium text-white leading-snug">
                            {capitalizeMemo(session.memo)}
                          </div>
                          {session.milestoneName && (
                            <div className="text-xs text-[#CBB2AA] mt-0.5 truncate">
                              {session.milestoneName}
                            </div>
                          )}
                        </div>

                        {/* Right: Start–End time, Entry duration, Amount + subtle delete */}
                        <div className="flex items-start gap-2 shrink-0">
                          <div className="text-right font-mono tabular-nums">
                            <div className="text-[11px] text-[#CBB2AA] leading-tight">
                              {format24h(session.startTime)}–{format24h(endTime)}
                            </div>
                            <div className="text-xs text-white mt-0.5 leading-tight">
                              {durationText}
                              {amountText ? ` · ${amountText}` : ""}
                            </div>
                          </div>

                          <button
                            type="button"
                            aria-label={`Delete session ${capitalizeMemo(session.memo)}`}
                            onClick={() => deleteSession(session.id)}
                            className="flex h-7 w-7 items-center justify-center rounded-lg text-[#CBB2AA] hover:text-white hover:bg-white/10 transition-colors cursor-pointer sm:opacity-50 sm:group-hover:opacity-100 focus-visible:opacity-100"
                          >
                            <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                          </button>
                        </div>
                      </li>
                    )
                  })}
                </ul>

                {/* Minimalist Milestone Sum Footer (if project has milestones today) */}
                {group.milestones.length > 0 && (
                  <div className="px-1 space-y-1">
                    {group.milestones.map((ms) => (
                      <div
                        key={ms.key}
                        className="flex items-center justify-between gap-2 text-[11px] font-mono text-[#CBB2AA] tabular-nums"
                      >
                        <span className="truncate">{ms.name}</span>
                        <span className="shrink-0">
                          {formatDuration(ms.totalSeconds)}
                          {ms.payout > 0 ? ` · ${group.currency}${ms.payout}` : ""}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            ))
          ) : (
            <div className="rounded-2xl bg-white/[0.04] py-12 px-4 text-center space-y-1.5">
              <p className="text-sm font-medium text-white">No sessions logged today</p>
              <p className="text-xs text-[#CBB2AA] max-w-xs mx-auto">
                Start a timer from the command bar to record your first block.
              </p>
            </div>
          )}
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
