
import { useState } from "react";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Table, TableBody, TableCaption } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible";
import { CategoryTabs } from "@/components/price-table/CategoryTabs";
import { TableContent } from "@/components/price-table/TableContent";
import { PriceTableHeader } from "@/components/price-table/TableHeader";
import { CategoryHeader } from "@/components/price-table/CategoryHeader";
import { PriceData, PriceCategory, PriceItem } from "@/types/pricing";
import { Skeleton } from "@/components/ui/skeleton";

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
  onDeleteCategory: (categoryId: string) => void;
  onDeleteItem: (itemId: string) => void;
  onEditItem: (item: PriceItem) => void;
  contractDuration?: string; // Added contractDuration as an optional prop
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
  
  if (Object.keys(priceData).length === 0) {
    return (
      <div className="p-8 text-center animate-fade-in">
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

  return (
    <Tabs defaultValue={activeTab} value={activeTab} onValueChange={setActiveTab}>
      <CategoryTabs
        categories={Object.values(priceData)}
        isAdmin={isAdmin}
        onDeleteCategory={onDeleteCategory}
      />

      <div className="mt-6 space-y-5 animate-fade-in">
        {Object.values(priceData).map((category) => {
          const filteredItems = filterItems(category.items);
          const isCollapsed = collapsedCategories[category.id] || false;
          
          return (
            <TabsContent key={category.id} value={category.id} className="space-y-5">
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
                    <div className="p-5">
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
