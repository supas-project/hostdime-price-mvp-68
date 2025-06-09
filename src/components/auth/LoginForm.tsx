
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuthContext } from "@/contexts/AuthContext-refactored";
import { toast } from "sonner";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuthContext();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      console.log("🔐 Attempting login with:", email);
      const success = await login(email, password);
      
      if (success) {
        const isAdmin = email.toLowerCase() === "admin@hostdime.com.br";
        toast.success("Login realizado com sucesso", {
          description: isAdmin ? "Bem-vindo, administrador!" : "Bem-vindo de volta!"
        });
      } else {
        toast.error("Credenciais inválidas", {
          description: "Verifique seu email e senha e tente novamente."
        });
      }
    } catch (error) {
      console.error("❌ Login error:", error);
      toast.error("Falha no login", {
        description: "Verifique suas credenciais e tente novamente."
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md shadow-lg">
      <CardHeader className="space-y-1 text-center">
        <div className="flex justify-center mb-2">
          <img 
            src="https://www.hostdime.com.br/wp-content/themes/bones/library/images/logotipo.svg" 
            alt="HostDime Logo" 
            className="h-8 w-auto object-contain" 
          />
        </div>
        <CardTitle>Entrar</CardTitle>
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
            <Input 
              id="email" 
              type="email" 
              placeholder="exemplo@hostdime.com.br" 
              required 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              className="w-full" 
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium">
              Senha
            </label>
            <Input 
              id="password" 
              type="password" 
              required 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              className="w-full" 
            />
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                Autenticando...
              </>
            ) : (
              "Entrar"
            )}
          </Button>
        </CardContent>
      </form>
    </Card>
  );
}
