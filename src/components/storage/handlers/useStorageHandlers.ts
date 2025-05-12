
import { ComponentOption } from "@/types/component";
import { PricedDiskOption, StorageTier } from "@/types/storage";
import { normalizeComponentType } from "@/hooks/use-component-selection";
import { canSelectItem } from "@/utils/item-validation";
import { toast } from "sonner";

// Use StorageTier from types/storage.ts
interface StorageType {
  id?: string;
  name: string;
  pricePerGB: number;
  iops: string;
  throughput: string;
  description: string;
  performance?: string;
}

interface StorageHandlersProps {
  onSelectInternalDisk?: (disk: PricedDiskOption, quantity: number) => void;
  onSelectExternalStorage?: (type: string, capacity: number, price: number) => void;
  handleSelectStorageItem: (storageOption: ComponentOption, storageType: 'internal' | 'external') => void;
}

export function useStorageHandlers({
  onSelectInternalDisk,
  onSelectExternalStorage,
  handleSelectStorageItem
}: StorageHandlersProps) {

  const handleSelectInternalDiskInternal = (disk: PricedDiskOption, quantity: number = 1) => {
    // Chamada para callback opcional
    if (onSelectInternalDisk) {
      onSelectInternalDisk(disk, quantity);
    }

    // Criando um ID único para este disco específico
    const diskId = `internal-disk-${disk.id}-${Date.now().toString().slice(-4)}`;

    // Criando um objeto ComponentOption baseado no disco selecionado
    const storageOption: ComponentOption = {
      id: diskId,
      name: `${disk.type.toUpperCase()} ${disk.capacity}`,
      description: `Disco ${disk.type.toUpperCase()} ${disk.capacity}`,
      price: disk.price,
      type: 'storage_internal',
      subtype: disk.type,
      isHardware: true, // Marcar explicitamente como hardware
      metadata: {
        specs: {
          capacity: disk.capacity,
          // Safe type checking for specs
          readSpeed: typeof disk.specs === 'object' && !Array.isArray(disk.specs) ? disk.specs.readSpeed : undefined,
          writeSpeed: typeof disk.specs === 'object' && !Array.isArray(disk.specs) ? disk.specs.writeSpeed : undefined,
          iops: typeof disk.specs === 'object' && !Array.isArray(disk.specs) ? disk.specs.iops : undefined
        }
      }
    };

    // Verificar se o item pode ser selecionado
    if (!canSelectItem(storageOption)) {
      toast.error("Disco não selecionável", {
        description: "Este disco não pode ser selecionado devido a configuração inválida."
      });
      return;
    }

    // Adicionando ao wizard
    handleSelectStorageItem(storageOption, 'internal');
  };

  const handleSelectExternalStorageInternal = (
    type: string, 
    capacity: number, 
    price: number, 
    storageTypes?: StorageType[]
  ) => {
    // Chamada para callback opcional
    if (onSelectExternalStorage) {
      onSelectExternalStorage(type, capacity, price);
    }

    // Encontrar o tipo de armazenamento correspondente para obter detalhes
    const storageTypeInfo = storageTypes?.find(st => st.id === type || st.name === type);

    // Criando um ID único para este armazenamento específico
    const storageId = `external-storage-${type}-${capacity}-${Date.now().toString().slice(-4)}`;

    // Criando um objeto ComponentOption baseado no armazenamento externo selecionado
    const storageOption: ComponentOption = {
      id: storageId,
      name: `${storageTypeInfo?.name || type.toUpperCase()} ${capacity}GB`,
      description: `Armazenamento Externo: ${storageTypeInfo?.name || type} ${capacity}GB`,
      price: price,
      type: 'storage_external',
      subtype: type,
      isHardware: true, // Marcar explicitamente como hardware
      metadata: {
        specs: {
          type: storageTypeInfo?.name || type,
          capacity: `${capacity}GB`,
          performance: storageTypeInfo?.performance || 'Padrão'
        }
      }
    };

    // Verificar se o item pode ser selecionado
    if (!canSelectItem(storageOption)) {
      toast.error("Armazenamento não selecionável", {
        description: "Este armazenamento não pode ser selecionado devido a configuração inválida."
      });
      return;
    }

    // Adicionando ao wizard
    handleSelectStorageItem(storageOption, 'external');
  };

  return {
    handleSelectInternalDiskInternal,
    handleSelectExternalStorageInternal
  };
}
