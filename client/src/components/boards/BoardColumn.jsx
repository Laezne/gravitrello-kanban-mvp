import {
  Box,
  VStack,
  Text,
  Button,
  Badge,
  HStack,
} from "@chakra-ui/react";
import { HiPlus } from "react-icons/hi";
import { Droppable, Draggable } from "@hello-pangea/dnd";
import { TaskCard } from "./TaskCard";

export const BoardColumn = ({ 
  column, 
  onAddTask, 
  onEditTask, 
  onDeleteTask, 
  onToggleTaskComplete
}) => {
  // Contar total de tareas
  const totalTasks = column.tasks?.length || 0;

  return (
    <Box
      w="300px"              // Ancho fijo en lugar de minW/maxW
      flexShrink={0}         // No permitir que se comprima
      bg="brand.blueLight"
      borderRadius="lg"
      p={4}
      h="calc(100vh - 290px)"
      display="flex"
      flexDirection="column"
    >
      {/* Header de la columna - FIJO */}
      <VStack spacing={2} w="full" flexShrink={0} mb={4}>
        <HStack justify="space-between" w="full">
          <Text fontSize="md" fontWeight="bold" color="gray.700">
            {column.column_name}
          </Text>
          <Badge bg="brand.blue" color="white">
            {totalTasks}
          </Badge>
        </HStack>

        {/* Botón para agregar tarea */}
        <Button
          variant="ghost"
          size="sm"
          leftIcon={<HiPlus />}
          onClick={() => onAddTask(column.column_id)}
          w="full"
          color="gray.600"
          _hover={{ 
            bg: "white", 
            color: "blue.500",
            borderColor: "blue.200",
            borderWidth: "1px"
          }}
        >
          Agregar tarea
        </Button>
      </VStack>

      {/* Lista de tareas con Droppable - CON SCROLL */}
      <Box flex="1" overflowY="auto" overflowX="hidden">
        <Droppable droppableId={column.column_id.toString()}>
          {(provided, snapshot) => (
            <VStack 
              spacing={3} 
              w="full"
              alignItems="stretch"
              minH="100px"
              ref={provided.innerRef}
              {...provided.droppableProps}
              // Cambio inmediato sin transición para evitar saltos
              bg={snapshot.isDraggingOver ? "blue.50" : "transparent"}
              borderRadius="md"
              pb={2}
            >
              {column.tasks && column.tasks.length > 0 ? (
                <>
                  {column.tasks.map((task, index) => (
                    <Draggable 
                      key={task.task_id} 
                      draggableId={task.task_id.toString()} 
                      index={index}
                    >
                      {(provided, snapshot) => (
                        <TaskCard
                          task={task}
                          onEdit={onEditTask}
                          onDelete={onDeleteTask}
                          onToggleComplete={onToggleTaskComplete}
                          isDragging={snapshot.isDragging}
                          ref={provided.innerRef}
                          dragHandleProps={provided.dragHandleProps}
                          {...provided.draggableProps}
                        />
                      )}
                    </Draggable>
                  ))}
                  {/* Placeholder completamente eliminado */}
                </>
              ) : (
                <>
                  <Box
                    p={snapshot.isDraggingOver ? 3 : 6}
                    border="none"
                    borderRadius="md"
                    textAlign="center"
                    color="gray.500"
                    fontSize="sm"
                    bg={snapshot.isDraggingOver ? "blue.50" : "transparent"}
                  >
                    <VStack spacing={2}>
                      <Text>No hay tareas aún</Text>
                      <Text fontSize="xs">
                        Arrastra tareas aquí o usa el botón "+" para agregar
                      </Text>
                    </VStack>
                  </Box>
                  {/* Sin Placeholder */}
                </>
              )}
            </VStack>
          )}
        </Droppable>
      </Box>
    </Box>
  );
};