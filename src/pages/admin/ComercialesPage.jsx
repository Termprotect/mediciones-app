import { useState } from "react";
import { COMERCIALES, CITIES } from "../../lib/constants";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import TextInput from "../../components/ui/TextInput";
import SelectInput from "../../components/ui/SelectInput";
import Field from "../../components/ui/Field";
import { Plus, Pencil, UserX, UserCheck } from "lucide-react";

export default function ComercialesPage() {
  const [comerciales, setComerciales] = useState(COMERCIALES);
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState({ nombre: "", email: "", telefono: "", ciudad: "" });

  const openNew = () => {
    setEditItem(null);
    setForm({ nombre: "", email: "", telefono: "", ciudad: "" });
    setModalOpen(true);
  };

  const openEdit = (item) => {
    setEditItem(item);
    setForm({ nombre: item.nombre, email: item.email, telefono: item.telefono, ciudad: item.ciudad });
    setModalOpen(true);
  };

  const handleSave = () => {
    if (!form.nombre) return;
    if (editItem) {
      setComerciales((prev) => prev.map((c) => c.id === editItem.id ? { ...c, ...form } : c));
    } else {
      setComerciales((prev) => [...prev, { id: "com_" + Date.now(), ...form, activo: true }]);
    }
    setModalOpen(false);
  };

  const toggleActive = (id) => {
    setComerciales((prev) => prev.map((c) => c.id === id ? { ...c, activo: !c.activo } : c));
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Comerciales</h1>
          <p className="text-muted text-sm mt-1">Gestiona los comerciales responsables de cada zona</p>
        </div>
        <Button onClick={openNew}><Plus className="w-4 h-4" /> Nuevo Comercial</Button>
      </div>

      <div className="bg-surface border border-border rounded-2xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left px-5 py-3 text-xs text-muted font-semibold uppercase tracking-wider">Nombre</th>
              <th className="text-left px-5 py-3 text-xs text-muted font-semibold uppercase tracking-wider">Email</th>
              <th className="text-left px-5 py-3 text-xs text-muted font-semibold uppercase tracking-wider">Teléfono</th>
              <th className="text-left px-5 py-3 text-xs text-muted font-semibold uppercase tracking-wider">Ciudad</th>
              <th className="text-left px-5 py-3 text-xs text-muted font-semibold uppercase tracking-wider">Estado</th>
              <th className="px-5 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {comerciales.map((c) => (
              <tr key={c.id} className={`border-b border-border/50 hover:bg-surface-hover transition-colors ${!c.activo ? "opacity-50" : ""}`}>
                <td className="px-5 py-3.5 font-semibold text-sm">{c.nombre}</td>
                <td className="px-5 py-3.5 text-sm text-muted">{c.email}</td>
                <td className="px-5 py-3.5 text-sm text-muted">{c.telefono}</td>
                <td className="px-5 py-3.5 text-sm">{CITIES.find((city) => city.id === c.ciudad)?.label || "—"}</td>
                <td className="px-5 py-3.5">
                  <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${c.activo ? "text-success" : "text-muted"}`}>
                    <span className={`w-2 h-2 rounded-full ${c.activo ? "bg-success" : "bg-muted"}`} />
                    {c.activo ? "Activo" : "Inactivo"}
                  </span>
                </td>
                <td className="px-5 py-3.5">
                  <div className="flex gap-1 justify-end">
                    <button onClick={() => openEdit(c)} className="p-1.5 rounded-lg text-muted hover:text-white hover:bg-dark transition-colors cursor-pointer"><Pencil className="w-3.5 h-3.5" /></button>
                    <button onClick={() => toggleActive(c.id)} className="p-1.5 rounded-lg text-muted hover:text-warning hover:bg-dark transition-colors cursor-pointer">
                      {c.activo ? <UserX className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editItem ? "Editar Comercial" : "Nuevo Comercial"}>
        <div className="space-y-4">
          <Field label="Nombre" required><TextInput value={form.nombre} onChange={(v) => setForm({ ...form, nombre: v })} placeholder="Nombre completo" /></Field>
          <Field label="Email"><TextInput type="email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} placeholder="email@termprotect.es" /></Field>
          <Field label="Teléfono"><TextInput value={form.telefono} onChange={(v) => setForm({ ...form, telefono: v })} placeholder="600 123 456" /></Field>
          <Field label="Ciudad" required>
            <SelectInput value={form.ciudad} onChange={(v) => setForm({ ...form, ciudad: v })} options={CITIES} placeholder="Seleccionar ciudad..." />
          </Field>
          <div className="flex gap-3 pt-2">
            <Button variant="secondary" onClick={() => setModalOpen(false)} full>Cancelar</Button>
            <Button onClick={handleSave} full disabled={!form.nombre}>{editItem ? "Guardar" : "Crear"}</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
