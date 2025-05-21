
import { useItemAdd } from "./item-actions/useItemAdd";
import { useItemEdit } from "./item-actions/useItemEdit";
import { useItemDelete } from "./item-actions/useItemDelete";
import { PriceItem } from "@/types/pricing";

/**
 * Hook that composes all item-related actions
 */
export function useItemActions(
  activeTab: string,
  setPriceData: (data: any) => void
) {
  // Use the specialized hooks
  const { 
    openAddItem, 
    setOpenAddItem, 
    handleAddItem,
    isSubmittingItem: isSubmittingAdd 
  } = useItemAdd(activeTab, setPriceData);
  
  const { 
    openEditItem, 
    setOpenEditItem, 
    itemToEdit, 
    setItemToEdit, 
    handleInitiateEdit, 
    handleEditItem,
    isSubmittingItem: isSubmittingEdit 
  } = useItemEdit(activeTab, setPriceData);
  
  const { handleDeleteItem } = useItemDelete(activeTab, setPriceData);

  // Combine isSubmitting states
  const isSubmittingItem = isSubmittingAdd || isSubmittingEdit;

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
