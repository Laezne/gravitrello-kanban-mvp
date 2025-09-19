import { useState } from "react";
import {
  Box,
  Button,
  Input,
  VStack,
  Heading,
  Field,
  createToaster,
  Link,
} from "@chakra-ui/react";
import { useParams, useNavigate } from "react-router";
import { fetchData } from "../../../helpers/axiosHelper";

const toaster = createToaster();

const ResetPassword = () => {
  // Obtener token de la URL y hook de navegación
  const { token } = useParams();
  const navigate = useNavigate();

  // Estados del formulario
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validar que las contraseñas coincidan
    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      toaster.create({
        title: "Error",
        description: "Las contraseñas no coinciden",
        type: "error",
      });
      return;
    }

    try {
      // Enviar nueva contraseña al servidor
      const res = await fetchData(
        `/users/reset-password/${token}`, // dinámico
        "POST",
        { password }
      );

      toaster.create({
        title: "Contraseña restablecida",
        description: res.data.message,
        type: "success",
      });

      navigate("/login");
    } catch (err) {
      // Manejar errores
      const message = err.response?.data?.message || "Algo salió mal";
      setError(message);
      toaster.create({
        title: "Error",
        description: message,
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
        Restablecer contraseña
      </Heading>

      <VStack as="form" spacing={4} onSubmit={handleSubmit}>
        <Field.Root invalid={!!error} required>
          <Field.Label>Nueva contraseña</Field.Label>
          <Input
            type="password"
            placeholder="********"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </Field.Root>

        <Field.Root invalid={!!error} required>
          <Field.Label>Confirmar contraseña</Field.Label>
          <Input
            type="password"
            placeholder="********"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          {error && <Field.ErrorText>{error}</Field.ErrorText>}
        </Field.Root>

        <Button type="submit" colorScheme="teal" width="full">
          Guardar nueva contraseña
        </Button>

        <Link
          onClick={() => navigate("/login")}
          color="teal.500"
          fontWeight="semibold"
          textAlign="center"
        >
          Volver al login
        </Link>
      </VStack>
    </Box>
  );
};

export default ResetPassword;