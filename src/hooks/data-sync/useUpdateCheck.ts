
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { toast } from '@/utils/toast-utils';

// Time threshold to prevent duplicate notifications (ms)
const NOTIFICATION_THRESHOLD = 2500; // 2.5 seconds

/**
 * Hook for checking data updates
 */
export function useUpdateCheck(lastSyncTime: Date | null, isAdminAccess: boolean) {
  const { isAuthenticated, user } = useAuth();
  const [hasUpdates, setHasUpdates] = useState(false);
  const [lastNotificationTime, setLastNotificationTime] = useState<number>(0);
  
  // Verifica explicitamente se o usuário é admin@hostdime.com.br
  const isAdmin = user?.email === "admin@hostdime.com.br";

  // Check for available updates - agora só funciona sob demanda, não automaticamente
  const checkForUpdates = async () => {
    try {
      if (!isAuthenticated) {
        console.log("User not authenticated to check for updates");
        return false;
      }

      // Somente o admin pode verificar atualizações
      if (!isAdmin) {
        console.log("Only admin can check for updates");
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

  // Removemos a verificação periódica automática
  // Mantemos apenas o estado e a função de verificação manual

  return {
    hasUpdates,
    setHasUpdates,
    checkForUpdates,
    lastNotificationTime,
    setLastNotificationTime
  };
}
