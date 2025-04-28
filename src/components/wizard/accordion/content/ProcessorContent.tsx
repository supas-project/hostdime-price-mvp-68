import { ComponentSelector } from "@/components/component-selector";
import { ComponentOption } from "@/types/component";
import { Card } from "@/components/ui/card";
import { Server } from "lucide-react";
import { HelpTooltip } from "@/components/help-tooltip";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatCurrency } from "@/lib/utils";

interface ProcessorContentProps {
  options: ComponentOption[];
  selectedOption: ComponentOption | null;
  onSelectOption: (option: ComponentOption) => void;
}

export function ProcessorContent({ 
  options, 
  selectedOption, 
  onSelectOption 
}: ProcessorContentProps) {
  return (
    <Card className="p-6">
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
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

        <Select 
          value={selectedOption?.id || ""}
          onValueChange={(value) => {
            const option = options.find(opt => opt.id === value);
            if (option) onSelectOption(option);
          }}
        >
          <SelectTrigger className="w-full bg-[#1e1e1e] border-[#2a2a2a] text-white hover:border-[#f58220] transition-colors">
            <SelectValue placeholder="Escolha o processador ideal para você" />
          </SelectTrigger>
          <SelectContent className="bg-[#1e1e1e] border-[#2a2a2a]">
            {options.map((option) => (
              <SelectItem
                key={option.id}
                value={option.id}
                className="flex items-center justify-between py-2 px-3 hover:bg-[#2a2a2a] focus:bg-[#2a2a2a] cursor-pointer text-white"
              >
                <div className="flex justify-between items-center w-full gap-4">
                  <div className="flex items-center gap-2">
                    <span>{option.name}</span>
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
