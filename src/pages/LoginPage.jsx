import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Lock, User, Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState("");
  const [showForgot, setShowForgot] = useState(false);

  const handleLogin = async (e) => {
      e.preventDefault();
      if (!username.trim() || !password.trim()) {
        setError("Introduce usuario y contraseña");
        return;
      }
      const result = await login(username, password);
      if (!result.success) setError(result.error);
    };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-dark font-extrabold text-2xl">TP</span>
          </div>
          <h1 className="text-2xl font-bold text-white">Sistema de Mediciones</h1>
          <p className="text-muted text-sm mt-1">TermProtect</p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="bg-surface border border-border rounded-2xl p-8">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-muted mb-1.5">Usuario</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => { setUsername(e.target.value); setError(""); }}
                  placeholder="Tu usuario"
                  className="w-full pl-10 pr-4 py-3 bg-dark border-2 border-border rounded-xl text-white text-sm placeholder:text-muted/50 outline-none focus:border-primary transition-colors"
                  autoFocus
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-muted mb-1.5">Contraseña</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                <input
                  type={showPwd ? "text" : "password"}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(""); }}
                  placeholder="Tu contraseña"
                  className="w-full pl-10 pr-10 py-3 bg-dark border-2 border-border rounded-xl text-white text-sm placeholder:text-muted/50 outline-none focus:border-primary transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-white transition-colors cursor-pointer"
                >
                  {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          {error && (
            <div className="mt-4 bg-danger/10 border border-danger/30 rounded-xl px-4 py-2.5 text-danger text-xs font-medium">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full mt-6 py-3 bg-primary text-dark rounded-xl font-bold text-sm hover:bg-primary-hover transition-colors cursor-pointer"
          >
            Iniciar Sesión
          </button>

          <button
            type="button"
            onClick={() => setShowForgot(true)}
            className="w-full mt-3 text-primary text-xs font-medium hover:underline cursor-pointer bg-transparent border-none"
          >
            ¿Olvidaste tu contraseña?
          </button>
        </form>

        {/* Forgot password modal */}
        {showForgot && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowForgot(false)} />
            <div className="relative bg-surface border border-border rounded-2xl p-8 max-w-sm w-full">
              <h3 className="text-lg font-bold text-white mb-2">Recuperar contraseña</h3>
              <p className="text-muted text-sm mb-6">
                Contacta al administrador del sistema para restablecer tu contraseña.
                En la versión con Supabase, recibirás un email de recuperación automático.
              </p>
              <button
                onClick={() => setShowForgot(false)}
                className="w-full py-2.5 bg-primary text-dark rounded-xl font-semibold text-sm hover:bg-primary-hover transition-colors cursor-pointer"
              >
                Entendido
              </button>
            </div>
          </div>
        )}

        {/* Footer */}
        <p className="text-center text-muted/50 text-[11px] mt-6">
          © {new Date().getFullYear()} TermProtect · v2.0
        </p>
      </div>
    </div>
  );
}
