import { Receipt, Download, FileText, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

const Impuestos = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">Impuestos</h1>
        <p className="text-sm text-muted-foreground">Resumen de IGV y Renta - Período Enero 2026</p>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <Card className="shadow-card border-border">
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground mb-2">IGV Ventas</p>
            <p className="font-display text-2xl font-bold text-foreground">S/ 1,346.40</p>
            <p className="text-xs text-muted-foreground mt-1">18% de ventas gravadas</p>
          </CardContent>
        </Card>
        <Card className="shadow-card border-border">
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground mb-2">IGV Compras (Crédito Fiscal)</p>
            <p className="font-display text-2xl font-bold text-accent">- S/ 369.00</p>
            <p className="text-xs text-muted-foreground mt-1">Compras deducibles del mes</p>
          </CardContent>
        </Card>
        <Card className="shadow-card border-border border-accent/20 bg-accent/5">
          <CardContent className="p-5">
            <p className="text-sm text-accent font-medium mb-2">IGV a Pagar</p>
            <p className="font-display text-2xl font-bold text-accent">S/ 977.40</p>
            <p className="text-xs text-muted-foreground mt-1">Vence: 15 Feb 2026</p>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-card border-border">
        <CardHeader>
          <CardTitle className="font-display text-lg flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Renta Mensual Estimada
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-muted-foreground">Ingresos netos acumulados</span>
                <span className="font-medium text-foreground">S/ 12,500.00</span>
              </div>
              <Progress value={25} className="h-2" />
              <p className="text-xs text-muted-foreground mt-1">25% del tramo de 15 UIT</p>
            </div>
            <div className="flex justify-between text-sm border-t border-border pt-3">
              <span className="text-muted-foreground">Pago a cuenta (1.5%)</span>
              <span className="font-display font-bold text-foreground">S/ 187.50</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-card border-border">
        <CardContent className="p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex-1">
            <h3 className="font-display font-semibold text-foreground mb-1">Generar archivo TXT para SUNAT</h3>
            <p className="text-sm text-muted-foreground">Descarga el archivo listo para importar en el PDT de la SUNAT.</p>
          </div>
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2">
            <Download className="w-4 h-4" /> Generar TXT
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Impuestos;
