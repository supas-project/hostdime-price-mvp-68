
import { LucideIcon } from "lucide-react";
import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";

interface SidebarItemProps {
  to: string;
  icon: LucideIcon;
  label: string;
}

export function SidebarItem({ to, icon: Icon, label }: SidebarItemProps) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cn(
          "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
          "hover:bg-accent hover:text-accent-foreground",
          isActive
            ? "bg-accent text-accent-foreground"
            : "text-muted-foreground"
        )
      }
    >
      <Icon className="w-4 h-4" />
      {label}
    </NavLink>
  );
}
