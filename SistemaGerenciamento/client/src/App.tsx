import { Switch, Route, useLocation } from "wouter";
import { useEffect, useState } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { getStoredUser, type User } from "./lib/auth";
import Login from "@/pages/login";
import Dashboard from "@/pages/dashboard";
import Products from "@/pages/products";
import Clients from "@/pages/clients";
import Employees from "@/pages/employees";
import Reports from "@/pages/reports";
import Sales from "@/pages/sales";
import NotFound from "@/pages/not-found";

function AuthWrapper({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [location] = useLocation();

  useEffect(() => {
    const storedUser = getStoredUser();
    setUser(storedUser);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    const storedUser = getStoredUser();
    setUser(storedUser);
  }, [location]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Carregando...</div>
      </div>
    );
  }

  if (!user && location !== "/login") {
    return <Login />;
  }

  if (user && location === "/login") {
    window.history.replaceState(null, "", "/");
    return <Dashboard />;
  }

  return <>{children}</>;
}

function Router() {
  return (
    <AuthWrapper>
      <Switch>
        <Route path="/login" component={Login} />
        <Route path="/" component={Dashboard} />
        <Route path="/products" component={Products} />
        <Route path="/clients" component={Clients} />
        <Route path="/employees" component={Employees} />
        <Route path="/reports" component={Reports} />
        <Route path="/sales" component={Sales} />
        <Route component={NotFound} />
      </Switch>
    </AuthWrapper>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
