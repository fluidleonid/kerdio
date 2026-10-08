import * as React from "react"
import { Tooltip as TooltipPrimitive } from "radix-ui"
import { cn } from "@/shared/lib/utils"

const TooltipProvider = TooltipPrimitive.Provider

const Tooltip = TooltipPrimitive.Root

const TooltipTrigger = TooltipPrimitive.Trigger

const TooltipPortal = TooltipPrimitive.Portal

function TooltipContent({
  className,
  sideOffset = 6,
  children,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Content>) {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        sideOffset={sideOffset}
        className={cn(
          "z-50 overflow-hidden rounded-xl border-none bg-zinc-950/95 px-3 py-1.5 text-xs font-medium text-white shadow-2xl backdrop-blur-xl animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-1.5 data-[side=left]:slide-in-from-right-1.5 data-[side=right]:slide-in-from-left-1.5 data-[side=top]:slide-in-from-bottom-1.5",
          className
        )}
        {...props}
      >
        {children}
      </TooltipPrimitive.Content>
    </TooltipPrimitive.Portal>
  )
}

interface AppTooltipProps {
  content: React.ReactNode
  shortcut?: string
  side?: "top" | "right" | "bottom" | "left"
  sideOffset?: number
  align?: "start" | "center" | "end"
  children: React.ReactNode
  className?: string
}

function AppTooltip({
  content,
  shortcut,
  side = "top",
  sideOffset = 6,
  align = "center",
  children,
  className,
}: AppTooltipProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent side={side} sideOffset={sideOffset} align={align} className={className}>
        <div className="flex items-center gap-1.5 whitespace-nowrap">
          <span>{content}</span>
          {shortcut && (
            <kbd className="rounded bg-white/10 px-1 py-0.5 text-[10px] text-[#6E5353] border-none">
              {shortcut}
            </kbd>
          )}
        </div>
      </TooltipContent>
    </Tooltip>
  )
}

export {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
  TooltipPortal,
  AppTooltip,
}
