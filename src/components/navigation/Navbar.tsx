
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
  
  // Função para navegação para página inicial com base no estado de autenticação
  const handleLogoClick = () => {
    if (isAuthenticated) {
      // Se estiver autenticado, navegue para a página apropriada
      const targetPath = isAdminAccess ? "/price-table" : "/configure";
      navigate(targetPath);
    } else {
      // Se não estiver autenticado, navegue para a página inicial
      navigate("/");
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur">
      <div className="container flex h-14 items-center">
        <div className="flex items-center space-x-4">
          <div 
            onClick={handleLogoClick}
            className="flex items-center space-x-2 cursor-pointer"
          >
            <img 
              src="https://www.hostdime.com.br/wp-content/themes/bones/library/images/logotipo.svg"
              alt="HostDime Logo"
              className="h-5 w-auto" // Ajustado para um tamanho mais harmonioso
            />
          </div>
          
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
