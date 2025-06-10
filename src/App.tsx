
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/contexts/theme";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/sonner";
import { UnifiedAuthProvider } from "@/contexts/auth/UnifiedAuthContext";
import Index from "@/pages/Index";
import Configure from "@/pages/Configure";
import PriceTable from "@/pages/PriceTable";
import UnifiedTable from "@/pages/UnifiedTable";
import Login from "@/pages/Login";
import { Navigation } from "@/components/navigation";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <UnifiedAuthProvider>
        <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
          <Router>
            <div className="min-h-screen bg-background">
              <Navigation />
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/configure" element={<Configure />} />
                <Route path="/price-table" element={<PriceTable />} />
                <Route path="/unified-table" element={<UnifiedTable />} />
                <Route path="/login" element={<Login />} />
              </Routes>
              <Toaster />
            </div>
          </Router>
        </ThemeProvider>
      </UnifiedAuthProvider>
    </QueryClientProvider>
  );
}

export default App;
