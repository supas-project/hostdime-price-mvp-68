import { useState } from "react";
import { systemComponentsService } from "@/services/systemComponentsService";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { parseBRLToFloat } from "@/utils/number-formatter";

export function useItemAdd(
  activeTab: string,
  setPriceData: (data: any) => void
) {
  const [isSubmittingItem, setIsSubmittingItem] = useState(false);
  const [openAddItem, setOpenAddItem] = useState(false);
  const { isAuthenticated, isAdmin } = useAuth();
  const queryClient = useQueryClient();

  const handleAddItem = async (values: any) => {
    // Check authentication
    if (!isAuthenticated) {
      toast.error("Você precisa estar autenticado", {
        description: "Faça login para adicionar itens."
      });
      return;
    }
    
    // Check admin permission
    if (!isAdmin) {
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
        component_type: activeTab,
        component_id: `${activeTab}_${Date.now()}`,
        name: values.name,
        description: values.description,
        price: price,
        subtype: values.subtype,
        is_hardware: Array.isArray(values.tags) ? values.tags.includes("Hardware") : false,
        is_active: true,
        specs: Array.isArray(values.specs) ? values.specs : [],
        metadata: {
          tags: Array.isArray(values.tags) ? values.tags : [],
          ...values.metadata
        }
      };
      
      // Add item using systemComponentsService
      const newComponent = await systemComponentsService.addComponent(itemData);
      
      // Invalidate and refetch system components query
      await queryClient.invalidateQueries({ queryKey: ['systemComponents'] });
      
      // Also invalidate component-specific queries
      await queryClient.invalidateQueries({ queryKey: ['componentOptions', activeTab] });
      
      // Reload data for local state consistency
      try {
        const updatedComponents = await systemComponentsService.getAllComponents();
        // Group components by category for setPriceData
        const groupedData: any = {};
        updatedComponents.forEach(component => {
          const category = component.component_type;
          if (!groupedData[category]) {
            groupedData[category] = { items: [] };
          }
          groupedData[category].items.push(component);
        });
        setPriceData(groupedData);
      } catch (error) {
        console.warn("Failed to update local state, but component was added successfully");
      }
      
      // Close modal
      setOpenAddItem(false);
      
      toast.success("Item adicionado", {
        description: `O item "${values.name}" foi adicionado com sucesso à categoria ${activeTab}.`
      });
    } catch (error) {
      console.error("Error adding component:", error);
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
