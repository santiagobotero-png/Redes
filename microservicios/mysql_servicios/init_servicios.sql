CREATE DATABASE IF NOT EXISTS hotelroyal;
USE hotelroyal;

CREATE TABLE habitaciones (
  id INT AUTO_INCREMENT PRIMARY KEY,
  numero_habitacion INT UNIQUE NOT NULL,
  piso INT NOT NULL,
  tipo VARCHAR(50) NOT NULL,
  capacidad INT NOT NULL,
  precio DECIMAL(10,2) NOT NULL,
  estado ENUM('disponible','ocupado','mantenimiento') DEFAULT 'disponible'
);

CREATE TABLE servicios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  descripcion TEXT,
  precio DECIMAL(10,2) NOT NULL,
  disponibilidad ENUM('disponible','no disponible') DEFAULT 'disponible'
);