
// Re-export from connectivity converter
export { convertConnectivityPriceDataToComponents, saveConnectivityComponentsToPriceData } from './component-sync/connectivity-converter';

// Re-export from processor converter
export { 
  convertProcessorPriceDataToComponents, 
  saveProcessorComponentsToPriceData,
  syncProcessorUpdatesFromPriceTable
} from './component-sync/processor-converter';

// Re-export utility functions
export { logDebug } from './component-sync/utils';

// Re-export from initialization module for backwards compatibility
export { 
  syncDiskDataWithPriceService, 
  initExternalStorageData,
  initializeServerCategories,
  cleanupDuplicateCategories,
  syncConnectivityData,
  syncProcessorData
} from './component-sync/initialization';
