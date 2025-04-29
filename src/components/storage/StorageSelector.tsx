import { useState, useEffect } from "react";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { InternalStoragePanel } from "./InternalStoragePanel";
import { ExternalStoragePanel } from "./ExternalStoragePanel";
import { Card } from "@/components/ui/card";
import { StorageHeader } from "./storage-header";
import { componentSpacing } from "../ui/shared-styles";
import { cn } from "@/lib/utils";
import { PricedDiskOption } from "@/types/storage";
import { TabHeader } from "./tab-header/TabHeader";
import { HardDrive } from "lucide-react";
import { useWizard } from "@/contexts/WizardContext";
import { ComponentOption } from "@/types/component";
import { PriceService } from "@/services/price-service";
import { normalizeStorageCapacity } from "@/utils/storage-utils";

interface StorageSelectorProps {
  onSelectInternalDisk?: (disk: PricedDiskOption, quantity: number) => void;
  onSelectExternalStorage?: (type: string, capacity: number, price: number) => void;
}

export function StorageSelector({ onSelectInternalDisk, onSelectExternalStorage }: StorageSelectorProps) {
  const [activeTab, setActiveTab] = useState<string>("internal");
  const { handleSelectStorageItem } = useWizard();
  const [storageTypes, setStorageTypes] = useState<{
    [key: string]: { 
      name: string;
      pricePerGB: number;
      iops: string;
      throughput: string;
      description: string;
      throughputAdd?: number;
      maxThroughput?: string;
    }
  }>({});

  useEffect(() => {
    const loadStorageTypes = () => {
      try {
        const storageCategory = PriceService.getCategory('storage');
        if (!storageCategory) return;
        
        const types: typeof storageTypes = {};
        
        storageCategory.items.forEach(item => {
          if (item.name.toLowerCase().includes('snapshot')) return;
          
          const key = item.name.replace('Storage ', '').toLowerCase();
          
          let iops = 'Até 1000';
          let throughput = 'Até 125 MB/s';
          let throughputAdd: number | undefined = undefined;
          let maxThroughput: string | undefined = undefined;
          
          if (item.specs) {
            const iopsSpec = item.specs.find(spec => spec.includes('IOPS'));
            if (iopsSpec) {
              iops = iopsSpec.replace('IOPS: ', '');
            }
            
            const throughputSpec = item.specs.find(spec => spec.includes('Throughput:') && !spec.includes('adicional') && !spec.includes('máximo'));
            if (throughputSpec) {
              throughput = throughputSpec.replace('Throughput: ', '');
            }
            
            const throughputAddSpec = item.specs.find(spec => spec.includes('Throughput adicional'));
            if (throughputAddSpec) {
              const match = throughputAddSpec.match(/R\$\s*(\d+\.\d+)/);
              if (match) {
                throughputAdd = parseFloat(match[1]);
              }
            }
            
            const maxThroughputSpec = item.specs.find(spec => spec.includes('Throughput máximo'));
            if (maxThroughputSpec) {
              maxThroughput = maxThroughputSpec.replace('Throughput máximo: ', '');
            }
          }
          
          types[key] = {
            name: key.charAt(0).toUpperCase() + key.slice(1),
            pricePerGB: item.price,
            iops,
            throughput,
            description: item.description || `Storage ${key} para dados`,
            ...(throughputAdd && { throughputAdd }),
            ...(maxThroughput && { maxThroughput })
          };
        });
        
        if (Object.keys(types).length > 0) {
          setStorageTypes(types);
        } else {
          setStorageTypes({
            standard: { 
              name: "Standard", 
              pricePerGB: 0.15, 
              iops: "Até 1000", 
              throughput: "Até 125 MB/s",
              description: "Ideal para backups e arquivos raramente acessados"
            },
            premium: { 
              name: "Premium", 
              pricePerGB: 0.35, 
              iops: "Até 6000", 
              throughput: "Até 500 MB/s",
              description: "Ótimo para aplicações de alto desempenho"
            }
          });
        }
      } catch (error) {
        console.error('Erro ao carregar tipos de storage:', error);
      }
    };
    
    loadStorageTypes();
    
    PriceService.addDataChangeListener(() => loadStorageTypes());
    
    return () => {
      PriceService.removeDataChangeListener(() => loadStorageTypes());
    };
  }, []);

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
    } else {
      handleSelectStorageItem(storageOption, 'internal');
    }
  };

  const handleSelectExternalStorageInternal = (type: string, capacity: number, price: number) => {
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
    } else {
      handleSelectStorageItem(storageOption, 'external');
    }
  };

  return (
    <Card className={cn(
      componentSpacing.card,
      "bg-[#1e1e1e] border-[#2a2a2a] transition-all duration-300 relative"
    )}>
      <StorageHeader
        icon={HardDrive}
        title="Armazenamento"
        tooltip="Escolha o tipo e capacidade de armazenamento ideal para seu servidor. Você pode adicionar múltiplos discos internos de diferentes tipos."
      />
      
      <Tabs 
        defaultValue="internal" 
        className="w-full"
        value={activeTab}
        onValueChange={setActiveTab}
      >
        <TabHeader activeTab={activeTab} onTabChange={setActiveTab} />
        
        <div className="relative">
          <TabsContent value="internal" className="mt-0 relative z-10">
            <div className="animate-fade-in">
              <InternalStoragePanel onSelectDisk={handleSelectInternalDiskInternal} />
            </div>
          </TabsContent>
          <TabsContent value="external" className="mt-0 relative z-10">
            <div className="animate-fade-in">
              <ExternalStoragePanel 
                onSelectStorage={handleSelectExternalStorageInternal} 
                storageTypes={storageTypes}
              />
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </Card>
  );
}
