import { useState } from "react";
import { WINDOW_TYPES, COLORS as PRODUCT_COLORS, PERSIANAS, MEDIDA_PERSIANA_OPTS, ACCIONAMIENTOS, TIPO_MOTOR, GUIAS, MOSQUITEROS, TAPAJUNTAS, VIDRIOS } from "../../lib/constants";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import TextInput from "../../components/ui/TextInput";
import Field from "../../components/ui/Field";
import { Plus, Pencil, GripVertical, Eye, EyeOff, Upload } from "lucide-react";

const CATEGORIES = [
  { id: "window_types", label: "Tipos de Ventana", data: WINDOW_TYPES, hasImage: true },
  { id: "colors", label: "Colores", data: PRODUCT_COLORS, hasColor: true },
  { id: "persianas", label: "Persianas", data: PERSIANAS },
  { id: "medida_persiana", label: "Medida Persiana", data: MEDIDA_PERSIANA_OPTS },
  { id: "accionamientos", label: "Accionamientos", data: ACCIONAMIENTOS },
  { id: "tipo_motor", label: "Tipo Motor", data: TIPO_MOTOR },
  { id: "guias", label: "Guías", data: GUIAS },
  { id: "mosquiteros", label: "Mosquiteras", data: MOSQUITEROS },
  { id: "tapajuntas", label: "Tapajuntas", data: TAPAJUNTAS },
  { id: "vidrios", label: "Vidrios", data: VIDRIOS },
];

export default function CatalogPage() {
  const [activeTab, setActiveTab] = useState("window_types");
  const [items, setItems] = useState(() => {
    const map = {};
    CATEGORIES.forEach((c) => { map[c.id] = c.data.map((d) => ({ ...d, active: true })); });
    return map;
  });
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState({ label: "", hex: "", icon: "" });

  const category = CATEGORIES.find((c) => c.id === activeTab);
  const currentItems = items[activeTab] || [];

  const openNew = () => {
    setEditItem(null);
    setForm({ label: "", hex: "", icon: "" });
    setModalOpen(true);
  };

  const openEdit = (item) => {
    setEditItem(item);
    setForm({ label: item.label, hex: item.hex || "", icon: item.icon || "" });
    setModalOpen(true);
  };

  const handleSave = () => {
    if (!form.label) return;
    if (editItem) {
      setItems((prev) => ({
        ...prev,
        [activeTab]: prev[activeTab].map((i) => i.id === editItem.id ? { ...i, label: form.label, hex: form.hex || i.hex, icon: form.icon || i.icon } : i),
      }));
    } else {
      const newItem = { id: activeTab + "_" + Date.now(), label: form.label, hex: form.hex, icon: form.icon, active: true };
      setItems((prev) => ({ ...prev, [activeTab]: [...prev[activeTab], newItem] }));
    }
    setModalOpen(false);
  };

  const toggleActive = (id) => {
    setItems((prev) => ({
      ...prev,
      [activeTab]: prev[activeTab].map((i) => i.id === id ? { ...i, active: !i.active } : i),
    }));
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Catálogo de Productos</h1>
          <p className="text-muted text-sm mt-1">Gestiona los tipos de ventana, colores y opciones del formulario</p>
        </div>
        <Button onClick={openNew}><Plus className="w-4 h-4" /> Nuevo</Button>
      </div>

      {/* Category tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {CATEGORIES.map((c) => (
          <button
            key={c.id}
            onClick={() => setActiveTab(c.id)}
            className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer border ${
              activeTab === c.id
                ? "bg-primary text-dark border-primary"
                : "bg-surface text-muted border-border hover:border-muted/50"
            }`}
          >
            {c.label} ({(items[c.id] || []).filter(i => i.active).length})
          </button>
        ))}
      </div>

      {/* Items list */}
      <div className="bg-surface border border-border rounded-2xl overflow-hidden">
        {currentItems.map((item, idx) => (
          <div
            key={item.id}
            className={`flex items-center gap-3 px-5 py-3.5 border-b border-border/50 hover:bg-surface-hover transition-colors ${!item.active ? "opacity-40" : ""}`}
          >
            <GripVertical className="w-4 h-4 text-muted/40 cursor-grab flex-shrink-0" />

            {category?.hasColor && item.hex && (
              <div className="w-8 h-8 rounded-lg border border-border flex-shrink-0" style={{ backgroundColor: item.hex }} />
            )}

            {category?.hasImage && (
              <div className="w-10 h-10 rounded-lg bg-dark border border-border flex items-center justify-center flex-shrink-0 text-lg">
                {item.icon || "📷"}
              </div>
            )}

            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold truncate">{item.label}</div>
              {item.hex && <div className="text-[11px] text-muted font-mono">{item.hex}</div>}
            </div>

            <div className="flex gap-1">
              <button onClick={() => openEdit(item)} className="p-1.5 rounded-lg text-muted hover:text-white hover:bg-dark transition-colors cursor-pointer">
                <Pencil className="w-3.5 h-3.5" />
              </button>
              <button onClick={() => toggleActive(item.id)} className="p-1.5 rounded-lg text-muted hover:text-warning hover:bg-dark transition-colors cursor-pointer">
                {item.active ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        ))}
        {currentItems.length === 0 && (
          <div className="p-8 text-center text-muted text-sm">No hay elementos en esta categoría</div>
        )}
      </div>

      {/* Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editItem ? "Editar elemento" : "Nuevo elemento"}>
        <div className="space-y-4">
          <Field label="Nombre" required>
            <TextInput value={form.label} onChange={(v) => setForm({ ...form, label: v })} placeholder="Nombre del elemento" />
          </Field>
          {category?.hasColor && (
            <Field label="Color (hex)">
              <div className="flex gap-3 items-center">
                <TextInput value={form.hex} onChange={(v) => setForm({ ...form, hex: v })} placeholder="#FFFFFF" />
                {form.hex && <div className="w-10 h-10 rounded-lg border border-border flex-shrink-0" style={{ backgroundColor: form.hex }} />}
              </div>
            </Field>
          )}
          {category?.hasImage && (
            <Field label="Imagen del producto">
              <div className="border-2 border-dashed border-border rounded-xl p-6 text-center hover:border-primary/50 transition-colors cursor-pointer">
                <Upload className="w-8 h-8 text-muted mx-auto mb-2" />
                <p className="text-sm text-muted">Arrastra una imagen o haz clic para subir</p>
                <p className="text-[11px] text-muted/60 mt-1">PNG, JPG hasta 2MB</p>
              </div>
            </Field>
          )}
          <div className="flex gap-3 pt-2">
            <Button variant="secondary" onClick={() => setModalOpen(false)} full>Cancelar</Button>
            <Button onClick={handleSave} full disabled={!form.label}>
              {editItem ? "Guardar" : "Crear"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
