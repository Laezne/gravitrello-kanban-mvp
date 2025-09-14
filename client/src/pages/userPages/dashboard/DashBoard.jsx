import { useContext } from "react";
import { AuthContext } from "../../../context/AuthContextProvider";
import { Box, Heading, Text, HStack  } from "@chakra-ui/react";

const Dashboard = () => {
  const { user } = useContext(AuthContext);

  return (
    <Box p={8}>
      <HStack justify="space-between" mb={6}>
        <Heading as="h1" size="xl">
          Dashboard
        </Heading>
      </HStack>

      {user ? (
        <Text fontSize="lg">Bienvenido, {user.user_name} 👋</Text>
      ) : (
        <Text fontSize="lg">Cargando usuario...</Text>
      )}
    </Box>
  );
};

export default Dashboard;
