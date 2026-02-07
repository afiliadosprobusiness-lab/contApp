import { useEffect, useState } from "react";
import { User, Building2, Save, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/AuthContext";
import { useBusiness } from "@/contexts/BusinessContext";
import { useToast } from "@/hooks/use-toast";
import { doc, serverTimestamp, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { updateProfile } from "firebase/auth";
import { saveSunatCredentials } from "@/lib/sunat";

const Configuracion = () => {
  const { user, userProfile, loading } = useAuth();
  const { selectedBusiness } = useBusiness();
  const { toast } = useToast();
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingSunat, setSavingSunat] = useState(false);
  const [profileForm, setProfileForm] = useState({
    displayName: "",
    phone: "",
  });
  const [sunatForm, setSunatForm] = useState({
    solUser: "",
    solPassword: "",
  });

  useEffect(() => {
    if (!userProfile) return;
    setProfileForm({
      displayName: userProfile.displayName || "",
      phone: userProfile.phone || "",
    });
  }, [userProfile]);

  useEffect(() => {
    if (!selectedBusiness) return;
    setSunatForm({
      solUser: selectedBusiness.sunatSecondaryUser || "",
      solPassword: "",
    });
  }, [selectedBusiness]);

  const handleSaveProfile = async () => {
    if (!user?.uid) return;
    try {
      setSavingProfile(true);
      await updateDoc(doc(db, "users", user.uid), {
        displayName: profileForm.displayName.trim(),
        phone: profileForm.phone.trim(),
        updatedAt: serverTimestamp(),
      });

      if (profileForm.displayName.trim() && user.displayName !== profileForm.displayName.trim()) {
        await updateProfile(user, { displayName: profileForm.displayName.trim() });
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
      setSavingProfile(false);
    }
  };

  const handleSaveSunat = async () => {
    if (!user?.uid || !selectedBusiness) return;
    if (!sunatForm.solUser.trim() || !sunatForm.solPassword.trim()) {
      toast({
        title: "Datos incompletos",
        description: "Ingresa usuario y clave SOL",
        variant: "destructive",
      });
      return;
    }

    try {
      setSavingSunat(true);
      await saveSunatCredentials({
        businessId: selectedBusiness.id,
        ruc: selectedBusiness.ruc,
        solUser: sunatForm.solUser.trim(),
        solPassword: sunatForm.solPassword.trim(),
      });

      await updateDoc(doc(db, "users", user.uid, "businesses", selectedBusiness.id), {
        sunatSecondaryUser: sunatForm.solUser.trim(),
        updatedAt: serverTimestamp(),
      });

      setSunatForm((prev) => ({ ...prev, solPassword: "" }));
      toast({
        title: "Credenciales guardadas",
        description: "Se guardaron en el servidor de forma segura",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.message || "No se pudo guardar SUNAT",
        variant: "destructive",
      });
    } finally {
      setSavingSunat(false);
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
              <Input value={profileForm.displayName} onChange={(e) => setProfileForm({ ...profileForm, displayName: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Correo electronico</Label>
              <Input value={userProfile?.email || ""} disabled />
            </div>
            <div className="space-y-2">
              <Label>Telefono</Label>
              <Input value={profileForm.phone} onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })} />
            </div>
          </div>
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2" onClick={handleSaveProfile} disabled={savingProfile}>
            <Save className="w-4 h-4" /> {savingProfile ? "Guardando..." : "Guardar Cambios"}
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

          {!selectedBusiness ? (
            <div className="text-sm text-muted-foreground">Selecciona un negocio para configurar SUNAT.</div>
          ) : (
            <>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>RUC</Label>
                  <Input value={selectedBusiness.ruc} disabled />
                </div>
                <div className="space-y-2">
                  <Label>Negocio</Label>
                  <Input value={selectedBusiness.name} disabled />
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Usuario Secundario</Label>
                  <Input
                    placeholder="MODDATOS"
                    value={sunatForm.solUser}
                    onChange={(e) => setSunatForm({ ...sunatForm, solUser: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Clave SOL Secundaria</Label>
                  <Input
                    type="password"
                    placeholder="********"
                    value={sunatForm.solPassword}
                    onChange={(e) => setSunatForm({ ...sunatForm, solPassword: e.target.value })}
                  />
                </div>
              </div>
              <a href="#" className="text-sm text-accent hover:underline">
                Como crear tu Usuario Secundario en SUNAT? (2 minutos)
              </a>
              <Separator />
              <Button className="bg-accent text-accent-foreground hover:bg-accent/90" onClick={handleSaveSunat} disabled={savingSunat}>
                {savingSunat ? "Guardando..." : "Guardar credenciales"}
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Configuracion;
