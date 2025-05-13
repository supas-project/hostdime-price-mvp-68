
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "./components/theme-provider";
import { AuthProvider } from "./contexts/AuthContext";
import { useEffect } from "react";
import { setupErrorInterceptor } from "./utils/debug-utils";
import { toast } from "sonner";

import Home from "./pages/Home";
import PriceTable from "./pages/PriceTable";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import LoginPage from "./pages/LoginPage";
import MainLayout from "./layouts/MainLayout";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import AdminProtectedRoute from "./components/auth/AdminProtectedRoute";

// Configuração do cliente de consulta com retry e stale time
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 30 * 1000, // 30 segundos
      refetchOnWindowFocus: true,
      refetchOnMount: true,
      refetchOnReconnect: true,
    },
  },
});

const AppWithErrorBoundary = () => {
  // Configurar tratamento global de erros
  useEffect(() => {
    setupErrorInterceptor((error, info) => {
      console.error("Erro capturado pela aplicação:", error, info);
      toast.error("Ocorreu um erro na aplicação", {
        description: "Tente recarregar a página ou contactar o suporte."
      });
    });
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <AuthProvider>
            <Toaster />
            <Sonner />
            <Routes>
              {/* Public route */}
              <Route path="/login" element={<LoginPage />} />
              
              {/* Protected routes */}
              <Route path="/" element={
                <ProtectedRoute>
                  <MainLayout />
                </ProtectedRoute>
              }>
                <Route index element={<Navigate to="/configure" replace />} />
                
                {/* Admin protected route */}
                <Route path="price-table" element={
                  <AdminProtectedRoute>
                    <PriceTable />
                  </AdminProtectedRoute>
                } />
                
                <Route path="configure" element={<Index />} />
                <Route path="home" element={<Home />} />
              </Route>
              
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default AppWithErrorBoundary;
