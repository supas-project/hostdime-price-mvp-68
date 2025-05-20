
// This file re-exports all functionality from the operations modules
// It is kept for backward compatibility

// Import category operations
import { addCategory, updateCategory, deleteCategory, getCategory } from './operations/category-operations';

// Import data sync operations
import { checkForDataConflicts, forceRefreshFromLatestSource } from './operations/data-sync';

// Import data retrieval operations
import { getDiskOptions } from './operations/data-retrieval';

// Import item operations
import { addItem, updateItem, deleteItem, getItem } from './operations/item-operations';

// Import data persistence & import operations
import { getAllData, saveData } from './operations/data-persistence';
import { importData } from './operations/data-import';

// Re-export everything
export {
  // Category operations
  addCategory,
  updateCategory,
  deleteCategory,
  getCategory,
  
  // Data sync operations
  checkForDataConflicts,
  forceRefreshFromLatestSource,
  
  // Data retrieval operations
  getDiskOptions,
  
  // Item operations
  addItem,
  updateItem,
  deleteItem,
  getItem,
  
  // Data persistence & import operations
  getAllData,
  saveData,
  importData
};
