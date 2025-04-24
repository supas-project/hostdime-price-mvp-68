
import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { diskData } from "@/data/disk-data";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { HardDrive, Plus, Trash2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { PricedDiskOption } from "@/types/storage";
import { toast } from "sonner";

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
      <div className="grid gap-4">
        <Select onValueChange={setSelectedDiskType} value={selectedDiskType}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Selecione o tipo de disco" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="nvme">NVMe (Ultra Rápido)</SelectItem>
            <SelectItem value="ssd">SSD (Rápido)</SelectItem>
            <SelectItem value="hdd">HDD (Econômico)</SelectItem>
          </SelectContent>
        </Select>

        {selectedDiskType && (
          <Select onValueChange={setSelectedCapacity} value={selectedCapacity}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Selecione a capacidade" />
            </SelectTrigger>
            <SelectContent>
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
            className="w-full bg-[#f58220] hover:bg-[#f58220]/90"
          >
            <Plus className="w-4 h-4 mr-2" />
            Adicionar Disco
          </Button>
        )}
      </div>

      {selectedDisks.length > 0 && (
        <div className="space-y-4">
          <h4 className="font-medium text-base">Discos Selecionados</h4>
          <div className="grid gap-2">
            {selectedDisks.map((disk, index) => {
              const specs = disk.specs;
              return (
                <Card key={index} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <HardDrive className="w-4 h-4 text-[#f58220]" />
                      <div>
                        <p className="font-medium">
                          {disk.type.toUpperCase()} - {disk.capacity}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {specs.readSpeed} leitura / {specs.writeSpeed} escrita
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-[#f58220] font-medium">
                        {formatCurrency(disk.price)}/mês
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveDisk(index)}
                        className="text-destructive hover:text-destructive/90"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
