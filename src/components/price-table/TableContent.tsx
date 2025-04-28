
import { PriceCategory, PriceItem } from "@/types/pricing";
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

interface TableContentProps {
  category: PriceCategory;
  onDelete?: (itemId: string) => void;
  onEdit?: (item: PriceItem) => void;
}

export function TableContent({ category, onDelete, onEdit }: TableContentProps) {
  if (category.items.length === 0) {
    return (
      <TableRow>
        <TableCell colSpan={onDelete ? 4 : 3} className="text-center py-6 text-muted-foreground">
          Nenhum item cadastrado nesta categoria
        </TableCell>
      </TableRow>
    );
  }

  return (
    <>
      {category.items.map(item => (
        <TableRow key={item.id}>
          <TableCell className="font-medium">{item.name}</TableCell>
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
          <TableCell>{formatCurrency(item.price)}</TableCell>
          {onDelete && (
            <TableCell className="text-right">
              <div className="flex items-center justify-end gap-1">
                {onEdit && (
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEdit(item)}>
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
      ))}
    </>
  );
}
