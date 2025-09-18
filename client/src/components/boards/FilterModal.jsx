import { useState, useEffect } from "react";
import {
  Dialog,
  Button,
  Portal,
  CloseButton,
  Text,
  VStack,
  HStack,
  Avatar,
  RadioGroup
} from "@chakra-ui/react";
import { getAvatarColor } from "../../helpers/avatarColors";

export const FilterModal = ({ 
  isOpen, 
  onClose, 
  onApplyFilter,
  boardUsers = [],
  currentFilter = 'all'
}) => {
  const [selectedFilter, setSelectedFilter] = useState(currentFilter);

  // Sincronizar con el filtro actual cuando se abre el modal
  useEffect(() => {
    setSelectedFilter(currentFilter);
  }, [currentFilter, isOpen]);

  const handleApplyFilter = () => {
    onApplyFilter(selectedFilter);
    onClose();
  };

  const handleClose = () => {
    setSelectedFilter(currentFilter); // Resetear al filtro actual si se cancela
    onClose();
  };

  const getFilterLabel = (filter) => {
    if (filter === 'all') return 'Todas las tareas';
    if (filter === 'completed') return 'Solo completadas';
    if (filter === 'pending') return 'Solo pendientes';
    if (filter.startsWith('user:')) {
      const userId = parseInt(filter.split(':')[1]);
      const user = boardUsers.find(u => u.user_id === userId);
      return user ? `Asignadas a ${user.user_name}` : 'Usuario no encontrado';
    }
    return filter;
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
              <Dialog.Title>Filtrar tareas</Dialog.Title>
            </Dialog.Header>

            <Dialog.Body>
              <VStack spacing={4} align="start">
                <Text fontSize="sm" color="gray.600">
                  Selecciona cómo quieres filtrar las tareas del tablero:
                </Text>

                <RadioGroup.Root
                  value={selectedFilter}
                  onValueChange={(details) => setSelectedFilter(details.value)}
                >
                  <VStack spacing={3} align="start" w="full">
                    {/* Filtros básicos */}
                    <RadioGroup.Item value="all">
                      <RadioGroup.ItemHiddenInput />
                      <RadioGroup.ItemIndicator />
                      <RadioGroup.ItemText>
                        Todas las tareas
                      </RadioGroup.ItemText>
                    </RadioGroup.Item>

                    <RadioGroup.Item value="completed">
                      <RadioGroup.ItemHiddenInput />
                      <RadioGroup.ItemIndicator />
                      <RadioGroup.ItemText>
                        Solo completadas
                      </RadioGroup.ItemText>
                    </RadioGroup.Item>

                    <RadioGroup.Item value="pending">
                      <RadioGroup.ItemHiddenInput />
                      <RadioGroup.ItemIndicator />
                      <RadioGroup.ItemText>
                        Solo pendientes
                      </RadioGroup.ItemText>
                    </RadioGroup.Item>

                    {/* Filtros por usuario */}
                    {boardUsers.length > 0 && (
                      <>
                        <Text fontSize="sm" fontWeight="medium" color="gray.700" mt={2}>
                          Filtrar por usuario asignado:
                        </Text>
                        
                        {boardUsers.map((user) => (
                          <RadioGroup.Item 
                            key={user.user_id} 
                            value={`user:${user.user_id}`}
                          >
                            <RadioGroup.ItemHiddenInput />
                            <RadioGroup.ItemIndicator />
                            <RadioGroup.ItemText>
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
                                      src={`${import.meta.env.VITE_SERVER_URL_PUBLIC}/images/avatars/${user.avatar}`}
                                      alt={user.user_name}
                                    />
                                  )}
                                </Avatar.Root>
                                <Text fontSize="sm">
                                  {user.user_name} {user.lastname}
                                </Text>
                              </HStack>
                            </RadioGroup.ItemText>
                          </RadioGroup.Item>
                        ))}
                      </>
                    )}
                  </VStack>
                </RadioGroup.Root>

                {/* Mostrar filtro seleccionado */}
                <VStack spacing={2} align="start" w="full" bg="gray.50" p={3} borderRadius="md">
                  <Text fontSize="xs" fontWeight="medium" color="gray.600">
                    Filtro seleccionado:
                  </Text>
                  <Text fontSize="sm" color="gray.800">
                    {getFilterLabel(selectedFilter)}
                  </Text>
                </VStack>
              </VStack>
            </Dialog.Body>

            <Dialog.Footer>
              <Dialog.ActionTrigger asChild>
                <Button variant="outline">
                  Cancelar
                </Button>
              </Dialog.ActionTrigger>
              <Button onClick={handleApplyFilter}>
                Aplicar filtro
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