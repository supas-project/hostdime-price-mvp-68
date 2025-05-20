import { PricedDiskOption } from "@/types/storage";
import { toast } from "sonner";

interface DiskActionsProps {
  setSelectedDiskType: (type: "nvme" | "ssd" | "hdd") => void;
  setSelectedCapacity: (capacity: string) => void;
  selectedDisks: Array<{disk: PricedDiskOption, quantity: number}>;
  setSelectedDisks: React.Dispatch<React.SetStateAction<Array<{disk: PricedDiskOption, quantity: number}>>>;
  availableDisks: PricedDiskOption[];
  setIsPersisted: (isPersisted: boolean) => void;
  onSelectDisk?: (disk: PricedDiskOption, quantity: number) => void;
}

export function useDiskActions({
  setSelectedDiskType,
  setSelectedCapacity,
  selectedDisks,
  setSelectedDisks,
  availableDisks,
  setIsPersisted,
  onSelectDisk
}: DiskActionsProps) {
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
      setIsPersisted(false);
      
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
    setIsPersisted(false);
  };

  const handleRemoveDisk = (diskId: string) => {
    console.log("Removing disk:", diskId);
    
    const diskToRemove = selectedDisks.find(item => item.disk.id === diskId);
    setSelectedDisks(prev => prev.filter(item => item.disk.id !== diskId));
    setIsPersisted(false);
    
    if (onSelectDisk && diskToRemove) {
      onSelectDisk({
        ...diskToRemove.disk,
        price: 0
      }, 0);
    }
    
    toast.success("Disco removido com sucesso");
  };

  return {
    handleTypeSelect,
    handleCapacitySelect,
    handleQuantityChange,
    handleRemoveDisk
  };
}
