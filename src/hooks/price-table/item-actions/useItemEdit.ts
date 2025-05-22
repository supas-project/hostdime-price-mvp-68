
import { useState } from "react";
import { PriceItem } from "@/types/pricing";
import { PriceService } from "@/services/price-service";
import { useDataSync } from "@/hooks/useDataSync";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/utils/toast-utils";

export function useItemEdit(
  activeTab: string,
  setPriceData: (data: any) => void
) {
  const [openEditItem, setOpenEditItem] = useState(false);
  const [itemToEdit, setItemToEdit] = useState<PriceItem | undefined>(undefined);
  const [isSubmittingItem, setIsSubmittingItem] = useState(false);
  const { registerAdminChange, isAdminAccess } = useDataSync();
  const { isAuthenticated } = useAuth();

  const handleInitiateEdit = (item: PriceItem) => {
    if (!isAuthenticated) {
      toast.error("Você precisa estar autenticado", {
        description: "Faça login para editar itens."
      });
      return;
    }
    
    if (!isAdminAccess) {
      toast.error("Permissão negada", {
        description: "Apenas administradores podem editar itens."
      });
      return;
    }
    
    console.log("[useItemEdit] Initiating edit for item:", item);
    setItemToEdit(item);
    setOpenEditItem(true);
  };

  const handleEditItem = async (values: any, itemId?: string) => {
    // Check authentication
    if (!isAuthenticated) {
      toast.error("Você precisa estar autenticado", {
        description: "Faça login para editar itens."
      });
      return false;
    }
    
    // Check admin permission
    if (!isAdminAccess) {
      toast.error("Permissão negada", {
        description: "Apenas administradores podem editar itens."
      });
      return false;
    }
    
    if (!activeTab || !itemId) {
      toast.error("Erro ao editar item", {
        description: "Nenhuma categoria ou item selecionado."
      });
      return false;
    }
    
    try {
      setIsSubmittingItem(true);
      
      console.log("[useItemEdit] Editing item with values:", values);
      console.log("[useItemEdit] Item ID:", itemId);
      
      const updatedItemData = {
        name: values.name,
        description: values.description,
        price: values.price,
        type: values.type,
        subtype: values.subtype,
        specs: Array.isArray(values.specs) ? values.specs : [],
        tags: Array.isArray(values.tags) ? values.tags : [],
        // Update isHardware based on tags for backwards compatibility
        isHardware: Array.isArray(values.tags) ? values.tags.includes("Hardware") : false,
      };
      
      console.log("[useItemEdit] Prepared update data:", updatedItemData);
      
      // Update item using existing method
      const updated = await PriceService.updateItem(activeTab, itemId, updatedItemData);
      
      if (!updated) {
        throw new Error("Falha ao atualizar o item. Verifique os logs para mais detalhes.");
      }
      
      console.log("[useItemEdit] Item updated successfully:", updated);
      
      // Get fresh data
      const updatedData = await PriceService.getAllData();
      setPriceData(updatedData);
      
      // Get category for notification
      const category = await PriceService.getCategory(activeTab);
      // Register change for notification
      await registerAdminChange("edit_item", `Item "${values.name}" atualizado na categoria ${category?.name || activeTab}`);
      
      // Close edit dialog and reset state
      setOpenEditItem(false);
      setItemToEdit(undefined);
      
      toast.success("Item atualizado", {
        description: `O item ${values.name} foi atualizado com sucesso.`
      });
      
      return true;
    } catch (error) {
      console.error("[useItemEdit] Error updating item:", error);
      toast.error("Erro ao editar item", {
        description: error instanceof Error ? error.message : "Ocorreu um erro inesperado."
      });
      return false;
    } finally {
      setIsSubmittingItem(false);
    }
  };

  return {
    openEditItem,
    setOpenEditItem,
    itemToEdit,
    setItemToEdit,
    isSubmittingItem,
    handleInitiateEdit,
    handleEditItem
  };
}
