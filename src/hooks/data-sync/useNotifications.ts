
import { supabase } from '@/lib/supabase';
import { toast } from '@/utils/toast-utils';

// Time threshold to prevent duplicate notifications (ms)
const NOTIFICATION_THRESHOLD = 2500; // 2.5 seconds

/**
 * Hook for managing data change notifications
 */
export function useNotifications(
  isAuthenticated: boolean, 
  isAdminAccess: boolean,
  lastNotificationTime: number,
  setLastNotificationTime: (time: number) => void
) {
  // Notify about a data change
  const notifyDataChange = async (type: string, details: string, initiator = 'system') => {
    try {
      if (!isAuthenticated) {
        console.error("User not authenticated to notify changes");
        return;
      }

      // Record update in database
      const timestamp = new Date().toISOString();
      
      const { error } = await supabase
        .from('price_data_updates')
        .insert([
          { 
            type,
            details,
            initiator,
            updated_at: timestamp
          }
        ]);
        
      if (error) {
        console.error("Error recording update:", error);
      }
      
      // If admin, just log the change but don't notify
      if (isAdminAccess) {
        console.log("Data change recorded:", { type, details, timestamp });
        return;
      }
      
      // If not admin, notify about the change (with duplicate prevention)
      const now = Date.now();
      if (now - lastNotificationTime > NOTIFICATION_THRESHOLD) {
        toast.info("Alterações disponíveis", {
          description: `O administrador fez alterações: ${details}`
        });
        setLastNotificationTime(now);
      }
    } catch (error) {
      console.error("Error notifying data change:", error);
    }
  };

  return {
    notifyDataChange
  };
}
