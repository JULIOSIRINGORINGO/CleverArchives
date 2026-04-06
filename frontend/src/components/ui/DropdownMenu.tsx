import React from "react"
import { cn } from "@/lib/utils"
import { Box } from "./Box"
import { Text as UIText } from "./Text"

interface DropdownMenuContentProps {
  children: React.ReactNode;
  align?: "start" | "end" | "center";
  className?: string;
  isOpen?: boolean;
  setIsOpen?: (open: boolean) => void;
  width?: "44" | "48" | "56" | "64";
}

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

export const DropdownMenuContent = ({ 
  children, 
  align = "end", 
  className, 
  isOpen, 
  setIsOpen,
  width = "48" 
}: DropdownMenuContentProps) => {
  if (!isOpen) return null

  const widthMap = {
    "44": "w-44",
    "48": "w-48",
    "56": "w-56",
    "64": "w-64"
  }

  const alignStyles = {
    start: "left-0",
    end: "right-0",
    center: "left-1/2 -translate-x-1/2"
  }

  return (
    <Box 
      position="absolute"
      className={cn(
        "top-full z-100 mt-2 rounded-2xl border border-border bg-white p-2 shadow-2xl backdrop-blur-xl",
        alignStyles[align],
        widthMap[width],
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
    </Box>
  )
}

export const DropdownMenuItem = ({ children, onClick, setIsOpen, color = "default" }: any) => {
  return (
    <Box
      variant="list-row"
      paddingX="md"
      paddingY="sm"
      display="flex"
      align="center"
      spacing="md"
      cursor="pointer"
      rounded="lg"
      color={color}
      onClick={(e) => {
        e.stopPropagation();
        onClick?.();
        setIsOpen?.(false);
      }}
    >
      {React.Children.map(children, (child) => 
        typeof child === "string" || typeof child === "number" ? (
          <UIText variant="subheading" weight="bold" color={color}>
            {child}
          </UIText>
        ) : (
          child
        )
      )}
    </Box>
  )
}
