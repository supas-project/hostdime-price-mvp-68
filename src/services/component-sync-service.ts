
// Re-export from the new modular structure
// This file is kept for backward compatibility
export * from './component-sync';
export {
  syncDiskDataWithPriceService,
  initExternalStorageData,
  initializeServerCategories
} from './component-sync/initialization';
