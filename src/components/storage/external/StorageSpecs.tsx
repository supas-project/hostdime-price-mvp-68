
import { Card } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { BarChart3, Zap } from "lucide-react";
import { HelpTooltip } from "@/components/help-tooltip";

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
    <Card className="p-4 space-y-4 bg-card/50 backdrop-blur-sm border-primary/10 transition-all duration-300 hover:border-primary/30">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium">Características</h3>
          <span className="text-sm text-muted-foreground">{simplifiedTerms.speedDesc}</span>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Zap className="h-3.5 w-3.5" /> 
              Processamento 
              <HelpTooltip
                title="IOPS"
                description="Indica quantas operações o sistema pode fazer por segundo. Quanto maior, mais rápido o processamento de muitos arquivos pequenos."
              />
            </div>
            <p className="font-medium text-sm">{iops}</p>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <BarChart3 className="h-3.5 w-3.5" /> 
              Velocidade 
              <HelpTooltip
                title="Throughput"
                description="Taxa de transferência de dados. Quanto maior, mais rápido para arquivos grandes como vídeos e imagens."
              />
            </div>
            <p className="font-medium text-sm">{throughput}</p>
          </div>
        </div>
        
        <div className="text-xs text-muted-foreground pt-2">
          {simplifiedTerms.useCaseDesc}
        </div>
      </div>
      
      <div className="pt-4 border-t border-border/50">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium">Preço Mensal</span>
          <span className="text-lg font-semibold text-primary animate-fade-in">
            {formatCurrency(price)}
          </span>
        </div>
      </div>
    </Card>
  );
}
