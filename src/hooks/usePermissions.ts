
import { useAuth } from '@/contexts/auth/UnifiedAuthContext';

export interface Permissions {
  canViewQuotes: boolean;
  canCreateQuotes: boolean;
  canEditQuotes: boolean;
  canDeleteQuotes: boolean;
  canManagePrices: boolean;
  canManageUsers: boolean;
  canViewAnalytics: boolean;
  canSendEmails: boolean;
  canDownloadPDF: boolean;
}

/**
 * Centralized permissions hook using unified auth
 */
export function usePermissions(): Permissions {
  const { user, isAdmin } = useAuth();
  
  // Consistent admin check using centralized logic
  const isAdminUser = isAdmin || user?.email === "admin@hostdime.com.br";
  
  return {
    // Permissions for authenticated users
    canViewQuotes: !!user,
    canCreateQuotes: !!user,
    canEditQuotes: !!user,
    canDeleteQuotes: !!user,
    canSendEmails: !!user,
    canDownloadPDF: !!user,
    
    // Admin-only permissions
    canManagePrices: isAdminUser,
    canManageUsers: isAdminUser,
    canViewAnalytics: isAdminUser,
  };
}

export function useCanAccess(permission: keyof Permissions): boolean {
  const permissions = usePermissions();
  return permissions[permission];
}
