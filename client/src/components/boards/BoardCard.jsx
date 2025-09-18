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
  Button,
} from "@chakra-ui/react";
import { HiDotsVertical, HiEye, HiPencil, HiTrash, HiShare } from "react-icons/hi";
import { useNavigate } from "react-router";
import { useContext } from "react";
import { AuthContext } from "../../context/AuthContextProvider";
import { getAvatarColor } from "../../helpers/avatarColors.js";

export const BoardCard = ({ board, onEdit, onDelete, onShare }) => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const handleViewBoard = () => {
    navigate(`/user/board/${board.board_id}`);
  };

  const isOwnerUser = user && board.created_by === user.user_id;
  const isSharedBoard = !isOwnerUser;

  return (
    <Card.Root
      maxW="sm"
      cursor="pointer"
      _hover={{
        transform: "translateY(-2px)",
        boxShadow: "lg",
        transition: "all 0.2s"
      }}
      onClick={handleViewBoard}
      bg="brand.blueLight"
      borderWidth="1px"
      borderColor="gray.200"
    >
      <Card.Header>
        <HStack justify="space-between" align="start">
          <VStack align="start" spacing={1} flex="1">
            <Text 
              fontSize="lg" 
              fontWeight="bold" 
              color="gray.800"
              noOfLines={2}
            >
              {board.board_name}
            </Text>
            
            {isSharedBoard && (
              <Badge colorScheme="blue" size="sm">
                Compartido
              </Badge>
            )}
          </VStack>

          <MenuRoot>
            <MenuTrigger asChild>
              <IconButton
                variant="ghost"
                size="sm"
                onClick={(e) => e.stopPropagation()}
                aria-label="Opciones del tablero"
              >
                <HiDotsVertical />
              </IconButton>
            </MenuTrigger>
            
            <MenuContent>
              <MenuItem 
                value="view"
                onClick={(e) => {
                  e.stopPropagation();
                  handleViewBoard();
                }}
              >
                <HiEye /> Ver tablero
              </MenuItem>
              
              {isOwnerUser && (
                <>
                  <MenuItem 
                    value="edit"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit(board);
                    }}
                  >
                    <HiPencil /> Editar nombre
                  </MenuItem>
                  
                  <MenuItem 
                    value="share"
                    onClick={(e) => {
                      e.stopPropagation();
                      onShare(board);
                    }}
                  >
                    <HiShare /> Compartir
                  </MenuItem>
                  
                  <MenuItem 
                    value="delete"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(board);
                    }}
                    color="red.500"
                  >
                    <HiTrash /> Eliminar
                  </MenuItem>
                </>
              )}
            </MenuContent>
          </MenuRoot>
        </HStack>
      </Card.Header>

      <Card.Body pt={0}>
        <VStack align="start" spacing={3}>
          {/* Información del propietario */}
          <HStack spacing={2}>
            <Avatar.Root 
                size="xs"
                colorPalette={getAvatarColor(board.creator?.user_name || "Default")}>
              <Avatar.Fallback 
                name={`${board.creator?.user_name} ${board.creator?.lastname || ''}`}
              />
              {board.creator?.avatar && (
                <Avatar.Image 
                  src={`${import.meta.env.VITE_SERVER_URL_PUBLIC}/images/avatars/${board.creator.avatar}`}
                  alt={board.creator.user_name}
                />
              )}
            </Avatar.Root>
            <Text fontSize="sm" color="gray.600">
              {isOwnerUser ? 'Tu tablero' : `Por ${board.creator?.user_name}`}
            </Text>
          </HStack>

          {/* Botón de acción principal */}
          <Button
            variant="solid"
            bg="gray.100"
            color="black"
            size="sm"
            w="full"
            onClick={(e) => {
              e.stopPropagation();
              handleViewBoard();
            }}
          >
            Abrir tablero
          </Button>
        </VStack>
      </Card.Body>
    </Card.Root>
  );
};