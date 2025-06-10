
import { Home, Cpu, Settings, FileText, Users, Activity, DollarSign } from "lucide-react";
import { SidebarItem } from "./SidebarItem";
import { useAuth } from "@/contexts/auth/UnifiedAuthContext";

export function Sidebar() {
  const { isAdmin } = useAuth();

  return (
    <div className="w-64 bg-background border-r border-border h-screen flex flex-col">
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Cpu className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-bold text-lg">HostDime</h1>
            <p className="text-xs text-muted-foreground">Cloud Configuration</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        <SidebarItem to="/home" icon={Home} label="Dashboard" />
        <SidebarItem to="/configure" icon={Settings} label="Configurador" />
        <SidebarItem to="/quotes" icon={FileText} label="Cotações" />
        
        {/* Admin only items */}
        {isAdmin && (
          <>
            <SidebarItem to="/system-components" icon={Cpu} label="Componentes" />
            <SidebarItem to="/price-table" icon={DollarSign} label="Tabela de Preços" />
            <SidebarItem to="/user-management" icon={Users} label="Usuários" />
            <SidebarItem to="/diagnostics" icon={Activity} label="Diagnósticos" />
          </>
        )}
      </nav>
    </div>
  );
}
