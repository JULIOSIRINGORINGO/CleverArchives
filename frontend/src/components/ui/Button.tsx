import * as React from "react"
import { cn } from "@/lib/utils"

const Button = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement> & { 
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost' | 'list-item' | 'action-send',
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'action' | 'icon',
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | 'full',
  fullWidth?: boolean
}>(
  ({ className, variant = 'primary', size = 'md', rounded = '3xl', fullWidth = false, ...props }, ref) => {
    const variants = {
      primary: "bg-primary text-white bg-gradient-to-t from-black/5 to-transparent border border-primary/20 hover:brightness-105",
      secondary: "bg-muted border border-border/50 text-foreground hover:bg-muted/80",
      outline: "bg-transparent border border-border/60 text-foreground hover:bg-muted/50",
      danger: "bg-destructive text-white hover:opacity-90",
      ghost: "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
      "list-item": "bg-transparent text-foreground hover:bg-muted/10 justify-start px-0 font-normal border-none",
      "action-send": "h-14 w-14 shrink-0 p-0 text-white bg-primary border border-primary/20 hover:brightness-110 active:scale-95 group rounded-full [&_svg]:transition-transform [&_svg]:group-active:translate-x-0.5 [&_svg]:group-active:-translate-y-0.5"
    }

    const sizes = {
      sm: "h-7 px-3 text-[12px] font-semibold gap-1.5",
      md: "h-8 px-4 py-1.5 text-sm font-semibold gap-2",
      lg: "h-9 px-5 text-sm font-semibold gap-2",
      xl: "h-14 px-6 text-sm font-semibold gap-3",
      action: "h-11 px-6 text-xs font-semibold gap-2",
      icon: "h-7 w-7 p-1"
    }

    const rounding = {
      none: "rounded-none",
      sm: "rounded-sm",
      md: "rounded-md",
      lg: "rounded-lg",
      xl: "rounded-xl",
      "2xl": "rounded-2xl",
      "3xl": "rounded-3xl",
      full: "rounded-full"
    }
    
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center font-semibold transition-all border-none focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary/20 disabled:pointer-events-none disabled:opacity-50",
          variants[variant],
          sizes[size],
          rounding[rounded],
          fullWidth && "w-full",
          className
        )}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }
