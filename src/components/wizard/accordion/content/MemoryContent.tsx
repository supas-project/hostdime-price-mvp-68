
import { ComponentOption } from "@/types/component";
import { HelpTooltip } from "@/components/help-tooltip";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatCurrency } from "@/lib/utils";
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

    if (memorySize >= 512) {
      baseSpecs.type = "DDR4 ECC Load Reduced DIMM";
    }

    return baseSpecs;
  };

  const formatMemorySize = (size: number): string => {
    return size >= 1024 ? `${size / 1024}TB` : `${size}GB`;
  };

  const createMemoryOption = (memorySize: number): ComponentOption => ({
    id: `memory-${memorySize}`,
    type: "memoria",
    name: `${formatMemorySize(memorySize)} RAM`,
    description: `Memória RAM ${getMemorySpecs(memorySize).type} ${formatMemorySize(memorySize)}`,
    price: memorySize * pricePerGB,
    specs: [
      `${formatMemorySize(memorySize)} Total`,
      `Tipo: ${getMemorySpecs(memorySize).type}`,
      `Velocidade: ${getMemorySpecs(memorySize).speed}`,
      `${getMemorySpecs(memorySize).channels}`,
      getMemorySpecs(memorySize).ecc
    ]
  });

  useEffect(() => {
    if (!selectedOption) {
      const defaultOption = createMemoryOption(64);
      onSelectOption(defaultOption);
    }
  }, []);

  return (
    <div className="w-full space-y-4 animate-fade-in">
      <Select
        value={selectedOption?.id || ""}
        onValueChange={(value) => {
          const memorySize = parseInt(value.replace('memory-', ''));
          const option = createMemoryOption(memorySize);
          onSelectOption(option);
        }}
      >
        <SelectTrigger className="w-full bg-background border-border/50 hover:border-primary/50 transition-colors">
          <SelectValue placeholder="Selecione a quantidade de memória RAM" />
        </SelectTrigger>
        <SelectContent className="bg-background border-border/50 z-50">
          {memoryValues.map((size) => {
            const specs = getMemorySpecs(size);
            const formattedSize = formatMemorySize(size);
            return (
              <SelectItem
                key={size}
                value={`memory-${size}`}
                className="flex items-center justify-between group py-3 px-3"
              >
                <div className="flex items-center justify-between w-full gap-4">
                  <span className="flex items-center gap-2">
                    {formattedSize} RAM
                    <HelpTooltip
                      title={`${formattedSize} RAM Specifications`}
                      description={`
                        • Tipo: ${specs.type}
                        • Velocidade: ${specs.speed}
                        • ${specs.channels}
                        • ${specs.ecc}
                      `}
                      iconOnly
                    />
                  </span>
                  <span className="text-primary font-medium">
                    {formatCurrency(size * pricePerGB)}
                  </span>
                </div>
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
    </div>
  );
}
