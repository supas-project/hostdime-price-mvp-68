
import { useItemAdd } from "./item-actions/useItemAdd";
import { useItemEdit } from "./item-actions/useItemEdit";
import { useItemDelete } from "./item-actions/useItemDelete";
import { useItemBulkImport } from "./item-actions/useItemBulkImport";
import { PriceItem } from "@/types/pricing";
import { syncProcessorData, syncMemoryData } from "@/services/component-sync";

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
    handleAddItem
  } = useItemAdd(setPriceData, activeTab);
  
  const { 
    isEditing,
    openEditItem, 
    setOpenEditItem, 
    itemToEdit, 
    setItemToEdit, 
    handleInitiateEdit, 
    handleEditItem
  } = useItemEdit(setPriceData);
  
  const { handleDeleteItem } = useItemDelete(setPriceData);
  
  const {
    openBulkImport,
    setOpenBulkImport,
    isImporting,
    handleBulkImport
  } = useItemBulkImport(setPriceData);

  // Combine isSubmitting states
  const isSubmittingItem = isEditing || isImporting;

  // Check if the updated category needs special synchronization
  const handleCategorySync = async (categoryId: string) => {
    if (categoryId === 'processor' || categoryId === 'processador') {
      console.log("[useItemActions] Processor category updated, triggering sync");
      await syncProcessorData();
    } 
    else if (categoryId === 'memory' || categoryId === 'memória') {
      console.log("[useItemActions] Memory category updated, triggering sync");
      await syncMemoryData();
    }
  };

  // Wrap the original handlers to add category synchronization
  const handleAddItemWithSync = async (item: Omit<PriceItem, 'id'>) => {
    const result = await handleAddItem(item);
    await handleCategorySync(activeTab);
    return result;
  };

  const handleEditItemWithSync = async (values: any, itemId?: string) => {
    const result = await handleEditItem(activeTab, itemId || itemToEdit?.id, values);
    await handleCategorySync(activeTab);
    return result;
  };

  const handleDeleteItemWithSync = async (itemId: string) => {
    const result = await handleDeleteItem(activeTab, itemId);
    await handleCategorySync(activeTab);
    return result;
  };
  
  const handleBulkImportWithSync = async (items: PriceItem[]) => {
    const result = await handleBulkImport(items);
    await handleCategorySync(activeTab);
    return result;
  };

  return {
    openAddItem,
    setOpenAddItem,
    openEditItem,
    setOpenEditItem,
    openBulkImport,
    setOpenBulkImport,
    itemToEdit,
    setItemToEdit,
    isSubmittingItem,
    handleInitiateEdit,
    handleAddItem: handleAddItemWithSync,
    handleEditItem: handleEditItemWithSync,
    handleDeleteItem: handleDeleteItemWithSync,
    handleBulkImport: handleBulkImportWithSync,
  };
}
