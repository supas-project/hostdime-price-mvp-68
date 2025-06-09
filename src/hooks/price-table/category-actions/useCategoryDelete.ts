
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
        console.warn(`[CategoryDelete] Categoria ${categoryId} não encontrada, considerando como sucesso`);
        toast.success("Categoria não encontrada", {
          description: "A categoria já foi removida ou não existe."
        });
        return true;
      }
      
      const categoryName = category?.name || categoryId;
      const itemCount = category.items?.length || 0;
      console.log(`[CategoryDelete] Excluindo categoria "${categoryName}" (${categoryId}) com ${itemCount} itens`);
      
      // Execute category deletion with improved error handling
      console.log(`[CategoryDelete] Chamando PriceService.deleteCategory para ${categoryId}`);
      const deleteSuccess = await PriceService.deleteCategory(categoryId);
      
      if (!deleteSuccess) {
        console.error(`[CategoryDelete] PriceService.deleteCategory retornou false para ${categoryId}`);
        toast.error("Falha na exclusão", {
          description: "A operação de exclusão falhou no servidor. Tente novamente."
        });
        return false;
      }
      
      console.log(`[CategoryDelete] PriceService.deleteCategory retornou true para ${categoryId}`);
      
      // Force refresh data multiple times to ensure we get the latest state
      let freshData = null;
      let attempts = 0;
      const maxAttempts = 5;
      
      while (attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 200 * (attempts + 1))); // Progressive delay
        freshData = await PriceService.getAllData();
        
        if (!freshData[categoryId]) {
          console.log(`[CategoryDelete] Verificação bem-sucedida na tentativa ${attempts + 1}`);
          break;
        }
        
        attempts++;
        console.warn(`[CategoryDelete] Tentativa ${attempts}: categoria ${categoryId} ainda existe`);
      }
      
      if (!freshData) {
        console.error(`[CategoryDelete] Falha ao obter dados frescos após exclusão`);
        toast.error("Erro de sincronização", {
          description: "Não foi possível verificar a exclusão. Atualize a página."
        });
        return false;
      }
      
      // Final verification
      if (freshData[categoryId]) {
        console.error(`[CategoryDelete] ERRO CRÍTICO: Categoria ${categoryId} ainda existe após ${maxAttempts} tentativas!`);
        toast.error("Erro de sincronização", {
          description: "A categoria não foi completamente removida. Atualize a página e tente novamente."
        });
        return false;
      }
      
      console.log(`[CategoryDelete] Dados atualizados após exclusão:`, Object.keys(freshData).join(", "));
      
      // Update local state immediately with verified fresh data
      setPriceData(freshData);
      console.log(`[CategoryDelete] Estado local atualizado - categoria ${categoryId} removida`);
      
      // Register change for notification
      try {
        await registerAdminChange("delete_category", `Categoria "${categoryName}" excluída`);
      } catch (notifyError) {
        console.warn("[CategoryDelete] Falha ao registrar notificação:", notifyError);
        // Don't fail the operation for this
      }
      
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
