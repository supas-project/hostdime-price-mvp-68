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
  return;
}