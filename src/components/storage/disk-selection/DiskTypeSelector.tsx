
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
      <SelectTrigger className={cn(
        "w-full bg-[#1e1e1e] border-[#2a2a2a] text-white transition-colors",
        "hover:border-[#f58220] text-xs sm:text-sm py-2 px-2.5 sm:py-2.5 sm:px-4",
        "min-h-[40px] touch-target"
      )}>
        <SelectValue placeholder="Tipo de disco" />
      </SelectTrigger>
      <SelectContent className="z-[51] bg-[#1e1e1e] border-[#2a2a2a] max-h-[220px]">
        <SelectItem value="nvme" className="hover:bg-[#2a2a2a] py-2 sm:py-2.5">NVMe (Alta Performance)</SelectItem>
        <SelectItem value="ssd" className="hover:bg-[#2a2a2a] py-2 sm:py-2.5">SSD (Intermediário)</SelectItem>
        <SelectItem value="hdd" className="hover:bg-[#2a2a2a] py-2 sm:py-2.5">HDD (Econômico)</SelectItem>
      </SelectContent>
    </Select>
  );
}
