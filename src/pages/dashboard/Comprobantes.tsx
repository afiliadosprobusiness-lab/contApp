import { FileText, Upload, Search, Filter, Download } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const ventas = [
  { serie: "F001", numero: "00234", fecha: "2026-01-28", cliente: "Tech Solutions SAC", monto: 2500, igv: 450 },
  { serie: "B001", numero: "00891", fecha: "2026-01-25", cliente: "Juan Pérez", monto: 180, igv: 32.4 },
  { serie: "F001", numero: "00233", fecha: "2026-01-20", cliente: "Digital Corp EIRL", monto: 4800, igv: 864 },
];

const compras = [
  { serie: "F002", numero: "01456", fecha: "2026-01-27", proveedor: "Distribuidora Norte SAC", monto: 1200, igv: 216 },
  { serie: "F003", numero: "00089", fecha: "2026-01-22", proveedor: "Servicios Cloud Perú", monto: 850, igv: 153 },
];

const Comprobantes = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Comprobantes</h1>
          <p className="text-sm text-muted-foreground">Ventas y compras sincronizadas con SUNAT</p>
        </div>
      </div>

      {/* Drop zone */}
      <Card className="border-2 border-dashed border-accent/30 bg-accent/5 shadow-none">
        <CardContent className="p-8 text-center">
          <Upload className="w-10 h-10 text-accent mx-auto mb-3" />
          <p className="font-medium text-foreground mb-1">Arrastra y suelta tus facturas aquí</p>
          <p className="text-sm text-muted-foreground">O haz clic para seleccionar archivos (PDF, XML, imagen)</p>
          <Button variant="outline" className="mt-4 gap-2">
            <Upload className="w-4 h-4" /> Seleccionar Archivos
          </Button>
        </CardContent>
      </Card>

      <Tabs defaultValue="ventas">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <TabsList>
            <TabsTrigger value="ventas">Ventas</TabsTrigger>
            <TabsTrigger value="compras">Compras</TabsTrigger>
          </TabsList>
          <div className="flex gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Buscar..." className="pl-9 w-[200px]" />
            </div>
            <Button variant="outline" size="icon"><Filter className="w-4 h-4" /></Button>
          </div>
        </div>

        <TabsContent value="ventas" className="mt-4">
          <Card className="shadow-card border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Serie-Número</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead className="text-right">Monto</TableHead>
                  <TableHead className="text-right">IGV</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ventas.map((v) => (
                  <TableRow key={v.numero}>
                    <TableCell className="font-medium">{v.serie}-{v.numero}</TableCell>
                    <TableCell>{v.fecha}</TableCell>
                    <TableCell>{v.cliente}</TableCell>
                    <TableCell className="text-right">S/ {v.monto.toLocaleString()}</TableCell>
                    <TableCell className="text-right">S/ {v.igv.toLocaleString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="compras" className="mt-4">
          <Card className="shadow-card border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Serie-Número</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Proveedor</TableHead>
                  <TableHead className="text-right">Monto</TableHead>
                  <TableHead className="text-right">IGV</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {compras.map((c) => (
                  <TableRow key={c.numero}>
                    <TableCell className="font-medium">{c.serie}-{c.numero}</TableCell>
                    <TableCell>{c.fecha}</TableCell>
                    <TableCell>{c.proveedor}</TableCell>
                    <TableCell className="text-right">S/ {c.monto.toLocaleString()}</TableCell>
                    <TableCell className="text-right">S/ {c.igv.toLocaleString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Comprobantes;
