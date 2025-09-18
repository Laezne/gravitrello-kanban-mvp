CREATE DATABASE mvp_trello;

USE mvp_trello;

-- Tabla de usuario
CREATE TABLE user (
    user_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    user_name VARCHAR(50) NOT NULL,
    lastname VARCHAR(100),
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(200) NOT NULL,
    avatar VARCHAR(200),
    user_is_confirmed BOOLEAN NOT NULL DEFAULT 0,
    user_is_deleted BOOLEAN NOT NULL DEFAULT 0,
    reset_token VARCHAR(255),
    reset_token_expires_at DATETIME,
    two_factor_code VARCHAR(10),
    two_factor_expires_at DATETIME,
    last_login_at DATETIME
);

-- Tabla de tablero
CREATE TABLE board (
    board_id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    board_name VARCHAR(100) NOT NULL,
    created_by BIGINT UNSIGNED NOT NULL,
    board_is_deleted BOOLEAN NOT NULL DEFAULT 0,
    CONSTRAINT fk_user_board 
        FOREIGN KEY (created_by) REFERENCES user(user_id) ON DELETE CASCADE ON UPDATE CASCADE
);

-- Tabla de columna
CREATE TABLE board_column (
    column_id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    board_id INT UNSIGNED NOT NULL,
    column_name VARCHAR(100) NOT NULL,
    position INT UNSIGNED NOT NULL DEFAULT 0,
    column_is_deleted BOOLEAN NOT NULL DEFAULT 0,
    CONSTRAINT fk_board_1 FOREIGN KEY (board_id) 
        REFERENCES board(board_id) ON DELETE CASCADE ON UPDATE CASCADE
);

-- Tabla de tarea
CREATE TABLE task (
    task_id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    task_title VARCHAR(255) NOT NULL,
    task_description VARCHAR(500),
    task_is_completed BOOLEAN DEFAULT 0,
    position INT UNSIGNED NOT NULL DEFAULT 0,
    created_by BIGINT UNSIGNED NOT NULL,
    column_id INT UNSIGNED NOT NULL,
    CONSTRAINT fk_user_1 FOREIGN KEY (created_by) 
        REFERENCES user(user_id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_column_1 FOREIGN KEY (column_id) 
        REFERENCES board_column(column_id) ON DELETE CASCADE ON UPDATE CASCADE
);

-- Relación muchos a muchos entre usuario y tarea
CREATE TABLE user_task (
    user_id BIGINT UNSIGNED NOT NULL,
    task_id INT UNSIGNED NOT NULL,
    PRIMARY KEY (user_id, task_id),
    CONSTRAINT fk_user_3 FOREIGN KEY (user_id) 
        REFERENCES user(user_id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_task_4 FOREIGN KEY (task_id) 
        REFERENCES task(task_id) ON DELETE CASCADE ON UPDATE CASCADE
);

-- Table relación usuario / tableros
CREATE TABLE user_board (
    user_id BIGINT UNSIGNED NOT NULL,
    board_id INT UNSIGNED NOT NULL,
    shared_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, board_id),
    CONSTRAINT fk_user_board_user FOREIGN KEY (user_id) 
        REFERENCES user(user_id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_user_board_board FOREIGN KEY (board_id) 
        REFERENCES board(board_id) ON DELETE CASCADE ON UPDATE CASCADE
);

-- Tabla de sesión (para express-session + connect-session-sequelize)

SELECT * FROM user;
SELECT * FROM board;
SELECT * FROM task;


