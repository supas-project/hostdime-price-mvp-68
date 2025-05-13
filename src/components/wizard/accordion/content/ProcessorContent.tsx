
import React, { useEffect, useState } from "react";
import { ComponentOption } from "@/types/component";
import { Card } from "@/components/ui/card";
import { Server } from "lucide-react";
import { HelpTooltip } from "@/components/help-tooltip";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatCurrency } from "@/lib/utils";
import { useComponentOptions } from "@/hooks/use-component-options";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";
import { normalizeComponentType } from "@/hooks/use-component-selection";

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
      toast.error("Erro ao carregar processadores", {
        description: "Não foi possível carregar a lista de processadores disponíveis."
      });
    }
  }, [error]);

  const handleSelectionChange = (value: string) => {
    const option = options.find(opt => opt.id === value);
    setLocalSelectedId(value);
    if (option) {
      onSelectOption(option);
    }
  };

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
          <Skeleton className="h-4 w-2/3 bg-[#2a2a2a]" />
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4 sm:p-6 overflow-hidden">
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

        <div className="w-full overflow-x-hidden">
          <Select 
            value={localSelectedId} 
            onValueChange={handleSelectionChange}
          >
            <SelectTrigger className="w-full bg-[#1e1e1e] border-[#2a2a2a] text-white hover:border-[#f58220] transition-colors min-h-[40px] text-xs sm:text-sm py-2 px-2.5 sm:py-2.5 sm:px-4">
              <SelectValue placeholder="Escolha o processador ideal para você" />
            </SelectTrigger>
            <SelectContent className="bg-[#1e1e1e] border-[#2a2a2a] max-h-[220px] z-[51]">
              <ScrollArea className="max-h-[220px]">
                {options.map((option) => (
                  <SelectItem
                    key={option.id}
                    value={option.id}
                    className="flex items-center justify-between py-2 sm:py-2.5 px-3 hover:bg-[#2a2a2a] focus:bg-[#2a2a2a] cursor-pointer text-white"
                  >
                    <div className="flex justify-between items-center w-full gap-2 sm:gap-4">
                      <div className="flex items-center gap-2">
                        <span className="truncate text-xs sm:text-sm">{option.name}</span>
                        {option.specs && (
                          <HelpTooltip
                            title={option.name}
                            description={option.specs.join('\n')}
                            iconOnly
                          />
                        )}
                      </div>
                      <span className="text-[#f58220] font-medium text-xs sm:text-sm whitespace-nowrap">
                        {formatCurrency(option.price)}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </ScrollArea>
            </SelectContent>
          </Select>
        </div>
      </div>
    </Card>
  );
}
