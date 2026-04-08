import { useState } from "react";
import { USERS, CITIES } from "../../lib/constants";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import TextInput from "../../components/ui/TextInput";
import SelectInput from "../../components/ui/SelectInput";
import Field from "../../components/ui/Field";
import { Plus, Search, Pencil, UserX, UserCheck } from "lucide-react";

const ROLE_OPTIONS = [
  { id: "admin", label: "Administrador" },
  { id: "director", label: "Director" },
  { id: "logistica", label: "Logística" },
  { id: "medidor", label: "Medidor" },
];

const ROLE_COLORS = {
  admin: "bg-primary/20 text-primary",
  director: "bg-purple-500/20 text-purple-400",
  logistica: "bg-blue-500/20 text-blue-400",
  medidor: "bg-success/20 text-success",
};

export default function UsersPage() {
  const [users, setUsers] = useState(USERS.map(u => ({ ...u, active: true })));
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [form, setForm] = useState({ name: "", username: "", password: "", role: "", city: "" });

  const filtered = users.filter((u) => {
    if (search && !u.name.toLowerCase().includes(search.toLowerCase()) && !u.username.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterRole !== "all" && u.role !== filterRole) return false;
    return true;
  });

  const openNew = () => {
    setEditUser(null);
    setForm({ name: "", username: "", password: "", role: "", city: "" });
    setModalOpen(true);
  };

  const openEdit = (u) => {
    setEditUser(u);
    setForm({ name: u.name, username: u.username, password: "", role: u.role, city: u.city || "" });
    setModalOpen(true);
  };

  const handleSave = () => {
    if (!form.name || !form.username || !form.role) return;
    if (editUser) {
      setUsers((prev) => prev.map((u) => u.id === editUser.id ? { ...u, name: form.name, username: form.username, role: form.role, city: form.city || null, ...(form.password ? { password: form.password } : {}) } : u));
    } else {
      const newUser = { id: "usr_" + Date.now(), name: form.name, username: form.username, password: form.password || "1234", role: form.role, city: form.city || null, active: true };
      setUsers((prev) => [...prev, newUser]);
    }
    setModalOpen(false);
  };

  const toggleActive = (id) => {
    setUsers((prev) => prev.map((u) => u.id === id ? { ...u, active: !u.active } : u));
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Usuarios</h1>
          <p className="text-muted text-sm mt-1">{users.length} usuarios registrados</p>
        </div>
        <Button onClick={openNew}><Plus className="w-4 h-4" /> Nuevo Usuario</Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar usuario..."
            className="w-full pl-9 pr-4 py-2 bg-surface border border-border rounded-xl text-white text-sm outline-none focus:border-primary transition-colors"
          />
        </div>
        <div className="flex gap-2">
          {[{ id: "all", label: "Todos" }, ...ROLE_OPTIONS].map((r) => (
            <button
              key={r.id}
              onClick={() => setFilterRole(r.id)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
                filterRole === r.id
                  ? "bg-primary text-dark border-primary"
                  : "bg-surface text-muted border-border hover:border-muted/50"
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-surface border border-border rounded-2xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left px-5 py-3 text-xs text-muted font-semibold uppercase tracking-wider">Nombre</th>
              <th className="text-left px-5 py-3 text-xs text-muted font-semibold uppercase tracking-wider">Usuario</th>
              <th className="text-left px-5 py-3 text-xs text-muted font-semibold uppercase tracking-wider">Rol</th>
              <th className="text-left px-5 py-3 text-xs text-muted font-semibold uppercase tracking-wider">Ciudad</th>
              <th className="text-left px-5 py-3 text-xs text-muted font-semibold uppercase tracking-wider">Estado</th>
              <th className="px-5 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((u) => (
              <tr key={u.id} className={`border-b border-border/50 hover:bg-surface-hover transition-colors ${!u.active ? "opacity-50" : ""}`}>
                <td className="px-5 py-3.5 font-semibold text-sm">{u.name}</td>
                <td className="px-5 py-3.5 text-sm text-muted">{u.username}</td>
                <td className="px-5 py-3.5">
                  <span className={`inline-flex px-2.5 py-1 rounded-lg text-[11px] font-semibold ${ROLE_COLORS[u.role] || ""}`}>
                    {ROLE_OPTIONS.find((r) => r.id === u.role)?.label || u.role}
                  </span>
                </td>
                <td className="px-5 py-3.5 text-sm text-muted">
                  {u.city === null ? "Todas" : CITIES.find((c) => c.id === u.city)?.label || u.city || "—"}
                </td>
                <td className="px-5 py-3.5">
                  <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${u.active ? "text-success" : "text-muted"}`}>
                    <span className={`w-2 h-2 rounded-full ${u.active ? "bg-success" : "bg-muted"}`} />
                    {u.active ? "Activo" : "Inactivo"}
                  </span>
                </td>
                <td className="px-5 py-3.5">
                  <div className="flex gap-1 justify-end">
                    <button onClick={() => openEdit(u)} className="p-1.5 rounded-lg text-muted hover:text-white hover:bg-surface-hover transition-colors cursor-pointer">
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => toggleActive(u.id)} className="p-1.5 rounded-lg text-muted hover:text-warning hover:bg-surface-hover transition-colors cursor-pointer">
                      {u.active ? <UserX className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editUser ? "Editar Usuario" : "Nuevo Usuario"}>
        <div className="space-y-4">
          <Field label="Nombre" required>
            <TextInput value={form.name} onChange={(v) => setForm({ ...form, name: v })} placeholder="Nombre completo" />
          </Field>
          <Field label="Usuario" required>
            <TextInput value={form.username} onChange={(v) => setForm({ ...form, username: v })} placeholder="nombre.usuario" />
          </Field>
          <Field label={editUser ? "Nueva contraseña (dejar vacío para mantener)" : "Contraseña"} required={!editUser}>
            <TextInput type="password" value={form.password} onChange={(v) => setForm({ ...form, password: v })} placeholder={editUser ? "••••••••" : "Contraseña inicial"} />
          </Field>
          <Field label="Rol" required>
            <SelectInput value={form.role} onChange={(v) => setForm({ ...form, role: v })} options={ROLE_OPTIONS} placeholder="Seleccionar rol..." />
          </Field>
          <Field label="Ciudad">
            <SelectInput
              value={form.city}
              onChange={(v) => setForm({ ...form, city: v })}
              options={[{ id: "", label: "Todas las ciudades" }, ...CITIES]}
              placeholder="Seleccionar ciudad..."
            />
          </Field>
          <div className="flex gap-3 pt-2">
            <Button variant="secondary" onClick={() => setModalOpen(false)} full>Cancelar</Button>
            <Button onClick={handleSave} full disabled={!form.name || !form.username || !form.role}>
              {editUser ? "Guardar cambios" : "Crear usuario"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
