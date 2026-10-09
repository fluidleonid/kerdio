import * as React from "react"
import { useState, useEffect } from "react"
import { X, Check, ChevronDown, Clock, Briefcase, Flag, ShieldOff } from "lucide-react"
import type { Project, BillingType } from "@/entities/project"
import { Button, Input, AppTooltip } from "@/shared/ui"

export interface ProjectSettingsDialogProps {
  isOpen: boolean
  onClose: () => void
  project?: Project | null
  onSave: (data: {
    name: string
    color: string
    billingType: BillingType
    hourlyRate: number
    fixedBudget: number
    currency: string
  }) => void
}

const BILLING_OPTIONS: {
  type: BillingType
  title: string
  description: string
  icon: React.ComponentType<{ className?: string }>
}[] = [
  {
    type: "hourly",
    title: "Hourly rate",
    description: "Bill per hour with dynamic dollar yield accrual",
    icon: Clock,
  },
  {
    type: "fixed",
    title: "Fixed budget",
    description: "Flat project fee allocated across all tracked work",
    icon: Briefcase,
  },
  {
    type: "milestone",
    title: "Milestones",
    description: "Discrete delivery stages with individual payouts",
    icon: Flag,
  },
  {
    type: "none",
    title: "Non-billable",
    description: "Focus tracking without revenue or rates",
    icon: ShieldOff,
  },
]

const COLOR_OPTIONS = [
  "#E25822", // Terracotta
  "#F97316", // Amber
  "#10B981", // Emerald
  "#06B6D4", // Cyan
  "#6366F1", // Indigo
  "#EC4899", // Pink
  "#8B5CF6", // Purple
  "#EAB308", // Yellow
]

export function ProjectSettingsDialog({
  isOpen,
  onClose,
  project,
  onSave,
}: ProjectSettingsDialogProps) {
  const [name, setName] = useState("")
  const [color, setColor] = useState("#E25822")
  const [isBillable, setIsBillable] = useState(true)
  const [billingType, setBillingType] = useState<BillingType>("hourly")
  const [hourlyRate, setHourlyRate] = useState("85")
  const [fixedBudget, setFixedBudget] = useState("2500")
  const [currency, setCurrency] = useState("$")
  const [isBillingMenuOpen, setIsBillingMenuOpen] = useState(false)

  // Sync state whenever dialog opens or editing project changes
  useEffect(() => {
    if (project) {
      setName(project.name)
      setColor(project.color)
      const billable = project.billingType !== "none"
      setIsBillable(billable)
      setBillingType(billable ? project.billingType : "hourly")
      setHourlyRate(String(project.hourlyRate || 85))
      setFixedBudget(String(project.fixedBudget || 2500))
      setCurrency(project.currency || "$")
    } else {
      setName("")
      setColor("#E25822")
      setIsBillable(true)
      setBillingType("hourly")
      setHourlyRate("85")
      setFixedBudget("2500")
      setCurrency("$")
    }
    setIsBillingMenuOpen(false)
  }, [project, isOpen])

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose()
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const cleanName = name.trim()
    if (!cleanName) return

    const effectiveBillingType: BillingType = isBillable ? billingType : "none"
    const rate = isBillable ? parseFloat(hourlyRate) || 85 : 0
    const budget = isBillable
      ? parseFloat(fixedBudget) || (billingType === "milestone" ? 500 : 2500)
      : 0

    onSave({
      name: cleanName,
      color,
      billingType: effectiveBillingType,
      hourlyRate: rate,
      fixedBudget: budget,
      currency,
    })
  }

  const selectedOption =
    BILLING_OPTIONS.find((b) => b.type === billingType) || BILLING_OPTIONS[0]
  const SelectedIcon = selectedOption.icon

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      {/* Modal Dialog Card: Exact same background, blur and shadow tokens as Card */}
      <div className="w-full max-w-md rounded-3xl bg-black/50 backdrop-blur-3xl border-none p-6 space-y-4 shadow-[0_20px_50px_rgba(0,0,0,0.32)] animate-in zoom-in-95">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-white">
            {project ? "Edit Project" : "New Project"}
          </h3>
          <AppTooltip content="Close" shortcut="Esc">
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded-xl text-[#806060] hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </AppTooltip>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-white/80 block mb-1">
              Project Name
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Kerdio Core or Client Brand"
              required
              autoFocus
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-white/80 block mb-2">
              Accent Color
            </label>
            <div className="flex items-center gap-2">
              {COLOR_OPTIONS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`h-7 w-7 rounded-full transition-transform cursor-pointer ${
                    color === c ? "scale-110 ring-2 ring-white" : "hover:scale-105"
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          {/* Billable toggle card */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white/5 border-none backdrop-blur-xl">
            <div>
              <span className="text-xs font-semibold text-white/90 block">Billable</span>
              <span className="text-[11px] text-[#806060] block">
                {isBillable
                  ? "Track revenue & hourly yield with client rates"
                  : "Free focus time tracking without client rates"}
              </span>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={isBillable}
              onClick={() => {
                const next = !isBillable
                setIsBillable(next)
                if (next && billingType === "none") {
                  setBillingType("hourly")
                }
                setIsBillingMenuOpen(false)
              }}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-none ${
                isBillable ? "bg-orange-600" : "bg-white/10"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out mt-0.5 ml-0.5 ${
                  isBillable ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {/* Billing settings input (only shown when Billable is ON) */}
          {isBillable && (
            <div className="space-y-1.5 animate-in fade-in slide-in-from-top-1 duration-200">
              <label className="text-xs font-semibold text-white/80 block">
                Billing settings
              </label>
              <div className="relative flex items-center h-11 w-full rounded-2xl bg-white/5 px-3 border-none focus-within:bg-white/10 transition-all">
                {/* Combobox Trigger (Left section of unified input) */}
                <button
                  type="button"
                  onClick={() => setIsBillingMenuOpen(!isBillingMenuOpen)}
                  className="flex items-center gap-2 py-1 px-2 -ml-1 rounded-xl hover:bg-white/10 transition-colors text-left shrink-0 cursor-pointer"
                >
                  <SelectedIcon className="h-4 w-4 text-orange-400 shrink-0" />
                  <span className="text-sm font-semibold text-white select-none whitespace-nowrap">
                    {selectedOption.title}
                  </span>
                  <ChevronDown
                    className={`h-3.5 w-3.5 text-[#806060] transition-transform ${
                      isBillingMenuOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                <div className="h-5 w-px bg-white/10 mx-2 shrink-0" />

                {/* Adaptive Amount Input (Right section of unified input) */}
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

                {/* Combobox Options Dropdown matching optical glass aesthetics */}
                {isBillingMenuOpen && (
                  <div className="absolute left-0 right-0 top-full mt-2 z-50 rounded-2xl bg-black/55 backdrop-blur-3xl p-1.5 shadow-[0_20px_50px_rgba(0,0,0,0.35)] border-none space-y-1">
                    {BILLING_OPTIONS.filter((opt) => opt.type !== "none").map((opt) => (
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
          )}

          <div className="flex justify-end gap-2 pt-3 border-t border-white/10">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="rounded-full text-[#806060] hover:text-white hover:bg-white/10 cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              className="gap-1.5 rounded-full bg-orange-600 hover:bg-orange-500 text-white cursor-pointer"
            >
              <Check className="h-4 w-4" />
              {project ? "Save Changes" : "Create Project"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
