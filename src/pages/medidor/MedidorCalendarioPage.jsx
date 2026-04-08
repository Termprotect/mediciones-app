import { useMemo, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { ChevronLeft, ChevronRight } from "lucide-react";

const MONTHS_ES = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
const DAYS_SHORT = ["Lun","Mar","Mié","Jue","Vie","Sáb","Dom"];

export default function MedidorCalendarioPage({ routes, onSelectRoute }) {
  const { user } = useAuth();
  const myRoutes = routes.filter((r) => r.assignedTo === user.id && r.status !== "borrador");

  const [month, setMonth] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });

  const firstDay = new Date(month.year, month.month, 1);
  const lastDay = new Date(month.year, month.month + 1, 0);
  const startOffset = (firstDay.getDay() + 6) % 7;

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
    return myRoutes.filter((r) => r.date === ds);
  };

  const prev = () => setMonth((m) => (m.month === 0 ? { year: m.year - 1, month: 11 } : { ...m, month: m.month - 1 }));
  const next = () => setMonth((m) => (m.month === 11 ? { year: m.year + 1, month: 0 } : { ...m, month: m.month + 1 }));

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <button onClick={prev} className="p-2 rounded-xl text-muted hover:text-white hover:bg-surface transition-all cursor-pointer">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h2 className="text-lg font-bold text-white">{MONTHS_ES[month.month]} {month.year}</h2>
        <button onClick={next} className="p-2 rounded-xl text-muted hover:text-white hover:bg-surface transition-all cursor-pointer">
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1 mb-1">
        {DAYS_SHORT.map((d, idx) => (
          <div key={d} className={`text-center text-[11px] font-bold uppercase py-2 ${idx >= 5 ? "text-red-400" : "text-muted"}`}>{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {days.map((day, i) => {
          if (!day) return <div key={i} />;
          const dayRoutes = routesForDay(day);
          const ds = `${month.year}-${String(month.month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
          const isToday = ds === todayStr;
          const isWeekend = (i % 7) >= 5;
          return (
            <div key={i} className={`min-h-[90px] rounded-xl p-2 border transition-all ${
              isToday ? "bg-primary/10 border-primary/50" : isWeekend ? "bg-red-500/5 border-red-500/20" : dayRoutes.length > 0 ? "bg-surface border-border hover:border-primary/30" : "bg-dark/30 border-border/50"
            }`}>
              <div className={`text-xs font-bold mb-1 ${isToday ? "text-primary" : isWeekend ? "text-red-400" : "text-muted"}`}>{day}</div>
              {dayRoutes.map((r) => {
                const completed = r.clients.filter((c) => c.measurement).length;
                const total = r.clients.length;
                return (
                  <div key={r.id} onClick={() => onSelectRoute(r.id)}
                    className="text-[10px] bg-surface-hover rounded-md px-1.5 py-1 mb-0.5 cursor-pointer hover:bg-primary/20 transition-all">
                    <span className="font-medium text-white">{total} cli.</span>
                    <span className={`ml-1 ${completed === total ? "text-success" : "text-muted"}`}>{completed}/{total}</span>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}
