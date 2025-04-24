
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface StorageType {
  name: string;
  pricePerGB: number;
  iops: string;
  throughput: string;
  description: string;
}

interface StorageTypeSelectorProps {
  storageTypes: Record<string, StorageType>;
  selectedType: string;
  onTypeChange: (value: string) => void;
}

export function StorageTypeSelector({ 
  storageTypes, 
  selectedType, 
  onTypeChange 
}: StorageTypeSelectorProps) {
  return (
    <Select onValueChange={onTypeChange} value={selectedType}>
      <SelectTrigger className="w-full transition-all duration-300 hover:border-primary/50 focus:ring-2 focus:ring-primary/20">
        <SelectValue placeholder="Selecione o tipo de storage" />
      </SelectTrigger>
      <SelectContent>
        {Object.entries(storageTypes).map(([key, type]) => (
          <SelectItem 
            key={key} 
            value={key}
            className="transition-colors duration-200"
          >
            <div className="flex flex-col gap-1">
              <span className="font-medium">{type.name}</span>
              <span className="text-xs text-muted-foreground">{type.description}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
