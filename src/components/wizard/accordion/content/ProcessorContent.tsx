import React, { useEffect, useState } from "react";
import { ComponentOption } from "@/types/component";
import { Card } from "@/components/ui/card";
import { Server } from "lucide-react";
import { ComponentSelector } from "@/components/component-selector";
import { useComponentOptions } from "@/hooks/use-component-options";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { PriceService } from "@/services/price-service";
import { usePaybackPricing } from "@/hooks/usePaybackPricing";

interface ProcessorContentProps {
  selectedOption: ComponentOption | null;
  onSelectOption: (option: ComponentOption) => void;
}

export function ProcessorContent({
  selectedOption,
  onSelectOption
}: ProcessorContentProps) {
  const {
    options,
    isLoading,
    error,
    refreshOptions
  } = useComponentOptions('cpu');
  const [localSelectedId, setLocalSelectedId] = useState<string>(selectedOption?.id || "");
  const { calculatePriceWithPayback, getPaybackInfo, hasActiveContract } = usePaybackPricing();

  useEffect(() => {
    // Add listener for price data changes to trigger a refresh
    PriceService.addDataChangeListener(() => {
      console.log("[ProcessorContent] Price data changed, refreshing processor options");
      refreshOptions();
    });

    // Cleanup listener on unmount
    return () => {
      PriceService.removeDataChangeListener();
    };
  }, [refreshOptions]);

  // Sync selectedOption with local state
  useEffect(() => {
    if (selectedOption?.id) {
      setLocalSelectedId(selectedOption.id);
    }
  }, [selectedOption]);

  // Notify about errors
  useEffect(() => {
    if (error) {
      toast.error("Não foi possível carregar a lista de processadores disponíveis.");
    }
  }, [error]);

  const handleSelectionChange = (value: string) => {
    const option = options?.find(opt => opt?.id === value);
    setLocalSelectedId(value);
    if (option) {
      onSelectOption(option);
    }
  };

  // Handle loading state
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

  // Handle error state
  if (error) {
    return (
      <Card className="p-4 sm:p-6">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <Server className="h-5 w-5 text-[#f58220]" />
            <div className="text-base font-medium text-white">Processador</div>
          </div>
          <div className="text-sm text-red-400">
            Erro ao carregar processadores. Tente novamente.
          </div>
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
            options={options || []} 
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
