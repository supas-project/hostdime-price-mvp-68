
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { toast } from '@/utils/toast-utils';

// Time threshold to prevent duplicate notifications (ms)
const NOTIFICATION_THRESHOLD = 2500; // 2.5 seconds

// Check interval (in ms)
const CHECK_INTERVAL = 10000; // 10 seconds

/**
 * Hook for checking data updates
 */
export function useUpdateCheck(lastSyncTime: Date | null, isAdminAccess: boolean) {
  const { isAuthenticated } = useAuth();
  const [hasUpdates, setHasUpdates] = useState(false);
  const [lastNotificationTime, setLastNotificationTime] = useState<number>(0);

  // Check for available updates
  const checkForUpdates = async () => {
    try {
      if (!isAuthenticated) {
        console.log("User not authenticated to check for updates");
        return false;
      }

      // Fetch the latest update from the database
      const { data, error } = await supabase
        .from('price_data_updates')
        .select('updated_at')
        .order('updated_at', { ascending: false })
        .limit(1)
        .single();
        
      if (error) {
        console.error("Error checking for updates:", error);
        return false;
      }
      
      if (!data) return false;
      
      const storedTime = new Date(data.updated_at);
      
      // Check if latest update is more recent than last sync
      if (lastSyncTime && storedTime > lastSyncTime) {
        return true;
      }
    } catch (error) {
      console.error("Error checking for updates:", error);
    }
    
    return false;
  };

  // Periodically check for changes (non-admin users only)
  useEffect(() => {
    if (!isAuthenticated) {
      return; // Don't check if not authenticated
    }
    
    if (isAdminAccess) {
      // Admins don't need to check - they are the ones making changes
      return;
    }
    
    console.log("Setting up periodic check for updates");
    
    const intervalId = setInterval(async () => {
      const hasNewUpdates = await checkForUpdates();
      
      if (hasNewUpdates && !hasUpdates) {
        setHasUpdates(true);
        
        // Only show notification if it's been at least 2.5 seconds since the last one
        const now = Date.now();
        if (now - lastNotificationTime > NOTIFICATION_THRESHOLD) {
          toast.info("Alterações disponíveis", {
            description: "O administrador fez alterações. Clique para atualizar."
          });
          setLastNotificationTime(now);
        }
      }
    }, CHECK_INTERVAL);
    
    return () => clearInterval(intervalId);
  }, [isAuthenticated, isAdminAccess, hasUpdates, lastSyncTime]);

  return {
    hasUpdates,
    setHasUpdates,
    checkForUpdates,
    lastNotificationTime,
    setLastNotificationTime
  };
}
