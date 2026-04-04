import * as React from "react"
import { cn } from "@/lib/utils"
import { Slot } from "@radix-ui/react-slot"

const Label = React.forwardRef<
  HTMLLabelElement,
  React.LabelHTMLAttributes<HTMLLabelElement> & { asChild?: boolean }
>(({ className, asChild, ...props }, ref) => {
  const Component = asChild ? Slot : "label"
  return (
    <Component
      ref={ref}
      className={cn(
        "text-sm font-normal text-slate-600/90 leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
        className
      )}
      {...props}
    />
  )
})
Label.displayName = "Label"

export { Label }
