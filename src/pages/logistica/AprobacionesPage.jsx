import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { USERS, COMERCIALES, WINDOW_TYPES, COLORS, PERSIANAS, MEDIDA_PERSIANA_OPTS, ACCIONAMIENTOS, TIPO_MOTOR, SENTIDOS, GUIAS, MOSQUITEROS, TAPAJUNTAS, VIDRIOS, TIPOS_SIN_HOJA_PRINCIPAL, getLabel } from "../../lib/constants";
import { formatDate } from "../../lib/utils";
import { generateMeasurementPdf } from "../../lib/pdfGenerator";
import Button from "../../components/ui/Button";
import EmptyState from "../../components/ui/EmptyState";
import { CheckCircle2, Clock, Eye, Send, ChevronDown, ChevronUp, FileText } from "lucide-react";

export default function AprobacionesPage({ routes, onApproveMeasurement, onUpdateMeasurement, filterByCity }) {
  const { user } = useAuth();
  const [expandedId, setExpandedId] = useState(null);
  const [confirmId, setConfirmId] = useState(null);

  // If filterByCity is explicitly null, show all; if undefined, fall back to user.city
  const cityFilter = filterByCity === null ? null : (filterByCity || user.city);

  // Get all clients pending approval
  const pending = [];
  const approved = [];

  routes.filter((r) => !cityFilter || r.city === cityFilter).forEach((route) => {
    route.clients.forEach((client) => {
      if (client.measurement && client.measurementApproval) {
        const entry = { ...client, routeId: route.id, routeDate: route.date, routeCity: route.city };
        if (client.measurementApproval.status === "pendiente_aprobacion") {
          pending.push(entry);
        } else if (client.measurementApproval.status === "aprobado") {
          approved.push(entry);
        }
      }
    });
  });

  const handleApprove = (clientId, routeId, client) => {
    // Approve the measurement
    onApproveMeasurement(clientId, routeId);

    // Send email to the comercial
    const comercial = COMERCIALES.find((c) => c.id === client.comercialId);
    if (comercial?.email) {
      const windows = client.measurement.windows || [];
      let body = `Estimado/a ${comercial.nombre},\n\n`;
      body += `Se ha aprobado la medición para el cliente: ${client.name}\n`;
      if (client.businessName) body += `Negocio: ${client.businessName}\n`;
      body += `Dirección: ${client.address}\n`;
      body += `Teléfono: ${client.phone}\n`;
      body += `Fecha de medición: ${formatDate(client.routeDate || "")}\n\n`;
      body += `Total de ventanas medidas: ${windows.length}\n\n`;

      windows.forEach((w, idx) => {
        body += `--- Ventana ${idx + 1} ---\n`;
        body += `Tipo: ${getLabel(WINDOW_TYPES, w.tipo)}\n`;
        body += `Medidas: ${w.ancho} x ${w.alto} mm\n`;
        body += `Color: ${getLabel(COLORS, w.color) || w.colorOtro}\n`;
        body += `Persiana: ${getLabel(PERSIANAS, w.persiana)}\n`;
        if (w.persiana !== "sin") {
          body += `Medida Persiana: ${getLabel(MEDIDA_PERSIANA_OPTS, w.medidaPersiana)}\n`;
          body += `Accionamiento: ${getLabel(ACCIONAMIENTOS, w.accionamiento)}\n`;
        }
        body += `Ubicación: ${w.ubicacion}\n\n`;
      });

      body += `Se adjunta el PDF de la medición para su revisión.\n\n`;
      body += `Saludos,\nEquipo TermProtect`;

      const subject = `✅ Medición Aprobada: ${client.name}${client.businessName ? ` - ${client.businessName}` : ""} (${windows.length} ventana${windows.length !== 1 ? "s" : ""})`;
      const mailtoLink = `mailto:${comercial.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      window.location.href = mailtoLink;
    }

    setConfirmId(null);
    setExpandedId(null);
  };

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
    setConfirmId(null);
  };

  const generateClientPdf = (client) => {
    const r = routes.find((rt) => rt.id === client.routeId);
    generateMeasurementPdf({ client, route: r });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Pending Approvals */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Clock className="w-5 h-5 text-warning" />
          <h2 className="text-base font-bold text-white">Pendientes de Aprobación ({pending.length})</h2>
        </div>

        {pending.length === 0 ? (
          <EmptyState icon="✅" text="No hay mediciones pendientes de aprobación." />
        ) : (
          <div className="space-y-3">
            {pending.map((client) => {
              const medidor = USERS.find((u) => u.id === client.measurementApproval?.submittedBy);
              const comercial = COMERCIALES.find((c) => c.id === client.comercialId);
              const isExpanded = expandedId === client.id;
              const windows = client.measurement?.windows || [];

              return (
                <div key={client.id} className="bg-surface border border-warning/30 rounded-2xl overflow-hidden">
                  {/* Header */}
                  <button
                    onClick={() => toggleExpand(client.id)}
                    className="w-full p-5 flex items-center gap-4 text-left hover:bg-dark/30 transition-all cursor-pointer"
                  >
                    <div className="w-10 h-10 rounded-xl bg-warning/20 flex items-center justify-center flex-shrink-0">
                      <Clock className="w-5 h-5 text-warning" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-sm text-white">{client.name}</div>
                      {client.businessName && (
                        <div className="text-xs text-primary font-medium">{client.businessName}</div>
                      )}
                      <div className="text-[11px] text-muted mt-0.5">
                        {medidor?.name || "Medidor"} · {formatDate(client.routeDate)} · {windows.length} ventana{windows.length !== 1 ? "s" : ""}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {!cityFilter && client.routeCity && (
                        <span className="text-[10px] font-bold text-blue-400 bg-blue-500/10 px-2 py-1 rounded-lg">{client.routeCity}</span>
                      )}
                      <span className="text-[10px] font-bold text-warning bg-warning/10 px-2 py-1 rounded-lg">Pendiente</span>
                      {isExpanded ? <ChevronUp className="w-4 h-4 text-muted" /> : <ChevronDown className="w-4 h-4 text-muted" />}
                    </div>
                  </button>

                  {/* Expanded detail */}
                  {isExpanded && (
                    <div className="border-t border-border px-5 pb-5">
                      {/* Client info */}
                      <div className="grid grid-cols-2 gap-3 py-4 text-sm">
                        <div>
                          <span className="text-muted text-xs">Dirección</span>
                          <p className="text-white font-medium">{client.address}</p>
                        </div>
                        <div>
                          <span className="text-muted text-xs">Teléfono</span>
                          <p className="text-white font-medium">{client.phone}</p>
                        </div>
                        <div>
                          <span className="text-muted text-xs">Comercial</span>
                          <p className="text-white font-medium">{comercial?.nombre || "—"}</p>
                        </div>
                        <div>
                          <span className="text-muted text-xs">Email comercial</span>
                          <p className="text-white font-medium">{comercial?.email || "—"}</p>
                        </div>
                      </div>

                      {/* Windows summary */}
                      <div className="space-y-2 mb-4">
                        {windows.map((w, idx) => (
                          <div key={w.id} className="bg-dark rounded-xl p-3 flex items-center gap-3">
                            <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                              <span className="text-primary text-xs font-bold">{idx + 1}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <span className="text-sm font-medium text-white">{getLabel(WINDOW_TYPES, w.tipo)}</span>
                              <span className="text-xs text-muted ml-2">{w.ancho} x {w.alto} mm</span>
                            </div>
                            <span className="text-xs text-muted">{w.ubicacion}</span>
                          </div>
                        ))}
                      </div>

                      {/* Actions */}
                      {confirmId === client.id ? (
                        <div className="bg-success/10 border border-success/30 rounded-xl p-4 space-y-3">
                          <p className="text-sm text-success font-medium">
                            ¿Confirmas la aprobación? Se enviará un email a {comercial?.nombre || "el comercial"} ({comercial?.email || "sin email"}) con los detalles de la medición.
                          </p>
                          <div className="flex gap-2">
                            <Button variant="success" onClick={() => handleApprove(client.id, client.routeId, client)} className="flex-1">
                              <Send className="w-4 h-4" /> Aprobar y Enviar Email
                            </Button>
                            <Button variant="ghost" onClick={() => setConfirmId(null)}>
                              Cancelar
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <Button variant="success" onClick={() => setConfirmId(client.id)} className="flex-1">
                            <CheckCircle2 className="w-4 h-4" /> Aprobar Medición
                          </Button>
                          <Button variant="ghost" onClick={() => generateClientPdf(client)}>
                            <FileText className="w-4 h-4" /> Ver PDF
                          </Button>
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

      {/* Recently Approved */}
      {approved.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle2 className="w-5 h-5 text-success" />
            <h2 className="text-base font-bold text-white">Aprobadas recientemente ({approved.length})</h2>
          </div>
          <div className="space-y-2">
            {approved.slice(0, 10).map((client) => {
              const comercial = COMERCIALES.find((c) => c.id === client.comercialId);
              const windows = client.measurement?.windows || [];
              return (
                <div key={client.id} className="bg-surface border border-success/20 rounded-2xl p-4 flex items-center gap-4">
                  <div className="w-8 h-8 rounded-lg bg-success/20 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="w-4 h-4 text-success" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm text-white">{client.name}</div>
                    {client.businessName && (
                      <div className="text-[11px] text-primary font-medium">{client.businessName}</div>
                    )}
                    <div className="text-[11px] text-muted">
                      {windows.length} ventana{windows.length !== 1 ? "s" : ""} · Enviado a {comercial?.nombre || "—"}
                    </div>
                  </div>
                  <button
                    onClick={() => generateClientPdf(client)}
                    className="p-2 rounded-lg hover:bg-dark/30 transition-all cursor-pointer flex-shrink-0"
                    title="Ver PDF"
                  >
                    <FileText className="w-4 h-4 text-muted hover:text-primary" />
                  </button>
                  {!cityFilter && client.routeCity && (
                    <span className="text-[10px] font-bold text-blue-400 bg-blue-500/10 px-2 py-1 rounded-lg flex-shrink-0">{client.routeCity}</span>
                  )}
                  <div className="text-[10px] text-success font-medium flex-shrink-0">
                    {client.measurementApproval?.approvedAt
                      ? new Date(client.measurementApproval.approvedAt).toLocaleDateString("es-ES", { day: "numeric", month: "short" })
                      : ""}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
