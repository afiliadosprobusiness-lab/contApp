import { Calculator, FileStack, Clock, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";

const problems = [
  { icon: Calculator, label: "Cálculos complejos", desc: "Fórmulas de IGV, renta y deducciones que cambian cada año." },
  { icon: FileStack, label: "Montaña de papeles", desc: "Facturas, boletas y guías apilándose sin control." },
  { icon: Clock, label: "Sin tiempo", desc: "Horas perdidas revisando y organizando comprobantes." },
  { icon: AlertTriangle, label: "Multas inesperadas", desc: "Errores que terminan en sanciones de la SUNAT." },
];

const ProblemSection = () => {
  return (
    <section id="problema" className="py-16 md:py-24 bg-card scroll-mt-24">
      <div className="container mx-auto px-4 text-left sm:text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="font-display text-3xl md:text-4xl font-bold text-primary mb-4">
            ¿Cansado de la burocracia, multas y perder tiempo con la SUNAT?
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto mb-10 sm:mb-12">
            Sabemos lo frustrante que es lidiar con la contabilidad en Perú. Estos problemas son más comunes de lo que crees.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {problems.map((item, i) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="p-5 sm:p-6 rounded-xl bg-background border border-border shadow-card hover:shadow-elevated transition-shadow"
            >
              <div className="w-14 h-14 rounded-xl bg-destructive/10 flex items-center justify-center mx-auto mb-4">
                <item.icon className="w-7 h-7 text-destructive" />
              </div>
              <h3 className="font-display font-semibold text-foreground mb-2">{item.label}</h3>
              <p className="text-sm text-muted-foreground">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProblemSection;
