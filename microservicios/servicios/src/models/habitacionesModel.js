const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

/* ======================================
   HABITACIONES
====================================== */

async function obtenerHabitaciones() {
  const [rows] = await pool.query(`SELECT * FROM habitaciones`);
  return rows;
}

async function obtenerHabitacionPorId(id) {
  const [rows] = await pool.query(
    `SELECT * FROM habitaciones WHERE id = ?`,
    [id]
  );

  return rows[0];
}

async function crearHabitacion(
  numero_habitacion,
  piso,
  tipo,
  capacidad,
  precio,
  estado
) {
  const [result] = await pool.query(
    `INSERT INTO habitaciones
     (numero_habitacion, piso, tipo, capacidad, precio, estado)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [numero_habitacion, piso, tipo, capacidad, precio, estado]
  );

  return result.insertId;
}

async function actualizarHabitacion(
  id,
  numero_habitacion,
  piso,
  tipo,
  capacidad,
  precio,
  estado
) {
  const [result] = await pool.query(
    `UPDATE habitaciones
     SET numero_habitacion = ?, piso = ?, tipo = ?, capacidad = ?, precio = ?, estado = ?
     WHERE id = ?`,
    [numero_habitacion, piso, tipo, capacidad, precio, estado, id]
  );

  return result;
}

async function eliminarHabitacion(id) {
  const [result] = await pool.query(
    `DELETE FROM habitaciones WHERE id = ?`,
    [id]
  );

  return result;
}

module.exports = {
  obtenerHabitaciones,
  obtenerHabitacionPorId,
  crearHabitacion,
  actualizarHabitacion,
  eliminarHabitacion
};