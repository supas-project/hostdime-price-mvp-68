
import { useAppStore } from '@/store/appStore';

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

export function usePermissions(): Permissions {
  const { user, isAdmin } = useAuth();
  
  // Verificação explícita para administrador
  const isAdminUser = isAdmin || user?.email === "admin@hostdime.com.br";
  
  return {
    // Permissões para usuários autenticados
    canViewQuotes: !!user,
    canCreateQuotes: !!user,
    canEditQuotes: !!user,
    canDeleteQuotes: !!user,
    canSendEmails: !!user,
    canDownloadPDF: !!user,
    
    // Permissões apenas para administradores
    canManagePrices: isAdminUser,
    canManageUsers: isAdminUser,
    canViewAnalytics: isAdminUser,
  };
}

export function useCanAccess(permission: keyof Permissions): boolean {
  const permissions = usePermissions();
  return permissions[permission];
}
