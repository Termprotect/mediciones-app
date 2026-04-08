import { USERS } from "../../lib/constants";
import { formatDate } from "../../lib/utils";
import Header from "../../components/ui/Header";
import CityBadge from "../../components/ui/CityBadge";
import ProgressBar from "../../components/ui/ProgressBar";
import EmptyState from "../../components/ui/EmptyState";

export default function MedidorDashboard({ routes, user, onLogout, onSelectRoute }) {
  const myRoutes = routes.filter((r) => r.assignedTo === user.id && r.status !== "borrador");
  const sorted = [...myRoutes].sort((a, b) => a.date.localeCompare(b.date));

  return (
    <div className="min-h-screen bg-background">
      <Header title="Mis Mediciones" subtitle={`Medidor · ${user.name}`} user={user} onLogout={onLogout} />
      <div className="p-4 sm:p-6 max-w-4xl mx-auto">
        {sorted.length === 0 ? (
          <EmptyState icon="📭" text="No tienes jornadas asignadas." />
        ) : (
          <div className="space-y-3">
            {sorted.map((r) => {
              const completed = r.clients.filter((c) => c.measurement).length;
              const total = r.clients.length;
              const allDone = completed === total && total > 0;
              return (
                <div
                  key={r.id}
                  onClick={() => onSelectRoute(r.id)}
                  className={`bg-surface border rounded-2xl p-5 cursor-pointer hover:border-primary/50 transition-all ${
                    allDone ? "border-success" : "border-border"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-base capitalize">{formatDate(r.date)}</span>
                    <CityBadge cityId={r.city} />
                  </div>
                  <div className="text-sm text-muted">
                    {total} cliente{total !== 1 ? "s" : ""} · {completed}/{total} completado{completed !== 1 ? "s" : ""}
                  </div>
                  <ProgressBar current={completed} total={total} className="mt-3" />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
