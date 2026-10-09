import * as React from "react"
import { Loader2 } from "lucide-react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/shared/lib/utils"
import { Slot } from "radix-ui"

const badgeVariants = cva(
  "inline-flex w-fit shrink-0 items-center justify-center gap-1.5 overflow-hidden rounded-full border-none px-2.5 py-0.5 text-xs font-medium whitespace-nowrap transition-all focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&>svg:not([class*='animate-spin'])]:pointer-events-none [&>svg]:size-3",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground [a&]:hover:bg-primary/90",
        secondary:
          "bg-white/10 text-white/90 [a&]:hover:bg-white/15",
        destructive:
          "bg-destructive text-white focus-visible:ring-destructive/20 dark:bg-destructive/60 dark:focus-visible:ring-destructive/40 [a&]:hover:bg-destructive/90",
        outline:
          "bg-white/10 text-foreground [a&]:hover:bg-white/15 border-none",
        ghost: "[a&]:hover:bg-accent [a&]:hover:text-accent-foreground",
        link: "text-primary underline-offset-4 [a&]:hover:underline",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.ComponentProps<"span">,
    VariantProps<typeof badgeVariants> {
  asChild?: boolean
  loading?: boolean
  disabled?: boolean
}

function Badge({
  className,
  variant = "default",
  asChild = false,
  loading = false,
  disabled = false,
  children,
  ...props
}: BadgeProps) {
  const Comp = asChild ? Slot.Root : "span"

  return (
    <Comp
      data-slot="badge"
      data-variant={variant}
      data-loading={loading ? "true" : undefined}
      aria-disabled={disabled}
      className={cn(
        badgeVariants({ variant }),
        disabled && "opacity-40 cursor-not-allowed pointer-events-none",
        className
      )}
      {...props}
    >
      {loading && <Loader2 className="size-3 animate-spin shrink-0 text-current" />}
      {children}
    </Comp>
  )
}

export { Badge, badgeVariants }

