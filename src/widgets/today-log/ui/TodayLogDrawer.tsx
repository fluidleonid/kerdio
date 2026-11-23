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

interface MilestoneGroup {
  key: string
  name: string
  payout: number
  totalSeconds: number
  sessions: TimeSession[]
}

interface ProjectReceiptGroup {
  projectId: string
  projectName: string
  projectColor: string
  currency: string
  milestoneGroups: MilestoneGroup[]
  standaloneSessions: TimeSession[]
  totalSeconds: number
  totalValue: number
}

// Shared 6-column receipt grid: Memo (left) | Start | End | Time spent | Earning | Action
const RECEIPT_GRID =
  "grid grid-cols-[minmax(0,1fr)_38px_38px_46px_64px_22px] sm:grid-cols-[minmax(0,1fr)_44px_44px_54px_74px_24px] items-baseline gap-x-2"

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

  // Today's sessions (chronological order for receipt readability)
  const todaySessions = useMemo(() => {
    const start = new Date()
    start.setHours(0, 0, 0, 0)
    const end = new Date()
    end.setHours(23, 59, 59, 999)

    return sessions
      .filter((s) => s.startTime >= start.getTime() && s.startTime <= end.getTime())
      .sort((a, b) => a.startTime - b.startTime)
  }, [sessions])

  // Receipt structure: Project -> Milestone subgroups + Standalone entries -> Project Subtotal
  const projectGroups = useMemo<ProjectReceiptGroup[]>(() => {
    const map = new Map<
      string,
      {
        projectId: string
        projectName: string
        projectColor: string
        currency: string
        milestoneMap: Map<string, MilestoneGroup>
        standaloneSessions: TimeSession[]
        totalSeconds: number
        totalValue: number
        countedFixed: boolean
      }
    >()

    for (const s of todaySessions) {
      const project = s.projectId ? projects.find((p) => p.id === s.projectId) : undefined
      const groupKey = project ? project.id : "no-project"
      const projectName = project?.name || "No project"
      const projectColor = project?.color || "#9A9A9A"
      const currency = s.currency || project?.currency || "$"

      let group = map.get(groupKey)
      if (!group) {
        group = {
          projectId: groupKey,
          projectName,
          projectColor,
          currency,
          milestoneMap: new Map(),
          standaloneSessions: [],
          totalSeconds: 0,
          totalValue: 0,
          countedFixed: false,
        }
        map.set(groupKey, group)
      }

      group.totalSeconds += s.durationSeconds

      if (s.billingType === "milestone" || s.milestoneId || s.milestoneName) {
        const msObj = project?.milestones?.find(
          (m) => m.id === s.milestoneId || m.name === s.milestoneName
        )
        const msName = msObj?.name || s.milestoneName || "Milestone"
        const key = msObj?.id || msName.toLowerCase()
        const payout = msObj?.amount ?? s.earnedAmount ?? project?.fixedBudget ?? 0

        let msGroup = group.milestoneMap.get(key)
        if (!msGroup) {
          msGroup = {
            key,
            name: msName,
            payout,
            totalSeconds: 0,
            sessions: [],
          }
          group.milestoneMap.set(key, msGroup)
          group.totalValue += payout
        }
        msGroup.totalSeconds += s.durationSeconds
        msGroup.sessions.push(s)
      } else {
        group.standaloneSessions.push(s)
        if (s.billingType === "fixed") {
          if (!group.countedFixed) {
            group.countedFixed = true
            group.totalValue += s.earnedAmount
          }
        } else if (s.billingType === "hourly") {
          group.totalValue += s.earnedAmount
        }
      }
    }

    return Array.from(map.values()).map((g) => ({
      projectId: g.projectId,
      projectName: g.projectName,
      projectColor: g.projectColor,
      currency: g.currency,
      milestoneGroups: Array.from(g.milestoneMap.values()),
      standaloneSessions: g.standaloneSessions,
      totalSeconds: g.totalSeconds,
      totalValue: g.totalValue,
    }))
  }, [todaySessions, projects])

  // Grand total across all projects today
  const grandTotal = useMemo(() => {
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

    const lines = [`KERD — ${todayLabel}`, ``]

    for (const group of projectGroups) {
      lines.push(group.projectName.toUpperCase())
      for (const ms of group.milestoneGroups) {
        lines.push(
          `  ${ms.name}  ${formatDuration(ms.totalSeconds)}  ${
            ms.payout > 0 ? `${group.currency}${ms.payout}` : "—"
          }`
        )
        for (const s of ms.sessions) {
          const end = s.endTime || s.startTime + s.durationSeconds * 1000
          lines.push(
            `    ${capitalizeMemo(s.memo)}  ${format24h(s.startTime)}  ${format24h(
              end
            )}  ${formatDuration(s.durationSeconds)}  —`
          )
        }
      }
      for (const s of group.standaloneSessions) {
        const end = s.endTime || s.startTime + s.durationSeconds * 1000
        const amt =
          s.billingType === "hourly" && s.earnedAmount > 0
            ? `${group.currency}${s.earnedAmount.toFixed(2)}`
            : "—"
        lines.push(
          `  ${capitalizeMemo(s.memo)}  ${format24h(s.startTime)}  ${format24h(
            end
          )}  ${formatDuration(s.durationSeconds)}  ${amt}`
        )
      }
      lines.push(
        `  Subtotal  ${formatDuration(group.totalSeconds)}  ${
          group.totalValue > 0 ? `${group.currency}${group.totalValue.toFixed(2)}` : "—"
        }`,
        ``
      )
    }

    lines.push(
      `----------------------------------`,
      `TOTAL  ${grandTotal.time}  ${grandTotal.value > 0 ? `$${grandTotal.value.toFixed(2)}` : "—"}`
    )

    await navigator.clipboard.writeText(lines.join("\n"))
    setCopied(true)
    setTimeout(() => setCopied(false), 2200)
  }

  const handleExportCsv = () => {
    if (todaySessions.length === 0) return

    const headers = [
      "Date",
      "Project",
      "Milestone",
      "Memo",
      "Start",
      "End",
      "Duration (min)",
      "Billing",
      "Rate ($/h)",
      "Amount ($)",
    ]

    const rows = todaySessions.map((s) => {
      const proj = projects.find((p) => p.id === s.projectId)
      const dateStr = new Date(s.startTime).toLocaleDateString("en-US")
      const end = s.endTime || s.startTime + s.durationSeconds * 1000
      const mins = Math.max(1, Math.round(s.durationSeconds / 60))
      return [
        `"${dateStr}"`,
        `"${proj?.name || "No project"}"`,
        `"${(s.milestoneName || "").replace(/"/g, '""')}"`,
        `"${capitalizeMemo(s.memo).replace(/"/g, '""')}"`,
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
        className="w-full max-h-[86dvh] sm:max-h-[calc(100dvh-2rem)] sm:my-4 sm:mr-4 sm:max-w-[540px] flex flex-col overflow-hidden rounded-t-3xl sm:rounded-3xl bg-black/75 backdrop-blur-3xl shadow-[0_24px_64px_rgba(0,0,0,0.55)] animate-in slide-in-from-bottom-6 sm:slide-in-from-right-6 duration-250"
      >
        {/* Mobile Drag Handle */}
        <div aria-hidden="true" className="flex justify-center pt-3 pb-1 sm:hidden">
          <span className="h-1 w-10 rounded-full bg-white/25" />
        </div>

        {/* Receipt Header */}
        <div className="flex items-start justify-between gap-3 px-5 sm:px-6 pt-4 sm:pt-6 pb-3">
          <div>
            <h2 id="today-log-title" className="text-lg font-bold tracking-tight text-white">
              Today&apos;s Log
            </h2>
            <p className="text-xs font-mono text-[#B8B8B8] mt-0.5">{todayLabel}</p>
          </div>

          <button
            type="button"
            aria-label="Close today's log"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-[#DCDCDC] hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        {/* Receipt Body (Strict 5-column alignment, no column labels) */}
        <div className="flex-1 overflow-y-auto px-5 sm:px-6 py-3 space-y-6">
          {projectGroups.length > 0 ? (
            <>
              {projectGroups.map((group) => (
                <section key={group.projectId} aria-label={group.projectName} className="space-y-3">
                  {/* Project Heading */}
                  <div className="flex items-center gap-2">
                    <span
                      aria-hidden="true"
                      className="h-2 w-2 rounded-full shrink-0"
                      style={{ backgroundColor: group.projectColor }}
                    />
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-white truncate">
                      {group.projectName}
                    </h3>
                  </div>

                  {/* Milestone Subgroups */}
                  {group.milestoneGroups.map((ms) => (
                    <div key={ms.key} className="space-y-1.5">
                      {/* Milestone Row aligned to same columns */}
                      <div className={`${RECEIPT_GRID} font-mono text-xs tabular-nums`}>
                        <span className="font-sans font-medium text-[#DCDCDC] truncate text-left">
                          {ms.name}
                        </span>
                        <span aria-hidden="true" />
                        <span aria-hidden="true" />
                        <span className="text-right text-[#DCDCDC]">
                          {formatDuration(ms.totalSeconds)}
                        </span>
                        <span className="text-right text-white font-medium">
                          {ms.payout > 0 ? `${group.currency}${ms.payout}` : "—"}
                        </span>
                        <span aria-hidden="true" />
                      </div>

                      {/* Milestone Entries */}
                      <ul className="space-y-1.5">
                        {ms.sessions.map((session) => {
                          const endTime =
                            session.endTime || session.startTime + session.durationSeconds * 1000
                          return (
                            <li
                              key={session.id}
                              className={`group ${RECEIPT_GRID} text-xs tabular-nums`}
                            >
                              <span className="pl-2.5 text-sm text-[#F2F2F2] leading-snug truncate text-left">
                                {capitalizeMemo(session.memo)}
                              </span>
                              <span className="font-mono text-right text-[#B8B8B8]">
                                {format24h(session.startTime)}
                              </span>
                              <span className="font-mono text-right text-[#B8B8B8]">
                                {format24h(endTime)}
                              </span>
                              <span className="font-mono text-right text-[#DCDCDC]">
                                {formatDuration(session.durationSeconds)}
                              </span>
                              <span className="font-mono text-right text-[#B8B8B8]">—</span>
                              <span className="flex justify-end">
                                <button
                                  type="button"
                                  aria-label={`Delete session ${capitalizeMemo(session.memo)}`}
                                  onClick={() => deleteSession(session.id)}
                                  className="inline-flex h-6 w-6 items-center justify-center rounded-md text-[#B8B8B8] hover:text-white hover:bg-white/10 transition-colors cursor-pointer sm:opacity-0 sm:group-hover:opacity-100 focus-visible:opacity-100"
                                >
                                  <Trash2 className="h-3 w-3" aria-hidden="true" />
                                </button>
                              </span>
                            </li>
                          )
                        })}
                      </ul>
                    </div>
                  ))}

                  {/* Standalone Entries (Hourly / Focus) */}
                  {group.standaloneSessions.length > 0 && (
                    <ul className="space-y-1.5">
                      {group.standaloneSessions.map((session) => {
                        const endTime =
                          session.endTime || session.startTime + session.durationSeconds * 1000
                        const earningText =
                          session.billingType === "hourly" && session.earnedAmount > 0
                            ? `${group.currency}${session.earnedAmount.toFixed(2)}`
                            : "—"

                        return (
                          <li
                            key={session.id}
                            className={`group ${RECEIPT_GRID} text-xs tabular-nums`}
                          >
                            <span className="text-sm text-[#F2F2F2] leading-snug truncate text-left">
                              {capitalizeMemo(session.memo)}
                            </span>
                            <span className="font-mono text-right text-[#B8B8B8]">
                              {format24h(session.startTime)}
                            </span>
                            <span className="font-mono text-right text-[#B8B8B8]">
                              {format24h(endTime)}
                            </span>
                            <span className="font-mono text-right text-[#DCDCDC]">
                              {formatDuration(session.durationSeconds)}
                            </span>
                            <span
                              className={`font-mono text-right ${
                                earningText === "—" ? "text-[#B8B8B8]" : "text-white"
                              }`}
                            >
                              {earningText}
                            </span>
                            <span className="flex justify-end">
                              <button
                                type="button"
                                aria-label={`Delete session ${capitalizeMemo(session.memo)}`}
                                onClick={() => deleteSession(session.id)}
                                className="inline-flex h-6 w-6 items-center justify-center rounded-md text-[#B8B8B8] hover:text-white hover:bg-white/10 transition-colors cursor-pointer sm:opacity-0 sm:group-hover:opacity-100 focus-visible:opacity-100"
                              >
                                <Trash2 className="h-3 w-3" aria-hidden="true" />
                              </button>
                            </span>
                          </li>
                        )
                      })}
                    </ul>
                  )}

                  {/* Project Subtotal (2 lines: time & earnings) */}
                  <div className="pt-2 border-t border-dashed border-white/15 space-y-1 pr-[30px] sm:pr-[32px] font-mono text-xs tabular-nums">
                    <div className="flex items-baseline justify-between gap-3">
                      <span className="uppercase tracking-wider text-[#B8B8B8]">Subtotal time</span>
                      <span className="text-right text-[#DCDCDC]">
                        {formatDuration(group.totalSeconds)}
                      </span>
                    </div>
                    <div className="flex items-baseline justify-between gap-3">
                      <span className="uppercase tracking-wider text-[#B8B8B8]">Subtotal earned</span>
                      <span className="text-right text-white font-semibold">
                        {group.totalValue > 0
                          ? `${group.currency}${group.totalValue.toFixed(2)}`
                          : "—"}
                      </span>
                    </div>
                  </div>
                </section>
              ))}

              {/* Grand Total (2 lines: time & earnings) */}
              <div className="pt-4 border-t border-dashed border-white/25 space-y-1.5 pr-[30px] sm:pr-[32px] font-mono tabular-nums">
                <div className="flex items-baseline justify-between gap-3 text-xs">
                  <span className="uppercase tracking-widest text-[#DCDCDC]">Total time</span>
                  <span className="text-right text-[#DCDCDC] font-medium">{grandTotal.time}</span>
                </div>
                <div className="flex items-baseline justify-between gap-3">
                  <span className="text-xs uppercase tracking-widest text-white font-semibold">
                    Total earned
                  </span>
                  <span className="text-right text-base font-bold text-white">
                    {grandTotal.value > 0 ? `$${grandTotal.value.toFixed(2)}` : "—"}
                  </span>
                </div>
              </div>
            </>
          ) : (
            <div className="py-16 text-center space-y-1.5">
              <p className="text-sm font-medium text-white">No sessions logged today</p>
              <p className="text-xs text-[#B8B8B8] max-w-xs mx-auto">
                Start a timer from the command bar to record your first block.
              </p>
            </div>
          )}
        </div>

        {/* Receipt Footer */}
        <div className="px-5 sm:px-6 pt-3 pb-[max(1.25rem,env(safe-area-inset-bottom,0px))] flex items-center gap-2.5">
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
