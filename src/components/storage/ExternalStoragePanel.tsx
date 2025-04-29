
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StorageTier } from "@/types/storage";
import { formatCurrency } from "@/lib/utils";
import { CapacitySlider } from "./external/CapacitySlider";
import { StorageTypeSelector } from "./external/StorageTypeSelector";
import { HardDrive, BarChart3, Zap } from "lucide-react";
import { HelpTooltip } from "@/components/help-tooltip";

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
      description: "Ideal para armazenamento geral e backups"
    },
    performance: { 
      name: "Performance", 
      pricePerGB: 0.45, 
      iops: "Até 6.000 IOPS", 
      throughput: "250 MB/s",
      description: "Recomendado para bancos de dados e aplicações de média demanda"
    },
    premium: { 
      name: "Premium", 
      pricePerGB: 0.60, 
      iops: "Até 16.000 IOPS", 
      throughput: "500 MB/s",
      description: "Para cargas de trabalho intensivas e aplicações críticas"
    }
  };
  
  // Use provided storage types or defaults
  const availableStorageTypes = Object.keys(storageTypes).length > 0 ? storageTypes : defaultStorageTypes;
  
  const [selectedType, setSelectedType] = useState<string>(Object.keys(availableStorageTypes)[0]);
  const [capacity, setCapacity] = useState<number>(100);
  const [selectedTypeDetails, setSelectedTypeDetails] = useState(availableStorageTypes[selectedType]);

  // Get badge variant based on storage type
  const getBadgeVariant = (type: string): "default" | "secondary" | "outline" | "success" | "warning" | "info" => {
    switch (type.toLowerCase()) {
      case 'standard': return "info";
      case 'performance': return "warning";
      case 'premium': return "success";
      default: return "secondary";
    }
  };

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

  // Define quick capacity options
  const quickCapacityOptions = [100, 500, 1000, 2000];

  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2">
          <HardDrive className="h-5 w-5 text-primary" />
          Armazenamento Externo
        </CardTitle>
        <CardDescription>
          Configure o tipo e tamanho do seu storage externo
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Storage Type Selector */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">Tipo de Storage</label>
            <HelpTooltip
              title="Tipos de Storage"
              description="Escolha o tipo de storage ideal para sua aplicação, considerando performance e preço."
            />
          </div>
          <StorageTypeSelector
            storageTypes={availableStorageTypes}
            selectedType={selectedType}
            onTypeChange={setSelectedType}
          />
        </div>
        
        {/* Storage Specs */}
        <div className="grid grid-cols-2 gap-4 p-4 bg-muted/30 rounded-lg">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Zap className="h-4 w-4" /> IOPS
            </div>
            <p className="font-medium">{selectedTypeDetails.iops}</p>
          </div>
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <BarChart3 className="h-4 w-4" /> Throughput
            </div>
            <p className="font-medium">{selectedTypeDetails.throughput}</p>
          </div>
          <div className="col-span-2 mt-2 text-sm">
            <Badge variant={getBadgeVariant(selectedType)} className="mb-2">
              {selectedTypeDetails.name}
            </Badge>
            <p className="text-muted-foreground">{selectedTypeDetails.description}</p>
          </div>
        </div>
        
        {/* Capacity Slider */}
        <CapacitySlider capacity={capacity} onCapacityChange={setCapacity} />
        
        {/* Quick Capacity Options */}
        <div className="grid grid-cols-4 gap-2 pt-2">
          {quickCapacityOptions.map((option) => (
            <Button 
              key={option}
              variant="outline" 
              size="sm"
              className={`transition-all ${capacity === option ? 'border-primary text-primary' : ''}`}
              onClick={() => setCapacity(option)}
            >
              {option} GB
            </Button>
          ))}
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
