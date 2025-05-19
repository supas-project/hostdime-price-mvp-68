
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { toast } from '@/utils/toast-utils';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

// Key for storing last update
const LAST_UPDATE_KEY = 'price_data_last_update';

// Check interval (in ms)
const CHECK_INTERVAL = 10000; // 10 seconds

// Time threshold to prevent duplicate notifications (ms)
const NOTIFICATION_THRESHOLD = 2500; // 2.5 seconds

export function useDataSync() {
  const { isAuthenticated, isAdmin, user } = useAuth();
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [hasUpdates, setHasUpdates] = useState(false);
  const { toast: uiToast } = useToast();
  const [lastNotificationTime, setLastNotificationTime] = useState<number>(0);

  // Explicit check if user email is admin@hostdime.com.br
  const isAdminAccess = user?.email === "admin@hostdime.com.br";

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
          description: `O administrador fez alterações: ${details}`,
          icon: <AlertCircle />
        });
        setLastNotificationTime(now);
      }
      
      // Mark that there are available updates
      setHasUpdates(true);
    } catch (error) {
      console.error("Error notifying data change:", error);
    }
  };
  
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
      toast.success("Alterações registradas com sucesso", {
        icon: <CheckCircle2 />
      });
      setLastNotificationTime(now);
    }
  };
  
  // Sync with latest updates
  const syncWithLatestData = async () => {
    try {
      if (!isAuthenticated) {
        console.error("User not authenticated to sync data");
        return false;
      }

      const { data, error } = await supabase
        .from('price_data_updates')
        .select('updated_at')
        .order('updated_at', { ascending: false })
        .limit(1)
        .single();
      
      if (error) {
        console.error("Error fetching latest update:", error);
        return false;
      }
      
      if (data) {
        setLastSyncTime(new Date(data.updated_at));
        setHasUpdates(false);
        return true;
      }
    } catch (error) {
      console.error("Error syncing with latest data:", error);
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
            description: "O administrador fez alterações. Clique para atualizar.",
            icon: <AlertCircle />
          });
          setLastNotificationTime(now);
        }
      }
    }, CHECK_INTERVAL);
    
    return () => clearInterval(intervalId);
  }, [isAuthenticated, isAdminAccess, hasUpdates, lastSyncTime]);

  // Initialize sync time
  useEffect(() => {
    const initSyncTime = async () => {
      if (!isAuthenticated) {
        return; // Don't initialize if not authenticated
      }

      try {
        const { data, error } = await supabase
          .from('price_data_updates')
          .select('updated_at')
          .order('updated_at', { ascending: false })
          .limit(1)
          .single();
        
        if (data) {
          setLastSyncTime(new Date(data.updated_at));
        } else {
          // If no previous record, initialize with current time
          setLastSyncTime(new Date());
        }
      } catch (error) {
        // In case of error, initialize with current time
        console.error("Error initializing sync time:", error);
        setLastSyncTime(new Date());
      }
    };
    
    if (isAuthenticated) {
      initSyncTime();
    }
  }, [isAuthenticated]);

  return {
    lastSyncTime,
    hasUpdates,
    registerAdminChange,
    syncWithLatestData,
    notifyDataChange,
    isAdminAccess
  };
}
