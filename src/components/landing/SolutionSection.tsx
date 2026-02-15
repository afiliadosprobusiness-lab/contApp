import { motion } from "framer-motion";
import type { ComponentType } from "react";
import {
  BadgeCheck,
  Bell,
  BrainCircuit,
  FileDown,
  LayoutDashboard,
  Receipt,
  RefreshCw,
  Send,
  Wallet,
} from "lucide-react";

type Feature = {
  icon: ComponentType<{ className?: string }>;
  title: string;
  desc: string;
  color: string;
  tag?: string;
};

const features: Feature[] = [
  {
    icon: Receipt,
    title: "Facturas y boletas en un solo lugar",
    desc: "Emite FACTURA y BOLETA desde tu panel. Guarda items, totales, fechas y estados de pago.",
    color: "bg-accent/10 text-accent",
    tag: "Nuevo",
  },
  {
    icon: LayoutDashboard,
    title: "Dashboard de ventas (clientes, productos, pendientes)",
    desc: "Metricas del mes y seguimiento de documentos pendientes con saldo por cobrar.",
    color: "bg-primary/10 text-primary",
    tag: "Nuevo",
  },
  {
    icon: Wallet,
    title: "Cobranza basica y abonos",
    desc: "Registra pagos parciales o pago total. Controla saldo, historial y estado (pendiente/parcial/pagado).",
    color: "bg-emerald-light text-accent dark:bg-accent/15",
    tag: "Nuevo",
  },
  {
    icon: RefreshCw,
    title: "Sincronizacion con SUNAT",
    desc: "Conecta tu usuario secundario y sincroniza comprobantes de ventas y compras sin copiar y pegar.",
    color: "bg-accent/10 text-accent",
  },
  {
    icon: Send,
    title: "CPE: Validar BETA y emitir en PROD",
    desc: "Haz una validacion en entorno de pruebas y, si pasa, emite en el entorno real con control de errores.",
    color: "bg-primary/10 text-primary",
    tag: "Nuevo",
  },
  {
    icon: FileDown,
    title: "Descarga de CDR y exportacion CSV",
    desc: "Cuando SUNAT acepta, descarga el CDR (ZIP) y exporta tus documentos para reportes o auditoria.",
    color: "bg-emerald-light text-accent dark:bg-accent/15",
    tag: "Nuevo",
  },
  {
    icon: BrainCircuit,
    title: "Asistente contable con IA",
    desc: "Resuelve dudas, interpreta tus datos y te guia para tomar decisiones sin volverte experto.",
    color: "bg-accent/10 text-accent",
  },
  {
    icon: Bell,
    title: "Alertas inteligentes",
    desc: "Recibe recordatorios de vencimientos y señales de inconsistencias para evitar multas.",
    color: "bg-primary/10 text-primary",
  },
  {
    icon: BadgeCheck,
    title: "Listo para crecer con tu negocio",
    desc: "Diseñado para emprendedores y PyMEs: simple de usar, sin sacrificar control ni trazabilidad.",
    color: "bg-emerald-light text-accent dark:bg-accent/15",
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
            Todo lo que puedes hacer con ContApp Pe
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto">
            Automatiza, emite, cobra y controla. Una plataforma pensada para Peru y para tu dia a dia.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-4 sm:gap-8">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.06 }}
              className="flex flex-col sm:flex-row gap-4 sm:gap-5 p-5 sm:p-6 rounded-xl bg-card border border-border shadow-card hover:shadow-elevated transition-all group"
            >
              <div
                className={`w-14 h-14 rounded-xl ${f.color} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}
              >
                <f.icon className="w-7 h-7" />
              </div>
              <div className="min-w-0">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-display font-semibold text-lg text-foreground mb-1">
                    {f.title}
                  </h3>
                  {f.tag && (
                    <span className="shrink-0 rounded-full border border-border bg-background px-2 py-0.5 text-[11px] text-muted-foreground">
                      {f.tag}
                    </span>
                  )}
                </div>
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
