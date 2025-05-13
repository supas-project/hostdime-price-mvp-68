
import { useState, useEffect } from "react";
import { ComponentOption } from "@/types/component";
import { Card } from "@/components/ui/card";
import { OSSelector } from "./os/OSSelector";
import { findMatchingComponent } from "@/utils/component-matching";
import { osComponents } from "@/data/os-components";

interface OSContentProps {
  options: ComponentOption[];
  selectedOption: ComponentOption | null;
  onSelectOption: (option: ComponentOption) => void;
}

export function OSContent({ 
  options, 
  selectedOption, 
  onSelectOption 
}: OSContentProps) {
  const [localSelectedId, setLocalSelectedId] = useState<string>(selectedOption?.id || "");
  
  // Add fallback options if no options are provided
  const allOptions = options.length > 0 ? options : osComponents.options;
  
  // Log for debugging
  useEffect(() => {
    console.log("OS Content - Options:", options);
    console.log("OS Content - Using fallback:", options.length === 0);
    console.log("OS Content - Selected Option:", selectedOption);
  }, [options, selectedOption]);
  
  // Synchronize local state with props when selectedOption changes
  useEffect(() => {
    if (selectedOption) {
      // Find the matching option in available options
      const matchingOption = findMatchingComponent(selectedOption, allOptions);
      setLocalSelectedId(matchingOption?.id || selectedOption.id);
    } else {
      setLocalSelectedId("");
    }
  }, [selectedOption, allOptions]);
  
  // Handle selection change
  const handleChange = (value: string) => {
    setLocalSelectedId(value);
    const option = allOptions.find(opt => opt.id === value);
    if (option) onSelectOption(option);
  };
  
  return (
    <Card className="p-6 w-full">
      <OSSelector
        options={allOptions}
        selectedOption={allOptions.find(opt => opt.id === localSelectedId) || selectedOption}
        onSelectOption={onSelectOption}
      />
    </Card>
  );
}
