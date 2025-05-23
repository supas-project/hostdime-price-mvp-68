
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StorageTier } from "@/types/storage";
import { formatCurrency } from "@/lib/utils";
import { CapacitySlider } from "./CapacitySlider";
import { StorageTypeSelector } from "./StorageTypeSelector";
import { StorageSpecs } from "./StorageSpecs";
import { HardDrive, Plus } from "lucide-react";
import { HelpTooltip } from "@/components/help-tooltip";
import { cn } from "@/lib/utils";

interface ExternalStoragePanelProps {
  onSelect?: (option: StorageTier) => void;
  selectedTier?: string;
  onSelectStorage?: (type: string, capacity: number, price: number) => void;
  storageTypes?: {
    [key: string]: { 
      name: string;
      pricePerGB: number;
      iops: string;
      throughput: string;
      description: string;
      throughputAdd?: number;
      maxThroughput?: string;
    }
  };
}

export function ExternalStoragePanel({ 
  onSelect, 
  selectedTier,
  onSelectStorage,
  storageTypes = {}
}: ExternalStoragePanelProps) {
  // Default storage types if none provided through props
  const defaultStorageTypes = {
    standard: { 
      name: "Standard Block Storage", 
      pricePerGB: 0.80, 
      iops: "3.000", 
      throughput: "125 MB/s",
      description: "Solução econômica para armazenamento geral e backups"
    },
    performance: { 
      name: "Performance Block Storage", 
      pricePerGB: 0.95, 
      iops: "6.000", 
      throughput: "250 MB/s",
      description: "Desempenho equilibrado para aplicações de produção"
    },
    premium: { 
      name: "Premium Block Storage", 
      pricePerGB: 1.20, 
      iops: "16.000", 
      throughput: "500 MB/s",
      description: "Alta performance para aplicações críticas e intensivas"
    }
  };
  
  // Use provided storage types or defaults
  const availableStorageTypes = Object.keys(storageTypes).length > 0 ? storageTypes : defaultStorageTypes;
  
  const [selectedType, setSelectedType] = useState<string>(Object.keys(availableStorageTypes)[0]);
  const [capacity, setCapacity] = useState<number>(100);
  const [selectedTypeDetails, setSelectedTypeDetails] = useState(availableStorageTypes[selectedType]);
  const [totalPrice, setTotalPrice] = useState<number>(0);

  // Update selected type details when type changes
  useEffect(() => {
    if (availableStorageTypes[selectedType]) {
      setSelectedTypeDetails(availableStorageTypes[selectedType]);
      
      // Calcular preço total (capacidade em GB × preço por GB)
      const pricePerGB = availableStorageTypes[selectedType].pricePerGB || 0;
      const newPrice = capacity * pricePerGB;
      setTotalPrice(newPrice);
      
      console.log(`[ExternalStoragePanel] Type changed: ${selectedType}, price per GB: ${pricePerGB}, capacity: ${capacity}GB, total: ${newPrice}`);
    }
  }, [selectedType, availableStorageTypes, capacity]);

  // Atualiza o preço quando a capacidade muda
  useEffect(() => {
    const pricePerGB = selectedTypeDetails?.pricePerGB || 0;
    const newPrice = capacity * pricePerGB;
    setTotalPrice(newPrice);
    
    console.log(`[ExternalStoragePanel] Capacity changed: ${capacity}GB, price per GB: ${pricePerGB}, total: ${newPrice}`);
  }, [capacity, selectedTypeDetails]);

  // Handle the add storage button click
  const handleAddStorage = () => {
    const pricePerGB = selectedTypeDetails?.pricePerGB || 0;
    const finalPrice = capacity * pricePerGB; // capacidade em GB × preço por GB
    
    console.log(`[ExternalStoragePanel] Adding storage: ${selectedTypeDetails.name}, ${capacity}GB, Price per GB: ${pricePerGB}, Total: ${finalPrice}`);
    
    if (onSelectStorage) {
      onSelectStorage(selectedTypeDetails.name, capacity, finalPrice);
    }
    
    if (onSelect) {
      const tier: StorageTier = {
        name: `${selectedTypeDetails.name} ${capacity >= 1024 ? `${(capacity/1024).toFixed(1)}TB` : `${capacity}GB`}`,
        price: finalPrice,
        iops: selectedTypeDetails.iops,
        throughput: selectedTypeDetails.throughput,
        description: selectedTypeDetails.description
      };
      onSelect(tier);
    }
  };

  return (
    <Card className={cn(
      "w-full border-[#2a2a2a]",
      "shadow-md hover:shadow-lg transition-shadow duration-300"
    )}>
      <CardHeader className="pb-3 pt-4 px-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <HardDrive className="h-5 w-5 text-primary" />
          Storage Externo
          <HelpTooltip
            title="Storage Externo"
            description="Adicione armazenamento externo escalável ao seu servidor com diferentes níveis de performance."
          />
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 pt-2 px-4">
        {/* Storage Type Selector */}
        <StorageTypeSelector
          storageTypes={availableStorageTypes}
          selectedType={selectedType}
          onTypeChange={setSelectedType}
        />
        
        {/* Capacity Slider */}
        <CapacitySlider capacity={capacity} onCapacityChange={setCapacity} />
        
        {/* Storage Specs */}
        <StorageSpecs 
          iops={selectedTypeDetails.iops}
          throughput={selectedTypeDetails.throughput}
          price={totalPrice}
          description={selectedTypeDetails.description}
          storageType={selectedTypeDetails.name}
          pricePerGB={selectedTypeDetails.pricePerGB}
        />
        
        {/* Price and Add Button */}
        <div className="pt-4 border-t border-border">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-muted-foreground">Preço mensal total</p>
              <p className="text-2xl font-bold text-primary">{formatCurrency(totalPrice)}</p>
            </div>
            <Button 
              onClick={handleAddStorage}
              className="gap-2 min-w-[140px]"
              size="default"
            >
              <Plus className="h-4 w-4" />
              Adicionar
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
