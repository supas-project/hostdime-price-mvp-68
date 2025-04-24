
import { ComponentOption } from "@/data/server-components";
import { StorageSelector } from "@/components/storage/StorageSelector";
import { PricedDiskOption } from "@/types/storage";

interface StorageStepProps {
  onSelectStorageItem: (storageOption: ComponentOption, storageType: 'internal' | 'external') => void;
}

export function StorageStep({ onSelectStorageItem }: StorageStepProps) {
  const handleSelectInternalDisk = (disk: PricedDiskOption, quantity: number) => {
    const storageOption: ComponentOption = {
      id: `internal-disk-${disk.id}`,
      type: "Armazenamento",
      name: `${quantity}x ${disk.type.toUpperCase()} ${disk.capacity}`,
      description: `Disco interno: ${disk.type.toUpperCase()} ${disk.capacity}`,
      price: disk.price * quantity,
      specs: [
        `Tipo: ${disk.type.toUpperCase()}`,
        `Capacidade: ${disk.capacity}`,
        `Quantidade: ${quantity}`
      ]
    };
    onSelectStorageItem(storageOption, 'internal');
  };

  const handleSelectExternalStorage = (type: string, capacity: number, price: number) => {
    const storageOption: ComponentOption = {
      id: `external-storage-${type}-${capacity}`,
      type: "Armazenamento",
      name: `Storage ${type} ${capacity} GB`,
      description: `Storage externo: ${type} ${capacity} GB`,
      price: price,
      specs: [
        `Tipo: Storage ${type}`,
        `Capacidade: ${capacity} GB`
      ]
    };
    onSelectStorageItem(storageOption, 'external');
  };

  return (
    <StorageSelector
      onSelectInternalDisk={handleSelectInternalDisk}
      onSelectExternalStorage={handleSelectExternalStorage}
    />
  );
}
