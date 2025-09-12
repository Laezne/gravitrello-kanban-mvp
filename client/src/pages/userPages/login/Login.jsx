import { useState, useContext } from 'react';
import { Link } from 'react-router';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  Heading,
  Alert,
  AlertIcon,
  Text,
  Link as ChakraLink,
} from '@chakra-ui/react';
import { AuthContext } from '../../../context/AuthContextProvider';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await login(formData);
    
    if (!result.success) {
      setError(result.message);
    }
    
    setLoading(false);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <Box maxW="md" mx="auto" p={6} bg="white" borderRadius="lg" shadow="md">
      <VStack spacing={6}>
        <Heading size="lg">Iniciar Sesión</Heading>
        
        {error && (
          <Alert status="error">
            <AlertIcon />
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit} style={{ width: '100%' }}>
          <VStack spacing={4}>
            <FormControl isRequired>
              <FormLabel>Email</FormLabel>
              <Input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Contraseña</FormLabel>
              <Input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
              />
            </FormControl>

            <Button
              type="submit"
              colorScheme="blue"
              width="full"
              isLoading={loading}
            >
              Iniciar Sesión
            </Button>
          </VStack>
        </form>

        <Text>
          ¿No tienes cuenta?{' '}
          <ChakraLink as={Link} to="/" color="blue.500">
            Regístrate aquí
          </ChakraLink>
        </Text>
      </VStack>
    </Box>
  );
};

export default Login;