
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { LoginDialog } from "@/components/login-dialog";
import { Button } from "@/components/ui/button";
import { Home, FileText, Server, Menu, X, AlertCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export default function MainLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();

  // Verificar se há uma mensagem de redirecionamento
  useEffect(() => {
    if (location.state && location.state.message) {
      toast.error("Acesso restrito", {
        description: location.state.message,
        icon: <AlertCircle className="h-4 w-4" />
      });
      
      // Limpar a mensagem para evitar que ela seja exibida novamente
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location, navigate]);

  // Páginas disponíveis para todos os usuários autenticados
  const commonNavigationItems = [
    { name: "Início", path: "/", icon: Home },
    { name: "Configurar Servidor", path: "/configure", icon: Server }
  ];

  // Páginas disponíveis apenas para administradores
  const adminNavigationItems = [
    { name: "Tabela de Preços", path: "/price-table", icon: FileText }
  ];

  // Combinar os itens de navegação com base nas permissões do usuário
  const navigationItems = isAdmin 
    ? [...commonNavigationItems, ...adminNavigationItems] 
    : commonNavigationItems;

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <header className="border-b border-border sticky top-0 bg-background/95 backdrop-blur-sm z-10">
        <div className="container flex justify-between items-center py-4">
          <div className="flex items-center">
            <Link to="/" className="text-2xl font-bold flex items-center">
              <span className="text-primary">Host</span>Dime
            </Link>
            
            <div className="hidden md:flex ml-8 space-x-1">
              {navigationItems.map(item => (
                <Button
                  key={item.name}
                  variant={isActive(item.path) ? "secondary" : "ghost"}
                  size="sm"
                  asChild
                >
                  <Link to={item.path} className="flex items-center">
                    <item.icon className="h-4 w-4 mr-2" />
                    {item.name}
                  </Link>
                </Button>
              ))}
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <LoginDialog />
            
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X /> : <Menu />}
            </Button>
          </div>
        </div>
        
        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border animate-slide-in">
            <nav className="container py-4 flex flex-col space-y-2">
              {navigationItems.map(item => (
                <Button
                  key={item.name}
                  variant={isActive(item.path) ? "secondary" : "ghost"}
                  size="sm"
                  className="justify-start"
                  asChild
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Link to={item.path} className="flex items-center">
                    <item.icon className="h-4 w-4 mr-2" />
                    {item.name}
                  </Link>
                </Button>
              ))}
            </nav>
          </div>
        )}
      </header>

      <main className="flex-1">
        <Outlet />
      </main>
      
      <footer className="border-t border-border py-6">
        <div className="container text-center text-sm text-muted-foreground">
          <p>&copy; 2025 HostDime. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
