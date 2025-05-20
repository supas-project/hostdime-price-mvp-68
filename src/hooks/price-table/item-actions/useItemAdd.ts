
import { useState } from "react";
import { PriceService } from "@/services/price-service";
import { useDataSync } from "@/hooks/useDataSync";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/utils/toast-utils";
import { v4 as uuidv4 } from "uuid";

export function useItemAdd(
  activeTab: string,
  setPriceData: (data: any) => void
) {
  const [isSubmittingItem, setIsSubmittingItem] = useState(false);
  const [openAddItem, setOpenAddItem] = useState(false);
  const { registerAdminChange, isAdminAccess } = useDataSync();
  const { isAuthenticated } = useAuth();

  const handleAddItem = async (values: any) => {
    // Check authentication
    if (!isAuthenticated) {
      toast.error("Você precisa estar autenticado", {
        description: "Faça login para adicionar itens."
      });
      return;
    }
    
    // Check admin permission
    if (!isAdminAccess) {
      toast.error("Permissão negada", {
        description: "Apenas administradores podem adicionar itens."
      });
      return;
    }
    
    // Avoid multiple submissions
    if (isSubmittingItem) return;
    
    if (!activeTab) {
      toast.error("Erro ao adicionar item", {
        description: "Nenhuma categoria selecionada."
      });
      return;
    }
    
    try {
      setIsSubmittingItem(true);
      
      // Generate a UUID for the new item
      const itemId = uuidv4();
      
      const itemData = {
        id: itemId, // Add the ID to the item data
        name: values.name,
        description: values.description,
        price: values.price,
        type: values.type || activeTab,
        subtype: values.subtype,
        specs: Array.isArray(values.specs) ? values.specs : [],
        tags: Array.isArray(values.tags) ? values.tags : [],
        // Set isHardware based on tags for backwards compatibility
        isHardware: Array.isArray(values.tags) ? values.tags.includes("Hardware") : false,
        // Add capacity if it exists (especially for disk items)
        capacity: values.capacity,
        metadata: {
          // Ensure critical disk fields are stored in metadata too
          type: values.type || activeTab,
          subtype: values.subtype,
          capacity: values.capacity
        }
      };
      
      // Add item to service
      await PriceService.addItem(activeTab, itemData);
      
      // Ensure data is saved to the database
      await PriceService.saveData(await PriceService.getAllData());
      
      // Reload data for consistency
      const updatedData = await PriceService.getAllData();
      setPriceData(updatedData);
      
      // Close modal
      setOpenAddItem(false);
      
      // Get the category name for the notification
      const category = await PriceService.getCategory(activeTab);
      // Register change for notification
      await registerAdminChange("add_item", `Item "${values.name}" adicionado na categoria ${category?.name || activeTab}`);
      
      // Dispatch event for disk updates
      window.dispatchEvent(new CustomEvent('storage-data-updated'));
      
      toast.success("Item adicionado", {
        description: `O item ${values.name} foi adicionado com sucesso.`
      });
    } catch (error) {
      toast.error("Erro ao adicionar item", {
        description: error instanceof Error ? error.message : "Ocorreu um erro inesperado."
      });
    } finally {
      // Reset state after a period
      setTimeout(() => {
        setIsSubmittingItem(false);
      }, 500);
    }
  };

  return {
    openAddItem,
    setOpenAddItem,
    isSubmittingItem,
    handleAddItem
  };
}
