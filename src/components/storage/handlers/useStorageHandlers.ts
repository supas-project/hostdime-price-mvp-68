
import { PricedDiskOption } from "@/types/storage";
import { ComponentOption } from "@/types/component";
import { normalizeStorageCapacity } from "@/utils/storage-utils";

export interface StorageHandlerProps {
  onSelectInternalDisk?: (disk: PricedDiskOption, quantity: number) => void;
  onSelectExternalStorage?: (type: string, capacity: number, price: number) => void;
  handleSelectStorageItem?: (storageOption: ComponentOption, storageType: 'internal' | 'external') => void;
}

export function useStorageHandlers({
  onSelectInternalDisk,
  onSelectExternalStorage,
  handleSelectStorageItem
}: StorageHandlerProps) {
  
  const handleSelectInternalDiskInternal = (disk: PricedDiskOption, quantity: number) => {
    const diskId = `internal-disk-${disk.type}-${disk.capacity}`;
    
    const normalizedCapacity = normalizeStorageCapacity(disk.capacity);
    
    let diskSpecs: string[] = [];
    
    if (disk.specs) {
      if (Array.isArray(disk.specs)) {
        diskSpecs = disk.specs;
      } else {
        if (disk.specs.readSpeed) diskSpecs.push(`Leitura: ${disk.specs.readSpeed}`);
        if (disk.specs.writeSpeed) diskSpecs.push(`Escrita: ${disk.specs.writeSpeed}`);
        if (disk.specs.iops) diskSpecs.push(`IOPS: ${disk.specs.iops}`);
        if (disk.specs.recommended && Array.isArray(disk.specs.recommended)) {
          diskSpecs.push(`Recomendado para: ${disk.specs.recommended.join(', ')}`);
        }
      }
    }
    
    const storageOption: ComponentOption = {
      id: diskId,
      type: "Armazenamento",
      subtype: "Disco Interno",
      name: `${disk.type.toUpperCase()} ${normalizedCapacity}`,
      description: `Disco interno: ${disk.type.toUpperCase()} ${normalizedCapacity}`,
      price: disk.price * quantity,
      metadata: {
        quantity: quantity,
        features: [`Tipo: ${disk.type}`],
        unitPrice: disk.price
      },
      specs: [
        `Tipo: ${disk.type.toUpperCase()}`,
        `Capacidade: ${normalizedCapacity}`,
        `Quantidade: ${quantity}`,
        ...diskSpecs
      ]
    };
    
    if (onSelectInternalDisk) {
      onSelectInternalDisk(disk, quantity);
    } else if (handleSelectStorageItem) {
      handleSelectStorageItem(storageOption, 'internal');
    }
  };

  const handleSelectExternalStorageInternal = (type: string, capacity: number, price: number, storageTypes: any) => {
    const formattedCapacity = `${capacity}GB`;
    
    const storageType = storageTypes[type.toLowerCase()];
    const iops = storageType?.iops || "Padrão";
    const throughput = storageType?.throughput || "Padrão";
    
    const storageOption: ComponentOption = {
      id: `external-storage-${type}-${capacity}`,
      type: "Armazenamento",
      subtype: "Storage Externo",
      name: `Storage ${type} ${formattedCapacity}`,
      description: `Storage externo: ${type} ${formattedCapacity}`,
      price: price,
      specs: [
        `Tipo: Storage ${type}`,
        `Capacidade: ${formattedCapacity}`,
        `IOPS: ${iops}`,
        `Throughput: ${throughput}`
      ]
    };
    
    if (onSelectExternalStorage) {
      onSelectExternalStorage(type, capacity, price);
    } else if (handleSelectStorageItem) {
      handleSelectStorageItem(storageOption, 'external');
    }
  };
  
  return {
    handleSelectInternalDiskInternal,
    handleSelectExternalStorageInternal
  };
}
