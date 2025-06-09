
import { Tabs } from "@/components/ui/tabs";
import { CategoryTabs } from "@/components/price-table/CategoryTabs";
import { ProductComparison } from "@/components/price-table/ProductComparison";
import { EmptyState } from "@/components/price-table/EmptyState";
import { DataProcessor } from "@/components/price-table/DataProcessor";
import { CategoryTabContent } from "@/components/price-table/CategoryTabContent";
import { useProductComparison } from "@/hooks/use-product-comparison";
import { useCategoryManagement } from "@/hooks/price-table/useCategoryManagement";
import { PriceData, PriceCategory, PriceItem } from "@/types/pricing";
import { useEffect } from "react";

interface PriceTableContentProps {
  priceData: PriceData;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isAdmin: boolean;
  searchTerm: string;
  sortOrder: "asc" | "desc" | null;
  displayMode: "table" | "card";
  collapsedCategories: Record<string, boolean>;
  toggleCategoryCollapse: (categoryId: string) => void;
  filterItems: (items: PriceItem[], searchTerm: string, sortOrder?: 'asc' | 'desc' | null) => PriceItem[];
  onDeleteCategory: (categoryId: string) => Promise<boolean>;
  onDeleteItem: (itemId: string) => void;
  onEditItem: (item: PriceItem) => void;
  contractDuration?: string;
  isComparisonMode?: boolean;
  onToggleComparison?: () => void;
}

export function PriceTableContent({
  priceData,
  activeTab,
  setActiveTab,
  isAdmin,
  searchTerm,
  sortOrder,
  displayMode,
  collapsedCategories,
  toggleCategoryCollapse,
  filterItems,
  onDeleteCategory,
  onDeleteItem,
  onEditItem,
  contractDuration,
  isComparisonMode = false,
  onToggleComparison
}: PriceTableContentProps) {
  
  const {
    comparisonItems,
    isComparisonMode: internalComparisonMode,
    addToComparison,
    removeFromComparison,
    clearComparison,
    toggleComparisonMode,
    isItemInComparison,
    canAddMore
  } = useProductComparison();

  const { handleDeleteCategory } = useCategoryManagement(priceData, activeTab, setActiveTab);

  // Use external comparison mode if provided, otherwise use internal
  const currentComparisonMode = isComparisonMode !== undefined ? isComparisonMode : internalComparisonMode;
  const currentToggleComparison = onToggleComparison || toggleComparisonMode;
  
  useEffect(() => {
    console.log("PriceTableContent: Received price data:", priceData ? Object.keys(priceData).length : 0, "categories");
    console.log("PriceTableContent: Search term:", searchTerm);
    console.log("PriceTableContent: Sort order:", sortOrder);
  }, [priceData, searchTerm, sortOrder]);
  
  if (!priceData || typeof priceData !== 'object' || Object.keys(priceData).length === 0) {
    console.warn("PriceTableContent: Received invalid or empty priceData");
    return <EmptyState isAdmin={isAdmin} />;
  }

  const wrappedDeleteCategory = async (categoryId: string) => {
    console.log(`[PriceTableContent] Iniciando exclusão da categoria ${categoryId}`);
    
    const result = await handleDeleteCategory(categoryId, onDeleteCategory);
    
    if (result) {
      console.log(`[PriceTableContent] Categoria ${categoryId} excluída com sucesso`);
      
      // Force immediate UI update by checking current categories
      const currentCategories = Object.keys(priceData);
      console.log(`[PriceTableContent] Categorias atuais antes da atualização:`, currentCategories.join(", "));
      
      // If we deleted the active category, switch to another one or clear
      if (categoryId === activeTab) {
        const remainingCategories = currentCategories.filter(id => id !== categoryId);
        if (remainingCategories.length > 0) {
          console.log(`[PriceTableContent] Alterando aba ativa para ${remainingCategories[0]}`);
          setActiveTab(remainingCategories[0]);
        } else {
          console.log(`[PriceTableContent] Nenhuma categoria restante, limpando aba ativa`);
          setActiveTab("");
        }
      }
    } else {
      console.error(`[PriceTableContent] Falha ao excluir categoria ${categoryId}`);
    }
    
    return result;
  };

  return (
    <DataProcessor priceData={priceData}>
      {(processedPriceData) => {
        // Filter out deleted categories from processed data
        const availableCategories = Object.values(processedPriceData);
        console.log(`[PriceTableContent] Categorias disponíveis para renderização:`, 
          availableCategories.map(cat => cat.id).join(", "));
        
        return (
          <div className="space-y-4">
            {/* Product Comparison Section */}
            {currentComparisonMode && (
              <div className="animate-fade-in">
                <ProductComparison
                  items={comparisonItems}
                  onRemoveItem={removeFromComparison}
                  onClear={clearComparison}
                  onClose={currentToggleComparison}
                />
              </div>
            )}

            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <CategoryTabs
                categories={availableCategories}
                isAdmin={isAdmin}
                onDeleteCategory={wrappedDeleteCategory}
              />

              <div className="mt-4 space-y-3 animate-fade-in">
                {availableCategories.map((category) => {
                  if (!Array.isArray(category.items)) {
                    console.warn(`PriceTableContent: Category ${category.id} items is not an array:`, category.items);
                    category.items = [];
                  }
                  
                  const filteredItems = filterItems(category.items, searchTerm, sortOrder);
                  const isCollapsed = collapsedCategories[category.id] || false;
                  
                  return (
                    <CategoryTabContent
                      key={category.id}
                      category={category}
                      filteredItems={filteredItems}
                      isCollapsed={isCollapsed}
                      onToggleCollapse={() => toggleCategoryCollapse(category.id)}
                      displayMode={displayMode}
                      sortOrder={sortOrder}
                      contractDuration={contractDuration}
                      isComparisonMode={currentComparisonMode}
                      onAddToComparison={addToComparison}
                      isItemInComparison={isItemInComparison}
                      canAddMoreToComparison={canAddMore}
                      searchTerm={searchTerm}
                      isAdmin={isAdmin}
                      onDeleteItem={onDeleteItem}
                      onEditItem={onEditItem}
                    />
                  );
                })}
              </div>
            </Tabs>
          </div>
        );
      }}
    </DataProcessor>
  );
}
