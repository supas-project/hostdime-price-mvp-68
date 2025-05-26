
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ComponentOption } from "@/types/component";
import { formatCurrency } from "@/lib/utils";
import { MemoryCapacitySelector } from "./MemoryCapacitySelector";
import { MemoryTypeSelector } from "./MemoryTypeSelector";
import { MemorySpecs } from "./MemorySpecs";
import { MemoryStick, Plus } from "lucide-react";
import { HelpTooltip } from "@/components/help-tooltip";
import { cn } from "@/lib/utils";

interface MemoryPanelProps {
  selectedOption?: ComponentOption | null;
  onSelectOption?: (option: ComponentOption) => void;
  memoryTypes?: {
    [key: string]: { 
      name: string;
      pricePerGB: number;
      frequency: string;
      type: string;
      description: string;
    }
  };
}

export function MemoryPanel({ 
  selectedOption,
  onSelectOption,
  memoryTypes = {
    "ddr4-standard": {
      name: "DDR4 Standard",
      pricePerGB: 7.5,
      frequency: "2400MHz",
      type: "DDR4",
      description: "Memória DDR4 padrão com boa relação custo-benefício para aplicações gerais."
    },
    "ddr4-performance": {
      name: "DDR4 Performance", 
      pricePerGB: 9.0,
      frequency: "3200MHz",
      type: "DDR4",
      description: "Memória DDR4 de alta performance para aplicações que exigem maior velocidade."
    },
    "ddr5-standard": {
      name: "DDR5 Standard",
      pricePerGB: 12.0,
      frequency: "4800MHz", 
      type: "DDR5",
      description: "Nova geração DDR5 com maior velocidade e eficiência energética."
    },
    "ddr5-performance": {
      name: "DDR5 Performance",
      pricePerGB: 15.0,
      frequency: "6400MHz",
      type: "DDR5", 
      description: "DDR5 de alta performance para aplicações que exigem máxima velocidade."
    }
  }
}: MemoryPanelProps) {
  // Verificar se temos tipos de memória válidos
  const hasValidMemoryTypes = Object.keys(memoryTypes).length > 0;
  
  const [selectedType, setSelectedType] = useState<string>(
    hasValidMemoryTypes ? Object.keys(memoryTypes)[0] : ''
  );
  const [capacity, setCapacity] = useState<number>(64);
  const [selectedTypeDetails, setSelectedTypeDetails] = useState(
    hasValidMemoryTypes ? memoryTypes[selectedType] : null
  );
  const [totalPrice, setTotalPrice] = useState<number>(0);

  // Debug log
  useEffect(() => {
    console.log("[MemoryPanel] Component mounted with memoryTypes:", memoryTypes);
    console.log("[MemoryPanel] hasValidMemoryTypes:", hasValidMemoryTypes);
  }, []);

  // Update selected type details when type changes
  useEffect(() => {
    if (hasValidMemoryTypes && memoryTypes[selectedType]) {
      setSelectedTypeDetails(memoryTypes[selectedType]);
      
      // Calcular preço total usando valores da configuração
      const pricePerGB = memoryTypes[selectedType].pricePerGB || 0;
      const newPrice = pricePerGB * capacity;
      setTotalPrice(newPrice);
      console.log("[MemoryPanel] Updated type details:", memoryTypes[selectedType]);
    } else {
      setSelectedTypeDetails(null);
      setTotalPrice(0);
    }
  }, [selectedType, memoryTypes, capacity, hasValidMemoryTypes]);

  // Atualiza o preço quando a capacidade muda
  useEffect(() => {
    if (selectedTypeDetails && selectedTypeDetails.pricePerGB) {
      const pricePerGB = selectedTypeDetails.pricePerGB;
      const newPrice = pricePerGB * capacity;
      setTotalPrice(newPrice);
      console.log("[MemoryPanel] Updated price:", newPrice, "for capacity:", capacity);
    }
  }, [capacity, selectedTypeDetails]);

  // Handle the add memory button click
  const handleAddMemory = () => {
    if (!selectedTypeDetails || !selectedTypeDetails.pricePerGB) {
      console.error('[MemoryPanel] Cannot add memory - no valid type selected or no price data');
      return;
    }
    
    const pricePerGB = selectedTypeDetails.pricePerGB;
    const finalPrice = pricePerGB * capacity;
    
    if (onSelectOption) {
      const memoryOption: ComponentOption = {
        id: `memory-${selectedType}-${capacity}gb`,
        name: `${selectedTypeDetails.name} ${capacity}GB`,
        description: selectedTypeDetails.description,
        price: finalPrice,
        type: 'memoria',
        isHardware: true,
        specs: [
          `Capacidade: ${capacity}GB`,
          `Tipo: ${selectedTypeDetails.type}`,
          `Frequência: ${selectedTypeDetails.frequency}`
        ]
      };
      console.log("[MemoryPanel] Selecting memory option:", memoryOption);
      onSelectOption(memoryOption);
    }
  };

  return (
    <Card className={cn(
      "w-full border-[#2a2a2a] bg-[#1e1e1e]",
      "shadow-md hover:shadow-lg transition-shadow duration-300"
    )}>
      <CardHeader className="pb-3 pt-4 px-4">
        <CardTitle className="flex items-center gap-2 text-lg text-white">
          <MemoryStick className="h-5 w-5 text-[#f58220]" />
          Configuração de Memória RAM
          <HelpTooltip
            title="Memória RAM"
            description="Configure a quantidade e tipo de memória RAM necessária para seu servidor."
          />
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 pt-2 px-4">
        {/* Memory Type Selector */}
        <MemoryTypeSelector
          memoryTypes={memoryTypes}
          selectedType={selectedType}
          onTypeChange={setSelectedType}
        />
        
        {/* Capacity Selector */}
        <MemoryCapacitySelector 
          capacity={capacity} 
          onCapacityChange={setCapacity}
          min={8}
          max={512}
          step={8}
        />
        
        {/* Memory Specs */}
        {selectedTypeDetails && (
          <MemorySpecs 
            frequency={selectedTypeDetails.frequency}
            type={selectedTypeDetails.type}
            price={totalPrice}
            description={selectedTypeDetails.description}
            memoryType={selectedTypeDetails.name}
            pricePerGB={selectedTypeDetails.pricePerGB}
          />
        )}
        
        {/* Price and Add Button */}
        <div className="pt-4 border-t border-[#2a2a2a]">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-muted-foreground">Preço mensal total</p>
              <p className="text-2xl font-bold text-[#f58220]">{formatCurrency(totalPrice)}</p>
              {selectedTypeDetails && (
                <p className="text-xs text-muted-foreground mt-1">
                  {formatCurrency(selectedTypeDetails.pricePerGB)}/GB × {capacity}GB
                </p>
              )}
            </div>
            <Button 
              onClick={handleAddMemory}
              className="gap-2 min-w-[140px] bg-[#f58220] hover:bg-[#e07420] text-white"
              size="default"
              disabled={!selectedTypeDetails}
            >
              <Plus className="h-4 w-4" />
              Selecionar
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
