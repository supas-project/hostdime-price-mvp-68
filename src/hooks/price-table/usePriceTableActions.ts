
import { useCategoryActions } from "./useCategoryActions";
import { useItemActions } from "./useItemActions";
import { useDataActions } from "./useDataActions";
import { usePayBackActions } from "./usePayBackActions";
import { notifyListeners } from "../../services/price/listeners";

export function usePriceTableActions(
  activeTab: string, 
  setPriceData: (data: any) => void
) {
  // Use the specialized hooks
  const categoryActions = useCategoryActions(setPriceData);
  const itemActions = useItemActions(activeTab, setPriceData);
  const dataActions = useDataActions(setPriceData);
  const payBackActions = usePayBackActions(setPriceData);

  // Envolver as funções para notificar listeners quando há mudanças
  const handleAddCategory = async (...args: Parameters<typeof categoryActions.handleAddCategory>) => {
    const result = await categoryActions.handleAddCategory(...args);
    notifyListeners();
    return result;
  };

  const handleAddItem = async (...args: Parameters<typeof itemActions.handleAddItem>) => {
    const result = await itemActions.handleAddItem(...args);
    notifyListeners();
    return result;
  };

  const handleEditItem = async (...args: Parameters<typeof itemActions.handleEditItem>) => {
    const result = await itemActions.handleEditItem(...args);
    notifyListeners();
    return result;
  };

  const handleDeleteCategory = async (...args: Parameters<typeof categoryActions.handleDeleteCategory>) => {
    const result = await categoryActions.handleDeleteCategory(...args);
    notifyListeners();
    return result;
  };

  const handleDeleteItem = async (...args: Parameters<typeof itemActions.handleDeleteItem>) => {
    const result = await itemActions.handleDeleteItem(...args);
    notifyListeners();
    return result;
  };
  
  // Return combined actions from all hooks
  return {
    // Category actions
    openAddCategory: categoryActions.openAddCategory,
    setOpenAddCategory: categoryActions.setOpenAddCategory,
    handleAddCategory,
    handleDeleteCategory,
    
    // Item actions
    openAddItem: itemActions.openAddItem,
    setOpenAddItem: itemActions.setOpenAddItem,
    openEditItem: itemActions.openEditItem,
    setOpenEditItem: itemActions.setOpenEditItem,
    itemToEdit: itemActions.itemToEdit,
    setItemToEdit: itemActions.setItemToEdit,
    isSubmittingItem: itemActions.isSubmittingItem,
    handleInitiateEdit: itemActions.handleInitiateEdit,
    handleAddItem,
    handleEditItem,
    handleDeleteItem,
    
    // Data actions
    handleExportData: dataActions.handleExportData,
    handleResetData: dataActions.handleResetData,
    
    // PayBack actions
    selectedContract: payBackActions.selectedContract,
    setSelectedContract: payBackActions.setSelectedContract,
    applyPayBackDiscount: payBackActions.applyPayBackDiscount,
  };
}
