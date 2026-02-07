import { Calculator, Facebook, Twitter, Instagram, Linkedin } from "lucide-react";
import { Link } from "react-router-dom";

const LandingFooter = () => {
  return (
    <footer className="bg-primary text-primary-foreground py-12">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div>
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
                <Calculator className="w-4 h-4 text-accent-foreground" />
              </div>
              <span className="font-display text-lg font-bold">ContApp Pe</span>
            </Link>
            <p className="text-sm text-primary-foreground/70">
              Tu contador inteligente para simplificar la contabilidad en Perú.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-3">Producto</h4>
            <ul className="space-y-2 text-sm text-primary-foreground/70">
              <li><a href="#solucion" className="hover:text-primary-foreground transition-colors">Características</a></li>
              <li><a href="#precios" className="hover:text-primary-foreground transition-colors">Precios</a></li>
              <li><a href="#faq" className="hover:text-primary-foreground transition-colors">FAQ</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-3">Legal</h4>
            <ul className="space-y-2 text-sm text-primary-foreground/70">
              <li><a href="#" className="hover:text-primary-foreground transition-colors">Política de Privacidad</a></li>
              <li><a href="#" className="hover:text-primary-foreground transition-colors">Términos de Servicio</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-3">Contacto</h4>
            <p className="text-sm text-primary-foreground/70 mb-3">soporte@contapp.pe</p>
            <div className="flex gap-3">
              <a href="#" className="w-8 h-8 rounded-full bg-primary-foreground/10 flex items-center justify-center hover:bg-primary-foreground/20 transition-colors">
                <Facebook className="w-4 h-4" />
              </a>
              <a href="#" className="w-8 h-8 rounded-full bg-primary-foreground/10 flex items-center justify-center hover:bg-primary-foreground/20 transition-colors">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="#" className="w-8 h-8 rounded-full bg-primary-foreground/10 flex items-center justify-center hover:bg-primary-foreground/20 transition-colors">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="#" className="w-8 h-8 rounded-full bg-primary-foreground/10 flex items-center justify-center hover:bg-primary-foreground/20 transition-colors">
                <Linkedin className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-primary-foreground/10 pt-6 text-center text-sm text-primary-foreground/50">
          © 2026 ContApp Pe. Todos los derechos reservados.
        </div>
      </div>
    </footer>
  );
};

export default LandingFooter;
