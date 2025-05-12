
import { useState, useEffect } from "react";
import { ComponentOption } from "@/types/component";
import { Card } from "@/components/ui/card";
import { OSSelector } from "./os/OSSelector";
import { findMatchingComponent } from "@/utils/component-matching";

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
  // Find the matching selected option in the available options
  const matchingOption = selectedOption ? findMatchingComponent(selectedOption, options) : null;
  
  return (
    <Card className="p-6">
      <OSSelector
        options={options}
        selectedOption={matchingOption || selectedOption}
        onSelectOption={onSelectOption}
      />
    </Card>
  );
}
