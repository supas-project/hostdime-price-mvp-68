
import { formatCurrency } from "@/lib/utils";
import { BarChart3, Zap } from "lucide-react";
import { HelpTooltip } from "@/components/help-tooltip";
import { cn } from "@/lib/utils";

interface StorageSpecsProps {
  iops: string;
  throughput: string;
  price: number;
  description?: string;
  storageType: string;
}

export function StorageSpecs({ iops, throughput, price, description, storageType }: StorageSpecsProps) {
  // Simplify technical terms for non-technical users
  const getSimplifiedTerms = (type: string) => {
    const lowerType = type.toLowerCase();
    
    if (lowerType.includes('standard')) {
      return {
        speedDesc: "Velocidade padrão",
        useCaseDesc: "Bom para: arquivos, backups, documentos"
      };
    } else if (lowerType.includes('performance')) {
      return {
        speedDesc: "Velocidade rápida",
        useCaseDesc: "Bom para: sites, bancos de dados pequenos, CMS"
      };
    } else {
      return {
        speedDesc: "Velocidade muito rápida",
        useCaseDesc: "Bom para: aplicações, bancos de dados, processamento"
      };
    }
  };
  
  const simplifiedTerms = getSimplifiedTerms(storageType);

  return (
    <div className={cn(
      "space-y-3 mt-4 py-3 px-1",
      "border-t border-border/50"
    )}>
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Zap className="h-3.5 w-3.5" /> 
            Processamento 
            <HelpTooltip
              title="IOPS"
              description="Indica quantas operações o sistema pode fazer por segundo. Quanto maior, mais rápido o processamento de arquivos pequenos."
            />
          </div>
          <p className="font-medium text-xs sm:text-sm">{iops}</p>
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <BarChart3 className="h-3.5 w-3.5" /> 
            Velocidade 
            <HelpTooltip
              title="Throughput"
              description="Taxa de transferência de dados. Quanto maior, mais rápido para arquivos grandes."
            />
          </div>
          <p className="font-medium text-xs sm:text-sm">{throughput}</p>
        </div>
      </div>
      
      <div className="text-xs text-muted-foreground">
        {simplifiedTerms.useCaseDesc}
      </div>
    </div>
  );
}
