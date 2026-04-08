import { useState, useMemo } from "react";
import { CITIES, USERS } from "../../lib/constants";
import { formatDate } from "../../lib/utils";
import { useAuth } from "../../context/AuthContext";
import Button from "../../components/ui/Button";
import StatusBadge from "../../components/ui/StatusBadge";
import ProgressBar from "../../components/ui/ProgressBar";
import EmptyState from "../../components/ui/EmptyState";
import {
  Plus, TrendingUp, CheckCircle2, Clock, Users as UsersIcon, CalendarDays,
  ChevronLeft, ChevronRight, AlertTriangle, RefreshCw,
} from "lucide-react";

const DAYS_ES = ["DOM", "LUN", "MAR", "MIÉ", "JUE", "VIE", "SÁB"];

function getWeekDays(offset = 0) {
  const today = new Date();
  const dayOfWeek = today.getDay();
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

export default function LogisticaDashboardNew({ routes, onCreateRoute, onEditRoute }) {
  const { user } = useAuth();
  const [weekOffset, setWeekOffset] = useState(0);

  const myRoutes = routes.filter((r) => r.city === user.city);
  const today = new Date();
  const todayStr = toDateStr(today);
  const weekDays = useMemo(() => getWeekDays(weekOffset), [weekOffset]);

  // Stats
  const todayRoutes = myRoutes.filter((r) => r.date === todayStr);
  const todayMeasurements = todayRoutes.reduce((sum, r) => sum + r.clients.length, 0);

  const weekStart = toDateStr(weekDays[0]);
  const weekEnd = toDateStr(weekDays[6]);
  const weekRoutes = myRoutes.filter((r) => r.date >= weekStart && r.date <= weekEnd);
  const weekCompleted = weekRoutes.reduce((sum, r) => sum + r.clients.filter((c) => c.measurement).length, 0);
  const weekTotal = weekRoutes.reduce((sum, r) => sum + r.clients.length, 0);
  const weekPct = weekTotal > 0 ? Math.round((weekCompleted / weekTotal) * 100) : 0;

  const pendingCount = myRoutes.filter((r) => r.status !== "completado" && r.date >= todayStr)
    .reduce((sum, r) => sum + r.clients.filter((c) => !c.measurement && c.status !== "reprogramar").length, 0);
  const rescheduledCount = myRoutes.reduce((sum, r) => sum + r.clients.filter((c) => c.status === "reprogramar").length, 0);

  const activeMedidores = new Set(todayRoutes.map((r) => r.assignedTo).filter(Boolean));
  const cityMedidores = USERS.filter((u) => u.role === "medidor" && (u.city === user.city || u.city === "all"));

  const measurementsPerDay = weekDays.map((d) => {
    const ds = toDateStr(d);
    return myRoutes.filter((r) => r.date === ds).reduce((sum, r) => sum + r.clients.length, 0);
  });

  const isOverdue = (r) => r.date < todayStr && r.status !== "completado" && r.clients.some((c) => !c.measurement && c.status !== "reprogramar");

  // Jornadas sorted by upcoming first (exclude completed)
  const upcoming = [...myRoutes].filter((r) => r.status !== "completado").sort((a, b) => {
    const aFuture = a.date >= todayStr ? 0 : 1;
    const bFuture = b.date >= todayStr ? 0 : 1;
    if (aFuture !== bFuture) return aFuture - bFuture;
    return aFuture === 0 ? a.date.localeCompare(b.date) : b.date.localeCompare(a.date);
  });

  const cityLabel = CITIES.find((c) => c.id === user.city)?.label || "";

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Weekly Calendar Strip with navigation */}
      <div className="bg-surface border border-border rounded-2xl p-5">
        <div className="flex items-center gap-2">
          <button onClick={() => setWeekOffset(weekOffset - 1)} className="p-2 rounded-xl text-muted hover:text-white hover:bg-dark transition-all cursor-pointer flex-shrink-0">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div className="flex gap-2 sm:gap-3 flex-1">
            {weekDays.map((d, i) => {
              const ds = toDateStr(d);
              const isToday = ds === todayStr;
              const isWeekend = d.getDay() === 0 || d.getDay() === 6;
              const meds = measurementsPerDay[i];
              return (
                <div key={i} className={`flex-1 flex flex-col items-center py-3 px-1 rounded-xl transition-all ${
                  isToday ? "bg-primary text-dark" : isWeekend ? "bg-red-500/10 text-red-400" : "text-muted"
                }`}>
                  <span className="text-[10px] font-bold uppercase tracking-wider">{DAYS_ES[d.getDay()]}</span>
                  <span className={`text-xl font-bold mt-1 ${isToday ? "text-dark" : "text-white"}`}>{d.getDate()}</span>
                  <span className={`text-[10px] mt-1 ${isToday ? "text-dark/70" : "text-muted"}`}>{meds > 0 ? `${meds} med.` : "—"}</span>
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
        <div className="bg-surface border border-border rounded-2xl p-5">
          <div className="flex items-center gap-2 text-muted text-xs font-medium mb-3">
            <CalendarDays className="w-4 h-4" /> Mediciones hoy
          </div>
          <div className="text-3xl font-bold text-white">{todayMeasurements}</div>
          <div className="text-xs text-muted mt-1">{cityLabel}</div>
        </div>
        <div className="bg-surface border border-border rounded-2xl p-5">
          <div className="flex items-center gap-2 text-muted text-xs font-medium mb-3">
            <CheckCircle2 className="w-4 h-4" /> Completadas semana
          </div>
          <div className="text-3xl font-bold text-white">{weekCompleted}</div>
          <div className="text-xs text-success font-medium mt-1">{weekPct}% del objetivo</div>
        </div>
        <div className="bg-surface border border-border rounded-2xl p-5">
          <div className="flex items-center gap-2 text-muted text-xs font-medium mb-3">
            <Clock className="w-4 h-4" /> Pendientes
          </div>
          <div className="text-3xl font-bold text-white">{pendingCount}</div>
          {rescheduledCount > 0 && <div className="text-xs text-warning font-medium mt-1">{rescheduledCount} reprogramadas</div>}
        </div>
        <div className="bg-surface border border-border rounded-2xl p-5">
          <div className="flex items-center gap-2 text-muted text-xs font-medium mb-3">
            <UsersIcon className="w-4 h-4" /> Medidores activos
          </div>
          <div className="text-3xl font-bold text-white">{activeMedidores.size}</div>
          <div className="text-xs text-success font-medium mt-1">
            {activeMedidores.size === cityMedidores.length ? "Todos disponibles" : `${activeMedidores.size} de ${cityMedidores.length}`}
          </div>
        </div>
      </div>

      {/* Jornadas */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-white">Próximas jornadas</h2>
          <Button onClick={onCreateRoute} className="text-xs"><Plus className="w-3.5 h-3.5" /> Nueva Jornada</Button>
        </div>
        {upcoming.length === 0 ? (
          <EmptyState icon="📋" text="No hay jornadas para tu ciudad." />
        ) : (
          <div className="space-y-3">
            {upcoming.slice(0, 15).map((r) => {
              const medidor = USERS.find((m) => m.id === r.assignedTo);
              const completed = r.clients.filter((c) => c.measurement).length;
              const total = r.clients.length;
              const overdue = isOverdue(r);
              const reprogramCount = r.clients.filter((c) => c.status === "reprogramar").length;
              const hasReprogram = reprogramCount > 0;
              return (
                <div key={r.id} onClick={() => onEditRoute(r.id)}
                  className={`bg-surface border rounded-2xl p-4 sm:p-5 flex items-center gap-4 cursor-pointer hover:border-primary/50 transition-all ${overdue ? "border-danger/50" : hasReprogram ? "border-orange-500/50" : "border-border"}`}>
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg flex-shrink-0 ${overdue ? "bg-danger text-white" : hasReprogram ? "bg-orange-500/20 text-orange-400" : "bg-primary text-dark"}`}>
                    {overdue ? <AlertTriangle className="w-5 h-5" /> : hasReprogram ? <RefreshCw className="w-5 h-5" /> : (medidor?.name?.charAt(0) || "?")}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-sm sm:text-base capitalize">{formatDate(r.date)}</div>
                    {overdue && (
                      <div className="text-[11px] text-danger font-semibold mt-0.5">Vencida — Se recomienda reprogramar</div>
                    )}
                    {hasReprogram && !overdue && (
                      <div className="text-[11px] text-orange-400 font-semibold mt-0.5 flex items-center gap-1">
                        <RefreshCw className="w-3 h-3" /> {reprogramCount} cliente{reprogramCount !== 1 ? "s" : ""} pendiente{reprogramCount !== 1 ? "s" : ""} de reprogramar
                      </div>
                    )}
                    <div className="text-xs text-muted mt-1">
                      {medidor?.name || "Sin asignar"} · {total} cliente{total !== 1 ? "s" : ""}
                    </div>
                    {r.clients.filter(c => c.businessName).length > 0 && (
                      <div className="text-[11px] text-primary font-medium mt-0.5 truncate">
                        {r.clients.filter(c => c.businessName).slice(0, 3).map(c => c.businessName).join(" · ")}
                        {r.clients.filter(c => c.businessName).length > 3 && ` +${r.clients.filter(c => c.businessName).length - 3} más`}
                      </div>
                    )}
                    <ProgressBar current={completed} total={total} className="mt-2 max-w-[180px]" />
                  </div>
                  <StatusBadge status={r.status} />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
