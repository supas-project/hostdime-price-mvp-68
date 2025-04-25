
import { Card } from "@/components/ui/card";
import { MemorySlider } from "@/components/memory-slider";
import { ComponentOption } from "@/types/component";

interface MemoryContentProps {
  selectedOption: ComponentOption | null;
  onSelectOption: (option: ComponentOption) => void;
}

export function MemoryContent({ selectedOption, onSelectOption }: MemoryContentProps) {
  return (
    <Card className="p-6">
      <MemorySlider 
        value={selectedOption?.name 
          ? parseInt(selectedOption.name.replace(/\D/g, '')) || 8 
          : 8}
        onChange={(newValue) => {
          const updatedOption = {
            ...selectedOption,
            price: newValue * 7.5,
            name: `${newValue}GB RAM`
          };
          onSelectOption(updatedOption);
        }}
        pricePerGB={7.5}
      />
    </Card>
  );
}
