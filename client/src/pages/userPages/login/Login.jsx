import { useState, useContext } from "react";
import {
  Box,
  Button,
  Input,
  VStack,
  Heading,
  Field,
  createToaster,
  Link,
  Text,
} from "@chakra-ui/react";
import { AuthContext } from "../../../context/AuthContextProvider";
import { useNavigate } from "react-router";

const toaster = createToaster();

const Login = () => {
  const { login } = useContext(AuthContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const result = await login({ email, password });

      if (result.success) {
        toaster.create({
          title: "Login exitoso",
          description: "Bienvenido de nuevo",
          type: "success",
        });
        navigate("/dashboard"); // 🔑 redirigir al dashboard
      } else {
        setError(result.message);
        toaster.create({
          title: "Error en el login",
          description: result.message,
          type: "error",
        });
      }
    } catch (err) {
      setError("No se pudo iniciar sesión. Intenta de nuevo.");
      toaster.create({
        title: "Error",
        description: "No se pudo iniciar sesión. Intenta de nuevo.",
        type: "error",
      });
    }
  };

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
        Iniciar Sesión
      </Heading>

      <VStack as="form" spacing={4} onSubmit={handleSubmit}>
        <Field.Root required>
          <Field.Label>Email</Field.Label>
          <Input
            type="email"
            placeholder="tu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </Field.Root>

        <Field.Root required>
          <Field.Label>Contraseña</Field.Label>
          <Input
            type="password"
            placeholder="********"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </Field.Root>

        {error && (
          <Text color="red.500" fontSize="sm" textAlign="center">
            {error}
          </Text>
        )}

        <Button type="submit" colorScheme="teal" width="full">
          Aceptar
        </Button>

        <Link
          color="brand.pink"
          fontWeight="semibold"
          onClick={() => navigate("/forgot-password")}
        >
          ¿Olvidaste tu contraseña? Recupérala aquí.
        </Link>
      </VStack>
    </Box>
  );
};

export default Login;
