import { useState, useRef } from "react";
import { CITIES, USERS, getMedidoresForCity, getComercialesForCity } from "../../lib/constants";
import { uid, emptyClient } from "../../lib/utils";
import Header from "../ui/Header";
import Button from "../ui/Button";
import TextInput from "../ui/TextInput";
import SelectInput from "../ui/SelectInput";
import Field from "../ui/Field";
import AddressAutocomplete from "../ui/AddressAutocomplete";
import { Plus, Trash2, ChevronUp, ChevronDown, Check, MapPin, Phone, ExternalLink } from "lucide-react";

export default function RouteEditor({ route: initial, city: defaultCity, initialDate, onSave, onBack, onDelete }) {
  const [route, setRoute] = useState(
    initial || { id: uid(), date: initialDate || "", assignedTo: "", status: "borrador", city: defaultCity || "", clients: [] }
  );
  const [editClientId, setEditClientId] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const fileInputRef = useRef(null);
  const uploadClientId = useRef(null);
  const todayStr = new Date().toISOString().split("T")[0];

  const updateRoute = (patch) => setRoute((r) => ({ ...r, ...patch }));
  const updateClient = (id, patch) =>
    setRoute((r) => ({ ...r, clients: r.clients.map((c) => (c.id === id ? { ...c, ...patch } : c)) }));
  const addClient = () => {
    const c = emptyClient();
    updateRoute({ clients: [...route.clients, c] });
    setEditClientId(c.id);
  };
  const removeClient = (id) => {
    updateRoute({ clients: route.clients.filter((c) => c.id !== id) });
    if (editClientId === id) setEditClientId(null);
  };
  const moveClient = (from, to) => {
    const arr = [...route.clients];
    const [item] = arr.splice(from, 1);
    arr.splice(to, 0, item);
    updateRoute({ clients: arr });
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file && uploadClientId.current) {
      const url = URL.createObjectURL(file);
      updateClient(uploadClientId.current, { budgetFileName: file.name, budgetUrl: url });
    }
    e.target.value = "";
  };

  const isCompleted = route.status === "completado";
  const medidores = route.city ? getMedidoresForCity(route.city) : [];
  const comerciales = getComercialesForCity(route.city);
  const clientComplete = (c) => c.name && c.address && c.phone && c.scheduledTime && c.comercialId;
  const canSave = !isCompleted && route.date && route.city && route.assignedTo && route.clients.length > 0 && route.clients.every(clientComplete);

  const handleSave = () => {
    const status = route.assignedTo && route.status === "borrador" ? "asignado" : route.status;
    onSave({ ...route, status });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header title={initial ? "Editar Jornada" : "Nueva Jornada"} subtitle="Logística" onBack={onBack} />
      <input type="file" accept=".pdf" ref={fileInputRef} className="hidden" onChange={handleFileUpload} />

      <div className="p-4 sm:p-6 max-w-2xl mx-auto space-y-5">
        {/* Completed banner */}
        {isCompleted && (
          <div className="bg-success/10 border border-success/30 rounded-2xl p-4 flex items-center gap-3">
            <Check className="w-5 h-5 text-success flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-success">Jornada Completada</p>
              <p className="text-xs text-muted mt-0.5">Esta jornada ya fue completada. No se permite modificar la fecha ni reprogramar clientes.</p>
            </div>
          </div>
        )}

        {/* Date & City */}
        <div className="bg-surface border border-border rounded-2xl p-5 space-y-4">
          <Field label="Fecha de medición" required>
            <TextInput type="date" value={route.date} onChange={(v) => updateRoute({ date: v })} min={todayStr} disabled={isCompleted} />
          </Field>
          {!defaultCity && (
            <Field label="Ciudad" required>
              <div className="flex flex-wrap gap-2">
                {CITIES.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => updateRoute({ city: c.id, assignedTo: "" })}
                    className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer border-2 ${
                      route.city === c.id ? "text-white border-transparent" : "bg-surface text-muted border-border"
                    }`}
                    style={route.city === c.id ? { backgroundColor: c.color } : {}}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </Field>
          )}
        </div>

        {/* Clients */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-bold">Clientes ({route.clients.length})</h3>
            <Button onClick={addClient} variant="outline" className="text-xs"><Plus className="w-3.5 h-3.5" /> Añadir</Button>
          </div>

          <div className="space-y-3">
            {route.clients.map((client, idx) =>
              editClientId === client.id ? (
                /* Expanded edit form */
                <div key={client.id} className="bg-surface border-2 border-primary/50 rounded-2xl p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm">Cliente {idx + 1}</span>
                    <Button
                      variant={clientComplete(client) ? "success" : "secondary"}
                      onClick={() => { if (clientComplete(client)) setEditClientId(null); }}
                      className="text-xs"
                    >
                      <Check className="w-3.5 h-3.5" /> {clientComplete(client) ? "Completado" : "Faltan campos"}
                    </Button>
                  </div>

                  <Field label="Nombre del Negocio">
                    <TextInput value={client.businessName || ""} onChange={(v) => updateClient(client.id, { businessName: v })} placeholder="Nombre del negocio o empresa" />
                  </Field>
                  <Field label="Link Negocio HubSpot">
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <TextInput value={client.hubspotLink || ""} onChange={(v) => updateClient(client.id, { hubspotLink: v })} placeholder="https://app.hubspot.com/contacts/..." />
                      </div>
                      {client.hubspotLink && (
                        <a href={client.hubspotLink} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center w-11 h-11 rounded-xl bg-orange-500 text-white flex-shrink-0">
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  </Field>
                  <Field label="Nombre" required>
                    <TextInput value={client.name} onChange={(v) => updateClient(client.id, { name: v })} placeholder="Nombre del cliente" />
                  </Field>
                  <Field label="Dirección" required>
                    <AddressAutocomplete
                      value={client.address}
                      onChange={(v) => updateClient(client.id, { address: v })}
                      onPlaceSelect={(place) => {
                        updateClient(client.id, {
                          address: place.address,
                          googleMapsLink: place.mapsUrl,
                        });
                      }}
                    />
                  </Field>
                  <Field label="Enlace Google Maps">
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <TextInput value={client.googleMapsLink} onChange={(v) => updateClient(client.id, { googleMapsLink: v })} placeholder="https://maps.google.com/..." />
                      </div>
                      {client.googleMapsLink && (
                        <a href={client.googleMapsLink} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center w-11 h-11 rounded-xl bg-blue-600 text-white flex-shrink-0">
                          <MapPin className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  </Field>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Teléfono" required>
                      <TextInput value={client.phone} onChange={(v) => updateClient(client.id, { phone: v })} placeholder="600 123 456" type="tel" />
                    </Field>
                    <Field label="Hora acordada" required>
                      <TextInput type="time" value={client.scheduledTime} onChange={(v) => updateClient(client.id, { scheduledTime: v })} />
                    </Field>
                  </div>
                  <Field label="Comercial responsable" required>
                    <SelectInput
                      value={client.comercialId}
                      onChange={(v) => updateClient(client.id, { comercialId: v })}
                      options={comerciales.map((c) => ({ id: c.id, label: c.nombre }))}
                      placeholder="Seleccionar comercial..."
                    />
                  </Field>
                  <Field label="Notas">
                    <textarea
                      value={client.notas}
                      onChange={(e) => updateClient(client.id, { notas: e.target.value })}
                      placeholder="Notas adicionales..."
                      rows={2}
                      className="w-full px-4 py-2.5 bg-dark border-2 border-border rounded-xl text-white text-sm placeholder:text-muted/50 outline-none focus:border-primary transition-colors resize-none"
                    />
                  </Field>
                  <Field label="Presupuesto (PDF)">
                    <div className="flex items-center gap-3">
                      <Button
                        variant="secondary"
                        onClick={() => { uploadClientId.current = client.id; fileInputRef.current?.click(); }}
                        className="text-xs"
                      >
                        📎 {client.budgetFileName ? "Cambiar" : "Adjuntar PDF"}
                      </Button>
                      {client.budgetFileName && (
                        <span className="text-xs text-success font-medium">✓ {client.budgetFileName}</span>
                      )}
                    </div>
                  </Field>
                </div>
              ) : (
                /* Collapsed card */
                <div
                  key={client.id}
                  onClick={() => setEditClientId(client.id)}
                  className="bg-surface border border-border rounded-2xl p-3.5 flex items-center gap-3 cursor-pointer hover:border-primary/30 transition-all"
                >
                  <div className="flex flex-col gap-0.5 flex-shrink-0">
                    {idx > 0 && (
                      <button onClick={(e) => { e.stopPropagation(); moveClient(idx, idx - 1); }} className="text-muted hover:text-white text-xs cursor-pointer bg-transparent border-none p-0">
                        <ChevronUp className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${clientComplete(client) ? "bg-success text-white" : "bg-primary text-dark"}`}>
                      {idx + 1}
                    </div>
                    {idx < route.clients.length - 1 && (
                      <button onClick={(e) => { e.stopPropagation(); moveClient(idx, idx + 1); }} className="text-muted hover:text-white text-xs cursor-pointer bg-transparent border-none p-0">
                        <ChevronDown className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm">{client.name || "Sin nombre"}</div>
                    {client.businessName && (
                      <div className="text-[11px] text-primary font-medium">
                        {client.hubspotLink ? (
                          <a href={client.hubspotLink} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="hover:underline">
                            🔗 {client.businessName}
                          </a>
                        ) : client.businessName}
                      </div>
                    )}
                    <div className="text-[11px] text-muted mt-0.5">
                      {client.scheduledTime && `🕐 ${client.scheduledTime}`}
                      {client.address && ` · 📍 ${client.address}`}
                    </div>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); removeClient(client.id); }}
                    className="text-muted hover:text-danger p-1 cursor-pointer bg-transparent border-none flex-shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )
            )}
            {route.clients.length === 0 && (
              <div className="text-center py-8 text-muted text-sm bg-surface border border-dashed border-border rounded-2xl">
                👥 Añade clientes a esta jornada
              </div>
            )}
          </div>
        </div>

        {/* Assign Medidor */}
        {route.city && (
          <div className="bg-surface border border-border rounded-2xl p-5">
            <Field label="Asignar medidor" required>
              <div className="space-y-2 mt-1">
                {medidores.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => updateRoute({ assignedTo: m.id })}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl text-sm font-medium transition-all cursor-pointer border-2 text-left ${
                      route.assignedTo === m.id
                        ? "bg-primary/10 border-primary text-white"
                        : "bg-dark border-border text-muted hover:border-muted/50"
                    }`}
                  >
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                      route.assignedTo === m.id ? "bg-primary text-dark" : "bg-surface text-muted"
                    }`}>
                      {m.name.charAt(0)}
                    </div>
                    <span>{m.name}</span>
                    {m.city === "all" && <span className="text-[10px] text-muted">(todas las ciudades)</span>}
                  </button>
                ))}
              </div>
            </Field>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 pb-8">
          {initial && (
            <Button variant="danger" onClick={() => setShowDeleteConfirm(true)} className="px-4">
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
          <Button onClick={handleSave} disabled={!canSave} full>
            {canSave ? "✓ Guardar y Asignar" : "Completa todos los campos"}
          </Button>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface border border-border rounded-2xl p-6 max-w-sm w-full space-y-4">
            <h3 className="text-lg font-bold text-white">Anular Jornada</h3>
            <p className="text-muted text-sm">
              ¿Estás seguro de que deseas anular esta jornada? Esta acción no se puede deshacer.
            </p>
            <div className="flex gap-3 justify-end">
              <Button variant="secondary" onClick={() => setShowDeleteConfirm(false)} className="text-sm">
                Cancelar
              </Button>
              <Button variant="danger" onClick={() => { setShowDeleteConfirm(false); onDelete(route.id); }} className="text-sm">
                Sí, anular
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
