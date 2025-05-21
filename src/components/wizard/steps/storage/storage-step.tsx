
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
    // Criar um ID consistente baseado no tipo e capacidade do disco
    const normalizedCapacity = normalizeStorageCapacity(disk.capacity);
    const baseId = `internal-disk-${disk.type}-${normalizedCapacity}`;
    // Adicionar um componente de quantidade ao ID para garantir unicidade quando a quantidade muda
    const diskId = `${baseId}-qty-${quantity}`;
    
    console.log("Storage Step - Selecting disk with ID:", diskId, "Quantity:", quantity);
    
    // Remover qualquer prefixo de quantidade no nome para evitar duplicação
    const diskName = `${disk.type.toUpperCase()} ${normalizedCapacity}`;
    
    const storageOption: ComponentOption = {
      id: diskId,
      type: "Armazenamento",
      subtype: disk.type,
      name: quantity > 1 ? `${quantity}x ${diskName}` : diskName,
      description: `Disco interno: ${disk.type.toUpperCase()} ${normalizedCapacity}`,
      price: disk.price * quantity,
      metadata: {
        quantity: quantity,
        unitPrice: disk.price,
        features: [`Tipo: ${disk.type}`]
      },
      specs: [
        `Tipo: ${disk.type.toUpperCase()}`,
        `Capacidade: ${normalizedCapacity}`,
        `Quantidade: ${quantity}`
      ]
    };
    
    // Se a quantidade for zero, marcar como remoção
    if (quantity <= 0) {
      storageOption.price = 0;
    }
    
    onSelectStorageItem(storageOption, 'internal');
    
    if (quantity > 0) {
      toast.success(`Disco ${disk.type.toUpperCase()} ${normalizedCapacity} adicionado`);
    } else {
      toast.success(`Disco removido com sucesso`);
    }
  };

  const handleSelectExternalStorage = (type: string, capacity: number, price: number) => {
    // Ensure capacity has a unit (GB)
    const formattedCapacity = `${capacity}GB`;
    const storageId = `external-storage-${type}-${capacity}`;
    
    const storageOption: ComponentOption = {
      id: storageId,
      type: "Armazenamento",
      subtype: "Storage Externo",
      name: `Storage ${type} ${formattedCapacity}`,
      description: `Storage externo: ${type} ${formattedCapacity}`,
      price: price,
      metadata: {
        quantity: 1,
        unitPrice: price
      },
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
