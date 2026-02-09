import type { MouseEvent } from "react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X, Calculator } from "lucide-react";
import { Button } from "@/components/ui/button";

const LandingNavbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const handleScroll = (id: string) => (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    const target = document.getElementById(id);
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    setIsOpen(false);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-card/80 backdrop-blur-lg border-b border-border">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-lg gradient-emerald flex items-center justify-center">
            <Calculator className="w-5 h-5 text-accent-foreground" />
          </div>
          <span className="font-display text-xl font-bold text-primary">ContApp Pe</span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          <a href="#problema" className="text-sm text-muted-foreground hover:text-foreground transition-colors" onClick={handleScroll("problema")}>El Problema</a>
          <a href="#solucion" className="text-sm text-muted-foreground hover:text-foreground transition-colors" onClick={handleScroll("solucion")}>SoluciÃ³n</a>
          <a href="#precios" className="text-sm text-muted-foreground hover:text-foreground transition-colors" onClick={handleScroll("precios")}>Precios</a>
          <a href="#faq" className="text-sm text-muted-foreground hover:text-foreground transition-colors" onClick={handleScroll("faq")}>FAQ</a>
        </div>

        <div className="hidden md:flex items-center gap-3">
          <Button asChild variant="ghost" size="sm">
            <Link to="/login">Iniciar SesiÃ³n</Link>
          </Button>
          <Button asChild size="sm" className="bg-accent text-accent-foreground hover:bg-accent/90">
            <Link to="/registro">Prueba Gratis</Link>
          </Button>
        </div>

        <button className="md:hidden" onClick={() => setIsOpen(!isOpen)} aria-label="Abrir menu">
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {isOpen && (
        <div className="md:hidden bg-card border-b border-border p-4 space-y-3">
          <a href="#problema" className="block text-sm text-muted-foreground" onClick={handleScroll("problema")}>El Problema</a>
          <a href="#solucion" className="block text-sm text-muted-foreground" onClick={handleScroll("solucion")}>SoluciÃ³n</a>
          <a href="#precios" className="block text-sm text-muted-foreground" onClick={handleScroll("precios")}>Precios</a>
          <a href="#faq" className="block text-sm text-muted-foreground" onClick={handleScroll("faq")}>FAQ</a>
          <div className="flex gap-2 pt-2">
            <Button asChild variant="ghost" className="w-full" size="sm">
              <Link to="/login" className="flex-1">Iniciar SesiÃ³n</Link>
            </Button>
            <Button asChild className="w-full bg-accent text-accent-foreground hover:bg-accent/90" size="sm">
              <Link to="/registro" className="flex-1">Prueba Gratis</Link>
            </Button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default LandingNavbar;
