
// Export all functionality from the component sync modules
export * from './storage-converter';
export * from './utils';
export * from './category-manager';
export * from './connectivity-converter'; 
export * from './processor-converter'; 
export * from './memory-converter'; // Nova exportação para o conversor de memória

// Re-export initialization functions to avoid name conflicts
export {
  syncDiskDataWithPriceService,
  initExternalStorageData,
  cleanupDuplicateCategories,
  syncConnectivityData,
  syncProcessorData, 
  syncMemoryData // Nova função para sincronizar dados de memória
} from './initialization';
