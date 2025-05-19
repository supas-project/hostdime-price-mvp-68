
import { useState, useEffect } from "react";
import { ComponentOption } from "@/types/component";
import { Card } from "@/components/ui/card";
import { OSSelector } from "./os/OSSelector";
import { findMatchingComponent } from "@/utils/component-matching";
import { useComponentOptions } from "@/hooks/use-component-options";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

interface OSContentProps {
  // Make options optional by adding the ? modifier
  options?: ComponentOption[];
  selectedOption: ComponentOption | null;
  onSelectOption: (option: ComponentOption) => void;
}

export function OSContent({ 
  options: propOptions, // Rename to avoid conflict with the hook's options
  selectedOption, 
  onSelectOption 
}: OSContentProps) {
  // Use propOptions if provided, otherwise fetch from the price service
  const { options, isLoading, error } = useComponentOptions('os');
  const finalOptions = propOptions || options; // Use propOptions if available, fall back to fetched options
  
  const [localSelectedId, setLocalSelectedId] = useState<string>(selectedOption?.id || "");
  
  useEffect(() => {
    // Log information about options for debugging
    console.log("OSContent options from useComponentOptions:", finalOptions);
    
    if (finalOptions.length === 0 && !isLoading) {
      console.warn("No OS options available. Check category mapping in price service.");
      toast.warning("Aviso", {
        description: "Não foram encontradas opções de sistemas operacionais. Verifique a configuração."
      });
    }
  }, [finalOptions, isLoading]);
  
  // Synchronize local state with props when selectedOption changes
  useEffect(() => {
    if (selectedOption) {
      // Find the matching option in available options
      const matchingOption = findMatchingComponent(selectedOption, finalOptions);
      setLocalSelectedId(matchingOption?.id || selectedOption.id);
    } else {
      setLocalSelectedId("");
    }
  }, [selectedOption, finalOptions]);
  
  // Show loading state
  if (isLoading && !propOptions) {
    return (
      <Card className="p-4 sm:p-6">
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
    <Card className="p-4 sm:p-6 overflow-hidden">
      <div className="w-full overflow-x-hidden">
        <OSSelector
          options={finalOptions}
          selectedOption={finalOptions.find(opt => opt.id === localSelectedId) || null}
          onSelectOption={onSelectOption}
        />
      </div>
    </Card>
  );
}
