
import { HardDrive } from "lucide-react";
import { SyncIndicator } from "@/components/price-table/SyncIndicator";
import { useDataSync } from "@/hooks/useDataSync";
import { useState } from "react";
import { useAppStore } from "@/store/appStore";

interface PriceTableHeaderProps {
  lastSyncTime: Date | null;
}

export function PriceTableHeader({ lastSyncTime }: PriceTableHeaderProps) {
  const { hasUpdates, syncWithLatestData } = useDataSync();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { isAdmin } = useAuth();
  
  // Handle refresh function
  const handleRefresh = () => {
    setIsRefreshing(true);
    // Simple timeout to simulate refresh process
    setTimeout(() => {
      syncWithLatestData();
      setIsRefreshing(false);
    }, 1000);
  };
  
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-md bg-primary/10 text-primary">
          <HardDrive className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary via-primary/90 to-primary/70 bg-clip-text text-transparent">
            Tabela de Preços
          </h1>
          <p className="text-muted-foreground">
            {isAdmin 
              ? "Gerencie os preços dos componentes para servidores" 
              : "Visualize os preços dos componentes para servidores"}
          </p>
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <SyncIndicator 
          lastSyncTime={lastSyncTime}
          hasConflicts={hasUpdates}
          onRefresh={handleRefresh}
          isRefreshing={isRefreshing}
        />
      </div>
    </div>
  );
}
