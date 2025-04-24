
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
      className={`component-card p-4 cursor-pointer relative transition-all duration-300 ${
        isSelected 
          ? "border-primary border-2 bg-primary/5" 
          : "hover:border-primary/30"
      }`}
      onClick={() => onSelect(option)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {isSelected ? (
        <div className="absolute -top-2 -right-2 bg-primary rounded-full p-1 animate-fade-in">
          <Check size={14} className="text-white" />
        </div>
      ) : (
        <div className={`absolute -top-2 -right-2 text-xs text-muted-foreground bg-background/80 backdrop-blur-sm px-2 py-1 rounded-full border border-border transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
          <div className="flex items-center gap-1">
            <MousePointerClick size={12} />
            <span>Selecionar</span>
          </div>
        </div>
      )}
      
      <div className="space-y-2">
        <div className="flex justify-between items-start">
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
          </div>
          <span className="text-primary font-semibold">{formatCurrency(option.price)}/mês</span>
        </div>
        
        <p className="text-muted-foreground text-sm">{option.description}</p>
        
        {option.specs && (
          <div className="mt-4 space-y-2">
            <p className="text-xs text-muted-foreground font-medium uppercase">Especificações</p>
            <div className="space-y-1">
              {option.specs.map((spec, index) => (
                <div key={index} className="flex text-xs text-muted-foreground items-start gap-2">
                  <Info className="h-3 w-3 mt-0.5 shrink-0" />
                  <span>{spec}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      
      <div className={`mt-4 transition-opacity duration-300 ${isHovered || isSelected ? "opacity-100" : "opacity-0"}`}>
        <Button
          variant={isSelected ? "secondary" : "default"}
          className="w-full"
          onClick={(e) => {
            e.stopPropagation();
            onSelect(option);
          }}
        >
          {isSelected ? "Selecionado" : "Selecionar"}
        </Button>
      </div>
    </div>
  );
}
