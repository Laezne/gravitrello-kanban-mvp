import { AuthContextProvider } from "./context/AuthContextProvider.jsx"
import { AppRoutes } from "./routes/AppRoutes.jsx"
import { Toaster } from "./components/ui/toaster"

function App() {
  return (
    <AuthContextProvider>
      <AppRoutes />
      <Toaster />
    </AuthContextProvider>
  )
}

export default App;