
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/store/appStore";
// import { toast } from "sonner"; // Disabled for now

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login, isAuthenticated, user } = useAppStore();
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      console.log("Usuário autenticado, redirecionando...");
      
      // If admin, redirect to price table
      const redirectTo = user.isAdmin ? "/price-table" : "/configure";
      
      // Use the from if it exists, otherwise use the default redirectTo
      const from = location.state && (location.state as any).from?.pathname 
        ? (location.state as any).from?.pathname 
        : redirectTo;
      
      console.log("Redirecionando para:", from);
      
      navigate(from, {
        replace: true
      });
    }
  }, [isAuthenticated, user, navigate, location.state]);
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      console.log("Tentando fazer login com:", email);
      const success = await login(email, password);
      
      if (success) {
        // O redirecionamento será feito pelo useEffect acima
        console.log("Login realizado com sucesso");
      }
    } catch (error) {
      console.error("Erro no login:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Display loading indicator if currently authenticating
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
        <div className="text-center space-y-4">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
          <p className="text-foreground">Autenticando...</p>
        </div>
      </div>
    );
  }
  
  // If user is already authenticated, show redirect message
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
