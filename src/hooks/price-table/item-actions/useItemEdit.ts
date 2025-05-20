
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
      console.log("[useItemEdit] Starting edit of item:", itemId, "with values:", values);
      setIsSubmittingItem(true);
      
      // Prepare metadata preserving existing values
      const existingMetadata = itemToEdit?.metadata || {};
      
      // Build complete metadata object
      const metadata = {
        ...existingMetadata,
        // CRITICAL: Capture disk-specific fields in metadata 
        type: values.type,
        subtype: values.subtype,
        capacity: values.capacity,
      };
      
      // IMPORTANT: Always explicitly include capacity and subtype at root level
      const updatedItemData = {
        name: values.name,
        description: values.description,
        price: values.price,
        type: values.type,
        // Ensure subtype is explicitly included at root level
        subtype: values.subtype, 
        specs: Array.isArray(values.specs) ? values.specs : [],
        tags: Array.isArray(values.tags) ? values.tags : [],
        // Update isHardware based on tags for backwards compatibility
        isHardware: Array.isArray(values.tags) ? values.tags.includes("Hardware") : false,
        // CRITICAL: Ensure capacity is preserved at root level
        capacity: values.capacity,
        // Preserve and extend metadata
        metadata: metadata
      };
      
      console.log("[useItemEdit] Updated item data to save:", updatedItemData);
      
      // Update item using existing method
      await PriceService.updateItem(activeTab, itemId, updatedItemData);
      
      // Force a trigger to save data to database
      await PriceService.saveData(await PriceService.getAllData());
      
      // Get fresh data
      const updatedData = await PriceService.getAllData();
      setPriceData(updatedData);

      // Trigger storage data updated event for synchronized components
      window.dispatchEvent(new CustomEvent('storage-data-updated'));
      
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
