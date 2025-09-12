import { createContext, useState, useEffect } from 'react';
import { fetchData } from '../helpers/axiosHelper';

export const AuthContext = createContext();

export const AuthContextProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Verifico si hay sesión activa al cargar
  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      const response = await fetchData('/api/users/me');
      if (response.success) {
        setUser(response.user);
      }
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      const response = await fetchData('/api/users/register', 'POST', userData);
      if (response.success) {
        setUser(response.user);
        return { success: true };
      }
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Error en el registro',
      };
    }
  };

  const login = async (credentials) => {
    try {
      const response = await fetchData('/api/users/login', 'POST', credentials);
      if (response.success) {
        setUser(response.user);
        return { success: true };
      }
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Error en el login',
      };
    }
  };

  const logout = async () => {
    try {
      await fetchData('/api/users/logout', 'POST');
      setUser(null);
    } catch (error) {
      console.error('Error en logout:', error);
      setUser(null);
    }
  };

  const value = {
    user,
    loading,
    register,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};