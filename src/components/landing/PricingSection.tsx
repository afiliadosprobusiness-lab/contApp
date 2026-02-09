import { Check, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const plans = [
  {
    name: "Plan PRO",
    price: "52.90",
    desc: "Para emprendedores que gestionan hasta 2 negocios.",
    features: [
      "Hasta 2 RUCs / negocios",
      "SincronizaciÃ³n con SUNAT",
      "Asistente IA bÃ¡sico",
      "Alertas de vencimiento",
      "DigitalizaciÃ³n de comprobantes",
      "Soporte por chat",
    ],
    popular: false,
  },
  {
    name: "Plan PLUS",
    price: "104.90",
    desc: "Para contadores y empresas con mÃºltiples negocios.",
    features: [
      "Negocios ilimitados",
      "SincronizaciÃ³n con SUNAT",
      "Asistente IA avanzado",
      "Alertas inteligentes priorizadas",
      "DigitalizaciÃ³n + OCR avanzado",
      "GeneraciÃ³n de TXT para SUNAT",
      "Soporte prioritario",
      "Reportes personalizados",
    ],
    popular: true,
  },
];

const PricingSection = () => {
  return (
    <section id="precios" className="py-16 md:py-24 bg-card scroll-mt-24">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-left sm:text-center mb-10 sm:mb-12"
        >
          <h2 className="font-display text-3xl md:text-4xl font-bold text-primary mb-4">
            Planes y Precios
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg">
            Prueba cualquier plan <span className="font-semibold text-accent">GRATIS por 5 dÃ­as</span>. Sin tarjeta de crÃ©dito.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6 sm:gap-8 max-w-4xl mx-auto">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className={`relative rounded-2xl p-6 sm:p-8 border ${plan.popular ? "border-accent shadow-glow bg-background" : "border-border bg-background shadow-card"}`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-accent text-accent-foreground text-xs font-semibold flex items-center gap-1">
                  <Zap className="w-3 h-3" /> MÃ¡s Popular
                </div>
              )}

              <h3 className="font-display text-xl font-bold text-foreground">{plan.name}</h3>
              <p className="text-muted-foreground text-sm mt-1 mb-4">{plan.desc}</p>

              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-sm text-muted-foreground">S/</span>
                <span className="font-display text-4xl font-extrabold text-primary">{plan.price}</span>
                <span className="text-muted-foreground text-sm">/mes</span>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <Check className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                    <span className="text-foreground">{f}</span>
                  </li>
                ))}
              </ul>

              <Button
                asChild
                className={`w-full h-11 ${plan.popular ? "bg-accent text-accent-foreground hover:bg-accent/90" : "bg-primary text-primary-foreground hover:bg-primary/90"}`}
              >
                <Link to="/registro">Comenzar Prueba Gratis</Link>
              </Button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
