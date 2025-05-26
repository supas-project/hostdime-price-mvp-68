
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface MemoryTypeSelectorProps {
  selectedType: string;
  onTypeChange: (type: string) => void;
  memoryTypes: {
    [key: string]: { 
      name: string;
      pricePerGB: number;
      frequency: string;
      type: string;
      description: string;
    }
  };
}

export function MemoryTypeSelector({ 
  selectedType, 
  onTypeChange, 
  memoryTypes 
}: MemoryTypeSelectorProps) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Tipo de Memória</label>
      <Select value={selectedType} onValueChange={onTypeChange}>
        <SelectTrigger className="w-full bg-[#1e1e1e] border-[#2a2a2a] text-white hover:border-[#f58220] transition-colors">
          <SelectValue placeholder="Selecione o tipo de memória" />
        </SelectTrigger>
        <SelectContent className="bg-[#1e1e1e] border-[#2a2a2a] z-[51]">
          {Object.entries(memoryTypes).map(([key, type]) => (
            <SelectItem 
              key={key} 
              value={key}
              className="hover:bg-[#2a2a2a] focus:bg-[#2a2a2a] text-white"
            >
              <div className="flex flex-col">
                <span>{type.name}</span>
                <span className="text-xs text-muted-foreground">{type.frequency}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
