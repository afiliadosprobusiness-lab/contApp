import { Check, CreditCard, Zap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const MiPlan = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">Mi Plan</h1>
        <p className="text-sm text-muted-foreground">Gestiona tu suscripción</p>
      </div>

      {/* Current plan */}
      <Card className="shadow-card border-accent/20 bg-accent/5">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Badge className="bg-accent text-accent-foreground">Plan Actual</Badge>
            <Badge variant="secondary">Prueba Gratis</Badge>
          </div>
          <h2 className="font-display text-xl font-bold text-foreground mb-1">Plan PRO - Período de Prueba</h2>
          <p className="text-sm text-muted-foreground mb-4">Tu prueba gratis vence en 3 días. Activa tu plan para no perder acceso.</p>
          <div className="flex gap-3">
            <Dialog>
              <DialogTrigger asChild>
                <Button className="bg-accent text-accent-foreground hover:bg-accent/90 gap-2">
                  <CreditCard className="w-4 h-4" /> Activar Plan PRO - S/ 52.90/mes
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="font-display">Pasarela de Pago - Culqi</DialogTitle>
                  <DialogDescription>Ingresa los datos de tu tarjeta para activar el Plan PRO</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Número de tarjeta</Label>
                    <Input placeholder="4111 1111 1111 1111" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Fecha de expiración</Label>
                      <Input placeholder="MM/AA" />
                    </div>
                    <div className="space-y-2">
                      <Label>CVV</Label>
                      <Input placeholder="123" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Nombre en la tarjeta</Label>
                    <Input placeholder="CARLOS QUISPE" />
                  </div>
                </div>
                <DialogFooter>
                  <Button className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
                    Pagar S/ 52.90
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      {/* Plans comparison */}
      <div className="grid md:grid-cols-2 gap-6">
        {[
          {
            name: "Plan PRO",
            price: "52.90",
            features: ["Hasta 2 negocios", "Sincronización SUNAT", "IA básica", "Alertas", "Soporte chat"],
            current: true,
          },
          {
            name: "Plan PLUS",
            price: "104.90",
            features: ["Negocios ilimitados", "Sincronización SUNAT", "IA avanzada", "Alertas priorizadas", "Generación TXT", "Soporte prioritario", "Reportes personalizados"],
            current: false,
          },
        ].map((plan) => (
          <Card key={plan.name} className={`shadow-card ${!plan.current ? "border-accent shadow-glow" : "border-border"}`}>
            <CardContent className="p-6">
              {!plan.current && (
                <Badge className="bg-accent text-accent-foreground mb-3 gap-1">
                  <Zap className="w-3 h-3" /> Recomendado
                </Badge>
              )}
              <h3 className="font-display text-xl font-bold text-foreground">{plan.name}</h3>
              <div className="flex items-baseline gap-1 my-3">
                <span className="text-sm text-muted-foreground">S/</span>
                <span className="font-display text-3xl font-extrabold text-primary">{plan.price}</span>
                <span className="text-muted-foreground text-sm">/mes</span>
              </div>
              <ul className="space-y-2 mb-6">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-accent shrink-0" />
                    <span className="text-foreground">{f}</span>
                  </li>
                ))}
              </ul>
              <Dialog>
                <DialogTrigger asChild>
                  <Button className={`w-full ${!plan.current ? "bg-accent text-accent-foreground hover:bg-accent/90" : "bg-primary text-primary-foreground hover:bg-primary/90"}`}>
                    {plan.current ? "Activar Plan PRO" : "Upgrade a PLUS"}
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle className="font-display">Pasarela de Pago - Culqi</DialogTitle>
                    <DialogDescription>Activar {plan.name} por S/ {plan.price}/mes</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2"><Label>Número de tarjeta</Label><Input placeholder="4111 1111 1111 1111" /></div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2"><Label>Expiración</Label><Input placeholder="MM/AA" /></div>
                      <div className="space-y-2"><Label>CVV</Label><Input placeholder="123" /></div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
                      Pagar S/ {plan.price}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default MiPlan;
