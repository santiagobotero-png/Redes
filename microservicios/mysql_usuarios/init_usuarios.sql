-- Eliminar el usuario si existe para evitar errores de "already exists"
DROP USER IF EXISTS 'appuser'@'%';

-- Crear el usuario con acceso desde cualquier host (%)
CREATE USER 'appuser'@'%' IDENTIFIED BY '1234';

-- Asegurar que la base de datos exista
CREATE DATABASE IF NOT EXISTS hotel_usuarios_db;

-- Dar permisos específicos
GRANT ALL PRIVILEGES ON hotel_usuarios_db.* TO 'appuser'@'%';

-- Aplicar cambios
FLUSH PRIVILEGES;

USE hotel_usuarios_db;

CREATE TABLE IF NOT EXISTS usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  nombre_completo VARCHAR(150) NOT NULL,
  rol ENUM('ADMIN','RECEPCIONISTA','HUESPED') NOT NULL,
  activo TINYINT(1) DEFAULT 1,
  fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);