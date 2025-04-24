
import { ComponentOption } from "@/data/server-components";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Database } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface DataCenterCardProps {
  options: ComponentOption[];
  selectedOption: ComponentOption | null;
  onSelectOption: (option: ComponentOption) => void;
}

export function DataCenterCard({ 
  options, 
  selectedOption, 
  onSelectOption 
}: DataCenterCardProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {options.map((option) => {
        const isSelected = selectedOption?.id === option.id;
        const features = option.metadata?.features || [];
        const badge = option.metadata?.badge;
        
        return (
          <Card 
            key={option.id}
            className={`
              relative overflow-hidden border-2 transition-all
              ${isSelected ? 'border-primary' : 'border-border hover:border-primary/50'}
              cursor-pointer
            `}
            onClick={() => onSelectOption(option)}
          >
            {badge && (
              <Badge 
                variant="outline"
                className={`
                  absolute top-2 right-2 capitalize
                  ${badge === 'Recomendado' ? 'bg-primary/10 text-primary border-primary/20' 
                    : badge === 'Internacional' ? 'bg-blue-600/10 text-blue-600 border-blue-600/20' 
                    : ''}
                `}
              >
                {badge}
              </Badge>
            )}
            
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className={`
                  p-2 rounded-full 
                  ${isSelected ? 'bg-primary/10' : 'bg-muted'}
                `}>
                  <Database className={`
                    h-5 w-5 
                    ${isSelected ? 'text-primary' : 'text-muted-foreground'}
                  `} />
                </div>
                <div>
                  <h3 className="font-medium">{option.name}</h3>
                  {option.price > 0 && (
                    <p className="text-sm text-muted-foreground">
                      {formatCurrency(option.price)}
                    </p>
                  )}
                </div>
              </div>
              
              <ul className="space-y-2">
                {features.map((feature: string, index: number) => (
                  <li key={index} className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-primary" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              
              {isSelected && (
                <div className="h-1 w-full bg-primary absolute bottom-0 left-0"></div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
