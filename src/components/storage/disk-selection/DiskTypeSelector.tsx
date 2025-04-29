
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
      <SelectTrigger className="w-full bg-[#1e1e1e] border-[#2a2a2a] text-white hover:border-[#f58220] transition-colors">
        <SelectValue placeholder="Tipo de disco" />
      </SelectTrigger>
      <SelectContent className="z-[51] bg-[#1e1e1e] border-[#2a2a2a]">
        <SelectItem value="nvme" className="hover:bg-[#2a2a2a]">NVMe (Alta Performance)</SelectItem>
        <SelectItem value="ssd" className="hover:bg-[#2a2a2a]">SSD (Intermediário)</SelectItem>
        <SelectItem value="hdd" className="hover:bg-[#2a2a2a]">HDD (Econômico)</SelectItem>
      </SelectContent>
    </Select>
  );
}
