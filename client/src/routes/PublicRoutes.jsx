import { useContext } from 'react';
import { Navigate, Outlet } from 'react-router';
import { AuthContext } from '../context/AuthContextProvider';

export const PublicRoutes = () => {
  const { user } = useContext(AuthContext);

  // Si hay usuario -> redirige al dashboard, si no -> muestra rutas públicas
  return user ? <Navigate to="/user/dashboard" replace /> : <Outlet />;
};
