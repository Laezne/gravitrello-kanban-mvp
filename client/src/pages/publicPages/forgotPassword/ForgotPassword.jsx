import { useState } from "react"
import {
  Box,
  Button,
  Input,
  VStack,
  Heading,
  Field,
  Link,
} from "@chakra-ui/react"
import { useNavigate } from "react-router"
import { fetchData } from "../../../helpers/axiosHelper"
// 🔥 CAMBIO: Importar desde el snippet del CLI
import { toaster } from "../../../components/ui/toaster"

const ForgotPassword = () => {
  const [email, setEmail] = useState("")
  const [error, setError] = useState("")
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")

    console.log('Iniciando proceso de recuperación...')

    try {
      // Toast de loading
      const loadingId = toaster.create({
        title: "Enviando...",
        description: "Procesando tu solicitud",
        type: "loading",
      })

      const res = await fetchData("/users/forgot-password", "POST", { email })
      
      // Cerrar toast de loading
      toaster.dismiss(loadingId)

      // Toast de éxito
      toaster.create({
        title: "¡Correo enviado!",
        description: res.data.message || "Revisa tu bandeja de entrada para restablecer tu contraseña",
        type: "success",
        duration: 6000,
        closable: true,
      })

      setEmail("")
      console.log('Correo enviado exitosamente')
      
    } catch (err) {
      const message = err.response?.data?.message || "Algo salió mal"
      setError(message)
      console.error('Error:', message)

      // Toast de error
      toaster.create({
        title: "Error al enviar",
        description: message,
        type: "error",
        duration: 6000,
        closable: true,
      })
    }
  }

  return (
    <Box
      maxW="md"
      mx="auto"
      mt={10}
      p={6}
      borderWidth={1}
      borderRadius="lg"
      boxShadow="md"
    >
      <Heading mb={6} textAlign="center">
        Recupera tu contraseña
      </Heading>

      <VStack as="form" spacing={4} onSubmit={handleSubmit}>
        <Field.Root invalid={!!error} required>
          <Field.Label>Email</Field.Label>
          <Input
            type="email"
            placeholder="tu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          {error && <Field.ErrorText>{error}</Field.ErrorText>}
        </Field.Root>

        <Button type="submit" colorScheme="teal" width="full">
          Enviar enlace de recuperación
        </Button>

        <Link
          onClick={() => navigate("/login")}
          color="brand.pink"
          fontWeight="semibold"
          textAlign="center"
        >
          Volver al login
        </Link>
      </VStack>
    </Box>
  )
}

export default ForgotPassword;