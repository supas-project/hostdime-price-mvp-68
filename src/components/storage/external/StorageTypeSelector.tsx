
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { HelpTooltip } from "@/components/help-tooltip";
import { Circle, CircleDashed, CircleDot } from "lucide-react";
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
  // Log para debug
  console.log('[StorageTypeSelector] Available storage types:', Object.keys(storageTypes));
  console.log('[StorageTypeSelector] Selected type details:', storageTypes[selectedType]);
  
  // Verificar se temos tipos de armazenamento
  if (Object.keys(storageTypes).length === 0) {
    console.warn('[StorageTypeSelector] No storage types available!');
  }
  
  // Get badge variant and icon based on storage type
  const getTypeVisuals = (type: string): {
    variant: "default" | "secondary" | "outline" | "success";
    icon: React.ReactNode;
    label: string;
    simpleDesc: string;
  } => {
    const lowerType = type.toLowerCase();
    
    switch (lowerType) {
      case 'standard':
        return {
          variant: "secondary",
          icon: <CircleDashed className="h-3.5 w-3.5 sm:h-4 sm:w-4" />,
          label: "Básico",
          simpleDesc: "Econômico, para arquivos acessados com pouca frequência"
        };
      case 'performance':
        return {
          variant: "default",
          icon: <Circle className="h-3.5 w-3.5 sm:h-4 sm:w-4" />,
          label: "Intermediário",
          simpleDesc: "Equilibrado, bom para a maioria dos sites e aplicativos"
        };
      case 'premium':
        return {
          variant: "success",
          icon: <CircleDot className="h-3.5 w-3.5 sm:h-4 sm:w-4" />,
          label: "Avançado",
          simpleDesc: "Mais rápido, para aplicações que exigem alta velocidade"
        };
      default:
        return {
          variant: "secondary",
          icon: <Circle className="h-3.5 w-3.5 sm:h-4 sm:w-4" />,
          label: type.charAt(0).toUpperCase() + type.slice(1),
          simpleDesc: "Armazenamento externo"
        };
    }
  };
  
  return (
    <div className="space-y-3 overflow-x-hidden">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <label className="text-xs sm:text-sm font-medium">Tipo de Storage</label>
          <HelpTooltip
            title="Escolha o tipo ideal"
            description="O tipo determina a velocidade e desempenho do seu armazenamento externo."
          />
        </div>
      </div>
      
      {Object.keys(storageTypes).length === 0 ? (
        <div className="p-4 border border-dashed rounded-lg text-center text-muted-foreground">
          Nenhum tipo de storage disponível. Por favor, configure-os na Tabela de Preços.
        </div>
      ) : (
        <RadioGroup 
          value={selectedType} 
          onValueChange={onTypeChange} 
          className="grid grid-cols-1 sm:grid-cols-3 gap-2"
        >
          {Object.entries(storageTypes).map(([key, type]) => {
            const { variant, icon, label, simpleDesc } = getTypeVisuals(key);
            
            // Garantir que temos um número válido para o preço por GB
            const pricePerGB = typeof type.pricePerGB === 'number' && !isNaN(type.pricePerGB) 
              ? type.pricePerGB 
              : 0;
              
            // Log detalhado para debug do preço
            console.log(`[StorageTypeSelector] Type ${key} price per GB: ${pricePerGB} (original value: ${type.pricePerGB})`);
            
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
                    "flex flex-col gap-1 p-2.5 sm:p-3 rounded-lg border cursor-pointer transition-all text-center",
                    "peer-focus-visible:ring-2 peer-focus-visible:ring-primary min-h-[85px] touch-target",
                    selectedType === key 
                      ? "border-primary bg-primary/10" 
                      : "border-border hover:border-primary/30 hover:bg-primary/5"
                  )}
                >
                  <div className="flex items-center justify-center gap-1.5 sm:gap-2">
                    {icon}
                    <span className="font-medium text-xs sm:text-sm">{type.name}</span>
                  </div>
                  <Badge variant={variant} className="w-fit mx-auto text-xs">
                    {label}
                  </Badge>
                  <div className="text-xs text-muted-foreground mt-1">
                    {formatCurrency(pricePerGB)}/GB
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
