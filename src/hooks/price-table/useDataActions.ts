import { useState } from "react";
import { PriceService } from "@/services/price-service";
import { toast } from "@/utils/toast-utils";
import { useAuth } from "@/contexts/AuthContext";
import { useDataSync } from "@/hooks/useDataSync";

export function useDataActions(setPriceData: (data: any) => void) {
  const [isExporting, setIsExporting] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const { isAuthenticated, isAdmin } = useAuth();
  const { registerAdminChange } = useDataSync();
  
  const handleExportData = async () => {
    if (!isAuthenticated) {
      toast.error("Você precisa estar autenticado", {
        description: "Faça login para exportar dados."
      });
      return;
    }
    
    try {
      setIsExporting(true);
      
      // Get the current data
      const data = await PriceService.getAllData();
      
      // Get last modified time
      const lastModified = await PriceService.getLastModifiedTime();
      
      // Prepare the export data with metadata
      const exportData = {
        data,
        metadata: {
          exportedAt: new Date().toISOString(),
          lastModified: lastModified || 'unknown',
          version: '1.0'
        }
      };
      
      // Convert to JSON
      const jsonData = JSON.stringify(exportData, null, 2);
      
      // Create a blob from the JSON
      const blob = new Blob([jsonData], { type: 'application/json' });
      
      // Create a download link
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `price-data-export-${new Date().toISOString().split('T')[0]}.json`;
      
      // Trigger download
      document.body.appendChild(a);
      a.click();
      
      // Cleanup
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success("Dados exportados com sucesso", {
        description: "Os dados foram exportados para um arquivo JSON."
      });
    } catch (error) {
      toast.error("Erro ao exportar dados", {
        description: error instanceof Error ? error.message : "Ocorreu um erro inesperado."
      });
    } finally {
      setIsExporting(false);
    }
  };
  
  const handleResetData = async () => {
    if (!isAuthenticated) {
      toast.error("Você precisa estar autenticado", {
        description: "Faça login para redefinir dados."
      });
      return;
    }
    
    if (!isAdmin) {
      toast.error("Permissão negada", {
        description: "Apenas administradores podem redefinir dados."
      });
      return;
    }
    
    try {
      setIsResetting(true);
      
      // Ask for confirmation
      if (!window.confirm("Esta ação irá redefinir todos os dados para os valores padrão. Esta ação não pode ser desfeita. Deseja continuar?")) {
        setIsResetting(false);
        return;
      }
      
      // Reset data to defaults
      const success = await PriceService.resetToDefaults();
      
      if (success) {
        // Get the updated data
        const updatedData = await PriceService.getAllData();
        setPriceData(updatedData);
        
        // Register change for notification
        await registerAdminChange("reset_data", "Dados redefinidos para valores padrão");
        
        toast.success("Dados redefinidos", {
          description: "Os dados foram redefinidos com sucesso."
        });
      } else {
        throw new Error("Falha ao redefinir dados");
      }
    } catch (error) {
      toast.error("Erro ao redefinir dados", {
        description: error instanceof Error ? error.message : "Ocorreu um erro inesperado."
      });
    } finally {
      setIsResetting(false);
    }
  };

  return {
    isExporting,
    isResetting,
    handleExportData,
    handleResetData
  };
}
