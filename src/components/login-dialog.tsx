import { Button } from "@/components/ui/button";
import { LogIn, LogOut, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { authService } from "@/services/auth-service";

export function LoginDialog() {
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  
  // Mock auth state for now
  const isAuthenticated = false;
  const user: { email?: string } | null = { email: "test@example.com" };
  const isAdmin = false;

  if (isAuthenticated && user) {
    return (
      <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2">
        <div className="flex flex-col items-end">
          <div className="flex items-center gap-1">
            <span className="text-sm font-medium truncate max-w-[150px] sm:max-w-[200px]">
              {user.email}
            </span>
            {isAdmin && <Shield className="w-3.5 h-3.5 text-primary" aria-label="Administrador" />}
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
              await authService.logout();
              navigate("/login");
            } catch (error) {
              console.error("Erro ao fazer logout:", error);
            } finally {
              setIsLoggingOut(false);
            }
          }} 
          disabled={isLoggingOut} 
          className={cn(
            "transition-all font-medium",
            "hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30"
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
          "hover:bg-primary/10 hover:text-primary hover:border-primary/30"
        )}
      >
        <LogIn className="w-4 h-4 mr-2 shrink-0" />
        <span className="truncate">Login</span>
      </Button>
    </div>
  );
}