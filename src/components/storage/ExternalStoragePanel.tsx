import { useState, useEffect } from "react";
import { StorageTypeSelector } from "./external/StorageTypeSelector";
import { CapacitySlider } from "./external/CapacitySlider";
import { StorageSpecs } from "./external/StorageSpecs";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { useWizard } from "@/contexts/WizardContext";

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
  const { handleRemoveComponent } = useWizard();

  const calculatePrice = () => {
    if (!storageType) return 0;
    return capacityGB * STORAGE_TYPES[storageType].pricePerGB;
  };

  useEffect(() => {
    if (storageType && onSelectStorage) {
      const price = calculatePrice();
      onSelectStorage(STORAGE_TYPES[storageType].name, capacityGB, price);
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
          storageTypes={STORAGE_TYPES}
          selectedType={storageType}
          onTypeChange={(value: keyof typeof STORAGE_TYPES) => setStorageType(value)}
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
            iops={STORAGE_TYPES[storageType].iops}
            throughput={STORAGE_TYPES[storageType].throughput}
            price={calculatePrice()}
          />
        </div>
      )}
    </div>
  );
}
