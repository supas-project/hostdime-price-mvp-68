
import { useState, useEffect } from "react";
import { PricedDiskOption } from "@/types/storage";
import { normalizeStorageCapacity } from "@/utils/storage-utils";
import { PriceService } from "@/services/price-service";
import { toast } from "sonner";

interface UseDiskManagementProps {
  onSelectDisk?: (disk: PricedDiskOption, quantity: number) => void;
}

export function useDiskManagement({ onSelectDisk }: UseDiskManagementProps) {
  // State for disk management
  const [selectedDiskType, setSelectedDiskType] = useState<"nvme" | "ssd" | "hdd" | undefined>(undefined);
  const [selectedCapacity, setSelectedCapacity] = useState("");
  const [selectedDisks, setSelectedDisks] = useState<Array<{disk: PricedDiskOption, quantity: number}>>([]);
  const [availableDisks, setAvailableDisks] = useState<PricedDiskOption[]>([]);
  const [isPersisted, setIsPersisted] = useState(true);

  // Restore selected disks from local storage on initial load
  useEffect(() => {
    try {
      const savedDisks = localStorage.getItem('selected_disks');
      const savedDiskType = localStorage.getItem('selected_disk_type');
      
      if (savedDisks) {
        const parsedDisks = JSON.parse(savedDisks);
        setSelectedDisks(parsedDisks);
        console.log("Restored selected disks from local storage:", parsedDisks.length);
      }
      
      if (savedDiskType) {
        setSelectedDiskType(savedDiskType as "nvme" | "ssd" | "hdd");
        console.log("Restored selected disk type from local storage:", savedDiskType);
      }
    } catch (error) {
      console.error("Error restoring disk selections from local storage:", error);
    }
  }, []);

  // Filter disks by currently selected type for display
  const visibleDisks = selectedDisks.filter(
    item => selectedDiskType ? item.disk.type === selectedDiskType : true
  );

  // Save selected disks to local storage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('selected_disks', JSON.stringify(selectedDisks));
      if (selectedDiskType) {
        localStorage.setItem('selected_disk_type', selectedDiskType);
      }
      
      // Mark as needing synchronization with database
      if (selectedDisks.length > 0) {
        setIsPersisted(false);
      }
    } catch (error) {
      console.error("Error saving disk selections to local storage:", error);
    }
  }, [selectedDisks, selectedDiskType]);
  
  // Persist to database when changes are made
  useEffect(() => {
    if (!isPersisted && selectedDisks.length > 0) {
      const saveToDatabase = async () => {
        try {
          // Get existing price data
          const allData = await PriceService.getAllData();
          
          // Make sure we have the discos_internos category
          if (!allData.discos_internos) {
            allData.discos_internos = {
              id: 'discos_internos',
              name: 'Discos Internos',
              items: []
            };
          }
          
          // Convert selected disks to price items
          const diskItems = selectedDisks.map(item => ({
            id: item.disk.id,
            name: `${item.disk.type.toUpperCase()} ${item.disk.capacity}`,
            description: `${item.disk.type.toUpperCase()} disk with ${item.disk.capacity} capacity`,
            price: item.disk.price,
            type: 'disk',
            subtype: item.disk.type,
            metadata: {
              quantity: item.quantity
            },
            specs: [
              `Capacity: ${item.disk.capacity}`,
              `Type: ${item.disk.type.toUpperCase()}`
            ]
          }));
          
          // Update items in the category
          allData.discos_internos.items = diskItems;
          
          // Save to database
          await PriceService.saveData(allData);
          console.log("Disk selections saved to database:", diskItems.length);
          setIsPersisted(true);
        } catch (error) {
          console.error("Error saving disk selections to database:", error);
        }
      };
      
      // Save with a small delay to avoid excessive database calls
      const timerId = setTimeout(saveToDatabase, 1000);
      return () => clearTimeout(timerId);
    }
  }, [selectedDisks, isPersisted]);

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
    setSelectedDisks(prev => prev.filter(item => item.disk.id !== diskId));
    setIsPersisted(false);
    
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
