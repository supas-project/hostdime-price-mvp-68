
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
 * Unified permissions hook using consolidated auth
 */
export function usePermissions(): Permissions {
  const { user, isAdmin } = useAuth();
  
  // Consistent admin check using unified logic
  const isAdminUser = isAdmin;
  
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
