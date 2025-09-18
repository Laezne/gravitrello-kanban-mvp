import { useState, useContext } from "react";
import { useNavigate } from "react-router";
import {
  Box,
  Button,
  Input,
  VStack,
  Heading,
  Field,
  Text,
  Image,
} from "@chakra-ui/react";
import { AuthContext } from "../../../context/AuthContextProvider";
import { toaster } from "../../../components/ui/toaster";

const Register = () => {
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const [user_name, setUserName] = useState("");
  const [lastname, setLastname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [avatar, setAvatar] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [error, setError] = useState("");

  // Manejar selección de archivo avatar
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    
    if (file) {
      // Validar tipo de archivo
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        toaster.create({
          title: "Tipo de archivo inválido",
          description: "Solo se permiten archivos JPG, PNG, GIF o WEBP",
          type: "error",
        });
        return;
      }

      // Validar tamaño (2MB)
      if (file.size > 2 * 1024 * 1024) {
        toaster.create({
          title: "Archivo muy grande",
          description: "El avatar debe ser menor a 2MB",
          type: "error",
        });
        return;
      }

      setAvatar(file);
      
      // Crear preview
      const reader = new FileReader();
      reader.onload = (e) => setAvatarPreview(e.target.result);
      reader.readAsDataURL(file);
    } else {
      setAvatar(null);
      setAvatarPreview(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      // Crear FormData para enviar archivo
      const formData = new FormData();
      formData.append('user_name', user_name);
      formData.append('lastname', lastname || '');
      formData.append('email', email);
      formData.append('password', password);
      
      // Solo añadir avatar si se seleccionó uno
      if (avatar) {
        formData.append('avatar', avatar);
      }

      const result = await register(formData);

      if (result.success) {
        toaster.create({
          title: "Registro exitoso",
          description: `¡Bienvenido, ${user_name}!`,
          type: "success",
        });
        navigate('/user/dashboard');
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
        {/* Avatar opcional */}
        <Field.Root>
          <Field.Label>Foto de perfil (opcional)</Field.Label>
          <Input
            type="file"
            accept="image/*"
            onChange={handleAvatarChange}
            p={1}
          />
          <Field.HelperText>
            Archivos JPG, PNG, GIF o WEBP. Máximo 2MB.
          </Field.HelperText>
        </Field.Root>

        {/* Preview del avatar */}
        {avatarPreview && (
          <Box textAlign="center">
            <Text fontSize="sm" mb={2} color="gray.600">Vista previa:</Text>
            <Image
              src={avatarPreview}
              alt="Preview del avatar"
              boxSize="80px"
              borderRadius="full"
              objectFit="cover"
              border="2px solid"
              borderColor="teal.200"
            />
          </Box>
        )}

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