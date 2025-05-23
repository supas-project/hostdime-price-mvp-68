
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
  // CORREÇÃO: Remover valores padrão estáticos para forçar uso da tabela de preços
  const availableStorageTypes = storageTypes;
  
  // Verificar se temos tipos de storage válidos carregados da tabela
  const hasValidStorageTypes = Object.keys(availableStorageTypes).length > 0;
  
  const [selectedType, setSelectedType] = useState<string>(
    hasValidStorageTypes ? Object.keys(availableStorageTypes)[0] : ''
  );
  const [capacity, setCapacity] = useState<number>(100);
  const [selectedTypeDetails, setSelectedTypeDetails] = useState(
    hasValidStorageTypes ? availableStorageTypes[selectedType] : null
  );
  const [totalPrice, setTotalPrice] = useState<number>(0);

  // Update selected type details when type changes
  useEffect(() => {
    if (hasValidStorageTypes && availableStorageTypes[selectedType]) {
      setSelectedTypeDetails(availableStorageTypes[selectedType]);
      
      // Calcular preço total usando valores REAIS da tabela de preços
      const pricePerGB = availableStorageTypes[selectedType].pricePerGB || 0;
      const newPrice = pricePerGB * capacity;
      setTotalPrice(newPrice);
      
      console.log(`[ExternalStoragePanel] REAL PRICE - Type: ${selectedType}, Price per GB from table: ${pricePerGB}, Capacity: ${capacity}GB, Total: ${newPrice}`);
    } else {
      console.error('[ExternalStoragePanel] No valid storage types loaded from price table');
      setSelectedTypeDetails(null);
      setTotalPrice(0);
    }
  }, [selectedType, availableStorageTypes, capacity, hasValidStorageTypes]);

  // Atualiza o preço quando a capacidade muda
  useEffect(() => {
    if (selectedTypeDetails && selectedTypeDetails.pricePerGB) {
      const pricePerGB = selectedTypeDetails.pricePerGB;
      const newPrice = pricePerGB * capacity;
      setTotalPrice(newPrice);
      
      console.log(`[ExternalStoragePanel] REAL PRICE - Capacity changed: ${capacity}GB, Price per GB from table: ${pricePerGB}, Total: ${newPrice}`);
    }
  }, [capacity, selectedTypeDetails]);

  // Handle the add storage button click
  const handleAddStorage = () => {
    if (!selectedTypeDetails || !selectedTypeDetails.pricePerGB) {
      console.error('[ExternalStoragePanel] Cannot add storage - no valid type selected or no price data');
      return;
    }
    
    // Usar o preço REAL da tabela de preços
    const pricePerGB = selectedTypeDetails.pricePerGB;
    const finalPrice = pricePerGB * capacity;
    
    console.log(`[ExternalStoragePanel] REAL PRICE - Adding storage: ${selectedTypeDetails.name}, ${capacity}GB, Real price per GB: ${pricePerGB}, Total: ${finalPrice}`);
    
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

  // CORREÇÃO: Se não temos dados válidos da tabela, mostrar mensagem informativa
  if (!hasValidStorageTypes) {
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
          <div className="p-6 border border-dashed rounded-lg text-center text-muted-foreground">
            <p className="text-sm">Nenhum tipo de storage externo configurado.</p>
            <p className="text-xs mt-2">Configure os tipos de storage na Tabela de Preços, categoria "Storage Externo".</p>
          </div>
        </CardContent>
      </Card>
    );
  }

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
        
        {/* Storage Specs - só mostra se temos dados válidos */}
        {selectedTypeDetails && (
          <StorageSpecs 
            iops={selectedTypeDetails.iops}
            throughput={selectedTypeDetails.throughput}
            price={totalPrice}
            description={selectedTypeDetails.description}
            storageType={selectedTypeDetails.name}
            pricePerGB={selectedTypeDetails.pricePerGB}
          />
        )}
        
        {/* Price and Add Button */}
        <div className="pt-4 border-t border-border">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-muted-foreground">Preço mensal total</p>
              <p className="text-2xl font-bold text-primary">{formatCurrency(totalPrice)}</p>
              {selectedTypeDetails && (
                <p className="text-xs text-muted-foreground mt-1">
                  {formatCurrency(selectedTypeDetails.pricePerGB)}/GB × {capacity}GB
                </p>
              )}
            </div>
            <Button 
              onClick={handleAddStorage}
              className="gap-2 min-w-[140px]"
              size="default"
              disabled={!selectedTypeDetails}
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
