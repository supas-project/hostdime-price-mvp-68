
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Lock, Mail, AlertTriangle, Eye, EyeOff } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import hostdimeLogo from "../assets/hostdime-logo.png";

const formSchema = z.object({
  email: z.string().email("Email inválido").min(1, "Email é obrigatório"),
  password: z.string().min(1, "Senha é obrigatória"),
});

export default function LoginPage() {
  const { isAuthenticated, login, loading } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      // Navigate to the page they were trying to access or default to /configure
      const from = location.state?.from?.pathname || "/configure";
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setLoginError(null);
    setIsLoading(true);
    
    try {
      const success = await login(values.email, values.password);
      if (success) {
        const from = location.state?.from?.pathname || "/configure";
        navigate(from, { replace: true });
        form.reset();
        toast.success("Login realizado com sucesso");
      } else {
        setLoginError("Credenciais inválidas. Tente novamente.");
      }
    } catch (error) {
      console.error("Erro no processo de login:", error);
      setLoginError("Ocorreu um erro durante o login. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
          <p className="text-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-background to-background/80">
      {/* Container principal */}
      <div className="flex flex-col md:flex-row w-full">
        {/* Seção da imagem (esquerda) - visível apenas em telas médias ou maiores */}
        <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-primary/10 to-primary/5 justify-center items-center p-8">
          <div className="max-w-md text-center">
            <img 
              src={hostdimeLogo} 
              alt="HostDime Logo" 
              className="h-24 mb-8 mx-auto animate-fade-in" 
            />
            <h2 className="text-3xl font-bold mb-4 text-foreground">Configure seus servidores dedicados</h2>
            <p className="text-muted-foreground">
              Plataforma de configuração e cotação para servidores dedicados da HostDime.
              Configure e receba cotações de forma rápida e intuitiva.
            </p>
          </div>
        </div>

        {/* Seção do formulário (direita) */}
        <div className="w-full md:w-1/2 flex items-center justify-center p-4 md:p-8 animate-fade-in">
          <div className="w-full max-w-md">
            {/* Logo para dispositivos móveis */}
            <div className="mb-8 text-center md:hidden">
              <img 
                src={hostdimeLogo} 
                alt="HostDime Logo" 
                className="h-16 mx-auto" 
              />
            </div>

            <Card className="border-border bg-card/80 backdrop-blur-lg shadow-2xl rounded-2xl">
              <CardContent className="pt-8 pb-6 px-6">
                <div className="text-center mb-8">
                  <h1 className="text-2xl font-bold mb-2">Acesso ao sistema</h1>
                  <p className="text-sm text-muted-foreground">
                    Faça login para acessar a plataforma
                  </p>
                </div>

                {loginError && (
                  <Alert variant="destructive" className="mb-6">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Erro</AlertTitle>
                    <AlertDescription>
                      {loginError}
                    </AlertDescription>
                  </Alert>
                )}
                
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5" autoComplete="off">
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-foreground">Email</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                              <Input 
                                placeholder="seu@email.com" 
                                className="pl-10 h-11 bg-background/50"
                                autoComplete="off"
                                {...field} 
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-foreground">Senha</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                              <Input 
                                type={showPassword ? "text" : "password"}
                                placeholder="********" 
                                className="pl-10 pr-10 h-11 bg-background/50"
                                autoComplete="new-password"
                                {...field} 
                              />
                              <button 
                                type="button" 
                                onClick={toggleShowPassword}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                              >
                                {showPassword ? 
                                  <EyeOff className="h-4 w-4" /> : 
                                  <Eye className="h-4 w-4" />
                                }
                              </button>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <Button 
                      type="submit" 
                      className="w-full h-11 mt-2 bg-primary hover:bg-primary-hover text-white font-medium transition-all"
                      disabled={isLoading}
                    >
                      {isLoading ? "Entrando..." : "Entrar"}
                    </Button>
                  </form>
                </Form>
                
                <div className="mt-6 text-center">
                  <p className="text-xs text-muted-foreground">
                    HostDime Brasil - Sistema de configuração de servidores
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
