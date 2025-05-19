
import { useState } from "react";
import { PriceService } from "@/services/price-service";
import { useToast } from "@/hooks/use-toast";
import { useDataSync } from "@/hooks/useDataSync";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { CheckCircle2 } from "lucide-react";

export function useDataActions(setPriceData: (data: any) => void) {
  const [isExporting, setIsExporting] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [hasConflicts, setHasConflicts] = useState(false);
  const { toast: uiToast } = useToast();
  const { user } = useAuth();
  const { registerAdminChange, syncWithLatestData } = useDataSync();

  // Track last notification to prevent duplicates
  const [lastNotificationTime, setLastNotificationTime] = useState<number>(0);

  // Explicit check to ensure admin access
  const isAdminAccess = user?.email === "admin@hostdime.com.br";

  // Periodically check for data conflicts
  const checkForConflicts = async () => {
    try {
      const hasDataConflicts = await PriceService.checkForDataConflicts();
      setHasConflicts(hasDataConflicts);
      
      if (hasDataConflicts && !isAdminAccess) {
        const now = Date.now();
        // Only show notification if it's been more than 10 seconds since the last one
        if (now - lastNotificationTime > 10000) {
          toast.info("Atualizações disponíveis", {
            description: "O administrador modificou os dados. Clique em 'Atualizar dados' para sincronizar.",
            duration: 5000
          });
          setLastNotificationTime(now);
        }
      }
    } catch (error) {
      console.error("Error checking for conflicts:", error);
    }
  };

  // Handle exporting data as JSON
  const handleExportData = async () => {
    try {
      setIsExporting(true);
      const data = await PriceService.getAllData();
      
      if (!data) {
        toast.error("Falha na exportação", {
          description: "Nenhum dado disponível para exportar."
        });
        return;
      }
      
      const dataStr = JSON.stringify(data, null, 2);
      const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
      
      // Create an invisible link and trigger a download
      const exportFileDefaultName = `price-data-${new Date().toISOString().slice(0, 10)}.json`;
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
      
      toast.success("Exportação concluída", {
        description: "Dados exportados com sucesso.",
        icon: <CheckCircle2 />
      });
    } catch (error) {
      toast.error("Falha na exportação", {
        description: "Não foi possível exportar os dados."
      });
    } finally {
      setIsExporting(false);
    }
  };

  // Handle resetting data to initial state
  const handleResetData = async () => {
    if (!isAdminAccess) {
      toast.error("Permissão negada", {
        description: "Somente administradores podem redefinir os dados."
      });
      return;
    }

    if (confirm("Tem certeza que deseja redefinir todos os dados para o padrão? Esta ação não pode ser desfeita.")) {
      try {
        setIsResetting(true);
        
        // Reset data in PriceService
        const resetData = await PriceService.resetData();
        
        if (resetData) {
          // Update state with reset data
          setPriceData(resetData);
          
          // Register change to notify other users
          await registerAdminChange("reset", "Todos os dados foram redefinidos para os valores padrão");
          
          toast.success("Dados redefinidos", {
            description: "Todos os dados foram redefinidos para os valores padrão.",
            icon: <CheckCircle2 />
          });
        } else {
          toast.error("Falha na redefinição", {
            description: "Não foi possível redefinir os dados."
          });
        }
      } catch (error) {
        console.error("Error resetting data:", error);
        toast.error("Falha na redefinição", {
          description: "Ocorreu um erro ao redefinir os dados."
        });
      } finally {
        setIsResetting(false);
      }
    }
  };

  // Function to force data update when there are multi-user conflicts
  const handleRefreshData = async () => {
    const now = Date.now();
    try {
      setIsRefreshing(true);
      
      // Force reload data from Supabase (possibly updated by another user)
      console.log("Refreshing data from source");
      const refreshedData = await PriceService.forceRefreshFromLatestSource();
      
      if (refreshedData) {
        // Update state with updated data
        setPriceData(refreshedData);
        setHasConflicts(false);
        
        // Update sync state
        await syncWithLatestData();
        
        // Only show notification if it's been more than 2.5 seconds since the last one
        if (now - lastNotificationTime > 2500) {
          toast.success("Sincronização concluída com sucesso", {
            icon: <CheckCircle2 />
          });
          setLastNotificationTime(now);
        }
      } else {
        toast.error("Falha na atualização", {
          description: "Não foi possível sincronizar os dados."
        });
      }
    } catch (error) {
      console.error("Error refreshing data:", error);
      toast.error("Falha na atualização", {
        description: "Ocorreu um erro ao atualizar os dados."
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  // Check for data conflicts and notify if necessary
  const checkForDataConflicts = async (): Promise<boolean> => {
    return await PriceService.checkForDataConflicts();
  };

  return {
    isExporting,
    isResetting,
    isRefreshing,
    hasConflicts,
    handleExportData,
    handleResetData,
    handleRefreshData,
    checkForDataConflicts,
    checkForConflicts
  };
}
