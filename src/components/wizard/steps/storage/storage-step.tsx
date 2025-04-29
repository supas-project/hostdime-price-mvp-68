
import { ComponentOption } from "@/types/component";
import { StorageSelector } from "@/components/storage/StorageSelector";
import { PricedDiskOption } from "@/types/storage";
import { toast } from "sonner";
import { normalizeStorageCapacity } from "@/utils/storage-utils";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { HelpCircle } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

interface StorageStepProps {
  onSelectStorageItem: (storageOption: ComponentOption, storageType: 'internal' | 'external') => void;
}

export function StorageStep({ onSelectStorageItem }: StorageStepProps) {
  const [showTips, setShowTips] = useState(true);
  
  const handleSelectInternalDisk = (disk: PricedDiskOption, quantity: number) => {
    // Create consistent ID without quantity to prevent duplicates
    const diskId = `internal-disk-${disk.type}-${disk.capacity}`;
    
    // Normalizar capacidade para garantir que tenha unidade
    const normalizedCapacity = normalizeStorageCapacity(disk.capacity);
    
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
    toast.success(`Disco ${disk.type.toUpperCase()} ${normalizedCapacity} adicionado`);
  };

  const handleSelectExternalStorage = (type: string, capacity: number, price: number) => {
    // Garantir que a capacidade tenha unidade (GB)
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
    <>
      {showTips && (
        <Alert className="mb-4 bg-primary/5 border-primary/20">
          <HelpCircle className="h-4 w-4 text-primary" />
          <AlertTitle className="flex justify-between items-center">
            <span>Dica para escolha de armazenamento</span>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-6 px-2 text-xs"
              onClick={() => setShowTips(false)}
            >
              Fechar
            </Button>
          </AlertTitle>
          <AlertDescription className="text-sm">
            <ul className="list-disc list-inside space-y-1 mt-2">
              <li><strong>NVMe:</strong> Mais rápido, ideal para bancos de dados e aplicações de alta performance</li>
              <li><strong>SSD:</strong> Bom custo-benefício, para sistemas e aplicações gerais</li>
              <li><strong>HDD:</strong> Econômico, para armazenamento de grande volume e backups</li>
              <li><strong>Storage Externo:</strong> Compartilhável entre servidores, ideal para dados que crescem</li>
            </ul>
          </AlertDescription>
        </Alert>
      )}
      
      <StorageSelector
        onSelectInternalDisk={handleSelectInternalDisk}
        onSelectExternalStorage={handleSelectExternalStorage}
      />
    </>
  );
}
