import { createContext, useContext, useState, useEffect } from "react";
import { USERS } from "../lib/constants";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for saved session
    const saved = localStorage.getItem("mediciones-user");
    if (saved) {
      try {
        setUser(JSON.parse(saved));
      } catch {}
    }
    setLoading(false);
  }, []);

  const login = (username, password) => {
    const u = username.trim().toLowerCase();
    const p = password.trim();
    const found = USERS.find((usr) => usr.username === u && usr.password === p);
    if (found) {
      const userData = { id: found.id, name: found.name, role: found.role, city: found.city, username: found.username };
      setUser(userData);
      localStorage.setItem("mediciones-user", JSON.stringify(userData));
      return { success: true };
    }
    return { success: false, error: "Usuario o contraseña incorrectos" };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("mediciones-user");
  };

  const changePassword = (currentPwd, newPwd) => {
    // In production this will use Supabase Auth
    const found = USERS.find((u) => u.id === user.id);
    if (!found || found.password !== currentPwd) {
      return { success: false, error: "La contraseña actual no es correcta" };
    }
    // For mock: update in memory (won't persist page reload since USERS is const)
    found.password = newPwd;
    return { success: true };
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, changePassword, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
