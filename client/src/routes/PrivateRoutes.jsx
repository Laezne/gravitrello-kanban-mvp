import { useContext, useEffect } from "react";
import { Outlet, useNavigate } from "react-router";
import { AuthContext } from "../context/AuthContextProvider";

export const PrivateRoutes = () => {
  const navigate = useNavigate();
  const { user, isLoading } = useContext(AuthContext);

  // 🔒 Solo redirigir si ya terminó la comprobación y no hay user
  useEffect(() => {
    if (!isLoading && !user) {
      navigate("/login", { replace: true });
    }
  }, [isLoading, user, navigate]);

  // Mientras carga la sesión, no renderizamos nada (AppRoutes ya muestra spinner)
  if (isLoading) {
    return null;
  }

  // Si hay user, dejamos pasar a las rutas privadas
  return user ? <Outlet /> : null;
};
