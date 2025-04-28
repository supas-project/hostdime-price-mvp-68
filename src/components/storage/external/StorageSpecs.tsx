
import { Card } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";

interface StorageSpecsProps {
  iops: string;
  throughput: string;
  price: number;
  description?: string;
}

export function StorageSpecs({ iops, throughput, price, description }: StorageSpecsProps) {
  return (
    <Card className="p-4 space-y-4 bg-card/50 backdrop-blur-sm border-primary/10 transition-all duration-300 hover:border-primary/30">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <span className="text-sm text-muted-foreground">IOPS</span>
          <p className="font-medium">{iops}</p>
        </div>
        <div className="space-y-2">
          <span className="text-sm text-muted-foreground">Throughput</span>
          <p className="font-medium">{throughput}</p>
        </div>
      </div>
      
      {description && (
        <div className="pt-2">
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      )}
      
      <div className="pt-4 border-t border-border/50">
        <div className="flex justify-between items-center">
          <span className="font-medium">Preço Mensal</span>
          <span className="text-lg font-semibold text-primary animate-fade-in">
            {formatCurrency(price)}
          </span>
        </div>
      </div>
    </Card>
  );
}
