import { useState, useEffect } from "react";
import { fetchData } from "../helpers/axiosHelper";

export const useBoards = () => {
  const [boards, setBoards] = useState({
    ownBoards: [],
    sharedBoards: [],
    allBoards: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Obtener todos los tableros del usuario
  const fetchBoards = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetchData("/boards", "GET");
      
      if (response.data.success) {
        setBoards(response.data.data);
      } else {
        setError(response.data.message || "Error al cargar tableros");
      }
    } catch (err) {
      console.error("Error fetching boards:", err);
      setError(err.response?.data?.message || "Error al cargar tableros");
    } finally {
      setLoading(false);
    }
  };

  // Crear nuevo tablero
  const createBoard = async (boardName) => {
    try {
      const response = await fetchData("/boards", "POST", {
        board_name: boardName
      });
      
      if (response.data.success) {
        // Actualizar la lista de tableros
        await fetchBoards();
        return { success: true, data: response.data.data };
      } else {
        return { success: false, message: response.data.message };
      }
    } catch (err) {
      console.error("Error creating board:", err);
      return { 
        success: false, 
        message: err.response?.data?.message || "Error al crear tablero" 
      };
    }
  };

  // Eliminar tablero
  const deleteBoard = async (boardId) => {
    try {
      const response = await fetchData(`/boards/${boardId}`, "DELETE");
      
      if (response.data.success) {
        // Actualizar la lista de tableros
        await fetchBoards();
        return { success: true, message: response.data.message };
      } else {
        return { success: false, message: response.data.message };
      }
    } catch (err) {
      console.error("Error deleting board:", err);
      return { 
        success: false, 
        message: err.response?.data?.message || "Error al eliminar tablero" 
      };
    }
  };

  // Actualizar nombre del tablero
  const updateBoard = async (boardId, boardName) => {
    try {
      const response = await fetchData(`/boards/${boardId}`, "PUT", {
        board_name: boardName
      });
      
      if (response.data.success) {
        // Actualizar la lista de tableros
        await fetchBoards();
        return { success: true, data: response.data.data };
      } else {
        return { success: false, message: response.data.message };
      }
    } catch (err) {
      console.error("Error updating board:", err);
      return { 
        success: false, 
        message: err.response?.data?.message || "Error al actualizar tablero" 
      };
    }
  };

  // Buscar tableros
  const searchBoards = async (searchTerm) => {
    try {
      const response = await fetchData(`/boards/search?q=${encodeURIComponent(searchTerm)}`, "GET");
      
      if (response.data.success) {
        return { success: true, data: response.data.data };
      } else {
        return { success: false, message: response.data.message };
      }
    } catch (err) {
      console.error("Error searching boards:", err);
      return { 
        success: false, 
        message: err.response?.data?.message || "Error al buscar tableros" 
      };
    }
  };

  // Cargar tableros al montar el componente
  useEffect(() => {
    fetchBoards();
  }, []);

  return {
    boards,
    loading,
    error,
    fetchBoards,
    createBoard,
    deleteBoard,
    updateBoard,
    searchBoards
  };
};