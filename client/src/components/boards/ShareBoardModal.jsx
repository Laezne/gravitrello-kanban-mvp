import { useState } from "react";
import {
  Dialog,
  Button,
  Input,
  Portal,
  CloseButton,
  Text,
  VStack
} from "@chakra-ui/react";

export const ShareBoardModal = ({ 
  isOpen, 
  onClose, 
  onShareBoard,
  boardName,
  loading = false 
}) => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    setError("");

    if (!email.trim()) {
      setError("El email es requerido");
      return;
    }

    if (!email.includes("@")) {
      setError("Ingresa un email válido");
      return;
    }

    try {
      const result = await onShareBoard(email.trim());
      
      if (result.success) {
        onClose();
        setEmail("");
      } else {
        setError(result.message || "Error al compartir tablero");
      }
    } catch (err) {
      setError("Error inesperado");
    }
  };

  const handleClose = () => {
    setEmail("");
    setError("");
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
                Compartir "{boardName}"
              </Dialog.Title>
            </Dialog.Header>

            <Dialog.Body>
              <VStack spacing={4} align="start">
                <Text fontSize="sm" color="gray.600">
                  Ingresa el email del usuario con quien quieres compartir este tablero:
                </Text>
                
                <VStack spacing={2} align="start" w="full">
                  <Text fontWeight="medium">Email del usuario</Text>
                  <Input
                    type="email"
                    placeholder="usuario@ejemplo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoFocus
                  />
                  {error && <Text color="red.500" fontSize="sm">{error}</Text>}
                </VStack>
                
                <Text fontSize="xs" color="gray.500">
                  El usuario podrá ver y editar este tablero, crear tareas y asignarlas.
                </Text>
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
                Compartir tablero
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