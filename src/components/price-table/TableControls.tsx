
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, ArrowUp, ArrowDown, LayoutGrid, List } from "lucide-react";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { HelpTooltip } from "@/components/help-tooltip";

interface TableControlsProps {
  displayMode: "table" | "card";
  onDisplayModeChange: (mode: "table" | "card") => void;
  onSearchChange: (term: string) => void;
  onSortChange: (order: "asc" | "desc" | null) => void;
  sortOrder: "asc" | "desc" | null;
}

export function TableControls({ 
  displayMode, 
  onDisplayModeChange,
  onSearchChange,
  onSortChange,
  sortOrder
}: TableControlsProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    onSearchChange(value);
  };

  const handleSortClick = () => {
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
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar componentes..."
          value={searchTerm}
          onChange={handleSearchChange}
          className="pl-9 w-full h-10 text-base border-primary/20 focus:border-primary focus:ring-2 focus:ring-primary/20"
          aria-label="Buscar componentes"
        />
      </div>
      
      <div className="flex items-center gap-2 w-full sm:w-auto">
        <Button
          variant="outline"
          size="icon"
          onClick={handleSortClick}
          className={cn("transition-all", 
            sortOrder !== null && "bg-accent text-accent-foreground border-primary/30"
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
        
        <div className="flex border border-input rounded-md overflow-hidden">
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "h-10 px-3 rounded-none border-r border-input",
              displayMode === "table" && "bg-accent text-accent-foreground"
            )}
            onClick={() => onDisplayModeChange("table")}
            title="Visualização em lista"
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "h-10 px-3 rounded-none",
              displayMode === "card" && "bg-accent text-accent-foreground"
            )}
            onClick={() => onDisplayModeChange("card")}
            title="Visualização em cartões"
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
        </div>
        
        <HelpTooltip
          title="Visualização da Tabela"
          description="Escolha entre visualização em lista ou cartões, e ordene os itens por preço."
        />
      </div>
    </div>
  );
}
