
// This file now serves as a simple entry point to the modularized hooks
import { useDiskManagement } from './disk-management';
import { useDiskManagementOriginal } from './disk-management';

// Export the new modularized hook as the default
export { useDiskManagement };

// Also export the original implementation for backward compatibility if needed
export { useDiskManagementOriginal };
