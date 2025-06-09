
import { useState, useEffect } from 'react';
import { ComponentOption } from '@/types/component';
import { ComponentService } from '@/services/component-service-refactored';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

/**
 * Refactored component data hook using the new ComponentService
 * Replaces the old useComponentData hook
 */
export function useComponentData() {
  const { isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Component states
  const [cpuComponents, setCpuComponents] = useState<ComponentOption[]>([]);
  const [memoryComponents, setMemoryComponents] = useState<ComponentOption[]>([]);
  const [osComponents, setOsComponents] = useState<ComponentOption[]>([]);
  const [connectivityComponents, setConnectivityComponents] = useState<ComponentOption[]>([]);
  const [storageComponents, setStorageComponents] = useState<ComponentOption[]>([]);
  const [dataCenters, setDataCenters] = useState<ComponentOption[]>([]);
  const [contractTypes, setContractTypes] = useState<ComponentOption[]>([]);

  /**
   * Load all component data
   */
  const loadAllComponents = async () => {
    if (!isAuthenticated) {
      console.log('[useComponentData] User not authenticated, skipping load');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('[useComponentData] Loading all components from unified service...');
      
      const [
        cpuData,
        memoryData,
        osData,
        connectivityData,
        storageData,
        dataCenterData,
        contractData
      ] = await Promise.all([
        ComponentService.getCPUComponents(),
        ComponentService.getMemoryComponents(),
        ComponentService.getOSComponents(),
        ComponentService.getConnectivityComponents(),
        ComponentService.getStorageComponents(),
        ComponentService.getDataCenters(),
        ComponentService.getContractTypes()
      ]);

      setCpuComponents(cpuData);
      setMemoryComponents(memoryData);
      setOsComponents(osData);
      setConnectivityComponents(connectivityData);
      setStorageComponents(storageData);
      setDataCenters(dataCenterData);
      setContractTypes(contractData);

      console.log('[useComponentData] All components loaded successfully');
    } catch (error) {
      console.error('[useComponentData] Error loading components:', error);
      setError(error instanceof Error ? error.message : 'Erro ao carregar componentes');
      toast.error('Erro ao carregar componentes do sistema');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Load specific component type
   */
  const loadComponentType = async (type: string) => {
    setLoading(true);
    setError(null);

    try {
      let data: ComponentOption[] = [];
      
      switch (type) {
        case 'cpu':
          data = await ComponentService.getCPUComponents();
          setCpuComponents(data);
          break;
        case 'memory':
          data = await ComponentService.getMemoryComponents();
          setMemoryComponents(data);
          break;
        case 'os':
          data = await ComponentService.getOSComponents();
          setOsComponents(data);
          break;
        case 'connectivity':
          data = await ComponentService.getConnectivityComponents();
          setConnectivityComponents(data);
          break;
        case 'storage':
          data = await ComponentService.getStorageComponents();
          setStorageComponents(data);
          break;
        case 'datacenter':
          data = await ComponentService.getDataCenters();
          setDataCenters(data);
          break;
        case 'contract':
          data = await ComponentService.getContractTypes();
          setContractTypes(data);
          break;
        default:
          console.warn(`[useComponentData] Unknown component type: ${type}`);
      }

      return data;
    } catch (error) {
      console.error(`[useComponentData] Error loading ${type} components:`, error);
      setError(error instanceof Error ? error.message : `Erro ao carregar ${type}`);
      toast.error(`Erro ao carregar componentes de ${type}`);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Load components when authentication state changes
  useEffect(() => {
    if (isAuthenticated) {
      loadAllComponents();
    }
  }, [isAuthenticated]);

  return {
    // Loading states
    loading,
    error,
    
    // Component data
    cpuComponents,
    memoryComponents,
    osComponents,
    connectivityComponents,
    storageComponents,
    dataCenters,
    contractTypes,
    
    // Actions
    loadAllComponents,
    loadComponentType,
    
    // Utils
    getAllComponents: () => ({
      cpu: cpuComponents,
      memory: memoryComponents,
      os: osComponents,
      connectivity: connectivityComponents,
      storage: storageComponents,
      datacenter: dataCenters,
      contract: contractTypes
    })
  };
}
