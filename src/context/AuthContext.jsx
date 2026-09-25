import { createContext, useContext, useState, useEffect, useRef } from "react";
import { api } from "../services/api";
import { supabase, configurationError } from "../services/supabase";
const AuthContext = createContext(null);
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(configurationError || "");
  const revision = useRef(0);
  useEffect(() => {
    localStorage.removeItem("dnd_token");
    if (!supabase) {
      setLoading(false);
      return;
    }
    let active = true;
    // Defer API work outside the Supabase auth callback to avoid session-lock deadlocks.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      const current = ++revision.current;
      if (!session) {
        setUser(null);
        setLoading(false);
        return;
      }
      setTimeout(async () => {
        if (!active || current !== revision.current) return;
        try {
          const profile = await api.me();
          if (active && current === revision.current) {
            setUser(profile);
            setError("");
          }
        } catch (e) {
          if (active && current === revision.current) {
            setUser(null);
            setError(e.message);
          }
        } finally {
          if (active && current === revision.current) setLoading(false);
        }
      }, 0);
    });
    return () => {
      active = false;
      revision.current++;
      subscription.unsubscribe();
    };
  }, []);
  const login = async (email, password) => {
    if (!supabase) throw new Error(configurationError);
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    if (error) throw error;
  };
  const register = async (username, email, password) => {
    if (!supabase) throw new Error(configurationError);
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: { data: { username }, emailRedirectTo: window.location.origin },
    });
    if (error) throw error;
    return { needsConfirmation: !data.session };
  };
  const logout = async () => {
    if (!supabase) return;
    const { error } = await supabase.auth.signOut();
    if (error) setError(error.message);
  };
  return (
    <AuthContext.Provider
      value={{ user, loading, error, login, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}
export const useAuth = () => useContext(AuthContext);
