import { useState, useEffect } from "react";
import { ShieldCheck, UserCheck, UserX, Trash2, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { collection, query, onSnapshot, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import { UserProfile } from "@/lib/auth";

const Superadmin = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Escuchar cambios en tiempo real de Firestore
  useEffect(() => {
    const usersQuery = query(collection(db, "users"));

    const unsubscribe = onSnapshot(usersQuery, (snapshot) => {
      const usersData = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          uid: doc.id,
          email: data.email,
          displayName: data.displayName,
          plan: data.plan,
          role: data.role,
          status: data.status,
          trialEndsAt: data.trialEndsAt?.toDate(),
          createdAt: data.createdAt?.toDate(),
          updatedAt: data.updatedAt?.toDate()
        } as UserProfile;
      });

      setUsers(usersData);
      setLoading(false);
    }, (error) => {
      console.error("Error al cargar usuarios:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los usuarios",
        variant: "destructive",
      });
      setLoading(false);
    });

    // Cleanup
    return () => unsubscribe();
  }, [toast]);

  // Activar usuario
  const handleActivateUser = async (userId: string) => {
    try {
      await updateDoc(doc(db, "users", userId), {
        status: "ACTIVE"
      });
      toast({
        title: "Usuario activado",
        description: "El usuario ha sido activado correctamente",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo activar el usuario",
        variant: "destructive",
      });
    }
  };

  // Suspender usuario
  const handleSuspendUser = async (userId: string) => {
    try {
      await updateDoc(doc(db, "users", userId), {
        status: "SUSPENDED"
      });
      toast({
        title: "Usuario suspendido",
        description: "El usuario ha sido suspendido",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo suspender el usuario",
        variant: "destructive",
      });
    }
  };

  // Eliminar usuario
  const handleDeleteUser = async (userId: string, userEmail: string) => {
    if (!confirm(`¿Estás seguro de eliminar al usuario ${userEmail}?`)) {
      return;
    }

    try {
      await deleteDoc(doc(db, "users", userId));
      toast({
        title: "Usuario eliminado",
        description: "El usuario ha sido eliminado de la base de datos",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo eliminar el usuario",
        variant: "destructive",
      });
    }
  };

  // Calcular estadísticas
  const totalUsers = users.length;
  const activeUsers = users.filter(u => u.status === "ACTIVE").length;
  const trialUsers = users.filter(u => u.status === "TRIAL").length;

  // Formatear fecha
  const formatDate = (date: Date | undefined) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("es-PE", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit"
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground flex items-center gap-2">
          <ShieldCheck className="w-6 h-6 text-accent" /> Superadmin
        </h1>
        <p className="text-sm text-muted-foreground">Panel de administración - Datos en tiempo real</p>
      </div>

      {/* KPIs */}
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

      {/* Tabla de usuarios */}
      <Card className="shadow-card border-border">
        <CardHeader>
          <CardTitle className="font-display text-lg">Usuarios Registrados</CardTitle>
        </CardHeader>
        <CardContent>
          {users.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No hay usuarios registrados aún
            </div>
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
                      <Badge className={
                        user.status === "ACTIVE" ? "bg-emerald-light text-accent" :
                          user.status === "TRIAL" ? "bg-primary/10 text-primary" :
                            "bg-destructive/10 text-destructive"
                      }>
                        {user.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(user.createdAt)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleActivateUser(user.uid)}
                          title="Activar usuario"
                        >
                          <UserCheck className="w-4 h-4 text-accent" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleSuspendUser(user.uid)}
                          title="Suspender usuario"
                        >
                          <UserX className="w-4 h-4 text-muted-foreground" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleDeleteUser(user.uid, user.email)}
                          title="Eliminar usuario"
                          disabled={user.role === "ADMIN"}
                        >
                          <Trash2 className={`w-4 h-4 ${user.role === "ADMIN" ? "text-muted-foreground/30" : "text-destructive"}`} />
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
