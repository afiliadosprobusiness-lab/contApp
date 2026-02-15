import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTheme } from "next-themes";
import { Calculator, Menu, Moon, Sun, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

const LandingNavbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const isDark = mounted && resolvedTheme === "dark";

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-card/80 backdrop-blur-lg border-b border-border">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-lg gradient-emerald flex items-center justify-center">
            <Calculator className="w-5 h-5 text-accent-foreground" />
          </div>
          <span className="font-display text-xl font-bold text-foreground">ContApp Pe</span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          <Link to="/#problema" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            El Problema
          </Link>
          <Link to="/#solucion" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Solucion
          </Link>
          <Link to="/#precios" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Precios
          </Link>
          <Link to="/#faq" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            FAQ
          </Link>
        </div>

        <div className="hidden md:flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-full border border-border bg-background/60 px-3 py-1.5">
            <Sun className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
            <Label htmlFor="theme-toggle" className="sr-only">
              Cambiar tema
            </Label>
            <Switch
              id="theme-toggle"
              checked={isDark}
              onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
              aria-label={isDark ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
            />
            <Moon className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
          </div>

          <Button asChild variant="ghost" size="sm">
            <Link to="/login">Iniciar sesion</Link>
          </Button>
          <Button asChild size="sm" className="bg-accent text-accent-foreground hover:bg-accent/90">
            <Link to="/registro">Prueba Gratis</Link>
          </Button>
        </div>

        <button
          className="md:hidden"
          onClick={() => setIsOpen((v) => !v)}
          aria-label={isOpen ? "Cerrar menu" : "Abrir menu"}
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {isOpen && (
        <div className="md:hidden bg-card border-b border-border p-4 space-y-3">
          <Link to="/#problema" className="block text-sm text-muted-foreground" onClick={() => setIsOpen(false)}>
            El Problema
          </Link>
          <Link to="/#solucion" className="block text-sm text-muted-foreground" onClick={() => setIsOpen(false)}>
            Solucion
          </Link>
          <Link to="/#precios" className="block text-sm text-muted-foreground" onClick={() => setIsOpen(false)}>
            Precios
          </Link>
          <Link to="/#faq" className="block text-sm text-muted-foreground" onClick={() => setIsOpen(false)}>
            FAQ
          </Link>

          <div className="flex items-center justify-between gap-3 rounded-xl border border-border bg-background/50 px-3 py-2">
            <div className="flex items-center gap-2">
              <Sun className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
              <span className="text-sm text-muted-foreground">Tema</span>
            </div>
            <div className="flex items-center gap-2">
              <Label htmlFor="theme-toggle-mobile" className="sr-only">
                Cambiar tema
              </Label>
              <Switch
                id="theme-toggle-mobile"
                checked={isDark}
                onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
                aria-label={isDark ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
              />
              <Moon className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <Button asChild variant="ghost" className="w-full" size="sm">
              <Link to="/login" className="flex-1" onClick={() => setIsOpen(false)}>
                Iniciar sesion
              </Link>
            </Button>
            <Button asChild className="w-full bg-accent text-accent-foreground hover:bg-accent/90" size="sm">
              <Link to="/registro" className="flex-1" onClick={() => setIsOpen(false)}>
                Prueba Gratis
              </Link>
            </Button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default LandingNavbar;

