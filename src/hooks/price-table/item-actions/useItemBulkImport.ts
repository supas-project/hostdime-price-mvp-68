
import { useState } from "react";
import { PriceService } from "@/services/price-service";
import { useDataSync } from "@/hooks/useDataSync";
import { useAuth } from "@/hooks/auth";
import { toast } from "@/utils/toast-utils";

export function useItemBulkImport(setPriceData: (data: any) => void) {
  const [isImporting, setIsImporting] = useState(false);
  const [openBulkImport, setOpenBulkImport] = useState(false);
  const { registerAdminChange, isAdminAccess } = useDataSync();
  const { isAuthenticated } = useAuth();

  const handleBulkImport = async (items: any[]) => {
    if (!isAuthenticated) {
      toast.error("Você precisa estar autenticado", {
        description: "Faça login para importar itens."
      });
      return { success: false, message: "Authentication required", importedCount: 0 };
    }
    
    if (!isAdminAccess) {
      toast.error("Permissão negada", {
        description: "Apenas administradores podem importar itens."
      });
      return { success: false, message: "Permission denied", importedCount: 0 };
    }
    
    try {
      setIsImporting(true);
      
      // Validate items before importing
      if (!items || !Array.isArray(items)) {
        throw new Error("Dados inválidos para importação. Verifique o arquivo.");
      }
      
      // Import items one by one using addItem instead of non-existent addItems
      let importedCount = 0;
      for (const item of items) {
        try {
          const result = await PriceService.addItem(item.type || "general", item);
          if (result) {
            importedCount++;
          }
        } catch (itemError) {
          console.error("Error importing item:", item.name, itemError);
        }
      }
      
      // Get updated data after import
      const updatedData = await PriceService.getAllData();
      setPriceData(updatedData);
      
      // Register change for notification
      await registerAdminChange("bulk_import", `Importação em massa de ${importedCount} itens`);
      
      toast.success("Itens importados", {
        description: `${importedCount} itens foram importados com sucesso.`
      });
      
      return { success: true, message: "Import successful", importedCount };
    } catch (error) {
      console.error("Erro ao importar itens em massa:", error);
      toast.error("Erro ao importar itens em massa", {
        description: error instanceof Error ? error.message : "Ocorreu um erro inesperado."
      });
      return { success: false, message: error instanceof Error ? error.message : "Unknown error", importedCount: 0 };
    } finally {
      setIsImporting(false);
    }
  };

  return {
    isImporting,
    openBulkImport,
    setOpenBulkImport,
    handleBulkImport
  };
}
