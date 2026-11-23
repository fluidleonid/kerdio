import { useState, useMemo, useEffect, useRef } from "react"
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  DollarSign,
  Trash2,
  X,
  Check,
  Calendar as CalendarIcon,
  Flag,
} from "lucide-react"
import { useTrackerStore } from "@/entities/tracker"
import type { TimeSession } from "@/entities/session"
import { Button, Input, AppTooltip } from "@/shared/ui"
import { capitalizeMemo } from "@/shared/lib"

const HOUR_HEIGHT = 56 // px per hour in 24h grid

// Days of week helper (Monday first)
function getWeekDates(referenceDate: Date) {
  const current = new Date(referenceDate)
  const day = current.getDay()
  const diff = current.getDate() - day + (day === 0 ? -6 : 1)

  const monday = new Date(current.setDate(diff))
  monday.setHours(0, 0, 0, 0)

  const week = []
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    week.push(d)
  }
  return week
}

export function JournalView() {
  const { sessions, projects, updateSession, deleteSession, addManualSession } =
    useTrackerStore()

  const [currentDate, setCurrentDate] = useState(() => new Date())
  const [selectedDayIndex, setSelectedDayIndex] = useState(() => {
    const day = new Date().getDay()
    return day === 0 ? 6 : day - 1
  })
  const [selectedSession, setSelectedSession] = useState<TimeSession | null>(null)
  const [isManualModalOpen, setIsManualModalOpen] = useState(false)

  const gridScrollRef = useRef<HTMLDivElement>(null)

  // Edit form state
  const [editMemo, setEditMemo] = useState("")
  const [editMinutes, setEditMinutes] = useState("")
  const [editRate, setEditRate] = useState("")
  const [editProjectId, setEditProjectId] = useState("")

  // New manual session form state
  const [newMemo, setNewMemo] = useState("")
  const [newMinutes, setNewMinutes] = useState("60")
  const [newRate, setNewRate] = useState("85")
  const [newProjectId, setNewProjectId] = useState(projects[0]?.id || "")
  const [newStartHour, setNewStartHour] = useState("10")

  // Scroll desktop 24h calendar to 08:00 on mount
  useEffect(() => {
    if (gridScrollRef.current) {
      gridScrollRef.current.scrollTop = 8 * HOUR_HEIGHT
    }
  }, [])

  // Close modals on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (selectedSession) setSelectedSession(null)
        if (isManualModalOpen) setIsManualModalOpen(false)
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [selectedSession, isManualModalOpen])

  // Week days
  const weekDays = useMemo(() => getWeekDates(currentDate), [currentDate])

  const weekLabel = useMemo(() => {
    const first = weekDays[0]
    const last = weekDays[6]
    const m1 = first.toLocaleDateString("en-US", { month: "short" })
    const m2 = last.toLocaleDateString("en-US", { month: "short" })
    const d1 = first.getDate()
    const d2 = last.getDate()
    const y = last.getFullYear()
    return m1 === m2 ? `${m1} ${d1} – ${d2}, ${y}` : `${m1} ${d1} – ${m2} ${d2}, ${y}`
  }, [weekDays])

  // Navigate weeks
  const prevWeek = () => {
    const prev = new Date(currentDate)
    prev.setDate(prev.getDate() - 7)
    setCurrentDate(prev)
  }

  const nextWeek = () => {
    const next = new Date(currentDate)
    next.setDate(next.getDate() + 7)
    setCurrentDate(next)
  }

  const goToday = () => {
    const today = new Date()
    setCurrentDate(today)
    const day = today.getDay()
    setSelectedDayIndex(day === 0 ? 6 : day - 1)
  }

  // 24 hours list: 00:00 to 23:00
  const hours = useMemo(() => {
    return Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, "0")}:00`)
  }, [])

  // Weekly stats
  const weekStats = useMemo(() => {
    const startWeek = weekDays[0].getTime()
    const endWeek = weekDays[6].getTime() + 86400000

    const weekSessions = sessions.filter(
      (s) => s.startTime >= startWeek && s.startTime < endWeek
    )

    const totalSecs = weekSessions.reduce((acc, s) => acc + s.durationSeconds, 0)
    const totalEarned = weekSessions.reduce((acc, s) => acc + s.earnedAmount, 0)

    return {
      hours: (totalSecs / 3600).toFixed(1),
      earned: totalEarned.toFixed(2),
      count: weekSessions.length,
    }
  }, [sessions, weekDays])

  // Get sessions for a given day
  const getSessionsForDay = (dayDate: Date) => {
    const startOfDay = new Date(dayDate)
    startOfDay.setHours(0, 0, 0, 0)
    const endOfDay = new Date(dayDate)
    endOfDay.setHours(23, 59, 59, 999)

    return sessions
      .filter((s) => s.startTime >= startOfDay.getTime() && s.startTime <= endOfDay.getTime())
      .sort((a, b) => a.startTime - b.startTime)
  }

  // Open Edit Modal
  const openEdit = (session: TimeSession) => {
    setSelectedSession(session)
    setEditMemo(session.memo)
    setEditMinutes(String(Math.round(session.durationSeconds / 60)))
    setEditRate(String(session.rateSnapshot))
    setEditProjectId(session.projectId)
  }

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedSession) return

    const mins = parseInt(editMinutes, 10) || 1
    const rate = parseFloat(editRate) || selectedSession.rateSnapshot
    const durationSeconds = mins * 60
    const earnedAmount =
      selectedSession.billingType === "hourly"
        ? Math.round(((durationSeconds / 3600) * rate) * 100) / 100
        : selectedSession.earnedAmount

    updateSession(selectedSession.id, {
      memo: capitalizeMemo(editMemo),
      durationSeconds,
      rateSnapshot: rate,
      earnedAmount,
      projectId: editProjectId,
    })

    setSelectedSession(null)
  }

  const handleCreateManual = (e: React.FormEvent) => {
    e.preventDefault()
    const mins = parseInt(newMinutes, 10) || 30
    const rate = parseFloat(newRate) || 85
    const durationSeconds = mins * 60
    const earnedAmount = Math.round(((durationSeconds / 3600) * rate) * 100) / 100

    const targetDate = new Date(weekDays[selectedDayIndex] || currentDate)
    targetDate.setHours(parseInt(newStartHour, 10) || 9, 0, 0, 0)
    const startTime = targetDate.getTime()
    const endTime = startTime + durationSeconds * 1000

    addManualSession({
      projectId: newProjectId || projects[0]?.id || "proj-kerd",
      memo: capitalizeMemo(newMemo.trim() || "Manual session"),
      startTime,
      endTime,
      durationSeconds,
      rateSnapshot: rate,
      earnedAmount,
      billingType: "hourly",
      currency: "$",
    })

    setIsManualModalOpen(false)
    setNewMemo("")
  }

  // Format 24h time HH:MM
  const format24h = (timestamp: number) => {
    const d = new Date(timestamp)
    const hh = String(d.getHours()).padStart(2, "0")
    const mm = String(d.getMinutes()).padStart(2, "0")
    return `${hh}:${mm}`
  }

  const now = new Date()
  const isCurrentWeek = weekDays.some((d) => d.toDateString() === now.toDateString())
  const currentMinutesToday = now.getHours() * 60 + now.getMinutes()
  const currentIndicatorTop = (currentMinutesToday / 60) * HOUR_HEIGHT

  const selectedDayDate = weekDays[selectedDayIndex] || weekDays[0]
  const selectedDaySessions = getSessionsForDay(selectedDayDate)

  return (
    <div className="container mx-auto max-w-7xl px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      {/* Top Header & Controls */}
      <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Journal
            </h1>
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-black/45 text-[#FAF0EC] backdrop-blur-xl">
              24h Timeline
            </span>
          </div>
          <p className="text-sm text-[#FAF0EC]">
            Weekly timeline of tracked work sessions, hours, and accrued value.
          </p>
        </div>

        {/* Date Navigation & Actions */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center rounded-2xl bg-black/50 p-1 backdrop-blur-2xl">
            <AppTooltip content="Previous week">
              <button
                type="button"
                aria-label="Previous week"
                onClick={prevWeek}
                className="flex h-9 w-9 items-center justify-center rounded-xl text-[#E8D5CE] hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
              >
                <ChevronLeft className="h-4 w-4" aria-hidden="true" />
              </button>
            </AppTooltip>
            <button
              type="button"
              onClick={goToday}
              className="px-3.5 h-9 text-xs font-semibold text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
            >
              Today
            </button>
            <AppTooltip content="Next week">
              <button
                type="button"
                aria-label="Next week"
                onClick={nextWeek}
                className="flex h-9 w-9 items-center justify-center rounded-xl text-[#E8D5CE] hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
              >
                <ChevronRight className="h-4 w-4" aria-hidden="true" />
              </button>
            </AppTooltip>
          </div>

          <span className="font-mono text-xs sm:text-sm font-semibold text-white px-3.5 py-2.5 rounded-2xl bg-black/45 backdrop-blur-2xl">
            {weekLabel}
          </span>

          <Button
            size="sm"
            onClick={() => setIsManualModalOpen(true)}
            className="h-10 gap-1.5 rounded-2xl bg-[#C2410C] text-white hover:bg-[#D44B12] px-4 shadow-none cursor-pointer"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            <span>Add Session</span>
          </Button>
        </div>
      </header>

      {/* Week Summary Metrics */}
      <section aria-label="Weekly summary" className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <div className="glass-card flex items-center justify-between p-4 sm:p-5">
          <div>
            <span className="text-xs font-medium text-[#E8D5CE] block">
              Week Hours
            </span>
            <span className="text-2xl font-bold font-mono text-white tabular-nums mt-0.5 block">
              {weekStats.hours} h
            </span>
          </div>
          <div className="h-10 w-10 rounded-2xl bg-white/10 text-orange-300 flex items-center justify-center shrink-0">
            <Clock className="h-5 w-5" aria-hidden="true" />
          </div>
        </div>

        <div className="glass-card flex items-center justify-between p-4 sm:p-5">
          <div>
            <span className="text-xs font-medium text-[#E8D5CE] block">
              Week Billing
            </span>
            <span className="text-2xl font-bold font-mono text-emerald-300 tabular-nums mt-0.5 block">
              ${weekStats.earned}
            </span>
          </div>
          <div className="h-10 w-10 rounded-2xl bg-emerald-500/15 text-emerald-300 flex items-center justify-center shrink-0">
            <DollarSign className="h-5 w-5" aria-hidden="true" />
          </div>
        </div>

        <div className="glass-card flex items-center justify-between p-4 sm:p-5">
          <div>
            <span className="text-xs font-medium text-[#E8D5CE] block">
              Sessions Logged
            </span>
            <span className="text-2xl font-bold font-mono text-white tabular-nums mt-0.5 block">
              {weekStats.count}
            </span>
          </div>
          <div className="h-10 w-10 rounded-2xl bg-white/10 text-amber-300 flex items-center justify-center shrink-0">
            <CalendarIcon className="h-5 w-5" aria-hidden="true" />
          </div>
        </div>
      </section>

      {/* MOBILE & TABLET VIEW (< lg): Day Selector + Readable Session List */}
      <section aria-label="Daily schedule" className="lg:hidden space-y-4">
        {/* 7-Day Selector Strip */}
        <div className="glass-card p-2">
          <div className="grid grid-cols-7 gap-1">
            {weekDays.map((date, idx) => {
              const isSelected = idx === selectedDayIndex
              const isToday = date.toDateString() === now.toDateString()
              const daySessions = getSessionsForDay(date)
              const dayShort = date.toLocaleDateString("en-US", { weekday: "narrow" })
              const fullLabel = date.toLocaleDateString("en-US", {
                weekday: "long",
                month: "short",
                day: "numeric",
              })

              return (
                <button
                  key={date.toISOString()}
                  type="button"
                  aria-pressed={isSelected}
                  aria-label={`${fullLabel}, ${daySessions.length} sessions`}
                  onClick={() => setSelectedDayIndex(idx)}
                  className={`flex flex-col items-center justify-center min-h-[56px] rounded-2xl py-2 px-1 transition-all cursor-pointer ${
                    isSelected
                      ? "bg-[#C2410C] text-white font-bold ring-1 ring-white/30"
                      : isToday
                      ? "bg-white/15 text-white font-semibold"
                      : "text-[#E8D5CE] hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <span className="text-[11px] uppercase leading-none opacity-90">
                    {dayShort}
                  </span>
                  <span className="text-sm font-mono font-bold mt-1 leading-none">
                    {date.getDate()}
                  </span>
                  <span
                    aria-hidden="true"
                    className={`mt-1.5 h-1.5 w-1.5 rounded-full ${
                      daySessions.length > 0
                        ? isSelected
                          ? "bg-white"
                          : "bg-amber-300"
                        : "bg-transparent"
                    }`}
                  />
                </button>
              )
            })}
          </div>
        </div>

        {/* Selected Day Sessions */}
        <div className="glass-card p-4 sm:p-5 space-y-3">
          <div className="flex items-center justify-between gap-2 pb-2 border-b border-white/10">
            <h2 className="text-base font-bold text-white">
              {selectedDayDate.toLocaleDateString("en-US", {
                weekday: "long",
                month: "short",
                day: "numeric",
              })}
            </h2>
            <span className="text-xs font-mono text-[#E8D5CE]">
              {selectedDaySessions.length}{" "}
              {selectedDaySessions.length === 1 ? "session" : "sessions"}
            </span>
          </div>

          {selectedDaySessions.length > 0 ? (
            <ul className="space-y-2.5">
              {selectedDaySessions.map((session) => {
                const project = projects.find((p) => p.id === session.projectId)
                const durationMin = Math.round(session.durationSeconds / 60)
                const endTime = session.endTime || session.startTime + session.durationSeconds * 1000

                return (
                  <li key={session.id}>
                    <button
                      type="button"
                      onClick={() => openEdit(session)}
                      className="w-full text-left rounded-2xl bg-white/[0.06] hover:bg-white/[0.11] p-3.5 transition-all cursor-pointer flex items-stretch gap-3"
                    >
                      <span
                        aria-hidden="true"
                        className="w-1 rounded-full shrink-0"
                        style={{ backgroundColor: project?.color || "#F97316" }}
                      />
                      <div className="flex-1 min-w-0 space-y-1.5">
                        <div className="flex items-center justify-between gap-2">
                          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#E8D5CE] truncate">
                            <span
                              className="h-2 w-2 rounded-full shrink-0"
                              style={{ backgroundColor: project?.color || "#F97316" }}
                            />
                            <span className="truncate">@{project?.name || "Project"}</span>
                          </span>
                          <span className="text-xs font-mono text-[#E8D5CE] tabular-nums shrink-0">
                            {format24h(session.startTime)} – {format24h(endTime)}
                          </span>
                        </div>

                        <div className="text-sm font-semibold text-white leading-snug">
                          {capitalizeMemo(session.memo)}
                        </div>

                        {session.milestoneName && (
                          <div className="inline-flex items-center gap-1 text-xs text-amber-200 font-mono">
                            <Flag className="h-3 w-3 shrink-0 text-amber-300" aria-hidden="true" />
                            <span className="truncate">{session.milestoneName}</span>
                          </div>
                        )}

                        <div className="flex items-center justify-between pt-1.5 border-t border-white/10 text-xs font-mono">
                          <span className="text-[#CBB2AA]">{durationMin} min</span>
                          <span className="font-bold text-emerald-300">
                            +${session.earnedAmount.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </button>
                  </li>
                )
              })}
            </ul>
          ) : (
            <div className="py-8 text-center space-y-3">
              <p className="text-sm text-[#E8D5CE]">No sessions logged for this day.</p>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsManualModalOpen(true)}
                className="rounded-2xl border-white/20 bg-white/10 text-white hover:bg-white/20 cursor-pointer"
              >
                <Plus className="h-4 w-4" aria-hidden="true" />
                Log Session
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* DESKTOP VIEW (>= lg): 24-HOUR WEEKLY CALENDAR GRID */}
      <section aria-label="Weekly 24-hour calendar" className="hidden lg:block glass-card overflow-hidden">
        {/* Sticky Calendar Days Header */}
        <div className="grid grid-cols-[64px_repeat(7,1fr)] border-b border-white/10 bg-black/70 backdrop-blur-md sticky top-0 z-20">
          {/* Time Gutter Corner */}
          <div className="p-3 text-xs font-semibold text-[#CBB2AA] uppercase text-center border-r border-white/10 flex items-center justify-center">
            24h
          </div>

          {/* 7 Days Columns */}
          {weekDays.map((date) => {
            const isToday = date.toDateString() === now.toDateString()
            const dayName = date.toLocaleDateString("en-US", { weekday: "short" })
            const dayNum = date.getDate()

            return (
              <div
                key={date.toISOString()}
                className={`p-3 text-center border-r border-white/10 last:border-r-0 transition-colors ${
                  isToday ? "bg-orange-500/15" : ""
                }`}
              >
                <div className="text-xs font-mono uppercase tracking-wider text-[#E8D5CE]">
                  {dayName}
                </div>
                <div
                  className={`inline-flex items-center justify-center h-7 w-7 mt-1 rounded-full text-xs font-bold font-mono ${
                    isToday ? "bg-[#C2410C] text-white" : "text-white"
                  }`}
                >
                  {dayNum}
                </div>
              </div>
            )
          })}
        </div>

        {/* Scrollable 24-Hour Grid Container */}
        <div
          ref={gridScrollRef}
          tabIndex={0}
          role="region"
          aria-label="Scrollable 24-hour weekly timeline"
          className="relative overflow-y-auto max-h-[640px] select-none"
        >
          <div
            className="grid grid-cols-[64px_repeat(7,1fr)] relative"
            style={{ height: `${24 * HOUR_HEIGHT}px` }}
          >
            {/* 1. Time labels column (00:00 to 23:00) */}
            <div className="border-r border-white/10 bg-black/40">
              {hours.map((h) => (
                <div
                  key={h}
                  style={{ height: `${HOUR_HEIGHT}px` }}
                  className="relative border-b border-white/5 pr-2.5 pt-1 text-right text-[11px] font-mono text-[#CBB2AA]"
                >
                  <span>{h}</span>
                </div>
              ))}
            </div>

            {/* 2. Seven Day Columns */}
            {weekDays.map((dayDate) => {
              const isToday = dayDate.toDateString() === now.toDateString()
              const daySessions = getSessionsForDay(dayDate)

              return (
                <div
                  key={dayDate.toISOString()}
                  className={`relative border-r border-white/10 last:border-r-0 ${
                    isToday ? "bg-orange-500/[0.04]" : ""
                  }`}
                >
                  {/* Hour horizontal grid lines */}
                  {hours.map((_, i) => (
                    <div
                      key={i}
                      style={{ height: `${HOUR_HEIGHT}px` }}
                      className="border-b border-white/[0.06] hover:bg-white/[0.03] transition-colors"
                    />
                  ))}

                  {/* Current time indicator line */}
                  {isToday && isCurrentWeek && (
                    <div
                      aria-hidden="true"
                      style={{ top: `${currentIndicatorTop}px` }}
                      className="absolute left-0 right-0 z-30 pointer-events-none flex items-center"
                    >
                      <span className="h-2.5 w-2.5 rounded-full bg-amber-300 -ml-1 ring-2 ring-amber-300/40" />
                      <div className="h-0.5 w-full bg-amber-300 shadow-[0_0_8px_rgba(252,211,77,0.8)]" />
                    </div>
                  )}

                  {/* Sessions rendered as accessible interactive buttons */}
                  {daySessions.map((session) => {
                    const project = projects.find((p) => p.id === session.projectId)
                    const sDate = new Date(session.startTime)
                    const startMin = sDate.getHours() * 60 + sDate.getMinutes()
                    const topPx = (startMin / 60) * HOUR_HEIGHT
                    const heightPx = Math.max(
                      (session.durationSeconds / 3600) * HOUR_HEIGHT,
                      44
                    )
                    const durationMin = Math.round(session.durationSeconds / 60)

                    return (
                      <button
                        key={session.id}
                        type="button"
                        onClick={() => openEdit(session)}
                        style={{
                          top: `${topPx}px`,
                          height: `${heightPx}px`,
                          borderLeftColor: project?.color || "#F97316",
                        }}
                        className="group absolute inset-x-1 z-10 flex flex-col justify-between overflow-hidden rounded-xl bg-black/75 border border-white/15 border-l-4 p-2 text-left text-xs transition-all hover:z-20 hover:bg-black/85 hover:ring-1 hover:ring-white/40 cursor-pointer backdrop-blur-md"
                      >
                        <div className="min-w-0 w-full">
                          <div className="flex items-center justify-between gap-1 text-[11px] font-mono leading-none">
                            <span className="font-semibold text-[#FAF0EC] truncate">
                              @{project?.name || "Project"}
                            </span>
                            <span className="text-[#E8D5CE] tabular-nums shrink-0">
                              {format24h(session.startTime)}
                            </span>
                          </div>

                          <div className="mt-1 font-semibold text-white text-xs leading-tight line-clamp-2">
                            {capitalizeMemo(session.memo)}
                          </div>
                          {session.milestoneName && (
                            <div className="mt-0.5 text-[10px] text-amber-200 font-mono truncate flex items-center gap-1">
                              <Flag className="h-2.5 w-2.5 shrink-0 text-amber-300" aria-hidden="true" />
                              <span className="truncate">{session.milestoneName}</span>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center justify-between w-full text-[11px] font-mono mt-1 pt-1 border-t border-white/10">
                          <span className="text-[#CBB2AA]">{durationMin}m</span>
                          <span className="font-bold text-emerald-300">
                            +${session.earnedAmount.toFixed(2)}
                          </span>
                        </div>
                      </button>
                    )
                  })}
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Edit Session Modal */}
      {selectedSession && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="edit-session-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 glass-overlay animate-in fade-in"
        >
          <div className="w-full max-w-md glass-card p-6 space-y-4 animate-in zoom-in-95 max-h-[90dvh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h2 id="edit-session-title" className="text-lg font-bold text-white">
                Edit Session
              </h2>
              <AppTooltip content="Close" shortcut="Esc">
                <button
                  type="button"
                  aria-label="Close edit session dialog"
                  onClick={() => setSelectedSession(null)}
                  className="p-2 rounded-xl text-[#E8D5CE] hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <X className="h-5 w-5" aria-hidden="true" />
                </button>
              </AppTooltip>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label htmlFor="edit-memo" className="text-xs font-semibold text-[#FAF0EC] block mb-1.5">
                  Task Note / Memo
                </label>
                <Input
                  id="edit-memo"
                  value={editMemo}
                  onChange={(e) => setEditMemo(e.target.value)}
                  placeholder="What did you work on?"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label htmlFor="edit-minutes" className="text-xs font-semibold text-[#FAF0EC] block mb-1.5">
                    Duration (minutes)
                  </label>
                  <Input
                    id="edit-minutes"
                    type="number"
                    min="1"
                    value={editMinutes}
                    onChange={(e) => setEditMinutes(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label htmlFor="edit-rate" className="text-xs font-semibold text-[#FAF0EC] block mb-1.5">
                    Rate ($/h)
                  </label>
                  <Input
                    id="edit-rate"
                    type="number"
                    min="0"
                    value={editRate}
                    onChange={(e) => setEditRate(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="edit-project" className="text-xs font-semibold text-[#FAF0EC] block mb-1.5">
                  Project
                </label>
                <select
                  id="edit-project"
                  value={editProjectId}
                  onChange={(e) => setEditProjectId(e.target.value)}
                  className="w-full h-11 glass-input px-4 py-2 text-sm text-white outline-none focus:bg-black/60 transition-all cursor-pointer"
                >
                  {projects.map((p) => (
                    <option key={p.id} value={p.id} className="bg-zinc-900 text-white">
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-white/10">
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={() => {
                    deleteSession(selectedSession.id)
                    setSelectedSession(null)
                  }}
                  className="gap-1.5 h-10 rounded-full px-4 cursor-pointer"
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                  Delete
                </Button>

                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedSession(null)}
                    className="h-10 rounded-full px-4 text-[#E8D5CE] hover:text-white hover:bg-white/10 cursor-pointer"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    size="sm"
                    className="gap-1.5 h-10 rounded-full px-5 bg-[#C2410C] hover:bg-[#D44B12] text-white cursor-pointer"
                  >
                    <Check className="h-4 w-4" aria-hidden="true" />
                    Save
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Manual Add Session Modal */}
      {isManualModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="add-session-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 glass-overlay animate-in fade-in"
        >
          <div className="w-full max-w-md glass-card p-6 space-y-4 animate-in zoom-in-95 max-h-[90dvh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h2 id="add-session-title" className="text-lg font-bold text-white">
                Log Work Session
              </h2>
              <AppTooltip content="Close" shortcut="Esc">
                <button
                  type="button"
                  aria-label="Close log work session dialog"
                  onClick={() => setIsManualModalOpen(false)}
                  className="p-2 rounded-xl text-[#E8D5CE] hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <X className="h-5 w-5" aria-hidden="true" />
                </button>
              </AppTooltip>
            </div>

            <form onSubmit={handleCreateManual} className="space-y-4">
              <div>
                <label htmlFor="new-memo" className="text-xs font-semibold text-[#FAF0EC] block mb-1.5">
                  Session Memo
                </label>
                <Input
                  id="new-memo"
                  value={newMemo}
                  onChange={(e) => setNewMemo(e.target.value)}
                  placeholder="e.g. Design System tokens and SVG bezel"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label htmlFor="new-start-hour" className="text-xs font-semibold text-[#FAF0EC] block mb-1.5">
                    Start (24h)
                  </label>
                  <Input
                    id="new-start-hour"
                    type="number"
                    min="0"
                    max="23"
                    value={newStartHour}
                    onChange={(e) => setNewStartHour(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label htmlFor="new-minutes" className="text-xs font-semibold text-[#FAF0EC] block mb-1.5">
                    Duration (min)
                  </label>
                  <Input
                    id="new-minutes"
                    type="number"
                    min="1"
                    value={newMinutes}
                    onChange={(e) => setNewMinutes(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label htmlFor="new-rate" className="text-xs font-semibold text-[#FAF0EC] block mb-1.5">
                    Rate ($/h)
                  </label>
                  <Input
                    id="new-rate"
                    type="number"
                    min="0"
                    value={newRate}
                    onChange={(e) => setNewRate(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="new-project" className="text-xs font-semibold text-[#FAF0EC] block mb-1.5">
                  Project
                </label>
                <select
                  id="new-project"
                  value={newProjectId}
                  onChange={(e) => setNewProjectId(e.target.value)}
                  className="w-full h-11 glass-input px-4 py-2 text-sm text-white outline-none focus:bg-black/60 transition-all cursor-pointer"
                >
                  {projects.map((p) => (
                    <option key={p.id} value={p.id} className="bg-zinc-900 text-white">
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-white/10">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsManualModalOpen(false)}
                  className="h-10 rounded-full px-4 text-[#E8D5CE] hover:text-white hover:bg-white/10 cursor-pointer"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  className="gap-1.5 h-10 rounded-full px-5 bg-[#C2410C] hover:bg-[#D44B12] text-white cursor-pointer"
                >
                  <Check className="h-4 w-4" aria-hidden="true" />
                  Add to Calendar
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
