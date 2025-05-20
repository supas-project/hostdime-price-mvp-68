import { useState, useEffect } from "react";
import { PricedDiskOption } from "@/types/storage";
import { normalizeStorageCapacity } from "@/utils/storage-utils";
import { PriceService } from "@/services/price-service";
import { toast } from "sonner";

interface UseDiskManagementProps {
  onSelectDisk?: (disk: PricedDiskOption, quantity: number) => void;
}

export function useDiskManagement({ onSelectDisk }: UseDiskManagementProps) {
  const [selectedDiskType, setSelectedDiskType] = useState<"nvme" | "ssd" | "hdd" | undefined>(undefined);
  const [selectedCapacity, setSelectedCapacity] = useState("");
  const [selectedDisks, setSelectedDisks] = useState<Array<{disk: PricedDiskOption, quantity: number}>>([]);
  const [availableDisks, setAvailableDisks] = useState<PricedDiskOption[]>([]);

  // Filter disks by currently selected type for display
  const visibleDisks = selectedDisks.filter(
    item => selectedDiskType ? item.disk.type === selectedDiskType : true
  );

  const handleTypeSelect = (type: "nvme" | "ssd" | "hdd") => {
    // Update selected type
    setSelectedDiskType(type);
    setSelectedCapacity("");
    
    // Notify user about context change
    if (selectedDisks.length > 0 && selectedDisks.some(item => item.disk.type !== type)) {
      toast.info(`Agora você está configurando discos ${type.toUpperCase()}`, {
        description: "Os discos já adicionados foram mantidos no seu carrinho"
      });
    }
  };

  const handleCapacitySelect = (capacity: string) => {
    setSelectedCapacity(capacity);
    const disk = availableDisks.find(d => d.capacity === capacity);
    
    if (disk) {
      // Check if this type and capacity already exist
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

      // Reset capacity but keep disk type for additional selections
      setSelectedCapacity("");
      toast.success("Disco adicionado com sucesso");
    }
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

  return {
    selectedDiskType,
    setSelectedDiskType,
    selectedCapacity,
    setSelectedCapacity,
    selectedDisks,
    setSelectedDisks,
    availableDisks,
    setAvailableDisks,
    visibleDisks,
    handleTypeSelect,
    handleCapacitySelect,
    handleQuantityChange,
    handleRemoveDisk
  };
}
