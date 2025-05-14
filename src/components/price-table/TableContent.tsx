
import { PriceCategory, PriceItem } from "@/types/pricing";
import { ComponentOption } from "@/types/component";
import { TableCell, TableRow } from "@/components/ui/table";
import { HelpTooltip } from "@/components/help-tooltip";
import { Button } from "@/components/ui/button";
import { Trash2, Edit, Tag } from "lucide-react";
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

// Define tag colors for specific tags
const TAG_COLORS: Record<string, string> = {
  "Hardware": "bg-blue-500/10 text-blue-500 border-blue-200",
  "Licenciado": "bg-green-500/10 text-green-500 border-green-200",
  "Crítico": "bg-red-500/10 text-red-500 border-red-200"
};

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

  // Helper function to get tag styles
  const getTagStyle = (tag: string): string => {
    return TAG_COLORS[tag] || ""; 
  };

  // Helper function to calculate price with PayBack applied
  const getPriceWithPayBack = (item: PriceItem): { original: number, withPayback: number | null } => {
    // An item is hardware if it has the Hardware tag or isHardware is true
    const isHardware = (item.tags && item.tags.includes("Hardware")) || Boolean(item.isHardware);
    
    if (isHardware && contractDuration !== "0") {
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
            <Card 
              key={item.id} 
              className="overflow-hidden border-border hover:border-primary/30 transition-all duration-300 hover:shadow-md"
            >
              <CardContent className="p-0">
                <div className="p-4 flex flex-col h-full">
                  <div className="flex justify-between items-start mb-2 flex-wrap gap-2">
                    <h3 className="font-medium text-base sm:text-lg">{item.name}</h3>
                    <div className="text-base sm:text-lg font-bold text-primary">
                      {formatCurrency(item.price)}
                      
                      {priceInfo.withPayback !== null && (
                        <div className="text-xs font-normal text-blue-500 text-right">
                          {formatCurrency(priceInfo.withPayback)} com PayBack ({formatPayBack(getPayBackValue(item as ComponentOption, contractDuration))})
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex-1 text-xs sm:text-sm text-muted-foreground mb-3">
                    <div className="flex items-start sm:items-center gap-1 flex-wrap">
                      <span className="break-words">{item.description}</span>
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
                      <Badge variant="outline" className="self-start text-xs">
                        {item.subtype}
                      </Badge>
                    )}
                    
                    {/* Display all tags */}
                    {item.tags && item.tags.map(tag => (
                      <Badge
                        key={tag}
                        variant="outline" 
                        className={`self-start text-xs ${getTagStyle(tag)}`}
                      >
                        <Tag className="h-3 w-3 mr-1" />
                        {tag}
                      </Badge>
                    ))}
                    
                    {/* Fallback for legacy items */}
                    {!item.tags && item.isHardware && (
                      <Badge variant="outline" className="self-start text-xs bg-blue-500/10 text-blue-500 border-blue-200">
                        <Tag className="h-3 w-3 mr-1" />
                        Hardware
                      </Badge>
                    )}
                  </div>
                  
                  {onDelete && (
                    <div className="flex justify-end gap-1 pt-2 border-t border-border">
                      {onEdit && (
                        <Button variant="ghost" size="sm" onClick={() => onEdit(item)}>
                          <Edit className="h-4 w-4 mr-1" />
                          <span className="text-xs sm:text-sm">Editar</span>
                        </Button>
                      )}
                      
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                            <Trash2 className="h-4 w-4 mr-1" />
                            <span className="text-xs sm:text-sm">Excluir</span>
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
              <div className="line-clamp-2">{item.name}</div>
              <div className="flex flex-wrap gap-1 mt-1">
                {item.subtype && (
                  <Badge variant="outline" className="text-xs">
                    {item.subtype}
                  </Badge>
                )}
                
                {/* Display all tags */}
                {item.tags && item.tags.map(tag => (
                  <Badge
                    key={tag}
                    variant="outline" 
                    className={`text-xs ${getTagStyle(tag)}`}
                  >
                    <Tag className="h-3 w-3 mr-1" />
                    {tag}
                  </Badge>
                ))}
                
                {/* Fallback for legacy items */}
                {!item.tags && item.isHardware && (
                  <Badge variant="outline" className="text-xs bg-blue-500/10 text-blue-500 border-blue-200">
                    <Tag className="h-3 w-3 mr-1" />
                    Hardware
                  </Badge>
                )}
              </div>
            </TableCell>
            
            <TableCell>
              <div className="flex items-start sm:items-center gap-1 flex-wrap">
                <span className="line-clamp-2">{item.description}</span>
                {item.specs && item.specs.length > 0 && (
                  <HelpTooltip 
                    title="Ver detalhes"
                    description={item.specs.join('\n') || 'Sem especificações adicionais'}
                  />
                )}
              </div>
            </TableCell>
            
            <TableCell className="font-bold text-primary whitespace-nowrap">
              {formatCurrency(item.price)}
              
              {priceInfo.withPayback !== null && (
                <div className="text-xs font-normal text-blue-500">
                  {formatCurrency(priceInfo.withPayback)} com PayBack ({formatPayBack(getPayBackValue(item as ComponentOption, contractDuration))})
                </div>
              )}
            </TableCell>
            
            {onDelete && (
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
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
