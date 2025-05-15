
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { LogIn, LogOut, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

export function LoginDialog() {
  const { isAuthenticated, isAdmin, user, logout, loading } = useAuth();
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

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
      <div className="flex items-center gap-2">
        <div className="flex flex-col items-end">
          <div className="flex items-center gap-1">
            <span className="text-sm font-medium">
              {user.email}
            </span>
            {isAdmin && <Shield className="w-3.5 h-3.5 text-primary" />}
          </div>
          <span className="text-xs text-muted-foreground">
            {isAdmin ? "Administrador" : "Usuário"}
          </span>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={async () => {
            try {
              setIsLoggingOut(true);
              await logout();
              // Após o logout, redireciona para a página de login
              navigate("/login");
            } catch (error) {
              console.error("Erro ao fazer logout via botão:", error);
            } finally {
              setIsLoggingOut(false);
            }
          }}
          disabled={isLoggingOut}
        >
          {isLoggingOut ? (
            <>
              <div className="h-3 w-3 border-2 border-primary border-t-transparent rounded-full animate-spin mr-2"></div>
              Saindo...
            </>
          ) : (
            <>
              <LogOut className="w-4 h-4 mr-2" />
              Sair
            </>
          )}
        </Button>
      </div>
    );
  }

  return (
    <Button 
      variant="outline" 
      size="sm" 
      onClick={() => navigate("/login")}
    >
      <LogIn className="w-4 h-4 mr-2" />
      Login
    </Button>
  );
}
