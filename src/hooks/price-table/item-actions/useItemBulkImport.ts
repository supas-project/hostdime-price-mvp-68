
import { useState } from "react";
import { PriceItem } from "@/types/pricing";
import { PriceService } from "@/services/price-service";
import { useDataSync } from "@/hooks/useDataSync";
import { useAppStore } from "@/store/appStore";
import { toast } from "@/utils/toast-utils";

export function useItemBulkImport(
  activeTab: string,
  setPriceData: (data: any) => void
) {
  const [isImporting, setIsImporting] = useState(false);
  const [openBulkImport, setOpenBulkImport] = useState(false);
  const { registerAdminChange, isAdminAccess } = useDataSync();
  const { isAuthenticated } = useAuth();

  const handleBulkImport = async (items: PriceItem[]): Promise<{
    success: boolean;
    message: string;
    importedCount: number;
  }> => {
    // Check authentication
    if (!isAuthenticated) {
      return {
        success: false,
        message: "Você precisa estar autenticado para adicionar itens.",
        importedCount: 0
      };
    }
    
    // Check admin permission
    if (!isAdminAccess) {
      return {
        success: false,
        message: "Permissão negada. Apenas administradores podem adicionar itens.",
        importedCount: 0
      };
    }
    
    // Avoid multiple submissions
    if (isImporting) {
      return {
        success: false,
        message: "Uma importação já está em andamento.",
        importedCount: 0
      };
    }
    
    if (!activeTab) {
      return {
        success: false,
        message: "Nenhuma categoria selecionada.",
        importedCount: 0
      };
    }
    
    try {
      setIsImporting(true);
      
      if (!items.length) {
        return {
          success: false,
          message: "Nenhum item para importar.",
          importedCount: 0
        };
      }
      
      console.log(`[useItemBulkImport] Importing ${items.length} items to category ${activeTab}`);
      
      // Prepare items for import, ensuring required fields
      const preparedItems = items.map(item => ({
        ...item,
        // Ensure these fields are present and properly formatted
        name: item.name,
        description: item.description || "",
        price: typeof item.price === 'number' ? item.price : parseFloat(String(item.price)),
        type: item.type || activeTab,
        subtype: item.subtype || "",
        specs: Array.isArray(item.specs) ? item.specs : [],
        tags: Array.isArray(item.tags) ? item.tags : [],
        // Set isHardware based on tags for backwards compatibility
        isHardware: Array.isArray(item.tags) ? item.tags.includes("Hardware") : !!item.isHardware,
        metadata: item.metadata || {}
      }));
      
      // Import each item
      const importResults = await Promise.all(
        preparedItems.map(async (itemData) => {
          try {
            const result = await PriceService.addItem(activeTab, itemData);
            return { success: !!result, item: itemData };
          } catch (error) {
            console.error(`Error importing item ${itemData.name}:`, error);
            return { success: false, item: itemData, error };
          }
        })
      );
      
      // Count successful imports
      const successCount = importResults.filter(r => r.success).length;
      
      // Reload data for consistency
      const updatedData = await PriceService.getAllData();
      setPriceData(updatedData);
      
      // Close modal (handled by parent component)
      
      // Get the category name for the notification
      const category = await PriceService.getCategory(activeTab);
      
      // Register change for notification
      if (successCount > 0) {
        await registerAdminChange(
          "bulk_import", 
          `${successCount} itens importados na categoria ${category?.name || activeTab}`
        );
      }
      
      // Prepare result message
      if (successCount === items.length) {
        return {
          success: true,
          message: `Todos os ${successCount} itens foram importados com sucesso.`,
          importedCount: successCount
        };
      } else if (successCount > 0) {
        return {
          success: true,
          message: `${successCount} de ${items.length} itens foram importados com sucesso.`,
          importedCount: successCount
        };
      } else {
        return {
          success: false,
          message: "Não foi possível importar nenhum item. Verifique o formato e tente novamente.",
          importedCount: 0
        };
      }
    } catch (error) {
      console.error("[useItemBulkImport] Error in bulk import:", error);
      return {
        success: false,
        message: error instanceof Error ? error.message : "Ocorreu um erro inesperado.",
        importedCount: 0
      };
    } finally {
      // Reset state after a period
      setTimeout(() => {
        setIsImporting(false);
      }, 500);
    }
  };

  return {
    openBulkImport,
    setOpenBulkImport,
    isImporting,
    handleBulkImport
  };
}
