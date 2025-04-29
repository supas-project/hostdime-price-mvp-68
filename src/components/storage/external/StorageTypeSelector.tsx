
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { HelpTooltip } from "@/components/help-tooltip";
import { Circle, CircleDashed, CircleDot } from "lucide-react";

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
  // Get badge variant and icon based on storage type
  const getTypeVisuals = (type: string): {
    variant: "default" | "secondary" | "outline" | "success" | "warning" | "info";
    icon: React.ReactNode;
    label: string;
    simpleDesc: string;
  } => {
    const lowerType = type.toLowerCase();
    
    switch (lowerType) {
      case 'standard':
        return {
          variant: "info",
          icon: <CircleDashed className="h-4 w-4" />,
          label: "Básico",
          simpleDesc: "Econômico, para arquivos acessados com pouca frequência"
        };
      case 'performance':
        return {
          variant: "warning",
          icon: <Circle className="h-4 w-4" />,
          label: "Intermediário",
          simpleDesc: "Equilibrado, bom para a maioria dos sites e aplicativos"
        };
      case 'premium':
        return {
          variant: "success",
          icon: <CircleDot className="h-4 w-4" />,
          label: "Avançado",
          simpleDesc: "Mais rápido, para aplicações que exigem alta velocidade"
        };
      default:
        return {
          variant: "secondary",
          icon: <Circle className="h-4 w-4" />,
          label: type.charAt(0).toUpperCase() + type.slice(1),
          simpleDesc: "Armazenamento externo"
        };
    }
  };
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">Tipo de Storage</label>
          <HelpTooltip
            title="Escolha o tipo ideal"
            description="O tipo determina a velocidade e desempenho do seu armazenamento externo. Escolha com base em quanto você precisa acessar seus arquivos."
          />
        </div>
      </div>
      
      <Select onValueChange={onTypeChange} value={selectedType}>
        <SelectTrigger className="w-full transition-all duration-300 hover:border-primary/50 focus:ring-2 focus:ring-primary/20">
          <SelectValue placeholder="Escolha o tipo de armazenamento" />
        </SelectTrigger>
        <SelectContent className="max-h-[300px]">
          {Object.entries(storageTypes).map(([key, type]) => {
            const { variant, icon, label, simpleDesc } = getTypeVisuals(key);
            
            return (
              <SelectItem 
                key={key} 
                value={key}
                className={cn(
                  "transition-colors duration-200 py-3",
                  selectedType === key ? "bg-accent" : ""
                )}
              >
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {icon}
                      <span className="font-medium">{type.name}</span>
                    </div>
                    <Badge variant={variant} className="ml-2">
                      {label}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{simpleDesc}</p>
                  <div className="text-xs text-muted-foreground mt-1">
                    R$ {type.pricePerGB.toFixed(2)}/GB
                  </div>
                </div>
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
    </div>
  );
}
