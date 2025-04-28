
import { useState, useEffect } from "react";
import { diskData } from "@/data/disk-data";
import { PricedDiskOption } from "@/types/storage";
import { DiskTypeSelector } from "./disk-selection/DiskTypeSelector";
import { DiskCapacitySelector } from "./disk-selection/DiskCapacitySelector";
import { SelectedDiskDisplay } from "./disk-selection/SelectedDiskDisplay";
import { toast } from "sonner";
import { PriceService } from "@/services/price-service";

interface InternalStoragePanelProps {
  onSelectDisk?: (disk: PricedDiskOption, quantity: number) => void;
}

export function InternalStoragePanel({ onSelectDisk }: InternalStoragePanelProps) {
  const [selectedDiskType, setSelectedDiskType] = useState<"nvme" | "ssd" | "hdd" | undefined>(undefined);
  const [selectedCapacity, setSelectedCapacity] = useState("");
  const [selectedDisks, setSelectedDisks] = useState<Array<{disk: PricedDiskOption, quantity: number}>>([]);
  const [availableDisks, setAvailableDisks] = useState<PricedDiskOption[]>([]);

  // Carregar dados de disco da tabela de preços
  useEffect(() => {
    const loadDisksFromPriceTable = () => {
      try {
        const diskCategory = PriceService.getCategory('disk');
        if (!diskCategory) return;
        
        // Converter itens da tabela de preços para formato de disco
        const disks: PricedDiskOption[] = diskCategory.items
          .filter(item => item.subtype === selectedDiskType)
          .map(item => {
            // Extrair capacidade do nome
            const capacityMatches = item.name.match(/(\d+)TB|(\d+\.?\d*)TB|(\d+)GB/i);
            let capacity = "";
            
            if (capacityMatches) {
              if (capacityMatches[1]) capacity = `${capacityMatches[1]}TB`;
              else if (capacityMatches[2]) capacity = `${capacityMatches[2]}TB`;
              else if (capacityMatches[3]) capacity = `${capacityMatches[3]}GB`;
            }
            
            return {
              id: item.id,
              type: item.subtype as "nvme" | "ssd" | "hdd",
              capacity,
              price: item.price,
              specs: item.specs || []
            };
          });
        
        setAvailableDisks(disks);
      } catch (error) {
        console.error('Erro ao carregar discos:', error);
        // Fallback para dados estáticos originais
        const fallbackDisks = selectedDiskType ? diskData.filter(disk => disk.type === selectedDiskType) : [];
        setAvailableDisks(fallbackDisks);
      }
    };

    // Carregar discos quando o tipo muda
    if (selectedDiskType) {
      loadDisksFromPriceTable();
    } else {
      setAvailableDisks([]);
    }
  }, [selectedDiskType]);

  // Registrar listener para atualização de dados
  useEffect(() => {
    const updateDisks = () => {
      if (selectedDiskType) {
        const diskCategory = PriceService.getCategory('disk');
        if (!diskCategory) return;
        
        // Atualiza discos disponíveis quando os dados mudam
        const disks: PricedDiskOption[] = diskCategory.items
          .filter(item => item.subtype === selectedDiskType)
          .map(item => {
            // Extrair capacidade do nome
            const capacityMatches = item.name.match(/(\d+)TB|(\d+\.?\d*)TB|(\d+)GB/i);
            let capacity = "";
            
            if (capacityMatches) {
              if (capacityMatches[1]) capacity = `${capacityMatches[1]}TB`;
              else if (capacityMatches[2]) capacity = `${capacityMatches[2]}TB`;
              else if (capacityMatches[3]) capacity = `${capacityMatches[3]}GB`;
            }
            
            return {
              id: item.id,
              type: item.subtype as "nvme" | "ssd" | "hdd",
              capacity,
              price: item.price,
              specs: item.specs || []
            };
          });
        
        setAvailableDisks(disks);
      }
    };

    // Registrar para mudanças na tabela de preços
    PriceService.addDataChangeListener(updateDisks);
    
    // Limpar listener quando o componente é desmontado
    return () => {
      PriceService.removeDataChangeListener(updateDisks);
    };
  }, [selectedDiskType]);

  const handleCapacitySelect = (capacity: string) => {
    setSelectedCapacity(capacity);
    const disk = availableDisks.find(d => d.capacity === capacity);
    
    if (disk) {
      // Verificar se este tipo e capacidade já existem
      const existingDisk = selectedDisks.find(
        item => item.disk.type === disk.type && item.disk.capacity === capacity
      );

      if (existingDisk) {
        toast.error("Este tipo e capacidade de disco já está selecionado");
        return;
      }

      const newDisk = { disk, quantity: 1 };
      setSelectedDisks(prev => [...prev, newDisk]);
      
      if (onSelectDisk) {
        onSelectDisk(disk, 1);
      }

      // Resetar capacidade mas manter tipo de disco para seleções adicionais
      setSelectedCapacity("");
      toast.success("Disco adicionado com sucesso");
    }
  };

  const handleTypeSelect = (type: "nvme" | "ssd" | "hdd") => {
    setSelectedDiskType(type);
    setSelectedCapacity("");
  };

  const handleQuantityChange = (diskId: string, newQuantity: number) => {
    setSelectedDisks(prev => prev.map(item => {
      if (item.disk.id === diskId) {
        if (onSelectDisk) {
          onSelectDisk(item.disk, newQuantity);
        }
        return { ...item, quantity: newQuantity };
      }
      return item;
    }));
  };

  const handleRemoveDisk = (diskId: string) => {
    setSelectedDisks(prev => prev.filter(item => item.disk.id !== diskId));
    if (onSelectDisk) {
      const diskToRemove = selectedDisks.find(item => item.disk.id === diskId);
      if (diskToRemove) {
        onSelectDisk({
          ...diskToRemove.disk,
          price: 0
        }, 0);
      }
    }
    toast.success("Disco removido com sucesso");
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-2 gap-4">
        <DiskTypeSelector
          selectedType={selectedDiskType}
          onTypeSelect={handleTypeSelect}
        />
        <DiskCapacitySelector
          selectedCapacity={selectedCapacity}
          onCapacitySelect={handleCapacitySelect}
          availableDisks={availableDisks}
          disabled={!selectedDiskType}
        />
      </div>

      {selectedDisks.length > 0 && (
        <div className="space-y-4">
          {selectedDisks.map((item) => (
            <div key={item.disk.id} className="animate-fade-in">
              <SelectedDiskDisplay
                disk={item.disk}
                quantity={item.quantity}
                onQuantityChange={(qty) => handleQuantityChange(item.disk.id, qty)}
                onRemove={() => handleRemoveDisk(item.disk.id)}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
