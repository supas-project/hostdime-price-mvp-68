
import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { diskData } from "@/data/disk-data";
import { Button } from "@/components/ui/button";
import { HardDrive } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export function InternalStoragePanel() {
  const [selectedDiskType, setSelectedDiskType] = useState("");
  const [selectedCapacity, setSelectedCapacity] = useState("");
  const [selectedDisks, setSelectedDisks] = useState<any[]>([]);

  const availableDisks = diskData.filter(disk => disk.type === selectedDiskType);

  const handleAddDisk = () => {
    const disk = diskData.find(d => 
      d.type === selectedDiskType && d.capacity === selectedCapacity
    );
    
    if (disk) {
      setSelectedDisks([...selectedDisks, disk]);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4">
        <div>
          <Select onValueChange={setSelectedDiskType} value={selectedDiskType}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Selecione o tipo de disco" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="nvme">NVMe (Mais rápido)</SelectItem>
              <SelectItem value="ssd">SSD (Equilibrado)</SelectItem>
              <SelectItem value="hdd">HDD (Econômico)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {selectedDiskType && (
          <div>
            <Select onValueChange={setSelectedCapacity} value={selectedCapacity}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecione a capacidade" />
              </SelectTrigger>
              <SelectContent>
                {availableDisks.map((disk) => (
                  <SelectItem key={disk.id} value={disk.capacity}>
                    {disk.capacity} ({formatCurrency(disk.price)}/mês)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {selectedDiskType && selectedCapacity && (
          <Button onClick={handleAddDisk} className="w-full">
            <HardDrive className="w-4 h-4 mr-2" />
            Adicionar Disco
          </Button>
        )}
      </div>

      {selectedDisks.length > 0 && (
        <div className="space-y-4">
          <h4 className="font-medium">Discos Selecionados</h4>
          <div className="grid gap-2">
            {selectedDisks.map((disk, index) => (
              <div key={index} className="flex justify-between items-center p-3 bg-muted rounded-lg">
                <div className="flex items-center space-x-2">
                  <HardDrive className="w-4 h-4" />
                  <span>
                    {disk.type.toUpperCase()} - {disk.capacity}
                  </span>
                </div>
                <span className="text-primary">{formatCurrency(disk.price)}/mês</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
