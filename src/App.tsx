import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Index from './pages/Index';
import Home from './pages/Home';
import Configure from './pages/Configure';
import QuotesPage from './pages/QuotesPage';
import SystemComponents from './pages/SystemComponents';
import UserManagement from './pages/UserManagement';
import Diagnostics from './pages/Diagnostics';
import NotFound from './pages/NotFound';
import LoginPage from './pages/LoginPage';
import ResetPassword from './pages/ResetPassword';
import MainLayout from './components/MainLayout';
import ProtectedRoute from './components/auth/ProtectedRoute';
import AdminProtectedRoute from './components/auth/AdminProtectedRoute';
import { UnifiedAuthProvider } from './contexts/auth/UnifiedAuthContext';
import { ThemeProvider } from "@/components/theme-provider"
import { QueryProvider } from './contexts/query';
import { Toaster } from "@/components/ui/sonner"

import PricingTable from "@/pages/PricingTable";

function App() {
  return (
    <Router>
      <UnifiedAuthProvider>
        <QueryProvider>
          <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              
              {/* Protected Routes */}
              <Route
                path="/home"
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <Home />
                    </MainLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/configure"
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <Configure />
                    </MainLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/quotes"
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <QuotesPage />
                    </MainLayout>
                  </ProtectedRoute>
                }
              />
              
              {/* Admin Protected Routes */}
              <Route
                path="/system-components"
                element={
                  <AdminProtectedRoute>
                    <MainLayout>
                      <SystemComponents />
                    </MainLayout>
                  </AdminProtectedRoute>
                }
              />
              <Route
                path="/pricing-table"
                element={
                  <AdminProtectedRoute>
                    <MainLayout>
                      <PricingTable />
                    </MainLayout>
                  </AdminProtectedRoute>
                }
              />
              <Route
                path="/user-management"
                element={
                  <AdminProtectedRoute>
                    <MainLayout>
                      <UserManagement />
                    </MainLayout>
                  </AdminProtectedRoute>
                }
              />
              <Route
                path="/diagnostics"
                element={
                  <AdminProtectedRoute>
                    <MainLayout>
                      <Diagnostics />
                    </MainLayout>
                  </AdminProtectedRoute>
                }
              />
              
              {/* 404 Route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
            <Toaster />
          </ThemeProvider>
        </QueryProvider>
      </UnifiedAuthProvider>
    </Router>
  );
}

export default App;
