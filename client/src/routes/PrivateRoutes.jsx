import { useContext, useEffect } from "react";
import { Outlet, useNavigate } from "react-router";
import { AuthContext } from "../context/AuthContextProvider";

export const PrivateRoutes = () => {
  const navigate = useNavigate();
  const { user, loading } = useContext(AuthContext);

  useEffect(() => {
    if (!loading && !user) {
      // Si ya cargó y no hay usuario, redirige
      navigate("/login", { replace: true });
    }
  }, [loading, user, navigate]);

  if (loading) {
    return <div>Cargando...</div>; // aquí puedes poner un Spinner
  }

  return (
    <>
      {user && <Outlet />}
    </>
  );
};
