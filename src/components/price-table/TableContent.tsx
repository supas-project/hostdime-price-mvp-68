
import React from 'react';
import { TableRow, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, Star } from "lucide-react";
import { formatCurrency } from "@/utils/number-formatter";
import { PriceCategory, PriceItem } from "@/types/pricing";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface TableContentProps {
  category: PriceCategory;
  onDelete?: (itemId: string) => void;
  onEdit?: (item: PriceItem) => void;
  displayMode?: "table" | "card";
  sortOrder?: "asc" | "desc" | null;
  contractDuration?: string;
}

export function TableContent({
  category,
  onDelete,
  onEdit,
  displayMode = "table",
  sortOrder = null,
  contractDuration = "0"
}: TableContentProps) {
  // Sort items if needed
  let items = [...category.items];
  
  if (sortOrder === "asc") {
    items = items.sort((a, b) => a.price - b.price);
  } else if (sortOrder === "desc") {
    items = items.sort((a, b) => b.price - a.price);
  }
  
  const getDisplayPrice = (item: PriceItem): number => {
    return typeof item.price === 'number' && !isNaN(item.price) 
      ? item.price 
      : 0;
  };

  // Check if item is recommended (could be based on popularity, best value, etc.)
  const isRecommended = (item: PriceItem): boolean => {
    // Simple logic: mark items with "popular" or "recommended" in tags as recommended
    return item.tags?.some(tag => 
      tag.toLowerCase().includes('popular') || 
      tag.toLowerCase().includes('recomendado')
    ) || false;
  };

  console.log(`[TableContent] Category ${category.id} items:`, 
    items.map(item => `${item.name}: ${item.price} (${typeof item.price})`));

  if (displayMode === "card") {
    return (
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((item) => {
          const price = getDisplayPrice(item);
          const recommended = isRecommended(item);
          
          console.log(`[TableContent] Card Item ${item.id} price:`, price);
          
          return (
            <Card key={item.id} className={`border border-border rounded-lg shadow-sm hover:shadow-lg transition-all duration-200 ${recommended ? 'ring-2 ring-orange-500 relative' : ''}`}>
              {recommended && (
                <div className="absolute -top-2 -right-2 z-10">
                  <Badge className="bg-orange-500 text-white flex items-center gap-1 px-2 py-1">
                    <Star className="h-3 w-3 fill-current" />
                    Recomendado
                  </Badge>
                </div>
              )}
              
              <CardHeader className="pb-2 space-y-1 px-4 py-3">
                <h4 className="text-base font-semibold leading-tight">{item.name}</h4>
                {item.tags && item.tags.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1 mt-2">
                    {item.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="text-xs px-2 py-0.5">{tag}</Badge>
                    ))}
                  </div>
                )}
              </CardHeader>
              
              <CardContent className="px-4 py-2">
                <p className="text-sm text-muted-foreground mb-3 leading-relaxed">{item.description}</p>
                
                {/* DESTAQUE MAIOR PARA O PREÇO */}
                <div className="bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-lg p-3 mb-3 border border-orange-200 dark:border-orange-700">
                  <div className="flex items-baseline justify-center text-center">
                    <span className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                      {formatCurrency(price)}
                    </span>
                    <span className="text-sm text-orange-500 dark:text-orange-300 ml-1 font-medium">/mês</span>
                  </div>
                  {recommended && (
                    <div className="text-xs text-orange-600 dark:text-orange-400 text-center mt-1 font-medium">
                      Melhor custo-benefício
                    </div>
                  )}
                </div>
              </CardContent>
              
              {onDelete || onEdit ? (
                <CardFooter className="flex justify-end gap-1 px-4 py-3 border-t border-border bg-muted/30">
                  {onEdit && (
                    <Button variant="ghost" size="sm" onClick={() => onEdit(item)} className="h-8 w-8 p-0">
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                  )}
                  {onDelete && (
                    <Button variant="ghost" size="sm" onClick={() => onDelete(item.id)} className="h-8 w-8 p-0">
                      <Trash2 className="h-3.5 w-3.5 text-destructive" />
                    </Button>
                  )}
                </CardFooter>
              ) : null}
            </Card>
          );
        })}
      </div>
    );
  }

  return (
    <>
      {items.map((item) => {
        const price = getDisplayPrice(item);
        const recommended = isRecommended(item);
        
        console.log(`[TableContent] Table Item ${item.id} price:`, price);
        
        return (
          <TableRow key={item.id} className={`h-14 ${recommended ? 'bg-orange-50 dark:bg-orange-900/10 border-l-4 border-l-orange-500' : ''}`}>
            <TableCell className="py-3 px-4 font-medium align-middle">
              <div className="flex items-center gap-2">
                {recommended && <Star className="h-4 w-4 fill-orange-500 text-orange-500" />}
                {item.name}
              </div>
            </TableCell>
            <TableCell className="py-3 px-4 align-middle">{item.description}</TableCell>
            <TableCell className="py-3 px-4 text-right align-middle whitespace-nowrap">
              <div className={`font-bold text-lg ${recommended ? 'text-orange-600 dark:text-orange-400' : 'text-primary'}`}>
                {formatCurrency(price)}
              </div>
              {recommended && (
                <div className="text-xs text-orange-500 mt-0.5">Recomendado</div>
              )}
            </TableCell>
            <TableCell className="py-3 px-4 text-right align-middle">
              <div className="flex justify-end gap-1">
                {onEdit && (
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => onEdit(item)}>
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                )}
                {onDelete && (
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => onDelete(item.id)}>
                    <Trash2 className="h-3.5 w-3.5 text-destructive" />
                  </Button>
                )}
              </div>
            </TableCell>
          </TableRow>
        );
      })}
    </>
  );
}
