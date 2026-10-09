import { useState, useMemo } from "react"
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
} from "lucide-react"
import { useTrackerStore } from "@/entities/tracker"
import type { TimeSession } from "@/entities/session"
import { Button, Input, AppTooltip } from "@/shared/ui"
import { capitalizeMemo } from "@/shared/lib"

const HOUR_HEIGHT = 56 // px per hour in 24h grid

// Days of week helper
function getWeekDates(referenceDate: Date) {
  const current = new Date(referenceDate)
  const day = current.getDay()
  // Monday as first day of week (0 = Sun, 1 = Mon ... 6 = Sat)
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

  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedSession, setSelectedSession] = useState<TimeSession | null>(null)
  const [isManualModalOpen, setIsManualModalOpen] = useState(false)

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
    setCurrentDate(new Date())
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

    return sessions.filter(
      (s) => s.startTime >= startOfDay.getTime() && s.startTime <= endOfDay.getTime()
    )
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

    const targetDate = new Date(currentDate)
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

  // Current time position for today
  const now = new Date()
  const isCurrentWeek = weekDays.some(
    (d) => d.toDateString() === now.toDateString()
  )
  const currentMinutesToday = now.getHours() * 60 + now.getMinutes()
  const currentIndicatorTop = (currentMinutesToday / 60) * HOUR_HEIGHT

  return (
    <div className="container mx-auto max-w-7xl px-4 py-6 space-y-6">
      {/* Top Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            <span>Journal</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-orange-500/20 text-orange-400 border-none">
              24h Calendar
            </span>
          </h1>
          <p className="text-xs text-[#806060] mt-0.5">
            Visual weekly timeline of tracked work sessions, hours, and accrued value.
          </p>
        </div>

        {/* Date Navigation & Actions */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center rounded-2xl bg-black/40 border border-white/10 p-1 backdrop-blur-xl">
            <AppTooltip content="Previous week">
              <button
                onClick={prevWeek}
                className="p-1.5 rounded-xl text-[#806060] hover:bg-white/10 hover:text-white transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
            </AppTooltip>
            <button
              onClick={goToday}
              className="px-3 py-1 text-xs font-semibold text-white/90 hover:text-white"
            >
              Today
            </button>
            <AppTooltip content="Next week">
              <button
                onClick={nextWeek}
                className="p-1.5 rounded-xl text-[#806060] hover:bg-white/10 hover:text-white transition-colors"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </AppTooltip>
          </div>

          <span className="font-mono text-xs font-semibold text-white/80 px-3 py-1.5 rounded-xl bg-black/30 border border-white/10">
            {weekLabel}
          </span>

          <Button
            size="sm"
            onClick={() => setIsManualModalOpen(true)}
            className="gap-1.5 rounded-xl bg-orange-600 text-white hover:bg-orange-500 shadow-none"
          >
            <Plus className="h-4 w-4" />
            <span>Add Session</span>
          </Button>
        </div>
      </div>

      {/* Week Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="flex items-center justify-between p-3.5 rounded-2xl bg-black/40 border border-white/10 backdrop-blur-xl">
          <div>
            <span className="text-[11px] font-mono text-[#6E5353] uppercase tracking-wider block">
              Week Hours
            </span>
            <span className="text-xl font-bold font-mono text-white tabular-nums">
              {weekStats.hours} h
            </span>
          </div>
          <div className="h-9 w-9 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center">
            <Clock className="h-4 w-4" />
          </div>
        </div>

        <div className="flex items-center justify-between p-3.5 rounded-2xl bg-black/40 border border-white/10 backdrop-blur-xl">
          <div>
            <span className="text-[11px] font-mono text-[#6E5353] uppercase tracking-wider block">
              Week Billing
            </span>
            <span className="text-xl font-bold font-mono text-emerald-400 tabular-nums">
              ${weekStats.earned}
            </span>
          </div>
          <div className="h-9 w-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <DollarSign className="h-4 w-4" />
          </div>
        </div>

        <div className="flex items-center justify-between p-3.5 rounded-2xl bg-black/40 border border-white/10 backdrop-blur-xl">
          <div>
            <span className="text-[11px] font-mono text-[#6E5353] uppercase tracking-wider block">
              Sessions Logged
            </span>
            <span className="text-xl font-bold font-mono text-white tabular-nums">
              {weekStats.count}
            </span>
          </div>
          <div className="h-9 w-9 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
            <CalendarIcon className="h-4 w-4" />
          </div>
        </div>
      </div>

      {/* 24-HOUR WEEKLY CALENDAR GRID */}
      <div className="glass-card overflow-hidden">
        {/* Sticky Calendar Days Header */}
        <div className="grid grid-cols-[60px_repeat(7,1fr)] border-b border-white/10 bg-black/70 backdrop-blur-md sticky top-0 z-20">
          {/* Time Gutter Corner */}
          <div className="p-3 text-[10px] font-semibold text-[#6E5353] uppercase text-center border-r border-white/10">
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
                className={`p-2.5 text-center border-r border-white/10 last:border-r-0 transition-colors ${
                  isToday ? "bg-orange-500/10" : ""
                }`}
              >
                <div className="text-[10px] font-mono uppercase tracking-wider text-[#6E5353]">
                  {dayName}
                </div>
                <div
                  className={`inline-flex items-center justify-center h-6 w-6 mt-0.5 rounded-full text-xs font-bold font-mono ${
                    isToday
                      ? "bg-orange-600 text-white"
                      : "text-white"
                  }`}
                >
                  {dayNum}
                </div>
              </div>
            )
          })}
        </div>

        {/* Scrollable 24-Hour Grid Container (starts scrolled around workday 08:00) */}
        <div className="relative overflow-y-auto max-h-[640px] select-none">
          <div
            className="grid grid-cols-[60px_repeat(7,1fr)] relative"
            style={{ height: `${24 * HOUR_HEIGHT}px` }}
          >
            {/* 1. Time labels column (00:00 to 23:00) */}
            <div className="border-r border-white/10 bg-black/40">
              {hours.map((h) => (
                <div
                  key={h}
                  style={{ height: `${HOUR_HEIGHT}px` }}
                  className="relative border-b border-white/5 pr-2 pt-1 text-right text-[10px] text-[#6E5353]"
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
                    isToday ? "bg-orange-500/[0.03]" : ""
                  }`}
                >
                  {/* Hour horizontal grid lines */}
                  {hours.map((_, i) => (
                    <div
                      key={i}
                      style={{ height: `${HOUR_HEIGHT}px` }}
                      className="border-b border-white/[0.06] hover:bg-white/[0.02] transition-colors"
                    />
                  ))}

                  {/* Red/amber "Now" line for Today's column */}
                  {isToday && isCurrentWeek && (
                    <div
                      style={{ top: `${currentIndicatorTop}px` }}
                      className="absolute left-0 right-0 z-30 pointer-events-none flex items-center"
                    >
                      <span className="h-2 w-2 rounded-full bg-orange-500 -ml-1 ring-2 ring-orange-400/50 animate-pulse" />
                      <div className="h-0.5 w-full bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.8)]" />
                    </div>
                  )}

                  {/* Sessions rendered as visual blocks */}
                  {daySessions.map((session) => {
                    const project = projects.find((p) => p.id === session.projectId)
                    const sDate = new Date(session.startTime)
                    const startMin = sDate.getHours() * 60 + sDate.getMinutes()
                    const topPx = (startMin / 60) * HOUR_HEIGHT
                    const heightPx = Math.max(
                      (session.durationSeconds / 3600) * HOUR_HEIGHT,
                      32
                    )

                    const durationMin = Math.round(session.durationSeconds / 60)

                    return (
                      <div
                        key={session.id}
                        onClick={() => openEdit(session)}
                        style={{
                          top: `${topPx}px`,
                          height: `${heightPx}px`,
                          backgroundColor: `${project?.color || "#F97316"}25`,
                          borderColor: `${project?.color || "#F97316"}75`,
                        }}
                        className="group absolute inset-x-1 z-10 flex flex-col justify-between overflow-hidden rounded-xl border p-2 text-xs transition-all hover:z-20 hover:scale-[1.02] hover:shadow-xl hover:ring-1 hover:ring-white/40 cursor-pointer backdrop-blur-sm"
                      >
                        {/* Top tag & time */}
                        <div>
                          <div className="flex items-center justify-between gap-1 text-[10px] font-mono leading-none">
                            <span
                              className="font-bold truncate"
                              style={{ color: project?.color || "#F97316" }}
                            >
                              @{project?.name || "Project"}
                            </span>
                            <span className="text-[#806060] tabular-nums">
                              {format24h(session.startTime)}
                            </span>
                          </div>

                          <div className="mt-1 font-semibold text-white text-[11px] leading-tight line-clamp-2">
                            {capitalizeMemo(session.memo)}
                          </div>
                        </div>

                        {/* Bottom value & duration */}
                        <div className="flex items-center justify-between text-[10px] font-mono mt-1 pt-1 border-t border-white/10">
                          <span className="text-[#806060]">{durationMin}m</span>
                          <span className="font-bold text-emerald-400">
                            +${session.earnedAmount.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Edit Session Modal */}
      {selectedSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 glass-overlay animate-in fade-in">
          <div className="w-full max-w-md glass-card p-6 space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">Edit Session</h3>
              <AppTooltip content="Close" shortcut="Esc">
                <button
                  type="button"
                  onClick={() => setSelectedSession(null)}
                  className="p-1 rounded-xl text-[#806060] hover:text-white hover:bg-white/10 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </AppTooltip>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-white/80 block mb-1">
                  Task Note / Memo
                </label>
                <Input
                  value={editMemo}
                  onChange={(e) => setEditMemo(e.target.value)}
                  placeholder="What did you work on?"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-white/80 block mb-1">
                    Duration (minutes)
                  </label>
                  <Input
                    type="number"
                    min="1"
                    value={editMinutes}
                    onChange={(e) => setEditMinutes(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-white/80 block mb-1">
                    Rate ($/h)
                  </label>
                  <Input
                    type="number"
                    min="0"
                    value={editRate}
                    onChange={(e) => setEditRate(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-white/80 block mb-1">
                  Project
                </label>
                <select
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

              <div className="flex items-center justify-between pt-3 border-t border-white/10">
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={() => {
                    deleteSession(selectedSession.id)
                    setSelectedSession(null)
                  }}
                  className="gap-1.5"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </Button>

                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedSession(null)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" size="sm" className="gap-1.5 bg-orange-600 hover:bg-orange-500">
                    <Check className="h-4 w-4" />
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 glass-overlay animate-in fade-in">
          <div className="w-full max-w-md glass-card p-6 space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">Log Work Session</h3>
              <AppTooltip content="Close" shortcut="Esc">
                <button
                  type="button"
                  onClick={() => setIsManualModalOpen(false)}
                  className="p-1 rounded-xl text-[#806060] hover:text-white hover:bg-white/10 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </AppTooltip>
            </div>

            <form onSubmit={handleCreateManual} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-white/80 block mb-1">
                  Session Memo
                </label>
                <Input
                  value={newMemo}
                  onChange={(e) => setNewMemo(e.target.value)}
                  placeholder="e.g. Design System tokens and SVG bezel"
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-xs font-semibold text-white/80 block mb-1">
                    Start (24h)
                  </label>
                  <Input
                    type="number"
                    min="0"
                    max="23"
                    value={newStartHour}
                    onChange={(e) => setNewStartHour(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-white/80 block mb-1">
                    Duration (min)
                  </label>
                  <Input
                    type="number"
                    min="1"
                    value={newMinutes}
                    onChange={(e) => setNewMinutes(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-white/80 block mb-1">
                    Rate ($/h)
                  </label>
                  <Input
                    type="number"
                    min="0"
                    value={newRate}
                    onChange={(e) => setNewRate(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-white/80 block mb-1">
                  Project
                </label>
                <select
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
                  variant="outline"
                  size="sm"
                  onClick={() => setIsManualModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" size="sm" className="gap-1.5 bg-orange-600 hover:bg-orange-500">
                  <Check className="h-4 w-4" />
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
