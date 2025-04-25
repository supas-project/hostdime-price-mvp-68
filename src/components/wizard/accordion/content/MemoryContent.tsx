
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
  const memoryValues = [8, 16, 32, 64, 128, 256, 512, 1024];
  const pricePerGB = 7.5;
  
  const createMemoryOption = (memorySize: number): ComponentOption => ({
    id: `memory-${memorySize}`,
    type: "memoria",
    name: `${memorySize}GB RAM`,
    description: `Memória RAM DDR4 ${memorySize}GB`,
    price: memorySize * pricePerGB,
    specs: [`${memorySize}GB de RAM de alta performance`]
  });

  useEffect(() => {
    if (!selectedOption) {
      const defaultOption = createMemoryOption(8);
      onSelectOption(defaultOption);
    }
  }, []);

  const currentValue = selectedOption?.name 
    ? parseInt(selectedOption.name.replace(/\D/g, ''))
    : 8;

  return (
    <div className="space-y-6">
      <ToggleGroup 
        type="single" 
        className="flex flex-wrap justify-center gap-2"
        defaultValue={currentValue.toString()}
        onValueChange={(value) => {
          if (value) {
            const memorySize = parseInt(value);
            const option = createMemoryOption(memorySize);
            onSelectOption(option);
          }
        }}
      >
        {memoryValues.map((size) => (
          <ToggleGroupItem
            key={size}
            value={size.toString()}
            className="px-6 py-2 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground relative group"
            aria-label={`${size}GB RAM`}
          >
            <span>{size}GB</span>
            <HelpTooltip
              title={`${size}GB RAM`}
              description={`Memória RAM DDR4 de alta performance - ${formatCurrency(size * pricePerGB)}`}
            />
          </ToggleGroupItem>
        ))}
      </ToggleGroup>

      {selectedOption && (
        <div className="text-center">
          <span className="text-lg font-medium text-primary">
            {formatCurrency(selectedOption.price)}
          </span>
        </div>
      )}
    </div>
  );
}
