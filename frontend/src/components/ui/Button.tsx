import * as React from "react"
import { cn } from "@/lib/utils"

const Button = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement> & { 
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost',
  size?: 'sm' | 'md' | 'lg' | 'icon'
}>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
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
      icon: "h-8 w-8 p-1.5"
    }
    
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-3xl font-bold transition-all active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--color-primary]/20 disabled:pointer-events-none disabled:opacity-50 shadow-sm",
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }
