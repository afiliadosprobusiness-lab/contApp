import { TrendingUp, TrendingDown, DollarSign, ShoppingCart, Receipt, BrainCircuit, Send } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { useState } from "react";

const kpiCards = [
  { label: "Ventas del Mes", value: "S/ 12,500", change: "+8.2%", up: true, icon: DollarSign },
  { label: "Compras Deducibles", value: "S/ 4,200", change: "+3.1%", up: true, icon: ShoppingCart },
  { label: "IGV Estimado por Pagar", value: "S/ 1,494", change: "-2.5%", up: false, icon: Receipt },
];

const chartData = [
  { mes: "Jul", ingresos: 9800, gastos: 4200 },
  { mes: "Ago", ingresos: 11200, gastos: 3800 },
  { mes: "Sep", ingresos: 10500, gastos: 5100 },
  { mes: "Oct", ingresos: 13400, gastos: 4900 },
  { mes: "Nov", ingresos: 11800, gastos: 4600 },
  { mes: "Dic", ingresos: 14200, gastos: 5300 },
  { mes: "Ene", ingresos: 12500, gastos: 4200 },
];

const DashboardHome = () => {
  const [aiQuery, setAiQuery] = useState("");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Resumen financiero de Mi Bodega SAC</p>
      </div>

      {/* KPI Cards */}
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
                {kpi.up ? (
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
        {/* Chart */}
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
                    formatter={(value: number) => [`S/ ${value.toLocaleString()}`, ""]}
                  />
                  <Legend />
                  <Bar dataKey="ingresos" fill="hsl(215, 72%, 22%)" radius={[4, 4, 0, 0]} name="Ingresos" />
                  <Bar dataKey="gastos" fill="hsl(168, 80%, 36%)" radius={[4, 4, 0, 0]} name="Gastos" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* AI Widget */}
        <Card className="shadow-card border-border">
          <CardHeader>
            <CardTitle className="font-display text-lg flex items-center gap-2">
              <BrainCircuit className="w-5 h-5 text-accent" />
              ContApp IA
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col h-[calc(100%-4rem)]">
            <div className="flex-1 space-y-3 mb-4">
              <div className="p-3 rounded-xl bg-accent/10 text-sm text-foreground">
                <p className="font-medium text-accent mb-1">ContApp IA</p>
                ¡Hola! Soy tu asistente contable. Puedo ayudarte con dudas sobre deducciones, IGV, renta y más. ¿En qué te ayudo hoy?
              </div>
              <div className="p-3 rounded-xl bg-secondary text-sm text-foreground ml-8">
                ¿Es deducible un pasaje de bus para mi empresa?
              </div>
              <div className="p-3 rounded-xl bg-accent/10 text-sm text-foreground">
                <p className="font-medium text-accent mb-1">ContApp IA</p>
                Sí, los gastos de transporte son deducibles si están vinculados a la actividad empresarial. Necesitas el boleto electrónico o factura con tu RUC. 📄
              </div>
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Pregunta algo..."
                className="text-sm"
                value={aiQuery}
                onChange={(e) => setAiQuery(e.target.value)}
              />
              <Button size="icon" className="bg-accent text-accent-foreground hover:bg-accent/90 shrink-0">
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardHome;
