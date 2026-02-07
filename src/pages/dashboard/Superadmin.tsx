import { ShieldCheck, UserCheck, UserX, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const users = [
  { id: 1, name: "Carlos Quispe", email: "carlos@correo.com", plan: "PRO", status: "Activo", joined: "2026-01-15" },
  { id: 2, name: "María López", email: "maria@gmail.com", plan: "PLUS", status: "Activo", joined: "2026-01-10" },
  { id: 3, name: "Ana Fernández", email: "ana@hotmail.com", plan: "PRO", status: "Trial", joined: "2026-02-01" },
  { id: 4, name: "Pedro Huamán", email: "pedro@empresa.pe", plan: "PRO", status: "Suspendido", joined: "2025-12-20" },
];

const Superadmin = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground flex items-center gap-2">
          <ShieldCheck className="w-6 h-6 text-accent" /> Superadmin
        </h1>
        <p className="text-sm text-muted-foreground">Panel de administración - Solo admin@contapp.pe</p>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <Card className="shadow-card border-border"><CardContent className="p-5"><p className="text-sm text-muted-foreground">Total Usuarios</p><p className="font-display text-2xl font-bold text-foreground">{users.length}</p></CardContent></Card>
        <Card className="shadow-card border-border"><CardContent className="p-5"><p className="text-sm text-muted-foreground">Activos</p><p className="font-display text-2xl font-bold text-accent">{users.filter(u => u.status === "Activo").length}</p></CardContent></Card>
        <Card className="shadow-card border-border"><CardContent className="p-5"><p className="text-sm text-muted-foreground">En Trial</p><p className="font-display text-2xl font-bold text-primary">{users.filter(u => u.status === "Trial").length}</p></CardContent></Card>
      </div>

      <Card className="shadow-card border-border">
        <CardHeader>
          <CardTitle className="font-display text-lg">Usuarios Registrados</CardTitle>
        </CardHeader>
        <CardContent>
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
              {users.map((u) => (
                <TableRow key={u.id}>
                  <TableCell className="font-medium">{u.name}</TableCell>
                  <TableCell className="text-muted-foreground">{u.email}</TableCell>
                  <TableCell><Badge variant="secondary">{u.plan}</Badge></TableCell>
                  <TableCell>
                    <Badge className={
                      u.status === "Activo" ? "bg-emerald-light text-accent" :
                      u.status === "Trial" ? "bg-primary/10 text-primary" :
                      "bg-destructive/10 text-destructive"
                    }>{u.status}</Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{u.joined}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8"><UserCheck className="w-4 h-4 text-accent" /></Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8"><UserX className="w-4 h-4 text-muted-foreground" /></Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8"><Trash2 className="w-4 h-4 text-destructive" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default Superadmin;
