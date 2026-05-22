CREATE DATABASE IF NOT EXISTS hotel_ordenes_db;
USE hotel_ordenes_db;

CREATE TABLE reservas (
  id_reserva INT AUTO_INCREMENT PRIMARY KEY,
  id_cliente INT NOT NULL,
  id_habitacion INT NOT NULL,
  fecha_inicio DATE NOT NULL,
  fecha_fin DATE NOT NULL,
  estado VARCHAR(20),
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  precio_total DECIMAL(10,2) DEFAULT 0.00
);

CREATE TABLE huesped_reserva (
  id_huesped_reserva INT AUTO_INCREMENT PRIMARY KEY,
  id_reserva INT NOT NULL,
  id_cliente INT NOT NULL,
  rol ENUM('titular','acompanante') DEFAULT 'acompanante'
);

CREATE TABLE consumo_servicio (
  id_consumo INT AUTO_INCREMENT PRIMARY KEY,
  id_reserva INT NOT NULL,
  id_huesped_reserva INT,
  id_servicio INT NOT NULL,
  nombre_servicio VARCHAR(100) NOT NULL,
  precio_aplicado DECIMAL(10,2) NOT NULL,
  cantidad INT DEFAULT 1,
  anulado TINYINT(1) DEFAULT 0,
  fecha_anulacion TIMESTAMP NULL,
  fecha_consumo TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  pagado TINYINT(1) DEFAULT 0
);