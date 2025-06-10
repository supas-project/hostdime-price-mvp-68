import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "./components/theme-provider";
import { AuthProvider } from "./contexts/AuthContext";

import Home from "./pages/Home";
import PriceTable from "./pages/PriceTable";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import LoginPage from "./pages/LoginPage";
import UserManagement from "./pages/UserManagement";
import ResetPassword from "./pages/ResetPassword";
import Diagnostics from "./pages/Diagnostics";
import MainLayout from "./layouts/MainLayout";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import AdminProtectedRoute from "./components/auth/AdminProtectedRoute";
import { NotificationDemo } from "./components/notification-demo";
import QuotesPage from "./pages/QuotesPage";

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

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <AuthProvider>
          <Toaster />
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/auth/reset-password" element={<ResetPassword />} />
            
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
              
              <Route path="diagnostics" element={
                <AdminProtectedRoute>
                  <Diagnostics />
                </AdminProtectedRoute>
              } />
              
              <Route path="configure" element={<Index />} />
              <Route path="quotes" element={<QuotesPage />} />
              <Route path="home" element={<Home />} />
              <Route path="notification-demo" element={<NotificationDemo />} />
            </Route>
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
