import { lazy, Suspense, useContext } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router'
import { PublicLayout } from '../layouts/PublicLayout'
import { AuthContext } from '../context/AuthContextProvider'
import { PublicRoutes } from './PublicRoutes'
import { PrivateRoutes } from './PrivateRoutes'
import { UserLayout } from '../layouts/UserLayout'
import { Spinner, Flex } from "@chakra-ui/react";

// Importaciones "carga perezosa":
const Register = lazy(() => import('../pages/userPages/register/Register'));
const Login = lazy(() => import('../pages/userPages/login/Login'));
const Dashboard = lazy(() => import('../pages/userPages/dashboard/DashBoard'));



export const AppRoutes = () => {
  const { user, loading } = useContext(AuthContext)

  return (
    <>
      {loading ? (
        <Flex justify="center" align="center" h="100vh">
          <Spinner size="xl" />
        </Flex>
      ) : (
        <BrowserRouter>
          <Suspense
            fallback={
              <div>
                <h1>Cargando...</h1>
              </div>
            }
          >
            <Routes>
              {/* Rutas Públicas: */}
              <Route element={<PublicRoutes />}>
                <Route element={<PublicLayout />}>
                  <Route path="/" element={<Register />} />
                  <Route path="/login" element={<Login />} />
                </Route>
              </Route>

              {/* Rutas Privadas de Usuario: */}
              <Route element={<PrivateRoutes />}>
                <Route element={<UserLayout />}>
                  <Route path="/dashboard" element={<Dashboard />} />
                </Route>
              </Route>

            </Routes>
          </Suspense>
        </BrowserRouter>
      )}
    </>
  )
}
