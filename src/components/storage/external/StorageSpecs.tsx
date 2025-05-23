
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
  // Console log para debug do preço
  console.log(`[StorageSpecs] Preço por GB: ${pricePerGB}, Preço total: ${price} para o tipo ${storageType}`);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <div className="flex items-center gap-1">
          <span className="text-xs sm:text-sm font-medium">IOPS:</span>
          <Badge variant="outline" className="text-xs font-normal">{iops}</Badge>
          <HelpTooltip
            title="Input/Output Operations Per Second"
            description="Medida de desempenho que indica quantas operações de leitura/escrita o storage pode realizar por segundo."
          />
        </div>
        
        <div className="flex items-center gap-1">
          <span className="text-xs sm:text-sm font-medium">Throughput:</span>
          <Badge variant="outline" className="text-xs font-normal">{throughput}</Badge>
          <HelpTooltip
            title="Taxa de Transferência"
            description="Velocidade máxima de leitura e escrita de dados, medida em MB/s."
          />
        </div>

        {pricePerGB !== undefined && (
          <div className="flex items-center gap-1">
            <span className="text-xs sm:text-sm font-medium">Preço por GB:</span>
            <Badge variant="outline" className="text-xs font-normal">{formatCurrency(pricePerGB)}</Badge>
          </div>
        )}
      </div>
      
      <div className="text-xs sm:text-sm text-muted-foreground">
        {description}
      </div>
    </div>
  );
}
