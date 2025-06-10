
import { useState } from "react";
import { PriceService } from "@/services/price-service";
import { useDataSync } from "@/hooks/useDataSync";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/utils/toast-utils";
import { parseBRLToFloat } from "@/utils/number-formatter";

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
      
      // Processar preço para garantir formato numérico correto
      const price = parseBRLToFloat(values.price);
      console.log(`[useItemAdd] Processed price: ${values.price} -> ${price}`);
      
      const itemData = {
        name: values.name,
        description: values.description,
        price: price,
        type: values.type || activeTab,
        subtype: values.subtype,
        specs: Array.isArray(values.specs) ? values.specs : [],
        tags: Array.isArray(values.tags) ? values.tags : [],
        // Set isHardware based on tags for backwards compatibility
        isHardware: Array.isArray(values.tags) ? values.tags.includes("Hardware") : false,
        metadata: {}
      };
      
      // Add item to service
      await PriceService.addItem(activeTab, itemData);
      
      // Reload data for consistency
      const updatedData = await PriceService.getAllData();
      setPriceData(updatedData);
      
      // Close modal
      setOpenAddItem(false);
      
      // Get the category name for the notification
      const category = await PriceService.getCategory(activeTab);
      // Register change for notification
      await registerAdminChange("add_item", `Item "${values.name}" adicionado na categoria ${category?.name || activeTab}`);
      
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
