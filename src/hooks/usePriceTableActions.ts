
import { useState } from "react";
import { PriceCategory, PriceItem } from "@/types/pricing";
import { PriceService } from "@/services/price-service";
import { useToast } from "@/hooks/use-toast";

export function usePriceTableActions(
  activeTab: string, 
  setPriceData: (data: any) => void
) {
  const [isSubmittingItem, setIsSubmittingItem] = useState(false);
  const [openAddItem, setOpenAddItem] = useState(false);
  const [openEditItem, setOpenEditItem] = useState(false);
  const [itemToEdit, setItemToEdit] = useState<PriceItem | undefined>(undefined);
  const [openAddCategory, setOpenAddCategory] = useState(false);
  const { toast } = useToast();

  const handleAddCategory = (values: any) => {
    try {
      const newCategory = PriceService.addCategory({
        name: values.name,
        items: []
      });
      
      setPriceData(prev => ({
        ...prev,
        [newCategory.id]: newCategory
      }));
      
      setOpenAddCategory(false);
      
      toast({
        title: "Categoria adicionada",
        description: `A categoria ${newCategory.name} foi adicionada com sucesso.`
      });
      
      return newCategory.id;
    } catch (error) {
      toast({
        title: "Erro ao adicionar categoria",
        description: error instanceof Error ? error.message : "Ocorreu um erro inesperado.",
        variant: "destructive"
      });
      return null;
    }
  };

  const handleAddItem = async (values: any) => {
    // Evitar submissões múltiplas
    if (isSubmittingItem) return;
    
    if (!activeTab) {
      toast({
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
        metadata: {}
      };
      
      // Adiciona o item ao serviço
      PriceService.addItem(activeTab, itemData);
      
      // Recarrega todos os dados para garantir consistência
      const updatedData = PriceService.getAllData();
      setPriceData(updatedData);
      
      // Fecha o modal
      setOpenAddItem(false);
      
      toast({
        title: "Item adicionado",
        description: `O item ${values.name} foi adicionado com sucesso.`
      });
    } catch (error) {
      toast({
        title: "Erro ao adicionar item",
        description: error instanceof Error ? error.message : "Ocorreu um erro inesperado.",
        variant: "destructive"
      });
    } finally {
      // Reseta o estado após um período
      setTimeout(() => {
        setIsSubmittingItem(false);
      }, 500);
    }
  };

  const handleInitiateEdit = (item: PriceItem) => {
    setItemToEdit(item);
    setOpenEditItem(true);
  };

  const handleEditItem = (values: any, itemId?: string) => {
    if (!activeTab || !itemId) {
      toast({
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
      };
      
      // Atualiza o item usando o método existente
      const updatedItem = PriceService.updateItem(activeTab, itemId, updatedItemData);
      
      // Atualiza o estado local para feedback imediato
      setPriceData(prev => ({
        ...prev,
        [activeTab]: {
          ...prev[activeTab],
          items: prev[activeTab].items.map(item => 
            item.id === itemId ? updatedItem : item
          )
        }
      }));
      
      // Fecha o diálogo de edição
      setOpenEditItem(false);
      setItemToEdit(undefined);
      
      toast({
        title: "Item atualizado",
        description: `O item ${values.name} foi atualizado com sucesso.`
      });
    } catch (error) {
      toast({
        title: "Erro ao editar item",
        description: error instanceof Error ? error.message : "Ocorreu um erro inesperado.",
        variant: "destructive"
      });
    }
  };

  const handleDeleteCategory = (categoryId: string) => {
    try {
      PriceService.deleteCategory(categoryId);
      
      setPriceData(prev => {
        const updatedData = { ...prev };
        delete updatedData[categoryId];
        return updatedData;
      });
      
      toast({
        title: "Categoria excluída",
        description: "A categoria foi excluída com sucesso."
      });
      
      return true;
    } catch (error) {
      toast({
        title: "Erro ao excluir categoria",
        description: error instanceof Error ? error.message : "Ocorreu um erro inesperado.",
        variant: "destructive"
      });
      return false;
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
      
      toast({
        title: "Item excluído",
        description: "O item foi excluído com sucesso."
      });
      
      return true;
    } catch (error) {
      toast({
        title: "Erro ao excluir item",
        description: error instanceof Error ? error.message : "Ocorreu um erro inesperado.",
        variant: "destructive"
      });
      return false;
    }
  };

  const handleExportData = () => {
    try {
      const data = PriceService.getAllData();
      const jsonString = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = 'price-table-export.json';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "Dados exportados",
        description: "Os dados foram exportados com sucesso."
      });
      return true;
    } catch (error) {
      toast({
        title: "Erro ao exportar dados",
        description: "Não foi possível exportar os dados.",
        variant: "destructive"
      });
      return false;
    }
  };

  const handleResetData = () => {
    const data = PriceService.resetData();
    setPriceData(data);
    
    toast({
      title: "Dados resetados",
      description: "A tabela de preços foi restaurada para o estado inicial."
    });
    return true;
  };

  return {
    openAddCategory,
    setOpenAddCategory,
    openAddItem,
    setOpenAddItem,
    openEditItem,
    setOpenEditItem,
    itemToEdit,
    setItemToEdit,
    isSubmittingItem,
    handleAddCategory,
    handleAddItem,
    handleInitiateEdit,
    handleEditItem,
    handleDeleteCategory,
    handleDeleteItem,
    handleExportData,
    handleResetData,
  };
}
