
import { useState, useEffect } from "react";
import { ComponentSelector } from "@/components/component-selector";
import { ComponentOption } from "@/types/component";
import { Card } from "@/components/ui/card";
import { findMatchingComponent } from "@/utils/component-matching";

interface DataCenterContentProps {
  options: ComponentOption[];
  selectedOption: ComponentOption | null;
  onSelectOption: (option: ComponentOption) => void;
}

export function DataCenterContent({ 
  options, 
  selectedOption, 
  onSelectOption 
}: DataCenterContentProps) {
  // Local state to track selection
  const [localSelectedId, setLocalSelectedId] = useState<string>(selectedOption?.id || "");
  
  // Synchronize local state with props when selectedOption changes
  useEffect(() => {
    if (selectedOption) {
      // Try to find a matching component in case the selectedOption came from elsewhere
      const matchingComponent = findMatchingComponent(selectedOption, options);
      setLocalSelectedId(matchingComponent?.id || selectedOption.id);
    } else {
      setLocalSelectedId("");
    }
  }, [selectedOption, options]);
  
  const handleChange = (value: string) => {
    setLocalSelectedId(value);
    const option = options.find(opt => opt.id === value);
    if (option) onSelectOption(option);
  };

  return (
    <Card className="p-6">
      <ComponentSelector
        label="Data Center"
        options={options}
        value={localSelectedId}
        onChange={handleChange}
        tooltip="Escolha a localização ideal para seu servidor"
        highlightSelection={true}
      />
    </Card>
  );
}
