import { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('dnd_token');
    if (token) {
      api.me().then(u => {
        setUser(u);
        setLoading(false);
      }).catch(() => {
        localStorage.removeItem('dnd_token');
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const { token, user } = await api.login(email, password);
    localStorage.setItem('dnd_token', token);
    setUser(user);
    return user;
  };

  const register = async (username, email, password, role) => {
    const { token, user } = await api.register(username, email, password, role);
    localStorage.setItem('dnd_token', token);
    setUser(user);
    return user;
  };

  const logout = () => {
    localStorage.removeItem('dnd_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
