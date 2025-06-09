
import { TabsContent } from "@/components/ui/tabs";
import { Table, TableBody, TableCaption } from "@/components/ui/table";
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible";
import { PriceTableHeader } from "@/components/price-table/TableHeader";
import { CategoryHeader } from "@/components/price-table/CategoryHeader";
import { TableContent } from "@/components/price-table/TableContent";
import { PriceCategory, PriceItem } from "@/types/pricing";

interface CategoryTabContentProps {
  category: PriceCategory;
  filteredItems: PriceItem[];
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  displayMode: "table" | "card";
  sortOrder: "asc" | "desc" | null;
  contractDuration?: string;
  isComparisonMode: boolean;
  onAddToComparison: (item: PriceItem) => void;
  isItemInComparison: (itemId: string) => boolean;
  canAddMoreToComparison: boolean;
  searchTerm: string;
  isAdmin: boolean;
  onDeleteItem?: (itemId: string) => void;
  onEditItem?: (item: PriceItem) => void;
}

export function CategoryTabContent({
  category,
  filteredItems,
  isCollapsed,
  onToggleCollapse,
  displayMode,
  sortOrder,
  contractDuration,
  isComparisonMode,
  onAddToComparison,
  isItemInComparison,
  canAddMoreToComparison,
  searchTerm,
  isAdmin,
  onDeleteItem,
  onEditItem
}: CategoryTabContentProps) {
  console.log(`CategoryTabContent: Rendering category ${category.id} with ${filteredItems.length}/${category.items.length} items (search: "${searchTerm}", sort: ${sortOrder})`);
  
  return (
    <TabsContent key={category.id} value={category.id} className="space-y-3">
      <Collapsible 
        open={!isCollapsed} 
        className="border border-border rounded-xl overflow-hidden bg-card/50 shadow-sm hover:shadow-md transition-all duration-200"
      >
        <CategoryHeader 
          category={{...category, items: filteredItems}}
          isCollapsed={isCollapsed}
          onToggleCollapse={onToggleCollapse}
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
                isComparisonMode={isComparisonMode}
                onAddToComparison={onAddToComparison}
                isItemInComparison={isItemInComparison}
                canAddMoreToComparison={canAddMoreToComparison}
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
                <PriceTableHeader showActions={isAdmin} showComparison={isComparisonMode} />
                <TableBody className="bg-background/50">
                  <TableContent 
                    category={{...category, items: filteredItems}} 
                    onDelete={isAdmin ? onDeleteItem : undefined}
                    onEdit={isAdmin ? onEditItem : undefined}
                    sortOrder={sortOrder}
                    contractDuration={contractDuration}
                    isComparisonMode={isComparisonMode}
                    onAddToComparison={onAddToComparison}
                    isItemInComparison={isItemInComparison}
                    canAddMoreToComparison={canAddMoreToComparison}
                  />
                </TableBody>
              </Table>
            </div>
          )}
        </CollapsibleContent>
      </Collapsible>
    </TabsContent>
  );
}
