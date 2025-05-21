
// Criar um arquivo específico para gerenciar ouvintes de mudanças de dados
// src/services/price/listeners.ts

import { PriceData } from "@/types/pricing";

type DataChangeListener = (data?: PriceData) => void;

const listeners: Set<DataChangeListener> = new Set();

/**
 * Adicionar um ouvinte para mudanças nos dados
 * @param listener Função chamada quando os dados são alterados
 */
export function addDataChangeListener(listener: DataChangeListener): void {
  listeners.add(listener);
  console.log(`[PriceService] Listener added. Total listeners: ${listeners.size}`);
}

/**
 * Remover um ouvinte de mudanças nos dados
 * @param listener Função a ser removida
 */
export function removeDataChangeListener(listener: DataChangeListener): void {
  listeners.delete(listener);
  console.log(`[PriceService] Listener removed. Total listeners: ${listeners.size}`);
}

/**
 * Notificar todos os ouvintes sobre uma mudança nos dados
 * @param data Dados atualizados (opcional)
 */
export function notifyListeners(data?: PriceData): void {
  console.log(`[PriceService] Notifying ${listeners.size} listeners about data change`);
  listeners.forEach(listener => {
    try {
      listener(data);
    } catch (error) {
      console.error("[PriceService] Error in listener:", error);
    }
  });
}
