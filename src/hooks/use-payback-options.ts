import { useQuery } from '@tanstack/react-query';
import { getPaybackOptions } from '@/services/pricing-service';

export function usePaybackOptions() {
  return useQuery({
    queryKey: ['paybackOptions'],
    queryFn: getPaybackOptions,
    staleTime: 1000 * 60 * 60, // Cache por 1 hora
  });
}
