import { Star } from "lucide-react";
import { motion } from "framer-motion";

const testimonials = [
  {
    name: "María López",
    role: "Dueña de Bodega, Lima",
    text: "Antes pasaba horas con Excel. Ahora ContApp Pe lo hace todo en minutos. ¡Ya no le tengo miedo a la SUNAT!",
    rating: 5,
  },
  {
    name: "Carlos Quispe",
    role: "Freelancer, Arequipa",
    text: "La sincronización con SUNAT es mágica. Mis comprobantes aparecen solos y la IA me dice cuánto pagar de IGV.",
    rating: 5,
  },
  {
    name: "Ana Fernández",
    role: "Contadora Independiente, Trujillo",
    text: "Gestiono 8 negocios de mis clientes desde un solo lugar. El Plan PLUS me cambió la vida profesional.",
    rating: 5,
  },
];

const TestimonialsSection = () => {
  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="font-display text-3xl md:text-4xl font-bold text-primary mb-4">
            Lo que dicen nuestros usuarios
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="p-6 rounded-xl bg-card border border-border shadow-card"
            >
              <div className="flex gap-0.5 mb-4">
                {Array.from({ length: t.rating }).map((_, j) => (
                  <Star key={j} className="w-4 h-4 fill-accent text-accent" />
                ))}
              </div>
              <p className="text-foreground text-sm leading-relaxed mb-4">"{t.text}"</p>
              <div>
                <p className="font-semibold text-sm text-foreground">{t.name}</p>
                <p className="text-xs text-muted-foreground">{t.role}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
