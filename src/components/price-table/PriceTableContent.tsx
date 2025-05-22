
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Table, TableBody, TableCaption } from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible";
import { CategoryTabs } from "@/components/price-table/CategoryTabs";
import { TableContent } from "@/components/price-table/TableContent";
import { PriceTableHeader } from "@/components/price-table/TableHeader";
import { CategoryHeader } from "@/components/price-table/CategoryHeader";
import { PriceData, PriceCategory, PriceItem } from "@/types/pricing";
import { useEffect, useState } from "react";

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
  filterItems: (items: PriceItem[]) => PriceItem[];
  onDeleteCategory: (categoryId: string) => Promise<boolean>;
  onDeleteItem: (itemId: string) => void;
  onEditItem: (item: PriceItem) => void;
  contractDuration?: string;
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
  contractDuration
}: PriceTableContentProps) {
  
  // Estado para rastrear categorias disponíveis
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);
  
  // Efeito para monitorar mudanças nas categorias disponíveis
  useEffect(() => {
    if (priceData) {
      const categoryIds = Object.keys(priceData);
      setAvailableCategories(categoryIds);
      console.log("[PriceTableContent] Categorias disponíveis atualizadas:", categoryIds.join(", "));
      
      // Se a categoria ativa não existir mais, selecionar a primeira disponível
      if (activeTab && !categoryIds.includes(activeTab) && categoryIds.length > 0) {
        console.log(`[PriceTableContent] Categoria ativa ${activeTab} não existe mais, alterando para ${categoryIds[0]}`);
        setActiveTab(categoryIds[0]);
      }
    }
  }, [priceData, activeTab, setActiveTab]);
  
  // Debug para verificar os dados recebidos
  console.log("PriceTableContent: Received price data:", priceData ? Object.keys(priceData).length : 0, "categories");
  
  // Garantir que priceData é um objeto válido
  if (!priceData || typeof priceData !== 'object' || Object.keys(priceData).length === 0) {
    console.warn("PriceTableContent: Received invalid or empty priceData");
    return (
      <div className="p-6 text-center animate-fade-in">
        <h3 className="text-lg font-medium mb-2">Nenhuma categoria cadastrada</h3>
        <p className="text-muted-foreground mb-4">
          {isAdmin 
            ? "Comece adicionando uma nova categoria ou importe dados existentes."
            : "Entre como administrador para gerenciar a tabela de preços."
          }
        </p>
      </div>
    );
  }
  
  // Validação adicional para verificar cada categoria
  Object.keys(priceData).forEach(key => {
    if (!priceData[key]) {
      console.warn(`PriceTableContent: Category ${key} is undefined`);
      return;
    }
    
    if (!Array.isArray(priceData[key].items)) {
      console.warn(`PriceTableContent: Items is not an array for category ${key}, fixing...`);
      priceData[key].items = priceData[key].items || [];
    }
    
    console.log(`PriceTableContent: Category ${key} has ${priceData[key].items.length} items`);
  });
  
  // Custom function para lidar com a exclusão de categorias
  const handleDeleteCategory = async (categoryId: string) => {
    // Chama a função de exclusão passada por props
    const success = await onDeleteCategory(categoryId);
    
    if (success) {
      console.log(`[PriceTableContent] Categoria ${categoryId} excluída com sucesso`);
      
      // Se a categoria excluída era a ativa, precisamos mudar para outra
      if (categoryId === activeTab) {
        const remainingCategories = availableCategories.filter(id => id !== categoryId);
        if (remainingCategories.length > 0) {
          console.log(`[PriceTableContent] Alterando categoria ativa para ${remainingCategories[0]}`);
          setActiveTab(remainingCategories[0]);
        }
      }
    }
    
    return success;
  };

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab}>
      <CategoryTabs
        categories={Object.values(priceData)}
        isAdmin={isAdmin}
        onDeleteCategory={handleDeleteCategory}
      />

      <div className="mt-4 space-y-3 animate-fade-in">
        {Object.values(priceData).map((category) => {
          // Garantir que category.items seja um array
          if (!Array.isArray(category.items)) {
            console.warn(`PriceTableContent: Category ${category.id} items is not an array:`, category.items);
            category.items = [];
          }
          
          const filteredItems = filterItems(category.items);
          const isCollapsed = collapsedCategories[category.id] || false;
          
          console.log(`PriceTableContent: Rendering category ${category.id} with ${filteredItems.length}/${category.items.length} items`);
          
          return (
            <TabsContent key={category.id} value={category.id} className="space-y-3">
              <Collapsible 
                open={!isCollapsed} 
                className="border border-border rounded-xl overflow-hidden bg-card/50 shadow-sm hover:shadow-md transition-shadow duration-200"
              >
                <CategoryHeader 
                  category={{...category, items: filteredItems}}
                  isCollapsed={isCollapsed}
                  onToggleCollapse={() => toggleCategoryCollapse(category.id)}
                />
                
                <CollapsibleContent className="animate-accordion-down">
                  {displayMode === "card" ? (
                    <div className="p-3">
                      <TableContent 
                        category={{...category, items: filteredItems}} 
                        onDelete={isAdmin ? onDeleteItem : undefined}
                        onEdit={isAdmin ? onEditItem : undefined}
                        displayMode="card"
                        sortOrder={sortOrder}
                        contractDuration={contractDuration}
                      />
                    </div>
                  ) : (
                    <div className="overflow-hidden">
                      <Table>
                        {filteredItems.length === 0 && (
                          <TableCaption>
                            {searchTerm 
                              ? "Nenhum resultado encontrado para a busca" 
                              : "Nenhum item cadastrado nesta categoria"}
                          </TableCaption>
                        )}
                        <PriceTableHeader showActions={isAdmin} />
                        <TableBody className="bg-background/50">
                          <TableContent 
                            category={{...category, items: filteredItems}} 
                            onDelete={isAdmin ? onDeleteItem : undefined}
                            onEdit={isAdmin ? onEditItem : undefined}
                            sortOrder={sortOrder}
                            contractDuration={contractDuration}
                          />
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CollapsibleContent>
              </Collapsible>
            </TabsContent>
          );
        })}
      </div>
    </Tabs>
  );
}
