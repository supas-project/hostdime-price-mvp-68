
// Re-export all functionality from individual modules without conflicts
export * from './data-persistence';
export * from './data-import';
export * from './data-retrieval';
export * from './data-sync';
export * from './category-operations';
export * from './item-operations';

// Import the specific functions we need for the combined function
import { checkForDataConflicts, forceRefreshFromLatestSource } from './data-sync';
import { getAllData } from './data-persistence';

// Export a combined function to ensure consistent initialization
export async function ensureDataConsistency() {
  try {
    console.log("[Operations] Ensuring data consistency between all components");
    // Check if there are any conflicts first
    const hasConflicts = await checkForDataConflicts();
    
    if (hasConflicts) {
      console.log("[Operations] Data conflicts detected, refreshing from latest source");
      // If conflicts, refresh data to make sure we have the latest
      return await forceRefreshFromLatestSource();
    }
    
    // No conflicts, get current data
    const currentData = await getAllData();
    return currentData;
  } catch (error) {
    console.error("[Operations] Error ensuring data consistency:", error);
    throw error;
  }
}
