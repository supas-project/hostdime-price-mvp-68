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
  contractDuration?: string; // Added contractDuration as optional prop
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
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((item) => (
          <Card key={item.id} className="border border-border rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <h4 className="text-sm font-medium">{item.name}</h4>
              {item.tags && item.tags.length > 0 && (
                <div className="flex items-center space-x-1">
                  {item.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary">{tag}</Badge>
                  ))}
                </div>
              )}
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{item.description}</p>
              <div className="flex items-center mt-2">
                <span className="text-lg font-bold">{formatCurrency(calculatePrice(item))}</span>
                <span className="text-sm text-muted-foreground ml-1">/mês</span>
              </div>
            </CardContent>
            {onDelete || onEdit ? (
              <CardFooter className="flex justify-end gap-2">
                {onEdit && (
                  <Button variant="ghost" size="icon" onClick={() => onEdit(item)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                )}
                {onDelete && (
                  <Button variant="ghost" size="icon" onClick={() => onDelete(item.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
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
        <TableRow key={item.id}>
          <TableCell className="font-medium">{item.name}</TableCell>
          <TableCell>{item.description}</TableCell>
          <TableCell>{item.subtype}</TableCell>
          <TableCell>{formatCurrency(calculatePrice(item))}</TableCell>
          <TableCell className="flex justify-end gap-2">
            {onEdit && (
              <Button variant="ghost" size="icon" onClick={() => onEdit(item)}>
                <Pencil className="h-4 w-4" />
              </Button>
            )}
            {onDelete && (
              <Button variant="ghost" size="icon" onClick={() => onDelete(item.id)}>
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            )}
          </TableCell>
        </TableRow>
      ))}
    </>
  );
}
