import { RefreshCw, BrainCircuit, ScanLine, Bell } from "lucide-react";
import { motion } from "framer-motion";

const features = [
  {
    icon: RefreshCw,
    title: "Sincronización Mágica con SUNAT",
    desc: "Conecta tu Usuario Secundario y jala automáticamente tus comprobantes de ventas y compras. Sin copiar y pegar.",
    color: "bg-accent/10 text-accent",
  },
  {
    icon: BrainCircuit,
    title: "Tu Asistente Contable IA",
    desc: "Clasifica gastos, predice tu IGV mensual y responde dudas tributarias al instante. Como tener un contador 24/7.",
    color: "bg-primary/10 text-primary",
  },
  {
    icon: ScanLine,
    title: "Libre de Papeleos",
    desc: "Arrastra y suelta tus facturas. Nuestro OCR las lee, clasifica y organiza automáticamente.",
    color: "bg-emerald-light text-accent",
  },
  {
    icon: Bell,
    title: "Alertas Inteligentes",
    desc: "Nunca más olvides un vencimiento. Te notificamos de declaraciones, pagos y posibles inconsistencias.",
    color: "bg-accent/10 text-accent",
  },
];

const SolutionSection = () => {
  return (
    <section id="solucion" className="py-16 md:py-24 scroll-mt-24">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-left sm:text-center mb-10 sm:mb-12"
        >
          <h2 className="font-display text-3xl md:text-4xl font-bold text-primary mb-4">
            Nuestra Solución te da superpoderes
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto">
            ContApp Pe automatiza todo para que te enfoques en hacer crecer tu negocio.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-4 sm:gap-8">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="flex flex-col sm:flex-row gap-4 sm:gap-5 p-5 sm:p-6 rounded-xl bg-card border border-border shadow-card hover:shadow-elevated transition-all group"
            >
              <div className={`w-14 h-14 rounded-xl ${f.color} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}>
                <f.icon className="w-7 h-7" />
              </div>
              <div>
                <h3 className="font-display font-semibold text-lg text-foreground mb-1">{f.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{f.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SolutionSection;
