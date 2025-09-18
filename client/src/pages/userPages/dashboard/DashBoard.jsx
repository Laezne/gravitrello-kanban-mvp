import { useState, useContext } from "react";
import { AuthContext } from "../../../context/AuthContextProvider";
import { useBoards } from "../../../hooks/useBoards";
import { BoardCard } from "../../../components/boards/BoardCard";
import { BoardModal } from "../../../components/boards/BoardModal";
import { toaster } from "../../../components/ui/toaster";
import {
  Box,
  Heading,
  HStack,
  VStack,
  Button,
  SimpleGrid,
  Text,
  Spinner,
  Input,
  Alert,
  Badge,
} from "@chakra-ui/react";
import { HiPlus, HiSearch } from "react-icons/hi";

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const { 
    boards, 
    loading, 
    error, 
    createBoard, 
    deleteBoard, 
    updateBoard 
  } = useBoards();

  // Estados para modales
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedBoard, setSelectedBoard] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);

  // Estado para búsqueda
  const [searchTerm, setSearchTerm] = useState("");

  // Filtrar tableros según búsqueda
  const filteredOwnBoards = boards.ownBoards.filter(board =>
    board.board_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredSharedBoards = boards.sharedBoards.filter(board =>
    board.board_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handlers para crear tablero
  const handleCreateBoard = async (boardName) => {
    setModalLoading(true);
    try {
      const result = await createBoard(boardName);
      
      if (result.success) {
        toaster.create({
          title: "Tablero creado",
          description: `Se creó exitosamente "${boardName}"`,
          type: "success",
        });
        return result;
      } else {
        toaster.create({
          title: "Error al crear tablero",
          description: result.message,
          type: "error",
        });
        return result;
      }
    } finally {
      setModalLoading(false);
    }
  };

  // Handlers para editar tablero
  const handleEditBoard = (board) => {
    setSelectedBoard(board);
    setIsEditModalOpen(true);
  };

  const handleUpdateBoard = async (boardName, boardId) => {
    setModalLoading(true);
    try {
      const result = await updateBoard(boardId, boardName);
      
      if (result.success) {
        toaster.create({
          title: "Tablero actualizado",
          description: `Se actualizó a "${boardName}"`,
          type: "success",
        });
        return result;
      } else {
        toaster.create({
          title: "Error al actualizar tablero",
          description: result.message,
          type: "error",
        });
        return result;
      }
    } finally {
      setModalLoading(false);
    }
  };

  // Handler para eliminar tablero
  const handleDeleteBoard = async (board) => {
    if (window.confirm(`¿Estás seguro de eliminar "${board.board_name}"? Esta acción no se puede deshacer.`)) {
      const result = await deleteBoard(board.board_id);
      
      if (result.success) {
        toaster.create({
          title: "Tablero eliminado",
          description: result.message,
          type: "success",
        });
      } else {
        toaster.create({
          title: "Error al eliminar tablero",
          description: result.message,
          type: "error",
        });
      }
    }
  };

  if (loading) {
    return (
      <VStack color="brand.blue" spacing={4} pt={20} fontSize="xl">
        <Spinner color="brand.blue" boxSize="70px" />
        <Text fontWeight="medium">Cargando tableros...</Text>
      </VStack>
    );
  }

  return (
    <Box p={8} maxW="7xl" mx="auto">
      {/* Header */}
      <VStack align="start" spacing={6} mb={8}>
        <HStack justify="space-between" w="full">
          <VStack align="start" spacing={1}>
            <Heading as="h1" size="xl" color="gray.800">
              Mis Tableros
            </Heading>
            <Text color="gray.600">
              {user ? `Bienvenido, ${user.user_name}` : "Gestiona tus proyectos"}
            </Text>
          </VStack>

          <Button
            leftIcon={<HiPlus />}
            colorScheme="blue"
            onClick={() => setIsCreateModalOpen(true)}
          >
            Nuevo tablero
          </Button>
        </HStack>

        {/* Barra de búsqueda */}
        <HStack w="full" maxW="md">
          <Box position="relative" flex="1">
            <Input
              placeholder="Buscar tableros..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              pl={10}
            />
            <Box
              position="absolute"
              left={3}
              top="50%"
              transform="translateY(-50%)"
              color="gray.400"
            >
              <HiSearch />
            </Box>
          </Box>
        </HStack>
      </VStack>

      {/* Error */}
      {error && (
        <Alert.Root status="error" mb={6}>
          <Alert.Content>
            <Alert.Title>Error al cargar tableros</Alert.Title>
            <Alert.Description>{error}</Alert.Description>
          </Alert.Content>
        </Alert.Root>
      )}

      {/* Tableros propios */}
      {filteredOwnBoards.length > 0 && (
        <VStack align="start" spacing={4} mb={8}>
          <HStack>
            <Heading as="h2" size="lg" color="gray.700">
              Mis tableros
            </Heading>
            <Badge colorScheme="blue" variant="subtle">
              {filteredOwnBoards.length}
            </Badge>
          </HStack>
          
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3, xl: 4 }} gap={6} w="full">
            {filteredOwnBoards.map((board) => (
              <BoardCard
                key={board.board_id}
                board={board}
                onEdit={handleEditBoard}
                onDelete={handleDeleteBoard}
                isOwner={true}
              />
            ))}
          </SimpleGrid>
        </VStack>
      )}

      {/* Tableros compartidos */}
      {filteredSharedBoards.length > 0 && (
        <VStack align="start" spacing={4} mb={8}>
          <HStack>
            <Heading as="h2" size="lg" color="gray.700">
              Compartidos conmigo
            </Heading>
            <Badge colorScheme="green" variant="subtle">
              {filteredSharedBoards.length}
            </Badge>
          </HStack>
          
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3, xl: 4 }} spacing={6} w="full">
            {filteredSharedBoards.map((board) => (
              <BoardCard
                key={board.board_id}
                board={board}
                onEdit={handleEditBoard}
                onDelete={handleDeleteBoard}
                isOwner={false}
              />
            ))}
          </SimpleGrid>
        </VStack>
      )}

      {/* Estado vacío */}
      {!loading && boards.allBoards.length === 0 && (
        <VStack spacing={6} py={12} textAlign="center">
          <Text fontSize="xl" color="gray.500">
            No tienes tableros aún
          </Text>
          <Text color="gray.400">
            Crea tu primer tablero para empezar a organizar tus tareas
          </Text>
          <Button
            leftIcon={<HiPlus />}
            colorScheme="blue"
            size="lg"
            onClick={() => setIsCreateModalOpen(true)}
          >
            Crear mi primer tablero
          </Button>
        </VStack>
      )}

      {/* Sin resultados de búsqueda */}
      {!loading && searchTerm && 
       filteredOwnBoards.length === 0 && 
       filteredSharedBoards.length === 0 && 
       boards.allBoards.length > 0 && (
        <VStack spacing={4} py={12} textAlign="center">
          <Text fontSize="lg" color="gray.500">
            No se encontraron tableros
          </Text>
          <Text color="gray.400">
            Intenta con otros términos de búsqueda
          </Text>
        </VStack>
      )}

      {/* Modal para crear tablero */}
      <BoardModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateBoard}
        loading={modalLoading}
      />

      {/* Modal para editar tablero */}
      <BoardModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedBoard(null);
        }}
        onSubmit={handleUpdateBoard}
        board={selectedBoard}
        loading={modalLoading}
      />
    </Box>
  );
};

export default Dashboard;