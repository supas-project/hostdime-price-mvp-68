
// This file re-exports all functionality from the operations modules
// It is kept for backward compatibility

// Import all needed functions from their respective modules
import { addCategory, updateCategory, deleteCategory, getCategory } from './operations/category-operations';
import { checkForDataConflicts, forceRefreshFromLatestSource } from './operations/data-sync';
import { getDiskOptions } from './operations/data-retrieval';
import { addItem, updateItem, deleteItem, getItem } from './operations/item-operations';
import { getAllData, saveData } from './operations/data-persistence';
import { importData } from './operations/data-import';
import { ensureDataConsistency } from './operations/index';

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
  importData,
  
  // Combined operations
  ensureDataConsistency
};
