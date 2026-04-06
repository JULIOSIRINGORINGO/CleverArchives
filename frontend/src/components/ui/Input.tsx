import * as React from "react"
import { cn } from "@/lib/utils"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  variant?: "default" | "sidebar-search" | "chat-search-input" | "chat-recipient-search" | "none";
  rounded?: "xl" | "2xl" | "full";
  isHidden?: boolean;
  padding?: any;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, variant = "default", rounded = "2xl", isHidden, padding, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-11 w-full border border-border/40 bg-white px-4 py-2 text-sm text-foreground ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/5 focus-visible:border-primary disabled:cursor-not-allowed disabled:opacity-50 transition-all",
          variant !== "none" && !padding && "px-4 py-2",
          "custom-scrollbar transition-all",
          variant === "sidebar-search" && "h-9 text-[11px] pl-9 font-bold bg-muted/10 border-border/40 focus:bg-background transition-all",
          variant === "chat-search-input" && "h-10 text-xs pr-20 bg-muted/5 border-border/40 focus:bg-background transition-all",
          variant === "chat-recipient-search" && "h-11 pl-11 bg-muted/5 border-border/40 focus:bg-white transition-all",
          rounded === "xl" && "rounded-xl",
          rounded === "2xl" && "rounded-2xl",
          rounded === "full" && "rounded-full",
          isHidden && "hidden",
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
