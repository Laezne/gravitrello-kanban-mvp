import { useContext } from "react";
import { Outlet } from "react-router";
import { AuthContext } from "../context/AuthContextProvider";
import { Spinner, Text, VStack } from "@chakra-ui/react";

export const PublicRoutes = () => {
  const { loading } = useContext(AuthContext);

  if (loading) {
    return (
      <VStack color="brand.blue" spacing={4} pt={20} fontSize="xl">
        <Spinner color="brand.blue" boxSize="70px" />
        <Text fontWeight="medium">Cargando...</Text>
      </VStack>
    )
  }

  return (
    <>
      <Outlet />
    </>
  );
};
