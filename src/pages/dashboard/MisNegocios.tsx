import { useState } from "react";
import { Building2, Plus, Trash2, Edit, AlertTriangle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle
} from "@/components/ui/alert-dialog";

const mockNegocios = [
  { ruc: "20601234567", name: "Mi Bodega SAC", type: "EIRL", status: "Activo" },
  { ruc: "10456789012", name: "Carlos Quispe - Persona Natural", type: "Persona Natural", status: "Activo" },
];

const MisNegocios = () => {
  const [showUpgrade, setShowUpgrade] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Mis Negocios</h1>
          <p className="text-sm text-muted-foreground">Gestiona los RUCs vinculados a tu cuenta (2/2 del Plan PRO)</p>
        </div>
        <Button className="bg-accent text-accent-foreground hover:bg-accent/90 gap-2" onClick={() => setShowUpgrade(true)}>
          <Plus className="w-4 h-4" /> Añadir Negocio
        </Button>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {mockNegocios.map((neg) => (
          <Card key={neg.ruc} className="shadow-card border-border">
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-primary" />
                </div>
                <Badge variant="secondary" className="bg-emerald-light text-accent text-xs">
                  {neg.status}
                </Badge>
              </div>
              <h3 className="font-display font-semibold text-foreground mb-1">{neg.name}</h3>
              <p className="text-sm text-muted-foreground mb-1">RUC: {neg.ruc}</p>
              <p className="text-xs text-muted-foreground mb-4">Tipo: {neg.type}</p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="gap-1"><Edit className="w-3 h-3" /> Editar</Button>
                <Button variant="outline" size="sm" className="gap-1 text-destructive hover:text-destructive"><Trash2 className="w-3 h-3" /> Eliminar</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <AlertDialog open={showUpgrade} onOpenChange={setShowUpgrade}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mx-auto mb-2">
              <AlertTriangle className="w-6 h-6 text-accent" />
            </div>
            <AlertDialogTitle className="text-center font-display">¡Desbloquea Negocios Ilimitados!</AlertDialogTitle>
            <AlertDialogDescription className="text-center">
              Has alcanzado el límite de 2 negocios del Plan PRO. Actualiza al Plan PLUS para gestionar negocios ilimitados por solo S/ 104.90/mes.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="sm:justify-center">
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction className="bg-accent text-accent-foreground hover:bg-accent/90">
              Upgrade a Plan PLUS (S/ 104.90)
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default MisNegocios;
