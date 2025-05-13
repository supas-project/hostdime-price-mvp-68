
import React, { useEffect, useState } from "react";
import { ComponentOption } from "@/types/component";
import { Card } from "@/components/ui/card";
import { Server } from "lucide-react";
import { HelpTooltip } from "@/components/help-tooltip";
import { ComponentSelector } from "@/components/component-selector";
import { useComponentOptions } from "@/hooks/use-component-options";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/use-toast";

interface ProcessorContentProps {
  selectedOption: ComponentOption | null;
  onSelectOption: (option: ComponentOption) => void;
}

export function ProcessorContent({ 
  selectedOption, 
  onSelectOption 
}: ProcessorContentProps) {
  const { options, isLoading, error, matchedSelectedOption } = useComponentOptions('cpu', selectedOption);
  const [localSelectedId, setLocalSelectedId] = useState<string>(selectedOption?.id || "");

  // Sync selectedOption with local state
  useEffect(() => {
    if (selectedOption) {
      setLocalSelectedId(selectedOption.id);
    }
  }, [selectedOption]);

  // Sync matchedSelectedOption with local state
  useEffect(() => {
    if (matchedSelectedOption && matchedSelectedOption.id !== localSelectedId) {
      setLocalSelectedId(matchedSelectedOption.id);
    }
  }, [matchedSelectedOption, localSelectedId]);

  // Notify about errors
  useEffect(() => {
    if (error) {
      toast({
        title: "Erro ao carregar processadores", 
        description: "Não foi possível carregar a lista de processadores disponíveis.",
        variant: "destructive"
      });
    }
  }, [error]);

  // Handle selection change
  const handleSelectionChange = (value: string) => {
    const option = options.find(opt => opt.id === value);
    setLocalSelectedId(value);
    if (option) {
      onSelectOption(option);
    }
  };

  // Log options to debug duplications
  useEffect(() => {
    if (options.length > 0) {
      console.log(`Rendering ${options.length} processor options`);
      
      // Check for potential duplicates
      const idMap = new Map();
      const nameMap = new Map();
      
      options.forEach(option => {
        if (idMap.has(option.id)) {
          console.warn(`Found processor with duplicate id: ${option.id}`);
        } else {
          idMap.set(option.id, true);
        }
        
        if (nameMap.has(option.name)) {
          console.warn(`Found processor with duplicate name: ${option.name}`);
        } else {
          nameMap.set(option.name, true);
        }
      });
    }
  }, [options]);

  // Show loading state
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
        <div className="flex items-center gap-2 flex-wrap">
          <Server className="h-5 w-5 text-[#f58220]" />
          <label className="text-base font-medium text-white flex items-center gap-2">
            Processador
            <HelpTooltip
              title="Sobre: Processadores"
              description="Escolha o processador que melhor atende suas necessidades de processamento. Mais cores significa melhor desempenho em aplicações que podem utilizar processamento paralelo."
              iconOnly
            />
          </label>
        </div>

        <div className="w-full">
          <ComponentSelector
            label="Processador"
            options={options}
            value={localSelectedId}
            onChange={handleSelectionChange}
            tooltip="Escolha o processador que melhor atenda às suas necessidades computacionais."
            highlightSelection={true}
          />
        </div>
      </div>
    </Card>
  );
}
