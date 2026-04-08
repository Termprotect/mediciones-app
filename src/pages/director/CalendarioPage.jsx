import { useMemo } from "react";
import { CITIES, USERS } from "../../lib/constants";
import CityBadge from "../../components/ui/CityBadge";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { useState } from "react";

const MONTHS_ES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];
const DAYS_SHORT = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

export default function CalendarioPage({ routes, onEditRoute, onCreateRoute }) {
  const [month, setMonth] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });

  const firstDay = new Date(month.year, month.month, 1);
  const lastDay = new Date(month.year, month.month + 1, 0);
  const startOffset = (firstDay.getDay() + 6) % 7; // Monday = 0

  const days = useMemo(() => {
    const result = [];
    for (let i = 0; i < startOffset; i++) result.push(null);
    for (let d = 1; d <= lastDay.getDate(); d++) result.push(d);
    return result;
  }, [month.year, month.month, startOffset, lastDay]);

  const todayStr = new Date().toISOString().split("T")[0];

  const routesForDay = (day) => {
    if (!day) return [];
    const ds = `${month.year}-${String(month.month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return routes.filter((r) => r.date === ds);
  };

  const prev = () => {
    setMonth((m) => (m.month === 0 ? { year: m.year - 1, month: 11 } : { ...m, month: m.month - 1 }));
  };
  const next = () => {
    setMonth((m) => (m.month === 11 ? { year: m.year + 1, month: 0 } : { ...m, month: m.month + 1 }));
  };

  return (
    <div className="max-w-5xl mx-auto">
      {/* Month nav */}
      <div className="flex items-center justify-between mb-6">
        <button onClick={prev} className="p-2 rounded-xl text-muted hover:text-white hover:bg-surface transition-all cursor-pointer">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h2 className="text-lg font-bold text-white">
          {MONTHS_ES[month.month]} {month.year}
        </h2>
        <button onClick={next} className="p-2 rounded-xl text-muted hover:text-white hover:bg-surface transition-all cursor-pointer">
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 gap-1 mb-1">
        {DAYS_SHORT.map((d, i) => (
          <div key={d} className={`text-center text-[11px] font-bold uppercase py-2 ${i >= 5 ? "text-red-400" : "text-muted"}`}>
            {d}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((day, i) => {
          if (!day) return <div key={i} />;
          const dayRoutes = routesForDay(day);
          const ds = `${month.year}-${String(month.month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
          const isToday = ds === todayStr;
          const colInWeek = i % 7;
          const isWeekend = colInWeek >= 5;

          return (
            <div
              key={i}
              className={`group min-h-[90px] rounded-xl p-2 border transition-all ${
                isToday
                  ? "bg-primary/10 border-primary/50"
                  : isWeekend
                  ? "bg-red-500/5 border-red-500/20"
                  : dayRoutes.length > 0
                  ? "bg-surface border-border hover:border-primary/30"
                  : "bg-dark/30 border-border/50 hover:border-primary/30"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className={`text-xs font-bold ${isToday ? "text-primary" : isWeekend ? "text-red-400" : "text-muted"}`}>
                  {day}
                </span>
                {onCreateRoute && ds >= todayStr && (
                  <button
                    onClick={(e) => { e.stopPropagation(); onCreateRoute(null, ds); }}
                    className="w-5 h-5 rounded-md bg-primary/20 text-primary hover:bg-primary hover:text-dark flex items-center justify-center transition-all cursor-pointer opacity-0 group-hover:opacity-100"
                    title="Crear jornada"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                )}
              </div>
              {dayRoutes.slice(0, 3).map((r) => {
                const medidor = USERS.find((m) => m.id === r.assignedTo);
                return (
                  <div
                    key={r.id}
                    onClick={() => onEditRoute(r.id)}
                    className="text-[10px] bg-surface-hover rounded-md px-1.5 py-0.5 mb-0.5 cursor-pointer hover:bg-primary/20 transition-all truncate"
                  >
                    <span className="font-medium text-white">{medidor?.name?.slice(0, 6) || "?"}</span>
                    <span className="text-muted"> · {r.clients.length}c</span>
                  </div>
                );
              })}
              {dayRoutes.length > 3 && (
                <div className="text-[9px] text-muted text-center">+{dayRoutes.length - 3} más</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
