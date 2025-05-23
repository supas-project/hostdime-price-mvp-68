
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
    
    // Se a quantidade for 0, é uma remoção
    if (quantity === 0) {
      const removalOption: ComponentOption = {
        id: diskId,
        type: "Armazenamento",
        subtype: "Disco Interno",
        name: `${disk.type.toUpperCase()} ${capacity}`,
        description: `Disco interno ${disk.type.toUpperCase()} ${capacity} (removido)`,
        price: 0, // Preço zero para remoção
        isHardware: true // Marca como hardware consistente com adições
      };
      onSelectStorageItem(removalOption, 'internal');
      toast.success(`Disco ${disk.type.toUpperCase()} ${capacity} removido`);
      return;
    }
    
    // Preço unitário x quantidade
    const totalPrice = disk.price * quantity;
    
    const storageOption: ComponentOption = {
      id: diskId,
      type: "Armazenamento",
      subtype: "Disco Interno",
      name: `${disk.type.toUpperCase()} ${capacity}`,
      description: `Disco interno: ${disk.type.toUpperCase()} ${capacity}`,
      price: totalPrice,
      isHardware: true, // Marca como hardware para cálculos de PayBack
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
    
    // Criar ID consistente para storages externos
    const storageId = `external-storage-${type.toLowerCase()}-${capacity}`;
    
    console.log(`[StorageStep] Adicionando storage externo: ${type}, ${formattedCapacity}, Preço total: ${price}`);
    
    const storageOption: ComponentOption = {
      id: storageId,
      type: "Armazenamento",
      subtype: "Storage Externo",
      name: `Storage ${type} ${formattedCapacity}`,
      description: `Storage externo: ${type} ${formattedCapacity}`,
      price: price, // Usando o preço total calculado externamente
      isHardware: true, // Marca como hardware para cálculos de PayBack
      specs: [
        `Tipo: Storage ${type}`,
        `Capacidade: ${formattedCapacity}`
      ]
    };
    
    console.log(`[StorageStep] Storage option created with price: ${storageOption.price}`);
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
