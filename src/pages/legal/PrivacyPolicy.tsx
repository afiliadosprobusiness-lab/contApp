import LandingFooter from "@/components/landing/LandingFooter";
import LandingNavbar from "@/components/landing/LandingNavbar";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-background">
      <LandingNavbar />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <header className="max-w-3xl">
            <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground">
              Politica de Privacidad
            </h1>
            <p className="mt-3 text-sm text-muted-foreground">
              Ultima actualizacion: 2026-02-15
            </p>
          </header>

          <div className="mt-10 max-w-3xl space-y-6 text-sm leading-relaxed text-foreground">
            <section className="space-y-2">
              <h2 className="font-display text-xl font-semibold">1. Quienes somos</h2>
              <p>
                ContApp Pe (ContApp-peru) es una plataforma para emprendedores y PyMEs en Peru que
                ayuda a gestionar negocios, registrar ventas y compras, emitir comprobantes y
                visualizar metricas de facturacion.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="font-display text-xl font-semibold">2. Datos que recopilamos</h2>
              <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                <li>Datos de cuenta: correo, nombre y datos basicos de perfil.</li>
                <li>Datos del negocio: RUC, razon social, direccion y configuracion del emisor.</li>
                <li>
                  Datos operativos: comprobantes, facturas/boletas, items, montos, estados de pago y
                  estado CPE.
                </li>
                <li>
                  Credenciales SOL: se solicitan para integraciones con SUNAT y se almacenan cifradas
                  en nuestros servicios.
                </li>
                <li>
                  Certificado digital: si decides cargarlo para emision CPE, se guarda de forma
                  segura para firmar comprobantes.
                </li>
                <li>Datos tecnicos: logs de error y eventos de seguridad para soporte.</li>
              </ul>
            </section>

            <section className="space-y-2">
              <h2 className="font-display text-xl font-semibold">3. Para que usamos tus datos</h2>
              <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                <li>Brindar acceso a tu cuenta y a tus negocios.</li>
                <li>Generar reportes y dashboards (ventas, clientes, productos, pendientes).</li>
                <li>Procesar acciones de facturacion, cobranza y exportacion.</li>
                <li>Conectar y sincronizar informacion con SUNAT cuando lo solicites.</li>
                <li>Mejorar el servicio y prevenir fraude o uso indebido.</li>
              </ul>
            </section>

            <section className="space-y-2">
              <h2 className="font-display text-xl font-semibold">4. Comparticion de datos</h2>
              <p className="text-muted-foreground">
                No vendemos tus datos personales. Podemos compartir informacion solo cuando sea
                necesario para operar el servicio (por ejemplo, integraciones con SUNAT) o por
                requerimiento legal.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="font-display text-xl font-semibold">5. Seguridad</h2>
              <p className="text-muted-foreground">
                Aplicamos medidas de seguridad razonables, incluyendo cifrado para credenciales y
                control de acceso. Aun asi, ningun sistema es 100% infalible; te recomendamos usar
                contrasenas robustas y no compartir tu acceso.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="font-display text-xl font-semibold">6. Retencion</h2>
              <p className="text-muted-foreground">
                Conservamos los datos mientras mantengas tu cuenta activa o mientras sea necesario
                para brindarte el servicio y cumplir obligaciones legales.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="font-display text-xl font-semibold">7. Tus derechos</h2>
              <p className="text-muted-foreground">
                Puedes solicitar actualizacion o eliminacion de tus datos, sujeto a obligaciones
                legales y tecnicas. Si tienes dudas sobre esta politica, usa los canales de soporte
                dentro de la plataforma.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="font-display text-xl font-semibold">8. Cambios a esta politica</h2>
              <p className="text-muted-foreground">
                Podemos actualizar esta politica. Publicaremos la fecha de ultima actualizacion en
                esta pagina.
              </p>
            </section>
          </div>
        </div>
      </main>
      <LandingFooter />
    </div>
  );
}

