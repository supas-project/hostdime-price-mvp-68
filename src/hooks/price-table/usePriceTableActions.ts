
import { useCategoryActions } from "./useCategoryActions";
import { useItemActions } from "./useItemActions";
import { useDataActions } from "./useDataActions";

export function usePriceTableActions(
  activeTab: string, 
  setPriceData: (data: any) => void
) {
  // Use the specialized hooks
  const categoryActions = useCategoryActions(setPriceData);
  const itemActions = useItemActions(activeTab, setPriceData);
  const dataActions = useDataActions(setPriceData);
  
  // Return combined actions from all hooks
  return {
    // Category actions
    openAddCategory: categoryActions.openAddCategory,
    setOpenAddCategory: categoryActions.setOpenAddCategory,
    handleAddCategory: categoryActions.handleAddCategory,
    handleDeleteCategory: categoryActions.handleDeleteCategory,
    
    // Item actions
    openAddItem: itemActions.openAddItem,
    setOpenAddItem: itemActions.setOpenAddItem,
    openEditItem: itemActions.openEditItem,
    setOpenEditItem: itemActions.setOpenEditItem,
    itemToEdit: itemActions.itemToEdit,
    setItemToEdit: itemActions.setItemToEdit,
    isSubmittingItem: itemActions.isSubmittingItem,
    handleInitiateEdit: itemActions.handleInitiateEdit,
    handleAddItem: itemActions.handleAddItem,
    handleEditItem: itemActions.handleEditItem,
    handleDeleteItem: itemActions.handleDeleteItem,
    
    // Data actions
    handleExportData: dataActions.handleExportData,
    handleResetData: dataActions.handleResetData,
  };
}
