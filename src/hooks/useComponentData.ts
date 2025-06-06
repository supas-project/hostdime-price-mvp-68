
import { useState, useEffect } from 'react';
import { ComponentOption } from '@/types/component';
import { ComponentService } from '@/services/componentService';
import { toast } from 'sonner';

export function useComponentData(componentType?: string) {
  const [components, setComponents] = useState<ComponentOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadComponents = async () => {
    if (!componentType) return;

    try {
      setLoading(true);
      setError(null);
      
      let data: ComponentOption[] = [];
      
      switch (componentType.toLowerCase()) {
        case 'cpu':
        case 'processor':
        case 'processador':
          data = await ComponentService.getCPUComponents();
          break;
        case 'memory':
        case 'memoria':
          data = await ComponentService.getMemoryComponents();
          break;
        case 'os':
        case 'sistema_operacional':
        case 'sistemaoperacional':
          data = await ComponentService.getOSComponents();
          break;
        case 'connectivity':
        case 'conectividade':
          data = await ComponentService.getConnectivityComponents();
          break;
        case 'storage':
        case 'armazenamento':
          data = await ComponentService.getStorageComponents();
          break;
        case 'datacenter':
          data = await ComponentService.getDataCenters();
          break;
        case 'contract':
        case 'contrato':
          data = await ComponentService.getContractTypes();
          break;
        default:
          console.warn(`Unknown component type: ${componentType}`);
      }
      
      setComponents(data);
      console.log(`[useComponentData] Loaded ${data.length} ${componentType} components`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      console.error(`[useComponentData] Error loading ${componentType}:`, err);
      toast.error(`Erro ao carregar ${componentType}`, { description: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (componentType) {
      loadComponents();
    }
  }, [componentType]);

  return {
    components,
    loading,
    error,
    refetch: loadComponents
  };
}
