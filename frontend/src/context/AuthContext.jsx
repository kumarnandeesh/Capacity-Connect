import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { api } from "../api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("cc_token") || null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadMe = useCallback(async (t) => {
    try {
      const me = await api.get("/me", t);
      setUser(me);
    } catch (e) {
      setToken(null);
      setUser(null);
      localStorage.removeItem("cc_token");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (token) loadMe(token);
    else setLoading(false);
  }, [token, loadMe]);

  const login = async (email, password) => {
    const res = await api.post("/auth/login", { email, password });
    localStorage.setItem("cc_token", res.token);
    setToken(res.token);
    setUser(res.user);
    return res.user;
  };

  const signup = async (payload) => {
    return api.post("/auth/signup", payload);
  };

  const logout = () => {
    localStorage.removeItem("cc_token");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ token, user, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
