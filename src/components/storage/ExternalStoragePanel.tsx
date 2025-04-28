
import { useState, useEffect } from "react";
import { StorageTypeSelector } from "./external/StorageTypeSelector";
import { CapacitySlider } from "./external/CapacitySlider";
import { StorageSpecs } from "./external/StorageSpecs";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { useWizard } from "@/contexts/WizardContext";

interface StorageType {
  name: string;
  pricePerGB: number;
  iops: string;
  throughput: string;
  description: string;
  throughputAdd?: number;
  maxThroughput?: string;
}

interface StorageTypes {
  [key: string]: StorageType;
}

// Tipos de storage padrão caso não venham da tabela de preços
const DEFAULT_STORAGE_TYPES: StorageTypes = {
  standard: { 
    name: "Standard", 
    pricePerGB: 0.35, 
    iops: "Até 3000", 
    throughput: "Até 125 MB/s",
    description: "Ideal para backups e arquivos raramente acessados"
  },
  performance: { 
    name: "Performance", 
    pricePerGB: 0.60, 
    iops: "Até 6000", 
    throughput: "Até 250 MB/s",
    description: "Bom para bancos de dados pequenos e médios"
  },
  premium: { 
    name: "Premium", 
    pricePerGB: 0.80, 
    iops: "Até 12000", 
    throughput: "Até 500 MB/s",
    description: "Ótimo para aplicações de alto desempenho"
  },
  ultra: { 
    name: "Ultra", 
    pricePerGB: 1.10, 
    iops: "Até 16000", 
    throughput: "Até 600 MB/s",
    description: "Máximo desempenho para cargas críticas",
    throughputAdd: 1.80,
    maxThroughput: "1000 MB/s"
  },
  edge: { 
    name: "Edge", 
    pricePerGB: 1.30, 
    iops: "Até 32000", 
    throughput: "Até 1000 MB/s",
    description: "Performance extrema para cargas de trabalho intensivas",
    throughputAdd: 1.80,
    maxThroughput: "1800 MB/s"
  }
};

interface ExternalStoragePanelProps {
  onSelectStorage?: (type: string, capacity: number, price: number) => void;
  storageTypes?: StorageTypes;
}

export function ExternalStoragePanel({ 
  onSelectStorage, 
  storageTypes = DEFAULT_STORAGE_TYPES 
}: ExternalStoragePanelProps) {
  const [storageType, setStorageType] = useState<keyof typeof storageTypes | "">("");
  const [capacityGB, setCapacityGB] = useState(100);
  const { handleRemoveComponent } = useWizard();

  const calculatePrice = () => {
    if (!storageType) return 0;
    const pricePerGB = storageTypes[storageType]?.pricePerGB || 0;
    return capacityGB * pricePerGB;
  };

  useEffect(() => {
    if (storageType && onSelectStorage) {
      const price = calculatePrice();
      onSelectStorage(storageTypes[storageType].name, capacityGB, price);
    }
  }, [storageType, capacityGB]);

  const handleRemove = () => {
    handleRemoveComponent("storage_external");
    setStorageType("");
    setCapacityGB(100);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-start">
        <StorageTypeSelector
          storageTypes={storageTypes}
          selectedType={storageType}
          onTypeChange={(value) => setStorageType(value as keyof typeof storageTypes)}
        />
        {storageType && (
          <Button
            variant="ghost"
            size="icon"
            onClick={handleRemove}
            className="text-destructive hover:text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>

      {storageType && (
        <div className="animate-fade-in space-y-6">
          <CapacitySlider
            capacity={capacityGB}
            onCapacityChange={setCapacityGB}
          />

          <StorageSpecs
            iops={storageTypes[storageType].iops}
            throughput={storageTypes[storageType].throughput}
            price={calculatePrice()}
            description={storageTypes[storageType].description}
          />
        </div>
      )}
    </div>
  );
}
