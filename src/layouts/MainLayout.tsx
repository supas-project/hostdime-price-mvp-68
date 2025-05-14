
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { LoginDialog } from "@/components/login-dialog";
import { Button } from "@/components/ui/button";
import { Home, FileText, Server, Menu, X, AlertCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { NotificationCenter } from "@/components/notification-center";

export default function MainLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const { toast } = useToast(); // Properly destructure toast from useToast
  
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
  }, [location, navigate, toast]);

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
      <header className={cn(
        "border-b border-border sticky top-0 z-10",
        "bg-background/95 backdrop-blur-sm shadow-sm"
      )}>
        <div className="container flex justify-between items-center py-2 sm:py-4">
          <div className="flex items-center">
            <Link to="/" className="text-xl sm:text-2xl font-bold flex items-center">
              <span className="text-primary">Host</span>Dime
            </Link>
            
            <div className="hidden md:flex ml-4 lg:ml-8 space-x-1">
              {navigationItems.map(item => (
                <Button
                  key={item.name}
                  variant={isActive(item.path) ? "secondary" : "ghost"}
                  size="sm"
                  asChild
                  className="text-xs lg:text-sm h-8 lg:h-9"
                >
                  <Link to={item.path} className="flex items-center">
                    <item.icon className="h-3.5 w-3.5 lg:h-4 lg:w-4 mr-1.5 lg:mr-2" />
                    {item.name}
                  </Link>
                </Button>
              ))}
            </div>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-3">
            <NotificationCenter />
            <LoginDialog />
            
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden p-1.5 touch-target-sm"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
        
        {/* Menu para dispositivos móveis */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border animate-slide-in">
            <nav className="container py-2 sm:py-4 flex flex-col space-y-1">
              {navigationItems.map(item => (
                <Button
                  key={item.name}
                  variant={isActive(item.path) ? "secondary" : "ghost"}
                  size="sm"
                  className="justify-start h-10 text-sm"
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
      
      <footer className="border-t border-border py-4 sm:py-6">
        <div className="container text-center text-xs sm:text-sm text-muted-foreground">
          <p>&copy; 2025 HostDime. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
