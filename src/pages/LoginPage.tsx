
import { useState } from "react";
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
    user
  } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Redireciona usuários já autenticados
  if (isAuthenticated) {
    // Se for admin, redireciona para a tabela de preços
    const isAdminEmail = user?.email === "admin@hostdime.com.br";
    const redirectTo = isAdminEmail ? "/price-table" : "/configure";
    navigate(redirectTo, {
      replace: true
    });
    return null;
  }
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const success = await login(email, password);
      if (success) {
        // Verificar se é o email de admin para redirecionar para a tabela de preços
        const isAdmin = email.toLowerCase() === "admin@hostdime.com.br";
        const redirectPath = isAdmin ? "/price-table" : "/configure";
        const from = (location.state as any)?.from?.pathname || redirectPath;
        navigate(from, {
          replace: true
        });
        toast.success("Login realizado com sucesso", {
          description: isAdmin ? "Bem-vindo, administrador!" : "Bem-vindo de volta!"
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
  
  return <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-2">
            <img src="https://www.hostdime.com.br/wp-content/themes/bones/library/images/logotipo.svg" alt="HostDime Logo" className="h-8 w-auto object-contain" />
          </div>
          
          <CardDescription>
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
    </div>;
}
