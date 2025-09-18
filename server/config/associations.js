// Aquí se definen todas las relaciones entre modelos

import User from '../modules/users/users.model.js';
import Board from '../modules/boards/boards.model.js';
import BoardColumn from '../modules/boardColumns/boardColumns.model.js';
import Task from '../modules/tasks/tasks.model.js';

// Relaciones User - Board (creador)
User.hasMany(Board, { 
  foreignKey: 'created_by', 
  as: 'ownedBoards' 
});

Board.belongsTo(User, { 
  foreignKey: 'created_by', 
  as: 'creator' 
});

// Relaciones Many-to-Many: User - Board (tableros compartidos)
User.belongsToMany(Board, { 
  through: 'user_board',
  foreignKey: 'user_id',
  otherKey: 'board_id',
  as: 'sharedBoards' 
});

Board.belongsToMany(User, { 
  through: 'user_board',
  foreignKey: 'board_id',
  otherKey: 'user_id',
  as: 'sharedUsers' 
});

// Relaciones Board - BoardColumn
Board.hasMany(BoardColumn, { 
  foreignKey: 'board_id', 
  as: 'columns' 
});

BoardColumn.belongsTo(Board, { 
  foreignKey: 'board_id', 
  as: 'board' 
});

// Relaciones BoardColumn - Task
BoardColumn.hasMany(Task, { 
  foreignKey: 'column_id', 
  as: 'tasks' 
});

Task.belongsTo(BoardColumn, { 
  foreignKey: 'column_id', 
  as: 'column' 
});

// Relaciones User - Task (creador)
User.hasMany(Task, { 
  foreignKey: 'created_by', 
  as: 'createdTasks' 
});

Task.belongsTo(User, { 
  foreignKey: 'created_by', 
  as: 'creator' 
});

// Relaciones Many-to-Many: User - Task (asignaciones)
User.belongsToMany(Task, { 
  through: 'user_task',
  foreignKey: 'user_id',
  otherKey: 'task_id',
  as: 'assignedTasks' 
});

Task.belongsToMany(User, { 
  through: 'user_task',
  foreignKey: 'task_id',
  otherKey: 'user_id',
  as: 'assignedUsers' 
});

console.log('Asociaciones de modelos cargadas correctamente');

export default {
  User,
  Board,
  BoardColumn,
  Task
};