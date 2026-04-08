import { useState, useCallback, memo } from "react";
import {
  WINDOW_TYPES,
  TIPOS_SIN_HOJA_PRINCIPAL,
  COLORS,
  PERSIANAS,
  MEDIDA_PERSIANA_OPTS,
  ACCIONAMIENTOS,
  TIPO_MOTOR,
  SENTIDOS,
  GUIAS,
  MOSQUITEROS,
  TAPAJUNTAS,
  VIDRIOS,
  SERVICIOS_OBRA,
  getLabel,
} from "../../lib/constants";
import { emptyWindow } from "../../lib/utils";
import { generateMeasurementPdf } from "../../lib/pdfGenerator";
import Header from "../ui/Header";
import Button from "../ui/Button";
import TextInput from "../ui/TextInput";
import Field from "../ui/Field";
import Chips from "../ui/Chips";
import DrawingCanvas from "../ui/DrawingCanvas";
import { Plus, Trash2, ChevronDown, Video, Camera, X, PenTool } from "lucide-react";

/* ── Helpers ── */

function isWinComplete(w) {
  const required = ["tipo", "color", "ancho", "alto", "persiana", "guia", "mosquitero", "tapajuntas", "vidrio", "ubicacion", "sentidoApertura"];
  for (let field of required) { if (!w[field]) return false; }
  if (w.persiana !== "sin") {
    if (!w.medidaPersiana || !w.accionamiento || !w.sentidoPersiana) return false;
    if (w.accionamiento === "motor" && !w.tipoMotor) return false;
  }
  if (!TIPOS_SIN_HOJA_PRINCIPAL.includes(w.tipo) && !w.hojaPrincipal) return false;
  return true;
}

/* ── Per-window form (memoized to avoid full-list re-renders) ── */

const WindowForm = memo(function WindowForm({ w, idx, isOpen, onToggle, onUpdate, onRemove, canRemove }) {
  const [showDrawing, setShowDrawing] = useState(!!(w.drawing && w.drawing.length > 0));

  const update = useCallback((patch) => onUpdate(w.id, patch), [w.id, onUpdate]);

  return (
    <div className={`rounded-2xl border transition-all ${isOpen ? "bg-surface border-2 border-primary/50" : "bg-surface border-border"}`}>
      {/* Collapsed Header */}
      <button onClick={() => onToggle(w.id)} className="w-full px-6 py-4 flex items-center justify-between hover:bg-dark/50 rounded-2xl">
        <div className="flex items-center gap-4 text-left flex-1">
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
            <span className="text-primary font-semibold">{idx + 1}</span>
          </div>
          <div>
            <p className="text-primary font-medium">{getLabel(WINDOW_TYPES, w.tipo) || "Sin tipo"}</p>
            <p className="text-muted text-sm">{w.ancho && w.alto ? `${w.ancho} x ${w.alto} mm` : "Sin medidas"}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {isWinComplete(w) && <span className="text-success text-sm font-medium">Completa</span>}
          <ChevronDown size={20} className={`text-primary transition-transform ${isOpen ? "rotate-180" : ""}`} />
        </div>
      </button>

      {/* Expanded Form */}
      {isOpen && (
        <div className="px-6 pb-6 pt-2 space-y-6 border-t border-border">
          {/* Tipo */}
          <Field label="Tipo de Ventana" required>
            <div className="grid grid-cols-2 gap-3">
              {WINDOW_TYPES.map((opt) => (
                <button key={opt.id}
                  onClick={() => update({ tipo: opt.id, hojaPrincipal: "" })}
                  className={`p-4 rounded-xl border-2 text-center transition-all ${w.tipo === opt.id ? "border-primary bg-primary/10" : "border-border bg-dark hover:border-primary/50"}`}>
                  <div className="text-2xl mb-2">{opt.icon || "🪟"}</div>
                  <p className="text-sm font-medium text-primary">{opt.label}</p>
                </button>
              ))}
            </div>
          </Field>

          {/* Sentido Apertura */}
          <Field label="Sentido Apertura" required>
            <Chips options={[...SENTIDOS, { id: "otro", label: "Otro" }]} value={w.sentidoApertura} onChange={(val) => update({ sentidoApertura: val })} />
            {w.sentidoApertura === "otro" && (
              <TextInput placeholder="Especificar sentido" value={w.sentidoAperturaOtro || ""} onChange={(val) => update({ sentidoAperturaOtro: val })} className="mt-3" />
            )}
          </Field>

          {/* Hoja Principal */}
          {!TIPOS_SIN_HOJA_PRINCIPAL.includes(w.tipo) && (
            <Field label="Hoja Principal" required>
              <Chips options={[...SENTIDOS, { id: "otro", label: "Otro" }]} value={w.hojaPrincipal} onChange={(val) => update({ hojaPrincipal: val })} />
              {w.hojaPrincipal === "otro" && (
                <TextInput placeholder="Especificar hoja principal" value={w.hojaPrincipalOtro || ""} onChange={(val) => update({ hojaPrincipalOtro: val })} className="mt-3" />
              )}
            </Field>
          )}

          {/* Color */}
          <Field label="Color" required>
            <Chips
              options={[...COLORS, { id: "otro", label: "Otro" }]}
              value={w.color}
              onChange={(val) => update({ color: val })}
              renderOpt={(opt) => (
                <div className="flex items-center gap-2">
                  {opt.hex && <div className="w-4 h-4 rounded-full border border-border" style={{ backgroundColor: opt.hex }} />}
                  <span>{opt.label}</span>
                </div>
              )}
            />
            {w.color === "otro" && (
              <TextInput placeholder="Especificar color" value={w.colorOtro || ""} onChange={(val) => update({ colorOtro: val })} className="mt-3" />
            )}
          </Field>

          {/* Medidas */}
          <div className="grid grid-cols-2 gap-4">
            <Field label="Ancho" required>
              <TextInput type="number" placeholder="0" value={w.ancho || ""} onChange={(val) => update({ ancho: val })} suffix="mm" />
            </Field>
            <Field label="Alto" required>
              <TextInput type="number" placeholder="0" value={w.alto || ""} onChange={(val) => update({ alto: val })} suffix="mm" />
            </Field>
          </div>

          {/* Persiana */}
          <Field label="Persiana" required>
            <Chips options={PERSIANAS} value={w.persiana}
              onChange={(val) => update({ persiana: val, medidaPersiana: "", accionamiento: "", sentidoPersiana: "", tipoMotor: "" })} />
          </Field>

          {/* Persiana Details */}
          {w.persiana !== "sin" && (
            <>
              <Field label="Medida Persiana" required>
                <Chips options={MEDIDA_PERSIANA_OPTS} value={w.medidaPersiana} onChange={(val) => update({ medidaPersiana: val })} />
              </Field>
              <Field label="Accionamiento" required>
                <Chips options={ACCIONAMIENTOS} value={w.accionamiento} onChange={(val) => update({ accionamiento: val, tipoMotor: "" })} />
              </Field>
              {w.accionamiento === "motor" && (
                <Field label="Tipo Motor" required>
                  <Chips options={TIPO_MOTOR} value={w.tipoMotor} onChange={(val) => update({ tipoMotor: val })} />
                </Field>
              )}
              <Field label="Sentido Recogedor" required>
                <Chips options={SENTIDOS} value={w.sentidoPersiana} onChange={(val) => update({ sentidoPersiana: val })} />
              </Field>
            </>
          )}

          {/* Guía */}
          <Field label="Guía" required>
            <Chips options={[...GUIAS, { id: "otro", label: "Otro" }]} value={w.guia} onChange={(val) => update({ guia: val })} />
            {w.guia === "otro" && <TextInput placeholder="Especificar guía" value={w.guiaOtro || ""} onChange={(val) => update({ guiaOtro: val })} className="mt-3" />}
          </Field>

          {/* Mosquitera */}
          <Field label="Mosquitera" required>
            <Chips options={[...MOSQUITEROS, { id: "otro", label: "Otro" }]} value={w.mosquitero} onChange={(val) => update({ mosquitero: val })} />
            {w.mosquitero === "otro" && <TextInput placeholder="Especificar mosquitera" value={w.mosquiteroOtro || ""} onChange={(val) => update({ mosquiteroOtro: val })} className="mt-3" />}
          </Field>

          {/* Tapajuntas */}
          <Field label="Tapajuntas" required>
            <Chips options={[...TAPAJUNTAS, { id: "otro", label: "Otro" }]} value={w.tapajuntas} onChange={(val) => update({ tapajuntas: val })} />
            {w.tapajuntas === "otro" && <TextInput placeholder="Especificar tapajuntas" value={w.tapajuntasObs || ""} onChange={(val) => update({ tapajuntasObs: val })} className="mt-3" />}
          </Field>

          {/* Vidrio */}
          <Field label="Vidrio" required>
            <Chips options={[...VIDRIOS, { id: "otro", label: "Otro" }]} value={w.vidrio} onChange={(val) => update({ vidrio: val })} />
            {w.vidrio === "otro" && <TextInput placeholder="Especificar vidrio" value={w.vidrioOtro || ""} onChange={(val) => update({ vidrioOtro: val })} className="mt-3" />}
          </Field>

          {/* Ubicación */}
          <Field label="Ubicación" required>
            <TextInput placeholder="Ej: Sala, 2do piso" value={w.ubicacion || ""} onChange={(val) => update({ ubicacion: val })} />
          </Field>

          {/* Accesorios */}
          <Field label="Accesorios Adicionales">
            <textarea placeholder="Especificar accesorios adicionales..." value={w.accesoriosAdicionales || ""}
              onChange={(e) => update({ accesoriosAdicionales: e.target.value })}
              className="w-full bg-dark border border-border rounded-lg px-4 py-3 text-primary placeholder-muted focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 resize-none" rows="3" />
          </Field>

          {/* Notas */}
          <Field label="Notas">
            <textarea placeholder="Notas adicionales..." value={w.notas || ""}
              onChange={(e) => update({ notas: e.target.value })}
              className="w-full bg-dark border border-border rounded-lg px-4 py-3 text-primary placeholder-muted focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 resize-none" rows="3" />
          </Field>

          {/* Fotos / Vídeos */}
          <Field label="Fotos / Vídeos de la ventana">
            <div className="space-y-3">
              {(w.media && w.media.length > 0) && (
                <div className="grid grid-cols-3 gap-2">
                  {w.media.map((m, mi) => (
                    <div key={mi} className="relative group rounded-xl overflow-hidden bg-dark border border-border aspect-square">
                      {m.type === "image" ? (
                        <img src={m.url} alt={`Foto ${mi + 1}`} className="w-full h-full object-cover" />
                      ) : (
                        <video src={m.url} className="w-full h-full object-cover" />
                      )}
                      <button onClick={() => {
                        const newMedia = [...(w.media || [])]; newMedia.splice(mi, 1);
                        update({ media: newMedia });
                      }} className="absolute top-1 right-1 w-6 h-6 bg-danger rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                        <X className="w-3 h-3 text-white" />
                      </button>
                      <div className="absolute bottom-1 left-1 bg-dark/80 rounded px-1.5 py-0.5 text-[9px] text-white">
                        {m.type === "image" ? "📷" : "🎥"} {m.name?.slice(0, 12) || `Archivo ${mi + 1}`}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <div className="flex gap-2">
                <label className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-dark border-2 border-dashed border-border rounded-xl text-sm text-muted hover:border-primary hover:text-primary transition-all cursor-pointer">
                  <Camera className="w-4 h-4" /><span>Foto</span>
                  <input type="file" accept="image/*" capture="environment" className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) { update({ media: [...(w.media || []), { type: "image", url: URL.createObjectURL(file), name: file.name }] }); }
                      e.target.value = "";
                    }} />
                </label>
                <label className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-dark border-2 border-dashed border-border rounded-xl text-sm text-muted hover:border-primary hover:text-primary transition-all cursor-pointer">
                  <Video className="w-4 h-4" /><span>Vídeo</span>
                  <input type="file" accept="video/*" capture="environment" className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) { update({ media: [...(w.media || []), { type: "video", url: URL.createObjectURL(file), name: file.name }] }); }
                      e.target.value = "";
                    }} />
                </label>
              </div>
            </div>
          </Field>

          {/* Dibujo técnico — toggle */}
          <div>
            <button type="button" onClick={() => setShowDrawing((p) => !p)}
              className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl border-2 text-left transition-all cursor-pointer ${
                showDrawing ? "border-primary bg-primary/10 text-primary" : "border-border bg-dark text-muted hover:border-muted/50"
              }`}>
              <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                showDrawing ? "border-primary bg-primary" : "border-muted/50"
              }`}>
                {showDrawing && (
                  <svg className="w-3 h-3 text-dark" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
              <div>
                <span className="text-sm font-semibold flex items-center gap-1.5"><PenTool className="w-3.5 h-3.5" /> Agregar Dibujo Técnico</span>
                <span className="text-[11px] opacity-70 block">Marcos, piezas fijas o extensiones con medidas</span>
              </div>
            </button>

            {showDrawing && (
              <div className="mt-3">
                <DrawingCanvas
                  initialData={w.drawing || []}
                  onChange={(data) => update({ drawing: data })}
                />
              </div>
            )}
          </div>

          {/* Window Actions */}
          <div className="flex gap-3 pt-4">
            <Button variant={isWinComplete(w) ? "success" : "ghost"} onClick={() => onToggle(null)} disabled={!isWinComplete(w)} className="flex-1">
              {isWinComplete(w) ? "Ventana Completa" : "Incompleta"}
            </Button>
            {canRemove && (
              <Button variant="danger" onClick={() => onRemove(w.id)} className="px-4">
                <Trash2 size={18} />
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
});

/* ── Main form component ── */

export default function MeasurementForm({ client, onSave, onBack }) {
  const [windows, setWindows] = useState(client.measurement?.windows || [emptyWindow()]);
  const [editId, setEditId] = useState(null);
  const [saved, setSaved] = useState(!!client.measurement);
  const [globalNotas, setGlobalNotas] = useState(client.measurement?.globalNotas || "");
  const [servicios, setServicios] = useState(client.measurement?.servicios || {});
  const [emailTo, setEmailTo] = useState("");
  const [emailSent, setEmailSent] = useState(false);

  // Stable callback — only patches the changed fields, avoids full object spread per caller
  const handleUpdateWin = useCallback((winId, patch) => {
    setWindows((prev) => prev.map((w) => (w.id === winId ? { ...w, ...patch } : w)));
  }, []);

  const handleRemoveWin = useCallback((id) => {
    setWindows((prev) => prev.filter((w) => w.id !== id));
  }, []);

  const handleToggle = useCallback((id) => {
    setEditId((prev) => (prev === id ? null : id));
  }, []);

  const addWin = () => { if (windows.length < 40) setWindows((prev) => [...prev, emptyWindow()]); };

  const allComplete = windows.length > 0 && windows.every(isWinComplete);

  const handleSave = () => { onSave({ windows, globalNotas, servicios }); setSaved(true); setEditId(null); };

  const toggleServicio = (id) => setServicios((prev) => ({ ...prev, [id]: !prev[id] }));

  const generatePdf = () => generateMeasurementPdf({ client, windows, globalNotas });

  const handleSendEmail = () => {
    const subject = `Medición: ${client.name} - ${windows.length} ventana${windows.length !== 1 ? "s" : ""}`;
    const body = `Medición para: ${client.name}\nDirección: ${client.address}\nTeléfono: ${client.phone}\n\n${windows.length} ventanas medidas. Ver PDF adjunto para detalles.`;
    window.location.href = `mailto:${emailTo}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    generatePdf();
  };

  /* ── Completed (read-only) view ── */

  if (saved && !editId) {
    return (
      <div className="min-h-screen bg-background text-primary">
        <Header title="Medición Completada" subtitle={client.businessName ? `${client.businessName} — ${client.name}` : client.name} onBack={onBack} />
        <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
          {/* Client Info */}
          <div className="bg-surface border border-border rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-primary mb-3">Información del Cliente</h3>
            {client.businessName && (
              <div className="mb-3">
                <p className="text-muted text-sm mb-1">Negocio</p>
                <p className="text-primary font-semibold">
                  {client.hubspotLink ? <a href={client.hubspotLink} target="_blank" rel="noopener noreferrer" className="hover:underline">🔗 {client.businessName}</a> : client.businessName}
                </p>
              </div>
            )}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><p className="text-muted mb-1">Dirección</p><p className="text-primary">{client.address}</p></div>
              <div><p className="text-muted mb-1">Teléfono</p><p className="text-primary">{client.phone}</p></div>
            </div>
          </div>

          {/* Windows Summary */}
          {windows.map((w, idx) => (
            <div key={w.id} className="bg-surface border border-border rounded-2xl p-6">
              <h4 className="text-base font-semibold text-primary mb-4">Ventana {idx + 1}</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><p className="text-muted mb-1">Tipo</p><p className="text-primary font-medium">{getLabel(WINDOW_TYPES, w.tipo) || "-"}</p></div>
                <div><p className="text-muted mb-1">Sentido Apertura</p><p className="text-primary font-medium">{w.sentidoApertura || "-"}</p></div>
                {!TIPOS_SIN_HOJA_PRINCIPAL.includes(w.tipo) && (
                  <div><p className="text-muted mb-1">Hoja Principal</p><p className="text-primary font-medium">{w.hojaPrincipal || "-"}</p></div>
                )}
                <div><p className="text-muted mb-1">Color</p><p className="text-primary font-medium">{getLabel(COLORS, w.color) || w.colorOtro || "-"}</p></div>
                <div><p className="text-muted mb-1">Medidas</p><p className="text-primary font-medium">{w.ancho} x {w.alto} mm</p></div>
                <div><p className="text-muted mb-1">Persiana</p><p className="text-primary font-medium">{getLabel(PERSIANAS, w.persiana) || "-"}</p></div>
                {w.persiana !== "sin" && (
                  <>
                    <div><p className="text-muted mb-1">Medida Persiana</p><p className="text-primary font-medium">{getLabel(MEDIDA_PERSIANA_OPTS, w.medidaPersiana) || "-"}</p></div>
                    <div><p className="text-muted mb-1">Accionamiento</p><p className="text-primary font-medium">{getLabel(ACCIONAMIENTOS, w.accionamiento) || "-"}</p></div>
                    <div><p className="text-muted mb-1">Sentido Recogedor</p><p className="text-primary font-medium">{w.sentidoPersiana || "-"}</p></div>
                    {w.accionamiento === "motor" && (
                      <div><p className="text-muted mb-1">Tipo Motor</p><p className="text-primary font-medium">{getLabel(TIPO_MOTOR, w.tipoMotor) || "-"}</p></div>
                    )}
                  </>
                )}
                <div><p className="text-muted mb-1">Guía</p><p className="text-primary font-medium">{getLabel(GUIAS, w.guia) || w.guiaOtro || "-"}</p></div>
                <div><p className="text-muted mb-1">Mosquitera</p><p className="text-primary font-medium">{getLabel(MOSQUITEROS, w.mosquitero) || w.mosquiteroOtro || "-"}</p></div>
                <div><p className="text-muted mb-1">Tapajuntas</p><p className="text-primary font-medium">{getLabel(TAPAJUNTAS, w.tapajuntas) || w.tapajuntasObs || "-"}</p></div>
                <div><p className="text-muted mb-1">Vidrio</p><p className="text-primary font-medium">{getLabel(VIDRIOS, w.vidrio) || w.vidrioOtro || "-"}</p></div>
                <div><p className="text-muted mb-1">Ubicación</p><p className="text-primary font-medium">{w.ubicacion || "-"}</p></div>
                {w.accesoriosAdicionales && <div><p className="text-muted mb-1">Accesorios</p><p className="text-primary font-medium">{w.accesoriosAdicionales}</p></div>}
                {w.notas && <div><p className="text-muted mb-1">Notas</p><p className="text-primary font-medium">{w.notas}</p></div>}
              </div>
              {/* Drawing read-only */}
              {w.drawing && w.drawing.length > 0 && (
                <div className="mt-4 pt-4 border-t border-border">
                  <p className="text-muted text-xs font-semibold mb-2 flex items-center gap-1.5"><PenTool className="w-3.5 h-3.5" /> Dibujo Técnico</p>
                  <DrawingCanvas initialData={w.drawing} readOnly />
                </div>
              )}
            </div>
          ))}

          {/* Servicios de Obra */}
          {SERVICIOS_OBRA.some((s) => servicios[s.id]) && (
            <div className="bg-surface border border-border rounded-2xl p-6">
              <h4 className="text-base font-semibold text-primary mb-3">Servicios de Obra</h4>
              <div className="flex flex-wrap gap-2">
                {SERVICIOS_OBRA.filter((s) => servicios[s.id]).map((s) => (
                  <span key={s.id} className="px-3 py-1.5 rounded-xl text-xs font-bold bg-primary/20 text-primary border border-primary/30">{s.label}</span>
                ))}
              </div>
            </div>
          )}

          {/* Global Notes */}
          {globalNotas && (
            <div className="bg-surface border border-border rounded-2xl p-6">
              <h4 className="text-base font-semibold text-primary mb-3">Notas Globales</h4>
              <p className="text-primary whitespace-pre-wrap">{globalNotas}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            {client.measurementApproval?.status === "aprobado" ? (
              <div className="bg-success/10 border border-success/30 rounded-xl px-4 py-2.5 text-success text-sm font-semibold flex items-center gap-2">
                &#10003; Medicion aprobada — No se permiten cambios
              </div>
            ) : (
              <Button variant="primary" onClick={() => setEditId(windows[0]?.id)}>Editar</Button>
            )}
            <Button variant="secondary" onClick={generatePdf}>Generar PDF</Button>
          </div>

          {/* Email */}
          <div className="bg-surface border border-border rounded-2xl p-6">
            <h4 className="text-base font-semibold text-primary mb-4">Enviar por Email</h4>
            <div className="flex gap-3">
              <TextInput placeholder="email@ejemplo.com" value={emailTo} onChange={setEmailTo} type="email" />
              <Button variant="primary" onClick={handleSendEmail} disabled={!emailTo}>Enviar</Button>
            </div>
            {emailSent && <p className="text-success text-sm mt-2">Email enviado exitosamente</p>}
          </div>
        </div>
      </div>
    );
  }

  /* ── Edit view ── */

  return (
    <div className="min-h-screen bg-background text-primary">
      <Header title="Formulario de Medición" subtitle={client.businessName ? `${client.businessName} — ${client.name}` : client.name} onBack={onBack} />

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Client Info */}
        <div className="bg-surface border border-border rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-primary mb-3">Información del Cliente</h3>
          {client.businessName && (
            <div className="mb-3">
              <p className="text-muted text-sm mb-1">Negocio</p>
              <p className="text-primary font-semibold">
                {client.hubspotLink ? <a href={client.hubspotLink} target="_blank" rel="noopener noreferrer" className="hover:underline">🔗 {client.businessName}</a> : client.businessName}
              </p>
            </div>
          )}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div><p className="text-muted mb-1">Dirección</p><p className="text-primary">{client.address}</p></div>
            <div><p className="text-muted mb-1">Teléfono</p><p className="text-primary">{client.phone}</p></div>
          </div>
        </div>

        {/* Windows */}
        <div className="space-y-4">
          {windows.map((w, idx) => (
            <WindowForm
              key={w.id}
              w={w}
              idx={idx}
              isOpen={editId === w.id}
              onToggle={handleToggle}
              onUpdate={handleUpdateWin}
              onRemove={handleRemoveWin}
              canRemove={windows.length > 1}
            />
          ))}

          {windows.length < 40 && (
            <button onClick={addWin} className="w-full py-4 rounded-2xl border-2 border-dashed border-primary/50 text-primary hover:bg-dark/30 flex items-center justify-center gap-2 transition-all">
              <Plus size={20} /><span className="font-medium">Agregar Ventana</span>
            </button>
          )}
        </div>

        {/* Servicios de Obra */}
        <div className="bg-surface border border-border rounded-2xl p-6">
          <h4 className="text-base font-semibold text-primary mb-1">Servicios de Obra</h4>
          <p className="text-xs text-muted mb-4">Selecciona los servicios que aplican para esta obra</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {SERVICIOS_OBRA.map((s) => (
              <button key={s.id} type="button" onClick={() => toggleServicio(s.id)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 text-left transition-all cursor-pointer ${
                  servicios[s.id] ? "border-primary bg-primary/10 text-primary" : "border-border bg-dark text-muted hover:border-muted"
                }`}>
                <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all ${servicios[s.id] ? "border-primary bg-primary" : "border-muted/50"}`}>
                  {servicios[s.id] && (
                    <svg className="w-3 h-3 text-dark" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <span className="text-sm font-medium">{s.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Global Notes */}
        <div className="bg-surface border border-border rounded-2xl p-6">
          <Field label="Notas Globales">
            <textarea placeholder="Notas adicionales para toda la medición..." value={globalNotas}
              onChange={(e) => setGlobalNotas(e.target.value)}
              className="w-full bg-dark border border-border rounded-lg px-4 py-3 text-primary placeholder-muted focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 resize-none" rows="4" />
          </Field>
        </div>

        {/* Save */}
        <div className="flex gap-3">
          <Button variant="primary" onClick={handleSave} disabled={!allComplete} full>
            {allComplete ? "Guardar Medición" : "Completa todas las ventanas para guardar"}
          </Button>
        </div>
      </div>
    </div>
  );
}
