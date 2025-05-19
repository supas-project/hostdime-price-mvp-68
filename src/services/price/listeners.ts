import { PriceData } from '@/types/pricing';
import { getAllData } from './operations';

// Array to store data change listeners
let listeners: ((data: PriceData) => void)[] = [];

/**
 * Adds a new data change listener
 */
export function addDataChangeListener(listener: (data: PriceData) => void) {
  listeners.push(listener);
}

/**
 * Removes a data change listener
 */
export function removeDataChangeListener(listener: (data: PriceData) => void) {
  listeners = listeners.filter(l => l !== listener);
}

/**
 * Notifies all listeners about data changes
 */
export function notifyListeners() {
  getAllData().then(data => {
    listeners.forEach(listener => listener(data));
  }).catch(error => {
    console.error("Error notifying listeners:", error);
  });
}
