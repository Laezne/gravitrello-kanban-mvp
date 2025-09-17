import { useState, useEffect } from "react";
import {
  Dialog,
  Button,
  Input,
  Textarea,
  Checkbox,
  Portal,
  CloseButton,
  Text,
  VStack,
  HStack,
  Avatar,
  Spinner,
  Separator
} from "@chakra-ui/react";
import { fetchData } from "../../helpers/axiosHelper";
import { getAvatarColor } from "../../helpers/avatarColors";

export const TaskModal = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  task = null, 
  columnId = null,
  boardId = null,
  onRefresh, 
  loading = false 
}) => {
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [taskCompleted, setTaskCompleted] = useState(false);
  const [error, setError] = useState("");

  // Estados para asignación de usuarios
  const [boardUsers, setBoardUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  const isEditing = !!task;

  // Obtener usuarios del tablero
  const fetchBoardUsers = async () => {
    if (!boardId) return;
    
    setLoadingUsers(true);
    try {
      const response = await fetchData(`/boards/${boardId}/users`, "GET");
      if (response.data.success) {
        const allUsers = [response.data.data.owner, ...response.data.data.sharedUsers];
        setBoardUsers(allUsers);
      }
    } catch (error) {
      console.error("Error obteniendo usuarios:", error);
    } finally {
      setLoadingUsers(false);
    }
  };

  // Efecto para cargar datos de la tarea al editar
  useEffect(() => {
    if (task) {
      setTaskTitle(task.task_title || "");
      setTaskDescription(task.task_description || "");
      setTaskCompleted(task.task_is_completed || false);
      
      // Cargar usuarios asignados si la tarea ya existe
      if (task.assignedUsers) {
        setSelectedUsers(task.assignedUsers.map(user => user.user_id));
      }
    } else {
      setTaskTitle("");
      setTaskDescription("");
      setTaskCompleted(false);
      setSelectedUsers([]);
    }
    setError("");
  }, [task, isOpen]);

  // Cargar usuarios cuando se abre el modal
  useEffect(() => {
    if (isOpen && boardId) {
      fetchBoardUsers();
    }
  }, [isOpen, boardId]);

  const handleUserToggle = (userId) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSubmit = async () => {
    setError("");

    // Validación
    if (!taskTitle.trim()) {
      setError("El título de la tarea es requerido");
      return;
    }

    if (taskTitle.trim().length < 2) {
      setError("El título debe tener al menos 2 caracteres");
      return;
    }

    if (taskTitle.trim().length > 255) {
      setError("El título no puede tener más de 255 caracteres");
      return;
    }

    if (taskDescription.trim().length > 500) {
      setError("La descripción no puede tener más de 500 caracteres");
      return;
    }

    const taskData = {
      task_title: taskTitle.trim(),
      task_description: taskDescription.trim() || null,
      task_is_completed: taskCompleted
    };

    console.log("=== ENVIANDO DATOS ===");
    console.log("Task ID a actualizar:", task?.task_id);
    console.log("Es edición:", isEditing);
    console.log("Datos:", taskData);

    try {
      const result = await onSubmit(taskData, task?.task_id, columnId);
      
      if (result.success) {
        // Si hay usuarios seleccionados y tenemos el ID de la tarea
        const finalTaskId = task?.task_id || result?.data?.task_id;
        if (selectedUsers.length > 0 && finalTaskId) {
          try {
            // Asignar usuarios a la tarea
            await fetchData(`/tasks/${finalTaskId}/assign-users`, "PUT", {
              userIds: selectedUsers
            });
            console.log("Usuarios asignados correctamente");
            
            // Refrescar datos del tablero
            if (onRefresh) {
              await onRefresh();
            }
          } catch (assignError) {
            console.error("Error asignando usuarios:", assignError);
          }
        }
        
        onClose();
        resetForm();
      } else {
        setError(result.message || "Error al procesar la solicitud");
      }
    } catch (err) {
      setError("Error inesperado");
    }
  };

  const resetForm = () => {
    setTaskTitle("");
    setTaskDescription("");
    setTaskCompleted(false);
    setSelectedUsers([]);
    setError("");
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Dialog.Root 
      open={isOpen} 
      onOpenChange={(details) => {
        if (!details.open) handleClose();
      }}
      size="md"
    >
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Header>
              <Dialog.Title>
                {isEditing ? "Editar tarea" : "Crear nueva tarea"}
              </Dialog.Title>
            </Dialog.Header>

            <Dialog.Body>
              <VStack spacing={4} align="start">
                <VStack spacing={2} align="start" w="full">
                  <Text fontWeight="medium" color={error ? "red.500" : "inherit"}>
                    Título de la tarea *
                  </Text>
                  <Input
                    type="text"
                    placeholder="Ej: Revisar documentación, Implementar feature..."
                    value={taskTitle}
                    onChange={(e) => setTaskTitle(e.target.value)}
                    maxLength={255}
                  />
                  {error && <Text color="red.500" fontSize="sm">{error}</Text>}
                  <Text fontSize="sm" color="gray.600">
                    Entre 2 y 255 caracteres
                  </Text>
                </VStack>

                <VStack spacing={2} align="start" w="full">
                  <Text fontWeight="medium">Descripción (opcional)</Text>
                  <Textarea
                    placeholder="Agrega más detalles sobre la tarea..."
                    value={taskDescription}
                    onChange={(e) => setTaskDescription(e.target.value)}
                    maxLength={500}
                    rows={4}
                    resize="vertical"
                  />
                  <Text fontSize="sm" color="gray.600">
                    Máximo 500 caracteres ({taskDescription.length}/500)
                  </Text>
                </VStack>

                {/* Sección de asignación de usuarios */}
                {boardId && (
                  <>
                    <Separator />
                    <VStack spacing={3} align="start" w="full">
                      <Text fontWeight="medium">Asignar a usuarios</Text>
                      
                      {loadingUsers ? (
                        <HStack>
                          <Spinner size="sm" />
                          <Text fontSize="sm" color="gray.600">Cargando usuarios...</Text>
                        </HStack>
                      ) : (
                        <VStack spacing={2} align="start" w="full">
                          {boardUsers.map((user) => (
                            <Checkbox.Root
                              key={user.user_id}
                              checked={selectedUsers.includes(user.user_id)}
                              onCheckedChange={() => handleUserToggle(user.user_id)}
                            >
                              <Checkbox.HiddenInput />
                              <Checkbox.Control />
                              <Checkbox.Label>
                                <HStack spacing={3}>
                                  <Avatar.Root 
                                    size="sm"
                                    colorPalette={getAvatarColor(user.user_name)}
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
                                  <Text fontSize="sm">
                                    {user.user_name} {user.lastname}
                                  </Text>
                                </HStack>
                              </Checkbox.Label>
                            </Checkbox.Root>
                          ))}
                          
                          {boardUsers.length === 0 && !loadingUsers && (
                            <Text fontSize="sm" color="gray.500">
                              No hay otros usuarios en este tablero
                            </Text>
                          )}
                        </VStack>
                      )}
                      
                      {selectedUsers.length > 0 && (
                        <Text fontSize="sm" color="gray.600">
                          {selectedUsers.length} usuario(s) seleccionado(s)
                        </Text>
                      )}
                    </VStack>
                  </>
                )}

                {isEditing && (
                  <>
                    <Separator />
                    <Checkbox.Root 
                      checked={taskCompleted}
                      onCheckedChange={(details) => setTaskCompleted(details.checked)}
                    >
                      <Checkbox.HiddenInput />
                      <Checkbox.Control />
                      <Checkbox.Label>Marcar como completada</Checkbox.Label>
                    </Checkbox.Root>
                  </>
                )}
              </VStack>
            </Dialog.Body>

            <Dialog.Footer>
              <Dialog.ActionTrigger asChild>
                <Button variant="outline" disabled={loading}>
                  Cancelar
                </Button>
              </Dialog.ActionTrigger>
              <Button 
                loading={loading}
                onClick={handleSubmit}
              >
                {isEditing ? "Guardar cambios" : "Crear tarea"}
              </Button>
            </Dialog.Footer>

            <Dialog.CloseTrigger asChild>
              <CloseButton size="sm" />
            </Dialog.CloseTrigger>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
};