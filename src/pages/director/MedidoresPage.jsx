import { USERS, CITIES } from "../../lib/constants";
import { formatDate } from "../../lib/utils";
import CityBadge from "../../components/ui/CityBadge";
import ProgressBar from "../../components/ui/ProgressBar";
import { MapPin, Phone, CalendarDays, CheckCircle2, Clock } from "lucide-react";

export default function MedidoresPage({ routes }) {
  const medidores = USERS.filter((u) => u.role === "medidor");
  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="max-w-5xl mx-auto space-y-4">
      <p className="text-sm text-muted mb-2">
        {medidores.length} medidores registrados en el sistema
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        {medidores.map((med) => {
          const myRoutes = routes.filter((r) => r.assignedTo === med.id);
          const todayRoute = myRoutes.find((r) => r.date === today);
          const totalMeasured = myRoutes.reduce(
            (sum, r) => sum + r.clients.filter((c) => c.measurement).length,
            0
          );
          const totalClients = myRoutes.reduce((sum, r) => sum + r.clients.length, 0);
          const cityCoverage =
            med.city === "all"
              ? "Todas las ciudades"
              : CITIES.find((c) => c.id === med.city)?.label || med.city;

          return (
            <div
              key={med.id}
              className="bg-surface border border-border rounded-2xl p-5"
            >
              {/* Header */}
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center text-dark font-bold text-lg flex-shrink-0">
                  {med.name.charAt(0)}
                </div>
                <div>
                  <div className="font-bold text-sm text-white">{med.name}</div>
                  <div className="text-xs text-muted flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3" /> {cityCoverage}
                  </div>
                </div>
                {todayRoute && (
                  <span className="ml-auto px-2.5 py-1 rounded-lg text-[10px] font-bold bg-success/20 text-success">
                    Activo hoy
                  </span>
                )}
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="text-center">
                  <div className="text-lg font-bold text-white">{myRoutes.length}</div>
                  <div className="text-[10px] text-muted flex items-center justify-center gap-1">
                    <CalendarDays className="w-3 h-3" /> Jornadas
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-success">{totalMeasured}</div>
                  <div className="text-[10px] text-muted flex items-center justify-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Completadas
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-warning">{totalClients - totalMeasured}</div>
                  <div className="text-[10px] text-muted flex items-center justify-center gap-1">
                    <Clock className="w-3 h-3" /> Pendientes
                  </div>
                </div>
              </div>

              {/* Progress */}
              <div className="text-[11px] text-muted mb-1.5 flex justify-between">
                <span>Progreso total</span>
                <span>{totalClients > 0 ? Math.round((totalMeasured / totalClients) * 100) : 0}%</span>
              </div>
              <ProgressBar current={totalMeasured} total={totalClients} />

              {/* Today route info */}
              {todayRoute && (
                <div className="mt-4 pt-3 border-t border-border">
                  <div className="text-[11px] font-semibold text-muted mb-1">Hoy</div>
                  <div className="text-xs text-white">
                    {todayRoute.clients.length} cliente{todayRoute.clients.length !== 1 ? "s" : ""}
                    {" · "}
                    {todayRoute.clients.filter((c) => c.measurement).length} completados
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
