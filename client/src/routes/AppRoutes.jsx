import { lazy, Suspense, useContext } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router'
import { PublicLayout } from '../layouts/PublicLayout'
import { AuthContext } from '../context/AuthContextProvider'
import { PublicRoutes } from './PublicRoutes'
import { PrivateRoutes } from './PrivateRoutes'
import { UserLayout } from '../layouts/UserLayout'
import { Spinner, VStack, Text } from "@chakra-ui/react";

// Importaciones "carga perezosa":
const Home = lazy(()=>import('../pages/publicPages/home/Home'));
const Register = lazy(() => import('../pages/userPages/register/Register'));
const Login = lazy(() => import('../pages/userPages/login/Login'));
const ForgotPassword = lazy(()=>import('../pages/publicPages/forgotPassword/ForgotPassword'));
const ResetPassword = lazy(()=>import('../pages/publicPages/resetPassword/ResetPassword'));
const Dashboard = lazy(() => import('../pages/userPages/dashboard/DashBoard'));
const BoardView = lazy(() => import('../pages/userPages/board/BoardView'));


export const AppRoutes = () => {
  const { user, loading } = useContext(AuthContext)

  return (
    <>
      {loading ? (
        <VStack color="brand.blue" spacing={4} pt={20} fontSize="xl">
          <Spinner color="brand.blue" boxSize="70px" />
          <Text fontWeight="medium">Cargando...</Text>
        </VStack>
      ) : (
        <BrowserRouter>
          <Suspense
            fallback={
              <VStack color="brand.blue" spacing={4} pt={20} fontSize="xl">
                <Spinner color="brand.blue" boxSize="70px" />
                <Text fontWeight="medium">Cargando...</Text>
              </VStack>
            }
          >
            <Routes>
              {/* Rutas Públicas: */}
              <Route element={<PublicRoutes />}>
                <Route element={<PublicLayout />}>
                  <Route path="/" element={<Home />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  <Route path="/reset-password/:token" element={<ResetPassword />} />
                </Route>
              </Route>

              {/* Rutas Privadas de Usuario: */}
              <Route element={<PrivateRoutes />}>
                <Route element={<UserLayout />}>
                  <Route path="/user/dashboard" element={<Dashboard />} />
                  <Route path="/user/board/:boardId" element={<BoardView />} /> 
                </Route>
              </Route>

            </Routes>
          </Suspense>
        </BrowserRouter>
      )}
    </>
  )
}
