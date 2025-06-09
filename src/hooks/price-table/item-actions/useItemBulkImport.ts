import { useState } from "react";
import { PriceService } from "@/services/price-service";
import { useDataSync } from "@/hooks/useDataSync";
import { useAuth } from "@/hooks/auth";
import { toast } from "@/utils/toast-utils";

export function useItemBulkImport(setPriceData: (data: any) => void) {
  const [isImporting, setIsImporting] = useState(false);
  const { registerAdminChange, isAdminAccess } = useDataSync();
  const { isAuthenticated } = useAuth();

  const handleBulkImport = async (categoryId: string, items: any[]) => {
    if (!isAuthenticated) {
      toast.error("Você precisa estar autenticado", {
        description: "Faça login para importar itens."
      });
      return false;
    }
    
    if (!isAdminAccess) {
      toast.error("Permissão negada", {
        description: "Apenas administradores podem importar itens."
      });
      return false;
    }
    
    try {
      setIsImporting(true);
      
      // Validate items before importing
      if (!items || !Array.isArray(items)) {
        throw new Error("Dados inválidos para importação. Verifique o arquivo.");
      }
      
      // Add category ID to each item
      const itemsWithCategory = items.map(item => ({
        ...item,
        category_id: categoryId
      }));
      
      // Bulk import items
      const importedItems = await PriceService.addItems(itemsWithCategory);
      
      // Get updated data after import
      const updatedData = await PriceService.getAllData();
      setPriceData(updatedData);
      
      // Register change for notification
      await registerAdminChange("bulk_import", `Importação em massa de ${items.length} itens para a categoria ${categoryId}`);
      
      toast.success("Itens importados", {
        description: `${items.length} itens foram importados com sucesso.`
      });
      
      return true;
    } catch (error) {
      console.error("Erro ao importar itens em massa:", error);
      toast.error("Erro ao importar itens em massa", {
        description: error instanceof Error ? error.message : "Ocorreu um erro inesperado."
      });
      return false;
    } finally {
      setIsImporting(false);
    }
  };

  return {
    isImporting,
    handleBulkImport
  };
}
