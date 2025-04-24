
import * as React from "react"

export interface SidebarContextValue {
  isOpen: boolean
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>
  isCollapsed: boolean
  setIsCollapsed: React.Dispatch<React.SetStateAction<boolean>>
}

export const SidebarContext = React.createContext<SidebarContextValue | undefined>(
  undefined
)

export function useSidebar() {
  const context = React.useContext(SidebarContext)
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider")
  }
  return context
}

export interface SidebarProviderProps {
  children: React.ReactNode
  defaultIsCollapsed?: boolean
  defaultIsOpen?: boolean
}

export function SidebarProvider({
  children,
  defaultIsCollapsed = false,
  defaultIsOpen = true,
}: SidebarProviderProps) {
  const [isCollapsed, setIsCollapsed] = React.useState(defaultIsCollapsed)
  const [isOpen, setIsOpen] = React.useState(defaultIsOpen)

  return (
    <SidebarContext.Provider
      value={{
        isCollapsed,
        setIsCollapsed,
        isOpen,
        setIsOpen,
      }}
    >
      {children}
    </SidebarContext.Provider>
  )
}
