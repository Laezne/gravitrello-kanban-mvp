import {
  Card,
  Text,
  HStack,
  VStack,
  Avatar,
  Badge,
  IconButton,
  MenuRoot,
  MenuTrigger,
  MenuContent,
  MenuItem,
  Box
} from "@chakra-ui/react";
import { HiDotsVertical, HiPencil, HiTrash, HiCheck } from "react-icons/hi";
import { useContext } from "react";
import { AuthContext } from "../../context/AuthContextProvider";
import { getAvatarColor } from "../../helpers/avatarColors.js";

export const TaskCard = ({ 
  task, 
  onEdit, 
  onDelete, 
  onToggleComplete,
  isDragging = false,
  dragHandleProps,
  ...props 
}) => {
  const { user } = useContext(AuthContext);

  const isOwner = user && task.created_by === user.user_id;
  const isAssigned = task.assignedUsers && task.assignedUsers.some(u => u.user_id === user.user_id);
  const canEdit = isOwner || isAssigned;

  return (
    <Card.Root
      size="sm"
      bg="white"
      borderWidth="1px"
      borderColor={isDragging ? "blue.300" : "gray.200"}
      boxShadow={isDragging ? "lg" : "sm"}
      // Solo aplicar hover cuando NO se está dragging
      _hover={!isDragging ? {
        borderColor: "blue.300",
        boxShadow: "md",
        // Transición más rápida y específica para evitar conflictos
        transition: "border-color 0.1s ease, box-shadow 0.1s ease"
      } : {}}
      // Suavizar las animaciones de drag
      opacity={isDragging ? 0.9 : 1}
      transform={isDragging ? "rotate(1deg) scale(1.02)" : "none"}
      transition={isDragging ? "none" : "all 0.1s ease"}
      {...dragHandleProps}
      {...props}
    >
      <Card.Header pb={2}>
        <HStack justify="space-between" align="start" position="relative">
          <VStack align="start" spacing={1} flex="1" minWidth={0} pr={canEdit ? 8 : 0}>
            <Text 
              fontSize="sm" 
              fontWeight="medium" 
              color="gray.800"
              noOfLines={3}
              wordBreak="break-word"
            >
              {task.task_title}
            </Text>
            
            {task.task_description && (
              <Text 
                fontSize="xs" 
                color="gray.600"
                noOfLines={2}
                wordBreak="break-word"
              >
                {task.task_description}
              </Text>
            )}
          </VStack>

          {canEdit && (
            <Box position="absolute" top={0} right={0} zIndex={9999}>
              <MenuRoot>
                <MenuTrigger asChild>
                  <IconButton
                    variant="ghost"
                    size="xs"
                    onClick={(e) => e.stopPropagation()}
                    aria-label="Opciones de la tarea"
                    zIndex={10000}
                    // Deshabilitar el menú durante el drag para evitar conflictos
                    disabled={isDragging}
                  >
                    <HiDotsVertical />
                  </IconButton>
                </MenuTrigger>
                
                <MenuContent zIndex={10001}>
                  <MenuItem 
                    value="edit"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit(task);
                    }}
                  >
                    <HiPencil /> Editar/Asignar
                  </MenuItem>
                  
                  <MenuItem 
                    value="toggle"
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleComplete(task);
                    }}
                  >
                    <HiCheck /> 
                    {task.task_is_completed ? 'Marcar pendiente' : 'Marcar completada'}
                  </MenuItem>
                  
                  {isOwner && (
                    <MenuItem 
                      value="delete"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(task);
                      }}
                      color="red.500"
                    >
                      <HiTrash /> Eliminar
                    </MenuItem>
                  )}
                </MenuContent>
              </MenuRoot>
            </Box>
          )}
        </HStack>
      </Card.Header>

      <Card.Body pt={0}>
        <VStack align="start" spacing={2}>
          {/* Estado de completado */}
          {task.task_is_completed && (
            <Badge colorScheme="green" size="sm">
              Completada
            </Badge>
          )}
          
          {/* Usuarios asignados */}
          {task.assignedUsers && task.assignedUsers.length > 0 && (
            <HStack spacing={1} w="full" justify="space-between">
              <Text fontSize="xs" color="gray.500">
                Asignada a:
              </Text>
              <HStack spacing={-2}>
                {task.assignedUsers.slice(0, 3).map((assignedUser) => (
                  <Avatar.Root 
                    key={assignedUser.user_id} 
                    size="xs"
                    colorPalette={getAvatarColor(assignedUser.user_name || "Default")}
                  >
                    <Avatar.Fallback 
                      name={`${assignedUser.user_name} ${assignedUser.lastname || ''}`}
                    />
                    {assignedUser.avatar && (
                      <Avatar.Image 
                        src={`${import.meta.env.VITE_SERVER_URL_PUBLIC}/images/avatars/${assignedUser.avatar}`}
                        alt={assignedUser.user_name}
                      />
                    )}
                  </Avatar.Root>
                ))}
                {task.assignedUsers.length > 3 && (
                  <Text fontSize="xs" color="gray.500">
                    +{task.assignedUsers.length - 3}
                  </Text>
                )}
              </HStack>
            </HStack>
          )}
          
          {/* Creador de la tarea */}
          <HStack spacing={2} w="full">
            <Avatar.Root 
              size="xs"
              colorPalette={getAvatarColor(task.creator?.user_name || "Default")}
            >
              <Avatar.Fallback 
                name={`${task.creator?.user_name} ${task.creator?.lastname || ''}`}
              />
              {task.creator?.avatar && (
                <Avatar.Image 
                  src={`${import.meta.env.VITE_SERVER_URL_PUBLIC}/images/avatars/${task.creator.avatar}`}
                  alt={task.creator.user_name}
                />
              )}
            </Avatar.Root>
            <Text fontSize="xs" color="gray.500">
              {isOwner ? 'Creada por ti' : `Por ${task.creator?.user_name}`}
            </Text>
          </HStack>
        </VStack>
      </Card.Body>
    </Card.Root>
  );
};