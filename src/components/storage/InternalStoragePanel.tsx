
import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { diskData } from "@/data/disk-data";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { HardDrive, Plus, Trash2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { PricedDiskOption } from "@/types/storage";
import { toast } from "sonner";
import { HelpTooltip } from "@/components/help-tooltip";

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
        <div className="space-y-2">
          <label className="text-sm font-medium flex items-center gap-2">
            Tipo de Disco
            <HelpTooltip
              title="Tipos de Disco"
              description="NVMe oferece máximo desempenho, SSD equilibra velocidade e custo, HDD é mais econômico para grande capacidade"
            />
          </label>
          <Select 
            onValueChange={setSelectedDiskType} 
            value={selectedDiskType}
          >
            <SelectTrigger className="w-full bg-background transition-all duration-300 hover:border-primary/50 focus:ring-2 focus:ring-primary/20">
              <SelectValue placeholder="Selecione o tipo de disco" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="nvme">NVMe (Ultra Rápido)</SelectItem>
              <SelectItem value="ssd">SSD (Rápido)</SelectItem>
              <SelectItem value="hdd">HDD (Econômico)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {selectedDiskType && (
          <div className="space-y-2 animate-fade-in">
            <label className="text-sm font-medium flex items-center gap-2">
              Capacidade
              <HelpTooltip
                title="Capacidade do Disco"
                description="Escolha o tamanho do disco de acordo com sua necessidade de armazenamento"
              />
            </label>
            <Select onValueChange={setSelectedCapacity} value={selectedCapacity}>
              <SelectTrigger className="w-full bg-background transition-all duration-300 hover:border-primary/50 focus:ring-2 focus:ring-primary/20">
                <SelectValue placeholder="Selecione a capacidade" />
              </SelectTrigger>
              <SelectContent>
                {availableDisks.map((disk) => (
                  <SelectItem key={disk.id} value={disk.capacity}>
                    <div className="flex justify-between items-center gap-4">
                      <span>{disk.capacity}</span>
                      <span className="text-primary font-medium">
                        {formatCurrency(disk.price)}/mês
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {selectedDiskType && selectedCapacity && (
          <Button 
            onClick={handleAddDisk} 
            className="w-full bg-primary hover:bg-primary-hover text-primary-foreground transition-all duration-300"
          >
            <Plus className="w-4 h-4 mr-2" />
            Adicionar Disco
          </Button>
        )}
      </div>

      {selectedDisks.length > 0 && (
        <div className="space-y-4 animate-fade-in">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-base">Discos Selecionados</h4>
            <span className="text-sm text-muted-foreground">
              {selectedDisks.length} {selectedDisks.length === 1 ? 'disco' : 'discos'}
            </span>
          </div>
          <div className="grid gap-3">
            {selectedDisks.map((disk, index) => {
              const specs = disk.specs;
              return (
                <Card 
                  key={index} 
                  className="p-4 transition-all duration-300 hover:border-primary/30 hover:-translate-y-0.5 animate-fade-in"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <HardDrive className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">
                          {disk.type.toUpperCase()} - {disk.capacity}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <p className="text-sm text-muted-foreground">
                            {specs.readSpeed} leitura / {specs.writeSpeed} escrita
                          </p>
                          <HelpTooltip
                            title="Velocidades"
                            description={`Velocidade de leitura: ${specs.readSpeed}, Velocidade de escrita: ${specs.writeSpeed}, IOPS: ${specs.iops}`}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-primary font-medium">
                        {formatCurrency(disk.price)}/mês
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveDisk(index)}
                        className="text-destructive hover:text-destructive/90 hover:bg-destructive/10 transition-colors duration-200"
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
