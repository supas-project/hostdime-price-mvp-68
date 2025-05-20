
import { useState } from "react";
import { PriceService } from "@/services/price-service";
import { useDataSync } from "@/hooks/useDataSync";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/utils/toast-utils";
import { v4 as uuidv4 } from "uuid";

export function useItemAdd(activeTab: string, setPriceData: (data: any) => void) {
  const [openAddItem, setOpenAddItem] = useState(false);
  const [isSubmittingItem, setIsSubmittingItem] = useState(false);
  const { registerAdminChange, isAdminAccess } = useDataSync();
  const { isAuthenticated } = useAuth();
  
  const handleAddItem = async (values: any) => {
    if (!isAuthenticated) {
      toast.error("Você precisa estar autenticado", {
        description: "Faça login para adicionar itens."
      });
      return;
    }
    
    if (!isAdminAccess && activeTab !== 'disk' && activeTab !== 'discos_internos' && activeTab !== 'external_storage') {
      toast.error("Permissão negada", {
        description: "Apenas administradores podem adicionar itens a esta categoria."
      });
      return;
    }
    
    if (!activeTab) {
      toast.error("Nenhuma categoria selecionada", {
        description: "Selecione uma categoria para adicionar o item."
      });
      return;
    }
    
    try {
      setIsSubmittingItem(true);
      
      // Create metadata object for additional properties
      const metadata: Record<string, any> = {};
      
      // Add disk-specific metadata if present
      if (values.capacity) {
        metadata.capacity = values.capacity;
      }
      if (values.readSpeed) {
        metadata.readSpeed = values.readSpeed;
      }
      if (values.writeSpeed) {
        metadata.writeSpeed = values.writeSpeed;
      }
      if (values.iops) {
        metadata.iops = values.iops;
      }
      if (values.throughput) {
        metadata.throughput = values.throughput;
      }
      if (values.recommended) {
        metadata.recommended = values.recommended;
      }
      
      // Generate a UUID for the new item if not provided
      const itemData = {
        id: uuidv4(), // Add this required field
        name: values.name,
        description: values.description,
        price: values.price,
        type: values.type,
        subtype: values.subtype,
        specs: values.specs || [],
        tags: values.tags || [],
        isHardware: values.isHardware || false,
        capacity: values.capacity, // Add directly to the item as well
        metadata: metadata
      };
      
      const newItem = await PriceService.addItem(activeTab, itemData);
      
      // Ensure data is saved to the database
      const updatedData = await PriceService.getAllData();
      setPriceData(updatedData);
      
      setOpenAddItem(false);
      
      // Register change for notification
      await registerAdminChange(
        "add_item",
        `Item "${newItem.name}" adicionado à categoria "${activeTab}"`
      );
      
      toast.success("Item adicionado", {
        description: `O item ${newItem.name} foi adicionado com sucesso.`
      });
    } catch (error) {
      toast.error("Erro ao adicionar item", {
        description: error instanceof Error ? error.message : "Ocorreu um erro inesperado."
      });
    } finally {
      setIsSubmittingItem(false);
    }
  };

  return {
    openAddItem,
    setOpenAddItem,
    isSubmittingItem,
    handleAddItem
  };
}
