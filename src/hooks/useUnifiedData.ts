
import { useState, useEffect } from 'react';
import { 
  UnifiedDataService, 
  UnifiedComponent, 
  UnifiedDataCenter, 
  UnifiedContractType, 
  UnifiedStorageItem,
  ConsolidatedDataStatus 
} from '@/services/unified-data-service';
import { ComponentService } from '@/services/component-service-refactored';
import { useAuth } from '@/hooks/auth';
import { toast } from 'sonner';

export function useUnifiedData() {
  const { isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  const [consolidationStatus, setConsolidationStatus] = useState<ConsolidatedDataStatus | null>(null);
  
  // Data states
  const [cpuComponents, setCpuComponents] = useState<UnifiedComponent[]>([]);
  const [memoryComponents, setMemoryComponents] = useState<UnifiedComponent[]>([]);
  const [osComponents, setOsComponents] = useState<UnifiedComponent[]>([]);
  const [connectivityComponents, setConnectivityComponents] = useState<UnifiedComponent[]>([]);
  const [dataCenters, setDataCenters] = useState<UnifiedDataCenter[]>([]);
  const [contractTypes, setContractTypes] = useState<UnifiedContractType[]>([]);
  const [storageItems, setStorageItems] = useState<UnifiedStorageItem[]>([]);

  /**
   * Load consolidation status
   */
  const loadConsolidationStatus = async () => {
    try {
      const status = await UnifiedDataService.getConsolidationStatus();
      setConsolidationStatus(status);
      return status;
    } catch (error) {
      console.error('Error loading consolidation status:', error);
      return null;
    }
  };

  /**
   * Run data consolidation and ensure unified data
   */
  const consolidateData = async () => {
    setLoading(true);
    try {
      console.log('[useUnifiedData] Starting data consolidation...');
      
      // Consolidate data through ComponentService
      await ComponentService.ensureDataConsolidation();
      
      // Reload status and data
      await loadConsolidationStatus();
      await loadAllData();
      
      toast.success('Dados unificados consolidados com sucesso');
    } catch (error) {
      console.error('Error consolidating unified data:', error);
      toast.error('Erro na consolidação de dados unificados');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Load all data from unified service
   */
  const loadAllData = async () => {
    if (!isAuthenticated) {
      console.log('User not authenticated, skipping unified data load');
      return;
    }

    setLoading(true);
    try {
      console.log('[useUnifiedData] Loading all unified data...');
      
      const [
        cpuData,
        memoryData,
        osData,
        connectivityData,
        dataCenterData,
        contractData,
        storageData
      ] = await Promise.all([
        UnifiedDataService.getComponentsByType('cpu'),
        UnifiedDataService.getComponentsByType('memory'),
        UnifiedDataService.getComponentsByType('os'),
        UnifiedDataService.getComponentsByType('connectivity'),
        UnifiedDataService.getAllDataCenters(),
        UnifiedDataService.getAllContractTypes(),
        UnifiedDataService.getAllStorageItems()
      ]);

      setCpuComponents(cpuData);
      setMemoryComponents(memoryData);
      setOsComponents(osData);
      setConnectivityComponents(connectivityData);
      setDataCenters(dataCenterData);
      setContractTypes(contractData);
      setStorageItems(storageData);

      console.log('[useUnifiedData] All unified data loaded successfully');
    } catch (error) {
      console.error('Error loading unified data:', error);
      toast.error('Erro ao carregar dados unificados do sistema');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Load specific component type
   */
  const loadComponentsByType = async (componentType: string) => {
    try {
      const data = await UnifiedDataService.getComponentsByType(componentType);
      
      switch (componentType) {
        case 'cpu':
          setCpuComponents(data);
          break;
        case 'memory':
          setMemoryComponents(data);
          break;
        case 'os':
          setOsComponents(data);
          break;
        case 'connectivity':
          setConnectivityComponents(data);
          break;
      }
      
      return data;
    } catch (error) {
      console.error(`Error loading ${componentType} components:`, error);
      toast.error(`Erro ao carregar componentes de ${componentType}`);
      return [];
    }
  };

  // Auto-load data on authentication
  useEffect(() => {
    if (isAuthenticated) {
      loadConsolidationStatus();
      loadAllData();
    }
  }, [isAuthenticated]);

  return {
    // Loading states
    loading,
    
    // Data
    cpuComponents,
    memoryComponents,
    osComponents,
    connectivityComponents,
    dataCenters,
    contractTypes,
    storageItems,
    
    // Consolidation
    consolidationStatus,
    
    // Actions
    consolidateData,
    loadAllData,
    loadComponentsByType,
    loadConsolidationStatus
  };
}
