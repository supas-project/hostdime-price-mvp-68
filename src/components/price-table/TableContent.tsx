
import { PriceCategory } from "@/types/pricing";
import { TableCell, TableRow } from "@/components/ui/table";
import { HelpTooltip } from "@/components/help-tooltip";
import { Button } from "@/components/ui/button";
import { HelpCircle } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface TableContentProps {
  category: PriceCategory;
}

export function TableContent({ category }: TableContentProps) {
  if (category.items.length === 0) {
    return (
      <TableRow>
        <TableCell colSpan={3} className="text-center py-6 text-muted-foreground">
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
              <HelpTooltip 
                title="Ver detalhes"
                description={item.specs?.join('\n') || 'Sem especificações adicionais'}
              />
            </div>
          </TableCell>
          <TableCell>{formatCurrency(item.price)}</TableCell>
        </TableRow>
      ))}
    </>
  );
}
