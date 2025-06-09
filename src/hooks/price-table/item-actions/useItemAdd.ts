
import { useState } from "react";
import { PriceService } from "@/services/price-service";
import { useDataSync } from "@/hooks/useDataSync";
import { useAuth } from "@/hooks/auth";
import { toast } from "@/utils/toast-utils";

export function useItemAdd(setPriceData: (data: any) => void, activeTab: string) {
  const [openAddItem, setOpenAddItem] = useState(false);
  const { registerAdminChange, isAdminAccess } = useDataSync();
  const { isAuthenticated } = useAuth();
  
  const handleAddItem = async (values: any) => {
    if (!isAuthenticated) {
      toast.error("Você precisa estar autenticado", {
        description: "Faça login para adicionar itens."
      });
      return null;
    }
    
    if (!isAdminAccess) {
      toast.error("Permissão negada", {
        description: "Apenas administradores podem adicionar itens."
      });
      return null;
    }
    
    try {
      // Only pass the allowed properties to addItem - include type field
      const itemData = {
        name: values.name,
        description: values.description,
        price: values.price,
        specs: values.specs,
        tags: values.tags,
        type: values.type || activeTab, // Add type field, default to activeTab
        isHardware: values.isHardware,
        id: values.id || undefined
      };
      
      const newItem = await PriceService.addItem(activeTab, itemData);
      
      // Get the updated data after adding an item
      const updatedData = await PriceService.getAllData();
      setPriceData(updatedData);
      
      setOpenAddItem(false);
      
      // Register change for notification
      await registerAdminChange("add_item", `Item "${newItem.name}" adicionado em ${activeTab}`);
      
      toast.success("Item adicionado", {
        description: `O item ${newItem.name} foi adicionado com sucesso em ${activeTab}.`
      });
      
      return newItem.id;
    } catch (error) {
      toast.error("Erro ao adicionar item", {
        description: error instanceof Error ? error.message : "Ocorreu um erro inesperado."
      });
      return null;
    }
  };

  return {
    openAddItem,
    setOpenAddItem,
    handleAddItem
  };
}
