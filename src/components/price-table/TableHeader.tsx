
import { TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { HelpTooltip } from "@/components/help-tooltip";
import { cn } from "@/lib/utils";

interface PriceTableHeaderProps {
  showActions?: boolean;
  className?: string;
}

export function PriceTableHeader({ showActions = false, className }: PriceTableHeaderProps) {
  return (
    <TableHeader className={cn("bg-muted/20", className)}>
      <TableRow className="h-10">
        <TableHead className="w-[250px] py-2 px-4 align-middle">
          <div className="flex items-center gap-1">
            Nome
            <HelpTooltip 
              title="Nome do componente"
              description="Identificação do item na tabela de preços"
            />
          </div>
        </TableHead>
        <TableHead className="w-[400px] py-2 px-4 align-middle">
          <div className="flex items-center gap-1">
            Descrição
            <HelpTooltip 
              title="Descrição do componente"
              description="Detalhes e especificações do item"
            />
          </div>
        </TableHead>
        <TableHead className="py-2 px-4 text-right align-middle">
          <div className="flex items-center gap-1 justify-end">
            Preço
            <HelpTooltip 
              title="Preço base"
              description="Valor base do componente sem descontos"
            />
          </div>
        </TableHead>
        {showActions && (
          <TableHead className="w-[100px] py-2 px-4 text-right align-middle">
            Ações
          </TableHead>
        )}
      </TableRow>
    </TableHeader>
  );
}
