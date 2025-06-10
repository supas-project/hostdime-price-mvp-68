
import React, { useEffect, useState } from "react";
import { ComponentOption } from "@/types/component";
import { Card } from "@/components/ui/card";
import { MemoryStick } from "lucide-react";
import { HelpTooltip } from "@/components/help-tooltip";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatCurrency } from "@/lib/utils";
import { useComponentOptions } from "@/hooks/use-component-options";
import { Skeleton } from "@/components/ui/skeleton";

interface MemoryContentProps {
  selectedOption: ComponentOption | null;
  onSelectOption: (option: ComponentOption) => void;
}

export function MemoryContent({ 
  selectedOption, 
  onSelectOption 
}: MemoryContentProps) {
  const { options, isLoading } = useComponentOptions('memory');
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
      <Card className="p-4 sm:p-6 bg-[#1e1e1e]">
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
    <Card className="p-4 sm:p-6 overflow-hidden bg-[#1e1e1e]">
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2 flex-wrap">
          <MemoryStick className="h-5 w-5 text-[#f58220]" />
          <label className="text-base font-medium text-white flex items-center gap-2">
            Memória RAM
            <HelpTooltip
              title="Sobre: Memória RAM"
              description="Escolha a quantidade de memória RAM adequada para suas aplicações."
              iconOnly
            />
          </label>
        </div>

        <div className="w-full overflow-x-hidden">
          <Select 
            value={localSelectedId}
            onValueChange={handleSelectionChange}
          >
            <SelectTrigger className="w-full bg-[#1e1e1e] border-[#2a2a2a] text-white hover:border-[#f58220] transition-colors">
              <SelectValue placeholder="Escolha a memória ideal para você" />
            </SelectTrigger>
            <SelectContent className="bg-[#1e1e1e] border-[#2a2a2a] max-h-[220px] z-[51]">
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
            </SelectContent>
          </Select>
        </div>
      </div>
    </Card>
  );
}
