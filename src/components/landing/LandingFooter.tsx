import { Calculator } from "lucide-react";
import { Link } from "react-router-dom";

const LandingFooter = () => {
  return (
    <footer className="bg-navy text-primary-foreground py-12">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          <div>
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
                <Calculator className="w-4 h-4 text-accent-foreground" />
              </div>
              <span className="font-display text-lg font-bold">ContApp Pe</span>
            </Link>
            <p className="text-sm text-primary-foreground/70">
              Tu contador inteligente para simplificar la contabilidad en Peru.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-3">Producto</h4>
            <ul className="space-y-2 text-sm text-primary-foreground/70">
              <li>
                <Link to="/#solucion" className="hover:text-primary-foreground transition-colors">
                  Caracteristicas
                </Link>
              </li>
              <li>
                <Link to="/#precios" className="hover:text-primary-foreground transition-colors">
                  Precios
                </Link>
              </li>
              <li>
                <Link to="/#faq" className="hover:text-primary-foreground transition-colors">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-3">Legal</h4>
            <ul className="space-y-2 text-sm text-primary-foreground/70">
              <li>
                <Link to="/legal/privacidad" className="hover:text-primary-foreground transition-colors">
                  Politica de Privacidad
                </Link>
              </li>
              <li>
                <Link to="/legal/terminos" className="hover:text-primary-foreground transition-colors">
                  Terminos de Servicio
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-primary-foreground/10 pt-6 text-center text-sm text-primary-foreground/50">
          (c) 2026 ContApp Pe. Todos los derechos reservados.
        </div>
      </div>
    </footer>
  );
};

export default LandingFooter;
