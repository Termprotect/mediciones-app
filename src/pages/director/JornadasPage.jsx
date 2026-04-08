import { useState } from "react";
import { CITIES, USERS } from "../../lib/constants";
import { formatDate } from "../../lib/utils";
import Button from "../../components/ui/Button";
import StatusBadge from "../../components/ui/StatusBadge";
import CityBadge from "../../components/ui/CityBadge";
import ProgressBar from "../../components/ui/ProgressBar";
import EmptyState from "../../components/ui/EmptyState";
import { Plus, Search, AlertTriangle, ChevronDown } from "lucide-react";

const MONTHS_ES = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];

export default function JornadasPage({ routes, onCreateRoute, onEditRoute }) {
  const [filterCity, setFilterCity] = useState("all");
  const [search, setSearch] = useState("");
  const [filterYear, setFilterYear] = useState("all");
  const [filterMonth, setFilterMonth] = useState("all");

  // Get available years from routes
  const availableYears = [...new Set(routes.map((r) => r.date?.slice(0, 4)).filter(Boolean))].sort();

  const filtered = routes.filter((r) => {
    if (filterCity !== "all" && r.city !== filterCity) return false;
    if (filterYear !== "all" && r.date?.slice(0, 4) !== filterYear) return false;
    if (filterMonth !== "all" && r.date?.slice(5, 7) !== filterMonth) return false;
    if (search) {
      const q = search.toLowerCase();
      const medidor = USERS.find((m) => m.id === r.assignedTo);
      const matchMedidor = medidor?.name?.toLowerCase().includes(q);
      const matchClient = r.clients.some((c) => c.name.toLowerCase().includes(q) || c.businessName?.toLowerCase().includes(q));
      const matchDate = formatDate(r.date).toLowerCase().includes(q);
      if (!matchMedidor && !matchClient && !matchDate) return false;
    }
    return true;
  });

  const sorted = [...filtered].sort((a, b) => b.date.localeCompare(a.date));
  const todayStr = new Date().toISOString().split("T")[0];
  const isOverdue = (r) => r.date < todayStr && r.status !== "completado" && r.clients.some((c) => !c.measurement && c.status !== "reprogramar");

  return (
    <div className="max-w-5xl mx-auto space-y-5">
      {/* Actions */}
      <div className="flex flex-wrap items-center gap-3">
        <Button onClick={() => onCreateRoute(null)}>
          <Plus className="w-4 h-4" /> Nueva Jornada
        </Button>
        <div className="flex-1 max-w-xs">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por medidor, cliente, fecha..."
              className="w-full pl-9 pr-4 py-2.5 bg-dark border-2 border-border rounded-xl text-white text-sm placeholder:text-muted/50 outline-none focus:border-primary transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Year/Month filter */}
      <div className="flex gap-3">
        <div className="relative">
          <select
            value={filterYear}
            onChange={(e) => setFilterYear(e.target.value)}
            className="appearance-none bg-dark border-2 border-border rounded-xl text-white text-xs font-semibold px-3 py-2 pr-8 outline-none focus:border-primary transition-colors cursor-pointer"
          >
            <option value="all">Todos los años</option>
            {availableYears.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted pointer-events-none" />
        </div>
        <div className="relative">
          <select
            value={filterMonth}
            onChange={(e) => setFilterMonth(e.target.value)}
            className="appearance-none bg-dark border-2 border-border rounded-xl text-white text-xs font-semibold px-3 py-2 pr-8 outline-none focus:border-primary transition-colors cursor-pointer"
          >
            <option value="all">Todos los meses</option>
            {MONTHS_ES.map((m, i) => (
              <option key={i} value={String(i + 1).padStart(2, "0")}>{m}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted pointer-events-none" />
        </div>
      </div>

      {/* City filter */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setFilterCity("all")}
          className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer border whitespace-nowrap ${
            filterCity === "all" ? "bg-primary text-dark border-primary" : "bg-surface text-muted border-border"
          }`}
        >
          Todas ({routes.length})
        </button>
        {CITIES.map((c) => {
          const count = routes.filter((r) => r.city === c.id).length;
          return (
            <button
              key={c.id}
              onClick={() => setFilterCity(c.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer border whitespace-nowrap ${
                filterCity === c.id ? "text-white border-transparent" : "bg-surface text-muted border-border"
              }`}
              style={filterCity === c.id ? { backgroundColor: c.color, color: "#fff" } : {}}
            >
              {c.label} ({count})
            </button>
          );
        })}
      </div>

      {/* Routes list */}
      {sorted.length === 0 ? (
        <EmptyState icon="📋" text="No hay jornadas con este filtro." />
      ) : (
        <div className="space-y-3">
          {sorted.map((r) => {
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
                  <div className="font-bold text-sm sm:text-base capitalize">{formatDate(r.date)}</div>
                  {overdue && (
                    <div className="text-[11px] text-danger font-semibold mt-0.5">Vencida — Se recomienda reprogramar</div>
                  )}
                  <div className="text-xs text-muted mt-1 flex flex-wrap items-center gap-2">
                    <span>{medidor?.name || "Sin asignar"}</span>
                    <span>·</span>
                    <span>{total} cliente{total !== 1 ? "s" : ""}</span>
                    <CityBadge cityId={r.city} />
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
  );
}
