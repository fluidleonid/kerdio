import { Clock, Briefcase, Flag, ShieldOff, X, Loader2 } from "lucide-react"
import { AppTooltip } from "./tooltip"
import type { BillingType } from "@/entities/project"

export interface ProjectBadgeProps {
  project: {
    name: string
    color: string
  }
  onRemove?: () => void
  showAtPrefix?: boolean
  className?: string
  disabled?: boolean
  loading?: boolean
  onClick?: () => void
}

export function ProjectBadge({
  project,
  onRemove,
  showAtPrefix = false,
  className = "",
  disabled = false,
  loading = false,
  onClick,
}: ProjectBadgeProps) {
  return (
    <span
      onClick={!disabled && !loading ? onClick : undefined}
      aria-disabled={disabled}
      className={`animate-in fade-in inline-flex items-center gap-1.5 rounded-full bg-white/10 ${
        onRemove ? "pl-3 pr-2" : "px-3"
      } py-1 text-sm font-medium text-white/90 border-none shrink-0 select-none shadow-none transition-all ${
        onClick && !disabled && !loading ? "cursor-pointer hover:bg-white/15 active:scale-95" : ""
      } ${disabled ? "opacity-40 cursor-not-allowed pointer-events-none" : ""} ${className}`}
    >
      {loading ? (
        <Loader2 className="h-2.5 w-2.5 animate-spin text-white/70 shrink-0" />
      ) : (
        <span
          className="h-2 w-2 rounded-full shrink-0"
          style={{
            backgroundColor: project.color,
          }}
        />
      )}
      <span>{showAtPrefix ? `@${project.name}` : project.name}</span>
      {onRemove && (
        <AppTooltip content="Remove project">
          <button
            type="button"
            disabled={disabled || loading}
            onClick={(e) => {
              e.stopPropagation()
              onRemove()
            }}
            className="rounded-full hover:bg-white/20 p-0.5 text-white/70 hover:text-white transition-colors disabled:pointer-events-none"
          >
            <X className="h-[18px] w-[18px]" />
          </button>
        </AppTooltip>
      )}
    </span>
  )
}

export interface BillingBadgeProps {
  billingType: BillingType | "none"
  amount?: number | null
  onRemove?: () => void
  className?: string
  disabled?: boolean
  loading?: boolean
  onClick?: () => void
}

export function BillingBadge({
  billingType,
  amount,
  onRemove,
  className = "",
  disabled = false,
  loading = false,
  onClick,
}: BillingBadgeProps) {
  const renderContent = () => {
    if (loading) {
      return (
        <>
          <Loader2 className="h-3.5 w-3.5 animate-spin text-white/70 shrink-0" />
          <span>Updating...</span>
        </>
      )
    }
    if (billingType === "hourly") {
      return (
        <>
          <Clock className="h-[18px] w-[18px] text-white/90 shrink-0" />
          <span>{amount !== undefined && amount !== null ? `$${amount}/h` : "Hourly"}</span>
        </>
      )
    }
    if (billingType === "fixed") {
      return (
        <>
          <Briefcase className="h-[18px] w-[18px] text-white/90 shrink-0" />
          <span>{amount !== undefined && amount !== null ? `Fixed $${amount}` : "Fixed"}</span>
        </>
      )
    }
    if (billingType === "milestone") {
      return (
        <>
          <Flag className="h-[18px] w-[18px] text-white/90 shrink-0" />
          <span>{amount !== undefined && amount !== null ? `Milestone $${amount}` : "Milestone"}</span>
        </>
      )
    }
    return (
      <>
        <ShieldOff className="h-[18px] w-[18px] text-white/90 shrink-0" />
        <span>Non-billable</span>
      </>
    )
  }

  return (
    <span
      onClick={!disabled && !loading ? onClick : undefined}
      aria-disabled={disabled}
      className={`animate-in fade-in inline-flex items-center gap-1.5 rounded-full bg-white/10 ${
        onRemove ? "pl-3 pr-2" : "px-3"
      } py-1 text-sm font-medium text-white/90 border-none shrink-0 select-none shadow-none transition-all ${
        onClick && !disabled && !loading ? "cursor-pointer hover:bg-white/15 active:scale-95" : ""
      } ${disabled ? "opacity-40 cursor-not-allowed pointer-events-none" : ""} ${className}`}
    >
      {renderContent()}
      {onRemove && (
        <AppTooltip content="Remove billing">
          <button
            type="button"
            disabled={disabled || loading}
            onClick={(e) => {
              e.stopPropagation()
              onRemove()
            }}
            className="rounded-full hover:bg-white/20 p-0.5 text-white/70 hover:text-white transition-colors disabled:pointer-events-none"
          >
            <X className="h-[18px] w-[18px]" />
          </button>
        </AppTooltip>
      )}
    </span>
  )
}
