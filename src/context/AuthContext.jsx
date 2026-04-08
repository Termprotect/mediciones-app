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

  const login = async (username, password) => {
    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("id")
      .eq("username", username.trim().toLowerCase())
      .single();

    if (profileError || !profileData) {
      return { success: false, error: "Usuario o contraseña incorrectos" };
    }

    const { data: userData, error: authError } = await supabase
      .from("auth.users")
      .select("email")
      .eq("id", profileData.id)
      .single();

    const { data: authData, error: signInError } = await supabase.auth.signInWithPassword({
      email: username.includes("@") ? username : `${username}@termprotect.es`,
      password: password.trim(),
    });

    if (signInError) {
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