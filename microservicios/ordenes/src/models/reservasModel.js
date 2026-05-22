const mysql = require('mysql2/promise');
const axios = require('axios');


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
   DASHBOARD
====================================== */
async function obtenerTotalesReservas() {

  const [rows] = await pool.query(`
    SELECT 
      COUNT(*) AS total_reservas,
      SUM(CASE WHEN estado = 'activa' THEN 1 ELSE 0 END) AS activas,
      SUM(CASE WHEN estado = 'cancelada' THEN 1 ELSE 0 END) AS canceladas,
      SUM(CASE WHEN estado = 'finalizada' THEN 1 ELSE 0 END) AS finalizadas,
      SUM(CASE WHEN estado = 'pagada' THEN 1 ELSE 0 END) AS pagadas
    FROM reservas
  `);

  return rows[0];
}

async function obtenerServiciosPopulares() {

  const [rows] = await pool.query(`
    SELECT 
      id_servicio,
      nombre_servicio,
      COUNT(*) AS total_consumos,
      SUM(cantidad) AS total_cantidad
    FROM consumo_servicio
    WHERE anulado = 0
    GROUP BY id_servicio, nombre_servicio
    ORDER BY total_cantidad DESC
    LIMIT 5
  `);

  return rows;
}

async function obtenerResumenPorHuesped() {

  const [rows] = await pool.query(`
    SELECT 
      id_cliente,
      COUNT(id_reserva) AS total_reservas
    FROM huesped_reserva
    GROUP BY id_cliente
    ORDER BY total_reservas DESC
  `);

  return rows;
}

/* ======================================
   RESERVAS
====================================== */

async function obtenerReservas() {
  const [rows] = await pool.query(`
    SELECT * FROM reservas
    ORDER BY fecha_inicio DESC
  `);
  return rows;
}

async function obtenerReservaPorId(id_reserva) {
  const [rows] = await pool.query(`
    SELECT * FROM reservas
    WHERE id_reserva = ?
  `, [id_reserva]);

  return rows[0];
}

async function verificarConflictoReserva(
  id_habitacion,
  fecha_inicio,
  fecha_fin,
  id_reserva = null
) {

  let query = `
    SELECT id_reserva
    FROM reservas
    WHERE id_habitacion = ?
    AND estado != 'cancelada'
    AND (fecha_inicio < ? AND fecha_fin > ?)
  `;

  const params = [id_habitacion, fecha_fin, fecha_inicio];

  if (id_reserva) {
    query += ` AND id_reserva != ?`;
    params.push(id_reserva);
  }

  const [rows] = await pool.query(query, params);

  return rows.length > 0;
}

async function crearReserva(id_cliente, id_habitacion, fecha_inicio, fecha_fin) {
  const [result] = await pool.query(`
    INSERT INTO reservas
    (id_cliente, id_habitacion, fecha_inicio, fecha_fin, estado)
    VALUES (?, ?, ?, ?, ?)
  `, [id_cliente, id_habitacion, fecha_inicio, fecha_fin, "activa"]);

  return result.insertId;
}

/* ======================================
   HUESPEDES
====================================== */

async function agregarHuespedReserva(id_reserva, id_cliente, rol) {
  const [result] = await pool.query(`
    INSERT INTO huesped_reserva
    (id_reserva, id_cliente, rol)
    VALUES (?, ?, ?)
  `, [id_reserva, id_cliente, rol]);

  return result.insertId;
}

async function obtenerHuespedesReserva(id_reserva) {
  const [rows] = await pool.query(`
    SELECT * FROM huesped_reserva
    WHERE id_reserva = ?
  `, [id_reserva]);

  return rows;
}

async function eliminarHuespedReserva(id_huesped_reserva) {
  const [result] = await pool.query(`
    DELETE FROM huesped_reserva
    WHERE id_huesped_reserva = ?
  `, [id_huesped_reserva]);

  return result;
}

async function huespedExisteEnReserva(id_reserva, id_cliente) {
  const [rows] = await pool.query(`
    SELECT 1
    FROM huesped_reserva
    WHERE id_reserva = ? AND id_cliente = ?
    LIMIT 1
  `, [id_reserva, id_cliente]);

  return rows.length > 0;
}

/* ======================================
   CONSUMO SERVICIO
====================================== */

async function registrarConsumoServicio(
  id_reserva,
  id_servicio,
  nombre_servicio,
  fecha_consumo,
  cantidad,
  precio_aplicado
) {

  const [result] = await pool.query(`
    INSERT INTO consumo_servicio
    (id_reserva, id_servicio, nombre_servicio, fecha_consumo, cantidad, precio_aplicado)
    VALUES (?,?,?,?,?,?)
  `, [
    id_reserva,
    id_servicio,
    nombre_servicio,
    fecha_consumo,
    cantidad,
    precio_aplicado
  ]);

  return result.insertId;
}

async function obtenerConsumosReserva(id_reserva) {
  const [rows] = await pool.query(`
    SELECT * FROM consumo_servicio
    WHERE id_reserva = ?
    ORDER BY fecha_consumo
  `, [id_reserva]);

  return rows;
}

async function eliminarConsumoServicio(id_consumo) {
  const [result] = await pool.query(`
    DELETE FROM consumo_servicio
    WHERE id_consumo = ?
  `, [id_consumo]);

  return result;
}

/* ======================================
   CONSUMO ESTADO (CORREGIDO)
====================================== */

async function anularConsumoServicio(id_consumo) {
  await pool.query(`
    UPDATE consumo_servicio
    SET anulado = 1
    WHERE id_consumo = ?
  `, [id_consumo]);
}

async function pagarConsumoServicio(id_consumo) {
  await pool.query(`
    UPDATE consumo_servicio
    SET pagado = 1
    WHERE id_consumo = ?
  `, [id_consumo]);
}

/* ======================================
   TOTAL / RESERVA
====================================== */

async function calcularTotalReserva(id_reserva) {

  // reserva
  const [reservaRows] = await pool.query(`
    SELECT id_habitacion, fecha_inicio, fecha_fin
    FROM reservas
    WHERE id_reserva = ?
  `, [id_reserva]);

  const reserva = reservaRows[0];

  if (!reserva) {
    throw new Error('Reserva no encontrada');
  }

  // noches
  const [diasRows] = await pool.query(`
    SELECT DATEDIFF(fecha_fin, fecha_inicio) AS noches
    FROM reservas
    WHERE id_reserva = ?
  `, [id_reserva]);

  if (diasRows.length === 0) {
    throw new Error('Error calculando noches');
  }

  const noches = Number(diasRows[0].noches) || 0;

  console.log("NOCHES:", noches);

  // llamada HTTP
  const url =
    `${process.env.HABITACIONES_SERVICE}/${reserva.id_habitacion}`;

  console.log("URL HABITACION:", url);

  const response = await axios.get(url);

  console.log("RESPUESTA:", response.data);

  const habitacion = response.data.habitacion;

  if (!habitacion) {
    throw new Error('Habitación no encontrada');
  }

  const precioHabitacion =
    Number(habitacion.precio) || 0;

  console.log("PRECIO:", precioHabitacion);

  const totalHabitacion =
    precioHabitacion * noches;

  // consumos
  const [consumosRows] = await pool.query(`
    SELECT SUM(precio_aplicado * cantidad) AS total
    FROM consumo_servicio
    WHERE id_reserva = ?
      AND anulado = 0
  `, [id_reserva]);

  const totalConsumos =
    Number(consumosRows[0].total) || 0;

  console.log("TOTAL HAB:", totalHabitacion);
  console.log("TOTAL CONS:", totalConsumos);

  // total final
  const totalFinal =
    totalHabitacion + totalConsumos;

  // guardar en BD
  await pool.query(`
    UPDATE reservas
    SET precio_total = ?
    WHERE id_reserva = ?
  `, [totalFinal, id_reserva]);

  return totalFinal;
}

async function calcularSaldoPendiente(id_reserva) {

  /* 1. OBTENER NOCHES */
  const [diasRows] = await pool.query(`
    SELECT DATEDIFF(fecha_fin, fecha_inicio) AS noches,
           id_habitacion
    FROM reservas
    WHERE id_reserva = ?
  `, [id_reserva]);

  if (diasRows.length === 0) {
    throw new Error('Reserva no encontrada');
  }

  const noches = diasRows[0].noches || 0;
  const id_habitacion = diasRows[0].id_habitacion;

  /* 2. OBTENER HABITACIÓN DESDE MICROSERVICIO */
  const response = await axios.get(
    `${process.env.HABITACIONES_SERVICE}/${id_habitacion}`
  );

  const habitacion = response.data.habitacion;

  if (!habitacion) {
    throw new Error('Habitación no encontrada');
  }

  const precioHabitacion = Number(habitacion.precio) || 0;

  const totalHabitacion = precioHabitacion * noches;

  /* 3. SOLO CONSUMOS NO PAGADOS */
  const [consumosRows] = await pool.query(`
    SELECT SUM(precio_aplicado * cantidad) AS total
    FROM consumo_servicio
    WHERE id_reserva = ?
      AND anulado = 0
      AND pagado = 0
  `, [id_reserva]);

  const totalConsumosPendientes =
    Number(consumosRows[0].total) || 0;

  return totalHabitacion + totalConsumosPendientes;
}


async function pagarReserva(id_reserva) {

  /* 1. MARCAR CONSUMOS COMO PAGADOS */
  await pool.query(`
    UPDATE consumo_servicio
    SET pagado = 1
    WHERE id_reserva = ?
      AND anulado = 0
      AND pagado = 0
  `, [id_reserva]);

  /* 2. MARCAR RESERVA */
  await pool.query(`
    UPDATE reservas
    SET estado = 'pagada'
    WHERE id_reserva = ?
  `, [id_reserva]);
}

async function eliminarReserva(id_reserva) {

  // eliminar consumos asociados
  await pool.query(`
    DELETE FROM consumo_servicio
    WHERE id_reserva = ?
  `, [id_reserva]);

  // eliminar huéspedes asociados
  await pool.query(`
    DELETE FROM huesped_reserva
    WHERE id_reserva = ?
  `, [id_reserva]);

  // eliminar reserva
  const [result] = await pool.query(`
    DELETE FROM reservas
    WHERE id_reserva = ?
  `, [id_reserva]);

  return result;
}


module.exports = {
  obtenerTotalesReservas,
  obtenerServiciosPopulares,
  obtenerResumenPorHuesped,

  obtenerReservas,
  obtenerReservaPorId,
  verificarConflictoReserva,
  crearReserva,

  agregarHuespedReserva,
  obtenerHuespedesReserva,
  eliminarHuespedReserva,
  huespedExisteEnReserva,

  registrarConsumoServicio,
  obtenerConsumosReserva,
  eliminarConsumoServicio,

  anularConsumoServicio,
  pagarConsumoServicio,
  calcularTotalReserva,
  pagarReserva,
  eliminarReserva,
  calcularSaldoPendiente
};