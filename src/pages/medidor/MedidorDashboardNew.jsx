import { useState, useMemo } from "react";
import { CITIES } from "../../lib/constants";
import { formatDate } from "../../lib/utils";
import { useAuth } from "../../context/AuthContext";
import CityBadge from "../../components/ui/CityBadge";
import ProgressBar from "../../components/ui/ProgressBar";
import EmptyState from "../../components/ui/EmptyState";
import {
  CheckCircle2, Clock, CalendarDays,
  ChevronLeft, ChevronRight, AlertTriangle,
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

function toDateStr(d) { return d.toISOString().split("T")[0]; }

export default function MedidorDashboardNew({ routes, onSelectRoute }) {
  const { user } = useAuth();
  const [weekOffset, setWeekOffset] = useState(0);

  const myRoutes = routes.filter((r) => r.assignedTo === user.id && r.status !== "borrador");
  const today = new Date();
  const todayStr = toDateStr(today);
  const weekDays = useMemo(() => getWeekDays(weekOffset), [weekOffset]);

  const todayRoutes = myRoutes.filter((r) => r.date === todayStr);
  const todayClients = todayRoutes.reduce((sum, r) => sum + r.clients.length, 0);

  const weekStart = toDateStr(weekDays[0]);
  const weekEnd = toDateStr(weekDays[6]);
  const weekRoutes = myRoutes.filter((r) => r.date >= weekStart && r.date <= weekEnd);
  const weekCompleted = weekRoutes.reduce((sum, r) => sum + r.clients.filter((c) => c.measurement).length, 0);
  const weekTotal = weekRoutes.reduce((sum, r) => sum + r.clients.length, 0);
  const weekPct = weekTotal > 0 ? Math.round((weekCompleted / weekTotal) * 100) : 0;

  const isReprogramada = (c) => c.status === "reprogramar" || c.status === "reprogramado";
  const totalPending = myRoutes.filter((r) => r.date >= todayStr)
    .reduce((sum, r) => sum + r.clients.filter((c) => !c.measurement && !isReprogramada(c)).length, 0);

  const measurementsPerDay = weekDays.map((d) => {
    const ds = toDateStr(d);
    return myRoutes.filter((r) => r.date === ds).reduce((sum, r) => sum + r.clients.length, 0);
  });

  const isOverdue = (r) => r.date < todayStr && r.status !== "completado" && r.clients.some((c) => !c.measurement && !isReprogramada(c));

  // Filter out routes where ALL clients have been reprogrammed (no active clients left)
  const routesWithActiveClients = myRoutes.filter((r) =>
    r.clients.some((c) => !isReprogramada(c))
  );

  // Sort upcoming first
  const sorted = [...routesWithActiveClients].sort((a, b) => {
    const aFuture = a.date >= todayStr ? 0 : 1;
    const bFuture = b.date >= todayStr ? 0 : 1;
    if (aFuture !== bFuture) return aFuture - bFuture;
    return aFuture === 0 ? a.date.localeCompare(b.date) : b.date.localeCompare(a.date);
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Weekly Calendar with nav */}
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
      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        <div className="bg-surface border border-border rounded-2xl p-5">
          <div className="flex items-center gap-2 text-muted text-xs font-medium mb-3">
            <CalendarDays className="w-4 h-4" /> Hoy
          </div>
          <div className="text-3xl font-bold text-white">{todayClients}</div>
          <div className="text-xs text-muted mt-1">cliente{todayClients !== 1 ? "s" : ""}</div>
        </div>
        <div className="bg-surface border border-border rounded-2xl p-5">
          <div className="flex items-center gap-2 text-muted text-xs font-medium mb-3">
            <CheckCircle2 className="w-4 h-4" /> Completadas
          </div>
          <div className="text-3xl font-bold text-white">{weekCompleted}</div>
          <div className="text-xs text-success font-medium mt-1">{weekPct}% semana</div>
        </div>
        <div className="bg-surface border border-border rounded-2xl p-5">
          <div className="flex items-center gap-2 text-muted text-xs font-medium mb-3">
            <Clock className="w-4 h-4" /> Pendientes
          </div>
          <div className="text-3xl font-bold text-white">{totalPending}</div>
          <div className="text-xs text-warning font-medium mt-1">por medir</div>
        </div>
      </div>

      {/* Routes list */}
      <div>
        <h2 className="text-base font-bold text-white mb-4">Mis jornadas</h2>
        {sorted.length === 0 ? (
          <EmptyState icon="📭" text="No tienes jornadas asignadas." />
        ) : (
          <div className="space-y-3">
            {sorted.map((r) => {
              const activeClients = r.clients.filter((c) => !isReprogramada(c));
              const completed = activeClients.filter((c) => c.measurement).length;
              const total = activeClients.length;
              const allDone = completed === total && total > 0;
              const overdue = isOverdue(r);
              return (
                <div key={r.id} onClick={() => onSelectRoute(r.id)}
                  className={`bg-surface border rounded-2xl p-5 cursor-pointer hover:border-primary/50 transition-all ${overdue ? "border-danger/50" : allDone ? "border-success" : "border-border"}`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {overdue && <AlertTriangle className="w-4 h-4 text-danger" />}
                      <span className="font-bold text-base capitalize">{formatDate(r.date)}</span>
                    </div>
                    <CityBadge cityId={r.city} />
                  </div>
                  {overdue && (
                    <div className="text-[11px] text-danger font-semibold mb-1">Vencida — Se recomienda reprogramar</div>
                  )}
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
