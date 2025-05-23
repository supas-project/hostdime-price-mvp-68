
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
      name: "Standard", 
      pricePerGB: 0.80, 
      iops: "Até 3.000 IOPS", 
      throughput: "125 MB/s",
      description: "Econômico para armazenamento geral e backups"
    },
    performance: { 
      name: "Performance", 
      pricePerGB: 0.95, 
      iops: "Até 6.000 IOPS", 
      throughput: "250 MB/s",
      description: "Recomendado para sites e aplicações de média demanda"
    },
    premium: { 
      name: "Premium", 
      pricePerGB: 1.20, 
      iops: "Até 16.000 IOPS", 
      throughput: "500 MB/s",
      description: "Para aplicações intensivas que precisam de alta velocidade"
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
      
      // Atualiza o preço total quando o tipo muda
      const newPrice = calculatePrice(availableStorageTypes[selectedType].pricePerGB, capacity);
      setTotalPrice(newPrice);
    }
  }, [selectedType, availableStorageTypes]);

  // Atualiza o preço quando a capacidade muda
  useEffect(() => {
    const newPrice = calculatePrice(selectedTypeDetails?.pricePerGB, capacity);
    setTotalPrice(newPrice);
  }, [capacity, selectedTypeDetails]);

  // Calcular o preço total multiplicando o preço por GB pela capacidade selecionada
  const calculatePrice = (pricePerGB: number = 0, storageCapacity: number = 0): number => {
    if (typeof pricePerGB !== 'number' || isNaN(pricePerGB)) {
      console.error('[ExternalStoragePanel] Preço por GB inválido:', pricePerGB);
      return 0;
    }
    
    const calculatedPrice = pricePerGB * storageCapacity;
    console.log(`[ExternalStoragePanel] PRICE CALCULATION: ${pricePerGB} × ${storageCapacity} = ${calculatedPrice}`);
    return calculatedPrice;
  };

  // Handle the add storage button click
  const handleAddStorage = () => {
    console.log(`[ExternalStoragePanel] Adding storage: ${selectedTypeDetails.name}, ${capacity}GB, Price per GB: ${selectedTypeDetails.pricePerGB}, Total: ${totalPrice}`);
    
    if (onSelectStorage) {
      // Enviar o preço total calculado (preço por GB × capacidade)
      onSelectStorage(selectedTypeDetails.name, capacity, totalPrice);
    }
    
    if (onSelect) {
      const tier: StorageTier = {
        name: `${selectedTypeDetails.name} ${capacity}GB`,
        price: totalPrice,
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
      <CardHeader className="pb-2 pt-3 px-3 sm:pb-2 sm:pt-4 sm:px-4">
        <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
          <HardDrive className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
          Storage Externo
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 sm:space-y-5 pt-2 px-3 sm:pt-2 sm:px-4">
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
          price={totalPrice}
          description={selectedTypeDetails.description}
          storageType={selectedTypeDetails.name}
          pricePerGB={selectedTypeDetails.pricePerGB}
        />
        
        {/* Capacity Slider */}
        <CapacitySlider capacity={capacity} onCapacityChange={setCapacity} />
        
        {/* Price and Add Button */}
        <div className="pt-3 border-t border-border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <p className="text-xs sm:text-sm text-muted-foreground">Preço mensal</p>
            <p className="text-lg sm:text-xl font-semibold text-primary">{formatCurrency(totalPrice)}</p>
          </div>
          <Button 
            onClick={handleAddStorage}
            className="gap-2 w-full sm:w-auto"
            size="sm"
          >
            <HardDrive className="h-4 w-4" />
            <span className="whitespace-nowrap">Adicionar ao Servidor</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
