
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { LogIn, LogOut, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function LoginDialog() {
  const { isAuthenticated, isAdmin, user, logout, loading } = useAuth();
  const navigate = useNavigate();

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
          onClick={() => {
            logout().catch(error => {
              console.error("Erro ao fazer logout via botão:", error);
            });
          }}
        >
          <LogOut className="w-4 h-4 mr-2" />
          Sair
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
