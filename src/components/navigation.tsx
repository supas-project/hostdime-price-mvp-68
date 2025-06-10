
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { useUnifiedAuth } from "@/hooks/auth/useUnifiedAuth";
import { LogOut, Settings, Table, Database, Home } from "lucide-react";

export function Navigation() {
  const location = useLocation();
  const { isAuthenticated, logout } = useUnifiedAuth();

  const isActive = (path: string) => location.pathname === path;

  if (!isAuthenticated) {
    return (
      <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <Link to="/" className="font-bold text-xl">
            HostDime Configurator
          </Link>
          <div className="flex items-center gap-4">
            <ThemeSwitcher />
            <Button asChild variant="outline">
              <Link to="/login">Login</Link>
            </Button>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link to="/" className="font-bold text-xl">
          HostDime Configurator
        </Link>
        
        <div className="flex items-center gap-2">
          <Button 
            asChild 
            variant={isActive("/") ? "default" : "ghost"} 
            size="sm"
          >
            <Link to="/" className="flex items-center gap-2">
              <Home className="w-4 h-4" />
              Configurador
            </Link>
          </Button>
          
          <Button 
            asChild 
            variant={isActive("/configure") ? "default" : "ghost"} 
            size="sm"
          >
            <Link to="/configure" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Configurações
            </Link>
          </Button>
          
          <Button 
            asChild 
            variant={isActive("/price-table") ? "default" : "ghost"} 
            size="sm"
          >
            <Link to="/price-table" className="flex items-center gap-2">
              <Table className="w-4 h-4" />
              Tabela de Preços
            </Link>
          </Button>
          
          <Button 
            asChild 
            variant={isActive("/unified-table") ? "default" : "ghost"} 
            size="sm"
          >
            <Link to="/unified-table" className="flex items-center gap-2">
              <Database className="w-4 h-4" />
              Gerenciamento Unificado
            </Link>
          </Button>
          
          <div className="flex items-center gap-2 ml-4">
            <ThemeSwitcher />
            <Button variant="outline" size="sm" onClick={logout}>
              <LogOut className="w-4 h-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
