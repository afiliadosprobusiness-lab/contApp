import { useState, useEffect } from "react";
import { ShieldCheck, MoreVertical, Trash2, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { collection, query, onSnapshot, doc, updateDoc, deleteDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import { UserProfile } from "@/lib/auth";
import { useAuth } from "@/contexts/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const DEFAULT_ADMIN_EMAIL = "afiliadosprobusiness@gmail.com";
const TRIAL_DAYS = 5;

const Superadmin = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { userProfile } = useAuth();
  const configuredAdminEmail = (import.meta.env.VITE_ADMIN_EMAIL || "").trim().toLowerCase();

  const isProtectedSuperadmin = (user: Pick<UserProfile, "role" | "email">) => {
    const email = (user.email || "").trim().toLowerCase();
    return user.role === "ADMIN" || [configuredAdminEmail, DEFAULT_ADMIN_EMAIL].includes(email);
  };

  useEffect(() => {
    const usersQuery = query(collection(db, "users"));

    const unsubscribe = onSnapshot(
      usersQuery,
      (snapshot) => {
        const usersData = snapshot.docs.map((snapshotDoc) => {
          const data = snapshotDoc.data();
          return {
            uid: snapshotDoc.id,
            email: data.email,
            displayName: data.displayName,
            plan: data.plan,
            role: data.role,
            status: data.status,
            trialEndsAt: data.trialEndsAt?.toDate?.(),
            createdAt: data.createdAt?.toDate?.(),
            updatedAt: data.updatedAt?.toDate?.(),
          } as UserProfile;
        });

        setUsers(usersData);
        setLoading(false);
      },
      (error) => {
        console.error("Error al cargar usuarios:", error);

        const code = (error as { code?: string } | undefined)?.code || "";
        if (code.includes("permission-denied")) {
          toast({
            title: "Permisos de Firestore",
            description:
              "Firestore nego acceso. Publica las reglas de ContApp para que el superadmin pueda leer users.",
            variant: "destructive",
          });
        } else if (code.includes("blocked-by-client")) {
          toast({
            title: "Bloqueo del navegador",
            description: "Una extension esta bloqueando Firestore. Desactiva el bloqueador para este sitio.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Error",
            description: "No se pudieron cargar los usuarios.",
            variant: "destructive",
          });
        }

        if (userProfile?.uid) {
          setUsers([
            {
              uid: userProfile.uid,
              email: userProfile.email,
              displayName: userProfile.displayName || "Superadmin",
              plan: userProfile.plan,
              role: userProfile.role,
              status: userProfile.status || "ACTIVE",
              trialEndsAt: userProfile.trialEndsAt,
              createdAt: userProfile.createdAt,
              updatedAt: userProfile.updatedAt,
            },
          ]);
        }

        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [toast, userProfile]);

  const handleActivatePlan = async (userId: string, plan: "PRO" | "PLUS") => {
    try {
      await updateDoc(doc(db, "users", userId), {
        plan,
        status: "ACTIVE",
        trialEndsAt: null,
        updatedAt: serverTimestamp(),
      });
      toast({
        title: "Plan activado",
        description: `El usuario fue activado con plan ${plan}.`,
      });
    } catch {
      toast({
        title: "Error",
        description: "No se pudo activar el plan del usuario.",
        variant: "destructive",
      });
    }
  };

  const handleChangePlanOnly = async (userId: string, plan: "PRO" | "PLUS") => {
    try {
      await updateDoc(doc(db, "users", userId), {
        plan,
        updatedAt: serverTimestamp(),
      });
      toast({
        title: "Plan actualizado",
        description: `El plan fue cambiado a ${plan} (sin tocar el estado).`,
      });
    } catch {
      toast({
        title: "Error",
        description: "No se pudo cambiar el plan del usuario.",
        variant: "destructive",
      });
    }
  };

  const handleMarkTrial = async (userId: string) => {
    try {
      const trialEndsAt = new Date();
      trialEndsAt.setDate(trialEndsAt.getDate() + TRIAL_DAYS);

      await updateDoc(doc(db, "users", userId), {
        status: "TRIAL",
        trialEndsAt,
        updatedAt: serverTimestamp(),
      });
      toast({
        title: "Trial activado",
        description: `El usuario quedo en TRIAL por ${TRIAL_DAYS} dias. El plan no se modifico.`,
      });
    } catch {
      toast({
        title: "Error",
        description: "No se pudo marcar el usuario como TRIAL.",
        variant: "destructive",
      });
    }
  };

  const handleSuspendUser = async (userId: string) => {
    try {
      await updateDoc(doc(db, "users", userId), {
        status: "SUSPENDED",
        trialEndsAt: null,
        updatedAt: serverTimestamp(),
      });
      toast({
        title: "Usuario suspendido",
        description: "El usuario ha sido suspendido.",
      });
    } catch {
      toast({
        title: "Error",
        description: "No se pudo suspender el usuario.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteUser = async (targetUser: UserProfile) => {
    if (isProtectedSuperadmin(targetUser)) {
      toast({
        title: "Accion no permitida",
        description: "No se puede eliminar la cuenta superadmin.",
        variant: "destructive",
      });
      return;
    }

    const userId = targetUser.uid;
    const userEmail = targetUser.email;
    if (!confirm(`Estas seguro de eliminar al usuario ${userEmail}?`)) {
      return;
    }

    try {
      await deleteDoc(doc(db, "users", userId));
      toast({
        title: "Usuario eliminado",
        description: "El usuario ha sido eliminado de la base de datos.",
      });
    } catch {
      toast({
        title: "Error",
        description: "No se pudo eliminar el usuario.",
        variant: "destructive",
      });
    }
  };

  const totalUsers = users.length;
  const activeUsers = users.filter((u) => u.status === "ACTIVE").length;
  const trialUsers = users.filter((u) => u.status === "TRIAL").length;

  const formatDate = (date: Date | undefined) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("es-PE", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  const MenuItem = ({ title, subtitle }: { title: string; subtitle: string }) => (
    <div className="flex flex-col">
      <span className="text-sm font-medium">{title}</span>
      <span className="text-xs text-muted-foreground">{subtitle}</span>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground flex items-center gap-2">
          <ShieldCheck className="w-6 h-6 text-accent" /> Superadmin
        </h1>
        <p className="text-sm text-muted-foreground">Panel de administracion - Datos en tiempo real</p>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <Card className="shadow-card border-border">
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Total Usuarios</p>
            <p className="font-display text-2xl font-bold text-foreground">{totalUsers}</p>
          </CardContent>
        </Card>
        <Card className="shadow-card border-border">
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Activos</p>
            <p className="font-display text-2xl font-bold text-accent">{activeUsers}</p>
          </CardContent>
        </Card>
        <Card className="shadow-card border-border">
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">En Trial</p>
            <p className="font-display text-2xl font-bold text-primary">{trialUsers}</p>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-card border-border">
        <CardHeader>
          <CardTitle className="font-display text-lg">Usuarios Registrados</CardTitle>
        </CardHeader>
        <CardContent>
          {users.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No hay usuarios registrados aun.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Registro</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.uid}>
                    <TableCell className="font-medium">
                      {user.displayName || "Sin nombre"}
                      {user.role === "ADMIN" && (
                        <Badge variant="outline" className="ml-2 text-xs">
                          ADMIN
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground">{user.email}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{user.plan}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={
                          user.status === "ACTIVE"
                            ? "bg-emerald-light text-accent"
                            : user.status === "TRIAL"
                              ? "bg-primary/10 text-primary"
                              : "bg-destructive/10 text-destructive"
                        }
                      >
                        {user.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{formatDate(user.createdAt)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              title="Acciones"
                              disabled={isProtectedSuperadmin(user)}
                            >
                              <MoreVertical className="w-4 h-4 text-muted-foreground" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-80">
                            <DropdownMenuLabel>Acciones de usuario</DropdownMenuLabel>
                            <DropdownMenuSeparator />

                            <DropdownMenuItem onSelect={() => handleActivatePlan(user.uid, "PRO")}>
                              <MenuItem title="Activar plan PRO" subtitle="Pasa el estado a Activo y asigna PRO." />
                            </DropdownMenuItem>
                            <DropdownMenuItem onSelect={() => handleActivatePlan(user.uid, "PLUS")}>
                              <MenuItem title="Activar plan PLUS" subtitle="Pasa el estado a Activo y asigna PLUS." />
                            </DropdownMenuItem>

                            <DropdownMenuSeparator />

                            <DropdownMenuItem onSelect={() => handleChangePlanOnly(user.uid, "PRO")}>
                              <MenuItem
                                title="Cambiar plan a PRO (sin tocar estado)"
                                subtitle="Solo cambia el plan. No cambia Trial/Activo/Suspendido."
                              />
                            </DropdownMenuItem>
                            <DropdownMenuItem onSelect={() => handleChangePlanOnly(user.uid, "PLUS")}>
                              <MenuItem
                                title="Cambiar plan a PLUS (sin tocar estado)"
                                subtitle="Solo cambia el plan. No cambia Trial/Activo/Suspendido."
                              />
                            </DropdownMenuItem>

                            <DropdownMenuSeparator />

                            <DropdownMenuItem onSelect={() => handleMarkTrial(user.uid)}>
                              <MenuItem
                                title="Marcar como Trial"
                                subtitle={`Cambia el estado a Trial (${TRIAL_DAYS} dias). El plan queda igual.`}
                              />
                            </DropdownMenuItem>
                            <DropdownMenuItem onSelect={() => handleSuspendUser(user.uid)}>
                              <MenuItem title="Suspender acceso" subtitle="Bloquea el acceso sin eliminar la cuenta." />
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleDeleteUser(user)}
                          title="Eliminar usuario"
                          disabled={isProtectedSuperadmin(user)}
                        >
                          <Trash2
                            className={`w-4 h-4 ${
                              isProtectedSuperadmin(user) ? "text-muted-foreground/30" : "text-destructive"
                            }`}
                          />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Superadmin;
