import { useQuery } from '@tanstack/react-query';
import { getPaybackOptions } from '@/services/pricing-service';

// Tipagem para opção de payback
interface PaybackOption {
  id: string;
  contract_duration: number;
  value: number;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

export function usePaybackOptions() {
  return useQuery<PaybackOption[], Error>({
    queryKey: ['paybackOptions'],
    queryFn: async (): Promise<PaybackOption[]> => {
      try {
        const data = await getPaybackOptions();

        // Validar e filtrar dados inválidos
        if (!Array.isArray(data)) {
          console.warn('PaybackOptions: Dados não são um array:', data);
          return [];
        }

        return data.filter((option): option is PaybackOption => {
          return (
            option &&
            typeof option === 'object' &&
            typeof option.id === 'string' &&
            typeof option.contract_duration === 'number' &&
            typeof option.value === 'number'
          );
        });
      } catch (error) {
        console.error('Erro ao buscar opções de payback:', error);
        throw new Error('Não foi possível carregar as opções de payback.');
      }
    },
    staleTime: 1000 * 60 * 60, // Cache por 1 hora
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}

// Export do tipo para uso em outros componentes
export type { PaybackOption };
