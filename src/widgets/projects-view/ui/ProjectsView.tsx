import { useState, useMemo } from "react"
import { Plus, Trash2, Edit3, Check, Flag } from "lucide-react"
import { useTrackerStore } from "@/entities/tracker"
import type { Project, BillingType } from "@/entities/project"
import { Button, Card, CardHeader, CardTitle, CardDescription, CardContent, Badge, AppTooltip } from "@/shared/ui"
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
      { totalSeconds: number; totalEarned: number; count: number; milestoneCount: number; deliveredCount: number }
    > = {}

    projects.forEach((p) => {
      const deliveredMs = (p.milestones || []).filter((m) => m.status === "delivered")
      const deliveredTotal = deliveredMs.reduce((sum, m) => sum + m.amount, 0)
      const isMilestoneProj = p.billingType === "milestone" || (p.milestones && p.milestones.length > 0)

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
        const isMilestoneProj = proj?.billingType === "milestone" || (proj?.milestones && proj.milestones.length > 0)

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
    <div className="container mx-auto max-w-6xl px-4 py-8 space-y-8 select-none">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Projects & Billing</h1>
          <p className="text-xs text-[#806060] mt-1">
            Client project registry with billing models, hourly rates, and accrued revenue.
          </p>
        </div>

        <Button
          onClick={openNew}
          className="gap-1.5 rounded-2xl bg-orange-600 text-white hover:bg-orange-500 shadow-none cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>New Project</span>
        </Button>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {projects.map((p) => {
          const stats = projectStats[p.id] || {
            totalSeconds: 0,
            totalEarned: 0,
            count: 0,
            milestoneCount: 0,
          }
          const hours = (stats.totalSeconds / 3600).toFixed(1)

          return (
            <Card
              key={p.id}
              className="relative overflow-hidden hover:bg-black/60 transition-all group"
            >
              {/* Top Accent Strip */}
              <div
                className="absolute top-0 left-0 right-0 h-1"
                style={{ backgroundColor: p.color }}
              />

              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <span
                    className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border-none"
                    style={{ backgroundColor: `${p.color}25`, color: p.color }}
                  >
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: p.color }} />
                    <span>{p.name}</span>
                  </span>

                  <Badge
                    variant="secondary"
                    className="text-[10px] uppercase font-semibold border-none bg-white/10 text-white/80"
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

                <CardTitle className="text-lg font-bold text-white mt-2 group-hover:text-orange-400 transition-colors">
                  {p.name}
                </CardTitle>
                <CardDescription className="text-xs font-mono text-[#806060]">
                  {p.billingType === "hourly"
                    ? `Rate: ${p.currency}${p.hourlyRate}/h`
                    : p.billingType === "milestone"
                    ? `Milestone: ${p.currency}${p.fixedBudget || 500} per milestone`
                    : p.billingType === "fixed"
                    ? `Budget: ${p.currency}${p.fixedBudget || 0} total`
                    : "Non-billable (Free focus)"}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4 pt-0">
                {/* Metrics */}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/10 text-xs">
                  <div>
                    <span className="text-[#6E5353] block text-[11px]">Tracked:</span>
                    <span className="font-mono font-bold text-white text-sm tabular-nums">
                      {hours} h ({stats.count} sessions)
                    </span>
                  </div>
                  <div>
                    <span className="text-[#6E5353] block text-[11px]">
                      {p.billingType === "milestone" ? "Milestones Total:" : "Accrued:"}
                    </span>
                    <span className="font-mono font-bold text-emerald-400 text-sm tabular-nums">
                      {p.billingType === "milestone" && stats.milestoneCount > 0
                        ? `${stats.milestoneCount} m. • ${p.currency}${stats.totalEarned.toFixed(0)}`
                        : `${p.currency}${stats.totalEarned.toFixed(2)}`}
                    </span>
                  </div>
                </div>

                {/* Project Milestones List & Collected Memos */}
                {((p.milestones && p.milestones.length > 0) || addingMilestoneForProjId === p.id) && (
                  <div className="space-y-2 pt-2 border-t border-white/10">
                    <div className="flex items-center justify-between text-[11px] font-semibold text-[#806060] uppercase tracking-wider">
                      <span className="flex items-center gap-1.5 text-white/90">
                        <Flag className="h-3 w-3 text-orange-400" />
                        Milestones ({p.milestones?.length || 0})
                      </span>
                      <div className="flex items-center gap-2">
                        {p.milestones && p.milestones.length > 0 && (
                          <span className="text-[10px] text-emerald-400 font-semibold">
                            {p.milestones.filter((m) => m.status === "delivered").length} delivered
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => {
                            setAddingMilestoneForProjId(addingMilestoneForProjId === p.id ? null : p.id)
                            setNewMsName(`M ${(p.milestones?.length || 0) + 1} `)
                            setNewMsAmount("1500")
                          }}
                          className="text-[10px] text-orange-400 hover:text-orange-300 font-semibold transition-colors flex items-center gap-0.5 cursor-pointer"
                        >
                          <Plus className="h-2.5 w-2.5" />
                          <span>Add</span>
                        </button>
                      </div>
                    </div>

                    {/* Inline Add Milestone Form */}
                    {addingMilestoneForProjId === p.id && (
                      <div className="p-2.5 rounded-2xl bg-white/5 border border-white/10 space-y-2 animate-in fade-in duration-150">
                        <div className="text-[11px] font-semibold text-white/90">New Project Milestone</div>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="Milestone title (e.g. M 3 Backend API)"
                            value={newMsName}
                            onChange={(e) => setNewMsName(e.target.value)}
                            className="flex-1 h-8 rounded-xl bg-black/40 px-2.5 text-xs text-white placeholder:text-[#6E5353] outline-none border border-white/10"
                          />
                          <div className="relative w-24">
                            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-[#806060]">$</span>
                            <input
                              type="number"
                              placeholder="Amount"
                              value={newMsAmount}
                              onChange={(e) => setNewMsAmount(e.target.value)}
                              className="w-full h-8 rounded-xl bg-black/40 pl-6 pr-2 text-xs text-white placeholder:text-[#6E5353] outline-none border border-white/10 font-mono"
                            />
                          </div>
                        </div>
                        <div className="flex justify-end gap-1.5 pt-1">
                          <button
                            type="button"
                            onClick={() => setAddingMilestoneForProjId(null)}
                            className="px-2.5 py-1 rounded-lg text-[10px] text-[#806060] hover:text-white"
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
                            className="px-3 py-1 rounded-lg text-[10px] font-semibold bg-orange-600 text-white hover:bg-orange-500"
                          >
                            Save Milestone
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Milestone Cards with Collected Memos */}
                    <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                      {p.milestones?.map((m) => {
                        const isDelivered = m.status === "delivered"
                        const milestoneSessions = sessions.filter(
                          (s) =>
                            s.projectId === p.id &&
                            (s.milestoneId === m.id || (!s.milestoneId && s.milestoneName === m.name))
                        )
                        const msTrackedSeconds = milestoneSessions.reduce((acc, s) => acc + s.durationSeconds, 0)
                        const msHours = (msTrackedSeconds / 3600).toFixed(1)
                        const isExpanded = expandedMilestones[m.id] !== false

                        return (
                          <div
                            key={m.id}
                            className={`rounded-2xl p-2.5 text-xs transition-all ${
                              isDelivered
                                ? "bg-emerald-950/20 border border-emerald-500/25"
                                : "bg-black/40 border border-white/5"
                            }`}
                          >
                            {/* Milestone Header Row */}
                            <div className="flex items-center justify-between gap-2">
                              <div
                                className="flex items-center gap-2 min-w-0 cursor-pointer flex-1"
                                onClick={() =>
                                  setExpandedMilestones((prev) => ({
                                    ...prev,
                                    [m.id]: !isExpanded,
                                  }))
                                }
                              >
                                <div
                                  className={`h-6 w-6 rounded-lg flex items-center justify-center shrink-0 ${
                                    isDelivered
                                      ? "bg-emerald-500/20 text-emerald-400"
                                      : "bg-orange-500/20 text-orange-400"
                                  }`}
                                >
                                  <Flag className="h-3.5 w-3.5" />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center gap-1.5">
                                    <span
                                      className={`font-semibold truncate ${
                                        isDelivered ? "text-emerald-200" : "text-white"
                                      }`}
                                    >
                                      {m.name}
                                    </span>
                                    {isDelivered && (
                                      <span className="text-[9px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded bg-emerald-500/25 text-emerald-300 shrink-0">
                                        Delivered
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-[10px] text-[#806060] font-mono">
                                    ${m.amount} • {milestoneSessions.length}{" "}
                                    {milestoneSessions.length === 1 ? "memo" : "memos"} ({msHours}h)
                                  </div>
                                </div>
                              </div>

                              {/* Action: Mark as delivered */}
                              <button
                                type="button"
                                onClick={() => toggleMilestoneStatus(p.id, m.id)}
                                className={`text-[10px] font-semibold px-2.5 py-1 rounded-full transition-all flex items-center gap-1 cursor-pointer shrink-0 ${
                                  isDelivered
                                    ? "bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 border border-emerald-500/35"
                                    : "bg-orange-600 text-white hover:bg-orange-500 hover:scale-105 active:scale-95 shadow-sm"
                                }`}
                                title={isDelivered ? "Click to reopen milestone" : "Mark milestone as delivered"}
                              >
                                <Check className={`h-2.5 w-2.5 ${isDelivered ? "stroke-[3]" : ""}`} />
                                <span>{isDelivered ? "Delivered" : "Mark as delivered"}</span>
                              </button>
                            </div>

                            {/* Nested Collected Memos Under This Milestone */}
                            {isExpanded && (
                              <div className="mt-2 pt-2 border-t border-white/5 space-y-1 pl-1">
                                <div className="text-[10px] font-semibold text-[#806060] uppercase tracking-wider flex items-center justify-between">
                                  <span>Collected Memos ({milestoneSessions.length})</span>
                                  <span className="font-mono text-white/60">{msHours}h total</span>
                                </div>
                                {milestoneSessions.length > 0 ? (
                                  <div className="space-y-1 max-h-24 overflow-y-auto pr-1">
                                    {milestoneSessions.map((s) => (
                                      <div
                                        key={s.id}
                                        className="flex items-center justify-between py-1 px-2 rounded-lg bg-white/[0.03] text-[11px] text-white/80 hover:bg-white/[0.06] transition-colors"
                                      >
                                        <span className="truncate pr-2 font-sans">• {s.memo}</span>
                                        <span className="font-mono text-[10px] text-[#806060] shrink-0">
                                          {(s.durationSeconds / 3600).toFixed(1)}h
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <div className="text-[10px] text-[#6E5353] italic py-0.5">
                                    No memos tracked under this milestone yet
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-end gap-1 pt-2 border-t border-white/10">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openEdit(p)}
                    className="h-8 gap-1 text-xs text-[#806060] hover:text-white hover:bg-white/10"
                  >
                    <Edit3 className="h-3.5 w-3.5" />
                    Edit
                  </Button>

                  {projects.length > 1 && (
                    <AppTooltip content="Delete project">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteProject(p.id)}
                        className="h-8 gap-1 text-xs text-[#806060] hover:text-rose-400 hover:bg-white/10"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
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
