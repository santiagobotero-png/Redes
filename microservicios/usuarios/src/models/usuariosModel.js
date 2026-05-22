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
   USUARIOS
====================================== */

async function obtenerUsuarios() {
  const [rows] = await pool.query(`SELECT * FROM usuarios`);
  return rows;
}

async function obtenerUsuarioPorId(id) {
  const [rows] = await pool.query(
    `SELECT * FROM usuarios WHERE id = ?`,
    [id]
  );

  return rows[0];
}

/* ======================================
   LOGIN
====================================== */

async function login(username, password) {
  const [rows] = await pool.query(
    `SELECT * FROM usuarios WHERE username = ? AND password = ?`,
    [username, password]
  );

  return rows[0];
}

/* ======================================
   CRUD
====================================== */

async function crearUsuario(username, password, email, nombre_completo, rol) {
  const [result] = await pool.query(
    `INSERT INTO usuarios
     (username, password, email, nombre_completo, rol)
     VALUES (?, ?, ?, ?, ?)`,
    [username, password, email, nombre_completo, rol]
  );

  return result.insertId;
}

async function editarUsuario(id, username, email, nombre_completo, rol, activo) {
  const [result] = await pool.query(
    `UPDATE usuarios
     SET username = ?, email = ?, nombre_completo = ?, rol = ?, activo = ?
     WHERE id = ?`,
    [username, email, nombre_completo, rol, activo, id]
  );

  return result;
}

async function eliminarUsuario(id) {
  const [result] = await pool.query(
    `DELETE FROM usuarios WHERE id = ?`,
    [id]
  );

  return result;
}

module.exports = {
  obtenerUsuarios,
  obtenerUsuarioPorId,
  login,
  crearUsuario,
  editarUsuario,
  eliminarUsuario
};