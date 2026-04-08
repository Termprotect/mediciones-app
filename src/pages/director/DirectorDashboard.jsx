import { useState, useMemo } from "react";
import { CITIES, USERS } from "../../lib/constants";
import { formatDate } from "../../lib/utils";
import Button from "../../components/ui/Button";
import StatusBadge from "../../components/ui/StatusBadge";
import CityBadge from "../../components/ui/CityBadge";
import ProgressBar from "../../components/ui/ProgressBar";
import EmptyState from "../../components/ui/EmptyState";
import {
  Plus,
  TrendingUp,
  CheckCircle2,
  Clock,
  Users as UsersIcon,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
} from "lucide-react";

const DAYS_ES = ["DOM", "LUN", "MAR", "MIÉ", "JUE", "VIE", "SÁB"];

function getWeekDays(offset = 0) {
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0=Sun
  const monday = new Date(today);
  monday.setDate(today.getDate() - ((dayOfWeek + 6) % 7) + offset * 7);

  const days = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    days.push(d);
  }
  return days;
}

function toDateStr(d) {
  return d.toISOString().split("T")[0];
}

export default function DirectorDashboard({
  routes,
  onCreateRoute,
  onEditRoute,
}) {
  const [filterCity, setFilterCity] = useState("all");
  const [weekOffset, setWeekOffset] = useState(0);

  const today = new Date();
  const todayStr = toDateStr(today);
  const weekDays = useMemo(() => getWeekDays(weekOffset), [weekOffset]);

  // Stats
  const todayRoutes = routes.filter((r) => r.date === todayStr);
  const todayMeasurements = todayRoutes.reduce(
    (sum, r) => sum + r.clients.length,
    0
  );

  // This week measurements completed
  const weekStart = toDateStr(weekDays[0]);
  const weekEnd = toDateStr(weekDays[6]);
  const weekRoutes = routes.filter(
    (r) => r.date >= weekStart && r.date <= weekEnd
  );
  const weekCompleted = weekRoutes.reduce(
    (sum, r) => sum + r.clients.filter((c) => c.measurement).length,
    0
  );
  const weekTotal = weekRoutes.reduce((sum, r) => sum + r.clients.length, 0);
  const weekPct = weekTotal > 0 ? Math.round((weekCompleted / weekTotal) * 100) : 0;

  // Pending (not completed)
  const pendingRoutes = routes.filter(
    (r) => r.status !== "completado" && r.date >= todayStr
  );
  const pendingCount = pendingRoutes.reduce(
    (sum, r) => sum + r.clients.filter((c) => !c.measurement && c.status !== "reprogramar").length,
    0
  );
  const rescheduledCount = routes.reduce(
    (sum, r) => sum + r.clients.filter((c) => c.status === "reprogramar").length,
    0
  );

  // Active medidores
  const activeMedidores = new Set(
    todayRoutes.map((r) => r.assignedTo).filter(Boolean)
  );
  const totalMedidores = USERS.filter((u) => u.role === "medidor").length;

  // Yesterday comparison
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const yesterdayStr = toDateStr(yesterday);
  const yesterdayMeds = routes
    .filter((r) => r.date === yesterdayStr)
    .reduce((sum, r) => sum + r.clients.length, 0);
  const medDiff = todayMeasurements - yesterdayMeds;

  // Measurements per day in week
  const measurementsPerDay = weekDays.map((d) => {
    const ds = toDateStr(d);
    return routes
      .filter((r) => r.date === ds)
      .reduce((sum, r) => sum + r.clients.length, 0);
  });

  // Jornadas de hoy filtered
  const filtered =
    filterCity === "all"
      ? todayRoutes
      : todayRoutes.filter((r) => r.city === filterCity);

  // All routes for jornadas section (exclude completed, sorted by date)
  const allFiltered =
    filterCity === "all"
      ? routes.filter((r) => r.status !== "completado")
      : routes.filter((r) => r.city === filterCity && r.status !== "completado");
  const allSorted = [...allFiltered].sort((a, b) => {
    const aFuture = a.date >= todayStr ? 0 : 1;
    const bFuture = b.date >= todayStr ? 0 : 1;
    if (aFuture !== bFuture) return aFuture - bFuture;
    return aFuture === 0 ? a.date.localeCompare(b.date) : b.date.localeCompare(a.date);
  });

  const isOverdue = (r) => r.date < todayStr && r.status !== "completado" && r.clients.some((c) => !c.measurement && c.status !== "reprogramar");

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Weekly Calendar Strip */}
      <div className="bg-surface border border-border rounded-2xl p-5">
        <div className="flex items-center gap-2">
          <button onClick={() => setWeekOffset(weekOffset - 1)} className="p-2 rounded-xl text-muted hover:text-white hover:bg-dark transition-all cursor-pointer flex-shrink-0">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div className="flex gap-2 sm:gap-3 flex-1">
          {weekDays.map((d, i) => {
            const ds = toDateStr(d);
            const isToday = ds === todayStr;
            const isSunday = d.getDay() === 0;
            const isSaturday = d.getDay() === 6;
            const isWeekend = isSunday || isSaturday;
            const meds = measurementsPerDay[i];
            return (
              <div
                key={i}
                className={`flex-1 flex flex-col items-center py-3 px-1 rounded-xl transition-all ${
                  isToday
                    ? "bg-primary text-dark"
                    : isWeekend
                    ? "bg-red-500/10 text-red-400"
                    : "text-muted"
                }`}
              >
                <span className="text-[10px] font-bold uppercase tracking-wider">
                  {DAYS_ES[d.getDay()]}
                </span>
                <span
                  className={`text-xl font-bold mt-1 ${
                    isToday ? "text-dark" : "text-white"
                  }`}
                >
                  {d.getDate()}
                </span>
                <span
                  className={`text-[10px] mt-1 ${
                    isToday ? "text-dark/70" : "text-muted"
                  }`}
                >
                  {meds > 0 ? `${meds} med.` : "—"}
                </span>
              </div>
            );
          })}
          </div>
          <button onClick={() => setWeekOffset(weekOffset + 1)} className="p-2 rounded-xl text-muted hover:text-white hover:bg-dark transition-all cursor-pointer flex-shrink-0">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        {weekOffset !== 0 && (
          <div className="text-center mt-2">
            <button onClick={() => setWeekOffset(0)} className="text-[11px] text-primary hover:underline cursor-pointer">Volver a esta semana</button>
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Mediciones hoy */}
        <div className="bg-surface border border-border rounded-2xl p-5">
          <div className="flex items-center gap-2 text-muted text-xs font-medium mb-3">
            <CalendarDays className="w-4 h-4" />
            Mediciones hoy
          </div>
          <div className="text-3xl font-bold text-white">
            {todayMeasurements}
          </div>
          {medDiff !== 0 && (
            <div
              className={`text-xs font-medium mt-1 flex items-center gap-1 ${
                medDiff > 0 ? "text-success" : "text-danger"
              }`}
            >
              <TrendingUp
                className={`w-3 h-3 ${medDiff < 0 ? "rotate-180" : ""}`}
              />
              {medDiff > 0 ? "+" : ""}
              {medDiff} que ayer
            </div>
          )}
        </div>

        {/* Completadas esta semana */}
        <div className="bg-surface border border-border rounded-2xl p-5">
          <div className="flex items-center gap-2 text-muted text-xs font-medium mb-3">
            <CheckCircle2 className="w-4 h-4" />
            Completadas esta semana
          </div>
          <div className="text-3xl font-bold text-white">{weekCompleted}</div>
          <div className="text-xs text-success font-medium mt-1">
            {weekPct}% del objetivo
          </div>
        </div>

        {/* Pendientes */}
        <div className="bg-surface border border-border rounded-2xl p-5">
          <div className="flex items-center gap-2 text-muted text-xs font-medium mb-3">
            <Clock className="w-4 h-4" />
            Pendientes
          </div>
          <div className="text-3xl font-bold text-white">{pendingCount}</div>
          {rescheduledCount > 0 && (
            <div className="text-xs text-warning font-medium mt-1">
              {rescheduledCount} reprogramadas
            </div>
          )}
        </div>

        {/* Medidores activos */}
        <div className="bg-surface border border-border rounded-2xl p-5">
          <div className="flex items-center gap-2 text-muted text-xs font-medium mb-3">
            <UsersIcon className="w-4 h-4" />
            Medidores activos
          </div>
          <div className="text-3xl font-bold text-white">
            {activeMedidores.size}
          </div>
          <div className="text-xs text-success font-medium mt-1">
            {activeMedidores.size === totalMedidores
              ? "Todos disponibles"
              : `${activeMedidores.size} de ${totalMedidores}`}
          </div>
        </div>
      </div>

      {/* Jornadas de hoy */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-white">Jornadas de hoy</h2>
          <Button onClick={() => onCreateRoute(null)} className="text-xs">
            <Plus className="w-3.5 h-3.5" /> Nueva Jornada
          </Button>
        </div>

        {/* City filter */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
          <button
            onClick={() => setFilterCity("all")}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer border whitespace-nowrap ${
              filterCity === "all"
                ? "bg-primary text-dark border-primary"
                : "bg-surface text-muted border-border"
            }`}
          >
            Todas ({todayRoutes.length})
          </button>
          {CITIES.map((c) => {
            const count = todayRoutes.filter((r) => r.city === c.id).length;
            return (
              <button
                key={c.id}
                onClick={() => setFilterCity(c.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer border whitespace-nowrap ${
                  filterCity === c.id
                    ? "text-white border-transparent"
                    : "bg-surface text-muted border-border"
                }`}
                style={
                  filterCity === c.id
                    ? { backgroundColor: c.color, color: "#fff" }
                    : {}
                }
              >
                {c.label} ({count})
              </button>
            );
          })}
        </div>

        {/* Today routes */}
        {filtered.length === 0 ? (
          <EmptyState
            icon="📋"
            text="No hay jornadas para hoy con este filtro."
          />
        ) : (
          <div className="space-y-3">
            {filtered.map((r) => {
              const medidor = USERS.find((m) => m.id === r.assignedTo);
              const completed = r.clients.filter((c) => c.measurement).length;
              const total = r.clients.length;
              const overdue = isOverdue(r);
              return (
                <div
                  key={r.id}
                  onClick={() => onEditRoute(r.id)}
                  className={`bg-surface border rounded-2xl p-4 sm:p-5 flex items-center gap-4 cursor-pointer hover:border-primary/50 transition-all ${overdue ? "border-danger/50" : "border-border"}`}
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg flex-shrink-0 ${overdue ? "bg-danger text-white" : "bg-primary text-dark"}`}>
                    {overdue ? <AlertTriangle className="w-5 h-5" /> : (medidor?.name?.charAt(0) || "?")}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-sm sm:text-base capitalize">
                      {formatDate(r.date)}
                    </div>
                    {overdue && (
                      <div className="text-[11px] text-danger font-semibold mt-0.5">Vencida — Se recomienda reprogramar</div>
                    )}
                    <div className="text-xs text-muted mt-1 flex flex-wrap items-center gap-2">
                      <span>{medidor?.name || "Sin asignar"}</span>
                      <span>·</span>
                      <span>
                        {total} cliente{total !== 1 ? "s" : ""}
                      </span>
                      <CityBadge cityId={r.city} />
                    </div>
                    {r.clients.filter(c => c.businessName).length > 0 && (
                      <div className="text-[11px] text-primary font-medium mt-0.5 truncate">
                        {r.clients.filter(c => c.businessName).slice(0, 3).map(c => c.businessName).join(" · ")}
                        {r.clients.filter(c => c.businessName).length > 3 && ` +${r.clients.filter(c => c.businessName).length - 3} más`}
                      </div>
                    )}
                    <ProgressBar
                      current={completed}
                      total={total}
                      className="mt-2 max-w-[180px]"
                    />
                  </div>
                  <StatusBadge status={r.status} />
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* All Jornadas (upcoming/recent) */}
      {allSorted.length > filtered.length && (
        <div>
          <h2 className="text-base font-bold text-white mb-4">
            Todas las jornadas
          </h2>
          <div className="space-y-3">
            {allSorted
              .filter((r) => r.date !== todayStr || filterCity !== "all")
              .slice(0, 10)
              .map((r) => {
                const medidor = USERS.find((m) => m.id === r.assignedTo);
                const completed = r.clients.filter(
                  (c) => c.measurement
                ).length;
                const total = r.clients.length;
                const overdue = isOverdue(r);
                return (
                  <div
                    key={r.id}
                    onClick={() => onEditRoute(r.id)}
                    className={`bg-surface border rounded-2xl p-4 flex items-center gap-4 cursor-pointer hover:border-primary/50 transition-all ${overdue ? "border-danger/50" : "border-border"}`}
                  >
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold flex-shrink-0 ${overdue ? "bg-danger text-white" : "bg-primary text-dark"}`}>
                      {overdue ? <AlertTriangle className="w-4 h-4" /> : (medidor?.name?.charAt(0) || "?")}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-sm capitalize">
                        {formatDate(r.date)}
                      </div>
                      {overdue && (
                        <div className="text-[11px] text-danger font-semibold mt-0.5">Vencida — Se recomienda reprogramar</div>
                      )}
                      <div className="text-xs text-muted mt-1 flex flex-wrap items-center gap-2">
                        <span>{medidor?.name || "Sin asignar"}</span>
                        <span>·</span>
                        <span>
                          {total} cliente{total !== 1 ? "s" : ""}
                        </span>
                        <CityBadge cityId={r.city} />
                      </div>
                      {r.clients.filter(c => c.businessName).length > 0 && (
                        <div className="text-[11px] text-primary font-medium mt-0.5 truncate">
                          {r.clients.filter(c => c.businessName).slice(0, 3).map(c => c.businessName).join(" · ")}
                          {r.clients.filter(c => c.businessName).length > 3 && ` +${r.clients.filter(c => c.businessName).length - 3} más`}
                        </div>
                      )}
                      <ProgressBar
                        current={completed}
                        total={total}
                        className="mt-2 max-w-[160px]"
                      />
                    </div>
                    <StatusBadge status={r.status} />
                  </div>
                );
              })}
          </div>
        </div>
      )}
    </div>
  );
}
