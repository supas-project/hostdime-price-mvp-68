
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { ReactNode } from "react";
import { toast } from "sonner";

interface AdminProtectedRouteProps {
  children: ReactNode;
}

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
    // Redirect to login if not authenticated
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // CORREÇÃO: Verificação explícita se o email do usuário é admin@hostdime.com.br
  const isAdminEmail = user?.email === "admin@hostdime.com.br";
  
  if (!isAdmin && !isAdminEmail) {
    // Mostrar toast de erro e redirecionar
    toast.error("Acesso negado", {
      description: "Você não tem permissão para acessar esta página."
    });
    
    // Redirect to home if authenticated but not admin
    return <Navigate to="/configure" replace />;
  }

  return <>{children}</>;
}
