
import { useEffect } from "react";
import { PriceService } from "@/services/price-service";
import { PricedDiskOption } from "@/types/storage";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

interface DataSyncHandlerProps {
  selectedDisks: { disk: PricedDiskOption; quantity: number }[];
  hasLocalChanges: boolean;
  persistSelectionsToDatabase: (disks: { disk: PricedDiskOption; quantity: number }[]) => Promise<void>;
  refreshData: () => Promise<void>;
}

export function useDataSyncHandler({
  selectedDisks,
  hasLocalChanges,
  persistSelectionsToDatabase,
  refreshData
}: DataSyncHandlerProps) {
  const { user } = useAuth();
  
  // Verifica se o usuário é admin@hostdime.com.br
  const isAdmin = user?.email === "admin@hostdime.com.br";
  
  // Salva mudanças apenas quando explicitamente solicitado pelo admin
  // Removemos o useEffect que salvava automaticamente

  // Modificamos o handler de visibilidade para verificar apenas para o admin
  useEffect(() => {
    if (!isAdmin) return; // Só continua se for admin
    
    const handleVisibilityChange = async () => {
      if (!document.hidden) {
        console.log("[useDataSyncHandler] Page visibility changed to visible, checking for data changes");
        
        try {
          // O admin decide manualmente quando sincronizar
          // Removemos o código de verificação automática de conflitos
          
          // Se tivermos mudanças locais não salvas, persistir
          if (hasLocalChanges) {
            await persistSelectionsToDatabase(selectedDisks);
          }
        } catch (error) {
          console.error("[useDataSyncHandler] Error checking for data conflicts:", error);
        }
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      
      // Sempre persistir mudanças quando componente desmontar (apenas para admin)
      if (isAdmin && hasLocalChanges && selectedDisks.length > 0) {
        persistSelectionsToDatabase(selectedDisks);
      }
    };
  }, [isAdmin, hasLocalChanges, selectedDisks, refreshData, persistSelectionsToDatabase]);

  // Listen for storage data updates from other components - apenas para admin
  useEffect(() => {
    if (!isAdmin) return; // Só escuta eventos se for admin
    
    const handleStorageDataUpdated = () => {
      console.log("[useDataSyncHandler] Storage data updated event received");
      refreshData();
    };
    
    window.addEventListener('storage-data-updated', handleStorageDataUpdated);
    
    return () => {
      window.removeEventListener('storage-data-updated', handleStorageDataUpdated);
    };
  }, [refreshData, isAdmin]);

  return {};
}
