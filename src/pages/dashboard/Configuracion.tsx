import { useEffect, useState } from "react";
import { User, Building2, Save, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { doc, serverTimestamp, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { updateProfile } from "firebase/auth";

const Configuracion = () => {
  const { user, userProfile, loading } = useAuth();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    displayName: "",
    phone: "",
    sunatSecondaryUser: "",
    sunatSecondaryPassword: "",
  });

  useEffect(() => {
    if (!userProfile) return;
    setForm({
      displayName: userProfile.displayName || "",
      phone: userProfile.phone || "",
      sunatSecondaryUser: userProfile.sunatSecondaryUser || "",
      sunatSecondaryPassword: userProfile.sunatSecondaryPassword || "",
    });
  }, [userProfile]);

  const handleSaveProfile = async () => {
    if (!user?.uid) return;
    try {
      setSaving(true);
      await updateDoc(doc(db, "users", user.uid), {
        displayName: form.displayName.trim(),
        phone: form.phone.trim(),
        sunatSecondaryUser: form.sunatSecondaryUser.trim(),
        sunatSecondaryPassword: form.sunatSecondaryPassword.trim(),
        updatedAt: serverTimestamp(),
      });

      if (form.displayName.trim() && user.displayName !== form.displayName.trim()) {
        await updateProfile(user, { displayName: form.displayName.trim() });
      }

      toast({
        title: "Cambios guardados",
        description: "Tu perfil se actualizo correctamente",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron guardar los cambios",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

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
        <h1 className="font-display text-2xl font-bold text-foreground">Configuracion</h1>
        <p className="text-sm text-muted-foreground">Perfil de usuario y datos de empresa</p>
      </div>

      <Card className="shadow-card border-border">
        <CardHeader>
          <CardTitle className="font-display text-lg flex items-center gap-2">
            <User className="w-5 h-5 text-primary" /> Datos Personales
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Nombre completo</Label>
              <Input value={form.displayName} onChange={(e) => setForm({ ...form, displayName: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Correo electronico</Label>
              <Input value={userProfile?.email || ""} disabled />
            </div>
            <div className="space-y-2">
              <Label>Telefono</Label>
              <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </div>
          </div>
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2" onClick={handleSaveProfile} disabled={saving}>
            <Save className="w-4 h-4" /> {saving ? "Guardando..." : "Guardar Cambios"}
          </Button>
        </CardContent>
      </Card>

      <Card className="shadow-card border-border">
        <CardHeader>
          <CardTitle className="font-display text-lg flex items-center gap-2">
            <Building2 className="w-5 h-5 text-primary" /> Conexion SUNAT
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Configura tu Usuario Secundario para sincronizar comprobantes automaticamente.
          </p>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Usuario Secundario</Label>
              <Input
                placeholder="MODDATOS"
                value={form.sunatSecondaryUser}
                onChange={(e) => setForm({ ...form, sunatSecondaryUser: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Clave SOL Secundaria</Label>
              <Input
                type="password"
                placeholder="********"
                value={form.sunatSecondaryPassword}
                onChange={(e) => setForm({ ...form, sunatSecondaryPassword: e.target.value })}
              />
            </div>
          </div>
          <a href="#" className="text-sm text-accent hover:underline">
            Como crear tu Usuario Secundario en SUNAT? (2 minutos)
          </a>
          <Separator />
          <Button className="bg-accent text-accent-foreground hover:bg-accent/90" onClick={handleSaveProfile} disabled={saving}>
            Guardar y sincronizar
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Configuracion;
