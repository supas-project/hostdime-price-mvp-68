import * as Icons from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
interface AccordionHeaderProps {
  icon: string;
  title: string;
  description: string;
  isExpanded: boolean;
  isActive: boolean;
  isComplete: boolean;
  selectedOption: {
    name: string;
  } | null;
}
export function AccordionHeader({
  icon,
  title,
  description,
  isExpanded,
  isActive,
  isComplete,
  selectedOption
}: AccordionHeaderProps) {
  const IconComponent = (Icons as any)[icon] || Icons.HelpCircle;
  return;
}