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
      flex="1"
      minW="280px"
      maxW="320px"
      bg="brand.blueLight"
      borderRadius="lg"
      p={4}
    >
      <VStack spacing={4} h="full">
        {/* Header de la columna */}
        <VStack spacing={2} w="full">
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

        {/* Lista de tareas con Droppable */}
        <Droppable droppableId={column.column_id.toString()}>
          {(provided, snapshot) => (
            <VStack 
              spacing={3} 
              w="full" 
              flex="1"
              alignItems="stretch"
              overflowY="auto"
              maxH="70vh"
              ref={provided.innerRef}
              {...provided.droppableProps}
              bg={snapshot.isDraggingOver ? "blue.50" : "transparent"}
              borderRadius="md"
              transition="background-color 0.2s"
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
                  {provided.placeholder}
                </>
              ) : (
                <>
                  <Box
                    p={6}
                    border="2px dashed"
                    borderColor="gray.300"
                    borderRadius="md"
                    textAlign="center"
                    color="gray.500"
                    fontSize="sm"
                  >
                    <VStack spacing={2}>
                      <Text>No hay tareas aún</Text>
                      <Text fontSize="xs">
                        Arrastra tareas aquí o usa el botón "+" para agregar
                      </Text>
                    </VStack>
                  </Box>
                  {provided.placeholder}
                </>
              )}
            </VStack>
          )}
        </Droppable>
      </VStack>
    </Box>
  );
};