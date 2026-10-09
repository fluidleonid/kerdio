import * as React from "react"
import { cn } from "@/shared/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "h-11 w-full min-w-0 glass-input px-4 py-2.5 text-sm text-white placeholder:text-[#6E5353] outline-none focus:bg-black/60 focus:shadow-[0_15px_35px_rgba(0,0,0,0.35)] transition-all disabled:opacity-50 disabled:pointer-events-none font-sans",
        className
      )}
      {...props}
    />
  )
}

export { Input }
