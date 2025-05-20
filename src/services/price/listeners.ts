
import { PriceData } from '@/types/pricing';

type DataChangeListener = (data: PriceData | null) => void;

// Singleton for global listener management
let currentListener: DataChangeListener | null = null;

/**
 * Adds a listener for price data changes
 */
export function addDataChangeListener(listener: DataChangeListener): void {
  if (currentListener) {
    console.warn("[PriceService] Replacing existing data change listener");
  }
  currentListener = listener;
  console.log("[PriceService] Data change listener added");
}

/**
 * Removes the current data change listener
 */
export function removeDataChangeListener(): void {
  currentListener = null;
  console.log("[PriceService] Data change listener removed");
}

/**
 * Notifies any registered listener about data changes
 */
export function notifyListeners(data: PriceData | null = null): void {
  if (currentListener) {
    console.log("[PriceService] Notifying data change listener");
    currentListener(data);
  } else {
    console.log("[PriceService] No data change listener registered, notification skipped");
  }
}
