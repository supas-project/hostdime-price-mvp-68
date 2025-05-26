
import { HelpTooltip } from "@/components/help-tooltip";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";

interface MemorySpecsProps {
  frequency: string;
  type: string;
  price: number;
  description: string;
  memoryType: string;
  pricePerGB?: number;
}

export function MemorySpecs({ 
  frequency, 
  type, 
  price, 
  description, 
  memoryType,
  pricePerGB 
}: MemorySpecsProps) {
  // Garantir que exibimos um preço por GB válido
  const displayPricePerGB = typeof pricePerGB === 'number' && !isNaN(pricePerGB) ? pricePerGB : 0;

  return (
    <div className="space-y-4 p-4 bg-muted/30 rounded-lg border">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-muted-foreground">Especificações</span>
            <HelpTooltip
              title="Especificações Técnicas"
              description="Frequência e tipo da memória RAM que determinam a performance do sistema."
            />
          </div>
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Frequência:</span>
              <Badge variant="outline" className="text-xs">{frequency}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Tipo:</span>
              <Badge variant="outline" className="text-xs">{type}</Badge>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-muted-foreground">Preços</span>
            <HelpTooltip
              title="Estrutura de Preços"
              description="Preço por GB e valor total baseado na capacidade selecionada."
            />
          </div>
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Por GB:</span>
              <Badge variant="outline" className="text-xs font-medium text-primary">
                {formatCurrency(displayPricePerGB)}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Total:</span>
              <Badge variant="default" className="text-xs font-medium">
                {formatCurrency(price)}
              </Badge>
            </div>
          </div>
        </div>
      </div>
      
      <div className="pt-2 border-t">
        <p className="text-xs text-muted-foreground leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  );
}
