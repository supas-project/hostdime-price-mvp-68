
import React, { useEffect, useState } from "react";
import { ComponentOption } from "@/types/component";
import { Card } from "@/components/ui/card";
import { MemoryStick } from "lucide-react";
import { HelpTooltip } from "@/components/help-tooltip";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatCurrency } from "@/lib/utils";
import { useComponentOptions } from "@/hooks/use-component-options";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

interface MemoryContentProps {
  selectedOption: ComponentOption | null;
  onSelectOption: (option: ComponentOption) => void;
}

export function MemoryContent({ 
  selectedOption, 
  onSelectOption 
}: MemoryContentProps) {
  const { options, isLoading, error, matchedSelectedOption } = useComponentOptions('memory', selectedOption);
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
      toast.error("Erro ao carregar opções de memória", {
        description: "Não foi possível carregar as opções de memória disponíveis."
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
      <Card className="p-6">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <MemoryStick className="h-5 w-5 text-[#f58220]" />
            <div className="text-base font-medium text-white">Memória RAM</div>
          </div>
          <Skeleton className="h-10 w-full bg-[#2a2a2a]" />
          <Skeleton className="h-4 w-2/3 bg-[#2a2a2a]" />
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <MemoryStick className="h-5 w-5 text-[#f58220]" />
          <label className="text-base font-medium text-white flex items-center gap-2">
            Memória RAM
            <HelpTooltip
              title="Sobre: Memória RAM"
              description="Escolha a quantidade de memória RAM adequada para suas aplicações. Mais memória permite executar mais aplicações simultaneamente."
              iconOnly
            />
          </label>
        </div>

        <Select 
          value={localSelectedId}
          onValueChange={handleSelectionChange}
        >
          <SelectTrigger className="w-full bg-[#1e1e1e] border-[#2a2a2a] text-white hover:border-[#f58220] transition-colors">
            <SelectValue placeholder="Escolha a memória ideal para você" />
          </SelectTrigger>
          <SelectContent className="bg-[#1e1e1e] border-[#2a2a2a] max-h-[280px]">
            {options.map((option) => (
              <SelectItem
                key={option.id}
                value={option.id}
                className="flex items-center justify-between py-2 px-3 hover:bg-[#2a2a2a] focus:bg-[#2a2a2a] cursor-pointer text-white"
              >
                <div className="flex justify-between items-center w-full gap-4">
                  <div className="flex items-center gap-2">
                    <span className="truncate">{option.name}</span>
                    {option.specs && (
                      <HelpTooltip
                        title={option.name}
                        description={option.specs.join('\n')}
                        iconOnly
                      />
                    )}
                  </div>
                  <span className="text-[#f58220] font-medium whitespace-nowrap">
                    {formatCurrency(option.price)}
                  </span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </Card>
  );
}
