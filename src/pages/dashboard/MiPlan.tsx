import { Check, CreditCard, Zap } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const plans = [
  {
    name: "Plan PRO",
    price: "52.90",
    features: ["Hasta 2 negocios", "Sincronizacion SUNAT", "IA basica", "Alertas", "Soporte chat"],
    code: "PRO",
  },
  {
    name: "Plan PLUS",
    price: "104.90",
    features: [
      "Negocios ilimitados",
      "Sincronizacion SUNAT",
      "IA avanzada",
      "Alertas priorizadas",
      "Generacion TXT",
      "Soporte prioritario",
      "Reportes personalizados",
    ],
    code: "PLUS",
  },
] as const;

const MiPlan = () => {
  const { userProfile } = useAuth();
  const { toast } = useToast();

  const currentPlan = userProfile?.plan || "FREE";
  const status = userProfile?.status || "TRIAL";
  const trialEndsAt = userProfile?.trialEndsAt;
  const daysLeft = trialEndsAt ? Math.max(0, Math.ceil((trialEndsAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24))) : null;

  const statusLabel = status === "TRIAL" ? "Prueba Gratis" : status === "ACTIVE" ? "Activo" : "Suspendido";
  const currentPlanData = plans.find((p) => p.code === currentPlan);

  const handleAction = (planCode: string) => {
    toast({
      title: "Pasarela pendiente",
      description: `La activacion del plan ${planCode} se configurara en la siguiente fase.`,
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">Mi Plan</h1>
        <p className="text-sm text-muted-foreground">Gestiona tu suscripcion</p>
      </div>

      <Card className="shadow-card border-accent/20 bg-accent/5">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Badge className="bg-accent text-accent-foreground">Plan Actual</Badge>
            <Badge variant="secondary">{statusLabel}</Badge>
          </div>
          <h2 className="font-display text-xl font-bold text-foreground mb-1">
            {currentPlanData ? currentPlanData.name : "Plan FREE"}
          </h2>
          <p className="text-sm text-muted-foreground mb-4">
            {status === "TRIAL" && daysLeft !== null
              ? `Tu prueba vence en ${daysLeft} dias.`
              : status === "ACTIVE"
                ? "Tu plan esta activo y funcionando."
                : "Tu plan requiere atencion del administrador."}
          </p>
          <div className="flex gap-3">
            <Button className="bg-accent text-accent-foreground hover:bg-accent/90 gap-2" onClick={() => handleAction(currentPlan)}>
              <CreditCard className="w-4 h-4" /> Gestionar plan
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        {plans.map((plan) => {
          const isCurrent = plan.code === currentPlan;
          return (
            <Card key={plan.name} className={`shadow-card ${!isCurrent ? "border-accent shadow-glow" : "border-border"}`}>
              <CardContent className="p-6">
                {!isCurrent && (
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
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm">
                      <Check className="w-4 h-4 text-accent shrink-0" />
                      <span className="text-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  className={`w-full ${!isCurrent ? "bg-accent text-accent-foreground hover:bg-accent/90" : "bg-primary text-primary-foreground hover:bg-primary/90"}`}
                  disabled={isCurrent}
                  onClick={() => handleAction(plan.code)}
                >
                  {isCurrent ? "Plan actual" : `Upgrade a ${plan.code}`}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default MiPlan;
