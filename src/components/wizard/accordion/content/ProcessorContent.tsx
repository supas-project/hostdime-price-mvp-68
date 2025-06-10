
import React, { useEffect, useState } from "react";
import { ComponentOption } from "@/types/component";
import { Card } from "@/components/ui/card";
import { Server } from "lucide-react";
import { ComponentSelector } from "@/components/component-selector";
import { useComponentOptions } from "@/hooks/use-component-options";
import { Skeleton } from "@/components/ui/skeleton";

interface ProcessorContentProps {
  selectedOption: ComponentOption | null;
  onSelectOption: (option: ComponentOption) => void;
}

export function ProcessorContent({
  selectedOption,
  onSelectOption
}: ProcessorContentProps) {
  const { options, isLoading } = useComponentOptions('cpu');
  const [localSelectedId, setLocalSelectedId] = useState<string>(selectedOption?.id || "");

  useEffect(() => {
    if (selectedOption) {
      setLocalSelectedId(selectedOption.id);
    }
  }, [selectedOption]);

  const handleSelectionChange = (value: string) => {
    const option = options.find(opt => opt.id === value);
    setLocalSelectedId(value);
    if (option) {
      onSelectOption(option);
    }
  };

  if (isLoading) {
    return (
      <Card className="p-4 sm:p-6">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <Server className="h-5 w-5 text-[#f58220]" />
            <div className="text-base font-medium text-white">Processador</div>
          </div>
          <Skeleton className="h-10 w-full bg-[#2a2a2a]" />
        </div>
      </Card>
    );
  }
  
  return (
    <Card className="p-4 sm:p-6">
      <div className="flex flex-col gap-4">
        <div className="w-full">
          <ComponentSelector 
            label="Processador" 
            options={options} 
            value={localSelectedId} 
            onChange={handleSelectionChange} 
            tooltip="Escolha o processador que melhor atenda às suas necessidades." 
            highlightSelection={true} 
          />
        </div>
      </div>
    </Card>
  );
}
