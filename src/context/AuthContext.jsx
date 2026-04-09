import { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { USERS } from "../lib/constants";

const AuthContext = createContext(null);

/**
 * Detect the type of login identifier:
 * - "email"   → contains @
 * - "dni"     → 8 digits + 1 letter (Spanish national ID)
 * - "tie"     → 1 letter + 7 digits + 1 letter (foreigner ID card)
 * - "unknown" → fallback, treat as username
 */
const detectIdentifierType = (input) => {
  if (input.includes("@")) return "email";
  // DNI: 8 dígitos + 1 letra (ej: 12345678A)
  if (/^\d{8}[A-Za-z]$/.test(input)) return "dni";
  // TIE: 1 letra + 7 dígitos + 1 letra (ej: X1234567A)
  if (/^[A-Za-z]\d{7}[A-Za-z]$/.test(input)) return "tie";
  return "unknown";
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check existing session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
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

  // Map a username to the legacy USERS constant ID (e.g. "med_jesus")
  // This bridges Supabase Auth (UUID) with the hardcoded USERS used throughout the app
  // TODO: Remove once all routes use Supabase profile IDs instead of legacy IDs
  const getLegacyId = (username) => {
    const match = USERS.find(
      (u) => u.username === username || u.username === username?.split("@")[0]
    );
    return match ? match.id : null;
  };

  const fetchProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (data && !error) {
        const legacyId = getLegacyId(data.username);
        setUser({
          id: legacyId || data.id,    // Prefer legacy ID for route matching
          supabaseId: data.id,         // Keep UUID for auth operations
          name: data.name,
          role: data.role,
          city: data.city,
          username: data.username,
          email: data.email || null,
          dni: data.dni || null,
          tie: data.tie || null,
        });
      } else {
        // Profile doesn't exist yet — create a minimal fallback from auth metadata
        const { data: { user: authUser } } = await supabase.auth.getUser();
        if (authUser) {
          const meta = authUser.user_metadata || {};
          const uname = meta.username || authUser.email?.split("@")[0] || "";
          const legacyId = getLegacyId(uname);
          setUser({
            id: legacyId || authUser.id,
            supabaseId: authUser.id,
            name: meta.name || authUser.email?.split("@")[0] || "Usuario",
            role: meta.role || "medidor",
            city: meta.city || null,
            username: uname,
            email: authUser.email || null,
            dni: null,
            tie: null,
          });
        }
      }
    } catch (err) {
      console.error("Error fetching profile:", err);
    }
    setLoading(false);
  };

  /**
   * Login flow:
   * 1. User enters identifier (email, DNI, TIE, or username) + password
   * 2. If identifier is email → authenticate directly with Supabase Auth
   * 3. If identifier is DNI/TIE → look up email via RPC function → then authenticate
   * 4. If identifier is unknown format → try as username by looking up email in profiles
   */
  const login = async (identifier, password) => {
    const input = identifier.trim().toUpperCase();
    const pwd = password.trim();

    if (!input || !pwd) {
      return { success: false, error: "Introduce tu identificador y contraseña" };
    }

    const idType = detectIdentifierType(input);
    let email = null;

    if (idType === "email") {
      // Direct email login
      email = identifier.trim().toLowerCase();
    } else if (idType === "dni" || idType === "tie") {
      // Look up email by DNI/TIE using the secure RPC function
      try {
        const { data: foundEmail, error: rpcError } = await supabase
          .rpc("get_email_by_document", { doc_value: input });

        if (rpcError || !foundEmail) {
          return {
            success: false,
            error: `No se encontró un usuario con ese ${idType === "dni" ? "DNI" : "TIE"}. Contacta al administrador.`,
          };
        }
        email = foundEmail;
      } catch (err) {
        console.error("RPC lookup error:", err);
        return { success: false, error: "Error al buscar el documento. Intenta de nuevo." };
      }
    } else {
      // Unknown format — try as username: look up email via secure RPC function
      try {
        const { data: foundEmail, error: rpcError } = await supabase
          .rpc("get_email_by_username", { username_value: input.toLowerCase() });

        if (rpcError || !foundEmail) {
          return {
            success: false,
            error: "Usuario no encontrado. Usa tu email, DNI o TIE para iniciar sesión.",
          };
        }
        email = foundEmail;
      } catch (err) {
        console.error("Username lookup error:", err);
        return { success: false, error: "Error al buscar el usuario. Intenta de nuevo." };
      }
    }

    // Authenticate with Supabase Auth using the resolved email
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password: pwd,
    });

    if (error) {
      return { success: false, error: "Credenciales incorrectas. Verifica tu contraseña." };
    }

    // Auth succeeded — profile will be loaded by onAuthStateChange listener
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
