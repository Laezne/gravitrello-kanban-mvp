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
  const { login, verifyTwoFactor, resendTwoFactorCode } = useContext(AuthContext);
  const [step, setStep] = useState(1); // 1: credenciales, 2: código 2FA
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [maskedEmail, setMaskedEmail] = useState("");

  const navigate = useNavigate();

  // 🔑 PASO 1: Enviar credenciales
  const handleStep1Submit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const result = await login({ email, password });

      if (result.success && result.requiresTwoFactor) {
        // Paso 1 exitoso - mostrar formulario de código
        setStep(2);
        setMaskedEmail(result.email);
        toaster.create({
          title: "Código enviado",
          description: `Se ha enviado un código de verificación a ${result.email}`,
          type: "info",
        });
      } else if (result.success) {
        // Login directo exitoso (por si no hay 2FA activo)
        toaster.create({
          title: "Login exitoso",
          description: "Bienvenido de nuevo",
          type: "success",
        });
        navigate("/user/dashboard");
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
    } finally {
      setIsLoading(false);
    }
  };

  // 🔑 PASO 2: Verificar código 2FA
  const handleStep2Submit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const result = await verifyTwoFactor({ code: verificationCode });

      if (result.success) {
        toaster.create({
          title: "Verificación exitosa",
          description: "Bienvenido de nuevo",
          type: "success",
        });
        navigate("/user/dashboard");
      } else {
        setError(result.message);
        toaster.create({
          title: "Código inválido",
          description: result.message,
          type: "error",
        });
      }
    } catch (err) {
      setError("Error al verificar el código. Intenta de nuevo.");
      toaster.create({
        title: "Error",
        description: "Error al verificar el código. Intenta de nuevo.",
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 🔑 Reenviar código
  const handleResendCode = async () => {
    setIsResending(true);
    setError("");

    try {
      const result = await resendTwoFactorCode();

      if (result.success) {
        toaster.create({
          title: "Código reenviado",
          description: "Se ha enviado un nuevo código a tu email",
          type: "success",
        });
      } else {
        toaster.create({
          title: "Error",
          description: result.message,
          type: "error",
        });
      }
    } catch (err) {
      toaster.create({
        title: "Error",
        description: "No se pudo reenviar el código",
        type: "error",
      });
    } finally {
      setIsResending(false);
    }
  };

  // 🔑 Volver al paso 1
  const handleBackToStep1 = () => {
    setStep(1);
    setVerificationCode("");
    setError("");
    setMaskedEmail("");
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
        {step === 1 ? "Iniciar Sesión" : "Verificación de Seguridad"}
      </Heading>

      {step === 1 ? (
        // 🔑 PASO 1: Formulario de credenciales
        <VStack as="form" spacing={4} onSubmit={handleStep1Submit}>
          <Field.Root required>
            <Field.Label>Email</Field.Label>
            <Input
              type="email"
              placeholder="tu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
            />
          </Field.Root>

          <Field.Root required>
            <Field.Label>Contraseña</Field.Label>
            <Input
              type="password"
              placeholder="********"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
            />
          </Field.Root>

          {error && (
            <Text color="red.500" fontSize="sm" textAlign="center">
              {error}
            </Text>
          )}

          <Button 
            type="submit" 
            colorScheme="teal" 
            width="full"
            disabled={isLoading}
          >
            {isLoading ? "Enviando..." : "Continuar"}
          </Button>

          <Link
            color="brand.pink"
            fontWeight="semibold"
            onClick={() => navigate("/forgot-password")}
          >
            ¿Olvidaste tu contraseña? Recupérala aquí.
          </Link>
        </VStack>
      ) : (
        // 🔑 PASO 2: Formulario de código 2FA
        <VStack spacing={6}>
          <Text textAlign="center" color="gray.600">
            Hemos enviado un código de 6 dígitos a:
          </Text>
          <Text fontWeight="bold" color="teal.600">
            {maskedEmail}
          </Text>

          <VStack as="form" spacing={4} onSubmit={handleStep2Submit} width="full">
            <Field.Root required>
              <Field.Label>Código de verificación</Field.Label>
              <Input
                type="text"
                placeholder="123456"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                disabled={isLoading}
                maxLength={6}
                textAlign="center"
                fontSize="xl"
                letterSpacing="0.3em"
              />
              <Field.HelperText textAlign="center">
                Ingresa el código de 6 dígitos que recibiste por email
              </Field.HelperText>
            </Field.Root>

            {error && (
              <Text color="red.500" fontSize="sm" textAlign="center">
                {error}
              </Text>
            )}

            <Button 
              type="submit" 
              colorScheme="teal" 
              width="full"
              disabled={isLoading || verificationCode.length !== 6}
            >
              {isLoading ? "Verificando..." : "Verificar"}
            </Button>
          </VStack>

          {/* Opciones adicionales */}
          <VStack spacing={3} width="full">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleResendCode}
              disabled={isResending}
              colorScheme="blue"
            >
              {isResending ? "Reenviando..." : "Reenviar código"}
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBackToStep1}
              disabled={isLoading}
            >
              ← Volver
            </Button>
          </VStack>
        </VStack>
      )}
    </Box>
  );
};

export default Login;