
import { PriceData } from '@/types/pricing';

type DataChangeListener = () => void;

// Singleton para gerenciamento global de listeners
let currentListener: DataChangeListener | null = null;

/**
 * Adiciona um listener para mudanças nos dados de preço
 */
export function addDataChangeListener(listener: DataChangeListener): void {
  if (currentListener) {
    console.warn("[PriceService] Substituindo listener de mudança de dados existente");
  }
  currentListener = listener;
  console.log("[PriceService] Listener de mudança de dados adicionado");
}

/**
 * Remove o listener atual de mudança de dados
 */
export function removeDataChangeListener(): void {
  currentListener = null;
  console.log("[PriceService] Listener de mudança de dados removido");
}

/**
 * Notifica qualquer listener registrado sobre mudanças nos dados
 */
export function notifyListeners(data: PriceData | null = null): void {
  if (currentListener) {
    console.log("[PriceService] Notificando listener de mudança de dados");
    currentListener();
  } else {
    console.log("[PriceService] Nenhum listener de mudança de dados registrado, notificação ignorada");
  }
}
