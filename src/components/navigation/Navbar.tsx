
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { LoginDialog } from "@/components/login-dialog";
import { ChevronRight, Database } from "lucide-react";

interface NavbarProps {
  notifications?: React.ReactNode;
}

const Navbar: React.FC<NavbarProps> = ({ notifications }) => {
  const navigate = useNavigate();
  const { isAuthenticated, isAdmin, logout, user } = useAuth();

  // Verificação explícita para acesso de administrador
  const isAdminAccess = isAdmin || user?.email === "admin@hostdime.com.br";

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur">
      <div className="container flex h-14 items-center">
        <div className="flex items-center space-x-4">
          <a href="/" className="flex items-center space-x-2">
            <img 
              src="https://www.hostdime.com.br/wp-content/themes/bones/library/images/logotipo.svg"
              alt="HostDime Logo"
              className="h-6 w-auto" // Ajustado para um tamanho mais harmonioso
            />
          </a>
          
          {isAuthenticated && (
            <nav className="hidden md:flex items-center space-x-4 ml-4">
              <Button 
                variant="ghost" 
                size="sm"
                className="text-muted-foreground hover:text-foreground"
                onClick={() => navigate("/configure")}
              >
                Configurações
              </Button>
              
              {isAdminAccess && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="text-primary hover:text-primary/80 flex items-center"
                  onClick={() => navigate("/price-table")}
                >
                  <Database className="w-4 h-4 mr-1" />
                  Tabela de Preços
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              )}
            </nav>
          )}
        </div>

        <div className={cn("flex flex-1 items-center justify-end space-x-4")}>
          {notifications && <div className="mr-2">{notifications}</div>}
          <LoginDialog />
        </div>
      </div>
    </header>
  );
};

export default Navbar;
