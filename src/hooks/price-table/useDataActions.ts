
import { useState } from 'react';
import { PriceService } from "@/services/price-service";
import { toast } from "@/utils/toast-utils";

export function useDataActions(setPriceData: (data: any) => void) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [hasConflicts, setHasConflicts] = useState(false);
  
  // Check if there are conflicts between local and server data
  const checkForConflicts = async () => {
    try {
      const lastFetchTime = localStorage.getItem('price_data_last_fetch');
      
      if (!lastFetchTime) {
        // No fetch time recorded, cannot check for conflicts
        return false;
      }
      
      // Get timestamp of last modification from server
      const lastModified = await PriceService.getLastModifiedTime();
      
      if (!lastModified) {
        return false;
      }
      
      const localTime = new Date(lastFetchTime).getTime();
      const serverTime = new Date(lastModified).getTime();
      
      // If server data is newer, indicate a conflict
      if (serverTime > localTime) {
        setHasConflicts(true);
        console.log("Data conflicts detected", {
          localTime: new Date(localTime).toISOString(),
          serverTime: new Date(serverTime).toISOString()
        });
        return true;
      } else {
        setHasConflicts(false);
        return false;
      }
    } catch (error) {
      console.error("Error checking for conflicts:", error);
      toast.error("Erro ao verificar conflitos", {
        description: "Não foi possível comparar os dados locais com os do servidor."
      });
      return false;
    }
  };
  
  // Refresh data from server
  const handleRefreshData = async () => {
    try {
      setIsRefreshing(true);
      console.log("Refreshing data from server");
      
      const data = await PriceService.getAllData();
      
      if (data) {
        // Update state with fresh data
        setPriceData(data);
        
        // Update last fetch time
        localStorage.setItem('price_data_last_fetch', new Date().toISOString());
        
        // Clear conflict flag
        setHasConflicts(false);
        
        toast.info("Dados atualizados", {
          description: "Os dados foram sincronizados com o servidor."
        });
      } else {
        toast.error("Erro na atualização", {
          description: "Não foi possível obter os dados do servidor."
        });
      }
    } catch (error) {
      console.error("Error refreshing data:", error);
      toast.error("Erro na atualização", {
        description: "Ocorreu um problema ao atualizar os dados."
      });
    } finally {
      setIsRefreshing(false);
    }
  };
  
  // Reset data to defaults
  const handleResetData = async () => {
    try {
      console.log("Resetting data to defaults");
      
      // Reset the data on the server
      const success = await PriceService.resetToDefaults();
      
      if (success) {
        // Get the fresh default data
        const data = await PriceService.getAllData();
        
        if (data) {
          // Update state with default data
          setPriceData(data);
          
          // Update last fetch time
          localStorage.setItem('price_data_last_fetch', new Date().toISOString());
          
          toast.success("Dados redefinidos", {
            description: "Os dados foram restaurados para os valores padrão."
          });
        }
      } else {
        toast.error("Erro na redefinição", {
          description: "Não foi possível restaurar os dados padrão."
        });
      }
    } catch (error) {
      console.error("Error resetting data:", error);
      toast.error("Erro na redefinição", {
        description: "Ocorreu um problema ao restaurar os dados."
      });
    }
  };
  
  // Export data
  const handleExportData = () => {
    try {
      // Implementation of data export functionality
      console.log("Exporting data");
      // This is a placeholder for the actual export implementation
      toast.success("Dados exportados", {
        description: "Os dados foram exportados com sucesso."
      });
    } catch (error) {
      console.error("Error exporting data:", error);
      toast.error("Erro na exportação", {
        description: "Ocorreu um problema ao exportar os dados."
      });
    }
  };
  
  return {
    isRefreshing,
    hasConflicts,
    checkForConflicts,
    handleRefreshData,
    handleResetData,
    handleExportData
  };
}
