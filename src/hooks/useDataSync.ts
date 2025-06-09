
import { useAuth } from '@/hooks/auth';
import { useInitSync } from './data-sync/useInitSync';
import { useUpdateCheck } from './data-sync/useUpdateCheck';
import { useNotifications } from './data-sync/useNotifications';
import { useAdminChanges } from './data-sync/useAdminChanges';
import { useSyncOperations } from './data-sync/useSyncOperations';

export function useDataSync() {
  const { isAuthenticated, isAdmin, user } = useAuth();
  
  // Explicit check if user email is admin@hostdime.com.br
  const isAdminAccess = user?.email === "admin@hostdime.com.br";
  
  // Use the specialized hooks
  const { lastSyncTime, setLastSyncTime } = useInitSync();
  
  const { 
    hasUpdates, 
    setHasUpdates,
    lastNotificationTime,
    setLastNotificationTime
  } = useUpdateCheck(lastSyncTime, isAdminAccess);
  
  const { notifyDataChange } = useNotifications(
    isAuthenticated, 
    isAdminAccess,
    lastNotificationTime,
    setLastNotificationTime
  );
  
  const { registerAdminChange } = useAdminChanges(
    isAdminAccess,
    notifyDataChange,
    setLastSyncTime,
    lastNotificationTime,
    setLastNotificationTime
  );
  
  const { syncWithLatestData } = useSyncOperations(
    isAuthenticated,
    setLastSyncTime,
    setHasUpdates
  );

  return {
    lastSyncTime,
    hasUpdates,
    registerAdminChange,
    syncWithLatestData,
    notifyDataChange,
    isAdminAccess
  };
}
