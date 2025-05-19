
import { toast } from '@/utils/toast-utils';

/**
 * Hook for registering admin changes
 */
export function useAdminChanges(
  isAdminAccess: boolean,
  notifyDataChange: (type: string, details: string, initiator?: string) => Promise<void>,
  setLastSyncTime: (time: Date) => void,
  lastNotificationTime: number,
  setLastNotificationTime: (time: number) => void
) {
  // Time threshold to prevent duplicate notifications (ms)
  const NOTIFICATION_THRESHOLD = 2500; // 2.5 seconds

  // Register an update made by admin
  const registerAdminChange = async (type: string, details: string) => {
    if (!isAdminAccess) {
      console.error("Only administrators can register changes");
      return;
    }
    
    await notifyDataChange(type, details, 'admin');
    
    // Update local sync time for admin
    setLastSyncTime(new Date());
    
    // Show success notification to admin (with duplicate prevention)
    const now = Date.now();
    if (now - lastNotificationTime > NOTIFICATION_THRESHOLD) {
      toast.success("Alterações registradas com sucesso");
      setLastNotificationTime(now);
    }
  };

  return {
    registerAdminChange
  };
}
