
import { HelpTooltip } from "@/components/help-tooltip";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";

interface StorageSpecsProps {
  iops: string;
  throughput: string;
  price: number;
  description: string;
  storageType: string;
  pricePerGB?: number;
}

export function StorageSpecs({ 
  iops, 
  throughput, 
  price, 
  description, 
  storageType,
  pricePerGB 
}: StorageSpecsProps) {
  // Garantir que exibimos um preço por GB válido
  const displayPricePerGB = typeof pricePerGB === 'number' && !isNaN(pricePerGB) ? pricePerGB : 0;

  return (
    <div className="space-y-4 p-4 bg-muted/30 rounded-lg border">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-muted-foreground">Performance</span>
            <HelpTooltip
              title="Especificações de Performance"
              description="IOPS (operações por segundo) e Throughput (taxa de transferência) determinam a velocidade do storage."
            />
          </div>
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">IOPS:</span>
              <Badge variant="outline" className="text-xs">{iops}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Throughput:</span>
              <Badge variant="outline" className="text-xs">{throughput}</Badge>
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
