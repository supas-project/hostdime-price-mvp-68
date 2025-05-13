
import * as React from "react"
import { cn } from "@/lib/utils"
import { useIsMobile } from "@/hooks/use-mobile"
import { useSidebar } from "./sidebar-context"
import { Sheet, SheetContent } from "@/components/ui/sheet"

export interface SidebarProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode
}

export function Sidebar({ className, children, ...props }: SidebarProps) {
  const { isOpen, setIsOpen, isCollapsed } = useSidebar()
  const isMobile = useIsMobile()

  // Mobile: use sheet component
  if (isMobile) {
    return (
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent
          side="left"
          className={cn(
            "fixed inset-y-0 left-0 z-20 flex h-full flex-col p-0",
            "border-r border-border shadow-lg",
            className
          )}
          {...props}
        >
          <div className="flex flex-1 flex-col overflow-hidden">
            {children}
          </div>
        </SheetContent>
      </Sheet>
    )
  }

  // Desktop: render sidebar
  return (
    <aside
      data-state={isCollapsed ? "collapsed" : "expanded"}
      className={cn(
        "bg-sidebar-background text-sidebar-foreground relative z-30 flex h-full flex-col",
        "overflow-hidden border-r transition-all duration-300 ease-in-out shadow-md",
        isCollapsed ? "w-sidebar-collapsed" : "w-sidebar-expanded",
        className
      )}
      {...props}
    >
      {children}
    </aside>
  )
}
