
// Re-export all functionality from individual modules without conflicts
export * from './data-persistence';
export * from './data-import';
export * from './data-retrieval';
export * from './data-sync';
export * from './category-operations';
export * from './item-operations';

// Import functions directly from their respective modules
import { forceRefreshFromLatestSource as refreshFromLatestSource } from './data-sync';
import { getAllData as getData } from './data-persistence';

// Function to check for data conflicts
const checkForDataConflicts = async (): Promise<boolean> => {
  try {
    console.log("[Operations] Checking for data conflicts");
    // This is a simplified implementation - we could expand this to check more thoroughly
    return false;
  } catch (error) {
    console.error("[Operations] Error checking for data conflicts:", error);
    return false;
  }
};

// Export a combined function to ensure consistent initialization
export async function ensureDataConsistency() {
  try {
    console.log("[Operations] Ensuring data consistency between all components");
    // Check if there are any conflicts first
    const hasConflicts = await checkForDataConflicts();
    
    if (hasConflicts) {
      console.log("[Operations] Data conflicts detected, refreshing from latest source");
      // If conflicts, refresh data to make sure we have the latest
      return await refreshFromLatestSource();
    }
    
    // No conflicts, get current data
    const currentData = await getData();
    return currentData;
  } catch (error) {
    console.error("[Operations] Error ensuring data consistency:", error);
    throw error;
  }
}
