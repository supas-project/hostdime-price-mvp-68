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
import { useComponentOptions } from "@/hooks/use-component-options";

interface MemoryPanelProps {
  selectedOption?: ComponentOption | null;
  onSelectOption?: (option: ComponentOption) => void;
}

export function MemoryPanel({ 
  selectedOption: propSelectedOption,
  onSelectOption
}: MemoryPanelProps) {
  const { options: memoryOptions } = useComponentOptions('memory');
  const [selectedType, setSelectedType] = useState<string>('');
  const [capacity, setCapacity] = useState<number>(64);
  const [currentSelectedOption, setCurrentSelectedOption] = useState<ComponentOption | null>(null);

  // Debug log
  useEffect(() => {
    console.log("[MemoryPanel] Component mounted with memoryOptions:", memoryOptions);
    console.log("[MemoryPanel] Available options count:", memoryOptions.length);
  }, [memoryOptions]);

  // Initialize with prop or first available option
  useEffect(() => {
    if (propSelectedOption) {
      setCurrentSelectedOption(propSelectedOption);
      setSelectedType(propSelectedOption.id);
      
      // Extract capacity from the option name if possible
      const capacityMatch = propSelectedOption.name.match(/(\d+)GB/i);
      if (capacityMatch) {
        setCapacity(parseInt(capacityMatch[1]));
      }
      
      console.log("[MemoryPanel] Initialized with prop option:", propSelectedOption);
    } else if (memoryOptions.length > 0 && !currentSelectedOption) {
      const firstOption = memoryOptions[0];
      setCurrentSelectedOption(firstOption);
      setSelectedType(firstOption.id);
      
      // Extract capacity from the option name if possible
      const capacityMatch = firstOption.name.match(/(\d+)GB/i);
      if (capacityMatch) {
        setCapacity(parseInt(capacityMatch[1]));
      }
      
      console.log("[MemoryPanel] Initialized with first option:", firstOption);
    }
  }, [memoryOptions, propSelectedOption]);

  // Update selected option when type or capacity changes
  useEffect(() => {
    if (memoryOptions.length > 0) {
      // Find the best matching option based on capacity
      const matchingOption = memoryOptions.find(option => {
        const optionCapacityMatch = option.name.match(/(\d+)GB/i);
        if (optionCapacityMatch) {
          const optionCapacity = parseInt(optionCapacityMatch[1]);
          return optionCapacity === capacity;
        }
        return false;
      });

      if (matchingOption) {
        setCurrentSelectedOption(matchingOption);
        setSelectedType(matchingOption.id);
        console.log("[MemoryPanel] Found matching option:", matchingOption);
      } else if (memoryOptions.length > 0) {
        // Fallback to first option if no exact match
        const fallbackOption = memoryOptions[0];
        setCurrentSelectedOption(fallbackOption);
        setSelectedType(fallbackOption.id);
        console.log("[MemoryPanel] Using fallback option:", fallbackOption);
      }
    }
  }, [capacity, memoryOptions]);

  // Create memory types from available options
  const memoryTypes = memoryOptions.reduce((types, option) => {
    const capacityMatch = option.name.match(/(\d+)GB/i);
    const baseCapacity = capacityMatch ? parseInt(capacityMatch[1]) : 64;
    
    types[option.id] = {
      name: option.name,
      pricePerGB: option.price / baseCapacity,
      frequency: option.specs?.[0]?.includes('DDR') ? option.specs[0] : "DDR4 2400MHz",
      type: option.specs?.[0]?.includes('DDR5') ? "DDR5" : "DDR4",
      description: option.description
    };
    
    return types;
  }, {} as { [key: string]: { name: string; pricePerGB: number; frequency: string; type: string; description: string; } });

  // Handle the add memory button click
  const handleAddMemory = () => {
    if (!currentSelectedOption) {
      console.error('[MemoryPanel] Cannot add memory - no option selected');
      return;
    }
    
    if (onSelectOption) {
      console.log("[MemoryPanel] Selecting memory option:", currentSelectedOption);
      onSelectOption(currentSelectedOption);
    }
  };

  // Get selected type details
  const selectedTypeDetails = selectedType && memoryTypes[selectedType] ? memoryTypes[selectedType] : null;
  const totalPrice = currentSelectedOption?.price || 0;

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
        {Object.keys(memoryTypes).length > 0 && (
          <MemoryTypeSelector
            memoryTypes={memoryTypes}
            selectedType={selectedType}
            onTypeChange={(newType) => {
              setSelectedType(newType);
              const option = memoryOptions.find(opt => opt.id === newType);
              if (option) {
                setCurrentSelectedOption(option);
                // Extract capacity from selected option
                const capacityMatch = option.name.match(/(\d+)GB/i);
                if (capacityMatch) {
                  setCapacity(parseInt(capacityMatch[1]));
                }
              }
            }}
          />
        )}
        
        {/* Capacity Selector - ajustado para ir até 2TB */}
        <MemoryCapacitySelector 
          capacity={capacity} 
          onCapacityChange={(newCapacity) => {
            setCapacity(newCapacity);
            // Try to find an option that matches the new capacity
            const matchingOption = memoryOptions.find(option => {
              const optionCapacityMatch = option.name.match(/(\d+)GB/i);
              if (optionCapacityMatch) {
                const optionCapacity = parseInt(optionCapacityMatch[1]);
                return optionCapacity === newCapacity;
              }
              return false;
            });
            
            if (matchingOption) {
              setCurrentSelectedOption(matchingOption);
              setSelectedType(matchingOption.id);
            }
          }}
          min={8}
          max={2048}
          step={8}
        />
        
        {selectedTypeDetails && currentSelectedOption && (
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
              disabled={!currentSelectedOption}
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
