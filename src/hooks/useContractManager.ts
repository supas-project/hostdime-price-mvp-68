
import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { toast } from 'sonner';

export interface Contract {
  id: string;
  duration_months: number;
  payback_factor: number;
  discount_percentage: number;
  min_commitment?: number;
  description: string;
  active: boolean;
  created_at: string;
}

export function useContractManager() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(false);

  const loadContracts = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('contracts')
        .select('*')
        .eq('active', true)
        .order('duration_months', { ascending: true });

      if (error) throw error;

      setContracts(data || []);
    } catch (error) {
      console.error("Erro ao carregar contratos:", error);
      toast.error("Erro ao carregar contratos");
    } finally {
      setLoading(false);
    }
  }, []);

  const getContractByDuration = useCallback((duration: number): Contract | null => {
    return contracts.find(contract => contract.duration_months === duration) || null;
  }, [contracts]);

  const getPaybackFactor = useCallback((duration: number): number => {
    const contract = getContractByDuration(duration);
    return contract?.payback_factor || 4; // Default para sem contrato
  }, [getContractByDuration]);

  const getDiscountPercentage = useCallback((duration: number): number => {
    const contract = getContractByDuration(duration);
    return contract?.discount_percentage || 0;
  }, [getContractByDuration]);

  useEffect(() => {
    loadContracts();
  }, [loadContracts]);

  return {
    contracts,
    loading,
    loadContracts,
    getContractByDuration,
    getPaybackFactor,
    getDiscountPercentage
  };
}
