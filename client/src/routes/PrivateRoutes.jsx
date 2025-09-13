import { useContext } from "react";
import { Navigate, Outlet } from "react-router";
import { AuthContext } from "../context/AuthContextProvider";

export const PrivateRoutes = () => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    // Aquí podrías mostrar un spinner global mientras verificas la sesión
    return <div>Cargando...</div>;
  }

  // Si hay usuario, muestra las rutas privadas
  return user ? <Outlet /> : <Navigate to="/login" replace />;
};
