import { User, Building2, Save } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

const Configuracion = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">Configuración</h1>
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
              <Input defaultValue="Carlos Quispe" />
            </div>
            <div className="space-y-2">
              <Label>Correo electrónico</Label>
              <Input defaultValue="carlos@correo.com" disabled />
            </div>
            <div className="space-y-2">
              <Label>Teléfono</Label>
              <Input defaultValue="+51 987 654 321" />
            </div>
          </div>
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2">
            <Save className="w-4 h-4" /> Guardar Cambios
          </Button>
        </CardContent>
      </Card>

      <Card className="shadow-card border-border">
        <CardHeader>
          <CardTitle className="font-display text-lg flex items-center gap-2">
            <Building2 className="w-5 h-5 text-primary" /> Conexión SUNAT
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Configura tu Usuario Secundario para sincronizar comprobantes automáticamente.
          </p>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Usuario Secundario</Label>
              <Input placeholder="MODDATOS" />
            </div>
            <div className="space-y-2">
              <Label>Clave SOL Secundaria</Label>
              <Input type="password" placeholder="••••••••" />
            </div>
          </div>
          <a href="#" className="text-sm text-accent hover:underline">
            📖 ¿Cómo crear tu Usuario Secundario en SUNAT? (2 minutos)
          </a>
          <Separator />
          <Button className="bg-accent text-accent-foreground hover:bg-accent/90">
            Guardar y Sincronizar
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Configuracion;
