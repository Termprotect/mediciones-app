import { useState } from "react";
import { USERS, CITIES } from "../../lib/constants";
import { formatDate } from "../../lib/utils";
import Header from "../../components/ui/Header";
import Button from "../../components/ui/Button";
import StatusBadge from "../../components/ui/StatusBadge";
import ProgressBar from "../../components/ui/ProgressBar";
import EmptyState from "../../components/ui/EmptyState";
import { Plus, CalendarDays, RefreshCw } from "lucide-react";

export default function LogisticaDashboard({ routes, user, onLogout, onCreateRoute, onEditRoute, onMarkRescheduled }) {
  const [tab, setTab] = useState("jornadas");
  const myRoutes = routes.filter((r) => r.city === user.city);
  const sorted = [...myRoutes].sort((a, b) => b.date.localeCompare(a.date));

  const rescheduled = [];
  myRoutes.forEach((r) => {
    r.clients.forEach((c) => {
      if (c.status === "reprogramar") rescheduled.push({ ...c, routeId: r.id, routeDate: r.date });
    });
  });

  const cityLabel = CITIES.find((c) => c.id === user.city)?.label || "";

  return (
    <div className="min-h-screen bg-background">
      <Header title={`Logística ${cityLabel}`} subtitle={user.name} user={user} onLogout={onLogout} />
      <div className="p-4 sm:p-6 max-w-4xl mx-auto">
        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setTab("jornadas")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer border ${
              tab === "jornadas" ? "bg-primary text-dark border-primary" : "bg-surface text-muted border-border"
            }`}
          >
            <CalendarDays className="w-4 h-4" /> Jornadas
          </button>
          <button
            onClick={() => setTab("reprogramar")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer border ${
              tab === "reprogramar" ? "bg-warning text-dark border-warning" : "bg-surface text-muted border-border"
            }`}
          >
            <RefreshCw className="w-4 h-4" /> Reprogramar
            {rescheduled.length > 0 && (
              <span className="bg-danger text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{rescheduled.length}</span>
            )}
          </button>
        </div>

        {tab === "jornadas" && (
          <>
            <div className="mb-4">
              <Button onClick={onCreateRoute}><Plus className="w-4 h-4" /> Nueva Jornada</Button>
            </div>
            {sorted.length === 0 ? (
              <EmptyState icon="📋" text="No hay jornadas para tu ciudad." />
            ) : (
              <div className="space-y-3">
                {sorted.map((r) => {
                  const medidor = USERS.find((m) => m.id === r.assignedTo);
                  const completed = r.clients.filter((c) => c.measurement).length;
                  const total = r.clients.length;
                  return (
                    <div
                      key={r.id}
                      onClick={() => onEditRoute(r.id)}
                      className="bg-surface border border-border rounded-2xl p-4 flex items-center gap-4 cursor-pointer hover:border-primary/50 transition-all"
                    >
                      <div className="w-11 h-11 rounded-xl bg-primary flex items-center justify-center text-dark font-bold flex-shrink-0">
                        {medidor?.name?.charAt(0) || "?"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-sm">{formatDate(r.date)}</div>
                        <div className="text-xs text-muted mt-1">{medidor?.name || "Sin asignar"} · {total} clientes</div>
                        <ProgressBar current={completed} total={total} className="mt-2 max-w-[160px]" />
                      </div>
                      <StatusBadge status={r.status} />
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {tab === "reprogramar" && (
          <>
            {rescheduled.length === 0 ? (
              <EmptyState icon="✅" text="No hay mediciones pendientes de reprogramar." />
            ) : (
              <div className="space-y-3">
                {rescheduled.map((client) => (
                  <div key={client.id} className="bg-surface border border-warning/30 rounded-2xl p-5">
                    <div className="font-bold text-sm mb-1">{client.name}</div>
                    <div className="text-xs text-muted mb-2">📍 {client.address} · 📞 {client.phone}</div>
                    <div className="bg-warning/10 border border-warning/20 rounded-xl p-3 mb-3">
                      <p className="text-xs text-warning font-medium">Motivo: {client.rescheduleNote}</p>
                    </div>
                    <Button onClick={() => onMarkRescheduled(client.id, client.routeId)} variant="success" full>
                      ✓ Marcar como reprogramado
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
