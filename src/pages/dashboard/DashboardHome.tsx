import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Receipt,
  BrainCircuit,
  Send,
  Loader2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { useAdminRedirect } from "@/hooks/useAdminRedirect";
import { useAuth } from "@/contexts/AuthContext";
import { useBusiness } from "@/contexts/BusinessContext";
import { collection, onSnapshot, query, Timestamp, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { startOfMonth, subMonths, endOfMonth } from "date-fns";
import { useToast } from "@/hooks/use-toast";

type Comprobante = {
  id: string;
  type: "VENTA" | "COMPRA";
  serie?: string;
  numero?: string;
  fecha?: Date;
  cliente?: string;
  proveedor?: string;
  monto: number;
  igv: number;
};

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

const SYSTEM_PROMPT =
  "Eres ContApp IA, un contador publico colegiado especializado en normativa peruana y SUNAT. Responde en espanol claro, breve y accionable. Prioriza IGV, Renta, retenciones, percepciones, detracciones, comprobantes electronicos, libros electronicos, regimenes (RUS/RER/MYPE/General) y obligaciones SUNAT. Si falta contexto, pregunta 1-2 cosas clave (RUC, regimen, periodo, tipo de comprobante, monto, giro). Da pasos concretos y ejemplos cortos cuando ayuden. Si hay incertidumbre, dilo y sugiere verificar en SUNAT o con un contador. No des asesoria legal, solo orientacion tributaria general.";

const DashboardHome = () => {
  const [aiQuery, setAiQuery] = useState("");
  const [aiMessages, setAiMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content:
        "Hola! Soy tu asistente contable. Puedo ayudarte con dudas sobre deducciones, IGV, renta y mas. En que te ayudo hoy?",
    },
  ]);
  const [aiLoading, setAiLoading] = useState(false);
  const [comprobantes, setComprobantes] = useState<Comprobante[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { selectedBusiness, loading: businessesLoading } = useBusiness();
  const { toast } = useToast();

  useAdminRedirect();

  useEffect(() => {
    if (!user?.uid || !selectedBusiness?.id) {
      setComprobantes([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const ref = collection(db, "users", user.uid, "businesses", selectedBusiness.id, "comprobantes");
    const start = startOfMonth(subMonths(new Date(), 6));
    const q = query(ref, where("fecha", ">=", Timestamp.fromDate(start)));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs.map((doc) => {
          const item = doc.data();
          return {
            id: doc.id,
            type: item.type,
            serie: item.serie,
            numero: item.numero,
            fecha: item.fecha?.toDate?.(),
            cliente: item.cliente,
            proveedor: item.proveedor,
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

  const formatCurrency = (value: number) =>
    `S/ ${value.toLocaleString("es-PE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const now = new Date();
  const currentStart = startOfMonth(now);
  const previousStart = startOfMonth(subMonths(now, 1));
  const previousEnd = endOfMonth(subMonths(now, 1));

  const totals = useMemo(() => {
    const inRange = (date: Date | undefined, start: Date, end: Date) =>
      date ? date >= start && date <= end : false;

    const currentVentas = comprobantes.filter((c) => c.type === "VENTA" && inRange(c.fecha, currentStart, now));
    const currentCompras = comprobantes.filter((c) => c.type === "COMPRA" && inRange(c.fecha, currentStart, now));
    const previousVentas = comprobantes.filter((c) => c.type === "VENTA" && inRange(c.fecha, previousStart, previousEnd));
    const previousCompras = comprobantes.filter((c) => c.type === "COMPRA" && inRange(c.fecha, previousStart, previousEnd));

    const sum = (list: Comprobante[], key: "monto" | "igv") =>
      list.reduce((acc, item) => acc + (item[key] || 0), 0);

    const ventasMonto = sum(currentVentas, "monto");
    const comprasMonto = sum(currentCompras, "monto");
    const ventasIgv = sum(currentVentas, "igv");
    const comprasIgv = sum(currentCompras, "igv");
    const prevVentasMonto = sum(previousVentas, "monto");
    const prevComprasMonto = sum(previousCompras, "monto");
    const prevIgv = sum(previousVentas, "igv") - sum(previousCompras, "igv");

    const igvToPay = Math.max(0, ventasIgv - comprasIgv);
    const prevIgvToPay = Math.max(0, prevIgv);

    const change = (current: number, previous: number) => {
      if (previous == 0) return null;
      return ((current - previous) / previous) * 100;
    };

    return {
      ventasMonto,
      comprasMonto,
      igvToPay,
      ventasChange: change(ventasMonto, prevVentasMonto),
      comprasChange: change(comprasMonto, prevComprasMonto),
      igvChange: change(igvToPay, prevIgvToPay),
    };
  }, [comprobantes, currentStart, now, previousEnd, previousStart]);

  const chartData = useMemo(() => {
    const months = Array.from({ length: 6 }, (_, i) => startOfMonth(subMonths(now, 5 - i)));

    return months.map((month) => {
      const start = month;
      const end = endOfMonth(month);
      const ingresos = comprobantes
        .filter((c) => c.type === "VENTA" && c.fecha && c.fecha >= start && c.fecha <= end)
        .reduce((acc, item) => acc + item.monto, 0);
      const gastos = comprobantes
        .filter((c) => c.type === "COMPRA" && c.fecha && c.fecha >= start && c.fecha <= end)
        .reduce((acc, item) => acc + item.monto, 0);
      return {
        mes: month.toLocaleString("es-PE", { month: "short" }),
        ingresos,
        gastos,
      };
    });
  }, [comprobantes, now]);

  const formatChange = (value: number | null) =>
    value === null ? "N/A" : `${value >= 0 ? "+" : ""}${value.toFixed(1)}%`;

  const kpiCards = [
    {
      label: "Ventas del Mes",
      value: formatCurrency(totals.ventasMonto),
      change: formatChange(totals.ventasChange),
      up: (totals.ventasChange ?? 0) >= 0,
      icon: DollarSign,
    },
    {
      label: "Compras Deducibles",
      value: formatCurrency(totals.comprasMonto),
      change: formatChange(totals.comprasChange),
      up: (totals.comprasChange ?? 0) >= 0,
      icon: ShoppingCart,
    },
    {
      label: "IGV Estimado por Pagar",
      value: formatCurrency(totals.igvToPay),
      change: formatChange(totals.igvChange),
      up: (totals.igvChange ?? 0) >= 0,
      icon: Receipt,
    },
  ];

  const handleSend = async () => {
    const content = aiQuery.trim();
    if (!content || aiLoading) return;

    const nextMessages = [...aiMessages, { role: "user", content }];
    setAiMessages(nextMessages);
    setAiQuery("");
    setAiLoading(true);

    try {
      const history = nextMessages.slice(-8).map((msg) => ({ role: msg.role, content: msg.content }));
      const payload = {
        messages: [{ role: "system", content: SYSTEM_PROMPT }, ...history],
        model: "gpt-4o-mini",
      };

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error || "Error en el servicio de IA");
      }

      const reply = (data?.reply || "").trim();
      if (!reply) {
        throw new Error("Respuesta vacia");
      }

      setAiMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    } catch (error: any) {
      toast({
        title: "Error en ContApp IA",
        description: error?.message || "No se pudo completar la solicitud",
        variant: "destructive",
      });
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            {selectedBusiness ? `Resumen financiero de ${selectedBusiness.name}` : "Resumen financiero"}
          </p>
        </div>
        {loading && <span className="text-xs text-muted-foreground">Actualizando...</span>}
      </div>

      {!businessesLoading && !selectedBusiness && (
        <Card className="border-dashed border-muted-foreground/30">
          <CardContent className="p-6 text-sm text-muted-foreground flex flex-col sm:flex-row sm:items-center gap-3 sm:justify-between">
            <span>Agrega un negocio para ver tu resumen financiero.</span>
            <Button
              asChild
              size="sm"
              className="bg-accent text-accent-foreground hover:bg-accent/90 w-full sm:w-auto"
            >
              <Link to="/dashboard/negocios">Ir a Mis Negocios</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="grid sm:grid-cols-3 gap-4">
        {kpiCards.map((kpi) => (
          <Card key={kpi.label} className="shadow-card border-border">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-muted-foreground">{kpi.label}</span>
                <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                  <kpi.icon className="w-5 h-5 text-accent" />
                </div>
              </div>
              <p className="font-display text-2xl font-bold text-foreground">{kpi.value}</p>
              <div className="flex items-center gap-1 mt-1">
                {kpi.change === "N/A" ? null : kpi.up ? (
                  <TrendingUp className="w-3.5 h-3.5 text-accent" />
                ) : (
                  <TrendingDown className="w-3.5 h-3.5 text-destructive" />
                )}
                <span className={`text-xs font-medium ${kpi.up ? "text-accent" : "text-destructive"}`}>
                  {kpi.change}
                </span>
                <span className="text-xs text-muted-foreground">vs mes anterior</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 shadow-card border-border">
          <CardHeader>
            <CardTitle className="font-display text-lg">Ingresos vs Gastos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} barGap={4}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 32%, 91%)" />
                  <XAxis dataKey="mes" tick={{ fontSize: 12 }} stroke="hsl(215, 16%, 47%)" />
                  <YAxis tick={{ fontSize: 12 }} stroke="hsl(215, 16%, 47%)" />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "0.75rem",
                      border: "1px solid hsl(214, 32%, 91%)",
                      boxShadow: "0 4px 24px -4px hsl(215 72% 22% / 0.08)",
                    }}
                    formatter={(value: number) => [`S/ ${value.toLocaleString("es-PE")}`, ""]}
                  />
                  <Legend />
                  <Bar dataKey="ingresos" fill="hsl(215, 72%, 22%)" radius={[4, 4, 0, 0]} name="Ingresos" />
                  <Bar dataKey="gastos" fill="hsl(168, 80%, 36%)" radius={[4, 4, 0, 0]} name="Gastos" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card border-border">
          <CardHeader>
            <CardTitle className="font-display text-lg flex items-center gap-2">
              <BrainCircuit className="w-5 h-5 text-accent" />
              ContApp IA
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex-1 space-y-3 max-h-[260px] overflow-y-auto pr-1">
              {aiMessages.map((msg, index) => (
                <div
                  key={`${msg.role}-${index}`}
                  className={
                    msg.role === "assistant"
                      ? "p-3 rounded-xl bg-accent/10 text-sm text-foreground"
                      : "p-3 rounded-xl bg-secondary text-sm text-foreground ml-6"
                  }
                >
                  {msg.role === "assistant" && <p className="font-medium text-accent mb-1">ContApp IA</p>}
                  {msg.content}
                </div>
              ))}
              {aiLoading && (
                <div className="p-3 rounded-xl bg-accent/10 text-sm text-foreground">
                  <p className="font-medium text-accent mb-1">ContApp IA</p>
                  Escribiendo...
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <Input
                placeholder="Pregunta algo..."
                className="text-sm"
                value={aiQuery}
                onChange={(e) => setAiQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleSend();
                  }
                }}
              />
              <Button
                size="icon"
                className="bg-accent text-accent-foreground hover:bg-accent/90 shrink-0 w-full sm:w-auto"
                onClick={handleSend}
                disabled={aiLoading}
              >
                {aiLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardHome;
