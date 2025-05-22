
import React from 'react';
import { ComponentOption } from "@/types/component";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

interface DataCenterContentProps {
  options: ComponentOption[];
  selectedOption: ComponentOption | null;
  onSelectOption: (option: ComponentOption) => void;
}

export function DataCenterContent({
  options,
  selectedOption,
  onSelectOption
}: DataCenterContentProps) {
  // Adicionar log para rastrear a seleção
  console.log("[DataCenterContent] Opção selecionada:", selectedOption?.name, "ID:", selectedOption?.id);
  console.log("[DataCenterContent] Opções disponíveis:", options.length);
  
  return (
    <div className="space-y-4 py-4">
      <RadioGroup
        value={selectedOption?.id || ""}
        onValueChange={(value) => {
          const option = options.find(opt => opt.id === value);
          if (option) {
            console.log("[DataCenterContent] Selecionando:", option.name, option);
            onSelectOption(option);
          }
        }}
      >
        <div className="space-y-3">
          {options.map((option) => (
            <div
              key={option.id}
              className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-accent/10 transition-colors"
            >
              <RadioGroupItem value={option.id} id={option.id} />
              <Label
                htmlFor={option.id}
                className="flex-1 flex justify-between cursor-pointer"
              >
                <span>{option.name}</span>
              </Label>
            </div>
          ))}
        </div>
      </RadioGroup>
    </div>
  );
}
