
import { useState } from "react";
import { PriceService } from "@/services/price-service";
import { toast } from "@/utils/toast-utils";
import { createItem, updateItem } from "@/utils/price-table-utils";
import { PriceItem } from "@/types/pricing";
import { notifyListeners } from "@/services/price/listeners";
import { syncProcessorUpdatesFromPriceTable } from "@/services/component-sync/processor-converter";

export function useItemActions(
  activeTab: string, 
  setPriceData: (data: any) => void
) {
  const [openAddItem, setOpenAddItem] = useState(false);
  const [openEditItem, setOpenEditItem] = useState(false);
  const [itemToEdit, setItemToEdit] = useState<PriceItem | null>(null);
  const [isSubmittingItem, setIsSubmittingItem] = useState(false);

  const handleInitiateEdit = (item: PriceItem) => {
    setItemToEdit(item);
    setOpenEditItem(true);
  };

  const handleAddItem = async (categoryId: string, item: Partial<PriceItem>) => {
    setIsSubmittingItem(true);
    try {
      const newItem = createItem(item);
      
      await PriceService.addItem(categoryId, newItem);
      
      // Atualizar o estado local após o item ser adicionado
      const updatedData = await PriceService.getAllData();
      setPriceData(updatedData);
      
      // Notificar os ouvintes sobre a mudança de dados
      notifyListeners(updatedData);
      
      // Sincronizar processadores se a categoria for processor
      if (categoryId === 'processor') {
        await syncProcessorUpdatesFromPriceTable();
        console.log("Sincronização de processador concluída após adicionar item");
      }
      
      toast.success("Item adicionado com sucesso!");
      
      setOpenAddItem(false);
    } catch (error) {
      console.error("Erro ao adicionar item:", error);
      toast.error("Erro ao adicionar item");
    } finally {
      setIsSubmittingItem(false);
    }
  };

  const handleEditItem = async (categoryId: string, updatedItem: Partial<PriceItem>) => {
    if (!itemToEdit) return;
    
    setIsSubmittingItem(true);
    try {
      // Criar um item atualizado combinando o item original com as alterações
      const item = updateItem(itemToEdit, updatedItem);
      
      await PriceService.updateItem(categoryId, item.id, item);
      
      // Atualizar o estado local após o item ser atualizado
      const updatedData = await PriceService.getAllData();
      setPriceData(updatedData);
      
      // Notificar os ouvintes sobre a mudança de dados
      notifyListeners(updatedData);
      
      // Sincronizar processadores se a categoria for processor
      if (categoryId === 'processor') {
        await syncProcessorUpdatesFromPriceTable();
        console.log("Sincronização de processador concluída após editar item");
      }
      
      toast.success("Item atualizado com sucesso!");
      
      setItemToEdit(null);
      setOpenEditItem(false);
    } catch (error) {
      console.error("Erro ao atualizar item:", error);
      toast.error("Erro ao atualizar item");
    } finally {
      setIsSubmittingItem(false);
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!activeTab) return;
    
    try {
      await PriceService.deleteItem(activeTab, itemId);
      
      // Atualizar o estado local após o item ser excluído
      const updatedData = await PriceService.getAllData();
      setPriceData(updatedData);
      
      // Notificar os ouvintes sobre a mudança de dados
      notifyListeners(updatedData);
      
      // Sincronizar processadores se a categoria for processor
      if (activeTab === 'processor') {
        await syncProcessorUpdatesFromPriceTable();
        console.log("Sincronização de processador concluída após excluir item");
      }
      
      toast.success("Item excluído com sucesso!");
    } catch (error) {
      console.error("Erro ao excluir item:", error);
      toast.error("Erro ao excluir item");
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
