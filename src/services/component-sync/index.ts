
// Export all functionality from the component sync modules
export * from './storage-converter';
export * from './utils';
export * from './category-manager';
export * from './connectivity-converter'; // Nova exportação para o conversor de conectividade
export * from './processor-converter'; // Nova exportação para o conversor de processador

// Re-export initialization functions to avoid name conflicts
export {
  syncDiskDataWithPriceService,
  initExternalStorageData,
  cleanupDuplicateCategories,
  syncConnectivityData,
  syncProcessorData // Agora está exportado corretamente
} from './initialization';
