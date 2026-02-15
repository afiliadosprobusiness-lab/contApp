import LandingFooter from "@/components/landing/LandingFooter";
import LandingNavbar from "@/components/landing/LandingNavbar";

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-background">
      <LandingNavbar />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <header className="max-w-3xl">
            <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground">
              Terminos de Servicio
            </h1>
            <p className="mt-3 text-sm text-muted-foreground">
              Ultima actualizacion: 2026-02-15
            </p>
          </header>

          <div className="mt-10 max-w-3xl space-y-6 text-sm leading-relaxed text-foreground">
            <section className="space-y-2">
              <h2 className="font-display text-xl font-semibold">1. Aceptacion</h2>
              <p className="text-muted-foreground">
                Al crear una cuenta o usar ContApp Pe, aceptas estos Terminos de Servicio. Si no
                estas de acuerdo, no uses la plataforma.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="font-display text-xl font-semibold">2. Alcance del servicio</h2>
              <p className="text-muted-foreground">
                ContApp Pe es una plataforma de gestion y automatizacion contable. Incluye, segun tu
                plan, funcionalidades como sincronizacion con SUNAT, facturacion (factura/boleta),
                dashboard de ventas y cobranza basica. El servicio no reemplaza asesoria contable o
                legal profesional.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="font-display text-xl font-semibold">3. Cuenta y responsabilidades</h2>
              <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                <li>Eres responsable de mantener la confidencialidad de tu cuenta.</li>
                <li>
                  Eres responsable por la veracidad de los datos ingresados (RUC, emisor, items y
                  montos).
                </li>
                <li>
                  Si conectas SUNAT, eres responsable de los accesos que autorices (por ejemplo,
                  usuario secundario).
                </li>
              </ul>
            </section>

            <section className="space-y-2">
              <h2 className="font-display text-xl font-semibold">4. Emision de comprobantes (CPE)</h2>
              <p className="text-muted-foreground">
                La emision de comprobantes electronicos puede requerir configuracion adicional
                (datos del emisor, ubigeo, certificado digital). En caso de rechazos o errores, la
                plataforma mostrara el motivo reportado por el proceso de emision y te permitira
                reintentar una vez corregida la configuracion.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="font-display text-xl font-semibold">5. Pagos, planes y prueba</h2>
              <p className="text-muted-foreground">
                Los planes pueden incluir un periodo de prueba. Si tu prueba termina y no activas un
                plan, tu cuenta puede quedar limitada hasta reactivacion. Los precios y beneficios
                pueden cambiar, notificando a los usuarios cuando corresponda.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="font-display text-xl font-semibold">6. Uso prohibido</h2>
              <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                <li>Intentar acceder sin autorizacion a cuentas o datos de terceros.</li>
                <li>Interferir con el funcionamiento del sistema.</li>
                <li>Usar el servicio para actividades ilegales o fraudulentas.</li>
              </ul>
            </section>

            <section className="space-y-2">
              <h2 className="font-display text-xl font-semibold">7. Limitacion de responsabilidad</h2>
              <p className="text-muted-foreground">
                ContApp Pe se brinda "tal cual". No garantizamos ausencia total de errores ni
                disponibilidad ininterrumpida. En la medida permitida por la ley, no somos
                responsables por perdidas indirectas, lucro cesante o sanciones derivadas de datos
                incorrectos ingresados por el usuario.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="font-display text-xl font-semibold">8. Cambios</h2>
              <p className="text-muted-foreground">
                Podemos modificar estos terminos. Publicaremos la fecha de ultima actualizacion en
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

