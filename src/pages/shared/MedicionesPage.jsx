import { useState } from "react";
import { USERS, CITIES, COMERCIALES, WINDOW_TYPES, COLORS, PERSIANAS, MEDIDA_PERSIANA_OPTS, ACCIONAMIENTOS, TIPO_MOTOR, GUIAS, MOSQUITEROS, TAPAJUNTAS, VIDRIOS, TIPOS_SIN_HOJA_PRINCIPAL, getLabel } from "../../lib/constants";
import { formatDate } from "../../lib/utils";
import { generateMeasurementPdf } from "../../lib/pdfGenerator";
import StatusBadge from "../../components/ui/StatusBadge";
import CityBadge from "../../components/ui/CityBadge";
import ProgressBar from "../../components/ui/ProgressBar";
import EmptyState from "../../components/ui/EmptyState";
import { Search, CheckCircle2, Clock, AlertCircle, ChevronDown, ChevronUp, ExternalLink, FileText, Eye, AlertTriangle, Filter, RefreshCw } from "lucide-react";

const MONTHS_ES = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];

/**
 * Shared Mediciones page used by Director, Logística, and Admin.
 * Shows all client measurements with their approval status.
 * @param {Object} props
 * @param {Array} props.routes - All routes
 * @param {string} [props.filterByCity] - If provided, only show this city
 */
export default function MedicionesPage({ routes, filterByCity, onViewMeasurement }) {
  const [search, setSearch] = useState("");
  const [filterCity, setFilterCity] = useState(filterByCity || "all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [expandedId, setExpandedId] = useState(null);
  const [filterYear, setFilterYear] = useState("all");
  const [filterMonth, setFilterMonth] = useState("all");

  // Get available years from routes
  const availableYears = [...new Set(routes.map((r) => r.date?.slice(0, 4)).filter(Boolean))].sort();

  // Build flat list of all clients with measurement info
  const allClients = [];
  routes.forEach((route) => {
    if (filterByCity && route.city !== filterByCity) return;
    if (!filterByCity && filterCity !== "all" && route.city !== filterCity) return;
    if (filterYear !== "all" && route.date?.slice(0, 4) !== filterYear) return;
    if (filterMonth !== "all" && route.date?.slice(5, 7) !== filterMonth) return;

    route.clients.forEach((client) => {
      allClients.push({
        ...client,
        routeId: route.id,
        routeDate: route.date,
        routeCity: route.city,
        routeStatus: route.status,
        assignedTo: route.assignedTo,
      });
    });
  });

  // Filter by status
  const filtered = allClients.filter((c) => {
    if (filterStatus === "pendiente") return !c.measurement && c.status !== "reprogramar" && c.status !== "reprogramado";
    if (filterStatus === "medido") return c.measurement && c.measurementApproval?.status === "pendiente_aprobacion";
    if (filterStatus === "aprobado") return c.measurementApproval?.status === "aprobado";
    if (filterStatus === "reprogramada") return c.status === "reprogramar" || c.status === "reprogramado";
    return true;
  });

  // Filter by search
  const searched = filtered.filter((c) => {
    if (!search) return true;
    const q = search.toLowerCase();
    const medidor = USERS.find((u) => u.id === c.assignedTo);
    const comercial = COMERCIALES.find((cm) => cm.id === c.comercialId);
    return (
      c.name?.toLowerCase().includes(q) ||
      c.businessName?.toLowerCase().includes(q) ||
      c.address?.toLowerCase().includes(q) ||
      medidor?.name?.toLowerCase().includes(q) ||
      comercial?.nombre?.toLowerCase().includes(q) ||
      formatDate(c.routeDate).toLowerCase().includes(q)
    );
  });

  // Sort: by date ascending (nearest first), then by approval status
  const sorted = [...searched].sort((a, b) => {
    // Primary: date ascending (nearest date first)
    const dateCompare = (a.routeDate || "").localeCompare(b.routeDate || "");
    if (dateCompare !== 0) return dateCompare;
    // Secondary: pending approval first, then pending measurement, then approved
    const getOrder = (c) => {
      if (c.measurement && c.measurementApproval?.status === "pendiente_aprobacion") return 0;
      if (!c.measurement) return 1;
      if (c.measurementApproval?.status === "aprobado") return 2;
      return 3;
    };
    return getOrder(a) - getOrder(b);
  });

  // Counts
  const totalReprogramada = allClients.filter((c) => c.status === "reprogramar" || c.status === "reprogramado").length;
  const totalPendiente = allClients.filter((c) => !c.measurement && c.status !== "reprogramar" && c.status !== "reprogramado").length;
  const totalMedido = allClients.filter((c) => c.measurement && c.measurementApproval?.status === "pendiente_aprobacion").length;
  const totalAprobado = allClients.filter((c) => c.measurementApproval?.status === "aprobado").length;

  const STATUS_FILTERS = [
    { id: "all", label: "Todas", count: allClients.length, color: "bg-surface text-muted border-border" },
    { id: "pendiente", label: "Sin medir", count: totalPendiente, color: "bg-dark text-muted border-border", activeColor: "bg-muted/20 text-white border-muted" },
    { id: "medido", label: "Pendiente aprobación", count: totalMedido, color: "bg-dark text-muted border-border", activeColor: "bg-warning/20 text-warning border-warning/50" },
    { id: "aprobado", label: "Aprobadas", count: totalAprobado, color: "bg-dark text-muted border-border", activeColor: "bg-success/20 text-success border-success/50" },
    { id: "reprogramada", label: "Reprogramadas", count: totalReprogramada, color: "bg-dark text-muted border-border", activeColor: "bg-orange-500/20 text-orange-400 border-orange-500/50" },
  ];

  const generateClientPdf = (c) => {
    const r = routes.find((rt) => rt.id === c.routeId);
    generateMeasurementPdf({ client: c, route: r });
  };

  const todayStr = new Date().toISOString().split("T")[0];

  const getApprovalBadge = (client) => {
    if (client.status === "reprogramar") {
      return <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-orange-500/20 text-orange-400 border border-orange-500/40 flex items-center gap-1"><RefreshCw className="w-3 h-3" /> Reprogramar</span>;
    }
    if (client.status === "reprogramado") {
      return <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-orange-500/10 text-orange-300 border border-orange-500/20">Reprogramada</span>;
    }
    if (!client.measurement) {
      return <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-dark border border-border text-muted">Sin medir</span>;
    }
    if (client.measurementApproval?.status === "aprobado") {
      return <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-success/20 text-success border border-success/30">Aprobada</span>;
    }
    if (client.measurementApproval?.status === "pendiente_aprobacion") {
      return <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-warning/20 text-warning border border-warning/30">Pend. aprobación</span>;
    }
    if (client.measurement) {
      return <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-primary/20 text-primary border border-primary/30">Medida</span>;
    }
    return null;
  };

  return (
    <div className="max-w-5xl mx-auto space-y-5">
      {/* Stats summary */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-surface border border-border rounded-2xl p-4 text-center">
          <div className="text-2xl font-bold text-muted">{totalPendiente}</div>
          <div className="text-[11px] text-muted mt-1 flex items-center justify-center gap-1">
            <Clock className="w-3 h-3" /> Sin medir
          </div>
        </div>
        <div className="bg-surface border border-warning/30 rounded-2xl p-4 text-center">
          <div className="text-2xl font-bold text-warning">{totalMedido}</div>
          <div className="text-[11px] text-warning mt-1 flex items-center justify-center gap-1">
            <AlertCircle className="w-3 h-3" /> Pend. aprobación
          </div>
        </div>
        <div className="bg-surface border border-success/30 rounded-2xl p-4 text-center">
          <div className="text-2xl font-bold text-success">{totalAprobado}</div>
          <div className="text-[11px] text-success mt-1 flex items-center justify-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Aprobadas
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por cliente, negocio, medidor, comercial..."
          className="w-full pl-9 pr-4 py-2.5 bg-dark border-2 border-border rounded-xl text-white text-sm placeholder:text-muted/50 outline-none focus:border-primary transition-colors"
        />
      </div>

      {/* Dropdown filters */}
      <div className="flex flex-wrap gap-3">
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
        {!filterByCity && (
          <div className="relative">
            <select
              value={filterCity}
              onChange={(e) => setFilterCity(e.target.value)}
              className="appearance-none bg-dark border-2 border-border rounded-xl text-white text-xs font-semibold px-3 py-2 pr-8 outline-none focus:border-primary transition-colors cursor-pointer"
            >
              <option value="all">Todas ciudades</option>
              {CITIES.map((c) => (
                <option key={c.id} value={c.id}>{c.label}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted pointer-events-none" />
          </div>
        )}
      </div>

      {/* Status filters */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {STATUS_FILTERS.map((f) => (
          <button
            key={f.id}
            onClick={() => setFilterStatus(f.id)}
            className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer border whitespace-nowrap ${
              filterStatus === f.id
                ? f.activeColor || "bg-primary text-dark border-primary"
                : f.color
            }`}
          >
            {f.label} ({f.count})
          </button>
        ))}
      </div>

      {/* Results */}
      {sorted.length === 0 ? (
        <EmptyState icon="📋" text="No hay mediciones con estos filtros." />
      ) : (
        <div className="space-y-2">
          {sorted.map((client) => {
            const medidor = USERS.find((u) => u.id === client.assignedTo);
            const comercial = COMERCIALES.find((cm) => cm.id === client.comercialId);
            const isExpanded = expandedId === client.id;
            const windows = client.measurement?.windows || [];

            return (
              <div key={`${client.routeId}-${client.id}`} className={`bg-surface border rounded-2xl overflow-hidden ${
                client.status === "reprogramar" ? "border-orange-500/50 bg-orange-500/5" : client.status === "reprogramado" ? "border-orange-500/20" : "border-border"
              }`}>
                {/* Row */}
                <button
                  onClick={() => setExpandedId(isExpanded ? null : client.id)}
                  className="w-full p-4 flex items-center gap-3 text-left hover:bg-dark/30 transition-all cursor-pointer"
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-sm font-bold ${
                    (client.status === "reprogramar" || client.status === "reprogramado") ? "bg-orange-500/20 text-orange-400" : client.measurement ? (client.measurementApproval?.status === "aprobado" ? "bg-success text-white" : "bg-warning/20 text-warning") : "bg-dark text-muted border border-border"
                  }`}>
                    {(client.status === "reprogramar" || client.status === "reprogramado") ? <RefreshCw className="w-5 h-5" /> : client.measurement ? (client.measurementApproval?.status === "aprobado" ? "✓" : "⏳") : "—"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-white truncate">{client.name}</span>
                      {!filterByCity && <CityBadge cityId={client.routeCity} />}
                    </div>
                    {client.businessName && (
                      <div className="text-[11px] text-primary font-medium mt-0.5 flex items-center gap-1">
                        {client.hubspotLink ? (
                          <a href={client.hubspotLink} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="hover:underline flex items-center gap-1">
                            <ExternalLink className="w-3 h-3" /> {client.businessName}
                          </a>
                        ) : client.businessName}
                      </div>
                    )}
                    <div className="text-[11px] text-muted mt-0.5">
                      {formatDate(client.routeDate)} · {medidor?.name || "Sin asignar"} · {comercial?.nombre || "Sin comercial"}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {!client.measurement && client.routeDate < todayStr && client.routeStatus !== "completado" && (
                      <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-danger/20 text-danger border border-danger/30 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" /> Vencida
                      </span>
                    )}
                    {getApprovalBadge(client)}
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-muted" /> : <ChevronDown className="w-4 h-4 text-muted" />}
                  </div>
                </button>

                {/* Expanded detail */}
                {isExpanded && (
                  <div className="border-t border-border px-4 pb-4">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-3 text-xs">
                      <div>
                        <span className="text-muted">Dirección</span>
                        <p className="text-white font-medium mt-0.5">{client.address || "—"}</p>
                      </div>
                      <div>
                        <span className="text-muted">Teléfono</span>
                        <p className="text-white font-medium mt-0.5">{client.phone || "—"}</p>
                      </div>
                      <div>
                        <span className="text-muted">Hora</span>
                        <p className="text-white font-medium mt-0.5">{client.scheduledTime || "—"}</p>
                      </div>
                      <div>
                        <span className="text-muted">Estado</span>
                        <p className="text-white font-medium mt-0.5">
                          {client.measurementApproval?.status === "aprobado"
                            ? "Aprobada"
                            : client.measurementApproval?.status === "pendiente_aprobacion"
                              ? "Pendiente aprobación"
                              : client.measurement
                                ? "Medida"
                                : "Sin medir"}
                        </p>
                      </div>
                    </div>

                    {/* Reprogramación info */}
                    {(client.status === "reprogramar" || client.status === "reprogramado") && (
                      <div className={`mt-2 rounded-xl p-3 flex items-start gap-3 ${
                        client.status === "reprogramar" ? "bg-orange-500/15 border border-orange-500/30" : "bg-orange-500/5 border border-orange-500/15"
                      }`}>
                        <RefreshCw className="w-4 h-4 text-orange-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-xs font-bold text-orange-400">
                            {client.status === "reprogramar" ? "Pendiente de reprogramación" : "Reprogramada"}
                          </p>
                          {client.rescheduleNote && (
                            <p className="text-xs text-orange-300/80 mt-1">Motivo: {client.rescheduleNote}</p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Measurement detail */}
                    {client.measurement && windows.length > 0 && (
                      <div className="space-y-2 mt-2">
                        <div className="text-xs font-semibold text-muted">
                          {windows.length} ventana{windows.length !== 1 ? "s" : ""} medidas
                        </div>
                        {windows.map((w, idx) => (
                          <div key={w.id || idx} className="bg-dark rounded-xl p-3 flex items-center gap-3">
                            <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                              <span className="text-primary text-xs font-bold">{idx + 1}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <span className="text-sm font-medium text-white">{getLabel(WINDOW_TYPES, w.tipo)}</span>
                              <span className="text-xs text-muted ml-2">{w.ancho} x {w.alto} mm</span>
                            </div>
                            <span className="text-xs text-muted">{w.ubicacion || ""}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Approval info */}
                    {client.measurementApproval?.status === "aprobado" && (
                      <div className="mt-3 bg-success/10 border border-success/20 rounded-xl p-3 text-xs">
                        <span className="text-success font-semibold">Aprobada</span>
                        {client.measurementApproval.approvedAt && (
                          <span className="text-muted ml-2">
                            el {new Date(client.measurementApproval.approvedAt).toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" })}
                          </span>
                        )}
                      </div>
                    )}

                    {client.measurement && (
                      <div className="mt-3 flex gap-2">
                        {onViewMeasurement && (
                          <button
                            onClick={(e) => { e.stopPropagation(); onViewMeasurement(client.id, client.routeId); }}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-semibold text-xs rounded-xl hover:bg-blue-700 transition-all cursor-pointer"
                          >
                            <Eye className="w-4 h-4" /> Ver Detalle
                          </button>
                        )}
                        <button
                          onClick={(e) => { e.stopPropagation(); generateClientPdf(client); }}
                          className="flex items-center gap-2 px-4 py-2 bg-primary text-dark font-semibold text-xs rounded-xl hover:bg-primary-hover transition-all cursor-pointer"
                        >
                          <FileText className="w-4 h-4" /> Descargar PDF
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
