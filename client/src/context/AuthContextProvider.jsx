import { createContext, useState, useEffect } from "react";
import { fetchData } from "../helpers/axiosHelper";

export const AuthContext = createContext();

export const AuthContextProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      const { data } = await fetchData("/users/me", "GET");
      if (data.success) {
        setUser(data.user);
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  const register = async (userData) => {
    try {
      const { data } = await fetchData("/users/register", "POST", userData);
      if (data.success) {
        setUser(data.user);
        return { success: true, message: "Registro exitoso" };
      }
      return { success: false, message: data.message };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || "Error en el registro" };
    }
  }

  const login = async (credentials) => {
    try {
      const { data } = await fetchData("/users/login", "POST", credentials);
      if (data.success) {
        setUser(data.user);
        return { success: true, message: "Login exitoso" };
      }
      return { success: false, message: data.message };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || "Error en el login" };
    }
  }

  const logout = async () => {
    try {
      await fetchData("/users/logout", "POST"); // intento avisar al servidor

    } catch (error) {
      console.error("Error al hacer logout en servidor:", error);

    } finally {
      // siempre limpio, pase lo que pase
      setUser(null);
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, register, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
