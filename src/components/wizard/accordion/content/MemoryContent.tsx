
import { Card } from "@/components/ui/card";
import { MemorySlider } from "@/components/memory-slider";
import { ComponentOption } from "@/types/component";

interface MemoryContentProps {
  selectedOption: ComponentOption | null;
  onSelectOption: (option: ComponentOption) => void;
}

export function MemoryContent({ selectedOption, onSelectOption }: MemoryContentProps) {
  const createMemoryOption = (memorySize: number): ComponentOption => {
    return {
      id: `memory-${memorySize}`,
      type: "memoria", // Standardizing to lowercase without accent
      name: `${memorySize}GB RAM`,
      description: `Memória RAM DDR4 ${memorySize}GB`,
      price: memorySize * 7.5,
      specs: [`${memorySize}GB de RAM de alta performance`]
    };
  };

  const currentValue = selectedOption?.name 
    ? parseInt(selectedOption.name.replace(/\D/g, '')) || 8 
    : 8;

  return (
    <Card className="p-6">
      <MemorySlider 
        value={currentValue}
        onChange={(newValue) => {
          const memoryOption = createMemoryOption(newValue);
          console.log("Selecting memory option:", memoryOption);
          onSelectOption(memoryOption);
        }}
        pricePerGB={7.5}
      />
    </Card>
  );
}
