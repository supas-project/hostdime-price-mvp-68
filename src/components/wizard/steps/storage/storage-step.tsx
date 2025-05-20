
import { ComponentOption } from "@/types/component";
import { StorageSelector } from "@/components/storage/StorageSelector";
import { PricedDiskOption } from "@/types/storage";
import { toast } from "sonner";
import { normalizeStorageCapacity } from "@/utils/storage-utils";
import { useEffect } from "react";

interface StorageStepProps {
  onSelectStorageItem: (storageOption: ComponentOption, storageType: 'internal' | 'external') => void;
}

export function StorageStep({ onSelectStorageItem }: StorageStepProps) {
  // Set up a global listener for storage selections
  useEffect(() => {
    const handleStorageSelectionSync = (event: CustomEvent) => {
      if (event.detail && event.detail.type === 'internal' && event.detail.disk) {
        handleSelectInternalDisk(event.detail.disk, event.detail.quantity || 0);
      }
    };

    // Cast the event as any since CustomEvent is not recognized directly
    window.addEventListener('storage-selection', handleStorageSelectionSync as any);
    
    return () => {
      window.removeEventListener('storage-selection', handleStorageSelectionSync as any);
    };
  }, [onSelectStorageItem]);

  const handleSelectInternalDisk = (disk: PricedDiskOption, quantity: number) => {
    // Normalize capacity to ensure it has a unit
    const normalizedCapacity = normalizeStorageCapacity(disk.capacity);
    
    // Only proceed if disk is valid
    if (!disk || !disk.id) {
      console.error("Invalid disk selected:", disk);
      return;
    }
    
    // Create consistent ID without quantity to prevent duplicates
    const diskId = `internal-disk-${disk.type}-${disk.capacity}`;
    
    // In case of removal (quantity = 0)
    if (quantity === 0) {
      const removeDiskOption: ComponentOption = {
        id: diskId,
        type: "Armazenamento",
        subtype: "Disco Interno",
        name: `${disk.type.toUpperCase()} ${normalizedCapacity}`,
        description: `Disco interno: ${disk.type.toUpperCase()} ${normalizedCapacity}`,
        price: 0, // Zero price for removal
        metadata: {
          quantity: 0,
          features: [`Tipo: ${disk.type}`],
          unitPrice: disk.price // Store original unit price
        },
        specs: [
          `Tipo: ${disk.type.toUpperCase()}`,
          `Capacidade: ${normalizedCapacity}`,
          `Quantidade: 0`
        ]
      };
      
      onSelectStorageItem(removeDiskOption, 'internal');
      
      // Also track in localStorage that this disk was explicitly removed
      try {
        const removedDisks = JSON.parse(localStorage.getItem('removedDisks') || '{}');
        removedDisks[diskId] = true;
        localStorage.setItem('removedDisks', JSON.stringify(removedDisks));
      } catch (e) {
        console.error("Could not update localStorage with removed disk", e);
      }
      
      console.log(`Disk ${disk.type.toUpperCase()} ${normalizedCapacity} removed from summary`);
      return;
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
        unitPrice: disk.price // Store original unit price
      },
      specs: [
        `Tipo: ${disk.type.toUpperCase()}`,
        `Capacidade: ${normalizedCapacity}`,
        `Quantidade: ${quantity}`
      ]
    };
    
    onSelectStorageItem(storageOption, 'internal');
    
    // Remove from localStorage tracking if it was previously removed
    try {
      const removedDisks = JSON.parse(localStorage.getItem('removedDisks') || '{}');
      if (removedDisks[diskId]) {
        delete removedDisks[diskId];
        localStorage.setItem('removedDisks', JSON.stringify(removedDisks));
      }
    } catch (e) {
      console.error("Could not update localStorage for re-added disk", e);
    }
    
    console.log(`Disk ${disk.type.toUpperCase()} ${normalizedCapacity} added/updated in summary with quantity ${quantity}`);
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
