
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
      <TableRow>
        <TableHead className="w-[250px]">
          <div className="flex items-center gap-1">
            Nome
            <HelpTooltip 
              title="Nome do componente"
              description="Identificação do item na tabela de preços"
            />
          </div>
        </TableHead>
        <TableHead className="w-[400px]">
          <div className="flex items-center gap-1">
            Descrição
            <HelpTooltip 
              title="Descrição do componente"
              description="Detalhes e especificações do item"
            />
          </div>
        </TableHead>
        <TableHead>
          <div className="flex items-center gap-1">
            Preço
            <HelpTooltip 
              title="Preço base"
              description="Valor base do componente sem descontos"
            />
          </div>
        </TableHead>
        {showActions && (
          <TableHead className="w-[100px] text-right">
            Ações
          </TableHead>
        )}
      </TableRow>
    </TableHeader>
  );
}
