
import { useState } from "react";
import { PriceService } from "@/services/price-service";
import { useDataSync } from "@/hooks/useDataSync";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/utils/toast-utils";

export function useItemDelete(
  activeTab: string,
  setPriceData: (data: any) => void
) {
  const [isDeleting, setIsDeleting] = useState(false);
  const { registerAdminChange, isAdminAccess } = useDataSync();
  const { isAuthenticated } = useAuth();

  const handleDeleteItem = async (itemId: string) => {
    // Check authentication
    if (!isAuthenticated) {
      toast.error("Você precisa estar autenticado", {
        description: "Faça login para excluir itens."
      });
      return false;
    }
    
    // Check admin permission
    if (!isAdminAccess) {
      toast.error("Permissão negada", {
        description: "Apenas administradores podem excluir itens."
      });
      return false;
    }
    
    if (!activeTab) return false;
    
    try {
      setIsDeleting(true);
      console.log(`[useItemDelete] Deletando item ${itemId} da categoria ${activeTab}`);
      
      // Get item name before deleting for message
      const category = await PriceService.getCategory(activeTab);
      const itemToDelete = category?.items.find(item => item.id === itemId);
      
      if (!itemToDelete) {
        console.warn(`[useItemDelete] Item ${itemId} não encontrado na categoria ${activeTab}`);
        toast.error("Item não encontrado", {
          description: "O item que você está tentando excluir não foi encontrado."
        });
        return false;
      }
      
      // Chamar deleteItem com ID correto
      const success = await PriceService.deleteItem(activeTab, itemId);
      
      if (!success) {
        console.error(`[useItemDelete] Falha ao excluir o item ${itemId}`);
        toast.error("Erro ao excluir item", {
          description: "Ocorreu um erro ao excluir o item. Tente novamente."
        });
        return false;
      }
      
      // Get fresh data
      const updatedData = await PriceService.getAllData();
      setPriceData(updatedData);
      
      // Register change for notification
      await registerAdminChange("delete_item", `Item "${itemToDelete?.name || itemId}" excluído da categoria ${category?.name || activeTab}`);
      
      toast.success("Item excluído", {
        description: "O item foi excluído com sucesso."
      });
      
      return true;
    } catch (error) {
      console.error("[useItemDelete] Erro ao excluir item:", error);
      toast.error("Erro ao excluir item", {
        description: error instanceof Error ? error.message : "Ocorreu um erro inesperado."
      });
      return false;
    } finally {
      setIsDeleting(false);
    }
  };

  return {
    isDeleting,
    handleDeleteItem
  };
}
