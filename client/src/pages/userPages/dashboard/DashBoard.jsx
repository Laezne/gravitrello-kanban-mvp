import {
  Box,
  Heading,
  VStack,
  Text,
  HStack,
  Avatar,
  Card,
  CardBody,
} from '@chakra-ui/react';
import { useContext } from 'react';
import { AuthContext } from '../../../context/AuthContextProvider';

const Dashboard = () => {
  const { user } = useContext(AuthContext);

  return (
    <VStack spacing={6} align="stretch">
      <Card>
        <CardBody>
          <HStack spacing={4}>
            <Avatar name={user?.username} size="lg" />
            <VStack align="start" spacing={1}>
              <Heading size="lg">¡Bienvenido, {user?.username}!</Heading>
              <Text color="gray.600">{user?.email}</Text>
              <Text fontSize="sm" color="gray.500">
                ID: {user?.id}
              </Text>
            </VStack>
          </HStack>
        </CardBody>
      </Card>

      <Card>
        <CardBody>
          <Heading size="md" mb={4}>
            Dashboard
          </Heading>
          <Text>
            Has iniciado sesión exitosamente. Aquí puedes agregar el contenido
            principal de tu aplicación.
          </Text>
        </CardBody>
      </Card>
    </VStack>
  );
};

export default Dashboard;