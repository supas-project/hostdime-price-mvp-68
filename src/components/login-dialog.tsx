
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { LogIn, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { cn } from "@/lib/utils";

export function LoginDialog() {
  const { isAuthenticated, user, logout, loading } = useAuth();
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  
  // Verificação explícita para acesso de administrador
  const isAdminAccess = user?.email === "admin@hostdime.com.br";

  if (loading) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium animate-pulse">
          Carregando...
        </span>
      </div>
    );
  }

  if (isAuthenticated && user) {
    return (
      <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2">
        <div className="flex flex-col items-end">
          <div className="flex items-center gap-1">
            <span className="text-sm font-medium truncate max-w-[150px] sm:max-w-[200px]">
              {user.email}
            </span>
          </div>
          <span className="text-xs text-muted-foreground">
            {isAdminAccess ? "Administrador" : "Usuário"}
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Removido botão de Tabela de Preços conforme solicitado */}
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={async () => {
              try {
                setIsLoggingOut(true);
                await logout();
                // Esta navegação só acontece se o logout for bem-sucedido
                navigate("/login");
              } catch (error) {
                console.error("Erro ao fazer logout via botão:", error);
              } finally {
                setIsLoggingOut(false);
              }
            }}
            disabled={isLoggingOut}
            className={cn(
              "transition-all font-medium",
              "hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30",
              "focus-visible:ring-destructive/30"
            )}
          >
            {isLoggingOut ? (
              <>
                <div className="h-3 w-3 border-2 border-primary border-t-transparent rounded-full animate-spin mr-2"></div>
                <span className="truncate">Saindo...</span>
              </>
            ) : (
              <>
                <LogOut className="w-4 h-4 mr-2 shrink-0" />
                <span className="truncate">Sair</span>
              </>
            )}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Button 
        variant="outline" 
        size="sm" 
        onClick={() => navigate("/login")}
        className={cn(
          "transition-all font-medium",
          "hover:bg-primary/10 hover:text-primary hover:border-primary/30",
          "focus-visible:ring-primary/30"
        )}
      >
        <LogIn className="w-4 h-4 mr-2 shrink-0" />
        <span className="truncate">Login</span>
      </Button>
    </div>
  );
}
