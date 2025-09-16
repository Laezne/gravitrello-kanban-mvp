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
  VStack
} from "@chakra-ui/react";

export const TaskModal = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  task = null, 
  columnId = null,
  loading = false 
}) => {
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [taskCompleted, setTaskCompleted] = useState(false);
  const [error, setError] = useState("");

  const isEditing = !!task;

  // Efecto para cargar datos de la tarea al editar
  useEffect(() => {
    if (task) {
      setTaskTitle(task.task_title || "");
      setTaskDescription(task.task_description || "");
      setTaskCompleted(task.task_is_completed || false);
    } else {
      setTaskTitle("");
      setTaskDescription("");
      setTaskCompleted(false);
    }
    setError("");
  }, [task, isOpen]);

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

    try {
      const result = await onSubmit(taskData, task?.task_id, columnId);
      
      if (result.success) {
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
                    invalid={!!error}
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

                {isEditing && (
                  <Checkbox
                    checked={taskCompleted}
                    onCheckedChange={(e) => setTaskCompleted(e.checked)}
                  >
                    Marcar como completada
                  </Checkbox>
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