
import { PriceData } from '@/types/pricing';

// Array to store listener callbacks
type DataChangeListener = (data: PriceData | null) => void;
let listeners: DataChangeListener[] = [];

/**
 * Adds a listener for data changes
 */
export function addDataChangeListener(callback: DataChangeListener): void {
  if (typeof callback === 'function') {
    listeners.push(callback);
    console.log("[PriceService] Data change listener added, total listeners:", listeners.length);
  } else {
    console.error("[PriceService] Invalid listener callback provided");
  }
}

/**
 * Removes a listener from the array
 */
export function removeDataChangeListener(callback?: DataChangeListener): void {
  if (callback) {
    listeners = listeners.filter(listener => listener !== callback);
    console.log("[PriceService] Specific listener removed, remaining:", listeners.length);
  } else {
    // If no callback provided, remove all listeners
    listeners = [];
    console.log("[PriceService] All listeners removed");
  }
}

/**
 * Notifies all listeners about data changes
 */
export function notifyListeners(data?: PriceData): void {
  console.log("[PriceService] Notifying", listeners.length, "listeners about data changes");
  listeners.forEach(listener => {
    try {
      listener(data || null);
    } catch (error) {
      console.error("[PriceService] Error in listener callback:", error);
    }
  });
}
