import {
  WINDOW_TYPES,
  TIPOS_SIN_HOJA_PRINCIPAL,
  COLORS,
  PERSIANAS,
  MEDIDA_PERSIANA_OPTS,
  ACCIONAMIENTOS,
  TIPO_MOTOR,
  GUIAS,
  MOSQUITEROS,
  TAPAJUNTAS,
  VIDRIOS,
  USERS,
  COMERCIALES,
  SERVICIOS_OBRA,
  getLabel,
} from "../../lib/constants";
import { formatDate } from "../../lib/utils";
import { generateMeasurementPdf } from "../../lib/pdfGenerator";
import Header from "../ui/Header";
import Button from "../ui/Button";
import DrawingCanvas from "../ui/DrawingCanvas";
import { FileText, ExternalLink, Camera, Video, PenTool } from "lucide-react";
import { useState } from "react";

/**
 * Read-only measurement detail view, accessible from all profiles.
 * Similar to the "Medición Completada" view in MeasurementForm.
 */
export default function MeasurementDetailView({ client, route, onBack }) {
  const [lightbox, setLightbox] = useState(null);
  const windows = client.measurement?.windows || [];
  const globalNotas = client.measurement?.globalNotas || "";
  const servicios = client.measurement?.servicios || {};
  const medidor = USERS.find((u) => u.id === route?.assignedTo);
  const comercial = COMERCIALES.find((cm) => cm.id === client.comercialId);

  const generatePdf = () => generateMeasurementPdf({ client, route });

  if (!client.measurement || windows.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Header title="Detalle de Medicion" onBack={onBack} />
        <div className="max-w-4xl mx-auto px-4 py-12 text-center text-muted">
          Este cliente aun no tiene mediciones registradas.
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-primary">
      <Header
        title="Detalle de Medicion"
        subtitle={client.businessName ? `${client.businessName} — ${client.name}` : client.name}
        onBack={onBack}
      />

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Approval status banner */}
        {client.measurementApproval?.status === "aprobado" && (
          <div className="bg-success/10 border border-success/30 rounded-2xl p-4 flex items-center gap-3">
            <span className="text-success text-lg">&#10003;</span>
            <div>
              <p className="text-success font-semibold text-sm">Medicion Aprobada</p>
              {client.measurementApproval.approvedAt && (
                <p className="text-muted text-xs mt-0.5">
                  {new Date(client.measurementApproval.approvedAt).toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" })}
                </p>
              )}
            </div>
          </div>
        )}
        {client.measurementApproval?.status === "pendiente_aprobacion" && (
          <div className="bg-warning/10 border border-warning/30 rounded-2xl p-4 flex items-center gap-3">
            <span className="text-warning text-lg">&#9203;</span>
            <p className="text-warning font-semibold text-sm">Pendiente de Aprobacion</p>
          </div>
        )}

        {/* Client Info Card */}
        <div className="bg-surface border border-border rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-primary mb-3">
            Informacion del Cliente
          </h3>
          {client.businessName && (
            <div className="mb-3">
              <p className="text-muted text-sm mb-1">Negocio</p>
              <p className="text-primary font-semibold">
                {client.hubspotLink ? (
                  <a href={client.hubspotLink} target="_blank" rel="noopener noreferrer" className="hover:underline flex items-center gap-1">
                    <ExternalLink className="w-3.5 h-3.5" /> {client.businessName}
                  </a>
                ) : client.businessName}
              </p>
            </div>
          )}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-muted mb-1">Direccion</p>
              <p className="text-primary">{client.address || "—"}</p>
            </div>
            <div>
              <p className="text-muted mb-1">Telefono</p>
              <p className="text-primary">{client.phone || "—"}</p>
            </div>
            <div>
              <p className="text-muted mb-1">Medidor</p>
              <p className="text-primary">{medidor?.name || "—"}</p>
            </div>
            <div>
              <p className="text-muted mb-1">Comercial</p>
              <p className="text-primary">{comercial?.nombre || "—"}</p>
            </div>
          </div>
          {route && (
            <div className="mt-3 text-xs text-muted">
              Fecha de jornada: <span className="text-white font-medium capitalize">{formatDate(route.date)}</span>
            </div>
          )}
        </div>

        {/* Windows Summary Cards */}
        {windows.map((w, idx) => (
          <div key={w.id || idx} className="bg-surface border border-border rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-base font-semibold text-primary">
                Ventana {idx + 1}
              </h4>
              <div className="flex items-center gap-2">
                {w.persiana !== "sin" && (
                  <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30">Con Persiana</span>
                )}
                {w.accionamiento === "motor" && (
                  <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-pink-500/20 text-pink-400 border border-pink-500/30">Motorizada</span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-muted mb-1">Tipo</p>
                <p className="text-primary font-medium">{getLabel(WINDOW_TYPES, w.tipo) || "—"}</p>
              </div>
              <div>
                <p className="text-muted mb-1">Medidas</p>
                <p className="text-primary font-medium">{w.ancho} x {w.alto} mm</p>
              </div>
              <div>
                <p className="text-muted mb-1">Sentido Apertura</p>
                <p className="text-primary font-medium">{w.sentidoApertura || "—"}</p>
              </div>

              {!TIPOS_SIN_HOJA_PRINCIPAL.includes(w.tipo) && (
                <div>
                  <p className="text-muted mb-1">Hoja Principal</p>
                  <p className="text-primary font-medium">{w.hojaPrincipal || "—"}</p>
                </div>
              )}

              <div>
                <p className="text-muted mb-1">Color</p>
                <p className="text-primary font-medium">{getLabel(COLORS, w.color) || w.colorOtro || "—"}</p>
              </div>

              <div>
                <p className="text-muted mb-1">Ubicacion</p>
                <p className="text-primary font-medium">{w.ubicacion || "—"}</p>
              </div>

              <div>
                <p className="text-muted mb-1">Persiana</p>
                <p className="text-primary font-medium">{getLabel(PERSIANAS, w.persiana) || "—"}</p>
              </div>

              {w.persiana !== "sin" && (
                <>
                  <div>
                    <p className="text-muted mb-1">Medida Persiana</p>
                    <p className="text-primary font-medium">{getLabel(MEDIDA_PERSIANA_OPTS, w.medidaPersiana) || "—"}</p>
                  </div>
                  <div>
                    <p className="text-muted mb-1">Accionamiento</p>
                    <p className="text-primary font-medium">{getLabel(ACCIONAMIENTOS, w.accionamiento) || "—"}</p>
                  </div>
                  <div>
                    <p className="text-muted mb-1">Sentido Recogedor</p>
                    <p className="text-primary font-medium">{w.sentidoPersiana || "—"}</p>
                  </div>
                  {w.accionamiento === "motor" && (
                    <div>
                      <p className="text-muted mb-1">Tipo Motor</p>
                      <p className="text-primary font-medium">{getLabel(TIPO_MOTOR, w.tipoMotor) || "—"}</p>
                    </div>
                  )}
                </>
              )}

              <div>
                <p className="text-muted mb-1">Guia</p>
                <p className="text-primary font-medium">{getLabel(GUIAS, w.guia) || w.guiaOtro || "—"}</p>
              </div>

              <div>
                <p className="text-muted mb-1">Mosquitera</p>
                <p className="text-primary font-medium">{getLabel(MOSQUITEROS, w.mosquitero) || w.mosquiteroOtro || "—"}</p>
              </div>

              <div>
                <p className="text-muted mb-1">Tapajuntas</p>
                <p className="text-primary font-medium">{getLabel(TAPAJUNTAS, w.tapajuntas) || w.tapajuntasObs || "—"}</p>
              </div>

              <div>
                <p className="text-muted mb-1">Vidrio</p>
                <p className="text-primary font-medium">{getLabel(VIDRIOS, w.vidrio) || w.vidrioOtro || "—"}</p>
              </div>

              {w.accesoriosAdicionales && (
                <div>
                  <p className="text-muted mb-1">Accesorios</p>
                  <p className="text-primary font-medium">{w.accesoriosAdicionales}</p>
                </div>
              )}

              {w.notas && (
                <div>
                  <p className="text-muted mb-1">Notas</p>
                  <p className="text-primary font-medium">{w.notas}</p>
                </div>
              )}
            </div>

            {/* Media gallery */}
            {w.media && w.media.length > 0 && (
              <div className="mt-4 pt-4 border-t border-border">
                <p className="text-muted text-xs font-semibold mb-3 flex items-center gap-1.5">
                  <Camera className="w-3.5 h-3.5" /> Fotos / Videos ({w.media.length})
                </p>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {w.media.map((m, mi) => (
                    <div
                      key={mi}
                      onClick={() => setLightbox(m)}
                      className="relative rounded-xl overflow-hidden bg-dark border border-border aspect-square cursor-pointer hover:border-primary/50 transition-all group"
                    >
                      {m.type === "image" ? (
                        <img src={m.url} alt={`Foto ${mi + 1}`} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-dark">
                          <video src={m.url} className="w-full h-full object-cover" />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-10 h-10 bg-dark/80 rounded-full flex items-center justify-center">
                              <Video className="w-5 h-5 text-primary" />
                            </div>
                          </div>
                        </div>
                      )}
                      <div className="absolute bottom-1 left-1 bg-dark/80 rounded px-1.5 py-0.5 text-[9px] text-white">
                        {m.type === "image" ? "Foto" : "Video"} {mi + 1}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Drawing read-only */}
            {w.drawing && w.drawing.length > 0 && (
              <div className="mt-4 pt-4 border-t border-border">
                <p className="text-muted text-xs font-semibold mb-2 flex items-center gap-1.5">
                  <PenTool className="w-3.5 h-3.5" /> Dibujo Técnico
                </p>
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
                <span key={s.id} className="px-3 py-1.5 rounded-xl text-xs font-bold bg-primary/20 text-primary border border-primary/30">
                  {s.label}
                </span>
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

        {/* Action Buttons */}
        <div className="flex gap-3 pb-8">
          <Button variant="primary" onClick={generatePdf}>
            <FileText className="w-4 h-4" /> Generar PDF
          </Button>
        </div>
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}
        >
          <div className="max-w-3xl max-h-[80vh] w-full" onClick={(e) => e.stopPropagation()}>
            {lightbox.type === "image" ? (
              <img src={lightbox.url} alt="Media" className="w-full h-auto max-h-[80vh] object-contain rounded-2xl" />
            ) : (
              <video src={lightbox.url} controls autoPlay className="w-full max-h-[80vh] rounded-2xl" />
            )}
            <button
              onClick={() => setLightbox(null)}
              className="absolute top-4 right-4 w-10 h-10 bg-dark/80 rounded-full flex items-center justify-center text-white hover:bg-dark transition-all cursor-pointer text-lg"
            >
              &times;
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
