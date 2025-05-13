
import { useState } from "react";
import { PriceItem } from "@/types/pricing";
import { PriceService } from "@/services/price-service";
import { useToast } from "@/hooks/use-toast";

export function useItemActions(
  activeTab: string,
  setPriceData: (data: any) => void
) {
  const [isSubmittingItem, setIsSubmittingItem] = useState(false);
  const [openAddItem, setOpenAddItem] = useState(false);
  const [openEditItem, setOpenEditItem] = useState(false);
  const [itemToEdit, setItemToEdit] = useState<PriceItem | undefined>(undefined);
  const { toast } = useToast();

  const handleInitiateEdit = (item: PriceItem) => {
    setItemToEdit(item);
    setOpenEditItem(true);
  };

  const handleAddItem = async (values: any) => {
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
      
      const itemData = {
        name: values.name,
        description: values.description,
        price: values.price,
        type: values.type || activeTab,
        subtype: values.subtype,
        specs: Array.isArray(values.specs) ? values.specs : [],
        tags: Array.isArray(values.tags) ? values.tags : [],
        // Set isHardware based on tags for backwards compatibility
        isHardware: Array.isArray(values.tags) ? values.tags.includes("Hardware") : false,
        metadata: {}
      };
      
      // Add item to service
      PriceService.addItem(activeTab, itemData);
      
      // Reload data for consistency
      const updatedData = PriceService.getAllData();
      setPriceData(updatedData);
      
      // Close modal
      setOpenAddItem(false);
      
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

  const handleEditItem = (values: any, itemId?: string) => {
    if (!activeTab || !itemId) {
      toast.error("Erro ao editar item", {
        description: "Nenhuma categoria ou item selecionado."
      });
      return;
    }
    
    try {
      setIsSubmittingItem(true);
      
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
      
      console.log("Atualizando item com dados:", updatedItemData);
      
      // Update item using existing method
      const updatedItem = PriceService.updateItem(activeTab, itemId, updatedItemData);
      
      // Update local state for immediate feedback
      setPriceData(prev => {
        // Create a deep copy to ensure we're not mutating the previous state
        const newState = JSON.parse(JSON.stringify(prev));
        
        if (newState[activeTab] && Array.isArray(newState[activeTab].items)) {
          const itemIndex = newState[activeTab].items.findIndex(
            (item: PriceItem) => item.id === itemId
          );
          
          if (itemIndex !== -1) {
            newState[activeTab].items[itemIndex] = updatedItem;
          }
        }
        
        return newState;
      });
      
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

  const handleDeleteItem = (itemId: string) => {
    if (!activeTab) return;
    
    try {
      PriceService.deleteItem(activeTab, itemId);
      
      // Atualiza o estado local para feedback imediato
      setPriceData(prev => ({
        ...prev,
        [activeTab]: {
          ...prev[activeTab],
          items: prev[activeTab].items.filter(item => item.id !== itemId)
        }
      }));
      
      toast.success("Item excluído", {
        description: "O item foi excluído com sucesso."
      });
      
      return true;
    } catch (error) {
      toast.error("Erro ao excluir item", {
        description: error instanceof Error ? error.message : "Ocorreu um erro inesperado."
      });
      return false;
    }
  };

  return {
    openAddItem,
    setOpenAddItem,
    openEditItem,
    setOpenEditItem,
    itemToEdit,
    setItemToEdit,
    isSubmittingItem,
    handleInitiateEdit,
    handleAddItem,
    handleEditItem,
    handleDeleteItem,
  };
}
