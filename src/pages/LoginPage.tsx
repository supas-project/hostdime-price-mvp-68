
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
    <div className="flex min-h-screen items-center justify-center bg-background p-4 animate-fade-in">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <h1 className="text-3xl font-bold">
            <span className="text-primary">Host</span>
            <span className="text-white">Dime</span>
          </h1>
        </div>

        <Card className="border-border bg-card/90 backdrop-blur-sm shadow-xl rounded-xl overflow-hidden">
          <CardContent className="p-6">
            <div className="text-center mb-6">
              <h1 className="text-xl font-semibold">Bem-vindo</h1>
              <p className="text-xs text-muted-foreground mt-1">
                Configure seus servidores dedicados
              </p>
            </div>

            {loginError && (
              <Alert variant="destructive" className="mb-5 animate-fade-in">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Erro</AlertTitle>
                <AlertDescription>{loginError}</AlertDescription>
              </Alert>
            )}
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" autoComplete="off">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm">Email</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input 
                            placeholder="seu@email.com" 
                            className="pl-10 bg-background/50"
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
                      <FormLabel className="text-sm">Senha</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input 
                            type={showPassword ? "text" : "password"}
                            placeholder="********" 
                            className="pl-10 pr-10 bg-background/50"
                            {...field} 
                          />
                          <button 
                            type="button" 
                            onClick={toggleShowPassword}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                            aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                          >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Button 
                  type="submit" 
                  className="w-full mt-2 bg-primary hover:bg-primary-hover text-white transition-all duration-200"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <span className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
                      Entrando...
                    </>
                  ) : "Entrar"}
                </Button>
              </form>
            </Form>
            
            <div className="mt-6 text-center">
              <p className="text-xs text-muted-foreground">
                HostDime Brasil &copy; {new Date().getFullYear()}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
