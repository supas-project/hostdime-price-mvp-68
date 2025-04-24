
import { useState, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { diskData } from "@/data/disk-data";
import { CircleDot } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { PricedDiskOption } from "@/types/storage";
import { cn } from "@/lib/utils";
import { QuantitySelector } from "@/components/quantity-selector";

interface InternalStoragePanelProps {
  onSelectDisk?: (disk: PricedDiskOption, quantity: number) => void;
}

export function InternalStoragePanel({ onSelectDisk }: InternalStoragePanelProps) {
  const [selectedDiskType, setSelectedDiskType] = useState("");
  const [selectedCapacity, setSelectedCapacity] = useState("");
  const [selectedDisk, setSelectedDisk] = useState<PricedDiskOption | null>(null);
  const [quantity, setQuantity] = useState(1);

  const availableDisks = diskData.filter(disk => disk.type === selectedDiskType);

  const handleCapacitySelect = (capacity: string) => {
    setSelectedCapacity(capacity);
    const disk = diskData.find(d => d.type === selectedDiskType && d.capacity === capacity);
    if (disk) {
      setSelectedDisk(disk);
      // Reset quantity when selecting a new disk
      setQuantity(1);
      if (onSelectDisk) {
        onSelectDisk(disk, 1);
      }
    }
  };

  const handleTypeSelect = (type: string) => {
    setSelectedDiskType(type);
    setSelectedCapacity("");
    setSelectedDisk(null);
    setQuantity(1);
  };

  const handleQuantityChange = (newQuantity: number) => {
    setQuantity(newQuantity);
    if (selectedDisk && onSelectDisk) {
      onSelectDisk(selectedDisk, newQuantity);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-2 gap-4">
        <Select 
          value={selectedDiskType} 
          onValueChange={handleTypeSelect}
        >
          <SelectTrigger className="bg-[#1e1e1e] border-[#2a2a2a] text-white hover:border-[#f58220] transition-colors">
            <SelectValue placeholder="Tipo de disco" />
          </SelectTrigger>
          <SelectContent className="bg-[#1e1e1e] border-[#2a2a2a]">
            <SelectItem value="nvme">NVMe</SelectItem>
            <SelectItem value="ssd">SSD</SelectItem>
            <SelectItem value="hdd">HDD</SelectItem>
          </SelectContent>
        </Select>

        <Select 
          value={selectedCapacity} 
          onValueChange={handleCapacitySelect}
          disabled={!selectedDiskType}
        >
          <SelectTrigger 
            className={cn(
              "bg-[#1e1e1e] border-[#2a2a2a] text-white transition-colors",
              selectedDiskType ? "hover:border-[#f58220]" : "opacity-50"
            )}
          >
            <SelectValue placeholder="Capacidade" />
          </SelectTrigger>
          <SelectContent className="bg-[#1e1e1e] border-[#2a2a2a]">
            {availableDisks.map((disk) => (
              <SelectItem key={disk.id} value={disk.capacity}>
                <div className="flex justify-between items-center gap-4">
                  <span>{disk.capacity}</span>
                  <span className="text-[#f58220] font-medium">
                    {formatCurrency(disk.price)}/mês
                  </span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedDisk && (
        <div className="animate-fade-in">
          <div className="flex items-center justify-between p-3 rounded-lg bg-[#1e1e1e] border border-[#2a2a2a] transition-all duration-300">
            <div className="flex items-center gap-3">
              <CircleDot className="w-4 h-4 text-[#f58220]" />
              <span className="text-white">
                {selectedDisk.type.toUpperCase()} {selectedDisk.capacity}
              </span>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-white">Quantidade:</span>
                <QuantitySelector 
                  value={quantity} 
                  onChange={handleQuantityChange} 
                  min={1} 
                  max={10} 
                />
              </div>
              <span className="text-[#f58220] font-medium">
                {formatCurrency(selectedDisk.price * quantity)}/mês
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
