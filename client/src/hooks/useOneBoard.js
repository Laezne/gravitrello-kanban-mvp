import { useState, useEffect } from "react";
import { fetchData } from "../helpers/axiosHelper";

export const useOneBoard = (boardId) => {
  const [board, setBoard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Obtener tablero completo con columnas y tareas
  const fetchBoard = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetchData(`/boards/${boardId}`, "GET");
      
      if (response.data.success) {
        setBoard(response.data.data);
      } else {
        setError(response.data.message || "Error al cargar el tablero");
      }
    } catch (err) {
      console.error("Error fetching board:", err);
      setError(err.response?.data?.message || "Error al cargar el tablero");
    } finally {
      setLoading(false);
    }
  };

  // Crear nueva tarea en una columna
  const createTask = async (columnId, taskData) => {
    try {
      const response = await fetchData(`/tasks/columns/${columnId}`, "POST", taskData);
      
      if (response.data.success) {
        // Recargar el tablero para obtener la tarea actualizada
        await fetchBoard();
        return { success: true, data: response.data.data };
      } else {
        return { success: false, message: response.data.message };
      }
    } catch (err) {
      console.error("Error creating task:", err);
      return { 
        success: false, 
        message: err.response?.data?.message || "Error al crear tarea" 
      };
    }
  };

  // Actualizar tarea
  const updateTask = async (taskId, taskData) => {
    try {
      const response = await fetchData(`/tasks/${taskId}`, "PUT", taskData);
      
      if (response.data.success) {
        await fetchBoard();
        return { success: true, data: response.data.data };
      } else {
        return { success: false, message: response.data.message };
      }
    } catch (err) {
      console.error("Error updating task:", err);
      return { 
        success: false, 
        message: err.response?.data?.message || "Error al actualizar tarea" 
      };
    }
  };

  // Eliminar tarea
  const deleteTask = async (taskId) => {
    try {
      const response = await fetchData(`/tasks/${taskId}`, "DELETE");
      
      if (response.data.success) {
        await fetchBoard();
        return { success: true, message: response.data.message };
      } else {
        return { success: false, message: response.data.message };
      }
    } catch (err) {
      console.error("Error deleting task:", err);
      return { 
        success: false, 
        message: err.response?.data?.message || "Error al eliminar tarea" 
      };
    }
  };

  // Mover tarea entre columnas (drag & drop) - OPTIMISTIC UPDATE SIMPLE
  const moveTask = async (taskId, newColumnId) => {
    // 1. Guardar estado original por si hay error
    const originalBoard = { ...board };
    
    // 2. Actualizar estado inmediatamente SIN setTimeout
    if (board && board.columns) {
      const newBoard = { ...board };
      newBoard.columns = newBoard.columns.map(column => ({ 
        ...column, 
        tasks: column.tasks ? [...column.tasks] : []
      }));
      
      // Encontrar y mover la tarea
      let taskToMove = null;
      
      for (let i = 0; i < newBoard.columns.length; i++) {
        const taskIndex = newBoard.columns[i].tasks.findIndex(t => t.task_id === taskId);
        if (taskIndex !== -1) {
          taskToMove = { ...newBoard.columns[i].tasks[taskIndex] };
          newBoard.columns[i].tasks.splice(taskIndex, 1);
          break;
        }
      }
      
      if (taskToMove) {
        const targetColumnIndex = newBoard.columns.findIndex(c => c.column_id === newColumnId);
        if (targetColumnIndex !== -1) {
          taskToMove.column_id = newColumnId;
          newBoard.columns[targetColumnIndex].tasks.push(taskToMove);
        }
      }
      
      // Actualizar estado inmediatamente
      setBoard(newBoard);
    }
    
    // 3. API en background
    try {
      const response = await fetchData(`/tasks/${taskId}/move-to-column`, "PATCH", {
        column_id: newColumnId
      });
      
      if (response.data.success) {
        return { success: true };
      } else {
        // Revertir en caso de error
        setBoard(originalBoard);
        return { success: false, message: response.data.message };
      }
    } catch (err) {
      console.error("Error moving task:", err);
      setBoard(originalBoard);
      return { 
        success: false, 
        message: err.response?.data?.message || "Error al mover tarea" 
      };
    }
  };

  // Cargar tablero al montar el componente o cambiar boardId
  useEffect(() => {
    if (boardId) {
      fetchBoard();
    }
  }, [boardId]);

  return {
    board,
    loading,
    error,
    fetchBoard,
    createTask,
    updateTask,
    deleteTask,
    moveTask
  };
};