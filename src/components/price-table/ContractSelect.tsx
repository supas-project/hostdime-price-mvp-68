
import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { HelpTooltip } from "@/components/help-tooltip";
import { contractComponents } from "@/data/contract-components";

interface ContractSelectProps {
  value: string;
  onChange: (value: string) => void;
}

export function ContractSelect({ value, onChange }: ContractSelectProps) {
  return (
    <div className="flex items-center gap-2">
      <label className="text-sm text-muted-foreground whitespace-nowrap flex items-center">
        Contrato: 
        <HelpTooltip 
          title="Simular PayBack por contrato" 
          description="Selecione um contrato para ver o efeito do PayBack nos preços dos componentes de hardware."
        />
      </label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-40 h-8">
          <SelectValue placeholder="Sem contrato" />
        </SelectTrigger>
        <SelectContent>
          {contractComponents.options.map((option) => (
            <SelectItem key={option.subtype} value={option.subtype || "0"}>
              {option.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
