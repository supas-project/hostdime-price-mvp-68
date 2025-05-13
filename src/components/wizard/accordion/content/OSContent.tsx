
import { useState, useEffect } from "react";
import { ComponentOption } from "@/types/component";
import { Card } from "@/components/ui/card";
import { OSSelector } from "./os/OSSelector";
import { findMatchingComponent } from "@/utils/component-matching";
import { useToast } from "@/hooks/use-toast";

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
  const { toast } = useToast();
  
  useEffect(() => {
    // Log information about options for debugging
    if (options.length === 0) {
      console.warn("No OS options available. Check category mapping in price service.");
      toast({
        title: "Aviso",
        description: "Não foram encontradas opções de sistemas operacionais. Verifique a configuração.",
        variant: "destructive",
      });
    }
  }, [options, toast]);
  
  // Synchronize local state with props when selectedOption changes
  useEffect(() => {
    if (selectedOption) {
      // Find the matching option in available options
      const matchingOption = findMatchingComponent(selectedOption, options);
      setLocalSelectedId(matchingOption?.id || selectedOption.id);
    } else {
      setLocalSelectedId("");
    }
  }, [selectedOption, options]);
  
  // Handle selection change
  const handleChange = (value: string) => {
    setLocalSelectedId(value);
    const option = options.find(opt => opt.id === value);
    if (option) onSelectOption(option);
  };
  
  return (
    <Card className="p-6">
      <OSSelector
        options={options}
        selectedOption={options.find(opt => opt.id === localSelectedId) || null}
        onSelectOption={onSelectOption}
      />
    </Card>
  );
}
