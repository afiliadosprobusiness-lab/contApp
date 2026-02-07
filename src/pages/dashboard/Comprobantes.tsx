import { useEffect, useMemo, useState } from "react";
import { useEffect, useMemo, useState } from "react";
import { Upload, Search, Filter, Plus, Loader2, RefreshCw } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useBusiness } from "@/contexts/BusinessContext";
import { addDoc, collection, doc, onSnapshot, query, Timestamp, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { syncSunat } from "@/lib/sunat";

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

type SunatStatus = {
  status?: string;
  lastPeriod?: { year: number; month: number };
  lastRunAt?: Date;
  lastError?: string;
  lastResult?: { ventas?: number; compras?: number };
};

const Comprobantes = () => {
  const { user } = useAuth();
  const { selectedBusiness } = useBusiness();
  const { toast } = useToast();
  const [ventas, setVentas] = useState<Comprobante[]>([]);
  const [compras, setCompras] = useState<Comprobante[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [sunatStatus, setSunatStatus] = useState<SunatStatus | null>(null);
  const [period, setPeriod] = useState(() => new Date().toISOString().slice(0, 7));
  const hasSunatCredentials = Boolean(selectedBusiness?.sunatSecondaryUser);
  const [form, setForm] = useState({
    type: "VENTA",
    serie: "",
    numero: "",
    fecha: new Date().toISOString().slice(0, 10),
    cliente: "",
    proveedor: "",
    monto: "",
    igv: "",
  });

  useEffect(() => {
    if (!user?.uid || !selectedBusiness?.id) {
      setVentas([]);
      setCompras([]);
      setSunatStatus(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    const ref = collection(db, "users", user.uid, "businesses", selectedBusiness.id, "comprobantes");
    const ventasQuery = query(ref, where("type", "==", "VENTA"));
    const comprasQuery = query(ref, where("type", "==", "COMPRA"));

    const unsubscribeVentas = onSnapshot(
      ventasQuery,
      (snapshot) => {
        const data = snapshot.docs.map((docSnap) => {
          const item = docSnap.data();
          return {
            id: docSnap.id,
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
        data.sort((a, b) => (b.fecha?.getTime() || 0) - (a.fecha?.getTime() || 0));
        setVentas(data);
        setLoading(false);
      },
      () => setLoading(false)
    );

    const unsubscribeCompras = onSnapshot(
      comprasQuery,
      (snapshot) => {
        const data = snapshot.docs.map((docSnap) => {
          const item = docSnap.data();
          return {
            id: docSnap.id,
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
        data.sort((a, b) => (b.fecha?.getTime() || 0) - (a.fecha?.getTime() || 0));
        setCompras(data);
        setLoading(false);
      },
      () => setLoading(false)
    );

    const statusRef = doc(db, "users", user.uid, "sunat_sync", selectedBusiness.id);
    const unsubscribeStatus = onSnapshot(statusRef, (snapshot) => {
      if (!snapshot.exists()) {
        setSunatStatus({ status: "IDLE" });
        return;
      }
      const data = snapshot.data();
      setSunatStatus({
        status: data.status,
        lastPeriod: data.lastPeriod,
        lastRunAt: data.lastRunAt?.toDate?.(),
        lastError: data.lastError,
        lastResult: data.lastResult,
      });
    });

    return () => {
      unsubscribeVentas();
      unsubscribeCompras();
      unsubscribeStatus();
    };
  }, [user?.uid, selectedBusiness?.id]);

  const filterList = (list: Comprobante[]) => {
    const q = search.trim().toLowerCase();
    if (!q) return list;
    return list.filter((item) => {
      const values = [
        item.serie,
        item.numero,
        item.cliente,
        item.proveedor,
        item.fecha ? item.fecha.toISOString().slice(0, 10) : "",
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return values.includes(q);
    });
  };

  const ventasFiltradas = useMemo(() => filterList(ventas), [ventas, search]);
  const comprasFiltradas = useMemo(() => filterList(compras), [compras, search]);

  const formatCurrency = (value: number) =>
    `S/ ${value.toLocaleString("es-PE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const formatDate = (value?: Date) => {
    if (!value) return "-";
    return value.toLocaleString("es-PE", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const openDialog = () => {
    setForm({
      type: "VENTA",
      serie: "",
      numero: "",
      fecha: new Date().toISOString().slice(0, 10),
      cliente: "",
      proveedor: "",
      monto: "",
      igv: "",
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!user?.uid || !selectedBusiness?.id) return;
    if (!form.serie.trim() || !form.numero.trim() || !form.monto.trim()) {
      toast({
        title: "Datos incompletos",
        description: "Serie, numero y monto son obligatorios",
        variant: "destructive",
      });
      return;
    }

    try {
      setSaving(true);
      const monto = Number(form.monto || 0);
      const igv = form.igv ? Number(form.igv) : Number((monto * 0.18).toFixed(2));
      const payload: Record<string, unknown> = {
        type: form.type,
        serie: form.serie.trim(),
        numero: form.numero.trim(),
        fecha: Timestamp.fromDate(new Date(form.fecha)),
        monto,
        igv,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };
      if (form.type === "VENTA") {
        payload.cliente = form.cliente.trim();
      } else {
        payload.proveedor = form.proveedor.trim();
      }

      await addDoc(collection(db, "users", user.uid, "businesses", selectedBusiness.id, "comprobantes"), payload);
      toast({ title: "Comprobante registrado", description: "Se agrego correctamente" });
      setDialogOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo guardar el comprobante",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSync = async () => {
    if (!selectedBusiness) return;
    if (!hasSunatCredentials) {
      toast({
        title: "Credenciales SUNAT faltantes",
        description: "Configura el Usuario Secundario y Clave SOL en Configuracion.",
        variant: "destructive",
      });
      return;
    }
    if (!period) {
      toast({
        title: "Selecciona un periodo",
        description: "Elige mes y anio para sincronizar",
        variant: "destructive",
      });
      return;
    }

    const [yearRaw, monthRaw] = period.split("-");
    const year = Number(yearRaw);
    const month = Number(monthRaw);
    if (!year || !month) {
      toast({
        title: "Periodo invalido",
        description: "Selecciona un mes valido",
        variant: "destructive",
      });
      return;
    }

    try {
      setSyncing(true);
      await syncSunat({ businessId: selectedBusiness.id, year, month });
      toast({
        title: "Sincronizacion iniciada",
        description: "Estamos consultando SUNAT. Esto puede tardar unos minutos.",
      });
    } catch (error: any) {
      toast({
        title: "Error de sincronizacion",
        description: error?.message || "No se pudo sincronizar",
        variant: "destructive",
      });
    } finally {
      setSyncing(false);
    }
  };

  const statusLabel = sunatStatus?.status || "IDLE";
  const statusVariant =
    statusLabel === "RUNNING" ? "bg-primary/10 text-primary" :
    statusLabel === "OK" ? "bg-emerald-light text-accent" :
    statusLabel === "ERROR" ? "bg-destructive/10 text-destructive" :
    "bg-muted text-muted-foreground";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Comprobantes</h1>
          <p className="text-sm text-muted-foreground">Ventas y compras sincronizadas en tiempo real</p>
        </div>
        <Button className="bg-accent text-accent-foreground hover:bg-accent/90 gap-2" onClick={openDialog}>
          <Plus className="w-4 h-4" /> Nuevo comprobante
        </Button>
      </div>

      <Card className="shadow-card border-border">
        <CardContent className="p-5 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div>
              <h2 className="font-display text-lg font-semibold">Sincronizar SUNAT</h2>
              <p className="text-sm text-muted-foreground">Selecciona un periodo y sincroniza ventas y compras.</p>
            </div>
            <Badge className={`text-xs ${statusVariant}`}>Estado: {statusLabel}</Badge>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Label className="text-xs text-muted-foreground">Periodo</Label>
              <Input
                type="month"
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                className="w-full sm:w-[160px]"
                disabled={!selectedBusiness}
              />
            </div>
            <Button
              className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2 w-full sm:w-auto"
              onClick={handleSync}
              disabled={syncing || !selectedBusiness || !hasSunatCredentials}
            >
              {syncing ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
              {syncing ? "Sincronizando..." : "Sincronizar"}
            </Button>
          </div>
          {!hasSunatCredentials && (
            <div className="text-xs text-destructive">Configura tus credenciales SUNAT en Configuracion.</div>
          )}
          <div className="text-xs text-muted-foreground space-y-1">
            <div>Ultima sincronizacion: {formatDate(sunatStatus?.lastRunAt)}</div>
            {sunatStatus?.lastPeriod && (
              <div>Periodo: {sunatStatus.lastPeriod.month}/{sunatStatus.lastPeriod.year}</div>
            )}
            {sunatStatus?.lastResult && (
              <div>
                Resultados: ventas {sunatStatus.lastResult.ventas || 0}, compras {sunatStatus.lastResult.compras || 0}
              </div>
            )}
            {sunatStatus?.lastError && (
              <div className="text-destructive">Error: {sunatStatus.lastError}</div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="border-2 border-dashed border-accent/30 bg-accent/5 shadow-none">
        <CardContent className="p-8 text-center">
          <Upload className="w-10 h-10 text-accent mx-auto mb-3" />
          <p className="font-medium text-foreground mb-1">Arrastra y suelta tus facturas aqui</p>
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
              <Input placeholder="Buscar..." className="pl-9 w-[200px]" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <Button variant="outline" size="icon"><Filter className="w-4 h-4" /></Button>
          </div>
        </div>

        <TabsContent value="ventas" className="mt-4">
          <Card className="shadow-card border-border">
            {loading ? (
              <CardContent className="p-6 flex items-center justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-accent" />
              </CardContent>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Serie-Numero</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead className="text-right">Monto</TableHead>
                    <TableHead className="text-right">IGV</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ventasFiltradas.length == 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground py-6">
                        No hay ventas registradas
                      </TableCell>
                    </TableRow>
                  ) : (
                    ventasFiltradas.map((v) => (
                      <TableRow key={v.id}>
                        <TableCell className="font-medium">{v.serie}-{v.numero}</TableCell>
                        <TableCell>{v.fecha ? v.fecha.toISOString().slice(0, 10) : "-"}</TableCell>
                        <TableCell>{v.cliente || "-"}</TableCell>
                        <TableCell className="text-right">{formatCurrency(v.monto)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(v.igv)}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="compras" className="mt-4">
          <Card className="shadow-card border-border">
            {loading ? (
              <CardContent className="p-6 flex items-center justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-accent" />
              </CardContent>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Serie-Numero</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Proveedor</TableHead>
                    <TableHead className="text-right">Monto</TableHead>
                    <TableHead className="text-right">IGV</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {comprasFiltradas.length == 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground py-6">
                        No hay compras registradas
                      </TableCell>
                    </TableRow>
                  ) : (
                    comprasFiltradas.map((c) => (
                      <TableRow key={c.id}>
                        <TableCell className="font-medium">{c.serie}-{c.numero}</TableCell>
                        <TableCell>{c.fecha ? c.fecha.toISOString().slice(0, 10) : "-"}</TableCell>
                        <TableCell>{c.proveedor || "-"}</TableCell>
                        <TableCell className="text-right">{formatCurrency(c.monto)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(c.igv)}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            )}
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-display">Nuevo comprobante</DialogTitle>
            <DialogDescription>Registra ventas o compras manualmente.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Tipo</Label>
              <Select value={form.type} onValueChange={(value) => setForm({ ...form, type: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="VENTA">Venta</SelectItem>
                  <SelectItem value="COMPRA">Compra</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Serie</Label>
                <Input value={form.serie} onChange={(e) => setForm({ ...form, serie: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Numero</Label>
                <Input value={form.numero} onChange={(e) => setForm({ ...form, numero: e.target.value })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Fecha</Label>
              <Input type="date" value={form.fecha} onChange={(e) => setForm({ ...form, fecha: e.target.value })} />
            </div>
            {form.type === "VENTA" ? (
              <div className="space-y-2">
                <Label>Cliente</Label>
                <Input value={form.cliente} onChange={(e) => setForm({ ...form, cliente: e.target.value })} />
              </div>
            ) : (
              <div className="space-y-2">
                <Label>Proveedor</Label>
                <Input value={form.proveedor} onChange={(e) => setForm({ ...form, proveedor: e.target.value })} />
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Monto</Label>
                <Input value={form.monto} onChange={(e) => setForm({ ...form, monto: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>IGV (opcional)</Label>
                <Input value={form.igv} onChange={(e) => setForm({ ...form, igv: e.target.value })} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              className="bg-accent text-accent-foreground hover:bg-accent/90"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? "Guardando..." : "Registrar comprobante"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Comprobantes;
