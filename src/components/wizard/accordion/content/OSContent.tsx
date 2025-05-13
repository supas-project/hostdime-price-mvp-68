
import { useState, useEffect } from "react";
import { ComponentOption } from "@/types/component";
import { Card } from "@/components/ui/card";
import { OSSelector } from "./os/OSSelector";
import { findMatchingComponent } from "@/utils/component-matching";
import { useToast } from "@/hooks/use-toast";
import { useComponentOptions } from "@/hooks/use-component-options";
import { Skeleton } from "@/components/ui/skeleton";

interface OSContentProps {
  options: ComponentOption[];
  selectedOption: ComponentOption | null;
  onSelectOption: (option: ComponentOption) => void;
}

export function OSContent({ 
  selectedOption, 
  onSelectOption 
}: OSContentProps) {
  const { options, isLoading, error, matchedSelectedOption } = useComponentOptions('os', selectedOption);
  const [localSelectedId, setLocalSelectedId] = useState<string>(selectedOption?.id || "");
  const { toast } = useToast();
  
  useEffect(() => {
    // Log information about options for debugging
    console.log("OSContent options from useComponentOptions:", options);
    
    if (options.length === 0 && !isLoading) {
      console.warn("No OS options available. Check category mapping in price service.");
      toast({
        title: "Aviso",
        description: "Não foram encontradas opções de sistemas operacionais. Verifique a configuração.",
        variant: "destructive",
      });
    }
  }, [options, toast, isLoading]);
  
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
  
  // Show loading state
  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <div className="text-base font-medium text-white">Sistema Operacional</div>
          </div>
          <Skeleton className="h-10 w-full bg-[#2a2a2a]" />
          <Skeleton className="h-4 w-2/3 bg-[#2a2a2a]" />
        </div>
      </Card>
    );
  }
  
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
