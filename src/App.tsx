import { useEffect } from "react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "./components/theme-provider";
import { useAppStore, initializeAuth } from "./store/appStore";

import Home from "./pages/Home";
import PriceTable from "./pages/PriceTable";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import LoginPage from "./pages/LoginPage";
import UserManagement from "./pages/UserManagement";
import MainLayout from "./layouts/MainLayout";
import { NotificationDemo } from "./components/notification-demo";
import QuotesPage from "./pages/QuotesPage";

const App = () => {
  const { fetchInitialData, status, isAuthenticated } = useAppStore();

  useEffect(() => {
    // Inicializar autenticação
    initializeAuth();
    
    // Carregar dados iniciais
    fetchInitialData();
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
            <Route index element={<Navigate to="/configure" replace />} />
            
            {/* Admin protected routes */}
            <Route path="price-table" element={
              <AdminProtectedRoute>
                <PriceTable />
              </AdminProtectedRoute>
            } />
            
            <Route path="user-management" element={
              <AdminProtectedRoute>
                <UserManagement />
              </AdminProtectedRoute>
            } />
            
            <Route path="configure" element={<Index />} />
            <Route path="quotes" element={<QuotesPage />} />
            <Route path="home" element={<Home />} />
            <Route path="notification-demo" element={<NotificationDemo />} />
          </Route>
          
          <Route path="*" element={<NotFound />} />
        </Routes>
      </TooltipProvider>
    </ThemeProvider>
  );
};

export default App;
