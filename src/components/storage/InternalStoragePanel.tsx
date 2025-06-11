import { useState, useEffect, useRef, useCallback } from "react";
import { diskData } from "@/data/disk-data";
import { PricedDiskOption } from "@/types/storage";
import { DiskTypeSelector } from "./disk-selection/DiskTypeSelector";
import { DiskCapacitySelector } from "./disk-selection/DiskCapacitySelector";
import { SelectedDiskDisplay } from "./disk-selection/SelectedDiskDisplay";
import { toast } from "sonner";
import { PriceService } from "@/services/price-service";
import { normalizeStorageCapacity } from "@/utils/storage-utils";

// Tipagem forte para item de disco selecionado
interface SelectedDiskItem {
  disk: PricedDiskOption;
  quantity: number;
  groupKey: string;
}

// Tipagem para props do componente
interface InternalStoragePanelProps {
  onSelectDisk?: (disk: PricedDiskOption, quantity: number) => void;
}

// Tipo para seletores de disco
type DiskType = "nvme" | "ssd" | "hdd";

// Função para criar uma chave única de agrupamento baseada em tipo e capacidade
const createDiskGroupKey = (disk: PricedDiskOption): string => {
  if (!disk?.type || !disk?.capacity) {
    console.warn('Invalid disk data for group key creation:', disk);
    return `unknown-${Date.now()}`;
  }
  return `${disk.type}-${disk.capacity}`;
};

export function InternalStoragePanel({ onSelectDisk }: InternalStoragePanelProps) {
  const [selectedDiskType, setSelectedDiskType] = useState<DiskType | undefined>(undefined);
  const [selectedCapacity, setSelectedCapacity] = useState<string>("");
  const [selectedDisks, setSelectedDisks] = useState<SelectedDiskItem[]>([]);
  const [availableDisks, setAvailableDisks] = useState<PricedDiskOption[]>([]);
  
  // Store reference to update function to avoid recreations
  const updateDisksRef = useRef<(() => void) | null>(null);

  // Load disk data from price table
  useEffect(() => {
    const loadDisksFromPriceTable = async (): Promise<void> => {
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
          
          if (diskCategory?.items && Array.isArray(diskCategory.items)) {
            // Convert price table items to disk format
            const priceTableDisks = diskCategory.items
              .filter(item => item?.subtype === selectedDiskType && item?.name)
              .map(item => {
                // Extract capacity from name
                const capacityMatches = item.name?.match(/(\d+)TB|(\d+\.?\d*)TB|(\d+)GB/i);
                let capacity = "";
                
                if (capacityMatches) {
                  if (capacityMatches[1]) capacity = `${capacityMatches[1]}TB`;
                  else if (capacityMatches[2]) capacity = `${capacityMatches[2]}TB`;
                  else if (capacityMatches[3]) capacity = `${capacityMatches[3]}GB`;
                }
                
                // Normalize to ensure capacity has a unit
                capacity = normalizeStorageCapacity(capacity);
                
                // Create properly formatted specs object
                const specs = item.specs || [];
                const specsObj = {
                  readSpeed: specs.find(s => s?.toLowerCase().includes('leitura'))?.split(':')[1]?.trim() || "N/A",
                  writeSpeed: specs.find(s => s?.toLowerCase().includes('escrita'))?.split(':')[1]?.trim() || "N/A",
                  iops: specs.find(s => s?.toLowerCase().includes('iops'))?.split(':')[1]?.trim() || "N/A",
                  recommended: specs.filter(s => s?.toLowerCase().includes('recomendado')) || []
                };
                
                return {
                  id: item.id || `disk-${Date.now()}`,
                  type: (item.subtype as DiskType) || "hdd",
                  capacity,
                  price: item.price || 0,
                  specs: specsObj
                } as PricedDiskOption;
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
            .filter(disk => disk?.type === selectedDiskType)
            .map(disk => ({
              ...disk,
              capacity: normalizeStorageCapacity(disk.capacity || "")
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
            .filter(disk => disk?.type === selectedDiskType)
            .map(disk => ({
              ...disk,
              capacity: normalizeStorageCapacity(disk?.capacity || "")
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
    // Define the update function
    const updateDisks = async (): Promise<void> => {
      if (updateDisksRef.current) {
        updateDisksRef.current();
      }
    };
    
    // Register for price table changes
    const listener = async (): Promise<void> => {
      await updateDisks();
    };
    
    PriceService.addDataChangeListener(listener);
    
    // Clean up listener when component unmounts
    return () => {
      PriceService.removeDataChangeListener(listener);
    };
  }, []);

  // CORREÇÃO: Função para agregar discos por tipo e capacidade
  const getAggregatedDisks = useCallback((): SelectedDiskItem[] => {
    const diskGroups: { [key: string]: SelectedDiskItem } = {};
    
    selectedDisks.forEach(item => {
      if (!item?.disk) return;
      
      const groupKey = createDiskGroupKey(item.disk);
      
      if (diskGroups[groupKey]) {
        // Se já existe um grupo para este tipo/capacidade, soma a quantidade
        diskGroups[groupKey].quantity += item.quantity;
      } else {
        // Senão, cria um novo grupo
        diskGroups[groupKey] = { ...item, groupKey };
      }
    });
    
    return Object.values(diskGroups);
  }, [selectedDisks]);

  // Filter disks by currently selected type for display - usando a versão agregada
  const visibleDisks = getAggregatedDisks().filter(
    item => selectedDiskType ? item.disk?.type === selectedDiskType : true
  );

  // Robust disk manipulation functions
  const handleCapacitySelect = useCallback((capacity: string): void => {
    if (!capacity) return;
    
    setSelectedCapacity(capacity);
    const disk = availableDisks.find(d => d?.capacity === capacity);
    
    if (!disk) {
      toast.error("Disco não encontrado");
      return;
    }

    // CORREÇÃO: Verificar se já existe um disco com o mesmo tipo e capacidade
    const groupKey = createDiskGroupKey(disk);
    const existingDiskIndex = selectedDisks.findIndex(
      item => item?.disk && createDiskGroupKey(item.disk) === groupKey
    );

    if (existingDiskIndex >= 0) {
      // Se já existe, incrementa a quantidade
      setSelectedDisks(prev => {
        const updated = [...prev];
        const existingItem = updated[existingDiskIndex];
        if (existingItem) {
          updated[existingDiskIndex] = {
            ...existingItem,
            quantity: existingItem.quantity + 1
          };
        }
        return updated;
      });
      
      const newQuantity = selectedDisks[existingDiskIndex]?.quantity ? selectedDisks[existingDiskIndex].quantity + 1 : 1;
      onSelectDisk?.(disk, newQuantity);
      
      toast.success("Quantidade do disco incrementada");
    } else {
      // Se não existe, adiciona novo
      const newDisk: SelectedDiskItem = { 
        disk, 
        quantity: 1, 
        groupKey 
      };
      setSelectedDisks(prev => [...prev, newDisk]);
      
      onSelectDisk?.(disk, 1);
      
      toast.success("Disco adicionado com sucesso");
    }

    // Reset capacity but keep disk type for additional selections
    setSelectedCapacity("");
  }, [availableDisks, selectedDisks, onSelectDisk]);

  const handleTypeSelect = useCallback((type: DiskType): void => {
    // Update selected type
    setSelectedDiskType(type);
    setSelectedCapacity("");
    
    // Notify user about context change
    if (selectedDisks.length > 0 && selectedDisks.some(item => item.disk?.type !== type)) {
      toast.info(`Agora você está configurando discos ${type.toUpperCase()}`, {
        description: "Os discos já adicionados foram mantidos no seu carrinho"
      });
    }
  }, [selectedDisks]);

  const handleQuantityChange = useCallback((disk: PricedDiskOption, newQuantity: number): void => {
    if (!disk || newQuantity < 0) return;
    
    const groupKey = createDiskGroupKey(disk);
    
    if (newQuantity === 0) {
      handleRemoveDisk(disk);
      return;
    }
    
    setSelectedDisks(prev => prev.map(item => {
      if (item?.disk && createDiskGroupKey(item.disk) === groupKey) {
        onSelectDisk?.(item.disk, newQuantity);
        return { ...item, quantity: newQuantity };
      }
      return item;
    }));
  }, [onSelectDisk]);

  const handleRemoveDisk = useCallback((disk: PricedDiskOption): void => {
    if (!disk) return;
    
    const groupKey = createDiskGroupKey(disk);
    
    setSelectedDisks(prev => prev.filter(item => 
      !item?.disk || createDiskGroupKey(item.disk) !== groupKey
    ));
    
    onSelectDisk?.({
      ...disk,
      price: 0
    }, 0);
    
    toast.success("Disco removido com sucesso");
  }, [onSelectDisk]);

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
            <div key={item.groupKey} className="animate-fade-in">
              <SelectedDiskDisplay
                disk={item.disk}
                quantity={item.quantity}
                onQuantityChange={(qty) => handleQuantityChange(item.disk, qty)}
                onRemove={() => handleRemoveDisk(item.disk)}
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

      {selectedDisks.length > 0 && selectedDisks.some(item => item.disk?.type !== selectedDiskType) && (
        <div className="mt-4 p-3 bg-card rounded-lg border border-border">
          <p className="text-sm font-medium mb-2">Outros discos no seu servidor:</p>
          <div className="space-y-2">
            {Object.entries(
              getAggregatedDisks()
                .filter(item => item.disk?.type !== selectedDiskType)
                .reduce((acc, curr) => {
                  const type = curr.disk?.type;
                  if (!type) return acc;
                  if (!acc[type]) acc[type] = [];
                  acc[type].push(curr);
                  return acc;
                }, {} as Record<string, SelectedDiskItem[]>)
            ).map(([type, disks]) => (
              <div key={type} className="flex items-center justify-between">
                <span className="text-sm">
                  {type.toUpperCase()} ({disks.length} {disks.length === 1 ? "disco" : "discos"})
                </span>
                <button
                  onClick={() => setSelectedDiskType(type as DiskType)}
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
}
