
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
      toast.error({
        title: "Erro ao adicionar item",
        description: "Nenhuma categoria selecionada.",
        variant: "destructive"
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
      
      toast.success({
        title: "Item adicionado",
        description: `O item ${values.name} foi adicionado com sucesso.`
      });
    } catch (error) {
      toast.error({
        title: "Erro ao adicionar item",
        description: error instanceof Error ? error.message : "Ocorreu um erro inesperado.",
        variant: "destructive"
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
      toast.error({
        title: "Erro ao editar item",
        description: "Nenhuma categoria ou item selecionado.",
        variant: "destructive"
      });
      return;
    }
    
    try {
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
      
      // Update item using existing method
      const updatedItem = PriceService.updateItem(activeTab, itemId, updatedItemData);
      
      // Update local state for immediate feedback
      setPriceData(prev => ({
        ...prev,
        [activeTab]: {
          ...prev[activeTab],
          items: prev[activeTab].items.map(item => 
            item.id === itemId ? updatedItem : item
          )
        }
      }));
      
      // Close edit dialog
      setOpenEditItem(false);
      setItemToEdit(undefined);
      
      toast.success({
        title: "Item atualizado",
        description: `O item ${values.name} foi atualizado com sucesso.`
      });
    } catch (error) {
      toast.error({
        title: "Erro ao editar item",
        description: error instanceof Error ? error.message : "Ocorreu um erro inesperado.",
        variant: "destructive"
      });
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
      
      toast.success({
        title: "Item excluído",
        description: "O item foi excluído com sucesso."
      });
      
      return true;
    } catch (error) {
      toast.error({
        title: "Erro ao excluir item",
        description: error instanceof Error ? error.message : "Ocorreu um erro inesperado.",
        variant: "destructive"
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
