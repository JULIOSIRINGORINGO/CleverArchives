import * as React from "react"
import { cn } from "@/lib/utils"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  rounded?: "xl" | "2xl" | "full"
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, rounded = "2xl", ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-11 w-full border border-border/40 bg-white px-4 py-2 text-sm text-foreground ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/5 focus-visible:border-primary disabled:cursor-not-allowed disabled:opacity-50 transition-all shadow-sm shadow-black/[0.02]",
          rounded === "xl" && "rounded-xl",
          rounded === "2xl" && "rounded-2xl",
          rounded === "full" && "rounded-full",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
