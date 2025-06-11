import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, ArrowUp, ArrowDown, LayoutGrid, List, Scale } from "lucide-react";
import { cn } from "@/lib/utils";
import { HelpTooltip } from "@/components/help-tooltip";

interface TableControlsProps {
  displayMode: "table" | "card";
  onDisplayModeChange: (mode: "table" | "card") => void;
  onSearchChange: (term: string) => void;
  onSortChange: (order: "asc" | "desc" | null) => void;
  sortOrder: "asc" | "desc" | null;
  isComparisonMode?: boolean;
  onToggleComparison?: () => void;
  comparisonCount?: number;
  disabled?: boolean;
}

export function TableControls({ 
  displayMode, 
  onDisplayModeChange,
  onSearchChange,
  onSortChange,
  sortOrder,
  isComparisonMode = false,
  onToggleComparison,
  comparisonCount = 0,
  disabled = false
}: TableControlsProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    onSearchChange(value);
  };

  const handleSortClick = () => {
    if (disabled) return;
    
    if (sortOrder === null) {
      onSortChange("asc");
    } else if (sortOrder === "asc") {
      onSortChange("desc");
    } else {
      onSortChange(null);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row gap-3 mb-6 items-center">
      <div className="relative flex-1 w-full">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground transition-colors" />
        <Input
          placeholder="Buscar componentes..."
          value={searchTerm}
          onChange={handleSearchChange}
          disabled={disabled}
          className={cn(
            "pl-9 w-full h-10 text-base transition-all duration-200",
            "border-primary/20 focus:border-primary focus:ring-2 focus:ring-primary/20",
            "hover:border-primary/40",
            disabled && "opacity-50 cursor-not-allowed"
          )}
          aria-label="Buscar componentes"
        />
      </div>
      
      <div className="flex items-center gap-2 w-full sm:w-auto">
        {/* Comparison Mode Button */}
        {onToggleComparison && (
          <Button
            variant={isComparisonMode ? "default" : "outline"}
            size="sm"
            onClick={onToggleComparison}
            disabled={disabled}
            className={cn(
              "h-10 px-3 transition-all duration-200 hover:scale-105",
              isComparisonMode 
                ? "bg-[#f58220] hover:bg-[#e55a00] text-white shadow-md" 
                : "hover:bg-[#f58220]/10 hover:text-[#f58220] hover:border-[#f58220]/50",
              disabled && "opacity-50 cursor-not-allowed hover:scale-100"
            )}
            title={isComparisonMode ? "Sair do modo comparação" : "Ativar modo comparação"}
          >
            <Scale className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Comparar</span>
            {comparisonCount > 0 && (
              <span className={cn(
                "ml-2 px-1.5 py-0.5 rounded-full text-xs font-semibold",
                isComparisonMode ? "bg-white/20" : "bg-[#f58220] text-white"
              )}>
                {comparisonCount}
              </span>
            )}
          </Button>
        )}

        <Button
          variant="outline"
          size="sm"
          onClick={handleSortClick}
          disabled={disabled}
          className={cn(
            "h-10 px-3 transition-all duration-200 hover:scale-105", 
            sortOrder !== null && "bg-accent text-accent-foreground border-primary/30 shadow-sm",
            "hover:bg-[#f58220]/10 hover:text-[#f58220] hover:border-[#f58220]/50",
            disabled && "opacity-50 cursor-not-allowed hover:scale-100"
          )}
          title={
            sortOrder === "asc" ? "Ordenar por preço (maior para menor)" : 
            sortOrder === "desc" ? "Remover ordenação" : 
            "Ordenar por preço (menor para maior)"
          }
        >
          {sortOrder === "asc" ? (
            <ArrowUp className="h-4 w-4" />
          ) : sortOrder === "desc" ? (
            <ArrowDown className="h-4 w-4" />
          ) : (
            <ArrowUp className="h-4 w-4 text-muted-foreground" />
          )}
        </Button>
        
        <div className={cn(
          "flex border border-input rounded-md overflow-hidden shadow-sm hover:shadow-md transition-shadow",
          disabled && "opacity-50 cursor-not-allowed"
        )}>
          <Button
            variant="ghost"
            size="sm"
            disabled={disabled}
            className={cn(
              "h-10 px-3 rounded-none border-r border-input transition-all duration-200",
              displayMode === "table" && "bg-accent text-accent-foreground",
              "hover:bg-[#f58220]/10 hover:text-[#f58220]",
              disabled && "cursor-not-allowed"
            )}
            onClick={() => !disabled && onDisplayModeChange("table")}
            title="Visualização em lista"
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            disabled={disabled}
            className={cn(
              "h-10 px-3 rounded-none transition-all duration-200",
              displayMode === "card" && "bg-accent text-accent-foreground",
              "hover:bg-[#f58220]/10 hover:text-[#f58220]",
              disabled && "cursor-not-allowed"
            )}
            onClick={() => !disabled && onDisplayModeChange("card")}
            title="Visualização em cartões"
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
        </div>
        
        <HelpTooltip
          title="Controles da Tabela"
          description="Compare produtos, escolha entre visualização em lista ou cartões, e ordene os itens por preço."
        />
      </div>
    </div>
  );
}
