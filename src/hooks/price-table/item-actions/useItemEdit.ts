
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
    
    setItemToEdit(item);
    setOpenEditItem(true);
  };

  const handleEditItem = async (values: any, itemId?: string) => {
    // Check authentication
    if (!isAuthenticated) {
      toast.error("Você precisa estar autenticado", {
        description: "Faça login para editar itens."
      });
      return;
    }
    
    // Check admin permission
    if (!isAdminAccess) {
      toast.error("Permissão negada", {
        description: "Apenas administradores podem editar itens."
      });
      return;
    }
    
    if (!activeTab || !itemId) {
      toast.error("Erro ao editar item", {
        description: "Nenhuma categoria ou item selecionado."
      });
      return;
    }
    
    try {
      console.log("Starting edit of item:", itemId, "with values:", values);
      setIsSubmittingItem(true);
      
      const updatedItemData = {
        name: values.name,
        description: values.description,
        price: values.price,
        type: values.type,
        subtype: values.subtype, // Ensure subtype is included here
        specs: Array.isArray(values.specs) ? values.specs : [],
        tags: Array.isArray(values.tags) ? values.tags : [],
        // Update isHardware based on tags for backwards compatibility
        isHardware: Array.isArray(values.tags) ? values.tags.includes("Hardware") : false,
        // For disk items, ensure capacity is preserved
        capacity: values.capacity || itemToEdit?.capacity,
        // Preserve metadata if it exists
        metadata: {
          ...(itemToEdit?.metadata || {}),
          // If this is a disk item, make sure we preserve disk-specific metadata
          type: values.type,
          subtype: values.subtype,
          capacity: values.capacity || (itemToEdit?.capacity || undefined)
        }
      };
      
      console.log("Updated item data to save:", updatedItemData);
      
      // Update item using existing method
      await PriceService.updateItem(activeTab, itemId, updatedItemData);
      
      // Ensure data is saved to the database
      await PriceService.saveData(await PriceService.getAllData());
      
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
    } catch (error) {
      console.error("Erro ao atualizar item:", error);
      toast.error("Erro ao editar item", {
        description: error instanceof Error ? error.message : "Ocorreu um erro inesperado."
      });
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
