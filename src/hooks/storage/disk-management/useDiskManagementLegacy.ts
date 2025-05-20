// This is simply a copy of the original file for backward compatibility
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
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Restore selected disks from local storage on initial load
  useEffect(() => {
    try {
      if (!isInitialLoad) return;
      
      console.log("Initial load - restoring disk selections from storage");
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
      
      setIsInitialLoad(false);
      
      // Também tentamos restaurar do banco de dados
      loadSelectedDisksFromDatabase();
    } catch (error) {
      console.error("Error restoring disk selections from local storage:", error);
      setIsInitialLoad(false);
    }
  }, [isInitialLoad]);

  // Load disks from database
  const loadSelectedDisksFromDatabase = async () => {
    try {
      console.log("Checking for previously saved disk selections in database");
      const data = await PriceService.getAllData();
      
      if (data && data.discos_internos && data.discos_internos.items && data.discos_internos.items.length > 0) {
        console.log("Found saved disk selections in database:", data.discos_internos.items);
        
        // Convert database items to disk selections
        const databaseDisks = data.discos_internos.items.map(item => {
          // Extract disk type from subtype
          const diskType = item.subtype as "nvme" | "ssd" | "hdd";
          
          // Extract capacity from name or specs
          let capacity = "";
          if (item.specs && item.specs.some(spec => spec.includes('Capacidade:'))) {
            const capacitySpec = item.specs.find(spec => spec.includes('Capacidade:'));
            if (capacitySpec) {
              capacity = capacitySpec.split(':')[1]?.trim() || "";
            }
          } else {
            // Extract from name
            const capacityMatch = item.name.match(/(\d+)TB|(\d+\.?\d*)TB|(\d+)GB/i);
            if (capacityMatch) {
              if (capacityMatch[1]) capacity = `${capacityMatch[1]}TB`;
              else if (capacityMatch[2]) capacity = `${capacityMatch[2]}TB`;
              else if (capacityMatch[3]) capacity = `${capacityMatch[3]}GB`;
            }
          }
          
          // Create disk object
          const disk: PricedDiskOption = {
            id: item.id,
            type: diskType,
            capacity: normalizeStorageCapacity(capacity),
            price: item.price / (item.metadata?.quantity || 1), // Calculate unit price
            specs: {
              readSpeed: "N/A",
              writeSpeed: "N/A",
              iops: "N/A",
              recommended: []
            }
          };
          
          return {
            disk,
            quantity: item.metadata?.quantity || 1
          };
        });
        
        // Only update if there's something in the database and local storage is empty
        if (databaseDisks.length > 0 && selectedDisks.length === 0) {
          console.log("Setting disks from database:", databaseDisks);
          setSelectedDisks(databaseDisks);
          
          // Also update disk type if not already set
          if (!selectedDiskType && databaseDisks[0]?.disk.type) {
            setSelectedDiskType(databaseDisks[0].disk.type);
          }
        }
      }
    } catch (error) {
      console.error("Error loading disk selections from database:", error);
    }
  };

  // Filter disks by currently selected type for display
  const visibleDisks = selectedDisks.filter(
    item => selectedDiskType ? item.disk.type === selectedDiskType : true
  );

  // Save selected disks to local storage whenever they change
  useEffect(() => {
    if (isInitialLoad) return; // Skip during initial load
    
    try {
      localStorage.setItem('selected_disks', JSON.stringify(selectedDisks));
      if (selectedDiskType) {
        localStorage.setItem('selected_disk_type', selectedDiskType);
      }
      
      // Mark as needing synchronization with database
      if (selectedDisks.length > 0 || isPersisted) {
        setIsPersisted(false);
      }
      
      console.log("Saved disk selections to local storage:", selectedDisks.length);
    } catch (error) {
      console.error("Error saving disk selections to local storage:", error);
    }
  }, [selectedDisks, selectedDiskType, isInitialLoad]);
  
  // Persist to database when changes are made
  useEffect(() => {
    if (isInitialLoad) return; // Skip during initial load
    
    if (!isPersisted) {
      const saveToDatabase = async () => {
        try {
          console.log("Saving disk selections to database:", selectedDisks.length);
          
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
            price: item.disk.price * item.quantity,
            type: 'disk',
            subtype: item.disk.type,
            metadata: {
              quantity: item.quantity
            },
            specs: [
              `Capacidade: ${item.disk.capacity}`,
              `Tipo: ${item.disk.type.toUpperCase()}`
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
          toast.error("Erro ao salvar discos", {
            description: "Não foi possível salvar as alterações no banco de dados. Tente novamente mais tarde."
          });
        }
      };
      
      // Save with a small delay to avoid excessive database calls
      const timerId = setTimeout(saveToDatabase, 1000);
      return () => clearTimeout(timerId);
    }
  }, [selectedDisks, isPersisted, isInitialLoad]);

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

  // Force reload when page becomes visible again
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log("Page visibility changed to visible, checking for updates");
        
        // Check if we should sync with database
        const checkDatabaseSync = async () => {
          try {
            // Check if there are conflicts
            const hasConflicts = await PriceService.checkForDataConflicts();
            
            if (hasConflicts) {
              console.log("Data conflicts detected, refreshing from database");
              
              // Get latest data
              const latestData = await PriceService.forceRefreshFromLatestSource();
              
              if (latestData && latestData.discos_internos && latestData.discos_internos.items) {
                // Compare with current selections
                setIsInitialLoad(true); // Trigger reload from storage/database
              }
            }
          } catch (error) {
            console.error("Error checking for database conflicts:", error);
          }
        };
        
        checkDatabaseSync();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

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
