
import { HardDrive } from "lucide-react";
import { SyncIndicator } from "@/components/price-table/SyncIndicator";
import { useAuth } from "@/contexts/auth/UnifiedAuthContext";
import { ConsolidatedLoadingState } from "@/hooks/price-table/useConsolidatedLoading";

interface PriceTableHeaderProps {
  lastSyncTime: Date | null;
  hasConflicts: boolean;
  onRefresh: () => void;
  consolidatedLoading: ConsolidatedLoadingState;
}

export function PriceTableHeader({ 
  lastSyncTime, 
  hasConflicts, 
  onRefresh,
  consolidatedLoading 
}: PriceTableHeaderProps) {
  const { isAdmin } = useAuth();
  const { isLoading, currentState } = consolidatedLoading;
  
  // Determine if refreshing based on consolidated state
  const isRefreshing = isLoading && (currentState === 'refreshing' || currentState === 'syncing');
  
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
          hasConflicts={hasConflicts}
          onRefresh={onRefresh}
          isRefreshing={isRefreshing}
        />
      </div>
    </div>
  );
}
