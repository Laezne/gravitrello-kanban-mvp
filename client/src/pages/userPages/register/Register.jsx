// src/pages/userPages/register/Register.jsx
import {
  Field,
  Input,
  Button,
  VStack,
  Heading,
  Box,
} from "@chakra-ui/react";
import { useState, useContext } from "react";
import { AuthContext } from "../../../context/AuthContextProvider";

export default function Register() {
  const { registerUser } = useContext(AuthContext);
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      await registerUser({ email });
      // Aquí podrías redirigir o mostrar un toast de éxito
    } catch (err) {
      setError("No se pudo registrar. Intenta de nuevo.");
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
        Registro
      </Heading>

      <VStack as="form" spacing={4} onSubmit={handleSubmit}>
        <Field.Root invalid={!!error}>
          <Field.Label>Email</Field.Label>
          <Field.Input
            as={Input}
            type="email"
            placeholder="tu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Field.HelperText>
            Te enviaremos un enlace de verificación
          </Field.HelperText>
          {error && <Field.ErrorText>{error}</Field.ErrorText>}
        </Field.Root>

        <Button type="submit" colorScheme="teal" width="full">
          Registrarme
        </Button>
      </VStack>
    </Box>
  );
}
