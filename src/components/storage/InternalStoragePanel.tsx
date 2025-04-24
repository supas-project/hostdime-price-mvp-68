
import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { diskData } from "@/data/disk-data";
import { Button } from "@/components/ui/button";
import { CircleDot, HardDrive, Plus, Trash2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { PricedDiskOption } from "@/types/storage";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function InternalStoragePanel() {
  const [selectedDiskType, setSelectedDiskType] = useState("");
  const [selectedCapacity, setSelectedCapacity] = useState("");
  const [selectedDisks, setSelectedDisks] = useState<PricedDiskOption[]>([]);

  const availableDisks = diskData.filter(disk => disk.type === selectedDiskType);

  const handleAddDisk = () => {
    const disk = diskData.find(d => 
      d.type === selectedDiskType && d.capacity === selectedCapacity
    );
    
    if (disk) {
      setSelectedDisks([...selectedDisks, disk]);
      toast.success("Disco adicionado com sucesso!");
    }
  };

  const handleRemoveDisk = (index: number) => {
    setSelectedDisks(disks => disks.filter((_, i) => i !== index));
    toast.success("Disco removido com sucesso!");
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-2 gap-4">
        <Select 
          onValueChange={setSelectedDiskType} 
          value={selectedDiskType}
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

        {selectedDiskType && (
          <Select onValueChange={setSelectedCapacity} value={selectedCapacity}>
            <SelectTrigger className="bg-[#1e1e1e] border-[#2a2a2a] text-white hover:border-[#f58220] transition-colors">
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
        )}

        {selectedDiskType && selectedCapacity && (
          <Button 
            onClick={handleAddDisk} 
            className="col-span-2 bg-[#f58220] hover:bg-[#f58220]/90 text-white transition-all duration-300"
          >
            <Plus className="w-4 h-4 mr-2" />
            Adicionar Disco
          </Button>
        )}
      </div>

      {selectedDisks.length > 0 && (
        <div className="space-y-3 animate-fade-in">
          {selectedDisks.map((disk, index) => (
            <div 
              key={index} 
              className="flex items-center justify-between p-3 rounded-lg bg-[#1e1e1e] border border-[#2a2a2a] hover:border-[#f58220]/30 transition-all duration-300"
            >
              <div className="flex items-center gap-3">
                <CircleDot className="w-4 h-4 text-[#f58220]" />
                <span className="text-white">
                  {disk.type.toUpperCase()} {disk.capacity}
                </span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-[#f58220] font-medium">
                  {formatCurrency(disk.price)}/mês
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemoveDisk(index)}
                  className="text-red-500 hover:text-red-400 hover:bg-red-500/10"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
