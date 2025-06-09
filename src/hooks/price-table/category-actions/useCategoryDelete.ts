
import { useState } from "react";
import { PriceService } from "@/services/price-service";
import { useDataSync } from "@/hooks/useDataSync";
import { useAuth } from "@/contexts/auth/UnifiedAuthContext";
import { toast } from "@/utils/toast-utils";

export function useCategoryDelete(setPriceData: (data: any) => void) {
  const [isDeleting, setIsDeleting] = useState(false);
  const { registerAdminChange, isAdminAccess } = useDataSync();
  const { isAuthenticated } = useAuth();
  
  const handleDeleteCategory = async (categoryId: string): Promise<boolean> => {
    if (!isAuthenticated) {
      toast.error("Você precisa estar autenticado", {
        description: "Faça login para excluir categorias."
      });
      return false;
    }
    
    if (!isAdminAccess) {
      toast.error("Permissão negada", {
        description: "Apenas administradores podem excluir categorias."
      });
      return false;
    }
    
    try {
      setIsDeleting(true);
      console.log(`[CategoryDelete] Iniciando exclusão da categoria ${categoryId}`);
      
      // Get current data before deletion
      const beforeData = await PriceService.getAllData();
      const category = beforeData[categoryId];
      
      if (!category) {
        console.warn(`[CategoryDelete] Categoria ${categoryId} não encontrada`);
        toast.error("Categoria não encontrada", {
          description: "A categoria não existe ou já foi removida."
        });
        return false;
      }
      
      const categoryName = category?.name || categoryId;
      const itemCount = category.items?.length || 0;
      console.log(`[CategoryDelete] Excluindo categoria "${categoryName}" (${categoryId}) com ${itemCount} itens`);
      
      // Execute category deletion
      const deleteSuccess = await PriceService.deleteCategory(categoryId);
      
      if (!deleteSuccess) {
        console.error(`[CategoryDelete] PriceService.deleteCategory retornou false para ${categoryId}`);
        toast.error("Falha na exclusão", {
          description: "A operação de exclusão falhou no servidor. Verifique os logs para mais detalhes."
        });
        return false;
      }
      
      console.log(`[CategoryDelete] PriceService.deleteCategory retornou true para ${categoryId}`);
      
      // Force refresh data to ensure UI is in sync
      const freshData = await PriceService.getAllData();
      console.log(`[CategoryDelete] Dados atualizados:`, Object.keys(freshData).join(", "));
      
      // Double-check category was actually deleted
      if (freshData[categoryId]) {
        console.error(`[CategoryDelete] ERRO CRÍTICO: Categoria ${categoryId} ainda existe nos dados frescos!`);
        toast.error("Erro de sincronização", {
          description: "A categoria não foi completamente removida. Tente atualizar a página."
        });
        return false;
      }
      
      // Update local state immediately
      setPriceData(freshData);
      console.log(`[CategoryDelete] Estado local atualizado - categoria ${categoryId} removida`);
      
      // Register change for notification
      await registerAdminChange("delete_category", `Categoria "${categoryName}" excluída`);
      
      toast.success("Categoria excluída", {
        description: `A categoria "${categoryName}" foi excluída com sucesso.`
      });
      
      return true;
    } catch (error) {
      console.error("[CategoryDelete] Erro inesperado:", error);
      toast.error("Erro inesperado", {
        description: error instanceof Error ? error.message : "Erro desconhecido ao excluir categoria."
      });
      return false;
    } finally {
      setIsDeleting(false);
    }
  };

  return {
    isDeleting,
    handleDeleteCategory
  };
}
