
// Array of listener functions to be called when data changes
const dataChangeListeners: Array<(data?: any) => void> = [];

/**
 * Adds a listener function that will be called when data changes
 * @param listener The function to call when data changes
 */
export function addDataChangeListener(listener: (data?: any) => void): void {
  dataChangeListeners.push(listener);
}

/**
 * Removes a listener function
 * @param listener The function to remove
 */
export function removeDataChangeListener(listener: (data?: any) => void): void {
  const index = dataChangeListeners.indexOf(listener);
  if (index !== -1) {
    dataChangeListeners.splice(index, 1);
  }
}

/**
 * Notifies all listeners that data has changed
 * @param data Optional data to pass to the listeners
 */
export function notifyListeners(data?: any): void {
  console.log(`[PriceService] Notifying ${dataChangeListeners.length} listeners of data change`);
  dataChangeListeners.forEach(listener => {
    try {
      listener(data);
    } catch (error) {
      console.error('[PriceService] Error in data change listener:', error);
    }
  });
}
