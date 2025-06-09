import { useState } from "react";
import { PriceService } from "@/services/price-service";
import { useDataSync } from "@/hooks/useDataSync";
import { useAuth } from "@/hooks/auth";
import { toast } from "@/utils/toast-utils";

export function useItemDelete(setPriceData: (data: any) => void) {
  const [isDeleting, setIsDeleting] = useState(false);
  const { registerAdminChange, isAdminAccess } = useDataSync();
  const { isAuthenticated } = useAuth();

  const handleDeleteItem = async (categoryId: string, itemId: string) => {
    if (!isAuthenticated) {
      toast.error("Você precisa estar autenticado", {
        description: "Faça login para excluir itens."
      });
      return false;
    }

    if (!isAdminAccess) {
      toast.error("Permissão negada", {
        description: "Apenas administradores podem excluir itens."
      });
      return false;
    }

    try {
      setIsDeleting(true);

      // Get item name before deleting for message
      const item = await PriceService.getItem(categoryId, itemId);
      const itemName = item?.name || itemId;

      // Execute item deletion
      const success = await PriceService.deleteItem(categoryId, itemId);

      if (!success) {
        throw new Error("Falha ao excluir o item. Tente novamente.");
      }

      // Get updated data after deletion
      const updatedData = await PriceService.getAllData();

      // Log para debug - verificar se o item foi removido dos dados
      console.log(`[ItemDelete] Item ${itemId} removido da categoria ${categoryId}. Itens restantes:`,
        updatedData[categoryId]?.items?.map((item: any) => item.id).join(", "));

      // Importante: Atualizar o estado com os dados atualizados
      setPriceData(updatedData);

      // Register change for notification
      await registerAdminChange("delete_item", `Item "${itemName}" excluído da categoria "${categoryId}"`);

      toast.success("Item excluído", {
        description: "O item foi excluído com sucesso."
      });

      return true;
    } catch (error) {
      console.error("[ItemDelete] Erro ao excluir item:", error);
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
