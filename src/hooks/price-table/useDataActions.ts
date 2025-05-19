
import { useState } from "react";
import { PriceService } from "@/services/price-service";
import { useToast } from "@/hooks/use-toast";
import { useDataSync } from "@/hooks/useDataSync";
import { useAuth } from "@/contexts/AuthContext";

export function useDataActions(setPriceData: (data: any) => void) {
  const [isExporting, setIsExporting] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [hasConflicts, setHasConflicts] = useState(false);
  const { toast } = useToast();
  const { isAdmin, user } = useAuth();
  const { registerAdminChange, syncWithLatestData } = useDataSync();

  // CORREÇÃO: Verificação explícita para garantir acesso de administrador
  const isAdminAccess = isAdmin || user?.email === "admin@hostdime.com.br";

  // Verificar periodicamente se há conflitos de dados
  const checkForConflicts = async () => {
    try {
      const hasDataConflicts = await PriceService.checkForDataConflicts();
      setHasConflicts(hasDataConflicts);
      
      if (hasDataConflicts && !isAdminAccess) {
        toast({
          title: "Alterações detectadas",
          description: "O administrador modificou os dados. Clique em 'Atualizar dados' para sincronizar.",
          duration: 6000,
          variant: "default"
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
      
      toast({
        title: "Exportação concluída",
        description: "Dados exportados com sucesso."
      });
    } catch (error) {
      toast({
        title: "Erro ao exportar dados",
        description: "Não foi possível exportar os dados.",
        variant: "destructive"
      });
    } finally {
      setIsExporting(false);
    }
  };

  // Handle resetting data to initial state
  const handleResetData = async () => {
    if (!isAdminAccess) {
      toast({
        title: "Permissão negada",
        description: "Apenas administradores podem resetar os dados.",
        variant: "destructive"
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
        
        // Registre a alteração para notificar outros usuários
        await registerAdminChange("reset", "Todos os dados foram resetados para os valores padrão");
        
        toast({
          title: "Dados resetados",
          description: "Todos os dados foram redefinidos para o padrão inicial."
        });
      } catch (error) {
        toast({
          title: "Erro ao resetar dados",
          description: "Não foi possível resetar os dados.",
          variant: "destructive"
        });
      } finally {
        setIsResetting(false);
      }
    }
  };

  // Função para forçar atualização dos dados quando houver conflitos multiusuário
  const handleRefreshData = async () => {
    try {
      setIsRefreshing(true);
      
      // Força recarregar dados do Supabase (possivelmente atualizados por outro usuário)
      const refreshedData = await PriceService.forceRefreshFromLatestSource();
      
      // Atualiza o estado com os dados atualizados
      setPriceData(refreshedData);
      setHasConflicts(false);
      
      // Atualiza o estado de sincronização
      await syncWithLatestData();
      
      toast({
        title: "Dados atualizados",
        description: "Os dados foram sincronizados com a fonte mais recente."
      });
    } catch (error) {
      toast({
        title: "Erro ao atualizar dados",
        description: "Não foi possível sincronizar os dados.",
        variant: "destructive"
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  // Verifica se há conflitos de dados e notifica se necessário
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
