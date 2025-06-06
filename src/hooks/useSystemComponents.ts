
import { useState, useEffect } from 'react';
import { SystemComponentsService, SystemComponent, DataCenter, ContractType } from '@/services/systemComponentsService';
import { toast } from 'sonner';

export function useSystemComponents(componentType?: string) {
  const [components, setComponents] = useState<SystemComponent[]>([]);
  const [dataCenters, setDataCenters] = useState<DataCenter[]>([]);
  const [contractTypes, setContractTypes] = useState<ContractType[]>([]);
  const [loading, setLoading] = useState(false);

  const loadComponents = async () => {
    if (!componentType) return;
    
    try {
      setLoading(true);
      const data = await SystemComponentsService.getComponentsByType(componentType);
      setComponents(data);
    } catch (error) {
      console.error(`Error loading ${componentType} components:`, error);
      toast.error(`Erro ao carregar componentes de ${componentType}`);
    } finally {
      setLoading(false);
    }
  };

  const loadDataCenters = async () => {
    try {
      setLoading(true);
      const data = await SystemComponentsService.getAllDataCenters();
      setDataCenters(data);
    } catch (error) {
      console.error('Error loading data centers:', error);
      toast.error('Erro ao carregar data centers');
    } finally {
      setLoading(false);
    }
  };

  const loadContractTypes = async () => {
    try {
      setLoading(true);
      const data = await SystemComponentsService.getAllContractTypes();
      setContractTypes(data);
    } catch (error) {
      console.error('Error loading contract types:', error);
      toast.error('Erro ao carregar tipos de contrato');
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
    dataCenters,
    contractTypes,
    loading,
    loadComponents,
    loadDataCenters,
    loadContractTypes,
    refetch: loadComponents
  };
}
