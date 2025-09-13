import { useState, useContext } from "react";
import {
  Box,
  Button,
  Input,
  VStack,
  Heading,
  Field,
  createToaster,
} from "@chakra-ui/react";
import { AuthContext } from "../../../context/AuthContextProvider";

const toaster = createToaster();

const Login = () => {
  const { login } = useContext(AuthContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

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

        <Field.Root invalid={!!error} required>
          <Field.Label>Contraseña</Field.Label>
          <Input
            type="password"
            placeholder="********"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </Field.Root>

        <Button type="submit" colorScheme="teal" width="full">
          Ingresar
        </Button>
      </VStack>
    </Box>
  );
};

export default Login;
