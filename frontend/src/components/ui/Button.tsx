import * as React from "react"
import { cn } from "@/lib/utils"

const Button = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement> & { 
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost',
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'action' | 'icon',
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | 'full',
  fullWidth?: boolean
}>(
  ({ className, variant = 'primary', size = 'md', rounded = '3xl', fullWidth = false, ...props }, ref) => {
    const variants = {
      primary: "bg-[--color-primary] text-white hover:opacity-90",
      secondary: "bg-[--color-muted] border border-[--color-border] text-[--color-text] hover:bg-[--color-muted]/80",
      outline: "bg-transparent border border-[--color-border] text-[--color-text] hover:bg-[--color-muted]",
      danger: "bg-[--color-danger] text-white hover:opacity-90",
      ghost: "text-[--color-muted-foreground] hover:bg-[--color-muted] hover:text-[--color-text]"
    }

    const sizes = {
      sm: "h-7.5 px-3 text-xs",
      md: "h-8 px-4 py-1.5 text-xs",
      lg: "h-9 px-5 text-sm",
      xl: "h-14 px-6 text-sm gap-3",
      action: "h-11 px-6 text-[10px] uppercase tracking-widest gap-2",
      icon: "h-8 w-8 p-1.5"
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
          "inline-flex items-center justify-center font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--color-primary]/20 disabled:pointer-events-none disabled:opacity-50",
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

