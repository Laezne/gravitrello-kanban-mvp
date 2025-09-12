import { Box } from '@chakra-ui/react';
import { Outlet } from 'react-router';

export const PublicLayout = () => {
  return (
    <Box minH="100vh" bg="gray.50">
      <Box maxW="container.md" mx="auto" py={8}>
        <Outlet />
      </Box>
    </Box>
  );
};