
import { useState, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { formatCurrency } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Database, HardDrive } from "lucide-react";
import { HelpTooltip } from "@/components/help-tooltip";

const STORAGE_TYPES = {
  standard: { 
    name: "Standard", 
    pricePerGB: 0.15, 
    iops: "Até 1000", 
    throughput: "Até 125 MB/s",
    description: "Ideal para backups e arquivos raramente acessados"
  },
  ssd: { 
    name: "SSD", 
    pricePerGB: 0.25, 
    iops: "Até 3000", 
    throughput: "Até 250 MB/s",
    description: "Bom para bancos de dados pequenos e médios"
  },
  premium: { 
    name: "Premium", 
    pricePerGB: 0.35, 
    iops: "Até 6000", 
    throughput: "Até 500 MB/s",
    description: "Ótimo para aplicações de alto desempenho"
  },
  nvme: { 
    name: "NVMe", 
    pricePerGB: 0.45, 
    iops: "Até 10000", 
    throughput: "Até 1000 MB/s",
    description: "Máximo desempenho para cargas críticas"
  }
};

interface ExternalStoragePanelProps {
  onSelectStorage?: (type: string, capacity: number, price: number) => void;
}

export function ExternalStoragePanel({ onSelectStorage }: ExternalStoragePanelProps) {
  const [storageType, setStorageType] = useState<keyof typeof STORAGE_TYPES | "">("");
  const [capacityGB, setCapacityGB] = useState(100);

  const calculatePrice = () => {
    if (!storageType) return 0;
    return capacityGB * STORAGE_TYPES[storageType].pricePerGB;
  };

  // Whenever relevant state changes, notify parent component
  useEffect(() => {
    if (storageType && onSelectStorage) {
      const price = calculatePrice();
      onSelectStorage(STORAGE_TYPES[storageType].name, capacityGB, price);
    }
  }, [storageType, capacityGB]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <Select onValueChange={(value: keyof typeof STORAGE_TYPES) => setStorageType(value)}>
          <SelectTrigger className="w-full transition-all duration-300 hover:border-primary/50 focus:ring-2 focus:ring-primary/20">
            <SelectValue placeholder="Selecione o tipo de storage" />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(STORAGE_TYPES).map(([key, type]) => (
              <SelectItem 
                key={key} 
                value={key}
                className="transition-colors duration-200"
              >
                <div className="flex flex-col gap-1">
                  <span className="font-medium">{type.name}</span>
                  <span className="text-xs text-muted-foreground">{type.description}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {storageType && (
        <div className="animate-fade-in space-y-6">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium flex items-center gap-2">
                Capacidade
                <HelpTooltip
                  title="Capacidade do Storage"
                  description="Ajuste a capacidade do seu storage externo conforme sua necessidade"
                />
              </label>
              <span className="font-medium text-primary">{capacityGB} GB</span>
            </div>
            <Slider
              value={[capacityGB]}
              onValueChange={([value]) => setCapacityGB(value)}
              min={100}
              max={2000}
              step={100}
              className="my-4"
            />
          </div>

          <Card className="p-4 space-y-4 bg-card/50 backdrop-blur-sm border-primary/10 transition-all duration-300 hover:border-primary/30">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <span className="text-sm text-muted-foreground">IOPS</span>
                <p className="font-medium">{STORAGE_TYPES[storageType].iops}</p>
              </div>
              <div className="space-y-2">
                <span className="text-sm text-muted-foreground">Throughput</span>
                <p className="font-medium">{STORAGE_TYPES[storageType].throughput}</p>
              </div>
            </div>
            <div className="pt-4 border-t border-border/50">
              <div className="flex justify-between items-center">
                <span className="font-medium">Preço Mensal</span>
                <span className="text-lg font-semibold text-primary animate-fade-in">
                  {formatCurrency(calculatePrice())}
                </span>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
