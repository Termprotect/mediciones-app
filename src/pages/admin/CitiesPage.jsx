import { useState } from "react";
import { CITIES } from "../../lib/constants";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import TextInput from "../../components/ui/TextInput";
import Field from "../../components/ui/Field";
import { Plus, Pencil, EyeOff, Eye } from "lucide-react";

export default function CitiesPage() {
  const [cities, setCities] = useState(CITIES.map(c => ({ ...c, active: true })));
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState({ label: "", color: "#C62828" });

  const openNew = () => { setEditItem(null); setForm({ label: "", color: "#C62828" }); setModalOpen(true); };
  const openEdit = (c) => { setEditItem(c); setForm({ label: c.label, color: c.color }); setModalOpen(true); };

  const handleSave = () => {
    if (!form.label) return;
    if (editItem) {
      setCities(prev => prev.map(c => c.id === editItem.id ? { ...c, label: form.label, color: form.color } : c));
    } else {
      setCities(prev => [...prev, { id: form.label.toLowerCase().replace(/\s+/g, "_"), label: form.label, color: form.color, active: true }]);
    }
    setModalOpen(false);
  };

  const toggleActive = (id) => setCities(prev => prev.map(c => c.id === id ? { ...c, active: !c.active } : c));

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Ciudades</h1>
          <p className="text-muted text-sm mt-1">Zonas operativas de TermProtect</p>
        </div>
        <Button onClick={openNew}><Plus className="w-4 h-4" /> Nueva Ciudad</Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {cities.map((c) => (
          <div key={c.id} className={`bg-surface border border-border rounded-2xl p-5 transition-all ${!c.active ? "opacity-40" : ""}`}>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm" style={{ backgroundColor: c.color }}>
                {c.label.charAt(0)}
              </div>
              <div className="flex-1">
                <div className="font-bold text-sm">{c.label}</div>
                <div className="text-[11px] text-muted font-mono">{c.color}</div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" onClick={() => openEdit(c)} className="text-xs flex-1"><Pencil className="w-3 h-3" /> Editar</Button>
              <Button variant={c.active ? "ghost" : "success"} onClick={() => toggleActive(c.id)} className="text-xs">
                {c.active ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
              </Button>
            </div>
          </div>
        ))}
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editItem ? "Editar Ciudad" : "Nueva Ciudad"}>
        <div className="space-y-4">
          <Field label="Nombre" required><TextInput value={form.label} onChange={(v) => setForm({ ...form, label: v })} placeholder="Nombre de la ciudad" /></Field>
          <Field label="Color identificativo">
            <div className="flex gap-3 items-center">
              <input type="color" value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} className="w-10 h-10 rounded-lg border border-border cursor-pointer" />
              <TextInput value={form.color} onChange={(v) => setForm({ ...form, color: v })} placeholder="#C62828" />
            </div>
          </Field>
          <div className="flex gap-3 pt-2">
            <Button variant="secondary" onClick={() => setModalOpen(false)} full>Cancelar</Button>
            <Button onClick={handleSave} full disabled={!form.label}>{editItem ? "Guardar" : "Crear"}</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
