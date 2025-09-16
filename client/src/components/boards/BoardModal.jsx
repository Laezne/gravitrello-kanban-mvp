import { useState, useEffect } from "react";
import { 
  Dialog, 
  Button, 
  Input, 
  Portal,
  CloseButton,
  Text,
  VStack
} from "@chakra-ui/react";

export const BoardModal = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  board = null, 
  loading = false 
}) => {
  const [boardName, setBoardName] = useState("");
  const [error, setError] = useState("");

  const isEditing = !!board;

  useEffect(() => {
    if (board) {
      setBoardName(board.board_name || "");
    } else {
      setBoardName("");
    }
    setError("");
  }, [board, isOpen]);

  const handleSubmit = async () => {
    setError("");

    if (!boardName.trim()) {
      setError("El nombre del tablero es requerido");
      return;
    }

    try {
      const result = await onSubmit(boardName.trim(), board?.board_id);
      
      if (result.success) {
        onClose();
        setBoardName("");
      } else {
        setError(result.message || "Error al procesar la solicitud");
      }
    } catch (err) {
      setError("Error inesperado");
    }
  };

  return (
    <Dialog.Root 
      open={isOpen} 
      onOpenChange={(details) => {
        if (!details.open) onClose();
      }}
      size="md"
    >
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Header>
              <Dialog.Title>
                {isEditing ? "Editar tablero" : "Crear nuevo tablero"}
              </Dialog.Title>
            </Dialog.Header>
            
            <Dialog.Body>
              <VStack spacing={4} align="start">
                <Text fontWeight="medium">Nombre del tablero</Text>
                <Input
                  value={boardName}
                  onChange={(e) => setBoardName(e.target.value)}
                  placeholder="Ej: Proyecto Frontend, Tareas personales..."
                  maxLength={100}
                />
                {error && <Text color="red.500" fontSize="sm">{error}</Text>}
              </VStack>
            </Dialog.Body>
            
            <Dialog.Footer>
              <Dialog.ActionTrigger asChild>
                <Button variant="outline">Cancelar</Button>
              </Dialog.ActionTrigger>
              <Button loading={loading} onClick={handleSubmit}>
                {isEditing ? "Guardar" : "Crear"}
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