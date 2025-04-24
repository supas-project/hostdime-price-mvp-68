
import { ComponentOption } from "@/data/server-components";
import { Card } from "@/components/ui/card";
import { ComponentSelector } from "./component-selector";
import { MemorySlider } from "./memory-slider";
import { useState } from "react";
import { formatCurrency } from "@/lib/utils";

interface ComponentCardProps {
  option: ComponentOption;
  isSelected: boolean;
  onSelect: (option: ComponentOption) => void;
}

export function ComponentCard({ option, isSelected, onSelect }: ComponentCardProps) {
  const [memoryGB, setMemoryGB] = useState(8);
  const isMemoryComponent = option.type === "Memória";
  const memoryPricePerGB = 7.5; // Preço por GB de RAM
  
  const handleMemoryChange = (newValue: number) => {
    setMemoryGB(newValue);
  };
  
  if (isMemoryComponent) {
    return (
      <Card className="p-6">
        <MemorySlider 
          value={memoryGB}
          onChange={handleMemoryChange}
          pricePerGB={memoryPricePerGB}
        />
      </Card>
    );
  }
  
  return (
    <Card className="p-6">
      <ComponentSelector
        label={option.name}
        options={[option]}
        value={option.id}
        onChange={() => onSelect(option)}
        tooltip={option.description}
      />
    </Card>
  );
}
