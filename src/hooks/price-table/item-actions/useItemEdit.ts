import { useState } from "react";
import { PriceService } from "@/services/price-service";
import { useDataSync } from "@/hooks/useDataSync";
import { useAuth } from "@/hooks/auth";
import { toast } from "@/utils/toast-utils";

export function useItemEdit(setPriceData: (data: any) => void) {
  const [isEditing, setIsEditing] = useState(false);
  const { registerAdminChange, isAdminAccess } = useDataSync();
  const { isAuthenticated } = useAuth();
  
  const handleEditItem = async (categoryId: string, itemId: string, values: any) => {
    if (!isAuthenticated) {
      toast.error("Você precisa estar autenticado", {
        description: "Faça login para editar itens."
      });
      return false;
    }
    
    if (!isAdminAccess) {
      toast.error("Permissão negada", {
        description: "Apenas administradores podem editar itens."
      });
      return false;
    }
    
    try {
      setIsEditing(true);
      
      // Get item name before editing for message
      const item = await PriceService.getItem(categoryId, itemId);
      const itemName = item?.name || itemId;
      
      // Only pass the allowed properties to editItem
      const itemData = {
        name: values.name,
        description: values.description,
        price: values.price,
        specs: values.specs,
        tags: values.tags,
        isHardware: values.isHardware
      };
      
      // Execute item editing
      const success = await PriceService.editItem(categoryId, itemId, itemData);
      
      if (!success) {
        throw new Error("Falha ao editar o item. Tente novamente.");
      }
      
      // Get updated data after editing
      const updatedData = await PriceService.getAllData();
      
      // Importante: Atualizar o estado com os dados atualizados
      setPriceData(updatedData);
      
      // Register change for notification
      await registerAdminChange("edit_item", `Item "${itemName}" editado na categoria "${categoryId}"`);
      
      toast.success("Item editado", {
        description: "O item foi editado com sucesso."
      });
      
      return true;
    } catch (error) {
      console.error("[ItemEdit] Erro ao editar item:", error);
      toast.error("Erro ao editar item", {
        description: error instanceof Error ? error.message : "Ocorreu um erro inesperado."
      });
      return false;
    } finally {
      setIsEditing(false);
    }
  };

  return {
    isEditing,
    handleEditItem
  };
}
