
import { useCategoryAdd } from "./category-actions";
import { useCategoryDelete } from "./category-actions";
import { useToast } from "@/hooks/use-toast";

/**
 * Hook that composes all category-related actions
 */
export function useCategoryActions(setPriceData: (data: any) => void) {
  const { toast: uiToast } = useToast();
  
  // Use the specialized hooks
  const { 
    openAddCategory, 
    setOpenAddCategory, 
    handleAddCategory 
  } = useCategoryAdd(setPriceData);
  
  const { 
    isDeleting,
    handleDeleteCategory 
  } = useCategoryDelete(setPriceData);

  // Return combined actions from all hooks
  return {
    openAddCategory,
    setOpenAddCategory,
    handleAddCategory,
    handleDeleteCategory, // This function returns Promise<boolean>
    isDeleting
  };
}
