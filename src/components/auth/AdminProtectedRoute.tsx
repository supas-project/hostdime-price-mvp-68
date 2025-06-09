
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/auth";
import { ReactNode } from "react";
import { toast } from "sonner";

interface AdminProtectedRouteProps {
  children: ReactNode;
}

/**
 * Unified admin protected route using centralized auth
 */
export default function AdminProtectedRoute({ children }: AdminProtectedRouteProps) {
  const { isAuthenticated, isAdmin, user, loading } = useAuth();
  const location = useLocation();

  console.log("AdminProtectedRoute - Auth state:", { 
    isAuthenticated, 
    isAdmin, 
    userEmail: user?.email,
    loading 
  });

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
          <p className="text-foreground">Verificando permissões...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Consistent admin check using centralized logic
  const isAdminEmail = user?.email === "admin@hostdime.com.br";
  
  if (!isAdmin && !isAdminEmail) {
    toast.error("Acesso negado", {
      description: "Você não tem permissão para acessar esta página."
    });
    
    return <Navigate to="/configure" replace />;
  }

  return <>{children}</>;
}
