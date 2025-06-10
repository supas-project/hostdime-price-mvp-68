
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { LoginDialog } from "@/components/login-dialog";
import { ChevronRight, Database, Users } from "lucide-react";

interface NavbarProps {
  notifications?: React.ReactNode;
}

const Navbar: React.FC<NavbarProps> = ({ notifications }) => {
  const navigate = useNavigate();
  const { isAuthenticated, isAdmin, logout, user } = useAuth();

  // Verificação explícita para acesso de administrador
  const isAdminAccess = isAdmin || user?.email === "admin@hostdime.com.br";

  return (
    <header className={cn(
      "sticky top-0 z-40 w-full border-b-2 bg-background/95 backdrop-blur-md",
      "border-b-[#2a2a2a] shadow-lg transition-all duration-300"
    )}>
      <div className="container flex h-16 items-center">
        <div className="flex items-center space-x-6">
          <div className={cn(
            "flex items-center space-x-3 p-2 rounded-lg transition-all duration-300",
            "hover:bg-[#f58220]/10 hover:shadow-md"
          )}>
            <img 
              src="https://www.hostdime.com.br/wp-content/themes/bones/library/images/logotipo.svg"
              alt="HostDime Logo"
              className="h-6 w-auto transition-transform duration-300 hover:scale-105"
            />
          </div>
          
          {isAuthenticated && (
            <nav className="hidden md:flex items-center space-x-2 ml-6">
              <Button 
                variant="ghost" 
                size="sm"
                className={cn(
                  "text-muted-foreground hover:text-[#f58220] hover:bg-[#f58220]/10",
                  "transition-all duration-300 hover:shadow-md"
                )}
                onClick={() => navigate("/configure")}
              >
                Configurações
              </Button>

              <Button 
                variant="ghost" 
                size="sm"
                className={cn(
                  "text-muted-foreground hover:text-[#f58220] hover:bg-[#f58220]/10",
                  "transition-all duration-300 hover:shadow-md"
                )}
                onClick={() => navigate("/quotes")}
              >
                Cotações
              </Button>
              
              {isAdminAccess && (
                <>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className={cn(
                      "text-[#f58220] hover:text-[#e55a00] hover:bg-[#f58220]/10 flex items-center",
                      "transition-all duration-300 hover:shadow-md hover:scale-105"
                    )}
                    onClick={() => navigate("/price-table")}
                  >
                    <Database className="w-4 h-4 mr-2" />
                    Tabela de Preços
                    <ChevronRight className="w-4 h-4 ml-2 transition-transform duration-200 group-hover:translate-x-1" />
                  </Button>
                  
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className={cn(
                      "text-[#f58220] hover:text-[#e55a00] hover:bg-[#f58220]/10 flex items-center",
                      "transition-all duration-300 hover:shadow-md hover:scale-105"
                    )}
                    onClick={() => navigate("/user-management")}
                  >
                    <Users className="w-4 h-4 mr-2" />
                    Gestão de Usuários
                    <ChevronRight className="w-4 h-4 ml-2 transition-transform duration-200 group-hover:translate-x-1" />
                  </Button>
                </>
              )}
            </nav>
          )}
        </div>

        <div className={cn("flex flex-1 items-center justify-end space-x-4")}>
          {notifications && (
            <div className={cn(
              "mr-3 transition-all duration-300",
              "hover:scale-105"
            )}>
              {notifications}
            </div>
          )}
          <LoginDialog />
        </div>
      </div>
    </header>
  );
};

export default Navbar;
