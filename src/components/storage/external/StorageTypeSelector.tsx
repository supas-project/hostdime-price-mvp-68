
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

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
  // Get badge variant based on storage type
  const getBadgeVariant = (type: string): "default" | "secondary" | "outline" | "success" | "warning" | "info" => {
    switch (type.toLowerCase()) {
      case 'standard': return "info";
      case 'performance': return "warning";
      case 'premium': return "success";
      default: return "secondary";
    }
  };
  
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
            className={cn(
              "transition-colors duration-200",
              selectedType === key ? "bg-accent" : ""
            )}
          >
            <div className="flex flex-col gap-1 py-1">
              <div className="flex items-center justify-between">
                <span className="font-medium">{type.name}</span>
                <Badge variant={getBadgeVariant(key)} className="ml-2">
                  {type.pricePerGB.toFixed(2)}/GB
                </Badge>
              </div>
              <span className="text-xs text-muted-foreground">{type.description}</span>
              <div className="flex items-center justify-between mt-1 text-xs">
                <span>{type.iops}</span>
                <span>{type.throughput}</span>
              </div>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
