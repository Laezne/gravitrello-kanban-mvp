import { useContext } from 'react';
import { Navigate, Outlet } from 'react-router';
import { AuthContext } from '../context/AuthContextProvider';

export const PrivateRoutes = () => {
  const { user } = useContext(AuthContext);
  
  return user ? <Outlet /> : <Navigate to="/login" replace />;
};