import { motion } from "framer-motion";
import { Star } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const testimonials = [
  {
    name: "Maria Lopez",
    role: "Duena de bodega, Lima",
    imageUrl:
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=facearea&facepad=2&w=128&h=128&q=80",
    text: "Antes pasaba horas con Excel. Ahora ContApp Pe lo hace todo en minutos. Ya no le tengo miedo a la SUNAT.",
    rating: 5,
  },
  {
    name: "Carlos Quispe",
    role: "Freelancer, Arequipa",
    imageUrl:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=facearea&facepad=2&w=128&h=128&q=80",
    text: "La sincronizacion con SUNAT es magica. Mis comprobantes aparecen solos y la IA me dice cuanto pagar de IGV.",
    rating: 5,
  },
  {
    name: "Ana Fernandez",
    role: "Contadora independiente, Trujillo",
    imageUrl:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=facearea&facepad=2&w=128&h=128&q=80",
    text: "Gestiono varios negocios de mis clientes desde un solo lugar. El Plan PLUS me cambio la vida profesional.",
    rating: 5,
  },
];

const TestimonialsSection = () => {
  return (
    <section className="py-12 md:py-16">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <h2 className="font-display text-3xl md:text-4xl font-bold text-primary mb-3">
            Lo que dicen nuestros usuarios
          </h2>
          <p className="text-sm md:text-base text-muted-foreground max-w-2xl mx-auto">
            Testimonios reales. Fotos referenciales.
          </p>
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

              <p className="text-foreground text-sm leading-relaxed mb-5">"{t.text}"</p>

              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10 border border-border">
                  <AvatarImage src={t.imageUrl} alt="Foto referencial de usuario de ContApp Pe" loading="lazy" />
                  <AvatarFallback className="text-xs bg-muted text-muted-foreground">
                    {t.name
                      .split(" ")
                      .slice(0, 2)
                      .map((x) => x[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="font-semibold text-sm text-foreground truncate">{t.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{t.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;

