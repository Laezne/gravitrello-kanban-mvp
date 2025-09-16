import { useState, useContext, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { DragDropContext } from "@hello-pangea/dnd";
import { AuthContext } from "../../../context/AuthContextProvider";
import { useOneBoard } from "../../../hooks/useOneBoard";
import { BoardColumn } from "../../../components/boards/BoardColumn";
import { TaskModal } from "../../../components/boards/TaskModal";
import { ShareBoardModal } from "../../../components/boards/ShareBoardModal";
import { fetchData } from "../../../helpers/axiosHelper";
import { toaster } from "../../../components/ui/toaster";
import {
  Box,
  Heading,
  HStack,
  VStack,
  Button,
  Text,
  Spinner,
  Alert,
  Avatar,
  AvatarGroup,
  Badge,
  IconButton,
  MenuRoot,
  MenuTrigger,
  MenuContent,
  MenuItem,
} from "@chakra-ui/react";
import { 
  HiArrowLeft, 
  HiDotsVertical, 
  HiShare
} from "react-icons/hi";

const BoardView = () => {
  const { boardId } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  // Paleta de colores para avatares
  const colorPalette = ["red", "blue", "green", "yellow", "purple", "orange", "pink", "teal", "cyan", "gray"];

  // Función para asignar color basado en el nombre
  const pickPalette = (name) => {
    const index = name.charCodeAt(0) % colorPalette.length;
    return colorPalette[index];
  };
  
  const { 
    board, 
    loading, 
    error, 
    createTask, 
    updateTask, 
    deleteTask, 
    moveTask 
  } = useOneBoard(boardId);

  // Estados para modales
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [selectedColumnId, setSelectedColumnId] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  
  // Estados para compartir tablero
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [shareLoading, setShareLoading] = useState(false);
  
  // Estado para usuarios del tablero
  const [boardUsers, setBoardUsers] = useState([]);

  // Verificar si el usuario es propietario
  const isOwner = user && board && board.created_by === user.user_id;

  // Función para obtener usuarios del tablero
  const fetchBoardUsers = async () => {
    try {
      const response = await fetchData(`/boards/${boardId}/users`, "GET");
      if (response.data.success) {
        setBoardUsers([response.data.data.owner, ...response.data.data.sharedUsers]);
      }
    } catch (error) {
      console.error("Error obteniendo usuarios:", error);
    }
  };

  // Cargar usuarios cuando se carga el board
  useEffect(() => {
    if (boardId) {
      fetchBoardUsers();
    }
  }, [boardId]);

  // Handlers para tareas
  const handleAddTask = (columnId) => {
    setSelectedTask(null);
    setSelectedColumnId(columnId);
    setIsTaskModalOpen(true);
  };

  const handleEditTask = (task) => {
    setSelectedTask(task);
    setSelectedColumnId(task.column_id);
    setIsTaskModalOpen(true);
  };

  const handleDeleteTask = async (task) => {
    if (window.confirm(`¿Estás seguro de eliminar "${task.task_title}"?`)) {
      const result = await deleteTask(task.task_id);
      
      if (result.success) {
        toaster.create({
          title: "Tarea eliminada",
          description: "La tarea se eliminó correctamente",
          type: "success",
        });
      } else {
        toaster.create({
          title: "Error al eliminar tarea",
          description: result.message,
          type: "error",
        });
      }
    }
  };

  const handleToggleTaskComplete = async (task) => {
    const updatedData = {
      task_title: task.task_title,
      task_description: task.task_description,
      task_is_completed: !task.task_is_completed
    };

    const result = await updateTask(task.task_id, updatedData);
    
    if (result.success) {
      toaster.create({
        title: task.task_is_completed ? "Tarea marcada como pendiente" : "Tarea completada",
        type: "success",
      });
    } else {
      toaster.create({
        title: "Error al actualizar tarea",
        description: result.message,
        type: "error",
      });
    }
  };

  const handleTaskSubmit = async (taskData, taskId, columnId) => {
    setModalLoading(true);
    try {
      let result;
      
      if (taskId) {
        // Editar tarea existente
        result = await updateTask(taskId, taskData);
      } else {
        // Crear nueva tarea
        result = await createTask(columnId, taskData);
      }
      
      if (result.success) {
        toaster.create({
          title: taskId ? "Tarea actualizada" : "Tarea creada",
          description: taskId ? `Se actualizó "${taskData.task_title}"` : `Se creó "${taskData.task_title}"`,
          type: "success",
        });
        return result;
      } else {
        toaster.create({
          title: taskId ? "Error al actualizar tarea" : "Error al crear tarea",
          description: result.message,
          type: "error",
        });
        return result;
      }
    } finally {
      setModalLoading(false);
    }
  };

  const handleMoveTask = async (taskId, newColumnId) => {
    try {
      await moveTask(taskId, newColumnId);
      // No mostrar toast de éxito para drag & drop
    } catch (error) {
      // Solo mostrar toast si hay error
      toaster.create({
        title: "Error al mover tarea",
        description: "No se pudo mover la tarea",
        type: "error",
      });
    }
  };

  // Handler para compartir tablero
  const handleShareBoard = async (email) => {
    setShareLoading(true);
    try {
      const response = await fetchData(`/boards/${boardId}/share`, "POST", { email });
      
      if (response.data.success) {
        toaster.create({
          title: "Tablero compartido",
          description: response.data.message,
          type: "success",
        });
        // Recargar usuarios del tablero después de compartir
        fetchBoardUsers();
        return { success: true };
      } else {
        return { success: false, message: response.data.message };
      }
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || "Error al compartir tablero" 
      };
    } finally {
      setShareLoading(false);
    }
  };

  // Manejar el evento de drag and drop
  const handleOnDragEnd = (result) => {
    const { destination, source, draggableId } = result;

    // Si no hay destino, cancelar
    if (!destination) return;

    // Si se soltó en el mismo lugar, no hacer nada
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const sourceColumnId = parseInt(source.droppableId);
    const destinationColumnId = parseInt(destination.droppableId);
    const taskId = parseInt(draggableId);

    // Si cambió de columna, llamar a la API
    if (sourceColumnId !== destinationColumnId) {
      handleMoveTask(taskId, destinationColumnId);
    }
    
    // Nota: No necesitamos manejar el reordenamiento dentro de la misma columna
    // ya que nuestro backend no tiene posiciones específicas dentro de columnas
  };

  // Función para volver al dashboard
  const handleBackToDashboard = () => {
    navigate("/user/dashboard");
  };

  if (loading) {
    return (
      <VStack color="brand.blue" spacing={4} pt={20} fontSize="xl">
        <Spinner color="brand.blue" boxSize="70px" />
        <Text fontWeight="medium">Cargando tablero...</Text>
      </VStack>
    );
  }

  if (error) {
    return (
      <Box p={8} maxW="7xl" mx="auto">
        <Alert.Root status="error">
          <Alert.Content>
            <Alert.Title>Error al cargar el tablero</Alert.Title>
            <Alert.Description>{error}</Alert.Description>
          </Alert.Content>
        </Alert.Root>
        <Button mt={4} onClick={handleBackToDashboard} leftIcon={<HiArrowLeft />}>
          Volver al dashboard
        </Button>
      </Box>
    );
  }

  if (!board) {
    return (
      <Box p={8} maxW="7xl" mx="auto">
        <Text>Tablero no encontrado</Text>
        <Button mt={4} onClick={handleBackToDashboard} leftIcon={<HiArrowLeft />}>
          Volver al dashboard
        </Button>
      </Box>
    );
  }

  return (
    <Box p={6} maxW="7xl" mx="auto" h="calc(100vh - 60px)" overflow="hidden">
      {/* Header del tablero */}
      <VStack align="start" spacing={4} mb={6}>
        {/* Breadcrumb */}
        <HStack spacing={2} color="gray.600" fontSize="sm">
          <Text 
            cursor="pointer"
            onClick={handleBackToDashboard}
            color="blue.500"
            _hover={{ textDecoration: "underline" }}
          >
            Dashboard
          </Text>
          <Text>/</Text>
          <Text fontWeight="medium" color="gray.800">
            {board.board_name}
          </Text>
        </HStack>

        {/* Header principal */}
        <HStack justify="space-between" w="full">
          <VStack align="start" spacing={2}>
            <HStack spacing={3}>
              <Heading as="h1" size="lg" color="gray.800">
                {board.board_name}
              </Heading>
              {!isOwner && (
                <Badge colorScheme="blue" variant="subtle">
                  Compartido
                </Badge>
              )}
            </HStack>
            
            {/* Propietario */}
            <HStack spacing={2}>
              <Avatar.Root 
                size="sm"
                colorPalette={pickPalette(board.creator?.user_name || "Default")}
              >
                <Avatar.Fallback 
                  name={`${board.creator?.user_name} ${board.creator?.lastname || ''}`}
                />
                {board.creator?.avatar && (
                  <Avatar.Image 
                    src={board.creator.avatar}
                    alt={board.creator.user_name}
                  />
                )}
              </Avatar.Root>
              <Text fontSize="sm" color="gray.600">
                {isOwner ? 'Tu tablero' : `Propietario: ${board.creator?.user_name}`}
              </Text>
            </HStack>

            {/* Colaboradores */}
            {boardUsers.length > 1 && (
              <HStack spacing={2}>
                <Text fontSize="xs" color="gray.500">
                  Colaboradores ({boardUsers.length}):
                </Text>
                <AvatarGroup size="xs" max={4} gap="0" spaceX="-2">
                  {boardUsers.map((user) => (
                    <Avatar.Root 
                      key={user.user_id}
                      colorPalette={pickPalette(user.user_name || "Default")}
                    >
                      <Avatar.Fallback 
                        name={`${user.user_name} ${user.lastname || ''}`}
                      />
                      {user.avatar && (
                        <Avatar.Image 
                          src={user.avatar}
                          alt={user.user_name}
                        />
                      )}
                    </Avatar.Root>
                  ))}
                </AvatarGroup>
              </HStack>
            )}
          </VStack>

          <HStack spacing={2}>
            <Button
              variant="ghost"
              onClick={handleBackToDashboard}
              leftIcon={<HiArrowLeft />}
            >
              Volver
            </Button>

            {isOwner && (
              <MenuRoot>
                <MenuTrigger asChild>
                  <IconButton
                    variant="ghost"
                    aria-label="Opciones del tablero"
                  >
                    <HiDotsVertical />
                  </IconButton>
                </MenuTrigger>
                
                <MenuContent>
                  <MenuItem 
                    value="share"
                    onClick={() => setIsShareModalOpen(true)}
                  >
                    <HiShare /> Compartir tablero
                  </MenuItem>
                </MenuContent>
              </MenuRoot>
            )}
          </HStack>
        </HStack>
      </VStack>

      {/* Columnas del tablero */}
      <DragDropContext onDragEnd={handleOnDragEnd}>
        <Box flex="1" overflowX="auto" overflowY="hidden">
          <HStack 
            spacing={6} 
            align="start" 
            h="full" 
            minW="max-content"
            pb={4}
          >
            {board.columns && board.columns.length > 0 ? (
              board.columns.map((column) => (
                <BoardColumn
                  key={column.column_id}
                  column={column}
                  onAddTask={handleAddTask}
                  onEditTask={handleEditTask}
                  onDeleteTask={handleDeleteTask}
                  onToggleTaskComplete={handleToggleTaskComplete}
                />
              ))
            ) : (
              <Box p={8} textAlign="center" w="full">
                <Text fontSize="lg" color="gray.500">
                  Este tablero no tiene columnas configuradas
                </Text>
              </Box>
            )}
          </HStack>
        </Box>
      </DragDropContext>

      {/* Modal para crear/editar tareas */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => {
          setIsTaskModalOpen(false);
          setSelectedTask(null);
          setSelectedColumnId(null);
        }}
        onSubmit={handleTaskSubmit}
        task={selectedTask}
        columnId={selectedColumnId}
        loading={modalLoading}
      />

      {/* Modal para compartir tablero */}
      <ShareBoardModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        onShareBoard={handleShareBoard}
        boardName={board.board_name}
        loading={shareLoading}
      />
    </Box>
  );
};

export default BoardView;