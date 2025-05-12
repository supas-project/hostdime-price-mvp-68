
import React from "react";
import { ComponentOption } from "@/types/component";
import { Badge } from "@/components/ui/badge";
import { getPayBackValue, formatPayBack } from "@/utils/payback-utils";

interface PayBackDisplayProps {
  component: ComponentOption;
  contractDuration: string | number;
  className?: string;
}

export function PayBackDisplay({ component, contractDuration, className }: PayBackDisplayProps) {
  if (!component.isHardware) return null;
  
  const paybackValue = getPayBackValue(component, contractDuration);
  if (!paybackValue) return null;
  
  return (
    <Badge 
      variant="outline" 
      className={`bg-blue-500/10 text-blue-600 border-blue-200 ${className || ""}`}
    >
      PayBack: {formatPayBack(paybackValue)}
    </Badge>
  );
}
