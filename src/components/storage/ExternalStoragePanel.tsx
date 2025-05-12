import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StorageTier } from "@/types/storage";
import { formatCurrency } from "@/lib/utils";
import { CapacitySlider } from "./external/CapacitySlider";
import { StorageTypeSelector } from "./external/StorageTypeSelector";
import { StorageSpecs } from "./external/StorageSpecs";
import { HardDrive } from "lucide-react";
import { HelpTooltip } from "@/components/help-tooltip";
import { StorageType } from "./types";

interface ExternalStoragePanelProps {
  onSelect?: (option: StorageTier) => void;
  selectedTier?: string;
  onSelectStorage?: (type: string, capacity: number, price: number) => void;
  storageTypes?: {
    [key: string]: StorageType
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
      name: "Standard", 
      pricePerGB: 0.30, 
      iops: "Até 3.000 IOPS", 
      throughput: "125 MB/s",
      description: "Econômico para armazenamento geral e backups"
    },
    performance: { 
      name: "Performance", 
      pricePerGB: 0.45, 
      iops: "Até 6.000 IOPS", 
      throughput: "250 MB/s",
      description: "Recomendado para sites e aplicações de média demanda"
    },
    premium: { 
      name: "Premium", 
      pricePerGB: 0.60, 
      iops: "Até 16.000 IOPS", 
      throughput: "500 MB/s",
      description: "Para aplicações intensivas que precisam de alta velocidade"
    }
  };
  
  // Use provided storage types or defaults
  const availableStorageTypes = Object.keys(storageTypes).length > 0 ? storageTypes : defaultStorageTypes;
  
  const [selectedType, setSelectedType] = useState<string>(Object.keys(availableStorageTypes)[0]);
  const [capacity, setCapacity] = useState<number>(500);
  const [selectedTypeDetails, setSelectedTypeDetails] = useState(availableStorageTypes[selectedType]);

  // Update selected type details when type changes
  useEffect(() => {
    if (availableStorageTypes[selectedType]) {
      setSelectedTypeDetails(availableStorageTypes[selectedType]);
    }
  }, [selectedType, availableStorageTypes]);

  // Calculate price based on capacity and price per GB
  const calculatePrice = () => {
    return (selectedTypeDetails.pricePerGB * capacity);
  };

  // Handle the add storage button click
  const handleAddStorage = () => {
    if (onSelectStorage) {
      onSelectStorage(selectedTypeDetails.name, capacity, calculatePrice());
    }
    
    if (onSelect) {
      const tier: StorageTier = {
        name: `${selectedTypeDetails.name} ${capacity}GB`,
        price: calculatePrice(),
        iops: selectedTypeDetails.iops,
        throughput: selectedTypeDetails.throughput,
        description: selectedTypeDetails.description
      };
      onSelect(tier);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <HardDrive className="h-5 w-5 text-primary" />
          Storage Externo
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Storage Type Selector */}
        <StorageTypeSelector
          storageTypes={availableStorageTypes}
          selectedType={selectedType}
          onTypeChange={setSelectedType}
        />
        
        {/* Storage Specs */}
        <StorageSpecs 
          iops={selectedTypeDetails.iops}
          throughput={selectedTypeDetails.throughput}
          price={calculatePrice()}
          description={selectedTypeDetails.description}
          storageType={selectedTypeDetails.name}
        />
        
        {/* Capacity Slider */}
        <CapacitySlider capacity={capacity} onCapacityChange={setCapacity} />
        
        {/* Price and Add Button */}
        <div className="pt-3 border-t border-border flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Preço mensal</p>
            <p className="text-xl font-semibold text-primary">{formatCurrency(calculatePrice())}</p>
          </div>
          <Button 
            onClick={handleAddStorage}
            className="gap-2"
          >
            <HardDrive className="h-4 w-4" />
            Adicionar ao Servidor
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
