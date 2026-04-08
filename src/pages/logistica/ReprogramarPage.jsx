import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { USERS } from "../../lib/constants";
import { formatDate } from "../../lib/utils";
import Button from "../../components/ui/Button";
import EmptyState from "../../components/ui/EmptyState";
import { RefreshCw, MapPin, Phone, Calendar, User, ChevronDown, ArrowRight, CheckCircle2 } from "lucide-react";

export default function ReprogramarPage({ routes, onReassignClient, filterByCity }) {
  const { user } = useAuth();
  const [selectedTarget, setSelectedTarget] = useState({});
  const [confirmId, setConfirmId] = useState(null);

  // If filterByCity is explicitly null, show all; if undefined, fall back to user.city
  const cityFilter = filterByCity === null ? null : (filterByCity || user.city);
  const myRoutes = routes.filter((r) => !cityFilter || r.city === cityFilter);
  const todayStr = new Date().toISOString().split("T")[0];

  // Clients pending reprogramming
  const rescheduled = [];
  myRoutes.forEach((r) => {
    r.clients.forEach((c) => {
      if (c.status === "reprogramar") {
        rescheduled.push({ ...c, routeId: r.id, routeDate: r.date, routeCity: r.city, assignedTo: r.assignedTo });
      }
    });
  });

  // Available target routes: future or today, not completed
  const availableRoutes = myRoutes
    .filter((r) => r.date >= todayStr && r.status !== "completado")
    .sort((a, b) => a.date.localeCompare(b.date));

  const handleReassign = (clientId, fromRouteId) => {
    const targetRouteId = selectedTarget[clientId];
    if (!targetRouteId) return;
    onReassignClient(clientId, fromRouteId, targetRouteId);
    setConfirmId(null);
    // Clean up selection
    setSelectedTarget((prev) => {
      const copy = { ...prev };
      delete copy[clientId];
      return copy;
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      {/* Header banner */}
      {rescheduled.length > 0 && (
        <div className="bg-orange-500/10 border-2 border-orange-500/30 rounded-2xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center flex-shrink-0">
            <RefreshCw className="w-5 h-5 text-orange-400" />
          </div>
          <div>
            <p className="text-sm font-bold text-orange-400">
              {rescheduled.length} medici{rescheduled.length !== 1 ? "ones" : "ón"} pendiente{rescheduled.length !== 1 ? "s" : ""} de reprogramar
            </p>
            <p className="text-xs text-orange-300/70 mt-0.5">Selecciona la jornada destino para reasignar cada cliente</p>
          </div>
        </div>
      )}

      {rescheduled.length === 0 ? (
        <EmptyState icon="✅" text="No hay mediciones pendientes de reprogramar." />
      ) : (
        <div className="space-y-3">
          {rescheduled.map((client) => {
            const medidor = USERS.find((u) => u.id === client.assignedTo);
            const targetId = selectedTarget[client.id] || "";
            const targetRoute = availableRoutes.find((r) => r.id === targetId);
            const targetMedidor = targetRoute ? USERS.find((u) => u.id === targetRoute.assignedTo) : null;
            const isConfirming = confirmId === client.id;

            return (
              <div key={client.id} className="bg-surface border-2 border-orange-500/40 rounded-2xl overflow-hidden">
                {/* Orange top accent bar */}
                <div className="h-1.5 bg-gradient-to-r from-orange-500 to-amber-500" />
                <div className="p-5">
                  {/* Client info */}
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-11 h-11 rounded-xl bg-orange-500/20 flex items-center justify-center flex-shrink-0">
                      <RefreshCw className="w-5 h-5 text-orange-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-base text-white">{client.name}</div>
                      {client.businessName && (
                        <div className="text-xs text-primary font-medium mt-0.5">{client.businessName}</div>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-1 flex-shrink-0">
                      {!cityFilter && client.routeCity && (
                        <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30">
                          {client.routeCity}
                        </span>
                      )}
                      <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-orange-500/20 text-orange-400 border border-orange-500/30">
                        Reprogramar
                      </span>
                    </div>
                  </div>

                  {/* Details grid */}
                  <div className="grid grid-cols-2 gap-3 mb-3 text-xs">
                    <div className="flex items-center gap-2 text-muted">
                      <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                      <span className="text-white">{client.address || "—"}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted">
                      <Phone className="w-3.5 h-3.5 flex-shrink-0" />
                      <span className="text-white">{client.phone || "—"}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted">
                      <Calendar className="w-3.5 h-3.5 flex-shrink-0" />
                      <span className="text-white capitalize">{formatDate(client.routeDate)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted">
                      <User className="w-3.5 h-3.5 flex-shrink-0" />
                      <span className="text-white">{medidor?.name || "Sin asignar"}</span>
                    </div>
                  </div>

                  {/* Reschedule reason */}
                  <div className="bg-orange-500/10 border border-orange-500/25 rounded-xl p-4 mb-4">
                    <p className="text-[10px] uppercase tracking-wider text-orange-400 font-bold mb-1">Motivo de reprogramación</p>
                    <p className="text-sm text-orange-200">{client.rescheduleNote}</p>
                  </div>

                  {/* Target route selector */}
                  {(() => {
                    const targetOptions = availableRoutes.filter((r) => r.id !== client.routeId && r.city === client.routeCity);
                    const hasOptions = targetOptions.length > 0;
                    return (
                      <div className="bg-dark border border-border rounded-xl p-4 mb-4">
                        <p className="text-xs font-bold text-white mb-3 flex items-center gap-2">
                          <ArrowRight className="w-4 h-4 text-primary" /> Reasignar a jornada
                        </p>

                        {!hasOptions ? (
                          <div className="bg-muted/10 border border-border rounded-xl p-4 text-center">
                            <Calendar className="w-6 h-6 text-muted mx-auto mb-2" />
                            <p className="text-xs text-muted font-medium">No hay otras jornadas disponibles para esta ciudad.</p>
                            <p className="text-[11px] text-muted/70 mt-1">Crea una nueva jornada desde el panel principal y luego regresa aquí para reasignar.</p>
                          </div>
                        ) : (
                          <>
                            <div className="relative mb-3">
                              <select
                                value={targetId}
                                onChange={(e) => {
                                  setSelectedTarget((prev) => ({ ...prev, [client.id]: e.target.value }));
                                  setConfirmId(null);
                                }}
                                className="w-full appearance-none bg-surface border-2 border-border rounded-xl text-white text-sm font-medium px-4 py-3 pr-10 outline-none focus:border-primary transition-colors cursor-pointer"
                              >
                                <option value="">— Seleccionar jornada destino —</option>
                                {targetOptions.map((r) => {
                                  const m = USERS.find((u) => u.id === r.assignedTo);
                                  return (
                                    <option key={r.id} value={r.id}>
                                      {new Date(r.date + "T12:00").toLocaleDateString("es-ES", { weekday: "short", day: "numeric", month: "short" })}
                                      {" — "}
                                      {m?.name || "Sin asignar"}
                                      {" · "}
                                      {r.clients.length} cliente{r.clients.length !== 1 ? "s" : ""}
                                    </option>
                                  );
                                })}
                              </select>
                              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" />
                            </div>

                            {/* Target route preview */}
                            {targetRoute && (
                              <div className="bg-primary/5 border border-primary/20 rounded-xl p-3 flex items-center gap-3">
                                <div className="w-9 h-9 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0 text-primary font-bold text-sm">
                                  {targetMedidor?.name?.charAt(0) || "?"}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-semibold text-white capitalize">
                                    {formatDate(targetRoute.date)}
                                  </p>
                                  <p className="text-xs text-muted">
                                    {targetMedidor?.name || "Sin asignar"} · {targetRoute.clients.length} cliente{targetRoute.clients.length !== 1 ? "s" : ""} actuales
                                  </p>
                                </div>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    );
                  })()}

                  {/* Action */}
                  {isConfirming ? (
                    <div className="bg-success/10 border border-success/30 rounded-xl p-4 space-y-3">
                      <p className="text-sm text-success font-medium">
                        ¿Confirmas reasignar a <span className="font-bold capitalize">{targetRoute ? formatDate(targetRoute.date) : ""}</span> con {targetMedidor?.name || "el medidor asignado"}?
                      </p>
                      <div className="flex gap-2">
                        <Button variant="success" onClick={() => handleReassign(client.id, client.routeId)} className="flex-1">
                          <CheckCircle2 className="w-4 h-4" /> Confirmar Reasignación
                        </Button>
                        <Button variant="ghost" onClick={() => setConfirmId(null)}>
                          Cancelar
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Button
                      variant="primary"
                      onClick={() => setConfirmId(client.id)}
                      disabled={!targetId}
                      full
                    >
                      <RefreshCw className="w-4 h-4" /> Reasignar Cliente
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
