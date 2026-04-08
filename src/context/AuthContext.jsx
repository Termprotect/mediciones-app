import { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();
    if (data && !error) {
      setUser({ id: data.id, name: data.name, role: data.role, city: data.city, username: data.username });
    }
    setLoading(false);
  };

  const login = async (usernameOrEmail, password) => {
    const input = usernameOrEmail.trim().toLowerCase();
    
    // Determinar el email a usar
    let email = input;
    if (!input.includes("@")) {
      // Es un username — buscar el email en auth.users via profiles
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("id, username")
        .eq("username", input)
        .single();

      if (profileError || !profile) {
        return { success: false, error: "Usuario o contraseña incorrectos" };
      }
      // Construir email desde el username (como lo creamos en SQL)
      // Los usuarios fueron creados con su email real, necesitamos buscarlo
      // Intentamos con los emails conocidos del sistema
      email = input.includes("@") ? input : `${input}@termprotect.es`;
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password: password.trim(),
    });

    if (error) {
      return { success: false, error: "Usuario o contraseña incorrectos" };
    }

    return { success: true };
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const changePassword = async (currentPwd, newPwd) => {
    const { error } = await supabase.auth.updateUser({ password: newPwd });
    if (error) return { success: false, error: error.message };
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