import { useState } from "react";
import { formatDate } from "../../lib/utils";
import Header from "../../components/ui/Header";
import Button from "../../components/ui/Button";
import { Phone, MessageCircle, MapPin, FileText, RefreshCw, ClipboardEdit, Eye } from "lucide-react";

export default function MedidorRouteView({ route, onBack, onSelectClient, onReschedule }) {
  const [rescheduleId, setRescheduleId] = useState(null);
  const [rescheduleNote, setRescheduleNote] = useState("");

  const handleReschedule = (clientId) => {
    if (rescheduleNote.trim()) {
      onReschedule(clientId, route.id, rescheduleNote.trim());
      setRescheduleId(null);
      setRescheduleNote("");
    }
  };

  const cleanPhone = (p) => (p || "").replace(/[^0-9]/g, "");
  const activeClients = route.clients.filter((c) => c.status !== "reprogramar" && c.status !== "reprogramado");

  return (
    <div className="min-h-screen bg-background">
      <Header title={formatDate(route.date)} subtitle="Ruta del día" onBack={onBack} />
      <div className="p-4 sm:p-6 max-w-4xl mx-auto space-y-3">
        {activeClients.length === 0 && (
          <div className="text-center py-12 text-muted">
            <p className="text-4xl mb-3">✅</p>
            <p className="text-sm">Todas las mediciones han sido completadas o reprogramadas.</p>
          </div>
        )}
        {activeClients.map((client, idx) => {
          const done = !!client.measurement;
          const phone = cleanPhone(client.phone);
          return (
            <div
              key={client.id}
              className={`bg-surface border rounded-2xl p-4 transition-all ${done ? "border-success" : "border-border"}`}
            >
              {/* Client info */}
              <div className="flex gap-3 items-start">
                <div className={`w-11 h-11 rounded-xl flex-shrink-0 flex items-center justify-center text-white font-bold text-lg ${done ? "bg-success" : "bg-primary text-dark"}`}>
                  {done ? "✓" : idx + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm">{client.name}</div>
                  {client.businessName && (
                    <div className="text-[11px] text-primary font-medium">
                      {client.hubspotLink ? (
                        <a href={client.hubspotLink} target="_blank" rel="noopener noreferrer" className="hover:underline">🔗 {client.businessName}</a>
                      ) : client.businessName}
                    </div>
                  )}
                  <div className="text-xs text-muted mt-0.5">🕐 {client.scheduledTime} · 📍 {client.address}</div>
                  {client.notas && <div className="text-[11px] text-muted mt-0.5 italic">💬 {client.notas}</div>}
                </div>
              </div>

              {/* Main action button: Realizar / Ver Medición */}
              <button
                onClick={() => onSelectClient(client.id)}
                className={`w-full mt-3 py-2.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  done
                    ? "bg-success/10 border-2 border-success/40 text-success hover:bg-success/20"
                    : "bg-primary text-dark hover:bg-primary-hover"
                }`}
              >
                {done ? (
                  <><Eye className="w-4 h-4" /> Ver Medición</>
                ) : (
                  <><ClipboardEdit className="w-4 h-4" /> Realizar Medición</>
                )}
              </button>

              {/* Quick action buttons */}
              <div className="flex gap-2 mt-2 flex-wrap">
                {phone && (
                  <a href={`tel:+34${phone}`} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-success text-white text-xs font-semibold no-underline">
                    <Phone className="w-3 h-3" /> Llamar
                  </a>
                )}
                {phone && (
                  <a href={`https://wa.me/34${phone}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-600 text-white text-xs font-semibold no-underline">
                    <MessageCircle className="w-3 h-3" /> WhatsApp
                  </a>
                )}
                {client.googleMapsLink && (
                  <a href={client.googleMapsLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold no-underline">
                    <MapPin className="w-3 h-3" /> Maps
                  </a>
                )}
                {client.budgetFileName && (
                  <button onClick={() => client.budgetUrl && window.open(client.budgetUrl)} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-dark text-white text-xs font-semibold border border-border cursor-pointer">
                    <FileText className="w-3 h-3" /> Presupuesto
                  </button>
                )}
              </div>

              {/* Reschedule — only for non-completed routes */}
              {!done && route.status !== "completado" && (
                <div className="mt-3 pt-3 border-t border-border/50">
                  {rescheduleId === client.id ? (
                    <div className="space-y-2">
                      <textarea
                        value={rescheduleNote}
                        onChange={(e) => setRescheduleNote(e.target.value)}
                        placeholder="Motivo de reprogramación (obligatorio)..."
                        rows={2}
                        className="w-full px-3 py-2 bg-dark border-2 border-warning/50 rounded-xl text-white text-sm placeholder:text-muted/50 outline-none resize-none"
                      />
                      <div className="flex gap-2">
                        <Button variant="secondary" onClick={() => { setRescheduleId(null); setRescheduleNote(""); }} full className="text-xs">Cancelar</Button>
                        <Button variant="danger" onClick={() => handleReschedule(client.id)} disabled={!rescheduleNote.trim()} full className="text-xs">Confirmar</Button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setRescheduleId(client.id)}
                      className="w-full py-2 rounded-xl border-2 border-warning/30 bg-warning/5 text-warning text-xs font-semibold cursor-pointer hover:bg-warning/10 transition-colors"
                    >
                      <RefreshCw className="w-3 h-3 inline mr-1" /> Reprogramar medición
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
