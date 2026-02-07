import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Shield, Star } from "lucide-react";
import { motion } from "framer-motion";
import heroDashboard from "@/assets/hero-dashboard.png";

const HeroSection = () => {
  return (
    <section className="relative pt-24 pb-16 md:pt-32 md:pb-24 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 gradient-hero opacity-[0.03]" />
      <div className="absolute top-20 right-0 w-[600px] h-[600px] rounded-full bg-accent/5 blur-3xl" />

      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-light text-accent text-sm font-medium mb-6">
              <Star className="w-4 h-4" />
              +1,000 emprendedores peruanos confían en nosotros
            </div>

            <h1 className="font-display text-4xl md:text-5xl lg:text-[3.5rem] font-extrabold leading-tight text-primary mb-6">
              ContApp Pe: Tu Contador Inteligente,{" "}
              <span className="text-accent">Adiós a la SUNAT.</span>
            </h1>

            <p className="text-lg text-muted-foreground mb-8 max-w-lg">
              Automatiza tus impuestos, recibe alertas y gestiona tus negocios con IA. 
              Simplifica tu contabilidad en Perú.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/registro">
                <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 shadow-glow animate-pulse-glow text-base px-8 h-12">
                  Prueba Gratis por 5 Días
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <a href="#solucion">
                <Button variant="outline" size="lg" className="text-base px-8 h-12 border-primary/20">
                  Ver Características
                </Button>
              </a>
            </div>

            <div className="flex items-center gap-6 mt-8 text-sm text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-accent" />
                Sin tarjeta de crédito
              </div>
              <div className="flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-accent" />
                Cancela cuando quieras
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="relative"
          >
            <div className="relative rounded-2xl overflow-hidden shadow-elevated border border-border">
              <img 
                src={heroDashboard} 
                alt="Dashboard de ContApp Pe mostrando gráficos financieros" 
                className="w-full h-auto"
                loading="lazy"
              />
            </div>
            <div className="absolute -bottom-4 -left-4 w-24 h-24 rounded-full bg-accent/10 blur-2xl" />
            <div className="absolute -top-4 -right-4 w-32 h-32 rounded-full bg-primary/10 blur-2xl" />
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
