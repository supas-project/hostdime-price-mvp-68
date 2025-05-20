
import { PriceData } from '@/types/pricing';

type DataChangeListener = () => void;

// Singleton for global listener management
const listeners: DataChangeListener[] = [];

/**
 * Adds a listener for price data changes
 */
export function addDataChangeListener(listener: DataChangeListener): void {
  // Check if listener already exists to avoid duplicates
  const exists = listeners.some(l => l === listener);
  if (!exists) {
    listeners.push(listener);
    console.log(`[PriceService] Data change listener added. Total listeners: ${listeners.length}`);
  } else {
    console.log("[PriceService] Listener already registered, ignoring duplicate");
  }
}

/**
 * Removes all listeners for price data changes
 */
export function removeDataChangeListener(): void {
  const count = listeners.length;
  listeners.length = 0;
  console.log(`[PriceService] ${count} data change listeners removed`);
}

/**
 * Notifies all registered listeners about data changes
 */
export function notifyListeners(data: PriceData | null = null): void {
  if (listeners.length > 0) {
    console.log(`[PriceService] Notifying ${listeners.length} data change listeners`);
    listeners.forEach(listener => {
      try {
        listener();
      } catch (error) {
        console.error("[PriceService] Error in listener callback:", error);
      }
    });
  } else {
    console.log("[PriceService] No data change listeners registered, notification skipped");
  }
}
