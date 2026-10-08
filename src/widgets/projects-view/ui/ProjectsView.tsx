import { useState, useMemo } from "react"
import { Plus, Trash2, Edit3, X, Check, Clock, Briefcase, Flag, ShieldOff, ChevronDown } from "lucide-react"
import { useTrackerStore } from "@/entities/tracker"
import type { Project, BillingType } from "@/entities/project"
import { Button, Card, CardHeader, CardTitle, CardDescription, CardContent, Badge, Input, AppTooltip } from "@/shared/ui"
import { slugify, capitalizeMemo } from "@/shared/lib"

const BILLING_OPTIONS = [
  {
    type: "hourly" as BillingType,
    title: "Hourly Rate",
    description: "Bill per hour with real-time dollar accrual",
    suffix: "/h",
    icon: Clock,
  },
  {
    type: "fixed" as BillingType,
    title: "Fixed Fee",
    description: "Flat rate for entire task/project, tracks hourly yield",
    suffix: "$",
    icon: Briefcase,
  },
  {
    type: "milestone" as BillingType,
    title: "Milestone",
    description: "Fixed payout for this specific delivery",
    suffix: "$",
    icon: Flag,
  },
  {
    type: "none" as BillingType,
    title: "Non-billable (Free)",
    description: "Track focus time only without client billing or money",
    suffix: "",
    icon: ShieldOff,
  },
]

export function ProjectsView() {
  const { projects, sessions, addProject, updateProject, deleteProject } = useTrackerStore()

  const [isAddOpen, setIsAddOpen] = useState(false)
  const [editingProj, setEditingProj] = useState<Project | null>(null)

  // Form states
  const [name, setName] = useState("")
  const [color, setColor] = useState("#E25822")
  const [billingType, setBillingType] = useState<BillingType>("hourly")
  const [hourlyRate, setHourlyRate] = useState("85")
  const [fixedBudget, setFixedBudget] = useState("2500")
  const [currency, setCurrency] = useState("$")
  const [isBillingMenuOpen, setIsBillingMenuOpen] = useState(false)

  // Color options
  const colorOptions = [
    "#E25822", // Terracotta
    "#F97316", // Amber
    "#10B981", // Emerald
    "#06B6D4", // Cyan
    "#6366F1", // Indigo
    "#EC4899", // Pink
    "#8B5CF6", // Purple
    "#EAB308", // Yellow
  ]

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

  const openEdit = (p: Project) => {
    setEditingProj(p)
    setName(p.name)
    setColor(p.color)
    setBillingType(p.billingType)
    setHourlyRate(String(p.hourlyRate || 85))
    setFixedBudget(String(p.fixedBudget || 1000))
    setCurrency(p.currency)
    setIsBillingMenuOpen(false)
    setIsAddOpen(true)
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    const rate = parseFloat(hourlyRate) || 85
    const budget = parseFloat(fixedBudget) || (billingType === "milestone" ? 500 : 2500)
    const autoSlug = slugify(name)

    if (editingProj) {
      updateProject(editingProj.id, {
        name,
        slug: autoSlug,
        color,
        billingType,
        hourlyRate: rate,
        fixedBudget: budget,
        currency,
      })
    } else {
      addProject({
        name,
        slug: autoSlug,
        color,
        billingType,
        hourlyRate: rate,
        fixedBudget: budget,
        currency,
      })
    }

    setIsAddOpen(false)
    setEditingProj(null)
    setName("")
  }

  const selectedBillingOption =
    BILLING_OPTIONS.find((b) => b.type === billingType) || BILLING_OPTIONS[0]
  const SelectedBillingIcon = selectedBillingOption.icon

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
          onClick={() => {
            setEditingProj(null)
            setName("")
            setColor("#E25822")
            setBillingType("hourly")
            setHourlyRate("85")
            setFixedBudget("2500")
            setIsBillingMenuOpen(false)
            setIsAddOpen(true)
          }}
          className="gap-1.5 rounded-2xl bg-orange-600 text-white hover:bg-orange-500 shadow-none"
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
                      : "Milestone"}
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
                    : `Budget: ${p.currency}${p.fixedBudget || 0} total`}
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

      {/* Add / Edit Project Modal (Card-style glass backdrop & shadow) */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl bg-black/50 backdrop-blur-3xl border-none p-6 space-y-4 shadow-[0_20px_50px_rgba(0,0,0,0.35)] animate-in zoom-in-95">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">
                {editingProj ? "Edit Project" : "New Project"}
              </h3>
              <AppTooltip content="Close" shortcut="Esc">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="p-1 rounded-xl text-[#806060] hover:text-white hover:bg-white/10 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </AppTooltip>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-white/80 block mb-1">
                  Project Name
                </label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Kerdio Core or Client Brand"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-white/80 block mb-2">
                  Accent Color
                </label>
                <div className="flex items-center gap-2">
                  {colorOptions.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setColor(c)}
                      className={`h-7 w-7 rounded-full transition-transform ${
                        color === c ? "scale-110 ring-2 ring-white" : "hover:scale-105"
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              {/* Billing settings unified composite input */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-white/80 block">
                  Billing settings
                </label>
                <div className="relative flex items-center h-11 w-full rounded-2xl bg-black/50 px-3 shadow-[0_10px_25px_rgba(0,0,0,0.25)] backdrop-blur-3xl border-none focus-within:bg-black/60 transition-all">
                  {/* Combobox Trigger (Left section of unified input) */}
                  <button
                    type="button"
                    onClick={() => setIsBillingMenuOpen(!isBillingMenuOpen)}
                    className="flex items-center gap-2 py-1 px-2 -ml-1 rounded-xl hover:bg-white/10 transition-colors text-left shrink-0 cursor-pointer"
                  >
                    <SelectedBillingIcon className="h-4 w-4 text-orange-400 shrink-0" />
                    <span className="text-sm font-semibold text-white select-none whitespace-nowrap">
                      {selectedBillingOption.title}
                    </span>
                    <ChevronDown
                      className={`h-3.5 w-3.5 text-[#806060] transition-transform ${
                        isBillingMenuOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  <div className="h-5 w-px bg-white/10 mx-2 shrink-0" />

                  {/* Adaptive Amount Input (Right section of unified input) */}
                  {billingType !== "none" ? (
                    <div className="flex items-center flex-1 min-w-0">
                      <span className="text-sm font-mono font-bold text-white/50 mr-1 select-none">$</span>
                      <input
                        type="number"
                        min="1"
                        value={billingType === "hourly" ? hourlyRate : fixedBudget}
                        onChange={(e) => {
                          if (billingType === "hourly") {
                            setHourlyRate(e.target.value)
                          } else {
                            setFixedBudget(e.target.value)
                          }
                        }}
                        placeholder="0"
                        className="w-full bg-transparent text-sm font-semibold text-white placeholder:text-[#6E5353] focus:outline-none border-none p-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                      <span className="text-xs font-mono font-semibold text-[#806060] ml-1 select-none shrink-0">
                        {billingType === "hourly" ? "/h" : "$"}
                      </span>
                    </div>
                  ) : (
                    <span className="text-xs text-[#806060] select-none">No billing</span>
                  )}

                  {/* Combobox Options Dropdown */}
                  {isBillingMenuOpen && (
                    <div className="absolute left-0 right-0 top-full mt-2 z-50 rounded-2xl bg-black/95 backdrop-blur-3xl p-1.5 shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/10 space-y-1">
                      {BILLING_OPTIONS.map((opt) => (
                        <div
                          key={opt.type}
                          onClick={() => {
                            setBillingType(opt.type)
                            setIsBillingMenuOpen(false)
                          }}
                          className={`flex items-start gap-2.5 p-2.5 rounded-xl cursor-pointer transition-colors ${
                            billingType === opt.type
                              ? "bg-white/15 text-white"
                              : "hover:bg-white/10 text-white/80"
                          }`}
                        >
                          <opt.icon className="h-4 w-4 text-orange-400 mt-0.5 shrink-0" />
                          <div className="min-w-0">
                            <div className="text-sm font-semibold text-white">{opt.title}</div>
                            <div className="text-xs text-[#806060]">{opt.description}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-white/10">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsAddOpen(false)}
                  className="rounded-full text-[#806060] hover:text-white hover:bg-white/10"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  className="gap-1.5 rounded-full bg-orange-600 hover:bg-orange-500 text-white"
                >
                  <Check className="h-4 w-4" />
                  {editingProj ? "Save Changes" : "Create Project"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
