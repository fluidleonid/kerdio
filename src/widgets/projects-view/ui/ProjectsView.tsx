import { useState, useMemo } from "react"
import { Plus, Trash2, Edit3, Check, Flag, ChevronDown } from "lucide-react"
import { useTrackerStore } from "@/entities/tracker"
import type { Project, BillingType } from "@/entities/project"
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Badge,
  AppTooltip,
} from "@/shared/ui"
import { slugify } from "@/shared/lib"
import { ProjectSettingsDialog } from "./ProjectSettingsDialog"

export function ProjectsView() {
  const {
    projects,
    sessions,
    addProject,
    updateProject,
    deleteProject,
    toggleMilestoneStatus,
    addProjectMilestone,
  } = useTrackerStore()

  const [isAddOpen, setIsAddOpen] = useState(false)
  const [editingProj, setEditingProj] = useState<Project | null>(null)
  const [expandedMilestones, setExpandedMilestones] = useState<Record<string, boolean>>({})
  const [addingMilestoneForProjId, setAddingMilestoneForProjId] = useState<string | null>(null)
  const [newMsName, setNewMsName] = useState("")
  const [newMsAmount, setNewMsAmount] = useState("")

  // Calculated metrics per project (sum of delivered milestones for milestone projects)
  const projectStats = useMemo(() => {
    const stats: Record<
      string,
      {
        totalSeconds: number
        totalEarned: number
        count: number
        milestoneCount: number
        deliveredCount: number
      }
    > = {}

    projects.forEach((p) => {
      const deliveredMs = (p.milestones || []).filter((m) => m.status === "delivered")
      const deliveredTotal = deliveredMs.reduce((sum, m) => sum + m.amount, 0)
      const isMilestoneProj =
        p.billingType === "milestone" || (p.milestones && p.milestones.length > 0)

      stats[p.id] = {
        totalSeconds: 0,
        totalEarned: isMilestoneProj ? deliveredTotal : 0,
        count: 0,
        milestoneCount: p.milestones?.length || 0,
        deliveredCount: deliveredMs.length,
      }
    })

    sessions.forEach((s) => {
      if (stats[s.projectId]) {
        stats[s.projectId].totalSeconds += s.durationSeconds
        stats[s.projectId].count += 1

        const proj = projects.find((p) => p.id === s.projectId)
        const isMilestoneProj =
          proj?.billingType === "milestone" || (proj?.milestones && proj.milestones.length > 0)

        if (!isMilestoneProj) {
          if (s.billingType === "fixed" || proj?.billingType === "fixed") {
            if (stats[s.projectId].count === 1) {
              stats[s.projectId].totalEarned = proj?.fixedBudget || s.earnedAmount || 0
            }
          } else {
            stats[s.projectId].totalEarned += s.earnedAmount
          }
        }
      }
    })

    return stats
  }, [projects, sessions])

  const openNew = () => {
    setEditingProj(null)
    setIsAddOpen(true)
  }

  const openEdit = (p: Project) => {
    setEditingProj(p)
    setIsAddOpen(true)
  }

  const handleSaveProject = (data: {
    name: string
    color: string
    billingType: BillingType
    hourlyRate: number
    fixedBudget: number
    currency: string
  }) => {
    const autoSlug = slugify(data.name)
    if (editingProj) {
      updateProject(editingProj.id, {
        ...data,
        slug: autoSlug,
      })
    } else {
      addProject({
        ...data,
        slug: autoSlug,
      })
    }
    setIsAddOpen(false)
    setEditingProj(null)
  }

  return (
    <div className="container mx-auto max-w-6xl px-4 sm:px-6 py-6 sm:py-8 space-y-6 sm:space-y-8">
      {/* Top Header */}
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Projects & Billing
          </h1>
          <p className="text-sm text-[#FAF0EC]">
            Client project registry with billing models, hourly rates, and accrued revenue.
          </p>
        </div>

        <Button
          onClick={openNew}
          className="h-10 gap-1.5 rounded-2xl bg-[#C2410C] text-white hover:bg-[#D44B12] px-4 shadow-none cursor-pointer self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          <span>New Project</span>
        </Button>
      </header>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {projects.map((p) => {
          const stats = projectStats[p.id] || {
            totalSeconds: 0,
            totalEarned: 0,
            count: 0,
            milestoneCount: 0,
            deliveredCount: 0,
          }
          const hours = (stats.totalSeconds / 3600).toFixed(1)

          return (
            <Card
              key={p.id}
              className="relative overflow-hidden hover:bg-black/60 transition-all group flex flex-col justify-between gap-4 py-5"
            >
              {/* Top Accent Strip */}
              <div
                aria-hidden="true"
                className="absolute top-0 left-0 right-0 h-1"
                style={{ backgroundColor: p.color }}
              />

              <CardHeader className="pb-0 px-5 sm:px-6">
                <div className="flex items-center justify-between gap-2">
                  {/* Unified high-contrast project pill matching Page 1 ProjectBadge */}
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-white min-w-0">
                    <span
                      aria-hidden="true"
                      className="h-2 w-2 rounded-full shrink-0"
                      style={{ backgroundColor: p.color }}
                    />
                    <span className="truncate">@{p.slug || p.name}</span>
                  </span>

                  <Badge
                    variant="secondary"
                    className="text-[11px] uppercase font-semibold border-none bg-white/10 text-[#FAF0EC] shrink-0"
                  >
                    {p.billingType === "hourly"
                      ? "Hourly"
                      : p.billingType === "fixed"
                      ? "Fixed"
                      : p.billingType === "milestone"
                      ? "Milestone"
                      : "Non-billable"}
                  </Badge>
                </div>

                <CardTitle className="text-lg font-bold text-white mt-3 group-hover:text-amber-100 transition-colors">
                  <h2>{p.name}</h2>
                </CardTitle>
                <CardDescription className="text-xs font-mono text-[#E8D5CE]">
                  {p.billingType === "hourly"
                    ? `Rate: ${p.currency}${p.hourlyRate}/h`
                    : p.billingType === "milestone"
                    ? `Milestone: ${p.currency}${p.fixedBudget || 500} per milestone`
                    : p.billingType === "fixed"
                    ? `Budget: ${p.currency}${p.fixedBudget || 0} total`
                    : "Non-billable (Free focus)"}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4 pt-0 px-5 sm:px-6 flex-1 flex flex-col justify-between">
                <div className="space-y-4">
                  {/* Metrics */}
                  <div className="grid grid-cols-2 gap-3 pt-3 border-t border-white/10">
                    <div>
                      <span className="text-xs text-[#CBB2AA] block">Tracked</span>
                      <span className="font-mono font-bold text-white text-sm tabular-nums mt-0.5 block">
                        {hours} h{" "}
                        <span className="font-normal text-[#E8D5CE] text-xs">
                          ({stats.count})
                        </span>
                      </span>
                    </div>
                    <div>
                      <span className="text-xs text-[#CBB2AA] block">
                        {p.billingType === "milestone" ? "Milestones Total" : "Accrued"}
                      </span>
                      <span className="font-mono font-bold text-emerald-300 text-sm tabular-nums mt-0.5 block">
                        {p.billingType === "milestone" && stats.milestoneCount > 0
                          ? `${stats.milestoneCount} m. • ${p.currency}${stats.totalEarned.toFixed(0)}`
                          : `${p.currency}${stats.totalEarned.toFixed(2)}`}
                      </span>
                    </div>
                  </div>

                  {/* Project Milestones List & Collected Memos */}
                  {((p.milestones && p.milestones.length > 0) ||
                    addingMilestoneForProjId === p.id) && (
                    <div className="space-y-2.5 pt-3 border-t border-white/10">
                      <div className="flex items-center justify-between gap-2 text-xs font-semibold">
                        <span className="flex items-center gap-1.5 text-white">
                          <Flag className="h-3.5 w-3.5 text-amber-300" aria-hidden="true" />
                          Milestones ({p.milestones?.length || 0})
                        </span>
                        <div className="flex items-center gap-2.5">
                          {p.milestones && p.milestones.length > 0 && (
                            <span className="text-xs text-emerald-300 font-medium">
                              {p.milestones.filter((m) => m.status === "delivered").length} delivered
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={() => {
                              setAddingMilestoneForProjId(
                                addingMilestoneForProjId === p.id ? null : p.id
                              )
                              setNewMsName(`M ${(p.milestones?.length || 0) + 1} `)
                              setNewMsAmount("1500")
                            }}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs text-amber-200 hover:text-white hover:bg-white/10 font-semibold transition-colors cursor-pointer"
                          >
                            <Plus className="h-3 w-3" aria-hidden="true" />
                            <span>Add</span>
                          </button>
                        </div>
                      </div>

                      {/* Inline Add Milestone Form */}
                      {addingMilestoneForProjId === p.id && (
                        <div className="p-3 rounded-2xl bg-white/[0.06] space-y-2.5 animate-in fade-in duration-150">
                          <div className="text-xs font-semibold text-white">
                            New Project Milestone
                          </div>
                          <div className="flex flex-col sm:flex-row gap-2">
                            <input
                              type="text"
                              aria-label="Milestone title"
                              placeholder="e.g. M 3 Backend API"
                              value={newMsName}
                              onChange={(e) => setNewMsName(e.target.value)}
                              className="flex-1 h-9 rounded-xl bg-black/50 px-3 text-xs text-white placeholder:text-[#CBB2AA] outline-none"
                            />
                            <div className="relative w-full sm:w-28">
                              <span
                                aria-hidden="true"
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-[#E8D5CE]"
                              >
                                $
                              </span>
                              <input
                                type="number"
                                aria-label="Milestone amount"
                                placeholder="Amount"
                                value={newMsAmount}
                                onChange={(e) => setNewMsAmount(e.target.value)}
                                className="w-full h-9 rounded-xl bg-black/50 pl-7 pr-2.5 text-xs text-white placeholder:text-[#CBB2AA] outline-none font-mono"
                              />
                            </div>
                          </div>
                          <div className="flex justify-end gap-2 pt-1">
                            <button
                              type="button"
                              onClick={() => setAddingMilestoneForProjId(null)}
                              className="px-3 py-1.5 rounded-xl text-xs text-[#E8D5CE] hover:text-white hover:bg-white/10 cursor-pointer"
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                if (!newMsName.trim()) return
                                addProjectMilestone(p.id, {
                                  name: newMsName.trim(),
                                  amount: parseFloat(newMsAmount) || 1000,
                                  status: "open",
                                })
                                setAddingMilestoneForProjId(null)
                                setNewMsName("")
                                setNewMsAmount("")
                              }}
                              className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-[#C2410C] text-white hover:bg-[#D44B12] cursor-pointer"
                            >
                              Save Milestone
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Milestone Items */}
                      <div className="space-y-2 md:max-h-64 md:overflow-y-auto md:pr-1">
                        {p.milestones?.map((m) => {
                          const isDelivered = m.status === "delivered"
                          const milestoneSessions = sessions.filter(
                            (s) =>
                              s.projectId === p.id &&
                              (s.milestoneId === m.id ||
                                (!s.milestoneId && s.milestoneName === m.name))
                          )
                          const msTrackedSeconds = milestoneSessions.reduce(
                            (acc, s) => acc + s.durationSeconds,
                            0
                          )
                          const msHours = (msTrackedSeconds / 3600).toFixed(1)
                          const isExpanded = expandedMilestones[m.id] !== false

                          return (
                            <div
                              key={m.id}
                              className={`rounded-2xl p-3 text-xs transition-all ${
                                isDelivered ? "bg-emerald-950/35" : "bg-white/[0.05]"
                              }`}
                            >
                              {/* Milestone Header Row */}
                              <div className="flex flex-wrap items-center justify-between gap-2">
                                <button
                                  type="button"
                                  aria-expanded={isExpanded}
                                  onClick={() =>
                                    setExpandedMilestones((prev) => ({
                                      ...prev,
                                      [m.id]: !isExpanded,
                                    }))
                                  }
                                  className="flex items-center gap-2 min-w-0 cursor-pointer flex-1 text-left bg-transparent border-none p-0"
                                >
                                  <ChevronDown
                                    aria-hidden="true"
                                    className={`h-3.5 w-3.5 text-[#E8D5CE] shrink-0 transition-transform ${
                                      isExpanded ? "rotate-0" : "-rotate-90"
                                    }`}
                                  />
                                  <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-1.5">
                                      <span
                                        className={`font-semibold truncate ${
                                          isDelivered ? "text-emerald-200" : "text-white"
                                        }`}
                                      >
                                        {m.name}
                                      </span>
                                    </div>
                                    <div className="text-[11px] text-[#E8D5CE] font-mono">
                                      ${m.amount} • {milestoneSessions.length}{" "}
                                      {milestoneSessions.length === 1 ? "memo" : "memos"} ({msHours}h)
                                    </div>
                                  </div>
                                </button>

                                {/* Action: Mark as delivered */}
                                <button
                                  type="button"
                                  aria-pressed={isDelivered}
                                  onClick={() => toggleMilestoneStatus(p.id, m.id)}
                                  className={`text-[11px] font-semibold px-3 py-1.5 rounded-full transition-all flex items-center gap-1 cursor-pointer shrink-0 ${
                                    isDelivered
                                      ? "bg-emerald-500/20 text-emerald-200 hover:bg-emerald-500/30"
                                      : "bg-[#C2410C] text-white hover:bg-[#D44B12]"
                                  }`}
                                >
                                  <Check
                                    aria-hidden="true"
                                    className={`h-3 w-3 ${isDelivered ? "stroke-[3]" : ""}`}
                                  />
                                  <span>{isDelivered ? "Delivered" : "Deliver"}</span>
                                </button>
                              </div>

                              {/* Collected Memos Under This Milestone */}
                              {isExpanded && (
                                <div className="mt-2.5 pt-2 border-t border-white/10 space-y-1.5">
                                  <div className="text-[11px] font-semibold text-[#CBB2AA] flex items-center justify-between">
                                    <span>Collected Memos ({milestoneSessions.length})</span>
                                    <span className="font-mono text-[#E8D5CE]">{msHours}h total</span>
                                  </div>
                                  {milestoneSessions.length > 0 ? (
                                    <ul className="space-y-1 max-h-24 overflow-y-auto pr-1">
                                      {milestoneSessions.map((s) => (
                                        <li
                                          key={s.id}
                                          className="flex items-center justify-between py-1 px-2 rounded-lg bg-black/30 text-xs text-[#FAF0EC]"
                                        >
                                          <span className="truncate pr-2">{s.memo}</span>
                                          <span className="font-mono text-[11px] text-[#E8D5CE] shrink-0">
                                            {(s.durationSeconds / 3600).toFixed(1)}h
                                          </span>
                                        </li>
                                      ))}
                                    </ul>
                                  ) : (
                                    <p className="text-xs text-[#CBB2AA] italic py-0.5">
                                      No memos tracked under this milestone yet.
                                    </p>
                                  )}
                                </div>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-1.5 pt-3 border-t border-white/10">
                  <Button
                    variant="ghost"
                    size="sm"
                    aria-label={`Edit ${p.name}`}
                    onClick={() => openEdit(p)}
                    className="h-9 gap-1.5 text-xs text-[#E8D5CE] hover:text-white hover:bg-white/10 rounded-xl px-3 cursor-pointer"
                  >
                    <Edit3 className="h-3.5 w-3.5" aria-hidden="true" />
                    Edit
                  </Button>

                  {projects.length > 1 && (
                    <AppTooltip content={`Delete ${p.name}`}>
                      <Button
                        variant="ghost"
                        size="sm"
                        aria-label={`Delete ${p.name}`}
                        onClick={() => deleteProject(p.id)}
                        className="h-9 w-9 p-0 text-[#E8D5CE] hover:text-rose-300 hover:bg-white/10 rounded-xl cursor-pointer"
                      >
                        <Trash2 className="h-4 w-4" aria-hidden="true" />
                      </Button>
                    </AppTooltip>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Add / Edit Project Dialog Component */}
      <ProjectSettingsDialog
        isOpen={isAddOpen}
        onClose={() => {
          setIsAddOpen(false)
          setEditingProj(null)
        }}
        project={editingProj}
        onSave={handleSaveProject}
      />
    </div>
  )
}
