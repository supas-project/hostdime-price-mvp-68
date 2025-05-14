
import { StoragePricing } from "@/types/storage";

// Preços de discos com controle de versão para detecção de modificações concorrentes
export const diskPricing: StoragePricing = {
  "nvme-500": 89.90,
  "nvme-1000": 169.90,
  "ssd-500": 49.90,
  "ssd-1000": 89.90,
  "hdd-1000": 29.90,
  "hdd-2000": 49.90,
};

// Timestamp da última atualização dos preços
// Isto ajuda a detectar quando os preços foram atualizados,
// o que é crucial para sincronização multiusuário
export const storagePricingLastUpdated = Date.now();

// Função para verificar se um preço foi atualizado
export function isPricingUpdated(lastCheck: number): boolean {
  return storagePricingLastUpdated > lastCheck;
}
