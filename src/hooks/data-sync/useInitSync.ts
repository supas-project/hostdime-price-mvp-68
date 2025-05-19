
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

/**
 * Hook for initializing data synchronization
 */
export function useInitSync() {
  const { isAuthenticated } = useAuth();
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  
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
    setLastSyncTime
  };
}
