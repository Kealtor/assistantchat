import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Switch, Route, Redirect } from "wouter";
import './index.css'
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/useAuth";
import Index from './pages/Index.tsx'
import Auth from './pages/Auth.tsx'
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Switch>
            <Route path="/auth" component={Auth} />
            <Route path="/dashboard" component={Index} />
            <Route path="/chat" component={Index} />
            <Route path="/journal" component={Index} />
            <Route path="/habits" component={Index} />
            <Route path="/user" component={Index} />
            <Route path="/">
              <Redirect to="/dashboard" />
            </Route>
            <Route component={NotFound} />
          </Switch>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  </StrictMode>,
)
