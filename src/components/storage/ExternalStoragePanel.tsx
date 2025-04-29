
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StorageTier } from "@/types/storage";
import { formatCurrency } from "@/lib/utils";
import { CapacitySlider } from "./external/CapacitySlider";
import { StorageTypeSelector } from "./external/StorageTypeSelector";
import { StorageSpecs } from "./external/StorageSpecs";
import { HardDrive, ArrowUp, ArrowDown } from "lucide-react";
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
  const [capacity, setCapacity] = useState<number>(500); // Default to middle option
  const [selectedTypeDetails, setSelectedTypeDetails] = useState(availableStorageTypes[selectedType]);
  const [showAdvanced, setShowAdvanced] = useState(false);

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

  // Example storage use cases to help users understand capacity needs
  const storageExamples = [
    { size: "100 GB", examples: ["~25.000 fotos", "~30 horas de vídeo HD"] },
    { size: "500 GB", examples: ["~125.000 fotos", "~150 horas de vídeo HD"] },
    { size: "1 TB", examples: ["~250.000 fotos", "~300 horas de vídeo HD"] },
  ];

  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2">
          <HardDrive className="h-5 w-5 text-primary" />
          Storage Externo
        </CardTitle>
        <CardDescription>
          Armazenamento adicional para dados, backups e arquivos
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Storage Type Selector */}
        <StorageTypeSelector
          storageTypes={availableStorageTypes}
          selectedType={selectedType}
          onTypeChange={setSelectedType}
        />
        
        {/* Show simple type comparison when not expanded */}
        {!showAdvanced && (
          <div className="grid grid-cols-3 gap-3 mt-2">
            {Object.entries(availableStorageTypes).map(([key, type]) => (
              <div 
                key={key}
                onClick={() => setSelectedType(key)}
                className={cn(
                  "cursor-pointer p-3 rounded-lg border transition-all text-center",
                  selectedType === key 
                    ? "border-primary bg-primary/10" 
                    : "border-border hover:border-primary/30 hover:bg-primary/5"
                )}
              >
                <div className="font-medium text-sm mb-1">{type.name}</div>
                <div className="text-xs text-muted-foreground">R$ {type.pricePerGB.toFixed(2)}/GB</div>
              </div>
            ))}
          </div>
        )}
        
        {/* Storage Specs */}
        {showAdvanced && (
          <StorageSpecs 
            iops={selectedTypeDetails.iops}
            throughput={selectedTypeDetails.throughput}
            price={calculatePrice()}
            description={selectedTypeDetails.description}
            storageType={selectedTypeDetails.name}
          />
        )}
        
        {/* Advanced toggle */}
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="w-full flex items-center gap-2 text-xs"
        >
          {showAdvanced ? (
            <>
              <ArrowUp className="h-4 w-4" />
              Menos detalhes
            </>
          ) : (
            <>
              <ArrowDown className="h-4 w-4" />
              Mais detalhes
            </>
          )}
        </Button>
        
        {/* Capacity Slider */}
        <CapacitySlider capacity={capacity} onCapacityChange={setCapacity} />
        
        {/* Storage usage examples */}
        <div className="bg-muted/30 p-3 rounded-lg text-xs">
          <div className="flex items-center gap-1 mb-2 text-muted-foreground">
            <HelpTooltip
              title="Exemplos de capacidade"
              description="Estes exemplos ajudam a entender quanto espaço você pode precisar baseado em diferentes tipos de uso."
            />
            <span>O que cabe em cada tamanho:</span>
          </div>
          <div className="grid grid-cols-1 gap-2">
            {storageExamples.map((example) => (
              <div key={example.size} className="flex items-center gap-2">
                <div className="font-medium">{example.size}:</div>
                <div className="text-muted-foreground">{example.examples.join(" ou ")}</div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Price and Add Button */}
        <div className="pt-4 border-t border-border flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Preço mensal</p>
            <p className="text-2xl font-semibold text-primary">{formatCurrency(calculatePrice())}</p>
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
