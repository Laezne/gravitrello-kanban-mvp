import { createContext, useState, useEffect } from "react";
import { fetchData } from "../helpers/axiosHelper.js"; 

const AuthContext = createContext();

const AuthContextProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Verificar si hay sesión activa al cargar la app
  useEffect(() => {
    checkAuthStatus();
  }, []);

  // Verificar estado de autenticación
  const checkAuthStatus = async () => {
    try {
      const response = await fetchData("/users/me", "GET");
      
      if (response.data.success) {
        setUser(response.data.user);
      }
    } catch (error) {
      console.error("Error verificando autenticación:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // 🔑 PASO 1: Login inicial - envía credenciales y solicita código 2FA
  const login = async (credentials) => {
    try {
      const response = await fetchData("/users/login", "POST", credentials);
      const data = response.data;

      // Si es login exitoso SIN 2FA (por compatibilidad)
      if (data.success && !data.requiresTwoFactor) {
        setUser(data.user);
      }

      return data;
    } catch (error) {
      console.error("Error en login:", error);
      // Manejar respuesta de error de axios
      if (error.response?.data) {
        return error.response.data;
      }
      return { 
        success: false, 
        message: "Error de conexión" 
      };
    }
  };

  // 🔑 PASO 2: Verificar código 2FA
  const verifyTwoFactor = async ({ code }) => {
    try {
      const response = await fetchData("/users/login/verify", "POST", { code });
      const data = response.data;

      if (data.success) {
        setUser(data.user);
      }

      return data;
    } catch (error) {
      console.error("Error en verificación 2FA:", error);
      // Manejar respuesta de error de axios
      if (error.response?.data) {
        return error.response.data;
      }
      return { 
        success: false, 
        message: "Error de conexión" 
      };
    }
  };

  // 🔑 Reenviar código 2FA
  const resendTwoFactorCode = async () => {
    try {
      const response = await fetchData("/users/login/resend-code", "POST");
      return response.data;
    } catch (error) {
      console.error("Error reenviando código:", error);
      // Manejar respuesta de error de axios
      if (error.response?.data) {
        return error.response.data;
      }
      return { 
        success: false, 
        message: "Error de conexión" 
      };
    }
  };

  // Registro
  const register = async (userData) => {
    try {
      const response = await fetchData("/users/register", "POST", userData);
      const data = response.data;

      if (data.success) {
        setUser(data.user);
      }

      return data;
    } catch (error) {
      console.error("Error en registro:", error);
      // Manejar respuesta de error de axios
      if (error.response?.data) {
        return error.response.data;
      }
      return { 
        success: false, 
        message: "Error de conexión" 
      };
    }
  };

  // Logout
  const logout = async () => {
    try {
      const response = await fetchData("/users/logout", "POST");
      const data = response.data;
      
      if (data.success) {
        setUser(null);
      }

      return data;
    } catch (error) {
      console.error("Error en logout:", error);
      setUser(null); // Limpiar usuario local aunque falle la petición
      // Manejar respuesta de error de axios
      if (error.response?.data) {
        return error.response.data;
      }
      return { 
        success: false, 
        message: "Error de conexión" 
      };
    }
  };

  // Recuperar contraseña
  const forgotPassword = async ({ email }) => {
    try {
      const response = await fetchData("/users/forgot-password", "POST", { email });
      return response.data;
    } catch (error) {
      console.error("Error en forgot password:", error);
      // Manejar respuesta de error de axios
      if (error.response?.data) {
        return error.response.data;
      }
      return { 
        success: false, 
        message: "Error de conexión" 
      };
    }
  };

  // Resetear contraseña
  const resetPassword = async ({ token, password }) => {
    try {
      const response = await fetchData(`/users/reset-password/${token}`, "POST", { password });
      return response.data;
    } catch (error) {
      console.error("Error en reset password:", error);
      // Manejar respuesta de error de axios
      if (error.response?.data) {
        return error.response.data;
      }
      return { 
        success: false, 
        message: "Error de conexión" 
      };
    }
  };

  // Valor del contexto
  const contextValue = {
    user,
    isLoading,
    login,
    verifyTwoFactor,        // 🔑 Nueva función
    resendTwoFactorCode,    // 🔑 Nueva función
    register,
    logout,
    forgotPassword,
    resetPassword,
    checkAuthStatus,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext, AuthContextProvider };