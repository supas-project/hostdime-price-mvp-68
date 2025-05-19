
import { useState } from "react";
import { PriceService } from "@/services/price-service";
import { useToast } from "@/hooks/use-toast";
import { useDataSync } from "@/hooks/useDataSync";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export function useDataActions(setPriceData: (data: any) => void) {
  const [isExporting, setIsExporting] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [hasConflicts, setHasConflicts] = useState(false);
  const { toast: uiToast } = useToast();
  const { isAdmin, user } = useAuth();
  const { registerAdminChange, syncWithLatestData } = useDataSync();

  // Explicit check to ensure admin access
  const isAdminAccess = isAdmin || user?.email === "admin@hostdime.com.br";

  // Periodically check for data conflicts
  const checkForConflicts = async () => {
    try {
      const hasDataConflicts = await PriceService.checkForDataConflicts();
      setHasConflicts(hasDataConflicts);
      
      if (hasDataConflicts && !isAdminAccess) {
        toast.info("Alterações detectadas", {
          description: "O administrador modificou os dados. Clique em 'Atualizar dados' para sincronizar.",
          duration: 6000
        });
      }
    } catch (error) {
      console.error("Erro ao verificar conflitos:", error);
    }
  };

  // Handle exporting data as JSON
  const handleExportData = async () => {
    try {
      setIsExporting(true);
      const data = await PriceService.getAllData();
      const dataStr = JSON.stringify(data, null, 2);
      const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
      
      // Create an invisible link and trigger a download
      const exportFileDefaultName = `price-data-${new Date().toISOString().slice(0, 10)}.json`;
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
      
      toast.success("Exportação concluída", {
        description: "Dados exportados com sucesso."
      });
    } catch (error) {
      toast.error("Erro ao exportar dados", {
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
        description: "Apenas administradores podem resetar os dados."
      });
      return;
    }

    if (confirm("Tem certeza que deseja resetar todos os dados para o padrão inicial? Esta ação não pode ser desfeita.")) {
      try {
        setIsResetting(true);
        
        // Reset data in PriceService
        const resetData = await PriceService.resetData();
        
        // Update state with reset data
        setPriceData(resetData);
        
        // Register change to notify other users
        await registerAdminChange("reset", "Todos os dados foram resetados para os valores padrão");
        
        toast.success("Dados resetados", {
          description: "Todos os dados foram redefinidos para o padrão inicial."
        });
      } catch (error) {
        toast.error("Erro ao resetar dados", {
          description: "Não foi possível resetar os dados."
        });
      } finally {
        setIsResetting(false);
      }
    }
  };

  // Function to force data update when there are multi-user conflicts
  const handleRefreshData = async () => {
    try {
      setIsRefreshing(true);
      
      // Force reload data from Supabase (possibly updated by another user)
      const refreshedData = await PriceService.forceRefreshFromLatestSource();
      
      // Update state with updated data
      setPriceData(refreshedData);
      setHasConflicts(false);
      
      // Update sync state
      await syncWithLatestData();
      
      toast.success("Dados atualizados", {
        description: "Os dados foram sincronizados com a fonte mais recente."
      });
    } catch (error) {
      toast.error("Erro ao atualizar dados", {
        description: "Não foi possível sincronizar os dados."
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
