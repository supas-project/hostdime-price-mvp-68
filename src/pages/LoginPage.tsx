
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const {
    login,
    isAuthenticated,
    user,
    loading,
    isSupabaseReady
  } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Enhanced effect for handling authenticated users and redirecting properly
  useEffect(() => {
    console.log("Login page mount - Auth state:", { 
      isAuthenticated, 
      loading, 
      isSupabaseReady,
      userEmail: user?.email 
    });
    
    if (isSupabaseReady && isAuthenticated && !loading && user) {
      console.log("Usuário autenticado, redirecionando...");
      
      // If admin, redirect to price table
      const isAdminEmail = user.email === "admin@hostdime.com.br";
      const redirectTo = isAdminEmail ? "/price-table" : "/configure";
      
      // Use the from if it exists, otherwise use the default redirectTo
      const from = location.state && (location.state as any).from?.pathname 
        ? (location.state as any).from?.pathname 
        : redirectTo;
      
      console.log("Redirecionando para:", from);
      
      // Use timeout to ensure state updates are completed
      setTimeout(() => {
        navigate(from, {
          replace: true
        });
      }, 100);
    }
  }, [isAuthenticated, loading, user, navigate, location.state, isSupabaseReady]);
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      console.log("Tentando fazer login com:", email);
      const success = await login(email, password);
      
      if (success) {
        // Check if admin email to show appropriate toast
        const isAdmin = email.toLowerCase() === "admin@hostdime.com.br";
        toast.success("Login realizado com sucesso", {
          description: isAdmin ? "Bem-vindo, administrador!" : "Bem-vindo de volta!"
        });
        
        // Login success is handled by the useEffect for redirection
      } else {
        toast.error("Credenciais inválidas", {
          description: "Verifique seu email e senha e tente novamente."
        });
      }
    } catch (error) {
      console.error("Erro no login:", error);
      toast.error("Falha no login", {
        description: "Verifique suas credenciais e tente novamente."
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Display loading indicator while checking authentication state
  if (loading || !isSupabaseReady) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
        <div className="text-center space-y-4">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
          <p className="text-foreground">Verificando autenticação...</p>
        </div>
      </div>
    );
  }
  
  // If user is already authenticated, don't render the form
  if (isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
        <div className="text-center space-y-4">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
          <p className="text-foreground">Autenticado. Redirecionando...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-2">
            <img src="https://www.hostdime.com.br/wp-content/themes/bones/library/images/logotipo.svg" alt="HostDime Logo" className="h-8 w-auto object-contain" />
          </div>
          
          <CardDescription className="text-zinc-50">
            Entre com suas credenciais para acessar o painel
          </CardDescription>
        </CardHeader>
        
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <Input id="email" type="email" placeholder="exemplo@hostdime.com.br" required value={email} onChange={e => setEmail(e.target.value)} className="w-full" />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="text-sm font-medium">
                  Senha
                </label>
              </div>
              <Input id="password" type="password" required value={password} onChange={e => setPassword(e.target.value)} className="w-full" />
            </div>
          </CardContent>
          
          <CardFooter>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                  Autenticando...
                </> : "Entrar"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
