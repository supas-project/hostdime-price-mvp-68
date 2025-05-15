
import React from 'react';
import { TableRow, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { PriceCategory, PriceItem } from "@/types/pricing";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface TableContentProps {
  category: PriceCategory;
  onDelete?: (itemId: string) => void;
  onEdit?: (item: PriceItem) => void;
  displayMode?: "table" | "card";
  sortOrder?: "asc" | "desc" | null;
  contractDuration?: string; // Contract duration parameter
}

export function TableContent({
  category,
  onDelete,
  onEdit,
  displayMode = "table",
  sortOrder = null,
  contractDuration = "0" // Default to no contract
}: TableContentProps) {
  // Sort items if needed
  let items = [...category.items];
  
  if (sortOrder === "asc") {
    items = items.sort((a, b) => a.price - b.price);
  } else if (sortOrder === "desc") {
    items = items.sort((a, b) => b.price - a.price);
  }
  
  // Calculate price with possible contract discount
  const calculatePrice = (item: PriceItem): number => {
    // If this is hardware and we have a contract, apply discount
    if ((item.isHardware || item.tags?.includes('Hardware')) && contractDuration !== "0") {
      // Map contract duration to discount percentage
      const discountMap: Record<string, number> = {
        "12": 5,
        "24": 10,
        "36": 15,
        "48": 20,
        "60": 25,
      };
      
      const discount = discountMap[contractDuration] || 0;
      return item.price * (1 - discount / 100);
    }
    
    return item.price;
  };

  if (displayMode === "card") {
    return (
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {items.map((item) => (
          <Card key={item.id} className="border border-border rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
            <CardHeader className="pb-1 space-y-0 px-3 py-2">
              <h4 className="text-sm font-medium">{item.name}</h4>
              {item.tags && item.tags.length > 0 && (
                <div className="flex flex-wrap items-center gap-1 mt-1">
                  {item.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">{tag}</Badge>
                  ))}
                </div>
              )}
            </CardHeader>
            <CardContent className="px-3 py-2">
              <p className="text-xs text-muted-foreground">{item.description}</p>
              <div className="flex items-center mt-1">
                <span className="text-lg font-bold">{formatCurrency(calculatePrice(item))}</span>
                <span className="text-xs text-muted-foreground ml-1">/mês</span>
              </div>
            </CardContent>
            {onDelete || onEdit ? (
              <CardFooter className="flex justify-end gap-1 px-3 py-2 border-t border-border">
                {onEdit && (
                  <Button variant="ghost" size="icon" onClick={() => onEdit(item)}>
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                )}
                {onDelete && (
                  <Button variant="ghost" size="icon" onClick={() => onDelete(item.id)}>
                    <Trash2 className="h-3.5 w-3.5 text-destructive" />
                  </Button>
                )}
              </CardFooter>
            ) : null}
          </Card>
        ))}
      </div>
    );
  }

  return (
    <>
      {items.map((item) => (
        <TableRow key={item.id} className="h-12">
          <TableCell className="py-2 px-4 font-medium align-middle">{item.name}</TableCell>
          <TableCell className="py-2 px-4 align-middle">{item.description}</TableCell>
          <TableCell className="py-2 px-4 text-right align-middle whitespace-nowrap">{formatCurrency(calculatePrice(item))}</TableCell>
          <TableCell className="py-2 px-4 text-right align-middle">
            <div className="flex justify-end gap-1">
              {onEdit && (
                <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => onEdit(item)}>
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
              )}
              {onDelete && (
                <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => onDelete(item.id)}>
                  <Trash2 className="h-3.5 w-3.5 text-destructive" />
                </Button>
              )}
            </div>
          </TableCell>
        </TableRow>
      ))}
    </>
  );
}
