import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { CompanyProvider } from "@/contexts/CompanyContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { CheckoutGuard } from "@/components/CheckoutGuard";
import { PlanGuard } from "@/components/PlanGuard";
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import CompanySetup from "./pages/CompanySetup";
import Dashboard from "./pages/Dashboard";
import Settings from "./pages/Settings";
import Transactions from "./pages/Transactions";
import Reports from "./pages/Reports";
import BreakEven from "./pages/BreakEven";
import Goals from "./pages/Goals";
import Scenarios from "./pages/Scenarios";
import CashFlow from "./pages/CashFlow";
import Pricing from "./pages/Pricing";
import Checkout from "./pages/Checkout";
import DebugData from "./pages/DebugData";
import Help from "./pages/Help";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <AuthProvider>
            <CompanyProvider>
              <Toaster />
              <Sonner />
              <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/pricing" element={<Pricing />} />
                <Route path="/checkout" element={<Checkout />} />
                
                <Route
                  path="/company-setup"
                  element={
                    <ProtectedRoute>
                      <CheckoutGuard>
                        <CompanySetup />
                      </CheckoutGuard>
                    </ProtectedRoute>
                  }
                />
                
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <CheckoutGuard>
                        <Dashboard />
                      </CheckoutGuard>
                    </ProtectedRoute>
                  }
                />
                
                <Route
                  path="/settings"
                  element={
                    <ProtectedRoute>
                      <CheckoutGuard>
                        <Settings />
                      </CheckoutGuard>
                    </ProtectedRoute>
                  }
                />
                
                <Route
                  path="/transactions"
                  element={
                    <ProtectedRoute>
                      <CheckoutGuard>
                        <Transactions />
                      </CheckoutGuard>
                    </ProtectedRoute>
                  }
                />
                
                <Route
                  path="/reports"
                  element={
                    <ProtectedRoute>
                      <CheckoutGuard>
                        <Reports />
                      </CheckoutGuard>
                    </ProtectedRoute>
                  }
                />
                
                <Route
                  path="/break-even"
                  element={
                    <ProtectedRoute>
                      <CheckoutGuard>
                        <PlanGuard requiredPlan="growth">
                          <BreakEven />
                        </PlanGuard>
                      </CheckoutGuard>
                    </ProtectedRoute>
                  }
                />
                
                <Route
                  path="/goals"
                  element={
                    <ProtectedRoute>
                      <CheckoutGuard>
                        <PlanGuard requiredPlan="growth">
                          <Goals />
                        </PlanGuard>
                      </CheckoutGuard>
                    </ProtectedRoute>
                  }
                />
                
                <Route
                  path="/scenarios"
                  element={
                    <ProtectedRoute>
                      <CheckoutGuard>
                        <PlanGuard requiredPlan="growth">
                          <Scenarios />
                        </PlanGuard>
                      </CheckoutGuard>
                    </ProtectedRoute>
                  }
                />
                
                <Route
                  path="/cash"
                  element={
                    <ProtectedRoute>
                      <CheckoutGuard>
                        <PlanGuard requiredPlan="infinity">
                          <CashFlow />
                        </PlanGuard>
                      </CheckoutGuard>
                    </ProtectedRoute>
                  }
                />
                
                <Route
                  path="/debug-data"
                  element={
                    <ProtectedRoute>
                      <CheckoutGuard>
                        <DebugData />
                      </CheckoutGuard>
                    </ProtectedRoute>
                  }
                />
                
                <Route
                  path="/help"
                  element={
                    <ProtectedRoute>
                      <CheckoutGuard>
                        <Help />
                      </CheckoutGuard>
                    </ProtectedRoute>
                  }
                />
                
                <Route path="*" element={<NotFound />} />
              </Routes>
            </CompanyProvider>
          </AuthProvider>
        </TooltipProvider>
      </QueryClientProvider>
    </BrowserRouter>
  );
};

export default App;
