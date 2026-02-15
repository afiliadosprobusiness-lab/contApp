import { useMemo, useState } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import {
  Calculator, LayoutDashboard, Building2, FileText, Receipt, ReceiptText,
  CreditCard, Settings, ShieldCheck, ChevronLeft, LogOut,
  Menu, BrainCircuit, ChevronDown, Bell
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";
import { useBusiness } from "@/contexts/BusinessContext";
import { logout } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
  { label: "Mis Negocios", icon: Building2, path: "/dashboard/negocios" },
  { label: "Comprobantes", icon: FileText, path: "/dashboard/comprobantes" },
  { label: "Facturacion", icon: ReceiptText, path: "/dashboard/facturacion" },
  { label: "Impuestos", icon: Receipt, path: "/dashboard/impuestos" },
  { label: "Mi Plan", icon: CreditCard, path: "/dashboard/plan" },
  { label: "Configuración", icon: Settings, path: "/dashboard/configuracion" },
];

const DashboardLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, userProfile } = useAuth();
  const { businesses, selectedBusiness, setSelectedBusinessId, loading: businessesLoading } = useBusiness();
  const { toast } = useToast();
  const configuredAdminEmail = (import.meta.env.VITE_ADMIN_EMAIL || "").trim().toLowerCase();
  const defaultAdminEmail = "afiliadosprobusiness@gmail.com";
  const currentEmail = (user?.email || userProfile?.email || "").trim().toLowerCase();
  const isAdminByEmail = !!currentEmail && [configuredAdminEmail, defaultAdminEmail].includes(currentEmail);
  const isAdmin = userProfile?.role === "ADMIN" || isAdminByEmail;
  const handleAiShortcut = () => {
    setMobileOpen(false);
    navigate("/dashboard#contapp-ia");
  };

  const isActive = (path: string) => location.pathname === path;
  const trialDaysLeft = useMemo(() => {
    if (!userProfile?.trialEndsAt) return null;
    const diffMs = userProfile.trialEndsAt.getTime() - Date.now();
    return Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
  }, [userProfile?.trialEndsAt]);

  const handleLogout = async () => {
    try {
      await logout();
      toast({
        title: "Sesión cerrada",
        description: "Has cerrado sesión correctamente",
      });
      navigate("/");
    } catch (error) {
      toast({
        title: "Error al cerrar sesión",
        description: "Intenta nuevamente",
        variant: "destructive",
      });
    }
  };

  const SidebarContent = () => {
    // Filtrar items del menú según el rol del usuario
    const menuItems = isAdmin
      ? [{ label: "Gestión de Usuarios", icon: ShieldCheck, path: "/dashboard/admin" }]
      : navItems;

    return (
      <>
        {/* Logo */}
        <div className="p-4 flex items-center gap-2">
          <div className="w-9 h-9 rounded-lg bg-sidebar-primary flex items-center justify-center shrink-0">
            <Calculator className="w-5 h-5 text-sidebar-primary-foreground" />
          </div>
          {!collapsed && <span className="font-display text-lg font-bold text-sidebar-foreground">ContApp Pe</span>}
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-2 space-y-1">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors",
                isActive(item.path)
                  ? "bg-sidebar-accent text-sidebar-primary"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
              )}
            >
              <item.icon className="w-5 h-5 shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          ))}
        </nav>

        {/* AI widget mini - Solo para usuarios normales */}
        {!collapsed && !isAdmin && (
          <div className="mx-3 mb-3 p-3 rounded-xl bg-sidebar-accent border border-sidebar-border">
            <div className="flex items-center gap-2 mb-2">
              <BrainCircuit className="w-4 h-4 text-sidebar-primary" />
              <span className="text-xs font-semibold text-sidebar-foreground">ContApp IA</span>
            </div>
            <p className="text-xs text-sidebar-foreground/60 mb-2">¿Es deducible un pasaje de bus?</p>
            <Button
              size="sm"
              className="w-full h-7 text-xs bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90"
              onClick={handleAiShortcut}
            >
              Preguntar
            </Button>
          </div>
        )}

        {/* Collapse toggle */}
        <div className="p-3 hidden lg:block">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sidebar-foreground/50 hover:bg-sidebar-accent/50 transition-colors text-sm"
          >
            <ChevronLeft className={cn("w-4 h-4 transition-transform", collapsed && "rotate-180")} />
            {!collapsed && <span>Colapsar</span>}
          </button>
        </div>
      </>
    );
  };

  return (
    <div className="min-h-screen flex bg-background">
      {/* Desktop sidebar */}
      <aside className={cn(
        "hidden lg:flex flex-col bg-sidebar border-r border-sidebar-border transition-all duration-300 shrink-0",
        collapsed ? "w-16" : "w-64"
      )}>
        <SidebarContent />
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-foreground/30" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-64 bg-sidebar flex flex-col z-50">
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="sticky top-0 z-30 h-14 border-b border-border bg-card/95 backdrop-blur flex items-center px-4 gap-3 shrink-0">
          <button className="lg:hidden" onClick={() => setMobileOpen(true)}>
            <Menu className="w-5 h-5 text-foreground" />
          </button>

          {/* Business selector - Solo para usuarios normales */}
          {!isAdmin && (
            businessesLoading ? (
              <Button variant="outline" size="sm" className="gap-2 max-w-[220px]" disabled>
                <Building2 className="w-4 h-4 text-accent shrink-0" />
                <span className="truncate text-xs">Cargando negocios...</span>
              </Button>
            ) : businesses.length === 0 ? (
              <Button asChild variant="outline" size="sm" className="gap-2 max-w-[220px]">
                <Link to="/dashboard/negocios">
                  <Building2 className="w-4 h-4 text-accent shrink-0" />
                  <span className="truncate text-xs">Agregar negocio</span>
                </Link>
              </Button>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2 max-w-[220px]">
                    <Building2 className="w-4 h-4 text-accent shrink-0" />
                    <span className="truncate text-xs">{selectedBusiness?.name || "Seleccionar negocio"}</span>
                    <ChevronDown className="w-3 h-3 shrink-0" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  {businesses.map((b) => (
                    <DropdownMenuItem key={b.id} onClick={() => setSelectedBusinessId(b.id)}>
                      <div>
                        <p className="text-sm font-medium">{b.name}</p>
                        <p className="text-xs text-muted-foreground">RUC: {b.ruc}</p>
                      </div>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )
          )}

          <div className="flex-1" />

          <Button variant="ghost" size="icon" className="relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-accent rounded-full" />
          </Button>

          <Button variant="ghost" size="sm" onClick={handleLogout} className="gap-2 text-muted-foreground">
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Salir</span>
          </Button>
        </header>

        {/* Trial banner - Solo para usuarios normales */}
        {!isAdmin && userProfile?.status === "TRIAL" && (
          <Alert className="rounded-none border-x-0 border-t-0 bg-accent/10 border-accent/20">
            <AlertDescription className="flex flex-col sm:flex-row items-start sm:items-center gap-2 text-sm">
              <span className="text-accent font-medium">
                {trialDaysLeft !== null
                  ? `Te quedan ${trialDaysLeft} dias de prueba gratis!`
                  : "Tu prueba gratis esta activa!"}
              </span>
              <span className="text-muted-foreground">Sincroniza automaticamente tus comprobantes con el Plan PRO.</span>
              <Link to="/dashboard/plan" className="text-accent font-semibold hover:underline ml-auto shrink-0">
                Ver Planes
              </Link>
            </AlertDescription>
          </Alert>
        )}

        {/* Content */}
        <main className="flex-1 p-4 md:p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
