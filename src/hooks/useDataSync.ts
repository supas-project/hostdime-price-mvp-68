
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

// Key for storing last update
const LAST_UPDATE_KEY = 'price_data_last_update';

// Check interval (in ms)
const CHECK_INTERVAL = 10000; // 10 seconds

export function useDataSync() {
  const { isAdmin } = useAuth();
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [hasUpdates, setHasUpdates] = useState(false);
  const { toast: uiToast } = useToast();

  // Check for available updates
  const checkForUpdates = async () => {
    try {
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
      if (isAdmin) {
        console.log("Data change recorded:", { type, details, timestamp });
        return;
      }
      
      // If not admin, notify about the change
      toast({
        description: `O administrador realizou alterações: ${details}`
      });
      
      // Mark that there are available updates
      setHasUpdates(true);
    } catch (error) {
      console.error("Error notifying data change:", error);
    }
  };
  
  // Register an update made by admin
  const registerAdminChange = async (type: string, details: string) => {
    if (!isAdmin) return; // Only admin can register changes
    
    await notifyDataChange(type, details, 'admin');
    
    // Update local sync time for admin
    setLastSyncTime(new Date());
  };
  
  // Sync with latest updates
  const syncWithLatestData = async () => {
    try {
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
    if (isAdmin) {
      // Admins don't need to check - they are the ones making changes
      return;
    }
    
    const intervalId = setInterval(async () => {
      const hasNewUpdates = await checkForUpdates();
      
      if (hasNewUpdates && !hasUpdates) {
        setHasUpdates(true);
        
        toast({
          description: "O administrador realizou alterações. Clique para atualizar."
        });
      }
    }, CHECK_INTERVAL);
    
    return () => clearInterval(intervalId);
  }, [isAdmin, hasUpdates, lastSyncTime]);

  // Initialize sync time
  useEffect(() => {
    const initSyncTime = async () => {
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
    
    initSyncTime();
  }, []);

  return {
    lastSyncTime,
    hasUpdates,
    registerAdminChange,
    syncWithLatestData,
    notifyDataChange
  };
}
