import { useState, useMemo } from "react"
import {
  Copy,
  Check,
  TrendingUp,
  Clock,
  DollarSign,
  PieChart,
  FileSpreadsheet,
} from "lucide-react"
import { useTrackerStore } from "@/entities/tracker"
import { Button, Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/shared/ui"

export function ReportsView() {
  const { sessions, projects } = useTrackerStore()
  const [period, setPeriod] = useState<"all" | "week" | "month">("month")
  const [copiedReport, setCopiedReport] = useState(false)

  const filteredSessions = useMemo(() => {
    const now = new Date()
    const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
    const weekAgo = todayMidnight - 7 * 86400000
    const monthAgo = todayMidnight - 30 * 86400000

    if (period === "week") {
      return sessions.filter((s) => s.startTime >= weekAgo)
    }
    if (period === "month") {
      return sessions.filter((s) => s.startTime >= monthAgo)
    }
    return sessions
  }, [sessions, period])

  // Calculated overall metrics
  const metrics = useMemo(() => {
    const totalSeconds = filteredSessions.reduce((acc, s) => acc + s.durationSeconds, 0)
    const totalEarned = filteredSessions.reduce((acc, s) => acc + s.earnedAmount, 0)
    const totalHours = totalSeconds / 3600
    const effectiveRate = totalHours > 0 ? totalEarned / totalHours : 0

    return {
      totalHours: totalHours.toFixed(1),
      totalEarned: totalEarned.toFixed(2),
      effectiveRate: effectiveRate.toFixed(2),
      sessionCount: filteredSessions.length,
    }
  }, [filteredSessions])

  // Breakdown by project
  const projectBreakdown = useMemo(() => {
    const map: Record<string, { seconds: number; earned: number; count: number }> = {}

    filteredSessions.forEach((s) => {
      if (!map[s.projectId]) {
        map[s.projectId] = { seconds: 0, earned: 0, count: 0 }
      }
      map[s.projectId].seconds += s.durationSeconds
      map[s.projectId].earned += s.earnedAmount
      map[s.projectId].count += 1
    })

    const totalSecs = filteredSessions.reduce((acc, s) => acc + s.durationSeconds, 0) || 1

    return Object.entries(map)
      .map(([projId, data]) => {
        const proj = projects.find((p) => p.id === projId) || {
          name: "Unknown",
          slug: "unknown",
          color: "#71717a",
        }
        const pct = Math.round((data.seconds / totalSecs) * 100)
        return {
          id: projId,
          name: proj.name,
          color: proj.color,
          hours: (data.seconds / 3600).toFixed(1),
          earned: data.earned.toFixed(2),
          count: data.count,
          percentage: pct,
        }
      })
      .sort((a, b) => b.percentage - a.percentage)
  }, [filteredSessions, projects])

  // Export to CSV
  const handleExportCsv = () => {
    const headers = ["Date", "Project", "Memo", "Duration (min)", "Rate ($/h)", "Earned ($)"]
    const rows = filteredSessions.map((s) => {
      const p = projects.find((proj) => proj.id === s.projectId)
      const dateStr = new Date(s.startTime).toLocaleDateString("en-US")
      const mins = Math.round(s.durationSeconds / 60)
      return [
        `"${dateStr}"`,
        `"${p?.name || s.projectId}"`,
        `"${s.memo.replace(/"/g, '""')}"`,
        mins,
        s.rateSnapshot,
        s.earnedAmount.toFixed(2),
      ].join(",")
    })

    const csvContent = "\uFEFF" + [headers.join(","), ...rows].join("\n")
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `kerd_report_${period}_${new Date().toISOString().slice(0, 10)}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  // Copy Formatted Text report to clipboard
  const handleCopyTextReport = async () => {
    const lines = [
      `Kerd Value & Time Report (${
        period === "week" ? "Last 7 Days" : period === "month" ? "Last 30 Days" : "All Time"
      })`,
      `==================================`,
      `Total Hours: ${metrics.totalHours} h`,
      `Total Earned: $${metrics.totalEarned}`,
      `Effective Hourly Rate: $${metrics.effectiveRate}/h`,
      `Total Sessions: ${metrics.sessionCount}`,
      ``,
      `Project Breakdown:`,
      ...projectBreakdown.map(
        (b) => `• ${b.name}: ${b.hours} h ($${b.earned}) — ${b.percentage}% time`
      ),
    ]

    await navigator.clipboard.writeText(lines.join("\n"))
    setCopiedReport(true)
    setTimeout(() => setCopiedReport(false), 2500)
  }

  return (
    <div className="container mx-auto max-w-6xl px-4 sm:px-6 py-6 sm:py-8 space-y-6 sm:space-y-8">
      {/* Top Header */}
      <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Reports & Value
          </h1>
          <p className="text-sm text-[#FAF0EC]">
            Effective hourly yield, billable hours analytics, and data export.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Period selector */}
          <div
            role="group"
            aria-label="Report time period"
            className="flex rounded-2xl bg-black/50 p-1 text-xs font-semibold backdrop-blur-2xl"
          >
            {(
              [
                { key: "week", label: "7 Days" },
                { key: "month", label: "30 Days" },
                { key: "all", label: "All Time" },
              ] as const
            ).map((opt) => (
              <button
                key={opt.key}
                type="button"
                aria-pressed={period === opt.key}
                onClick={() => setPeriod(opt.key)}
                className={`px-3.5 h-8 rounded-xl transition-colors cursor-pointer ${
                  period === opt.key
                    ? "bg-white/20 text-white"
                    : "text-[#E8D5CE] hover:text-white hover:bg-white/10"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyTextReport}
            className="h-10 gap-1.5 rounded-2xl border-none bg-black/50 text-white hover:bg-black/70 px-4 backdrop-blur-2xl cursor-pointer"
          >
            {copiedReport ? (
              <Check className="h-4 w-4 text-emerald-300" aria-hidden="true" />
            ) : (
              <Copy className="h-4 w-4" aria-hidden="true" />
            )}
            <span aria-live="polite">{copiedReport ? "Copied" : "Copy Summary"}</span>
          </Button>

          <Button
            size="sm"
            onClick={handleExportCsv}
            className="h-10 gap-1.5 rounded-2xl bg-[#C2410C] text-white hover:bg-[#D44B12] px-4 shadow-none cursor-pointer"
          >
            <FileSpreadsheet className="h-4 w-4" aria-hidden="true" />
            <span>Export CSV</span>
          </Button>
        </div>
      </header>

      {/* 4 Summary Cards (2x2 on mobile, 4-col on lg) */}
      <section aria-label="Key metrics" className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card className="py-5 gap-3">
          <CardHeader className="pb-0 px-4 sm:px-6">
            <div className="flex items-center justify-between gap-2 text-[#E8D5CE]">
              <span className="text-xs font-medium">Billable Hours</span>
              <Clock className="h-4 w-4 text-orange-300 shrink-0" aria-hidden="true" />
            </div>
            <CardTitle className="text-2xl sm:text-3xl font-bold font-mono tracking-tight text-white tabular-nums mt-1">
              {metrics.totalHours} h
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 px-4 sm:px-6 text-xs text-[#CBB2AA] font-mono">
            {metrics.sessionCount} sessions
          </CardContent>
        </Card>

        <Card className="py-5 gap-3">
          <CardHeader className="pb-0 px-4 sm:px-6">
            <div className="flex items-center justify-between gap-2 text-[#E8D5CE]">
              <span className="text-xs font-medium">Total Value</span>
              <DollarSign className="h-4 w-4 text-emerald-300 shrink-0" aria-hidden="true" />
            </div>
            <CardTitle className="text-2xl sm:text-3xl font-bold font-mono tracking-tight text-emerald-300 tabular-nums mt-1">
              ${metrics.totalEarned}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 px-4 sm:px-6 text-xs text-[#CBB2AA] font-mono">
            Accrued revenue
          </CardContent>
        </Card>

        <Card className="py-5 gap-3">
          <CardHeader className="pb-0 px-4 sm:px-6">
            <div className="flex items-center justify-between gap-2 text-[#E8D5CE]">
              <span className="text-xs font-medium">Effective Rate</span>
              <TrendingUp className="h-4 w-4 text-amber-300 shrink-0" aria-hidden="true" />
            </div>
            <CardTitle className="text-2xl sm:text-3xl font-bold font-mono tracking-tight text-amber-300 tabular-nums mt-1">
              ${metrics.effectiveRate}/h
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 px-4 sm:px-6 text-xs text-[#CBB2AA] font-mono">
            Avg return / hr
          </CardContent>
        </Card>

        <Card className="py-5 gap-3">
          <CardHeader className="pb-0 px-4 sm:px-6">
            <div className="flex items-center justify-between gap-2 text-[#E8D5CE]">
              <span className="text-xs font-medium">Active Clients</span>
              <PieChart className="h-4 w-4 text-indigo-300 shrink-0" aria-hidden="true" />
            </div>
            <CardTitle className="text-2xl sm:text-3xl font-bold font-mono tracking-tight text-white tabular-nums mt-1">
              {projectBreakdown.length}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 px-4 sm:px-6 text-xs text-[#CBB2AA] font-mono">
            In period
          </CardContent>
        </Card>
      </section>

      {/* Project Distribution Breakdown */}
      <Card className="py-6">
        <CardHeader className="px-5 sm:px-6">
          <CardTitle className="text-lg font-bold text-white">
            <h2>Client Distribution</h2>
          </CardTitle>
          <CardDescription className="text-sm text-[#E8D5CE]">
            Share of tracked time and monetary value by project
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5 px-5 sm:px-6">
          {projectBreakdown.length > 0 ? (
            <ul className="space-y-5">
              {projectBreakdown.map((item) => (
                <li key={item.id} className="space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 text-sm">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span
                        aria-hidden="true"
                        className="h-2.5 w-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="font-semibold text-white truncate">{item.name}</span>
                      <span className="text-xs text-[#CBB2AA] shrink-0">
                        ({item.count} {item.count === 1 ? "session" : "sessions"})
                      </span>
                    </div>
                    <div className="flex items-center justify-between sm:justify-end gap-4 font-mono text-xs sm:text-sm pl-5 sm:pl-0">
                      <span className="text-[#E8D5CE] tabular-nums">{item.hours} h</span>
                      <span className="font-bold text-emerald-300 tabular-nums">
                        +${item.earned}
                      </span>
                      <span className="text-[#FAF0EC] font-semibold tabular-nums min-w-[3rem] text-right">
                        {item.percentage}%
                      </span>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div
                    role="progressbar"
                    aria-label={`${item.name} share of tracked time`}
                    aria-valuenow={item.percentage}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    className="h-2.5 w-full rounded-full bg-white/10 overflow-hidden"
                  >
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${item.percentage}%`,
                        backgroundColor: item.color,
                      }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="py-8 text-center">
              <p className="text-sm text-[#E8D5CE]">
                No sessions tracked during this period yet.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
