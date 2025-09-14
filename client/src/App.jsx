import { AuthContextProvider } from "./context/AuthContextProvider.jsx"
import { AppRoutes } from "./routes/AppRoutes.jsx"
// 🔥 CAMBIO: Importar desde el snippet creado por el CLI
import { Toaster } from "./components/ui/toaster"

function App() {
  return (
    <AuthContextProvider>
      <AppRoutes />
      {/* 🔥 CAMBIO: Usar el Toaster del snippet oficial */}
      <Toaster />
    </AuthContextProvider>
  )
}

export default App;