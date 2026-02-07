import { useEffect, useMemo, useState } from "react";
import { Download, TrendingUp, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/contexts/AuthContext";
import { useBusiness } from "@/contexts/BusinessContext";
import { collection, onSnapshot, query, Timestamp, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { startOfMonth, endOfMonth } from "date-fns";
import { useToast } from "@/hooks/use-toast";

type Comprobante = {
  id: string;
  type: "VENTA" | "COMPRA";
  fecha?: Date;
  monto: number;
  igv: number;
};

const Impuestos = () => {
  const { user } = useAuth();
  const { selectedBusiness } = useBusiness();
  const { toast } = useToast();
  const [comprobantes, setComprobantes] = useState<Comprobante[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.uid || !selectedBusiness?.id) {
      setComprobantes([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const ref = collection(db, "users", user.uid, "businesses", selectedBusiness.id, "comprobantes");
    const now = new Date();
    const start = startOfMonth(now);
    const end = endOfMonth(now);
    const q = query(ref, where("fecha", ">=", Timestamp.fromDate(start)), where("fecha", "<=", Timestamp.fromDate(end)));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs.map((doc) => {
          const item = doc.data();
          return {
            id: doc.id,
            type: item.type,
            fecha: item.fecha?.toDate?.(),
            monto: Number(item.monto || 0),
            igv: Number(item.igv || 0),
          } as Comprobante;
        });
        setComprobantes(data);
        setLoading(false);
      },
      () => setLoading(false)
    );

    return () => unsubscribe();
  }, [user?.uid, selectedBusiness?.id]);

  const totals = useMemo(() => {
    const ventas = comprobantes.filter((c) => c.type === "VENTA");
    const compras = comprobantes.filter((c) => c.type === "COMPRA");
    const sum = (list: Comprobante[], key: "monto" | "igv") => list.reduce((acc, item) => acc + (item[key] || 0), 0);

    const ventasMonto = sum(ventas, "monto");
    const comprasMonto = sum(compras, "monto");
    const ventasIgv = sum(ventas, "igv");
    const comprasIgv = sum(compras, "igv");
    const igvToPay = Math.max(0, ventasIgv - comprasIgv);
    const ingresosNetos = Math.max(0, ventasMonto - comprasMonto);
    const pagoCuenta = ingresosNetos * 0.015;

    return {
      ventasMonto,
      comprasMonto,
      ventasIgv,
      comprasIgv,
      igvToPay,
      ingresosNetos,
      pagoCuenta,
    };
  }, [comprobantes]);

  const formatCurrency = (value: number) =>
    `S/ ${value.toLocaleString("es-PE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const now = new Date();
  const periodLabel = now.toLocaleString("es-PE", { month: "long", year: "numeric" });
  const tramoObjetivo = 15000;
  const progress = Math.min(100, (totals.ingresosNetos / tramoObjetivo) * 100);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">Impuestos</h1>
        <p className="text-sm text-muted-foreground">Resumen de IGV y Renta - Periodo {periodLabel}</p>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <Card className="shadow-card border-border">
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground mb-2">IGV Ventas</p>
            <p className="font-display text-2xl font-bold text-foreground">{formatCurrency(totals.ventasIgv)}</p>
            <p className="text-xs text-muted-foreground mt-1">18% de ventas gravadas</p>
          </CardContent>
        </Card>
        <Card className="shadow-card border-border">
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground mb-2">IGV Compras (Credito Fiscal)</p>
            <p className="font-display text-2xl font-bold text-accent">- {formatCurrency(totals.comprasIgv)}</p>
            <p className="text-xs text-muted-foreground mt-1">Compras deducibles del mes</p>
          </CardContent>
        </Card>
        <Card className="shadow-card border-border border-accent/20 bg-accent/5">
          <CardContent className="p-5">
            <p className="text-sm text-accent font-medium mb-2">IGV a Pagar</p>
            <p className="font-display text-2xl font-bold text-accent">{formatCurrency(totals.igvToPay)}</p>
            <p className="text-xs text-muted-foreground mt-1">Vence: 15 del siguiente mes</p>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-card border-border">
        <CardHeader>
          <CardTitle className="font-display text-lg flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" /> Renta Mensual Estimada
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-muted-foreground">Ingresos netos del mes</span>
                <span className="font-medium text-foreground">{formatCurrency(totals.ingresosNetos)}</span>
              </div>
              <Progress value={progress} className="h-2" />
              <p className="text-xs text-muted-foreground mt-1">{progress.toFixed(1)}% de S/ {tramoObjetivo.toLocaleString("es-PE")}</p>
            </div>
            <div className="flex justify-between text-sm border-t border-border pt-3">
              <span className="text-muted-foreground">Pago a cuenta (1.5%)</span>
              <span className="font-display font-bold text-foreground">{formatCurrency(totals.pagoCuenta)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-card border-border">
        <CardContent className="p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex-1">
            <h3 className="font-display font-semibold text-foreground mb-1">Generar archivo TXT para SUNAT</h3>
            <p className="text-sm text-muted-foreground">Descarga el archivo listo para importar en el PDT de SUNAT.</p>
          </div>
          <Button
            className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2"
            onClick={() =>
              toast({
                title: "Funcion pendiente",
                description: "La generacion del TXT se habilitara en la siguiente fase.",
              })
            }
          >
            <Download className="w-4 h-4" /> Generar TXT
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Impuestos;
