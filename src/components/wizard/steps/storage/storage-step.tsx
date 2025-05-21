
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
    // Create consistent ID without quantity to prevent duplicates
    const diskId = `internal-disk-${disk.type}-${disk.capacity}`;
    
    // Normalize capacity to ensure it has a unit
    const normalizedCapacity = normalizeStorageCapacity(disk.capacity);
    
    const storageOption: ComponentOption = {
      id: diskId,
      type: "Armazenamento",
      subtype: disk.type,
      name: `${disk.type.toUpperCase()} ${normalizedCapacity}`,
      description: `Disco interno: ${disk.type.toUpperCase()} ${normalizedCapacity}`,
      price: disk.price * quantity,
      metadata: {
        quantity: quantity,
        features: [`Tipo: ${disk.type}`],
        unitPrice: disk.price // Store original unit price
      },
      specs: [
        `Tipo: ${disk.type.toUpperCase()}`,
        `Capacidade: ${normalizedCapacity}`,
        `Quantidade: ${quantity}`
      ]
    };
    
    onSelectStorageItem(storageOption, 'internal');
    toast.success(`Disco ${disk.type.toUpperCase()} ${normalizedCapacity} adicionado`);
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
