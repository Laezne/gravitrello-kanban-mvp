import { useContext } from 'react';
import { Navigate, Outlet } from 'react-router';
import { AuthContext } from '../context/AuthContextProvider';

export const PublicRoutes = () => {
  const { user } = useContext(AuthContext);
  
  return user ? <Navigate to="/dashboard" replace /> : <Outlet />;
};