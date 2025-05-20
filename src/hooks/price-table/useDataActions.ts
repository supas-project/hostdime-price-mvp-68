
import { useState } from 'react';
import { PriceService } from "@/services/price-service";
import { toast } from "@/utils/toast-utils";
import { DeletedCategories, DeletedItems } from '@/types/pricing';

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
  
  // Apply deleted items from localStorage to data to prevent reappearance
  const applyDeletedItemsToData = (data: any) => {
    try {
      // Get deleted categories from localStorage
      const deletedCategoriesStr = localStorage.getItem('deletedCategories');
      if (deletedCategoriesStr) {
        const deletedCategories: DeletedCategories = JSON.parse(deletedCategoriesStr);
        
        // Remove any categories that are marked as deleted
        Object.keys(deletedCategories).forEach(categoryId => {
          if (data[categoryId]) {
            console.log(`Removing reappeared deleted category: ${categoryId}`);
            delete data[categoryId];
          }
        });
      }
      
      // Get deleted items from localStorage
      const deletedItemsStr = localStorage.getItem('deletedItems');
      if (deletedItemsStr) {
        const deletedItems: DeletedItems = JSON.parse(deletedItemsStr);
        
        // Remove any items that are marked as deleted
        Object.keys(deletedItems).forEach(categoryId => {
          if (data[categoryId] && Array.isArray(data[categoryId].items)) {
            const itemsToDelete = deletedItems[categoryId] || [];
            if (itemsToDelete.length > 0) {
              console.log(`Filtering out deleted items from category ${categoryId}`);
              data[categoryId].items = data[categoryId].items.filter(
                (item: any) => !itemsToDelete.includes(item.id)
              );
            }
          }
        });
      }
      
      return data;
    } catch (error) {
      console.error("Error applying deleted items to data:", error);
      return data; // Return original data if error
    }
  };
  
  // Refresh data from server
  const handleRefreshData = async () => {
    try {
      setIsRefreshing(true);
      console.log("Refreshing data from server");
      
      // Get fresh data from server
      const data = await PriceService.getAllData();
      
      if (data) {
        // Apply deleted items filter to prevent reappearance 
        const cleanedData = applyDeletedItemsToData(data);
        
        // Update state with fresh data
        setPriceData(cleanedData);
        
        // Update last fetch time
        localStorage.setItem('price_data_last_fetch', new Date().toISOString());
        
        // Clear conflict flag
        setHasConflicts(false);
        
        toast.info("Dados atualizados", {
          description: "Os dados foram sincronizados com o servidor."
        });
        
        // Trigger a custom event to notify other components about the data update
        window.dispatchEvent(new CustomEvent('data-refreshed'));
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
          // Clear deleted items tracking since we're resetting to defaults
          localStorage.removeItem('deletedCategories');
          localStorage.removeItem('deletedItems');
          
          // Update state with default data
          setPriceData(data);
          
          // Update last fetch time
          localStorage.setItem('price_data_last_fetch', new Date().toISOString());
          
          toast.success("Dados redefinidos", {
            description: "Os dados foram restaurados para os valores padrão."
          });
          
          // Trigger a custom event to notify other components about the data reset
          window.dispatchEvent(new CustomEvent('data-reset'));
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
  
  // Export data as JSON file
  const handleExportData = () => {
    try {
      // Get current data from PriceService or use the app state directly
      PriceService.getAllData().then(data => {
        if (!data) {
          toast.error("Erro na exportação", {
            description: "Não foi possível obter os dados para exportar."
          });
          return;
        }

        // Convert data to JSON string with formatting
        const jsonData = JSON.stringify(data, null, 2);
        
        // Create blob with JSON content
        const blob = new Blob([jsonData], { type: 'application/json' });
        
        // Create object URL for the blob
        const url = URL.createObjectURL(blob);
        
        // Create temporary anchor element
        const link = document.createElement('a');
        link.href = url;
        link.download = `hostdime_price_data_${new Date().toISOString().split('T')[0]}.json`;
        
        // Append to body, click and remove
        document.body.appendChild(link);
        link.click();
        
        // Clean up
        setTimeout(() => {
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
        }, 100);
        
        console.log("JSON file exported successfully");
        toast.success("Dados exportados", {
          description: "Os dados foram exportados com sucesso."
        });
      }).catch(error => {
        console.error("Error exporting data:", error);
        toast.error("Erro na exportação", {
          description: "Ocorreu um problema ao exportar os dados."
        });
      });
    } catch (error) {
      console.error("Error in export handler:", error);
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
