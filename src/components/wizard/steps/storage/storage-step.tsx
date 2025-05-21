
import { ComponentOption } from "@/types/component";
import { StorageSelector } from "@/components/storage/StorageSelector";
import { PricedDiskOption } from "@/types/storage";
import { toast } from "sonner";
import { normalizeStorageCapacity } from "@/utils/storage-utils";

interface StorageStepProps {
  onSelectStorageItem: (storageOption: ComponentOption, storageType: 'internal' | 'external') => void;
}

export function StorageStep({ onSelectStorageItem }: StorageStepProps) {
  const handleSelectInternalDisk = (disk: PricedDiskOption, quantity: number) => {
    // Extrai tipo e capacidade para gerar um ID consistente
    const diskType = disk.type.toLowerCase();
    const capacity = normalizeStorageCapacity(disk.capacity);
    
    // Cria um ID baseado no tipo e capacidade
    const diskId = `internal-disk-${diskType}-${capacity}`;
    
    // Preço unitário x quantidade
    const totalPrice = disk.price * quantity;
    
    // Se a quantidade for 0, é uma remoção
    if (quantity === 0) {
      const removalOption: ComponentOption = {
        id: diskId,
        type: "Armazenamento",
        subtype: "Disco Interno",
        name: `${disk.type.toUpperCase()} ${capacity}`,
        price: 0 // Preço zero para remoção
      };
      onSelectStorageItem(removalOption, 'internal');
      toast.success(`Disco ${disk.type.toUpperCase()} ${capacity} removido`);
      return;
    }
    
    const storageOption: ComponentOption = {
      id: diskId,
      type: "Armazenamento",
      subtype: "Disco Interno",
      name: `${disk.type.toUpperCase()} ${capacity}`,
      description: `Disco interno: ${disk.type.toUpperCase()} ${capacity}`,
      price: totalPrice,
      metadata: {
        quantity: quantity,
        features: [`Tipo: ${disk.type}`],
        unitPrice: disk.price // Guarda o preço unitário para cálculos futuros
      },
      specs: [
        `Tipo: ${disk.type.toUpperCase()}`,
        `Capacidade: ${capacity}`,
        `Quantidade: ${quantity}`
      ]
    };
    
    onSelectStorageItem(storageOption, 'internal');
    
    const actionText = quantity === 1 ? "adicionado" : "atualizado";
    toast.success(`Disco ${disk.type.toUpperCase()} ${capacity} ${actionText}`);
  };

  const handleSelectExternalStorage = (type: string, capacity: number, price: number) => {
    // Ensure capacity has a unit (GB)
    const formattedCapacity = `${capacity}GB`;
    
    const storageOption: ComponentOption = {
      id: `external-storage-${type}-${capacity}`,
      type: "Armazenamento",
      subtype: "Storage Externo",
      name: `Storage ${type} ${formattedCapacity}`,
      description: `Storage externo: ${type} ${formattedCapacity}`,
      price: price,
      specs: [
        `Tipo: Storage ${type}`,
        `Capacidade: ${formattedCapacity}`
      ]
    };
    
    onSelectStorageItem(storageOption, 'external');
    toast.success(`Storage ${type} de ${formattedCapacity} adicionado`);
  };

  return (
    <StorageSelector
      onSelectInternalDisk={handleSelectInternalDisk}
      onSelectExternalStorage={handleSelectExternalStorage}
    />
  );
}
