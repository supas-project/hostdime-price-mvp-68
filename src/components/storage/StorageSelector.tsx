
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

  // Carregar tipos de storage da tabela de preços
  useEffect(() => {
    const loadStorageTypes = () => {
      try {
        const storageCategory = PriceService.getCategory('storage');
        if (!storageCategory) return;
        
        const types: typeof storageTypes = {};
        
        storageCategory.items.forEach(item => {
          if (item.name.toLowerCase().includes('snapshot')) return;
          
          const key = item.name.replace('Storage ', '').toLowerCase();
          
          // Extrair informações de IOPS e throughput das specs
          let iops = 'Até 1000';
          let throughput = 'Até 125 MB/s';
          let throughputAdd: number | undefined = undefined;
          let maxThroughput: string | undefined = undefined;
          
          if (item.specs) {
            // Encontrar IOPS
            const iopsSpec = item.specs.find(spec => spec.includes('IOPS'));
            if (iopsSpec) {
              iops = iopsSpec.replace('IOPS: ', '');
            }
            
            // Encontrar throughput
            const throughputSpec = item.specs.find(spec => spec.includes('Throughput:') && !spec.includes('adicional') && !spec.includes('máximo'));
            if (throughputSpec) {
              throughput = throughputSpec.replace('Throughput: ', '');
            }
            
            // Verificar se tem throughput adicional
            const throughputAddSpec = item.specs.find(spec => spec.includes('Throughput adicional'));
            if (throughputAddSpec) {
              const match = throughputAddSpec.match(/R\$\s*(\d+\.\d+)/);
              if (match) {
                throughputAdd = parseFloat(match[1]);
              }
            }
            
            // Verificar se tem throughput máximo
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
        
        // Se encontrou tipos, atualiza o estado
        if (Object.keys(types).length > 0) {
          setStorageTypes(types);
        } else {
          // Fallback para os tipos padrão
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
    
    // Registrar para mudanças na tabela de preços
    PriceService.addDataChangeListener(() => loadStorageTypes());
    
    return () => {
      PriceService.removeDataChangeListener(() => loadStorageTypes());
    };
  }, []);

  const handleSelectInternalDiskInternal = (disk: PricedDiskOption, quantity: number) => {
    // Criar ID consistente sem quantidade para evitar duplicatas
    const diskId = `internal-disk-${disk.type}-${disk.capacity}`;
    
    // Fix the issue with specs potentially being an object instead of an array
    let diskSpecs: string[] = [];
    
    if (disk.specs) {
      if (Array.isArray(disk.specs)) {
        diskSpecs = disk.specs;
      } else {
        // Convert the object properties to an array of strings
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
      name: `${disk.type.toUpperCase()} ${disk.capacity}`,
      description: `Disco interno: ${disk.type.toUpperCase()} ${disk.capacity}`,
      price: disk.price * quantity,
      metadata: {
        quantity: quantity,
        features: [`Tipo: ${disk.type}`],
        unitPrice: disk.price
      },
      specs: [
        `Tipo: ${disk.type.toUpperCase()}`,
        `Capacidade: ${disk.capacity}`,
        `Quantidade: ${quantity}`,
        ...diskSpecs // Use the processed specs array that is always an array
      ]
    };
    
    if (onSelectInternalDisk) {
      onSelectInternalDisk(disk, quantity);
    } else {
      handleSelectStorageItem(storageOption, 'internal');
    }
  };

  const handleSelectExternalStorageInternal = (type: string, capacity: number, price: number) => {
    // Obter detalhes do tipo de storage para enriquecer os dados
    const storageType = storageTypes[type.toLowerCase()];
    const iops = storageType?.iops || "Padrão";
    const throughput = storageType?.throughput || "Padrão";
    
    const storageOption: ComponentOption = {
      id: `external-storage-${type}-${capacity}`,
      type: "Armazenamento",
      subtype: "Storage Externo",
      name: `Storage ${type} ${capacity} GB`,
      description: `Storage externo: ${type} ${capacity} GB`,
      price: price,
      specs: [
        `Tipo: Storage ${type}`,
        `Capacidade: ${capacity} GB`,
        `IOPS: ${iops}`,
        `Throughput: ${throughput}`
      ]
    };
    
    // Usar a prop passada se disponível, caso contrário usar função do contexto
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
