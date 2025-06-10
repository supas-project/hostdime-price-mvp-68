
// Export core functionality from the component sync modules
export * from './storage-converter';
export * from './utils';
export * from './category-manager';
export * from './connectivity-converter'; 
export * from './processor-converter'; 
export * from './memory-converter';

// Export initialization functions
export {
  syncDiskDataWithPriceService,
  initExternalStorageData,
  cleanupDuplicateCategories,
  syncConnectivityData,
  syncProcessorData,
  syncMemoryData
} from './initialization';
