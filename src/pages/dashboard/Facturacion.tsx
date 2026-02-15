import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Download, Loader2, Plus } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useBusiness } from "@/contexts/BusinessContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  createBillingInvoice,
  emitBillingCpe,
  emitBillingCpeProd,
  listBillingInvoices,
  listBillingPayments,
  markBillingInvoicePaid,
  registerBillingPayment,
} from "@/lib/billing";
import { getSunatCertificateStatus } from "@/lib/sunat";

type DocType = "FACTURA" | "BOLETA";
type PayStatus = "PENDIENTE" | "PARCIAL" | "PAGADO" | "VENCIDO";
type CpeStatus = "NO_ENVIADO" | "ACEPTADO" | "RECHAZADO" | "ERROR";
type CustomerDoc = "RUC" | "DNI" | "OTRO";

type Item = { description: string; quantity: number; unitPrice: number; taxRate: number; subtotal: number; igv: number; total: number };
type Invoice = {
  id: string;
  documentType: DocType;
  serie: string;
  numero: string;
  customerName: string;
  customerDocumentType: CustomerDoc;
  customerDocumentNumber: string;
  issueDate?: Date;
  dueDate?: Date | null;
  subtotal: number;
  igv: number;
  total: number;
  paidAmount: number;
  balance: number;
  paymentStatus: PayStatus;
  items: Item[];
  cpeStatus?: Exclude<CpeStatus, "NO_ENVIADO"> | null;
  cpeProvider?: string | null;
  cpeTicket?: string | null;
  cpeCode?: string | number | null;
  cpeDescription?: string | null;
  cpeError?: string | null;
  cpeBetaStatus?: Exclude<CpeStatus, "NO_ENVIADO"> | null;
  cpeBetaCode?: string | number | null;
  cpeBetaDescription?: string | null;
  cpeBetaError?: string | null;
};
type Payment = { id: string; amount: number; paymentDate?: Date; note?: string; createdAt?: Date };
type ItemForm = { description: string; quantity: string; unitPrice: string; taxRate: string };
type InvoiceForm = {
  documentType: DocType;
  serie: string;
  numero: string;
  customerName: string;
  customerDocumentType: CustomerDoc;
  customerDocumentNumber: string;
  issueDate: string;
  dueDate: string;
  items: ItemForm[];
};

const PEN = new Intl.NumberFormat("es-PE", { style: "currency", currency: "PEN", minimumFractionDigits: 2, maximumFractionDigits: 2 });
const f = (v: number) => PEN.format(Number(v || 0));
const today = () => new Date().toISOString().slice(0, 10);
const n = (v: string) => { const x = Number(v.replace(",", ".")); return Number.isFinite(x) ? x : 0; };
const tax = (v: string) => { const x = n(v); if (x <= 0) return 0; return x > 1 ? x / 100 : x; };
const round2 = (v: number) => Math.round((v + Number.EPSILON) * 100) / 100;
const emptyItem = (): ItemForm => ({ description: "", quantity: "1", unitPrice: "0", taxRate: "0.18" });
const emptyForm = (): InvoiceForm => ({ documentType: "FACTURA", serie: "F001", numero: "", customerName: "", customerDocumentType: "RUC", customerDocumentNumber: "", issueDate: today(), dueDate: "", items: [emptyItem()] });
const emptyPay = () => ({ amount: "", paymentDate: today(), note: "" });
const d = (x?: Date | null) => (x ? x.toLocaleDateString("es-PE") : "-");
const csv = (x: string | number) => `"${String(x ?? "").replaceAll('"', '""')}"`;
const toDate = (x?: string | null) => {
  if (!x) return null;
  const parsed = new Date(x);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const effective = (invoice: Invoice): PayStatus => {
  if (invoice.paymentStatus === "PAGADO") return "PAGADO";
  if (!invoice.dueDate) return invoice.paymentStatus === "PARCIAL" ? "PARCIAL" : "PENDIENTE";
  const due = new Date(invoice.dueDate); due.setHours(23, 59, 59, 999);
  return due.getTime() < Date.now() ? "VENCIDO" : invoice.paymentStatus;
};

const badgeClass = (status: PayStatus) => {
  if (status === "PAGADO") return "bg-emerald-100 text-emerald-700";
  if (status === "VENCIDO") return "bg-red-100 text-red-700";
  if (status === "PARCIAL") return "bg-amber-100 text-amber-700";
  return "bg-slate-100 text-slate-700";
};

const effectiveCpeStatus = (invoice: Invoice): CpeStatus => {
  const status = String(invoice.cpeStatus || "").toUpperCase();
  if (status === "ACEPTADO") return "ACEPTADO";
  if (status === "RECHAZADO") return "RECHAZADO";
  if (status === "ERROR") return "ERROR";
  return "NO_ENVIADO";
};

const cpeBadgeClass = (status: CpeStatus) => {
  if (status === "ACEPTADO") return "bg-emerald-100 text-emerald-700";
  if (status === "RECHAZADO") return "bg-red-100 text-red-700";
  if (status === "ERROR") return "bg-orange-100 text-orange-700";
  return "bg-slate-100 text-slate-700";
};

const effectiveCpeBetaStatus = (invoice: Invoice): CpeStatus => {
  const status = String(invoice.cpeBetaStatus || "").toUpperCase();
  if (status === "ACEPTADO") return "ACEPTADO";
  if (status === "RECHAZADO") return "RECHAZADO";
  if (status === "ERROR") return "ERROR";
  return "NO_ENVIADO";
};

const Facturacion = () => {
  const { user } = useAuth();
  const { selectedBusiness, loading: businessLoading } = useBusiness();
  const { toast } = useToast();

  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  const [emitOpen, setEmitOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<InvoiceForm>(emptyForm());

  const [payOpen, setPayOpen] = useState(false);
  const [payInvoice, setPayInvoice] = useState<Invoice | null>(null);
  const [payForm, setPayForm] = useState(emptyPay());
  const [savingPay, setSavingPay] = useState(false);
  const [emittingCpeId, setEmittingCpeId] = useState<string | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loadingPayments, setLoadingPayments] = useState(false);
  const [certStatus, setCertStatus] = useState<{
    state: "unknown" | "configured" | "missing";
    filename?: string | null;
  }>({ state: "unknown", filename: null });

  const loadInvoices = useCallback(async () => {
    if (!user?.uid || !selectedBusiness?.id) {
      setInvoices([]);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const response = await listBillingInvoices({ businessId: selectedBusiness.id, limit: 300 });
      const rows = (response.invoices || []).map((x) => ({
        id: x.id,
        documentType: (x.documentType || "BOLETA") as DocType,
        serie: x.serie || "",
        numero: x.numero || "",
        customerName: x.customerName || "Sin cliente",
        customerDocumentType: (x.customerDocumentType || "OTRO") as CustomerDoc,
        customerDocumentNumber: x.customerDocumentNumber || "",
        issueDate: toDate(x.issueDate),
        dueDate: toDate(x.dueDate),
        subtotal: Number(x.subtotal || 0),
        igv: Number(x.igv || 0),
        total: Number(x.total || 0),
        paidAmount: Number(x.paidAmount || 0),
        balance: Number(x.balance || 0),
        paymentStatus: (x.paymentStatus || "PENDIENTE") as PayStatus,
        items: Array.isArray(x.items) ? (x.items as Item[]) : [],
        cpeStatus: (x.cpeStatus || null) as Exclude<CpeStatus, "NO_ENVIADO"> | null,
        cpeProvider: x.cpeProvider || null,
        cpeTicket: x.cpeTicket || null,
        cpeCode: x.cpeCode ?? null,
        cpeDescription: x.cpeDescription ?? null,
        cpeError: x.cpeError || null,
        cpeBetaStatus: (x.cpeBetaStatus || null) as Exclude<CpeStatus, "NO_ENVIADO"> | null,
        cpeBetaCode: x.cpeBetaCode ?? null,
        cpeBetaDescription: x.cpeBetaDescription ?? null,
        cpeBetaError: x.cpeBetaError || null,
      })) as Invoice[];
      setInvoices(rows);
    } catch (error: any) {
      setInvoices([]);
      toast({
        title: "Error",
        description: error?.message || "No se pudo cargar facturas.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [selectedBusiness?.id, toast, user?.uid]);

  const loadPayments = useCallback(
    async (invoiceId: string) => {
      if (!selectedBusiness?.id) return;
      try {
        setLoadingPayments(true);
        const response = await listBillingPayments({ businessId: selectedBusiness.id, invoiceId });
        const rows = (response.payments || []).map((x) => ({
          id: x.id,
          amount: Number(x.amount || 0),
          paymentDate: toDate(x.paymentDate),
          note: x.note || "",
          createdAt: toDate(x.createdAt),
        })) as Payment[];
        setPayments(rows);
      } catch (error: any) {
        setPayments([]);
        toast({
          title: "Error",
          description: error?.message || "No se pudo cargar abonos.",
          variant: "destructive",
        });
      } finally {
        setLoadingPayments(false);
      }
    },
    [selectedBusiness?.id, toast]
  );

  useEffect(() => {
    loadInvoices();
  }, [loadInvoices]);

  useEffect(() => {
    const businessId = selectedBusiness?.id;
    if (!businessId) {
      setCertStatus({ state: "unknown", filename: null });
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const response = await getSunatCertificateStatus({ businessId });
        if (cancelled) return;
        setCertStatus({
          state: response.configured ? "configured" : "missing",
          filename: response.filename ?? null,
        });
      } catch {
        // Don't block sending if we can't verify. We'll still block if issuer data is missing.
        if (cancelled) return;
        setCertStatus({ state: "unknown", filename: null });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [selectedBusiness?.id]);

  useEffect(() => {
    if (!payOpen || !payInvoice?.id || !selectedBusiness?.id) {
      setPayments([]);
      return;
    }
    loadPayments(payInvoice.id);
  }, [loadPayments, payInvoice?.id, payOpen, selectedBusiness?.id]);

  const totals = useMemo(() => {
    const rows = form.items.map((i) => {
      const qty = Math.max(0, n(i.quantity));
      const price = Math.max(0, n(i.unitPrice));
      const rate = Math.max(0, tax(i.taxRate));
      const subtotal = round2(qty * price);
      const igv = round2(subtotal * rate);
      return { subtotal, igv, total: round2(subtotal + igv) };
    });
    return {
      subtotal: round2(rows.reduce((acc,x) => acc + x.subtotal, 0)),
      igv: round2(rows.reduce((acc,x) => acc + x.igv, 0)),
      total: round2(rows.reduce((acc,x) => acc + x.total, 0)),
    };
  }, [form.items]);

  const pending = useMemo(() => invoices.map((x) => ({ ...x, e: effective(x) })).filter((x) => x.e !== "PAGADO" && x.balance > 0).sort((a,b) => (a.dueDate?.getTime() || Number.MAX_SAFE_INTEGER) - (b.dueDate?.getTime() || Number.MAX_SAFE_INTEGER)), [invoices]);

  const dashboard = useMemo(() => {
    const now = new Date();
    const from = new Date(now.getFullYear(), now.getMonth(), 1);
    const month = invoices.filter((x) => x.issueDate && x.issueDate >= from && x.issueDate <= now);
    const customers = new Set(month.map((x) => `${x.customerDocumentType}:${x.customerDocumentNumber || x.customerName}`));
    const products = new Set(month.flatMap((x) => x.items.map((i) => i.description.trim()).filter(Boolean)));
    return {
      sales: round2(month.reduce((acc,x) => acc + x.total, 0)),
      customers: customers.size,
      products: products.size,
      pendingCount: pending.length,
      pendingAmount: round2(pending.reduce((acc,x) => acc + x.balance, 0)),
    };
  }, [invoices, pending]);

  const updateItem = (index: number, key: keyof ItemForm, value: string) => {
    setForm((prev) => {
      const items = [...prev.items];
      items[index] = { ...items[index], [key]: value };
      return { ...prev, items };
    });
  };

  const saveInvoice = async () => {
    if (!user?.uid || !selectedBusiness?.id) return;
    const serie = form.serie.trim().toUpperCase();
    const numero = form.numero.trim().toUpperCase();
    const customerName = form.customerName.trim();
    const customerDoc = form.customerDocumentNumber.trim();
    if (!serie || !numero || !customerName || !customerDoc) { toast({ title: "Datos incompletos", description: "Completa serie, numero y cliente.", variant: "destructive" }); return; }
    if (form.documentType === "FACTURA" && form.customerDocumentType !== "RUC") { toast({ title: "Cliente invalido", description: "La factura requiere cliente con RUC.", variant: "destructive" }); return; }
    const issueDateRaw = new Date(`${form.issueDate}T00:00:00`);
    const dueDateRaw = form.dueDate ? new Date(`${form.dueDate}T00:00:00`) : null;
    if (dueDateRaw && dueDateRaw.getTime() < issueDateRaw.getTime()) { toast({ title: "Vencimiento invalido", description: "La fecha de vencimiento no puede ser menor a la emision.", variant: "destructive" }); return; }
    const duplicate = invoices.some((x) => x.documentType === form.documentType && x.serie.toUpperCase() === serie && x.numero.toUpperCase() === numero);
    if (duplicate) { toast({ title: "Duplicado", description: "Ya existe ese comprobante.", variant: "destructive" }); return; }

    const items: Item[] = [];
    for (const i of form.items) {
      const description = i.description.trim();
      const quantity = n(i.quantity);
      const unitPrice = n(i.unitPrice);
      const taxRate = tax(i.taxRate);
      if (!description || quantity <= 0 || unitPrice < 0) { toast({ title: "Items invalidos", description: "Revisa descripcion, cantidad y precio.", variant: "destructive" }); return; }
      const subtotal = round2(quantity * unitPrice);
      const igv = round2(subtotal * taxRate);
      items.push({ description, quantity, unitPrice, taxRate, subtotal, igv, total: round2(subtotal + igv) });
    }
    if (items.length === 0) { toast({ title: "Items requeridos", description: "Agrega al menos un item.", variant: "destructive" }); return; }

    try {
      setSaving(true);
      await createBillingInvoice({
        businessId: selectedBusiness.id,
        documentType: form.documentType,
        serie,
        numero,
        customerName,
        customerDocumentType: form.customerDocumentType,
        customerDocumentNumber: customerDoc,
        issueDate: issueDateRaw.toISOString(),
        dueDate: dueDateRaw ? dueDateRaw.toISOString() : undefined,
        items: items.map((item) => ({
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          taxRate: item.taxRate,
        })),
      });
      await loadInvoices();
      toast({ title: `${form.documentType} emitida`, description: `${serie}-${numero} registrada.` });
      setEmitOpen(false);
      setForm(emptyForm());
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.message || "No se pudo emitir el comprobante.",
        variant: "destructive",
      });
    } finally { setSaving(false); }
  };

  const markPaid = async (invoice: Invoice) => {
    if (!user?.uid || !selectedBusiness?.id) return;
    try {
      await markBillingInvoicePaid({
        businessId: selectedBusiness.id,
        invoiceId: invoice.id,
        paymentDate: today(),
      });
      await loadInvoices();
      toast({ title: "Factura pagada", description: `${invoice.serie}-${invoice.numero} actualizada.` });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.message || "No se pudo actualizar la factura.",
        variant: "destructive",
      });
    }
  };

  const validateCpeForInvoice = async (invoice: Invoice) => {
    if (!user?.uid || !selectedBusiness?.id) return;
    try {
      setEmittingCpeId(invoice.id);
      const response = await emitBillingCpe({
        businessId: selectedBusiness.id,
        invoiceId: invoice.id,
      });
      await loadInvoices();
      const status = response.result?.status || "RECHAZADO";
      toast({
        title: "Validacion BETA lista",
        description: `${invoice.serie}-${invoice.numero}: ${status}.`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.message || "No se pudo validar CPE (BETA).",
        variant: "destructive",
      });
    } finally {
      setEmittingCpeId(null);
    }
  };

  const emitCpeProdForInvoice = async (invoice: Invoice) => {
    if (!user?.uid || !selectedBusiness?.id) return;
    const ok = typeof window !== "undefined"
      ? window.confirm(`Vas a emitir en SUNAT (PROD) el comprobante ${invoice.serie}-${invoice.numero}. Esto cuenta como emision real. Continuar?`)
      : true;
    if (!ok) return;

    try {
      setEmittingCpeId(invoice.id);
      const response = await emitBillingCpeProd({
        businessId: selectedBusiness.id,
        invoiceId: invoice.id,
      });
      await loadInvoices();
      const status = response.result?.status || "RECHAZADO";
      toast({
        title: "Emision PROD lista",
        description: `${invoice.serie}-${invoice.numero}: ${status}.`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.message || "No se pudo emitir CPE (PROD).",
        variant: "destructive",
      });
    } finally {
      setEmittingCpeId(null);
    }
  };

  const savePayment = async () => {
    if (!user?.uid || !selectedBusiness?.id || !payInvoice) return;
    const live = invoices.find((x) => x.id === payInvoice.id) || payInvoice;
    const amount = round2(n(payForm.amount));
    if (amount <= 0) { toast({ title: "Monto invalido", description: "Ingresa un monto mayor a cero.", variant: "destructive" }); return; }
    if (amount > live.balance) { toast({ title: "Monto excedido", description: `El abono no puede superar ${f(live.balance)}.`, variant: "destructive" }); return; }
    const payDate = new Date(`${payForm.paymentDate}T00:00:00`);
    if (Number.isNaN(payDate.getTime())) { toast({ title: "Fecha invalida", description: "Selecciona fecha valida.", variant: "destructive" }); return; }

    try {
      setSavingPay(true);
      const result = await registerBillingPayment({
        businessId: selectedBusiness.id,
        invoiceId: live.id,
        amount,
        paymentDate: payDate.toISOString(),
        note: payForm.note.trim(),
      });
      await Promise.all([loadInvoices(), loadPayments(live.id)]);
      toast({ title: "Abono registrado", description: `Se registro ${f(amount)}.` });
      if (result.balance === 0) setPayOpen(false);
      else setPayForm(emptyPay());
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.message || "No se pudo registrar el abono.",
        variant: "destructive",
      });
    } finally { setSavingPay(false); }
  };

  const exportCsv = () => {
    if (typeof window === "undefined") return;
    if (invoices.length === 0) { toast({ title: "Sin datos", description: "No hay comprobantes para exportar." }); return; }
    const headers = ["Tipo","Serie","Numero","Cliente","TipoDocCliente","DocCliente","Emision","Vencimiento","Subtotal","IGV","Total","Pagado","Saldo","EstadoPago","EstadoCPE","TicketCPE","CodigoCPE"];
    const rows = invoices.map((x) => [x.documentType, x.serie, x.numero, x.customerName, x.customerDocumentType, x.customerDocumentNumber, d(x.issueDate), d(x.dueDate), x.subtotal.toFixed(2), x.igv.toFixed(2), x.total.toFixed(2), x.paidAmount.toFixed(2), x.balance.toFixed(2), effective(x), effectiveCpeStatus(x), x.cpeTicket || "", x.cpeCode ?? ""]);
    const content = [headers, ...rows].map((row) => row.map((v) => csv(v)).join(",")).join("\n");
    const blob = new Blob([`\uFEFF${content}`], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `facturacion-${selectedBusiness?.name || "negocio"}-${today()}.csv`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    toast({ title: "Exportacion lista", description: "CSV descargado." });
  };

  if (businessLoading) return <div className="flex min-h-[260px] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-accent" /></div>;

  if (!selectedBusiness) {
    return <Card className="border-dashed border-muted-foreground/30"><CardContent className="flex flex-col gap-3 p-6 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between"><span>Selecciona o crea un negocio para emitir comprobantes.</span><Button asChild size="sm" className="w-full bg-accent text-accent-foreground hover:bg-accent/90 sm:w-auto"><Link to="/dashboard/negocios">Ir a Mis Negocios</Link></Button></CardContent></Card>;
  }

  const issuerReady = Boolean(selectedBusiness.addressLine1 && selectedBusiness.ubigeo);
  const cpeReady = issuerReady && certStatus.state !== "missing";
  const cpeBlockReason = !issuerReady
    ? "Faltan datos del emisor (direccion/ubigeo). Configuralos en Configuracion."
    : certStatus.state === "missing"
      ? "Falta el certificado digital (.pfx/.p12). Configuralo en Configuracion."
      : null;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Facturacion</h1>
          <p className="text-sm text-muted-foreground">Emision de facturas/boletas, pendientes y abonos parciales.</p>
        </div>
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
          <Button variant="outline" className="w-full gap-2 sm:w-auto" onClick={exportCsv}><Download className="h-4 w-4" /> Exportar CSV</Button>
          <Button className="w-full gap-2 bg-accent text-accent-foreground hover:bg-accent/90 sm:w-auto" onClick={() => { setForm(emptyForm()); setEmitOpen(true); }}><Plus className="h-4 w-4" /> Emitir factura/boleta</Button>
        </div>
      </div>

      <Card className="border-emerald-200 bg-emerald-50/70">
        <CardContent className="space-y-2 p-4 text-sm text-emerald-900">
          <p>La emision, cobranza y envio CPE usan API backend + worker SUNAT. Puedes emitir o reenviar CPE por comprobante.</p>
          {!cpeReady ? (
            <p className="text-amber-900">
              Para enviar CPE: {cpeBlockReason} {certStatus.filename ? `Certificado actual: ${certStatus.filename}.` : ""}
            </p>
          ) : null}
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card className="shadow-card border-border"><CardContent className="p-5"><p className="text-sm text-muted-foreground">Ventas del mes</p><p className="font-display text-2xl font-bold text-foreground">{f(dashboard.sales)}</p></CardContent></Card>
        <Card className="shadow-card border-border"><CardContent className="p-5"><p className="text-sm text-muted-foreground">Clientes activos</p><p className="font-display text-2xl font-bold text-foreground">{dashboard.customers}</p></CardContent></Card>
        <Card className="shadow-card border-border"><CardContent className="p-5"><p className="text-sm text-muted-foreground">Productos vendidos</p><p className="font-display text-2xl font-bold text-foreground">{dashboard.products}</p></CardContent></Card>
        <Card className="shadow-card border-border border-amber-200 bg-amber-50/70"><CardContent className="p-5"><p className="text-sm text-amber-800">Facturas pendientes</p><p className="font-display text-2xl font-bold text-amber-900">{dashboard.pendingCount}</p><p className="mt-1 text-xs text-amber-800">Saldo: {f(dashboard.pendingAmount)}</p></CardContent></Card>
      </div>

      <Card className="shadow-card border-border">
        <CardHeader><CardTitle className="font-display text-lg">Facturas pendientes</CardTitle></CardHeader>
        <CardContent>
          {loading ? <div className="flex min-h-[120px] items-center justify-center"><Loader2 className="h-5 w-5 animate-spin text-accent" /></div> : pending.length === 0 ? <p className="text-sm text-muted-foreground">No hay facturas pendientes.</p> : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader><TableRow><TableHead>Documento</TableHead><TableHead>Cliente</TableHead><TableHead>Vence</TableHead><TableHead className="text-right">Pagado</TableHead><TableHead className="text-right">Saldo</TableHead><TableHead>Estado</TableHead><TableHead>Estado CPE</TableHead><TableHead className="text-right">Accion</TableHead></TableRow></TableHeader>
                <TableBody>
                  {pending.map((x) => (
                    <TableRow key={x.id}>
                      <TableCell className="font-medium">{x.documentType} {x.serie}-{x.numero}</TableCell>
                      <TableCell>{x.customerName}</TableCell>
                      <TableCell>{d(x.dueDate)}</TableCell>
                      <TableCell className="text-right">{f(x.paidAmount)}</TableCell>
                      <TableCell className="text-right">{f(x.balance)}</TableCell>
                      <TableCell><Badge className={badgeClass(x.e as PayStatus)}>{x.e}</Badge></TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge className={cpeBadgeClass(effectiveCpeBetaStatus(x))}>BETA: {effectiveCpeBetaStatus(x)}</Badge>
                            <Badge className={cpeBadgeClass(effectiveCpeStatus(x))}>PROD: {effectiveCpeStatus(x)}</Badge>
                          </div>
                          {x.cpeBetaCode || x.cpeBetaDescription ? (
                            <p className="break-words text-xs text-muted-foreground">
                              BETA: {x.cpeBetaCode ? `Codigo ${x.cpeBetaCode}. ` : ""}{x.cpeBetaDescription || ""}
                            </p>
                          ) : null}
                          {x.cpeBetaError ? <p className="break-words text-xs text-red-600">BETA: {x.cpeBetaError}</p> : null}
                          {x.cpeCode || x.cpeDescription ? (
                            <p className="break-words text-xs text-muted-foreground">
                              PROD: {x.cpeCode ? `Codigo ${x.cpeCode}. ` : ""}{x.cpeDescription || ""}
                            </p>
                          ) : null}
                          {x.cpeError ? <p className="break-words text-xs text-red-600">PROD: {x.cpeError}</p> : null}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex flex-wrap justify-end gap-2">
                          <Button size="sm" variant="outline" onClick={() => { setPayInvoice(x); setPayForm(emptyPay()); setPayOpen(true); }}>
                            Registrar abono
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => markPaid(x)}>
                            Pagar total
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => validateCpeForInvoice(x)}
                            disabled={!cpeReady || emittingCpeId === x.id}
                            title={!cpeReady ? cpeBlockReason || "Configura SUNAT para validar CPE" : undefined}
                          >
                            {emittingCpeId === x.id ? (
                              <span className="inline-flex items-center gap-1">
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                Validando
                              </span>
                            ) : (
                              "Validar BETA"
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => emitCpeProdForInvoice(x)}
                            disabled={!cpeReady || effectiveCpeBetaStatus(x) !== "ACEPTADO" || emittingCpeId === x.id}
                            title={
                              !cpeReady
                                ? cpeBlockReason || "Configura SUNAT para emitir CPE"
                                : effectiveCpeBetaStatus(x) !== "ACEPTADO"
                                  ? "Primero valida en BETA (debe quedar ACEPTADO)"
                                  : undefined
                            }
                          >
                            {emittingCpeId === x.id ? (
                              <span className="inline-flex items-center gap-1">
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                Emitiendo
                              </span>
                            ) : (
                              "Emitir PROD"
                            )}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={emitOpen} onOpenChange={setEmitOpen}>
        <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-3xl">
          <DialogHeader><DialogTitle className="font-display">Emitir factura o boleta</DialogTitle><DialogDescription>Registra comprobantes con cliente, items, total e IGV.</DialogDescription></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-2"><Label htmlFor="doc-type">Tipo</Label><Select value={form.documentType} onValueChange={(v) => setForm((prev) => ({ ...prev, documentType: v as DocType, serie: v === "FACTURA" ? "F001" : "B001" }))}><SelectTrigger id="doc-type"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="FACTURA">Factura</SelectItem><SelectItem value="BOLETA">Boleta</SelectItem></SelectContent></Select></div>
              <div className="space-y-2"><Label htmlFor="serie">Serie</Label><Input id="serie" value={form.serie} onChange={(e) => setForm((prev) => ({ ...prev, serie: e.target.value.toUpperCase() }))} /></div>
              <div className="space-y-2"><Label htmlFor="numero">Numero</Label><Input id="numero" value={form.numero} onChange={(e) => setForm((prev) => ({ ...prev, numero: e.target.value.toUpperCase() }))} /></div>
              <div className="space-y-2 sm:col-span-2"><Label htmlFor="customer-name">Cliente</Label><Input id="customer-name" value={form.customerName} onChange={(e) => setForm((prev) => ({ ...prev, customerName: e.target.value }))} /></div>
              <div className="space-y-2"><Label htmlFor="customer-doc-type">Tipo doc</Label><Select value={form.customerDocumentType} onValueChange={(v) => setForm((prev) => ({ ...prev, customerDocumentType: v as CustomerDoc }))}><SelectTrigger id="customer-doc-type"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="RUC">RUC</SelectItem><SelectItem value="DNI">DNI</SelectItem><SelectItem value="OTRO">OTRO</SelectItem></SelectContent></Select></div>
              <div className="space-y-2"><Label htmlFor="customer-doc">Numero doc</Label><Input id="customer-doc" value={form.customerDocumentNumber} onChange={(e) => setForm((prev) => ({ ...prev, customerDocumentNumber: e.target.value }))} /></div>
              <div className="space-y-2"><Label htmlFor="issue-date">Emision</Label><Input id="issue-date" type="date" value={form.issueDate} onChange={(e) => setForm((prev) => ({ ...prev, issueDate: e.target.value }))} /></div>
              <div className="space-y-2"><Label htmlFor="due-date">Vencimiento</Label><Input id="due-date" type="date" value={form.dueDate} onChange={(e) => setForm((prev) => ({ ...prev, dueDate: e.target.value }))} /></div>
            </div>

            <div className="space-y-3 rounded-xl border border-border p-4">
              <div className="flex items-center justify-between"><p className="text-sm font-medium text-foreground">Items</p><Button type="button" variant="outline" size="sm" className="gap-1" onClick={() => setForm((prev) => ({ ...prev, items: [...prev.items, emptyItem()] }))}><Plus className="h-3.5 w-3.5" /> Agregar item</Button></div>
              {form.items.map((item, i) => (
                <div key={`item-${i}`} className="grid gap-2 rounded-lg border border-border p-3 md:grid-cols-12">
                  <div className="space-y-1 md:col-span-6"><Label htmlFor={`item-desc-${i}`} className="text-xs text-muted-foreground">Descripcion</Label><Input id={`item-desc-${i}`} value={item.description} onChange={(e) => updateItem(i, "description", e.target.value)} /></div>
                  <div className="space-y-1 md:col-span-2"><Label htmlFor={`item-qty-${i}`} className="text-xs text-muted-foreground">Cant.</Label><Input id={`item-qty-${i}`} value={item.quantity} inputMode="decimal" onChange={(e) => updateItem(i, "quantity", e.target.value)} /></div>
                  <div className="space-y-1 md:col-span-2"><Label htmlFor={`item-price-${i}`} className="text-xs text-muted-foreground">Precio</Label><Input id={`item-price-${i}`} value={item.unitPrice} inputMode="decimal" onChange={(e) => updateItem(i, "unitPrice", e.target.value)} /></div>
                  <div className="space-y-1 md:col-span-1"><Label htmlFor={`item-tax-${i}`} className="text-xs text-muted-foreground">IGV</Label><Input id={`item-tax-${i}`} value={item.taxRate} inputMode="decimal" onChange={(e) => updateItem(i, "taxRate", e.target.value)} /></div>
                  <div className="flex items-end md:col-span-1"><Button type="button" variant="outline" className="w-full" disabled={form.items.length === 1} onClick={() => setForm((prev) => ({ ...prev, items: prev.items.filter((_, idx) => idx !== i) }))}>Quitar</Button></div>
                </div>
              ))}
              <div className="grid gap-2 border-t border-border pt-3 text-sm sm:grid-cols-3">
                <div className="rounded-lg bg-muted/40 p-3"><p className="text-xs text-muted-foreground">Subtotal</p><p className="font-semibold text-foreground">{f(totals.subtotal)}</p></div>
                <div className="rounded-lg bg-muted/40 p-3"><p className="text-xs text-muted-foreground">IGV</p><p className="font-semibold text-foreground">{f(totals.igv)}</p></div>
                <div className="rounded-lg bg-accent/10 p-3"><p className="text-xs text-muted-foreground">Total</p><p className="font-semibold text-accent">{f(totals.total)}</p></div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEmitOpen(false)} disabled={saving}>Cancelar</Button>
            <Button onClick={saveInvoice} disabled={saving} className="gap-2 bg-accent text-accent-foreground hover:bg-accent/90">{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}{saving ? "Emitiendo..." : "Emitir comprobante"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={payOpen} onOpenChange={setPayOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader><DialogTitle className="font-display">Registrar abono</DialogTitle><DialogDescription>{payInvoice ? `Factura ${payInvoice.serie}-${payInvoice.numero} de ${payInvoice.customerName}` : "Registra un pago parcial o total."}</DialogDescription></DialogHeader>
          <div className="space-y-4 py-2">
            {payInvoice ? <div className="grid gap-3 rounded-lg border border-border bg-muted/20 p-3 sm:grid-cols-3"><div><p className="text-xs text-muted-foreground">Total</p><p className="font-semibold text-foreground">{f(payInvoice.total)}</p></div><div><p className="text-xs text-muted-foreground">Pagado</p><p className="font-semibold text-foreground">{f(payInvoice.paidAmount)}</p></div><div><p className="text-xs text-muted-foreground">Saldo</p><p className="font-semibold text-accent">{f(payInvoice.balance)}</p></div></div> : null}
            <div className="grid gap-3 sm:grid-cols-2"><div className="space-y-2"><Label htmlFor="payment-amount">Monto del abono</Label><Input id="payment-amount" inputMode="decimal" value={payForm.amount} onChange={(e) => setPayForm((prev) => ({ ...prev, amount: e.target.value }))} placeholder="0.00" /></div><div className="space-y-2"><Label htmlFor="payment-date">Fecha de pago</Label><Input id="payment-date" type="date" value={payForm.paymentDate} onChange={(e) => setPayForm((prev) => ({ ...prev, paymentDate: e.target.value }))} /></div></div>
            <div className="space-y-2"><Label htmlFor="payment-note">Nota (opcional)</Label><Input id="payment-note" value={payForm.note} onChange={(e) => setPayForm((prev) => ({ ...prev, note: e.target.value }))} placeholder="Transferencia, efectivo, etc." /></div>
            <div className="rounded-lg border border-border p-3"><p className="mb-2 text-sm font-medium text-foreground">Historial de abonos</p>{loadingPayments ? <div className="flex items-center justify-center py-6"><Loader2 className="h-5 w-5 animate-spin text-accent" /></div> : payments.length === 0 ? <p className="text-sm text-muted-foreground">Sin abonos registrados.</p> : <div className="space-y-2">{payments.map((x) => <div key={x.id} className="rounded-md border border-border p-2"><p className="text-sm font-medium text-foreground">{f(x.amount)}</p><p className="text-xs text-muted-foreground">{d(x.paymentDate || x.createdAt)}</p>{x.note ? <p className="text-xs text-muted-foreground">{x.note}</p> : null}</div>)}</div>}</div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setPayOpen(false)} disabled={savingPay}>Cerrar</Button><Button onClick={savePayment} disabled={savingPay} className="gap-2">{savingPay ? <Loader2 className="h-4 w-4 animate-spin" /> : null}Registrar abono</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Facturacion;
