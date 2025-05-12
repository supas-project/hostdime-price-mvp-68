
import { useState } from "react";
import { ChevronDown, ChevronUp, Cpu, HardDrive, MemoryStick, Server } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { PriceCategory } from "@/types/pricing";

const categoryIcons: Record<string, any> = {
  processador: Cpu,
  memoria: MemoryStick,
  armazenamento: HardDrive,
  default: Server
};

interface CategoryHeaderProps {
  category: PriceCategory;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export function CategoryHeader({ category, isCollapsed, onToggleCollapse }: CategoryHeaderProps) {
  const getCategoryIcon = () => {
    // Normalize category ID for icon matching
    const normalizedId = category.id.toLowerCase();
    
    for (const [key, Icon] of Object.entries(categoryIcons)) {
      if (normalizedId.includes(key)) {
        return Icon;
      }
    }
    
    return categoryIcons.default;
  };
  
  const IconComponent = getCategoryIcon();
  
  return (
    <div 
      className={cn(
        "flex items-center justify-between px-4 py-3 bg-muted/30 rounded-t-lg border-b border-border transition-all",
        isCollapsed ? "rounded-b-lg mb-2" : ""
      )}
    >
      <div className="flex items-center gap-3">
        <div className="p-1.5 rounded-md bg-primary/10 text-primary">
          <IconComponent className="h-5 w-5" />
        </div>
        <div>
          <h3 className="font-medium text-lg">{category.name}</h3>
          <p className="text-xs text-muted-foreground">
            {category.items.length} {category.items.length === 1 ? 'item' : 'itens'}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Badge variant="secondary" className="hidden md:flex">
          {category.items.length} {category.items.length === 1 ? 'item' : 'itens'}
        </Badge>
        <Button variant="ghost" size="sm" onClick={onToggleCollapse}>
          {isCollapsed ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronUp className="h-4 w-4" />
          )}
        </Button>
      </div>
    </div>
  );
}
