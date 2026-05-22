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
   SERVICIOS
====================================== */

async function obtenerServicios() {
  const [rows] = await pool.query(`SELECT * FROM servicios`);
  return rows;
}

async function obtenerServicioPorId(id) {
  const [rows] = await pool.query(
    `SELECT * FROM servicios WHERE id = ?`,
    [id]
  );
  return rows[0];
}

async function crearServicio(nombre, descripcion, precio, disponibilidad) {
  const [result] = await pool.query(
    `INSERT INTO servicios (nombre, descripcion, precio, disponibilidad)
     VALUES (?, ?, ?, ?)`,
    [nombre, descripcion, precio, disponibilidad]
  );

  return result.insertId;
}

async function actualizarServicio(id, nombre, descripcion, precio, disponibilidad) {
  const [result] = await pool.query(
    `UPDATE servicios
     SET nombre = ?, descripcion = ?, precio = ?, disponibilidad = ?
     WHERE id = ?`,
    [nombre, descripcion, precio, disponibilidad, id]
  );

  return result;
}

async function eliminarServicio(id) {
  const [result] = await pool.query(
    `DELETE FROM servicios WHERE id = ?`,
    [id]
  );

  return result;
}

module.exports = {
  obtenerServicios,
  obtenerServicioPorId,
  crearServicio,
  actualizarServicio,
  eliminarServicio
};