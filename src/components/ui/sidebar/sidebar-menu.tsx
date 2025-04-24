
import * as React from "react"
import { cn } from "@/lib/utils"
import { useSidebar } from "./sidebar-context"
import { Slot } from "@radix-ui/react-slot"

export interface SidebarMenuProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

export function SidebarMenu({ className, children, ...props }: SidebarMenuProps) {
  return (
    <div className={cn("space-y-1", className)} role="menu" {...props}>
      {children}
    </div>
  )
}

export interface SidebarMenuItemProps
  extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

export function SidebarMenuItem({
  className,
  children,
  ...props
}: SidebarMenuItemProps) {
  return (
    <div className={cn("cursor-pointer", className)} role="menuitem" {...props}>
      {children}
    </div>
  )
}

export interface SidebarMenuButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode
  asChild?: boolean
}

export function SidebarMenuButton({
  className,
  children,
  asChild = false,
  ...props
}: SidebarMenuButtonProps) {
  const { isCollapsed } = useSidebar()
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      className={cn(
        "sidebar-menu-button flex w-full cursor-pointer items-center rounded-md px-2 py-2 outline-none transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:bg-sidebar-accent focus-visible:text-sidebar-accent-foreground focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50",
        isCollapsed ? "justify-center" : "justify-start",
        className
      )}
      {...props}
    >
      <div
        className={cn(
          "flex items-center gap-2 truncate",
          isCollapsed && "flex-col justify-center"
        )}
      >
        {children}
      </div>
    </Comp>
  )
}
