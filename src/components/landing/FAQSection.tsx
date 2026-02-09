import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { motion } from "framer-motion";

const faqs = [
  {
    q: "Â¿Es seguro conectar mi cuenta de SUNAT?",
    a: "SÃ­. Usamos un Usuario Secundario con permisos limitados de solo lectura. Nunca accedemos a tu Clave SOL principal ni podemos hacer declaraciones en tu nombre. Tus datos estÃ¡n encriptados con estÃ¡ndares bancarios.",
  },
  {
    q: "Â¿QuÃ© pasa despuÃ©s de los 5 dÃ­as de prueba gratis?",
    a: "Si no eliges un plan, tu cuenta se pausarÃ¡ pero no perderÃ¡s tus datos. PodrÃ¡s reactivarla en cualquier momento eligiendo el Plan PRO o PLUS.",
  },
  {
    q: "Â¿Puedo cambiar de plan despuÃ©s?",
    a: "Â¡Claro! Puedes hacer upgrade del Plan PRO al PLUS en cualquier momento. El cambio se aplica inmediatamente y se prorratea el pago.",
  },
  {
    q: "Â¿Necesito conocimientos de contabilidad?",
    a: "Para nada. ContApp Pe estÃ¡ diseÃ±ada para emprendedores sin conocimientos contables. La IA te guÃ­a paso a paso y clasifica todo automÃ¡ticamente.",
  },
];

const FAQSection = () => {
  return (
    <section id="faq" className="py-16 md:py-24 bg-card scroll-mt-24">
      <div className="container mx-auto px-4 max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-left sm:text-center mb-10 sm:mb-12"
        >
          <h2 className="font-display text-3xl md:text-4xl font-bold text-primary mb-4">
            Preguntas Frecuentes
          </h2>
        </motion.div>

        <Accordion type="single" collapsible className="space-y-3">
          {faqs.map((faq, i) => (
            <AccordionItem key={i} value={`faq-${i}`} className="border border-border rounded-xl px-5 sm:px-6 bg-background">
              <AccordionTrigger className="text-left font-medium text-foreground hover:no-underline">
                {faq.q}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed">
                {faq.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
};

export default FAQSection;
