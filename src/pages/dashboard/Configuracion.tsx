import { useEffect, useMemo, useState } from "react";
import { User, Building2, Save, Loader2, Shield } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";
import { useBusiness } from "@/contexts/BusinessContext";
import { useToast } from "@/hooks/use-toast";
import { doc, serverTimestamp, updateDoc } from "firebase/firestore";
import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  reauthenticateWithPopup,
  updateEmail,
  updatePassword,
  updateProfile,
} from "firebase/auth";
import { auth, db, googleProvider } from "@/lib/firebase";
import { getSunatCertificateStatus, saveSunatCertificate, saveSunatCredentials } from "@/lib/sunat";

const mapFirebaseError = (error: any) => {
  const code = error?.code || "";
  const map: Record<string, string> = {
    "auth/requires-recent-login": "Por seguridad, vuelve a iniciar sesion y reintenta.",
    "auth/email-already-in-use": "Ese correo ya esta en uso.",
    "auth/invalid-email": "El correo no es valido.",
    "auth/wrong-password": "La contrasena actual no coincide.",
    "auth/weak-password": "La nueva contrasena debe tener al menos 6 caracteres.",
    "auth/popup-closed-by-user": "Se cerro la ventana de Google antes de confirmar.",
  };
  return map[code] || "No se pudo completar la accion.";
};

const Configuracion = () => {
  const { user, userProfile, loading } = useAuth();
  const { selectedBusiness } = useBusiness();
  const { toast } = useToast();
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [savingSunat, setSavingSunat] = useState(false);
  const [savingSunatCert, setSavingSunatCert] = useState(false);
  const [loadingSunatCert, setLoadingSunatCert] = useState(false);
  const [sunatGuideOpen, setSunatGuideOpen] = useState(false);
  const [sunatCertGuideOpen, setSunatCertGuideOpen] = useState(false);
  const [profileForm, setProfileForm] = useState({
    displayName: "",
    email: "",
    phone: "",
    currentPasswordForEmail: "",
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [sunatForm, setSunatForm] = useState({
    solUser: "",
    solPassword: "",
  });
  const [sunatCertForm, setSunatCertForm] = useState<{
    file: File | null;
    password: string;
    status: { configured: boolean; filename?: string | null; sizeBytes?: number | null } | null;
  }>({
    file: null,
    password: "",
    status: null,
  });
  const [issuerForm, setIssuerForm] = useState({
    addressLine1: "",
    ubigeo: "",
    department: "",
    province: "",
    district: "",
  });
  const [savingIssuer, setSavingIssuer] = useState(false);

  const readFileAsBase64 = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => reject(new Error("No se pudo leer el archivo"));
      reader.onload = () => {
        const result = String(reader.result || "");
        const marker = "base64,";
        const idx = result.indexOf(marker);
        if (idx < 0) return reject(new Error("Formato de archivo invalido"));
        resolve(result.slice(idx + marker.length));
      };
      reader.readAsDataURL(file);
    });

  const hasPasswordProvider = useMemo(() => {
    return Boolean(user?.providerData?.some((provider) => provider.providerId === "password"));
  }, [user]);

  useEffect(() => {
    if (!userProfile) return;
    setProfileForm({
      displayName: userProfile.displayName || "",
      email: userProfile.email || "",
      phone: userProfile.phone || "",
      currentPasswordForEmail: "",
    });
  }, [userProfile]);

  useEffect(() => {
    if (!selectedBusiness) return;
    setSunatForm({
      solUser: selectedBusiness.sunatSecondaryUser || "",
      solPassword: "",
    });
  }, [selectedBusiness]);

  useEffect(() => {
    if (!selectedBusiness) return;
    setIssuerForm({
      addressLine1: selectedBusiness.addressLine1 || "",
      ubigeo: selectedBusiness.ubigeo || "",
      department: selectedBusiness.department || "",
      province: selectedBusiness.province || "",
      district: selectedBusiness.district || "",
    });
  }, [selectedBusiness]);

  useEffect(() => {
    const businessId = selectedBusiness?.id;
    if (!businessId) {
      setSunatCertForm((prev) => ({ ...prev, status: null, file: null, password: "" }));
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        setLoadingSunatCert(true);
        const response = await getSunatCertificateStatus({ businessId });
        if (cancelled) return;
        setSunatCertForm((prev) => ({
          ...prev,
          status: { configured: !!response.configured, filename: response.filename ?? null, sizeBytes: response.sizeBytes ?? null },
        }));
      } catch {
        if (cancelled) return;
        setSunatCertForm((prev) => ({ ...prev, status: null }));
      } finally {
        if (!cancelled) setLoadingSunatCert(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [selectedBusiness?.id]);

  const reauthenticateUser = async (currentPassword?: string) => {
    const currentUser = auth.currentUser;
    if (!currentUser || !currentUser.email) throw new Error("auth/no-current-user");

    if (hasPasswordProvider) {
      const password = (currentPassword || "").trim();
      if (!password) throw new Error("auth/missing-current-password");
      const credential = EmailAuthProvider.credential(currentUser.email, password);
      await reauthenticateWithCredential(currentUser, credential);
      return;
    }

    await reauthenticateWithPopup(currentUser, googleProvider);
  };

  const handleSaveProfile = async () => {
    if (!user?.uid) return;

    const nextDisplayName = profileForm.displayName.trim();
    const nextPhone = profileForm.phone.trim();
    const nextEmail = profileForm.email.trim().toLowerCase();
    const currentEmail = (user.email || userProfile?.email || "").trim().toLowerCase();
    const emailChanged = !!nextEmail && nextEmail !== currentEmail;

    if (!nextEmail) {
      toast({
        title: "Correo requerido",
        description: "Ingresa un correo valido.",
        variant: "destructive",
      });
      return;
    }

    try {
      setSavingProfile(true);

      if (emailChanged) {
        if (hasPasswordProvider && !profileForm.currentPasswordForEmail.trim()) {
          toast({
            title: "Confirma tu identidad",
            description: "Ingresa tu contrasena actual para cambiar el correo.",
            variant: "destructive",
          });
          return;
        }

        await reauthenticateUser(profileForm.currentPasswordForEmail);
        await updateEmail(user, nextEmail);
      }

      await updateDoc(doc(db, "users", user.uid), {
        displayName: nextDisplayName || null,
        phone: nextPhone || null,
        email: nextEmail,
        updatedAt: serverTimestamp(),
      });

      if (user.displayName !== nextDisplayName) {
        await updateProfile(user, { displayName: nextDisplayName || null });
      }

      setProfileForm((prev) => ({ ...prev, currentPasswordForEmail: "" }));
      toast({
        title: "Perfil actualizado",
        description: "Tus datos se guardaron correctamente.",
      });
    } catch (error: any) {
      toast({
        title: "Error al guardar perfil",
        description:
          error?.message === "auth/missing-current-password"
            ? "Ingresa tu contrasena actual para continuar."
            : mapFirebaseError(error),
        variant: "destructive",
      });
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async () => {
    if (!user?.uid) return;
    const currentPassword = passwordForm.currentPassword.trim();
    const newPassword = passwordForm.newPassword.trim();
    const confirmPassword = passwordForm.confirmPassword.trim();

    if (!newPassword || !confirmPassword) {
      toast({
        title: "Datos incompletos",
        description: "Completa la nueva contrasena y su confirmacion.",
        variant: "destructive",
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: "Contrasena invalida",
        description: "La nueva contrasena debe tener al menos 6 caracteres.",
        variant: "destructive",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: "No coincide",
        description: "La confirmacion no coincide con la nueva contrasena.",
        variant: "destructive",
      });
      return;
    }

    try {
      setSavingPassword(true);
      await reauthenticateUser(currentPassword);
      await updatePassword(user, newPassword);

      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      toast({
        title: "Contrasena actualizada",
        description: "Tu contrasena se cambio correctamente.",
      });
    } catch (error: any) {
      toast({
        title: "Error al cambiar contrasena",
        description:
          error?.message === "auth/missing-current-password"
            ? "Ingresa tu contrasena actual para continuar."
            : mapFirebaseError(error),
        variant: "destructive",
      });
    } finally {
      setSavingPassword(false);
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

  const handleSaveIssuer = async () => {
    if (!user?.uid || !selectedBusiness) return;

    const addressLine1 = issuerForm.addressLine1.trim();
    const ubigeo = issuerForm.ubigeo.trim();
    const department = issuerForm.department.trim();
    const province = issuerForm.province.trim();
    const district = issuerForm.district.trim();

    if (!addressLine1 || !ubigeo || !department || !province || !district) {
      toast({
        title: "Datos incompletos",
        description: "Completa direccion, ubigeo, departamento, provincia y distrito.",
        variant: "destructive",
      });
      return;
    }

    try {
      setSavingIssuer(true);
      await updateDoc(doc(db, "users", user.uid, "businesses", selectedBusiness.id), {
        addressLine1,
        ubigeo,
        department,
        province,
        district,
        updatedAt: serverTimestamp(),
      });
      toast({
        title: "Datos del emisor guardados",
        description: "Se actualizaron los datos necesarios para emitir CPE.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.message || "No se pudo guardar datos del emisor.",
        variant: "destructive",
      });
    } finally {
      setSavingIssuer(false);
    }
  };

  const handleSaveSunatCert = async () => {
    if (!user?.uid || !selectedBusiness) return;

    const file = sunatCertForm.file;
    const password = sunatCertForm.password.trim();
    if (!file || !password) {
      toast({
        title: "Datos incompletos",
        description: "Selecciona el archivo .pfx/.p12 y su clave.",
        variant: "destructive",
      });
      return;
    }

    const name = file.name.toLowerCase();
    if (!name.endsWith(".pfx") && !name.endsWith(".p12") && !name.endsWith(".pfx.p12")) {
      toast({
        title: "Archivo invalido",
        description: "Sube un certificado digital en formato .pfx o .p12.",
        variant: "destructive",
      });
      return;
    }

    try {
      setSavingSunatCert(true);
      const base64 = await readFileAsBase64(file);
      await saveSunatCertificate({
        businessId: selectedBusiness.id,
        filename: file.name,
        pfxBase64: base64,
        pfxPassword: password,
      });

      const status = await getSunatCertificateStatus({ businessId: selectedBusiness.id });
      setSunatCertForm((prev) => ({
        ...prev,
        file: null,
        password: "",
        status: { configured: !!status.configured, filename: status.filename ?? null, sizeBytes: status.sizeBytes ?? null },
      }));

      toast({
        title: "Certificado guardado",
        description: "Se guardo en el servidor de forma cifrada.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.message || "No se pudo guardar el certificado.",
        variant: "destructive",
      });
    } finally {
      setSavingSunatCert(false);
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
              <Input
                value={profileForm.displayName}
                onChange={(e) => setProfileForm({ ...profileForm, displayName: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Correo electronico</Label>
              <Input
                type="email"
                value={profileForm.email}
                onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Telefono</Label>
              <Input
                value={profileForm.phone}
                onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
              />
            </div>
          </div>

          {hasPasswordProvider ? (
            <div className="space-y-2">
              <Label>Contrasena actual (solo para cambiar correo)</Label>
              <Input
                type="password"
                value={profileForm.currentPasswordForEmail}
                onChange={(e) =>
                  setProfileForm({ ...profileForm, currentPasswordForEmail: e.target.value })
                }
                placeholder="Ingresa tu contrasena actual"
              />
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">
              Si cambias correo o contrasena se abrira Google para verificar tu identidad.
            </p>
          )}

          <Button
            className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2"
            onClick={handleSaveProfile}
            disabled={savingProfile}
          >
            <Save className="w-4 h-4" /> {savingProfile ? "Guardando..." : "Guardar Cambios"}
          </Button>
        </CardContent>
      </Card>

      <Card className="shadow-card border-border">
        <CardHeader>
          <CardTitle className="font-display text-lg flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" /> Seguridad
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Contrasena actual</Label>
              <Input
                type="password"
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                placeholder={hasPasswordProvider ? "Tu contrasena actual" : "Se pedira con Google"}
              />
            </div>
            <div className="space-y-2">
              <Label>Nueva contrasena</Label>
              <Input
                type="password"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Confirmar nueva contrasena</Label>
              <Input
                type="password"
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
              />
            </div>
          </div>
          <Button
            className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2"
            onClick={handleChangePassword}
            disabled={savingPassword}
          >
            <Shield className="w-4 h-4" /> {savingPassword ? "Actualizando..." : "Actualizar contrasena"}
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
              <button
                type="button"
                className="text-sm text-accent hover:underline text-left"
                onClick={() => setSunatGuideOpen(true)}
              >
                Como crear tu Usuario Secundario en SUNAT? (2 minutos)
              </button>
              <Separator />
              <Button className="bg-accent text-accent-foreground hover:bg-accent/90" onClick={handleSaveSunat} disabled={savingSunat}>
                {savingSunat ? "Guardando..." : "Guardar credenciales"}
              </Button>

              <Separator />

              <div className="space-y-2">
                <p className="text-sm font-medium text-foreground">Datos del emisor (para SUNAT directo)</p>
                <p className="text-xs text-muted-foreground">
                  Estos datos se usan para armar el XML UBL del comprobante. Si faltan, SUNAT rechazara el envio.
                </p>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2 sm:col-span-2">
                  <Label>Direccion (linea 1)</Label>
                  <Input
                    placeholder="Av. Ejemplo 123, Int 4"
                    value={issuerForm.addressLine1}
                    onChange={(e) => setIssuerForm((prev) => ({ ...prev, addressLine1: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Ubigeo</Label>
                  <Input
                    placeholder="150101"
                    value={issuerForm.ubigeo}
                    onChange={(e) => setIssuerForm((prev) => ({ ...prev, ubigeo: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Departamento</Label>
                  <Input
                    placeholder="LIMA"
                    value={issuerForm.department}
                    onChange={(e) => setIssuerForm((prev) => ({ ...prev, department: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Provincia</Label>
                  <Input
                    placeholder="LIMA"
                    value={issuerForm.province}
                    onChange={(e) => setIssuerForm((prev) => ({ ...prev, province: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Distrito</Label>
                  <Input
                    placeholder="LIMA"
                    value={issuerForm.district}
                    onChange={(e) => setIssuerForm((prev) => ({ ...prev, district: e.target.value }))}
                  />
                </div>
              </div>
              <Button
                className="bg-accent text-accent-foreground hover:bg-accent/90"
                onClick={handleSaveIssuer}
                disabled={savingIssuer}
              >
                {savingIssuer ? "Guardando..." : "Guardar datos del emisor"}
              </Button>

              <Separator />

              <div className="space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-medium text-foreground">Certificado digital (para emitir CPE)</p>
                  <p className="text-xs text-muted-foreground">
                    {loadingSunatCert
                      ? "Verificando..."
                      : sunatCertForm.status?.configured
                        ? `Cargado${sunatCertForm.status.filename ? `: ${sunatCertForm.status.filename}` : ""}`
                        : "No configurado"}
                  </p>
                </div>
                <p className="text-xs text-muted-foreground">
                  Sube el archivo <span className="font-medium">.pfx/.p12</span> y su clave. Se guarda cifrado en el servidor.
                </p>
                <button
                  type="button"
                  className="text-sm text-accent hover:underline text-left"
                  onClick={() => setSunatCertGuideOpen(true)}
                >
                  Como obtener tu certificado digital (CDT) y exportarlo a .pfx/.p12?
                </button>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Archivo (.pfx/.p12)</Label>
                  <Input
                    type="file"
                    accept=".pfx,.p12"
                    onChange={(e) => setSunatCertForm((prev) => ({ ...prev, file: e.target.files?.[0] || null }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Clave del certificado</Label>
                  <Input
                    type="password"
                    placeholder="********"
                    value={sunatCertForm.password}
                    onChange={(e) => setSunatCertForm((prev) => ({ ...prev, password: e.target.value }))}
                  />
                </div>
              </div>
              <Button
                className="bg-accent text-accent-foreground hover:bg-accent/90"
                onClick={handleSaveSunatCert}
                disabled={savingSunatCert}
              >
                {savingSunatCert ? "Guardando..." : "Guardar certificado"}
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      <Dialog open={sunatGuideOpen} onOpenChange={setSunatGuideOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display">Como crear tu Usuario Secundario en SUNAT</DialogTitle>
            <DialogDescription>
              Guia rapida en SOL. Si sigues estos pasos, en 2-3 minutos tendras tu usuario listo.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 text-sm text-foreground">
            <ol className="list-decimal list-inside space-y-2">
              <li>Ingresa a SUNAT Operaciones en Linea (SOL) con tu RUC, usuario y Clave SOL principal.</li>
              <li>En la barra superior, abre "Administracion de usuarios secundarios" y haz clic en "Crear Usuario".</li>
              <li>Registra el tipo y numero de documento del usuario (si no es DNI, ingresa nombres y apellidos). El correo es opcional.</li>
              <li>Define el usuario y la clave del secundario y presiona "Siguiente".</li>
              <li>
                Verifica los datos y elige "Asignar Perfiles". En esa pantalla veras perfiles con opciones de consultas y
                tramites de SOL. Al seleccionar un perfil se marcan todas sus opciones, y puedes desmarcar las que no deseas.
              </li>
              <li>Presiona "Siguiente", revisa el resumen y confirma con "Grabar".</li>
            </ol>
            <div className="rounded-lg border border-border bg-muted/40 p-3 text-xs text-muted-foreground space-y-2">
              <p className="font-semibold text-foreground">Recomendado para ContApp</p>
              <p>Activa solo opciones de consulta relacionadas a comprobantes:</p>
              <p className="pl-4">Consulta, Comprobantes de pago, Comprobantes electronicos (CPE/SEE), Emitidos/Recibidos, Ventas, Compras.</p>
              <p>Evita perfiles de tramite o pago:</p>
              <p className="pl-4">Declaraciones, Pagos, Fraccionamientos, Devoluciones, Modificar RUC, Tramites.</p>
            </div>
            <div className="rounded-lg border border-border bg-muted/40 p-3 text-xs text-muted-foreground">
              Importante: las acciones del usuario secundario se consideran realizadas por ti.
            </div>
            <a
              href="https://orientacion.sunat.gob.pe/6618-06-creacion-de-usuarios-secundarios"
              target="_blank"
              rel="noreferrer"
              className="text-xs text-accent hover:underline"
            >
              Ver guia oficial de SUNAT
            </a>
          </div>
          <DialogFooter>
            <Button
              type="button"
              className="bg-primary text-primary-foreground hover:bg-primary/90"
              onClick={() => setSunatGuideOpen(false)}
            >
              Entendido
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={sunatCertGuideOpen} onOpenChange={setSunatCertGuideOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display">Como obtener tu certificado digital (CDT) y exportarlo</DialogTitle>
            <DialogDescription>
              Guia rapida para conseguir el certificado que se usa para firmar CPE (facturas/boletas) en SUNAT.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 text-sm text-foreground">
            <ol className="list-decimal list-inside space-y-2">
              <li>Ingresa a SUNAT Operaciones en Linea (SOL) con tu RUC, usuario y Clave SOL principal.</li>
              <li>Busca la opcion de <span className="font-medium">Certificado Digital Tributario (CDT)</span> y entra a la seccion de solicitud/descarga.</li>
              <li>Genera/descarga el certificado y define una clave (password). Esa clave se usa para exportar/usar el certificado.</li>
              <li>
                Si el certificado se instala en tu PC (Windows), abre el administrador de certificados:
                Inicio &gt; Ejecutar &gt; <span className="font-mono">certmgr.msc</span> (o el almacen de certificados del usuario).
              </li>
              <li>Ubica el certificado del emisor, elige <span className="font-medium">Exportar</span> y selecciona formato <span className="font-medium">.PFX/.P12</span> (incluyendo clave privada).</li>
              <li>En ContApp, sube el archivo <span className="font-medium">.pfx/.p12</span> y escribe la clave del certificado.</li>
            </ol>
            <div className="rounded-lg border border-border bg-muted/40 p-3 text-xs text-muted-foreground space-y-2">
              <p className="font-semibold text-foreground">Importante</p>
              <p>No compartas tu Clave SOL principal. Para ContApp, usa usuario secundario y guarda el certificado con una clave fuerte.</p>
              <p>Si no ves el CDT en SOL, verifica que tu RUC este habilitado como emisor electronico y que tengas permisos para gestionar CPE.</p>
            </div>
            <a
              href="https://cpe.sunat.gob.pe/certificado-digital"
              target="_blank"
              rel="noreferrer"
              className="text-xs text-accent hover:underline"
            >
              Ver pagina oficial CDT de SUNAT
            </a>
          </div>
          <DialogFooter>
            <Button
              type="button"
              className="bg-primary text-primary-foreground hover:bg-primary/90"
              onClick={() => setSunatCertGuideOpen(false)}
            >
              Entendido
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Configuracion;
