import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { CITIES } from "../../lib/constants";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import TextInput from "../../components/ui/TextInput";
import SelectInput from "../../components/ui/SelectInput";
import Field from "../../components/ui/Field";
import { Plus, Search, Pencil, UserX, UserCheck, Loader2 } from "lucide-react";

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

const EMPTY_FORM = { name: "", username: "", email: "", password: "", role: "", city: "", dni: "", tie: "" };

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Load users from Supabase profiles table
  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error loading users:", error);
    } else {
      setUsers(data || []);
    }
    setLoading(false);
  };

  const filtered = users.filter((u) => {
    if (search && !u.name.toLowerCase().includes(search.toLowerCase()) && !u.username.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterRole !== "all" && u.role !== filterRole) return false;
    return true;
  });

  const openNew = () => {
    setEditUser(null);
    setForm(EMPTY_FORM);
    setError("");
    setModalOpen(true);
  };

  const openEdit = (u) => {
    setEditUser(u);
    setForm({
      name: u.name,
      username: u.username,
      email: u.email || "",
      password: "",
      role: u.role,
      city: u.city || "",
      dni: u.dni || "",
      tie: u.tie || "",
    });
    setError("");
    setModalOpen(true);
  };

  const handleSave = async () => {
    setError("");
    setSaving(true);

    try {
      if (editUser) {
        // ── UPDATE existing user ──
        const { error: updateError } = await supabase.rpc("update_app_user", {
          target_user_id: editUser.id,
          new_name: form.name || null,
          new_role: form.role || null,
          new_city: form.city || null,
          new_dni: form.dni || null,
          new_tie: form.tie || null,
        });

        if (updateError) {
          setError(updateError.message);
          setSaving(false);
          return;
        }
      } else {
        // ── CREATE new user ──
        if (!form.name || !form.username || !form.role || !form.password) {
          setError("Completa todos los campos obligatorios");
          setSaving(false);
          return;
        }

        // Build the email: use provided email or generate internal one
        const email = form.email.trim()
          ? form.email.trim().toLowerCase()
          : `${form.username.trim().toLowerCase()}.internal@termprotect.es`;

        const { data: newUserId, error: createError } = await supabase.rpc("create_app_user", {
          user_email: email,
          user_password: form.password,
          user_username: form.username.trim().toLowerCase(),
          user_name: form.name.trim(),
          user_role: form.role,
          user_city: form.city || null,
          user_dni: form.dni.trim().toUpperCase() || null,
          user_tie: form.tie.trim().toUpperCase() || null,
        });

        if (createError) {
          // Friendly error messages
          if (createError.message.includes("duplicate") && createError.message.includes("email")) {
            setError("Ya existe un usuario con ese email.");
          } else if (createError.message.includes("duplicate") && createError.message.includes("dni")) {
            setError("Ya existe un usuario con ese DNI.");
          } else if (createError.message.includes("duplicate") && createError.message.includes("tie")) {
            setError("Ya existe un usuario con ese TIE.");
          } else {
            setError(createError.message);
          }
          setSaving(false);
          return;
        }
      }

      // Reload users and close modal
      await loadUsers();
      setModalOpen(false);
    } catch (err) {
      setError("Error inesperado. Intenta de nuevo.");
      console.error("Save user error:", err);
    }
    setSaving(false);
  };

  const toggleActive = async (userId, currentActive) => {
    const { error } = await supabase.rpc("update_app_user", {
      target_user_id: userId,
      new_active: !currentActive,
    });

    if (error) {
      console.error("Error toggling user:", error);
      return;
    }

    // Update local state immediately
    setUsers((prev) => prev.map((u) => u.id === userId ? { ...u, active: !currentActive } : u));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 text-primary animate-spin" />
        <span className="ml-2 text-muted">Cargando usuarios...</span>
      </div>
    );
  }

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
        <div className="flex gap-2 flex-wrap">
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
              <th className="text-left px-5 py-3 text-xs text-muted font-semibold uppercase tracking-wider">DNI / TIE</th>
              <th className="text-left px-5 py-3 text-xs text-muted font-semibold uppercase tracking-wider">Estado</th>
              <th className="px-5 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-10 text-muted text-sm">
                  {search || filterRole !== "all" ? "No se encontraron usuarios con ese filtro" : "No hay usuarios registrados"}
                </td>
              </tr>
            ) : (
              filtered.map((u) => (
                <tr key={u.id} className={`border-b border-border/50 hover:bg-surface-hover transition-colors ${u.active === false ? "opacity-50" : ""}`}>
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
                  <td className="px-5 py-3.5 text-sm text-muted">
                    {u.dni || u.tie || "—"}
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${u.active !== false ? "text-success" : "text-muted"}`}>
                      <span className={`w-2 h-2 rounded-full ${u.active !== false ? "bg-success" : "bg-muted"}`} />
                      {u.active !== false ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex gap-1 justify-end">
                      <button onClick={() => openEdit(u)} className="p-1.5 rounded-lg text-muted hover:text-white hover:bg-surface-hover transition-colors cursor-pointer">
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => toggleActive(u.id, u.active !== false)} className="p-1.5 rounded-lg text-muted hover:text-warning hover:bg-surface-hover transition-colors cursor-pointer">
                        {u.active !== false ? <UserX className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal — Create / Edit User */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editUser ? "Editar Usuario" : "Nuevo Usuario"}>
        <div className="space-y-4">
          <Field label="Nombre completo" required>
            <TextInput value={form.name} onChange={(v) => setForm({ ...form, name: v })} placeholder="Nombre completo" />
          </Field>

          <Field label="Username" required={!editUser}>
            <TextInput
              value={form.username}
              onChange={(v) => setForm({ ...form, username: v })}
              placeholder="nombre.usuario"
              disabled={!!editUser}
            />
          </Field>

          {!editUser && (
            <Field label="Email" hint="Si no tiene email, se genera uno interno automáticamente">
              <TextInput
                value={form.email}
                onChange={(v) => setForm({ ...form, email: v })}
                placeholder="usuario@email.com (opcional para medidores)"
              />
            </Field>
          )}

          {!editUser && (
            <Field label="Contraseña" required>
              <TextInput
                type="password"
                value={form.password}
                onChange={(v) => setForm({ ...form, password: v })}
                placeholder="Contraseña inicial"
              />
            </Field>
          )}

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

          {/* DNI / TIE fields */}
          <div className="grid grid-cols-2 gap-3">
            <Field label="DNI" hint="Documento nacional">
              <TextInput
                value={form.dni}
                onChange={(v) => setForm({ ...form, dni: v })}
                placeholder="12345678A"
              />
            </Field>
            <Field label="TIE" hint="Tarjeta identidad extranjero">
              <TextInput
                value={form.tie}
                onChange={(v) => setForm({ ...form, tie: v })}
                placeholder="X1234567A"
              />
            </Field>
          </div>

          {error && (
            <div className="bg-danger/10 border border-danger/30 rounded-xl px-4 py-2.5 text-danger text-xs font-medium">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Button variant="secondary" onClick={() => setModalOpen(false)} full>Cancelar</Button>
            <Button
              onClick={handleSave}
              full
              disabled={saving || !form.name || (!editUser && !form.username) || !form.role || (!editUser && !form.password)}
            >
              {saving ? "Guardando..." : editUser ? "Guardar cambios" : "Crear usuario"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
