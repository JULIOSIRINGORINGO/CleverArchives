import * as React from "react"
import { cn } from "@/lib/utils"

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  variant?: "default" | "ghost" | "chat-input";
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, variant, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex min-h-[120px] w-full rounded-2xl border border-border/40 bg-white px-4 py-3 text-sm text-foreground ring-offset-background placeholder:text-muted-foreground/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/5 focus-visible:border-primary disabled:cursor-not-allowed disabled:opacity-50 transition-all resize-none custom-scrollbar",
          variant === "ghost" && "border-none bg-transparent shadow-none focus-visible:ring-0",
          variant === "chat-input" && "min-h-[64px] h-[64px] max-h-[160px] bg-muted/5 border-border rounded-2xl px-6 py-4 transition-all resize-none scrollbar-none overflow-hidden text-[13px] leading-relaxed font-medium focus-visible:ring-primary/20",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Textarea.displayName = "Textarea"

export { Textarea }
