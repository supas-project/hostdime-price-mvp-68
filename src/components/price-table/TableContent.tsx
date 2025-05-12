
import { PriceCategory, PriceItem } from "@/types/pricing";
import { ComponentOption } from "@/types/component"; // Added import
import { TableCell, TableRow } from "@/components/ui/table";
import { HelpTooltip } from "@/components/help-tooltip";
import { Button } from "@/components/ui/button";
import { Trash2, Edit } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { getPayBackValue, formatPayBack } from "@/utils/payback-utils";

interface TableContentProps {
  category: PriceCategory;
  onDelete?: (itemId: string) => void;
  onEdit?: (item: PriceItem) => void;
  displayMode?: "table" | "card";
  sortOrder?: "asc" | "desc" | null;
  contractDuration?: string;  // Add contract duration prop
}

export function TableContent({ 
  category, 
  onDelete, 
  onEdit, 
  displayMode = "table",
  sortOrder = null,
  contractDuration = "0"  // Default to no contract
}: TableContentProps) {
  if (category.items.length === 0) {
    return (
      <TableRow>
        <TableCell colSpan={onDelete ? 4 : 3} className="text-center py-6 text-muted-foreground">
          Nenhum item cadastrado nesta categoria
        </TableCell>
      </TableRow>
    );
  }

  // Apply sorting if needed
  const sortedItems = [...category.items];
  if (sortOrder === "asc") {
    sortedItems.sort((a, b) => a.price - b.price);
  } else if (sortOrder === "desc") {
    sortedItems.sort((a, b) => b.price - a.price);
  }

  // Helper function to calculate price with PayBack applied
  const getPriceWithPayBack = (item: PriceItem): { original: number, withPayback: number | null } => {
    if (item.isHardware && contractDuration !== "0") {
      const paybackValue = getPayBackValue(item as ComponentOption, contractDuration);
      if (paybackValue) {
        return {
          original: item.price,
          withPayback: item.price / paybackValue
        };
      }
    }
    return { original: item.price, withPayback: null };
  };

  // Card display mode
  if (displayMode === "card") {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 py-4">
        {sortedItems.map(item => {
          const priceInfo = getPriceWithPayBack(item);
          
          return (
            <Card key={item.id} className="overflow-hidden border-border hover:border-primary/30 transition-all duration-300">
              <CardContent className="p-0">
                <div className="p-4 flex flex-col h-full">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium text-lg">{item.name}</h3>
                    <div className="text-lg font-bold text-primary">
                      {formatCurrency(item.price)}
                      
                      {priceInfo.withPayback !== null && (
                        <div className="text-xs font-normal text-blue-500 text-right">
                          {formatCurrency(priceInfo.withPayback)} com PayBack ({formatPayBack(getPayBackValue(item as ComponentOption, contractDuration))})
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex-1 text-sm text-muted-foreground mb-3">
                    <div className="flex items-center gap-1">
                      {item.description}
                      {item.specs && item.specs.length > 0 && (
                        <HelpTooltip 
                          title="Ver detalhes"
                          description={item.specs.join('\n') || 'Sem especificações adicionais'}
                        />
                      )}
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-1 mb-3">
                    {item.subtype && (
                      <Badge variant="outline" className="self-start">
                        {item.subtype}
                      </Badge>
                    )}
                    
                    {item.isHardware && (
                      <Badge variant="outline" className="self-start bg-blue-500/10 text-blue-500 border-blue-200">
                        Hardware
                      </Badge>
                    )}
                  </div>
                  
                  {onDelete && (
                    <div className="flex justify-end gap-1 pt-2 border-t border-border">
                      {onEdit && (
                        <Button variant="ghost" size="sm" onClick={() => onEdit(item)}>
                          <Edit className="h-4 w-4 mr-1" />
                          <span>Editar</span>
                        </Button>
                      )}
                      
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                            <Trash2 className="h-4 w-4 mr-1" />
                            <span>Excluir</span>
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Excluir item?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Esta ação não pode ser desfeita. O item será permanentemente removido.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={() => onDelete(item.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Excluir
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    );
  }

  // Default table display mode
  return (
    <>
      {sortedItems.map(item => {
        const priceInfo = getPriceWithPayBack(item);
        
        return (
          <TableRow key={item.id} className="group hover:bg-muted/70">
            <TableCell className="font-medium">
              {item.name}
              <div className="flex flex-wrap gap-1 mt-1">
                {item.subtype && (
                  <Badge variant="outline" className="text-xs">
                    {item.subtype}
                  </Badge>
                )}
                
                {item.isHardware && (
                  <Badge variant="outline" className="text-xs bg-blue-500/10 text-blue-500 border-blue-200">
                    Hardware
                  </Badge>
                )}
              </div>
            </TableCell>
            
            <TableCell>
              <div className="flex items-center gap-1">
                {item.description}
                {item.specs && item.specs.length > 0 && (
                  <HelpTooltip 
                    title="Ver detalhes"
                    description={item.specs.join('\n') || 'Sem especificações adicionais'}
                  />
                )}
              </div>
            </TableCell>
            
            <TableCell className="font-bold text-primary">
              {formatCurrency(item.price)}
              
              {priceInfo.withPayback !== null && (
                <div className="text-xs font-normal text-blue-500">
                  {formatCurrency(priceInfo.withPayback)} com PayBack ({formatPayBack(getPayBackValue(item as ComponentOption, contractDuration))})
                </div>
              )}
            </TableCell>
            
            {onDelete && (
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
                  {onEdit && (
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8" 
                      onClick={() => onEdit(item)}
                      title="Editar item"
                    >
                      <Edit className="h-4 w-4" />
                      <span className="sr-only">Editar</span>
                    </Button>
                  )}
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Trash2 className="h-4 w-4 text-destructive" />
                        <span className="sr-only">Excluir</span>
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Excluir item?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Esta ação não pode ser desfeita. O item será permanentemente removido.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={() => onDelete(item.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Excluir
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </TableCell>
            )}
          </TableRow>
        );
      })}
    </>
  );
}
