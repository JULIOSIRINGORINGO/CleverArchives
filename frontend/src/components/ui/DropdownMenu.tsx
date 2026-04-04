"use client";

import * as React from "react"
import { cn } from "@/lib/utils"

export const DropdownMenu = ({ children }: { children: React.ReactNode }) => {
  const [isOpen, setIsOpen] = React.useState(false)
  const containerRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <div className="relative inline-block text-left" ref={containerRef}>
      {React.Children.map(children, child => {
        if (React.isValidElement(child)) {
          // @ts-ignore
          return React.cloneElement(child, { isOpen, setIsOpen })
        }
        return child
      })}
    </div>
  )
}

export const DropdownMenuTrigger = ({ children, asChild, isOpen, setIsOpen }: any) => {
  return (
    <div onClick={() => setIsOpen(!isOpen)} className="cursor-pointer">
      {children}
    </div>
  )
}

export const DropdownMenuContent = ({ children, align = "end", className, isOpen, setIsOpen }: any) => {
  if (!isOpen) return null

  return (
    <div 
      className={cn(
        "absolute z-[100] mt-2 min-w-[12rem] overflow-hidden rounded-2xl border border-border/50 bg-gradient-to-b from-white to-slate-50/50 p-1.5 text-slate-900",
        align === "end" ? "right-0" : "left-0",
        className
      )}
    >
      {React.Children.map(children, child => {
        if (React.isValidElement(child)) {
          // @ts-ignore
          return React.cloneElement(child, { setIsOpen })
        }
        return child
      })}
    </div>
  )
}

export const DropdownMenuItem = ({ children, className, onClick, setIsOpen }: any) => {
  return (
    <div
      className={cn(
        "relative flex cursor-pointer select-none items-center gap-3 rounded-xl px-3 py-2.5 text-[11px] font-bold text-slate-700 outline-none transition-colors hover:bg-slate-50 active:bg-slate-100",
        className
      )}
      onClick={(e) => {
        e.stopPropagation();
        onClick?.();
        setIsOpen?.(false);
      }}
    >
      {children}
    </div>
  )
}
