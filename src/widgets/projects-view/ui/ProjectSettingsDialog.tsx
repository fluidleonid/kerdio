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

const COLOR_OPTIONS: { hex: string; label: string }[] = [
  { hex: "#E25822", label: "Terracotta" },
  { hex: "#F97316", label: "Amber" },
  { hex: "#10B981", label: "Emerald" },
  { hex: "#06B6D4", label: "Cyan" },
  { hex: "#6366F1", label: "Indigo" },
  { hex: "#EC4899", label: "Pink" },
  { hex: "#8B5CF6", label: "Purple" },
  { hex: "#EAB308", label: "Yellow" },
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
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="project-dialog-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 glass-overlay animate-in fade-in duration-200"
    >
      <div className="w-full max-w-md glass-card p-6 space-y-4 animate-in zoom-in-95 max-h-[90dvh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <h2 id="project-dialog-title" className="text-lg font-bold text-white">
            {project ? "Edit Project" : "New Project"}
          </h2>
          <AppTooltip content="Close" shortcut="Esc">
            <button
              type="button"
              aria-label="Close project settings dialog"
              onClick={onClose}
              className="p-2 rounded-xl text-[#E8D5CE] hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </AppTooltip>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="project-name-input"
              className="text-xs font-semibold text-[#FAF0EC] block mb-1.5"
            >
              Project Name
            </label>
            <Input
              id="project-name-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Kerdio Core or Client Brand"
              required
              autoFocus
            />
          </div>

          <fieldset>
            <legend className="text-xs font-semibold text-[#FAF0EC] block mb-2">
              Accent Color
            </legend>
            <div className="flex flex-wrap items-center gap-2.5">
              {COLOR_OPTIONS.map((c) => (
                <button
                  key={c.hex}
                  type="button"
                  aria-label={`Select ${c.label} color`}
                  aria-pressed={color === c.hex}
                  onClick={() => setColor(c.hex)}
                  className={`h-8 w-8 rounded-full transition-transform cursor-pointer ${
                    color === c.hex
                      ? "scale-110 ring-2 ring-white ring-offset-2 ring-offset-black/70"
                      : "hover:scale-105"
                  }`}
                  style={{ backgroundColor: c.hex }}
                />
              ))}
            </div>
          </fieldset>

          {/* Billable toggle card */}
          <div className="flex items-center justify-between gap-3 p-3.5 rounded-2xl glass-subtle">
            <div>
              <span id="billable-label" className="text-xs font-semibold text-white block">
                Billable
              </span>
              <span className="text-xs text-[#E8D5CE] block mt-0.5">
                {isBillable
                  ? "Track revenue & hourly yield with client rates"
                  : "Free focus time tracking without client rates"}
              </span>
            </div>
            <button
              type="button"
              role="switch"
              aria-labelledby="billable-label"
              aria-checked={isBillable}
              onClick={() => {
                const next = !isBillable
                setIsBillable(next)
                if (next && billingType === "none") {
                  setBillingType("hourly")
                }
                setIsBillingMenuOpen(false)
              }}
              className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out ${
                isBillable ? "bg-[#C2410C]" : "bg-white/20"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out mt-0.5 ml-0.5 ${
                  isBillable ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {/* Billing settings input (only shown when Billable is ON) */}
          {isBillable && (
            <div className="space-y-1.5 animate-in fade-in slide-in-from-top-1 duration-200">
              <label
                htmlFor="project-billing-amount"
                className="text-xs font-semibold text-[#FAF0EC] block"
              >
                Billing settings
              </label>
              <div className="relative flex items-center h-11 w-full rounded-2xl glass-subtle px-3 focus-within:bg-white/10 transition-all">
                {/* Combobox Trigger (Left section of unified input) */}
                <button
                  type="button"
                  aria-expanded={isBillingMenuOpen}
                  onClick={() => setIsBillingMenuOpen(!isBillingMenuOpen)}
                  className="flex items-center gap-2 py-1.5 px-2 -ml-1 rounded-xl hover:bg-white/10 transition-colors text-left shrink-0 cursor-pointer"
                >
                  <SelectedIcon className="h-4 w-4 text-amber-300 shrink-0" aria-hidden="true" />
                  <span className="text-sm font-semibold text-white select-none whitespace-nowrap">
                    {selectedOption.title}
                  </span>
                  <ChevronDown
                    aria-hidden="true"
                    className={`h-3.5 w-3.5 text-[#E8D5CE] transition-transform ${
                      isBillingMenuOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                <div className="h-5 w-px bg-white/15 mx-2 shrink-0" />

                {/* Adaptive Amount Input */}
                <div className="flex items-center flex-1 min-w-0">
                  <span className="text-sm font-mono font-bold text-[#E8D5CE] mr-1 select-none">
                    $
                  </span>
                  <input
                    id="project-billing-amount"
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
                    className="w-full bg-transparent text-sm font-semibold text-white placeholder:text-[#CBB2AA] focus:outline-none border-none p-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                  <span className="text-xs font-mono font-semibold text-[#E8D5CE] ml-1 select-none shrink-0">
                    {billingType === "hourly" ? "/h" : "$"}
                  </span>
                </div>

                {/* Combobox Options Dropdown */}
                {isBillingMenuOpen && (
                  <div className="absolute left-0 right-0 top-full mt-2 z-50 glass-popover p-1.5 space-y-1">
                    {BILLING_OPTIONS.filter((opt) => opt.type !== "none").map((opt) => (
                      <button
                        key={opt.type}
                        type="button"
                        onClick={() => {
                          setBillingType(opt.type)
                          setIsBillingMenuOpen(false)
                        }}
                        className={`w-full flex items-start gap-2.5 p-2.5 rounded-xl cursor-pointer transition-colors text-left ${
                          billingType === opt.type
                            ? "bg-white/15 text-white"
                            : "hover:bg-white/10 text-[#FAF0EC]"
                        }`}
                      >
                        <opt.icon className="h-4 w-4 text-amber-300 mt-0.5 shrink-0" aria-hidden="true" />
                        <div className="min-w-0">
                          <div className="text-sm font-semibold text-white">{opt.title}</div>
                          <div className="text-xs text-[#E8D5CE]">{opt.description}</div>
                        </div>
                      </button>
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
              className="h-10 rounded-full px-4 text-[#E8D5CE] hover:text-white hover:bg-white/10 cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              className="h-10 gap-1.5 rounded-full px-5 bg-[#C2410C] hover:bg-[#D44B12] text-white cursor-pointer"
            >
              <Check className="h-4 w-4" aria-hidden="true" />
              {project ? "Save Changes" : "Create Project"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
