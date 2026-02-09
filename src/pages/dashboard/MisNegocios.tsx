import { useEffect, useMemo, useState } from "react";
import { Building2, Plus, Trash2, Edit, AlertTriangle, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useBusiness } from "@/contexts/BusinessContext";
import { addDoc, collection, deleteDoc, doc, serverTimestamp, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { lookupRuc } from "@/lib/sunat";

const BUSINESS_TYPES = ["Persona Natural", "EIRL", "SAC", "SRL", "SAA", "SA", "Cooperativa", "Otro"];

const normalizeRuc = (value: string) => value.replace(/\D/g, "").slice(0, 11);

const isValidRuc = (ruc: string) => {
  if (!/^\d{11}$/.test(ruc)) return false;
  const weights = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2];
  const sum = weights.reduce((acc, weight, index) => acc + Number(ruc[index]) * weight, 0);
  const remainder = 11 - (sum % 11);
  const expected = remainder === 11 ? 1 : remainder === 10 ? 0 : remainder;
  return expected === Number(ruc[10]);
};

const mapRucType = (value?: string) => {
  if (!value) return "";
  const normalized = value.toUpperCase();
  if (normalized.includes("PERSONA")) return "Persona Natural";
  if (normalized.includes("EIRL")) return "EIRL";
  if (normalized.includes("SAC")) return "SAC";
  if (normalized.includes("SRL")) return "SRL";
  if (normalized.includes("SAA")) return "SAA";
  if (normalized === "SA" || normalized.includes("S.A")) return "SA";
  if (normalized.includes("JURIDIC")) return "Otro";
  if (normalized.includes("COOPERAT")) return "Cooperativa";
  return "Otro";
};

const mapRucStatus = (value?: string) => {
  if (!value) return "";
  const normalized = value.toUpperCase();
  if (normalized.includes("ACTIVO")) return "ACTIVE";
  if (normalized.includes("INACT")) return "INACTIVE";
  if (normalized.includes("BAJA")) return "INACTIVE";
  if (normalized.includes("SUSP")) return "INACTIVE";
  return "INACTIVE";
};

const MisNegocios = () => {
  const { user, userProfile } = useAuth();
  const { businesses, loading: businessesLoading } = useBusiness();
  const { toast } = useToast();
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    ruc: "",
    name: "",
    type: "",
    status: "ACTIVE",
  });
  const [rucLookup, setRucLookup] = useState<{ status: "idle" | "loading" | "success" | "error"; message: string }>(
    {
      status: "idle",
      message: "",
    }
  );

  const planLimit = useMemo(() => {
    if (userProfile?.role === "ADMIN") return Number.POSITIVE_INFINITY;
    if (userProfile?.plan === "PLUS") return Number.POSITIVE_INFINITY;
    if (userProfile?.plan === "PRO") return 2;
    return 1;
  }, [userProfile?.plan, userProfile?.role]);

  const limitReached = businesses.length >= planLimit;
  const limitText = planLimit === Number.POSITIVE_INFINITY ? "ilimitados" : planLimit.toString();

  const resetForm = () => {
    setForm({ ruc: "", name: "", type: "", status: "ACTIVE" });
    setRucLookup({ status: "idle", message: "" });
    setEditingId(null);
  };

  const openNewDialog = () => {
    if (limitReached) {
      setShowUpgrade(true);
      return;
    }
    resetForm();
    setDialogOpen(true);
  };

  const openEditDialog = (id: string) => {
    const business = businesses.find((b) => b.id === id);
    if (!business) return;
    setForm({
      ruc: business.ruc,
      name: business.name,
      type: business.type === "Sin tipo" ? "" : business.type,
      status: business.status,
    });
    setRucLookup({ status: "idle", message: "" });
    setEditingId(id);
    setDialogOpen(true);
  };

  useEffect(() => {
    if (!dialogOpen) return;
    const ruc = form.ruc;

    if (!ruc) {
      setRucLookup({ status: "idle", message: "" });
      return;
    }

    if (ruc.length < 11) {
      setRucLookup({ status: "idle", message: "Ingresa 11 digitos para validar el RUC." });
      return;
    }

    if (!isValidRuc(ruc)) {
      setRucLookup({ status: "error", message: "RUC invalido. Revisa los digitos." });
      return;
    }

    let cancelled = false;
    const timeout = setTimeout(async () => {
      setRucLookup({ status: "loading", message: "Buscando datos del RUC en SUNAT..." });
      try {
        const response = await lookupRuc({ ruc });
        if (cancelled) return;
        const data = response?.data ?? response;
        setForm((prev) => ({
          ...prev,
          name: data?.name?.trim() ? data.name : prev.name,
          type: mapRucType(data?.type) || prev.type,
          status: mapRucStatus(data?.status) || prev.status,
        }));
        setRucLookup({ status: "success", message: "Datos encontrados. Puedes editar si es necesario." });
      } catch (error) {
        if (cancelled) return;
        setRucLookup({
          status: "error",
          message: error instanceof Error ? error.message : "No se pudo consultar el RUC.",
        });
      }
    }, 500);

    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, [dialogOpen, form.ruc]);

  const handleSave = async () => {
    if (!user?.uid) return;
    if (!form.ruc.trim() || !form.name.trim()) {
      toast({
        title: "Datos incompletos",
        description: "RUC y nombre son obligatorios",
        variant: "destructive",
      });
      return;
    }
    if (!isValidRuc(form.ruc.trim())) {
      toast({
        title: "RUC invalido",
        description: "Ingresa un RUC valido de 11 digitos",
        variant: "destructive",
      });
      return;
    }

    try {
      setSaving(true);
      if (editingId) {
        await updateDoc(doc(db, "users", user.uid, "businesses", editingId), {
          ruc: form.ruc.trim(),
          name: form.name.trim(),
          type: form.type.trim(),
          status: form.status,
          updatedAt: serverTimestamp(),
        });
        toast({ title: "Negocio actualizado", description: "Cambios guardados correctamente" });
      } else {
        await addDoc(collection(db, "users", user.uid, "businesses"), {
          ruc: form.ruc.trim(),
          name: form.name.trim(),
          type: form.type.trim(),
          status: form.status,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        toast({ title: "Negocio creado", description: "Negocio agregado correctamente" });
      }
      setDialogOpen(false);
      resetForm();
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo guardar el negocio",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!user?.uid) return;
    if (!confirm(`Eliminar el negocio "${name}"?`)) return;
    try {
      await deleteDoc(doc(db, "users", user.uid, "businesses", id));
      toast({ title: "Negocio eliminado", description: "Se elimino correctamente" });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo eliminar el negocio",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Mis Negocios</h1>
          <p className="text-sm text-muted-foreground">
            Gestiona los RUCs vinculados a tu cuenta ({businesses.length}/{limitText})
          </p>
        </div>
        <Button
          className="bg-accent text-accent-foreground hover:bg-accent/90 gap-2"
          onClick={openNewDialog}
          disabled={businessesLoading}
        >
          <Plus className="w-4 h-4" /> Anadir Negocio
        </Button>
      </div>

      {businessesLoading ? (
        <div className="flex items-center justify-center min-h-[200px]">
          <Loader2 className="w-8 h-8 animate-spin text-accent" />
        </div>
      ) : businesses.length === 0 ? (
        <Card className="border-dashed border-muted-foreground/30">
          <CardContent className="p-6 text-sm text-muted-foreground">
            Aun no tienes negocios registrados. Agrega tu primer RUC para comenzar.
          </CardContent>
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {businesses.map((neg) => (
            <Card key={neg.id} className="shadow-card border-border">
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-primary" />
                  </div>
                  <Badge
                    variant="secondary"
                    className={
                      neg.status === "ACTIVE" ? "bg-emerald-light text-accent text-xs" : "bg-muted text-xs"
                    }
                  >
                    {neg.status === "ACTIVE" ? "Activo" : "Inactivo"}
                  </Badge>
                </div>
                <h3 className="font-display font-semibold text-foreground mb-1">{neg.name}</h3>
                <p className="text-sm text-muted-foreground mb-1">RUC: {neg.ruc}</p>
                <p className="text-xs text-muted-foreground mb-4">Tipo: {neg.type || "-"}</p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="gap-1" onClick={() => openEditDialog(neg.id)}>
                    <Edit className="w-3 h-3" /> Editar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1 text-destructive hover:text-destructive"
                    onClick={() => handleDelete(neg.id, neg.name)}
                  >
                    <Trash2 className="w-3 h-3" /> Eliminar
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-display">{editingId ? "Editar negocio" : "Nuevo negocio"}</DialogTitle>
            <DialogDescription>
              Ingresa el RUC y completaremos los datos disponibles automaticamente. Puedes editarlos si lo necesitas.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>RUC</Label>
              <div className="relative">
                <Input
                  value={form.ruc}
                  onChange={(e) => setForm((prev) => ({ ...prev, ruc: normalizeRuc(e.target.value) }))}
                  placeholder="Ingresa 11 digitos"
                  className={rucLookup.status === "loading" ? "pr-9" : undefined}
                />
                {rucLookup.status === "loading" ? (
                  <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
                ) : null}
              </div>
              {rucLookup.message ? (
                <p
                  className={`text-xs ${
                    rucLookup.status === "error"
                      ? "text-destructive"
                      : rucLookup.status === "success"
                        ? "text-emerald-600"
                        : "text-muted-foreground"
                  }`}
                >
                  {rucLookup.message}
                </p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label>Nombre o razon social</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Tipo</Label>
              <Select value={form.type} onValueChange={(value) => setForm({ ...form, type: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona el tipo de negocio" />
                </SelectTrigger>
                <SelectContent>
                  {BUSINESS_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Estado</Label>
              <Select value={form.status} onValueChange={(value) => setForm({ ...form, status: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACTIVE">Activo</SelectItem>
                  <SelectItem value="INACTIVE">Inactivo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              className="bg-accent text-accent-foreground hover:bg-accent/90"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? "Guardando..." : editingId ? "Guardar cambios" : "Crear negocio"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showUpgrade} onOpenChange={setShowUpgrade}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mx-auto mb-2">
              <AlertTriangle className="w-6 h-6 text-accent" />
            </div>
            <AlertDialogTitle className="text-center font-display">Desbloquea negocios ilimitados</AlertDialogTitle>
            <AlertDialogDescription className="text-center">
              Has alcanzado el limite de negocios de tu plan. Actualiza a Plan PLUS para gestionar negocios ilimitados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="sm:justify-center">
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction className="bg-accent text-accent-foreground hover:bg-accent/90">
              Upgrade a Plan PLUS
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default MisNegocios;
