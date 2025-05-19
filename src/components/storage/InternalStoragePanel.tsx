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
  
  // Armazenar referência da função de callback para evitar recriação
  const updateDisksRef = useRef<() => void>();

  // Carregar dados de disco da tabela de preços
  useEffect(() => {
    const loadDisksFromPriceTable = async () => {
      try {
        const diskCategory = await PriceService.getCategory('disk');
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
            
            // Normalizar para garantir que a capacidade tenha unidade
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
        
        setAvailableDisks(disks);
      } catch (error) {
        console.error('Erro ao carregar discos:', error);
        // Fallback para dados estáticos originais
        const fallbackDisks = selectedDiskType ? 
          diskData
            .filter(disk => disk.type === selectedDiskType)
            .map(disk => ({
              ...disk,
              capacity: normalizeStorageCapacity(disk.capacity) // Normalizar capacidade
            })) : 
          [];
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
    // Definir a função de atualização dos discos
    const updateDisks = async () => {
      if (selectedDiskType) {
        const diskCategory = await PriceService.getCategory('disk');
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
        
        setAvailableDisks(disks);
      }
    };

    // Armazenar referência da função para usar depois
    updateDisksRef.current = updateDisks;
    
    // Registrar para mudanças na tabela de preços
    if (updateDisksRef.current) {
      PriceService.addDataChangeListener(updateDisksRef.current);
    }
    
    // Limpar listener quando o componente é desmontado
    return () => {
      if (updateDisksRef.current) {
        PriceService.removeDataChangeListener(updateDisksRef.current);
      }
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
    // Atualizar tipo selecionado
    setSelectedDiskType(type);
    setSelectedCapacity("");
    
    // Limpar seleção atual para evitar confusão
    // Notificar o usuário sobre a mudança de contexto
    if (selectedDisks.length > 0 && selectedDisks.some(item => item.disk.type !== type)) {
      toast.info(`Agora você está configurando discos ${type.toUpperCase()}`, {
        description: "Os discos já adicionados foram mantidos no seu carrinho"
      });
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

  // Filtrar discos pelo tipo atualmente selecionado para exibição
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
}
