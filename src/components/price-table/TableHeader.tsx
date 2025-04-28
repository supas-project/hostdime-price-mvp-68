
import { TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { HelpTooltip } from "@/components/help-tooltip";

interface PriceTableHeaderProps {
  showActions?: boolean;
}

export function PriceTableHeader({ showActions = false }: PriceTableHeaderProps) {
  return (
    <TableHeader>
      <TableRow>
        <TableHead className="w-[250px]">
          Nome
          <HelpTooltip 
            title="Nome do componente"
            description="Identificação do item na tabela de preços"
          />
        </TableHead>
        <TableHead className="w-[400px]">
          Descrição
          <HelpTooltip 
            title="Descrição do componente"
            description="Detalhes e especificações do item"
          />
        </TableHead>
        <TableHead>
          Preço
          <HelpTooltip 
            title="Preço base"
            description="Valor base do componente sem descontos"
          />
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
