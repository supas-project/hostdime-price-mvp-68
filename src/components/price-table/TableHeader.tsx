
import { TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface PriceTableHeaderProps {
  showActions?: boolean;
  showComparison?: boolean;
}

export function PriceTableHeader({ showActions = false, showComparison = false }: PriceTableHeaderProps) {
  return (
    <TableHeader>
      <TableRow className="bg-muted/50 hover:bg-muted/70 transition-colors">
        <TableHead className="w-[300px] px-3 sm:px-6 py-4 font-semibold text-foreground">
          <div className="flex items-center gap-2">
            {showComparison && (
              <span className="text-xs text-muted-foreground hidden sm:inline">Compare</span>
            )}
            Produto
          </div>
        </TableHead>
        <TableHead className="px-3 sm:px-6 py-4 font-semibold text-foreground hidden md:table-cell">
          Descrição
        </TableHead>
        <TableHead className="text-right px-3 sm:px-6 py-4 font-semibold text-foreground">
          Preço
        </TableHead>
        {showActions && (
          <TableHead className="text-right px-3 sm:px-6 py-4 font-semibold text-foreground w-[100px]">
            Ações
          </TableHead>
        )}
      </TableRow>
    </TableHeader>
  );
}
