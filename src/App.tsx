import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import DashboardLayout from "./components/dashboard/DashboardLayout";
import DashboardHome from "./pages/dashboard/DashboardHome";
import MisNegocios from "./pages/dashboard/MisNegocios";
import Comprobantes from "./pages/dashboard/Comprobantes";
import Impuestos from "./pages/dashboard/Impuestos";
import MiPlan from "./pages/dashboard/MiPlan";
import Configuracion from "./pages/dashboard/Configuracion";
import Superadmin from "./pages/dashboard/Superadmin";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={<Register />} />
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<DashboardHome />} />
            <Route path="negocios" element={<MisNegocios />} />
            <Route path="comprobantes" element={<Comprobantes />} />
            <Route path="impuestos" element={<Impuestos />} />
            <Route path="plan" element={<MiPlan />} />
            <Route path="configuracion" element={<Configuracion />} />
            <Route path="admin" element={<Superadmin />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
