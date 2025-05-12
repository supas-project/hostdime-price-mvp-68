
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, ArrowUp, ArrowDown } from "lucide-react";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

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
    <div className="flex flex-col sm:flex-row gap-3 mb-4 items-center">
      <div className="relative flex-1 w-full">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar componentes..."
          value={searchTerm}
          onChange={handleSearchChange}
          className="pl-9 w-full"
        />
      </div>
      
      <div className="flex items-center gap-2 w-full sm:w-auto">
        <Button
          variant="outline"
          size="icon"
          onClick={handleSortClick}
          className={cn(sortOrder !== null && "bg-accent")}
          title={sortOrder === "asc" ? "Ordenar por preço (maior para menor)" : 
                 sortOrder === "desc" ? "Remover ordenação" : 
                 "Ordenar por preço (menor para maior)"}
        >
          {sortOrder === "asc" ? (
            <ArrowUp className="h-4 w-4" />
          ) : sortOrder === "desc" ? (
            <ArrowDown className="h-4 w-4" />
          ) : (
            <ArrowUp className="h-4 w-4 text-muted-foreground" />
          )}
        </Button>
        
        <Select
          value={displayMode}
          onValueChange={(value) => onDisplayModeChange(value as "table" | "card")}
        >
          <SelectTrigger className="w-[130px]">
            <SelectValue placeholder="Visualização" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="table">Lista</SelectItem>
            <SelectItem value="card">Cartões</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
