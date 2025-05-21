
import { useItemAdd } from "./item-actions/useItemAdd";
import { useItemEdit } from "./item-actions/useItemEdit";
import { useItemDelete } from "./item-actions/useItemDelete";
import { PriceItem } from "@/types/pricing";
import { syncProcessorData } from "@/services/component-sync";

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

  // Check if the updated category needs special synchronization
  const handleProcessorCategorySync = async (categoryId: string) => {
    if (categoryId === 'processor') {
      console.log("[useItemActions] Processor category updated, triggering sync");
      await syncProcessorData();
    }
  };

  // Wrap the original handlers to add processor synchronization
  const handleAddItemWithSync = async (item: Omit<PriceItem, 'id'>) => {
    const result = await handleAddItem(item);
    await handleProcessorCategorySync(activeTab);
    return result;
  };

  const handleEditItemWithSync = async (item: PriceItem) => {
    const result = await handleEditItem(item);
    await handleProcessorCategorySync(activeTab);
    return result;
  };

  const handleDeleteItemWithSync = async (itemId: string) => {
    const result = await handleDeleteItem(itemId);
    await handleProcessorCategorySync(activeTab);
    return result;
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
    handleAddItem: handleAddItemWithSync,
    handleEditItem: handleEditItemWithSync,
    handleDeleteItem: handleDeleteItemWithSync,
  };
}
