
import { ComponentOption } from "@/data/server-components";
import { Button } from "@/components/ui/button";
import { Check, MousePointerClick } from "lucide-react";
import { useState } from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

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
          <h3 className="font-medium text-lg">{option.name}</h3>
          <span className="text-primary font-semibold">${option.price}</span>
        </div>
        
        <p className="text-muted-foreground text-sm">{option.description}</p>
        
        {option.specs && (
          <div className="mt-4 space-y-1">
            {option.specs.map((spec, index) => (
              <div key={index} className="flex text-xs text-muted-foreground">
                <span>• {spec}</span>
              </div>
            ))}
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

export function ComponentTooltip({ children, content }: { children: React.ReactNode; content: string }) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        <TooltipContent>
          <p>{content}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
