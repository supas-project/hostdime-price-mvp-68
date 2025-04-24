
import * as React from "react"
import { cn } from "@/lib/utils"
import { useSidebar } from "./sidebar-context"
import { Button } from "@/components/ui/button"
import { Menu, PanelLeft } from "lucide-react"

export interface SidebarHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode
}

export function SidebarHeader({
  className,
  children,
  ...props
}: SidebarHeaderProps) {
  return (
    <div
      className={cn("flex h-14 items-center border-b px-4", className)}
      {...props}
    >
      {children}
    </div>
  )
}

export interface SidebarFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode
}

export function SidebarFooter({
  className,
  children,
  ...props
}: SidebarFooterProps) {
  return (
    <div
      className={cn("flex items-center border-t p-4", className)}
      {...props}
    >
      {children}
    </div>
  )
}

export function SidebarTrigger() {
  const { isOpen, setIsOpen } = useSidebar()
  const { isCollapsed, setIsCollapsed } = useSidebar()
  const isMobile = React.useId() === "mobile"

  if (isMobile) {
    return (
      <Button
        variant="ghost"
        size="icon"
        className="sidebar-trigger"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Menu className="h-5 w-5" />
        <span className="sr-only">Toggle Sidebar</span>
      </Button>
    )
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      className="sidebar-trigger"
      onClick={() => setIsCollapsed(!isCollapsed)}
    >
      <PanelLeft className="h-5 w-5" />
      <span className="sr-only">Toggle Sidebar</span>
    </Button>
  )
}
