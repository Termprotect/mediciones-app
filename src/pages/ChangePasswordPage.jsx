import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Lock, Check, AlertCircle } from "lucide-react";
import Header from "../components/ui/Header";
import Button from "../components/ui/Button";

export default function ChangePasswordPage({ onBack }) {
  const { changePassword } = useAuth();
  const [currentPwd, setCurrentPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const validate = () => {
    if (!currentPwd) return "Introduce tu contraseña actual";
    if (newPwd.length < 4) return "La nueva contraseña debe tener al menos 4 caracteres";
    if (newPwd !== confirmPwd) return "Las contraseñas no coinciden";
    return null;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const err = validate();
    if (err) { setError(err); return; }

    const result = changePassword(currentPwd, newPwd);
    if (!result.success) { setError(result.error); return; }

    setSuccess(true);
    setError("");
    setTimeout(() => {
      setSuccess(false);
      onBack?.();
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header title="Cambiar contraseña" subtitle="Seguridad de tu cuenta" onBack={onBack} />
      <div className="max-w-md mx-auto p-6">
        <form onSubmit={handleSubmit} className="bg-surface border border-border rounded-2xl p-6 space-y-5">
          <p className="text-muted text-sm">Tu contraseña debe tener al menos 4 caracteres.</p>

          <div>
            <label className="block text-xs font-medium text-muted mb-1.5">Contraseña actual</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
              <input
                type="password"
                value={currentPwd}
                onChange={(e) => { setCurrentPwd(e.target.value); setError(""); }}
                className="w-full pl-10 pr-4 py-3 bg-dark border-2 border-border rounded-xl text-white text-sm outline-none focus:border-primary transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-muted mb-1.5">Nueva contraseña</label>
            <input
              type="password"
              value={newPwd}
              onChange={(e) => { setNewPwd(e.target.value); setError(""); }}
              placeholder="Mínimo 4 caracteres"
              className="w-full px-4 py-3 bg-dark border-2 border-border rounded-xl text-white text-sm placeholder:text-muted/50 outline-none focus:border-primary transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-muted mb-1.5">Confirmar nueva contraseña</label>
            <input
              type="password"
              value={confirmPwd}
              onChange={(e) => { setConfirmPwd(e.target.value); setError(""); }}
              placeholder="Repite la nueva contraseña"
              className="w-full px-4 py-3 bg-dark border-2 border-border rounded-xl text-white text-sm placeholder:text-muted/50 outline-none focus:border-primary transition-colors"
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 bg-danger/10 border border-danger/30 rounded-xl px-4 py-2.5 text-danger text-xs font-medium">
              <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
            </div>
          )}

          {success && (
            <div className="flex items-center gap-2 bg-success/10 border border-success/30 rounded-xl px-4 py-2.5 text-success text-xs font-medium">
              <Check className="w-4 h-4 flex-shrink-0" /> Contraseña cambiada correctamente
            </div>
          )}

          <Button type="submit" full disabled={success}>
            {success ? "✓ Guardado" : "Guardar cambios"}
          </Button>
        </form>
      </div>
    </div>
  );
}
