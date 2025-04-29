
import { Button } from "@/components/ui/button";
import { HardDrive } from "lucide-react";
import { cn } from "@/lib/utils";
import { HelpTooltip } from "@/components/help-tooltip";

interface DiskTypeSelectorProps {
  selectedType: "nvme" | "ssd" | "hdd" | undefined;
  onTypeSelect: (type: "nvme" | "ssd" | "hdd") => void;
}

export function DiskTypeSelector({ selectedType, onTypeSelect }: DiskTypeSelectorProps) {
  const diskTypes = [
    { 
      type: "nvme", 
      label: "NVMe", 
      description: "Mais rápido, ideal para bancos de dados e alta performance",
      performance: "Altíssima"
    },
    { 
      type: "ssd", 
      label: "SSD", 
      description: "Equilibrado, bom para sistema operacional e aplicações",
      performance: "Alta"
    },
    { 
      type: "hdd", 
      label: "HDD", 
      description: "Econômico, recomendado para armazenamento e backups",
      performance: "Média"
    },
  ];

  return (
    <div className="space-y-3">
      <div className="text-sm text-muted-foreground flex items-center justify-between">
        <span>Selecione o tipo de disco:</span>
        <HelpTooltip
          title="Tipos de disco"
          description="Escolha o tipo de disco baseado na sua necessidade de desempenho. NVMe oferece maior velocidade, SSD tem bom equilíbrio entre preço e desempenho, HDD é mais econômico para grande volume de dados."
        />
      </div>
      <div className="grid grid-cols-1 gap-2">
        {diskTypes.map((disk) => (
          <Button
            key={disk.type}
            variant="outline"
            size="sm"
            onClick={() => onTypeSelect(disk.type as "nvme" | "ssd" | "hdd")}
            className={cn(
              "h-auto py-2 px-3 justify-start flex flex-col items-start space-y-1 w-full transition-all",
              selectedType === disk.type
                ? "border-primary bg-primary/10"
                : "border-muted hover:border-primary/50"
            )}
          >
            <div className="flex items-center w-full justify-between">
              <div className="flex items-center">
                <HardDrive className={cn(
                  "mr-2 h-4 w-4",
                  selectedType === disk.type ? "text-primary" : "text-muted-foreground"
                )} />
                <span className={cn(
                  "font-medium",
                  selectedType === disk.type ? "text-primary" : ""
                )}>
                  {disk.label}
                </span>
              </div>
              <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                {disk.performance}
              </span>
            </div>
            <p className="text-xs text-left text-muted-foreground">
              {disk.description}
            </p>
          </Button>
        ))}
      </div>
    </div>
  );
}
