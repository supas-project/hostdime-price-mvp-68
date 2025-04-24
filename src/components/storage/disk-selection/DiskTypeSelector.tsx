
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface DiskTypeSelectorProps {
  selectedType: "nvme" | "ssd" | "hdd" | undefined;
  onTypeSelect: (type: "nvme" | "ssd" | "hdd") => void;
}

export function DiskTypeSelector({ selectedType, onTypeSelect }: DiskTypeSelectorProps) {
  return (
    <Select 
      value={selectedType} 
      onValueChange={onTypeSelect}
    >
      <SelectTrigger className="bg-[#1e1e1e] border-[#2a2a2a] text-white hover:border-[#f58220] transition-colors">
        <SelectValue placeholder="Tipo de disco" />
      </SelectTrigger>
      <SelectContent className="z-[51] bg-[#1e1e1e] border-[#2a2a2a]">
        <SelectItem value="nvme">NVMe</SelectItem>
        <SelectItem value="ssd">SSD</SelectItem>
        <SelectItem value="hdd">HDD</SelectItem>
      </SelectContent>
    </Select>
  );
}
