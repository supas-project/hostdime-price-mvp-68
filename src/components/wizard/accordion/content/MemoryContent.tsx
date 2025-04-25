
import { ComponentOption } from "@/types/component";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { formatCurrency } from "@/lib/utils";
import { HelpTooltip } from "@/components/help-tooltip";
import { useEffect } from "react";

interface MemoryContentProps {
  selectedOption: ComponentOption | null;
  onSelectOption: (option: ComponentOption) => void;
}

export function MemoryContent({ selectedOption, onSelectOption }: MemoryContentProps) {
  const memoryValues = [64, 128, 256, 512, 768, 1024];
  const pricePerGB = 7.5;
  
  const getMemorySpecs = (memorySize: number) => {
    const baseSpecs = {
      type: "DDR4 ECC Registered",
      speed: "3200 MHz",
      channels: "Quad Channel",
      ecc: "Error Correction Code (ECC)",
    };

    // Customização baseada no tamanho
    if (memorySize >= 512) {
      baseSpecs.type = "DDR4 ECC Load Reduced DIMM";
      baseSpecs.speed = "3200 MHz";
    }

    return baseSpecs;
  };

  const createMemoryOption = (memorySize: number): ComponentOption => {
    const specs = getMemorySpecs(memorySize);
    return {
      id: `memory-${memorySize}`,
      type: "memoria",
      name: `${memorySize}GB RAM`,
      description: `Memória RAM ${specs.type} ${memorySize}GB`,
      price: memorySize * pricePerGB,
      specs: [
        `${memorySize}GB Total`,
        `Tipo: ${specs.type}`,
        `Velocidade: ${specs.speed}`,
        `${specs.channels}`,
        specs.ecc
      ]
    };
  };

  useEffect(() => {
    if (!selectedOption) {
      const defaultOption = createMemoryOption(64);
      onSelectOption(defaultOption);
    }
  }, []);

  const currentValue = selectedOption?.name 
    ? parseInt(selectedOption.name.replace(/\D/g, ''))
    : 64;

  return (
    <div className="w-full space-y-6">
      <ToggleGroup 
        type="single" 
        className="w-full inline-grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4"
        defaultValue={currentValue.toString()}
        onValueChange={(value) => {
          if (value) {
            const memorySize = parseInt(value);
            const option = createMemoryOption(memorySize);
            onSelectOption(option);
          }
        }}
      >
        {memoryValues.map((size) => {
          const specs = getMemorySpecs(size);
          return (
            <ToggleGroupItem
              key={size}
              value={size.toString()}
              className="min-h-[80px] flex flex-col items-center justify-center p-3 gap-2 
                rounded-lg transition-all duration-200
                bg-card hover:bg-accent/50
                data-[state=on]:bg-primary data-[state=on]:text-primary-foreground
                border border-border hover:border-primary/30
                relative group"
              aria-label={`${size}GB RAM`}
            >
              <span className="text-lg font-semibold tracking-tight">{size}GB RAM</span>
              <span className="text-sm font-medium text-muted-foreground">
                {formatCurrency(size * pricePerGB)}
              </span>
              <div className="absolute right-2 top-2 opacity-60 hover:opacity-100 transition-opacity">
                <HelpTooltip
                  title={`${size}GB RAM`}
                  description={`
                    • ${specs.type}
                    • Velocidade: ${specs.speed}
                    • ${specs.channels}
                    • Suporte a ${specs.ecc}
                    • Preço: ${formatCurrency(size * pricePerGB)}
                  `}
                />
              </div>
            </ToggleGroupItem>
          );
        })}
      </ToggleGroup>
    </div>
  );
}
