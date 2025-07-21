import { useEffect } from "react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "./components/theme-provider";
import { useAppStore } from "./store/appStore";

import Home from "./pages/Home";
import PriceTable from "./pages/PriceTable";
import NotFound from "./pages/NotFound";
import LoginPage from "./pages/LoginPage";
import MainLayout from "./layouts/MainLayout";

const App = () => {
  const { fetchInitialData, status, isAuthenticated } = useAppStore();

  useEffect(() => {
    // Carregar dados iniciais
    fetchInitialData();
    
    // Verificar token salvo no localStorage
    const savedToken = localStorage.getItem('auth_token');
    if (savedToken) {
      console.log('🔐 Token encontrado no localStorage');
    }
  }, [fetchInitialData]);

  useEffect(() => {
    console.log(`📊 Estado da aplicação: ${status}`);
  }, [status]);

  // Componente simples para proteção de rotas
  const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    if (!isAuthenticated) {
      return <Navigate to="/login" replace />;
    }
    return <>{children}</>;
  };

  const AdminProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    const { user } = useAppStore();
    
    if (!isAuthenticated) {
      return <Navigate to="/login" replace />;
    }
    
    if (!user?.isAdmin) {
      return <Navigate to="/configure" replace />;
    }
    
    return <>{children}</>;
  };

  return (
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<LoginPage />} />
          
          {/* Protected routes */}
          <Route path="/" element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }>
            <Route index element={<Navigate to="/home" replace />} />
            
            {/* Admin protected routes */}
            <Route path="price-table" element={
              <AdminProtectedRoute>
                <PriceTable />
              </AdminProtectedRoute>
            } />
            
            <Route path="home" element={<Home />} />
          </Route>
          
          <Route path="*" element={<NotFound />} />
        </Routes>
      </TooltipProvider>
    </ThemeProvider>
  );
};

export default App;
