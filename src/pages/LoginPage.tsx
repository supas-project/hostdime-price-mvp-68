
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Lock, Mail } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

const formSchema = z.object({
  email: z.string().email("Email inválido").min(1, "Email é obrigatório"),
  password: z.string().min(1, "Senha é obrigatória"),
});

export default function LoginPage() {
  const { isAuthenticated, login, loading } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
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
    setIsLoading(true);
    try {
      const success = await login(values.email, values.password);
      if (success) {
        const from = location.state?.from?.pathname || "/configure";
        navigate(from, { replace: true });
        form.reset();
        toast.success("Login realizado com sucesso");
      }
    } finally {
      setIsLoading(false);
    }
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
    <div className="flex min-h-screen bg-background items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="border-border bg-card shadow-lg">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-bold">HostDime</CardTitle>
            <CardDescription>
              Faça login para acessar o sistema de configuração
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <div className="relative w-full">
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input 
                            placeholder="seu@email.com" 
                            className="pl-10 w-full"
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
                      <FormLabel>Senha</FormLabel>
                      <FormControl>
                        <div className="relative w-full">
                          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input 
                            type="password" 
                            placeholder="********" 
                            className="pl-10 w-full"
                            {...field} 
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isLoading}
                >
                  {isLoading ? "Entrando..." : "Entrar"}
                </Button>
              </form>
            </Form>
          </CardContent>
          <CardFooter className="flex justify-center">
            <p className="text-xs text-muted-foreground">
              Sistema de configuração de servidores dedicados da HostDime
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
