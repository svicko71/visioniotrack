import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/useAuth";
import { PiConfigProvider } from "@/hooks/usePiConfig";
import Layout from "./components/Layout";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import CommandCenter from "./pages/CommandCenter";
import AISearch from "./pages/AISearch";
import Admin from "./pages/Admin";
import UrbanDashboard from "./pages/UrbanDashboard";
import UrbanShield from "./pages/UrbanShield";
import UrbanShieldLive from "./pages/UrbanShieldLive";
import FieldTrial from "./pages/FieldTrial";
import Marketplace from "./pages/Marketplace";
import Classify from "./pages/Classify";
import Cases from "./pages/Cases";
import Gallery from "./pages/Gallery";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <PiConfigProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<Index />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/command" element={<CommandCenter />} />
              <Route path="/search" element={<AISearch />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/urban" element={<UrbanDashboard />} />
              <Route path="/shield" element={<UrbanShield />} />
              <Route path="/shield-live" element={<UrbanShieldLive />} />
              <Route path="/field" element={<FieldTrial />} />
              <Route path="/marketplace" element={<Marketplace />} />
              <Route path="/classify" element={<Classify />} />
              <Route path="/cases" element={<Cases />} />
              <Route path="/gallery" element={<Gallery />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/auth" element={<Auth />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
