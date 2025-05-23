
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { HelpTooltip } from "@/components/help-tooltip";
import { Circle, CircleDashed, CircleDot, Zap, Shield, Cpu } from "lucide-react";
import { Label } from "@/components/ui/label";
import { formatCurrency } from "@/lib/utils";

interface StorageType {
  name: string;
  pricePerGB: number;
  iops: string;
  throughput: string;
  description: string;
}

interface StorageTypeSelectorProps {
  storageTypes: Record<string, StorageType>;
  selectedType: string;
  onTypeChange: (value: string) => void;
}

export function StorageTypeSelector({ 
  storageTypes, 
  selectedType, 
  onTypeChange 
}: StorageTypeSelectorProps) {
  // Função para limpar o nome e remover identificadores técnicos
  const cleanStorageName = (name: string): string => {
    // Remove IDs, códigos e identificadores técnicos
    return name
      .replace(/External-storage-/gi, '')
      .replace(/[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}/gi, '')
      .replace(/\b[A-Z0-9]{8,}\b/g, '')
      .trim();
  };

  // Get badge variant and icon based on storage type
  const getTypeVisuals = (type: string, name: string): {
    variant: "default" | "secondary" | "outline" | "success";
    icon: React.ReactNode;
    label: string;
    simpleDesc: string;
  } => {
    const lowerName = name.toLowerCase();
    
    if (lowerName.includes('premium') || lowerName.includes('ultra')) {
      return {
        variant: "success",
        icon: <Zap className="h-3.5 w-3.5 sm:h-4 sm:w-4" />,
        label: "Premium",
        simpleDesc: "Máximo desempenho para aplicações críticas"
      };
    }
    
    if (lowerName.includes('performance') || lowerName.includes('edge')) {
      return {
        variant: "default",
        icon: <Cpu className="h-3.5 w-3.5 sm:h-4 sm:w-4" />,
        label: "Performance",
        simpleDesc: "Alto desempenho para aplicações exigentes"
      };
    }
    
    if (lowerName.includes('standard') || lowerName.includes('snapshot')) {
      return {
        variant: "secondary",
        icon: <Shield className="h-3.5 w-3.5 sm:h-4 sm:w-4" />,
        label: "Standard",
        simpleDesc: "Solução econômica para uso geral"
      };
    }
    
    return {
      variant: "secondary",
      icon: <Circle className="h-3.5 w-3.5 sm:h-4 sm:w-4" />,
      label: "Storage",
      simpleDesc: "Armazenamento confiável"
    };
  };
  
  return (
    <div className="space-y-4 overflow-x-hidden">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <label className="text-sm font-medium">Tipo de Storage</label>
          <HelpTooltip
            title="Escolha o tipo ideal"
            description="Selecione o tipo de storage que melhor atende às suas necessidades de performance e orçamento."
          />
        </div>
      </div>
      
      {Object.keys(storageTypes).length === 0 ? (
        <div className="p-4 border border-dashed rounded-lg text-center text-muted-foreground">
          Nenhum tipo de storage disponível. Configure-os na Tabela de Preços.
        </div>
      ) : (
        <RadioGroup 
          value={selectedType} 
          onValueChange={onTypeChange} 
          className="grid grid-cols-1 gap-3"
        >
          {Object.entries(storageTypes).map(([key, type]) => {
            const cleanName = cleanStorageName(type.name);
            const { variant, icon, label, simpleDesc } = getTypeVisuals(key, cleanName);
            
            // Garantir que temos um número válido para o preço por GB
            const pricePerGB = typeof type.pricePerGB === 'number' && !isNaN(type.pricePerGB) 
              ? type.pricePerGB 
              : 0;
            
            return (
              <div key={key} className="relative">
                <RadioGroupItem 
                  value={key} 
                  id={`storage-type-${key}`} 
                  className="sr-only peer"
                />
                <Label
                  htmlFor={`storage-type-${key}`}
                  className={cn(
                    "flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-all",
                    "peer-focus-visible:ring-2 peer-focus-visible:ring-primary",
                    "hover:shadow-md",
                    selectedType === key 
                      ? "border-primary bg-primary/10 shadow-sm" 
                      : "border-border hover:border-primary/30 hover:bg-primary/5"
                  )}
                >
                  <div className="flex-shrink-0">
                    {icon}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium text-sm truncate">{cleanName}</h3>
                      <Badge variant={variant} className="text-xs flex-shrink-0">
                        {label}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                      {simpleDesc}
                    </p>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="font-medium text-primary">
                        {formatCurrency(pricePerGB)}/GB
                      </span>
                      <span className="text-muted-foreground">•</span>
                      <span className="text-muted-foreground">
                        {type.iops} IOPS
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex-shrink-0">
                    <div className={cn(
                      "w-4 h-4 rounded-full border-2 transition-all",
                      selectedType === key 
                        ? "border-primary bg-primary" 
                        : "border-muted-foreground"
                    )}>
                      {selectedType === key && (
                        <div className="w-full h-full rounded-full bg-white scale-50" />
                      )}
                    </div>
                  </div>
                </Label>
              </div>
            );
          })}
        </RadioGroup>
      )}
    </div>
  );
}
