import { USERS, CITIES, WINDOW_TYPES, COMERCIALES } from "../../lib/constants";
import { Users, MapPin, Package, Briefcase } from "lucide-react";

export default function AdminDashboard() {
  const stats = [
    { label: "Usuarios", value: USERS.length, icon: Users, color: "text-primary" },
    { label: "Ciudades", value: CITIES.length, icon: MapPin, color: "text-blue-400" },
    { label: "Tipos de ventana", value: WINDOW_TYPES.length, icon: Package, color: "text-success" },
    { label: "Comerciales", value: COMERCIALES.length, icon: Briefcase, color: "text-warning" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Panel de Administración</h1>
      <p className="text-muted text-sm mb-8">Gestiona usuarios, catálogo y configuración del sistema</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="bg-surface border border-border rounded-2xl p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-10 h-10 rounded-xl bg-surface-hover flex items-center justify-center ${s.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
              <div className="text-2xl font-bold">{s.value}</div>
              <div className="text-xs text-muted mt-1">{s.label}</div>
            </div>
          );
        })}
      </div>

      <div className="bg-surface border border-border rounded-2xl p-6">
        <h2 className="text-lg font-bold mb-2">Bienvenido al panel de administración</h2>
        <p className="text-muted text-sm leading-relaxed">
          Desde aquí puedes gestionar los usuarios del sistema, el catálogo de productos
          (tipos de ventana, colores, persianas, etc.), las ciudades operativas y los comerciales.
          Usa el menú lateral para navegar entre las secciones.
        </p>
      </div>
    </div>
  );
}
