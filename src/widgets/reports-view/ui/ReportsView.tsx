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

    return Object.entries(map).map(([projId, data]) => {
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
      `📊 Kerd Value & Time Report (${period === "week" ? "Last 7 Days" : period === "month" ? "Last 30 Days" : "All Time"})`,
      `==================================`,
      `⏱ Total Hours: ${metrics.totalHours} h`,
      `💵 Total Earned: $${metrics.totalEarned}`,
      `📈 Effective Hourly Rate: $${metrics.effectiveRate}/h`,
      `📋 Total Sessions: ${metrics.sessionCount}`,
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
    <div className="container mx-auto max-w-6xl px-4 py-8 space-y-8 select-none">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Reports & Value</h1>
          <p className="text-xs text-[#806060] mt-1">
            Effective hourly yield, billable hours analytics, and data export.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Period selector */}
          <div className="flex rounded-2xl bg-black/40 p-1 border border-white/10 text-xs font-semibold backdrop-blur-xl">
            <button
              onClick={() => setPeriod("week")}
              className={`px-3 py-1 rounded-xl transition-colors ${
                period === "week" ? "bg-white/15 text-white" : "text-[#806060] hover:text-white"
              }`}
            >
              7 Days
            </button>
            <button
              onClick={() => setPeriod("month")}
              className={`px-3 py-1 rounded-xl transition-colors ${
                period === "month" ? "bg-white/15 text-white" : "text-[#806060] hover:text-white"
              }`}
            >
              30 Days
            </button>
            <button
              onClick={() => setPeriod("all")}
              className={`px-3 py-1 rounded-xl transition-colors ${
                period === "all" ? "bg-white/15 text-white" : "text-[#806060] hover:text-white"
              }`}
            >
              All Time
            </button>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyTextReport}
            className="gap-1.5 rounded-2xl border-white/15 bg-black/40 text-white hover:bg-black/60"
          >
            {copiedReport ? (
              <Check className="h-4 w-4 text-emerald-400" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
            <span>{copiedReport ? "Copied" : "Copy Summary"}</span>
          </Button>

          <Button
            size="sm"
            onClick={handleExportCsv}
            className="gap-1.5 rounded-2xl bg-orange-600 text-white hover:bg-orange-500 shadow-none"
          >
            <FileSpreadsheet className="h-4 w-4" />
            <span>Export CSV</span>
          </Button>
        </div>
      </div>

      {/* 4 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-white/10 bg-black/40 backdrop-blur-2xl">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between text-[#6E5353]">
              <span className="text-xs font-mono uppercase tracking-wider">Billable Hours</span>
              <Clock className="h-4 w-4 text-orange-400" />
            </div>
            <CardTitle className="text-3xl font-bold font-mono tracking-tight text-white tabular-nums">
              {metrics.totalHours} h
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 text-[11px] text-[#6E5353] font-mono">
            Across {metrics.sessionCount} logged sessions
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-black/40 backdrop-blur-2xl">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between text-[#6E5353]">
              <span className="text-xs font-mono uppercase tracking-wider">Total Value</span>
              <DollarSign className="h-4 w-4 text-emerald-400" />
            </div>
            <CardTitle className="text-3xl font-bold font-mono tracking-tight text-emerald-400 tabular-nums">
              ${metrics.totalEarned}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 text-[11px] text-[#6E5353] font-mono">
            Accrued via project rates
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-black/40 backdrop-blur-2xl">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between text-[#6E5353]">
              <span className="text-xs font-mono uppercase tracking-wider">Effective Rate</span>
              <TrendingUp className="h-4 w-4 text-amber-400" />
            </div>
            <CardTitle className="text-3xl font-bold font-mono tracking-tight text-amber-400 tabular-nums">
              ${metrics.effectiveRate}/h
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 text-[11px] text-[#6E5353] font-mono">
            Average return per tracked hour
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-black/40 backdrop-blur-2xl">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between text-[#6E5353]">
              <span className="text-xs font-mono uppercase tracking-wider">Active Clients</span>
              <PieChart className="h-4 w-4 text-indigo-400" />
            </div>
            <CardTitle className="text-3xl font-bold font-mono tracking-tight text-white tabular-nums">
              {projectBreakdown.length}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 text-[11px] text-[#6E5353] font-mono">
            Contributing in period
          </CardContent>
        </Card>
      </div>

      {/* Project Distribution Breakdown */}
      <Card className="border-white/10 bg-black/40 backdrop-blur-2xl">
        <CardHeader>
          <CardTitle className="text-lg font-bold text-white">Client Distribution</CardTitle>
          <CardDescription className="text-xs text-[#806060]">
            Share of tracked time and monetary value by project
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {projectBreakdown.map((item) => (
            <div key={item.id} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="font-semibold text-white">{item.name}</span>
                  <span className="text-[#6E5353]">({item.count} sessions)</span>
                </div>
                <div className="flex items-center gap-3 font-mono">
                  <span className="text-[#806060] tabular-nums">{item.hours} h</span>
                  <span className="font-bold text-emerald-400 tabular-nums">+${item.earned}</span>
                  <span className="text-[#6E5353] font-semibold tabular-nums w-8 text-right">
                    {item.percentage}%
                  </span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${item.percentage}%`,
                    backgroundColor: item.color,
                  }}
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
