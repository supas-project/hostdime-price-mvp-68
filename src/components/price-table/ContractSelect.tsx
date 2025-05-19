
import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { HelpTooltip } from "@/components/help-tooltip";
import { contractComponents } from "@/data/contract-components";

interface ContractSelectProps {
  value: string;
  onChange: (value: string) => void;
  hidden?: boolean; // Nova propriedade para controlar a visibilidade
}

export function ContractSelect({
  value,
  onChange,
  hidden = false
}: ContractSelectProps) {
  if (hidden) {
    return null;
  }

  return (
    <div className="flex items-center gap-2">
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Contrato" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="0">Sem contrato</SelectItem>
          <SelectItem value="12">12 meses (5% off)</SelectItem>
          <SelectItem value="24">24 meses (10% off)</SelectItem>
          <SelectItem value="36">36 meses (15% off)</SelectItem>
          <SelectItem value="48">48 meses (20% off)</SelectItem>
          <SelectItem value="60">60 meses (25% off)</SelectItem>
        </SelectContent>
      </Select>
      
      <HelpTooltip 
        title="Contratos" 
        description="Os descontos se aplicam apenas aos componentes de hardware"
      />
    </div>
  );
}
