import { useState, useEffect, useRef } from "react";
import { diskData } from "@/data/disk-data";
import { PricedDiskOption } from "@/types/storage";
import { DiskTypeSelector } from "./disk-selection/DiskTypeSelector";
import { DiskCapacitySelector } from "./disk-selection/DiskCapacitySelector";
import { SelectedDiskDisplay } from "./disk-selection/SelectedDiskDisplay";
import { toast } from "sonner";
import { PriceService } from "@/services/price-service";
import { normalizeStorageCapacity } from "@/utils/storage-utils";

interface InternalStoragePanelProps {
  onSelectDisk?: (disk: PricedDiskOption, quantity: number) => void;
}

export function InternalStoragePanel({ onSelectDisk }: InternalStoragePanelProps) {
  const [selectedDiskType, setSelectedDiskType] = useState<"nvme" | "ssd" | "hdd" | undefined>(undefined);
  const [selectedCapacity, setSelectedCapacity] = useState("");
  const [selectedDisks, setSelectedDisks] = useState<Array<{disk: PricedDiskOption, quantity: number}>>([]);
  const [availableDisks, setAvailableDisks] = useState<PricedDiskOption[]>([]);
  
  // Store reference to update function to avoid recreations
  const updateDisksRef = useRef<() => void>();

  // Load disk data from price table
  useEffect(() => {
    const loadDisksFromPriceTable = async () => {
      try {
        if (!selectedDiskType) {
          setAvailableDisks([]);
          return;
        }

        // Start with empty array
        const disks: PricedDiskOption[] = [];
        
        try {
          // Try to get disk category from price table
          const diskCategory = await PriceService.getCategory('disk');
          
          if (diskCategory && diskCategory.items) {
            // Convert price table items to disk format
            const priceTableDisks = diskCategory.items
              .filter(item => item.subtype === selectedDiskType)
              .map(item => {
                // Extract capacity from name
                const capacityMatches = item.name.match(/(\d+)TB|(\d+\.?\d*)TB|(\d+)GB/i);
                let capacity = "";
                
                if (capacityMatches) {
                  if (capacityMatches[1]) capacity = `${capacityMatches[1]}TB`;
                  else if (capacityMatches[2]) capacity = `${capacityMatches[2]}TB`;
                  else if (capacityMatches[3]) capacity = `${capacityMatches[3]}GB`;
                }
                
                // Normalize to ensure capacity has a unit
                capacity = normalizeStorageCapacity(capacity);
                
                // Create properly formatted specs object
                const specsObj = {
                  readSpeed: item.specs?.find(s => s.toLowerCase().includes('leitura'))?.split(':')[1]?.trim() || "N/A",
                  writeSpeed: item.specs?.find(s => s.toLowerCase().includes('escrita'))?.split(':')[1]?.trim() || "N/A",
                  iops: item.specs?.find(s => s.toLowerCase().includes('iops'))?.split(':')[1]?.trim() || "N/A",
                  recommended: item.specs?.filter(s => s.toLowerCase().includes('recomendado')) || []
                };
                
                return {
                  id: item.id,
                  type: item.subtype as "nvme" | "ssd" | "hdd",
                  capacity,
                  price: item.price,
                  specs: specsObj
                };
              });
            
            // Only use price table disks if we found some
            if (priceTableDisks.length > 0) {
              disks.push(...priceTableDisks);
            }
          }
        } catch (error) {
          console.error('Error loading disks from price table:', error);
          // No need to throw here, we'll fall back to static data
        }
        
        // If we didn't get any disks from price table, use static data
        if (disks.length === 0) {
          console.log('Falling back to static disk data');
          const staticDisks = diskData
            .filter(disk => disk.type === selectedDiskType)
            .map(disk => ({
              ...disk,
              capacity: normalizeStorageCapacity(disk.capacity)
            }));
          
          disks.push(...staticDisks);
        }
        
        console.log(`Loaded ${disks.length} disks for type ${selectedDiskType}`, disks);
        setAvailableDisks(disks);
      } catch (error) {
        console.error('Error loading disks:', error);
        // Fallback to static original data as last resort
        if (selectedDiskType) {
          const fallbackDisks = diskData
            .filter(disk => disk.type === selectedDiskType)
            .map(disk => ({
              ...disk,
              capacity: normalizeStorageCapacity(disk.capacity)
            }));
          setAvailableDisks(fallbackDisks);
        } else {
          setAvailableDisks([]);
        }
      }
    };

    // Load disks when type changes
    loadDisksFromPriceTable();
    
    // Store update function for data change listener
    updateDisksRef.current = loadDisksFromPriceTable;
  }, [selectedDiskType]);

  // Register listener for data updates
  useEffect(() => {
    // Define the update function that doesn't take parameters
    const listener = () => {
      if (updateDisksRef.current) {
        updateDisksRef.current();
      }
    };
    
    // Register for price table changes - pass listener without parameters
    PriceService.addDataChangeListener(listener);
    
    // Clean up listener when component unmounts
    return () => {
      PriceService.removeDataChangeListener();
    };
  }, []);

  // Filter disks by currently selected type for display
  const visibleDisks = selectedDisks.filter(
    item => selectedDiskType ? item.disk.type === selectedDiskType : true
  );

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

      {selectedDiskType && (
        <div className="px-3 py-2 bg-primary/10 rounded-md border border-primary/20">
          <p className="text-sm text-center">
            Configurando discos <span className="font-semibold">{selectedDiskType.toUpperCase()}</span>
          </p>
        </div>
      )}

      {visibleDisks.length > 0 ? (
        <div className="space-y-4">
          {visibleDisks.map((item) => (
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
      ) : selectedDisks.length > 0 ? (
        <div className="text-center py-4 text-muted-foreground">
          <p>Nenhum disco {selectedDiskType?.toUpperCase()} adicionado.</p>
          <p className="text-sm mt-1">Selecione uma capacidade para adicionar.</p>
        </div>
      ) : null}

      {selectedDisks.length > 0 && selectedDisks.some(item => item.disk.type !== selectedDiskType) && (
        <div className="mt-4 p-3 bg-card rounded-lg border border-border">
          <p className="text-sm font-medium mb-2">Outros discos no seu servidor:</p>
          <div className="space-y-2">
            {Object.entries(
              selectedDisks
                .filter(item => item.disk.type !== selectedDiskType)
                .reduce((acc, curr) => {
                  const type = curr.disk.type;
                  if (!acc[type]) acc[type] = [];
                  acc[type].push(curr);
                  return acc;
                }, {} as Record<string, typeof selectedDisks>)
            ).map(([type, disks]) => (
              <div key={type} className="flex items-center justify-between">
                <span className="text-sm">
                  {type.toUpperCase()} ({disks.length} {disks.length === 1 ? "disco" : "discos"})
                </span>
                <button
                  onClick={() => setSelectedDiskType(type as "nvme" | "ssd" | "hdd")}
                  className="text-xs text-primary hover:underline"
                >
                  Editar
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
  
  // Define the handler functions
  function handleCapacitySelect(capacity: string) {
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
  }

  function handleTypeSelect(type: "nvme" | "ssd" | "hdd") {
    // Update selected type
    setSelectedDiskType(type);
    setSelectedCapacity("");
    
    // Notify user about context change
    if (selectedDisks.length > 0 && selectedDisks.some(item => item.disk.type !== type)) {
      toast.info(`Agora você está configurando discos ${type.toUpperCase()}`, {
        description: "Os discos já adicionados foram mantidos no seu carrinho"
      });
    }
  }

  function handleQuantityChange(diskId: string, newQuantity: number) {
    setSelectedDisks(prev => prev.map(item => {
      if (item.disk.id === diskId) {
        if (onSelectDisk) {
          onSelectDisk(item.disk, newQuantity);
        }
        return { ...item, quantity: newQuantity };
      }
      return item;
    }));
  }

  function handleRemoveDisk(diskId: string) {
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
  }
}
