import { useState, useMemo } from "react"
import { Plus, Trash2, Edit3, Check, Flag } from "lucide-react"
import { useTrackerStore } from "@/entities/tracker"
import type { Project, BillingType } from "@/entities/project"
import { Button, Card, CardHeader, CardTitle, CardDescription, CardContent, Badge, AppTooltip } from "@/shared/ui"
import { slugify, capitalizeMemo } from "@/shared/lib"
import { ProjectSettingsDialog } from "./ProjectSettingsDialog"

export function ProjectsView() {
  const { projects, sessions, addProject, updateProject, deleteProject, toggleMilestoneStatus } = useTrackerStore()

  const [isAddOpen, setIsAddOpen] = useState(false)
  const [editingProj, setEditingProj] = useState<Project | null>(null)

  // Calculated metrics per project (sum of unique milestones for milestone projects)
  const projectStats = useMemo(() => {
    const stats: Record<
      string,
      { totalSeconds: number; totalEarned: number; count: number; milestoneCount: number }
    > = {}

    projects.forEach((p) => {
      stats[p.id] = { totalSeconds: 0, totalEarned: 0, count: 0, milestoneCount: 0 }
    })

    const projectMilestonesSeen: Record<string, Set<string>> = {}

    sessions.forEach((s) => {
      if (stats[s.projectId]) {
        stats[s.projectId].totalSeconds += s.durationSeconds
        stats[s.projectId].count += 1

        const proj = projects.find((p) => p.id === s.projectId)
        const isMilestone = s.billingType === "milestone" || proj?.billingType === "milestone"

        if (isMilestone) {
          if (!projectMilestonesSeen[s.projectId]) {
            projectMilestonesSeen[s.projectId] = new Set()
          }
          const normMemo = capitalizeMemo(s.memo).toLowerCase().trim()
          if (normMemo && !projectMilestonesSeen[s.projectId].has(normMemo)) {
            projectMilestonesSeen[s.projectId].add(normMemo)
            const milestoneAmount = s.earnedAmount || proj?.fixedBudget || 500
            stats[s.projectId].totalEarned += milestoneAmount
            stats[s.projectId].milestoneCount += 1
          }
        } else if (s.billingType === "fixed" || proj?.billingType === "fixed") {
          // Fixed budget: counted once
          if (stats[s.projectId].count === 1) {
            stats[s.projectId].totalEarned = proj?.fixedBudget || s.earnedAmount || 0
          }
        } else {
          // Hourly
          stats[s.projectId].totalEarned += s.earnedAmount
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
              className="relative overflow-hidden rounded-3xl border-none bg-black/50 backdrop-blur-3xl hover:bg-black/60 transition-all group shadow-[0_20px_50px_rgba(0,0,0,0.32)]"
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

                {/* Project Milestones List */}
                {p.milestones && p.milestones.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-white/10">
                    <div className="flex items-center justify-between text-[11px] font-semibold text-[#806060] uppercase tracking-wider">
                      <span>Milestones ({p.milestones.length})</span>
                      <span className="text-[10px] lowercase text-[#6E5353]">
                        {p.milestones.filter((m) => m.status === "delivered").length} delivered
                      </span>
                    </div>
                    <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                      {p.milestones.map((m) => {
                        const isDelivered = m.status === "delivered"
                        return (
                          <div
                            key={m.id}
                            className={`flex items-center justify-between p-2 rounded-xl text-xs transition-colors ${
                              isDelivered ? "bg-white/5 opacity-70" : "bg-black/30 border border-white/5"
                            }`}
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <Flag className={`h-3.5 w-3.5 shrink-0 ${isDelivered ? "text-emerald-400" : "text-orange-400"}`} />
                              <span className={`truncate font-medium ${isDelivered ? "line-through text-white/50" : "text-white"}`}>
                                {m.name}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 shrink-0 ml-2">
                              <span className="font-mono font-semibold text-[#806060]">
                                ${m.amount}
                              </span>
                              <button
                                type="button"
                                onClick={() => toggleMilestoneStatus(p.id, m.id)}
                                className={`text-[10px] font-semibold px-2 py-0.5 rounded-full transition-all flex items-center gap-1 cursor-pointer ${
                                  isDelivered
                                    ? "bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/25 border border-emerald-500/30"
                                    : "bg-orange-600/20 text-orange-300 hover:bg-orange-600/35 border border-orange-500/30 hover:scale-105"
                                }`}
                              >
                                {isDelivered ? (
                                  <>
                                    <Check className="h-2.5 w-2.5" /> Delivered
                                  </>
                                ) : (
                                  "Mark as delivered"
                                )}
                              </button>
                            </div>
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
