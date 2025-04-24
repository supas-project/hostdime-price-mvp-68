
import { ComponentOption } from "@/data/server-components";
import { Button } from "@/components/ui/button";
import { Check, MousePointerClick, Info } from "lucide-react";
import { useState } from "react";
import { HelpTooltip } from "./help-tooltip";
import { formatCurrency } from "@/lib/utils";

interface ComponentCardProps {
  option: ComponentOption;
  isSelected: boolean;
  onSelect: (option: ComponentOption) => void;
}

export function ComponentCard({ option, isSelected, onSelect }: ComponentCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <div 
      className={`relative rounded-xl border transition-all duration-300 ${
        isSelected 
          ? "border-primary/50 bg-primary/5 shadow-lg shadow-primary/10 scale-[1.02]" 
          : "border-border hover:border-primary/30 hover:shadow-md"
      } p-6`}
      onClick={() => onSelect(option)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {isSelected ? (
        <div className="absolute -top-2 -right-2 bg-primary rounded-full p-1.5 shadow-lg animate-fade-in">
          <Check size={14} className="text-primary-foreground" />
        </div>
      ) : (
        <div className={`absolute -top-2 -right-2 text-xs bg-background/80 backdrop-blur-sm px-2 py-1 rounded-full border border-border transition-opacity duration-300 ${isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-1'}`}>
          <div className="flex items-center gap-1">
            <MousePointerClick size={12} />
            <span>Selecionar</span>
          </div>
        </div>
      )}
      
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="space-y-3">
          <div>
            <h3 className="font-medium text-lg flex items-center gap-2">
              {option.name}
              {option.description && (
                <HelpTooltip
                  title=""
                  description={option.description}
                  icon={true}
                />
              )}
            </h3>
            <p className="text-muted-foreground text-sm mt-1">{option.description}</p>
          </div>
          
          {option.specs && (
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Especificações</p>
              <div className="space-y-2">
                {option.specs.map((spec, index) => (
                  <div key={index} className="flex text-sm text-muted-foreground items-start gap-2 hover:text-foreground transition-colors">
                    <Info className="h-4 w-4 mt-0.5 shrink-0" />
                    <span>{spec}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        
        <div className="shrink-0 flex flex-col justify-between items-end gap-4">
          <div className="text-right">
            <p className="text-xl font-semibold text-primary">
              {formatCurrency(option.price)}
              <span className="text-xs text-muted-foreground block">/mês</span>
            </p>
          </div>
          
          <Button
            variant={isSelected ? "secondary" : "default"}
            className={`transition-all duration-300 ${isHovered || isSelected ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"}`}
            onClick={(e) => {
              e.stopPropagation();
              onSelect(option);
            }}
          >
            {isSelected ? "Selecionado" : "Selecionar"}
          </Button>
        </div>
      </div>
    </div>
  );
}
