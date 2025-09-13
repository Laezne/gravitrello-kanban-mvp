// src/pages/userPages/dashboard/Dashboard.jsx
import { useContext } from "react";
import { AuthContext } from "../../../context/AuthContextProvider";
import { Box, Heading, Text, Button, HStack  } from "@chakra-ui/react";
import { useNavigate } from "react-router";

const Dashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  return (
    <Box p={8}>
      <HStack justify="space-between" mb={6}>
        <Heading as="h1" size="xl">
          Dashboard
        </Heading>
        <Button variant="brandPink" onClick={handleLogout}>
          Cerrar sesión
        </Button>
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
