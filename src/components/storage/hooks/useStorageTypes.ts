
import { useState, useEffect, useRef } from "react";
import { PriceService } from "@/services/price-service";

interface StorageType {
  name: string;
  pricePerGB: number;
  iops: string;
  throughput: string;
  description: string;
  throughputAdd?: number;
  maxThroughput?: string;
}

export function useStorageTypes() {
  const [storageTypes, setStorageTypes] = useState<{
    [key: string]: StorageType;
  }>({});
  
  // Usar useRef para armazenar a função de callback para evitar recriação
  const loadStorageTypesRef = useRef<() => void>();

  useEffect(() => {
    // Definir a função de carregamento de tipos de armazenamento
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
    
    // Armazenar referência da função para usar depois
    loadStorageTypesRef.current = loadStorageTypes;
    
    // Executar busca inicial
    loadStorageTypes();
    
    // Registrar listener usando a referência armazenada
    if (loadStorageTypesRef.current) {
      PriceService.addDataChangeListener(loadStorageTypesRef.current);
    }
    
    // Cleanup: remover listener quando componente for desmontado
    return () => {
      if (loadStorageTypesRef.current) {
        PriceService.removeDataChangeListener(loadStorageTypesRef.current);
      }
    };
  }, []);

  return storageTypes;
}
