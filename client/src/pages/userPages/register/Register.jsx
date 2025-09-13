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

const Register = () => {
  const { register } = useContext(AuthContext);

  const [user_name, setUserName] = useState("");
  const [lastname, setLastname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const result = await register({
        user_name,
        lastname: lastname || null,
        email,
        password,
      });

      if (result.success) {
        toaster.create({
          title: "Registro exitoso",
          description: "Ya puedes iniciar sesión",
          type: "success",
        });
      } else {
        setError(result.message);
        toaster.create({
          title: "Error en el registro",
          description: result.message,
          type: "error",
        });
      }
    } catch (err) {
      setError("No se pudo registrar. Intenta de nuevo.");
      toaster.create({
        title: "Error",
        description: "No se pudo registrar. Intenta de nuevo.",
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
        Registro
      </Heading>

      <VStack as="form" spacing={4} onSubmit={handleSubmit}>
        <Field.Root required>
          <Field.Label>Nombre de usuario</Field.Label>
          <Input
            type="text"
            placeholder="Tu nombre de usuario"
            value={user_name}
            onChange={(e) => setUserName(e.target.value)}
          />
        </Field.Root>

        <Field.Root>
          <Field.Label>Apellido (opcional)</Field.Label>
          <Input
            type="text"
            placeholder="Tu apellido"
            value={lastname}
            onChange={(e) => setLastname(e.target.value)}
          />
        </Field.Root>

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
          Registrarme
        </Button>
      </VStack>
    </Box>
  );
};

export default Register;
