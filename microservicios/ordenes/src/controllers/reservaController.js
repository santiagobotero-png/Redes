const express = require('express');
const router = express.Router();
const axios = require('axios');
const reservasModel = require('../models/reservasModel');

/* ===================================================
   MICROSERVICIOS
=================================================== */

const USUARIOS_SERVICE = process.env.USUARIOS_SERVICE;
const HABITACIONES_SERVICE = process.env.HABITACIONES_SERVICE;
const SERVICIOS_SERVICE = process.env.SERVICIOS_SERVICE;

/* ===================================================
   DASHBOARD Y CONSULTAS GENERALES (PRIMERO SIEMPRE)
=================================================== */

router.get('/dashboard', async (req, res) => {
  try {
    const totales = await reservasModel.obtenerTotalesReservas();
    res.json(totales);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener dashboard" });
  }
});

router.get('/dashboard/servicios-populares', async (req, res) => {
  try {
    const servicios = await reservasModel.obtenerServiciosPopulares();
    res.json(servicios);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener servicios populares" });
  }
});

router.get('/dashboard/resumen-huespedes', async (req, res) => {
  try {
    const resumen = await reservasModel.obtenerResumenPorHuesped();
    res.json(resumen);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener resumen por huésped" });
  }
});

/* ===================================================
   CONSULTAS ESPECÍFICAS (ANTES DE /:id)
=================================================== */

router.get('/reservas/recientes', async (req, res) => {
  try {
    const reservas = await reservasModel.obtenerReservasRecientes();
    res.json(reservas);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener reservas recientes" });
  }
});

router.get('/reservas/por-dia', async (req, res) => {
  try {
    const { fecha } = req.query;

    if (!fecha) {
      return res.status(400).json({ error: "La fecha es requerida" });
    }

    const reservas = await reservasModel.obtenerReservasPorDia(fecha);
    res.json(reservas);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener reservas por día" });
  }
});

/* ===================================================
   RESERVAS CRUD
=================================================== */

router.get('/reservas', async (req, res) => {
  try {
    const reservas = await reservasModel.obtenerReservas();
    res.json(reservas);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener reservas" });
  }
});

router.get('/reservas/:id', async (req, res) => {
  try {
    const reserva = await reservasModel.obtenerReservaPorId(req.params.id);

    if (!reserva) {
      return res.status(404).json({ error: "Reserva no encontrada" });
    }

    res.json(reserva);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener reserva" });
  }
});

router.post('/reservas', async (req, res) => {
  try {

    const { id_cliente, id_habitacion, fecha_inicio, fecha_fin } = req.body;

    /* VALIDACIONES */
    if (!fecha_inicio || !fecha_fin) {
      return res.status(400).json({ error: "Fechas obligatorias" });
    }

    if (fecha_inicio >= fecha_fin) {
      return res.status(400).json({ error: "Fechas inválidas" });
    }

    /* VALIDAR CLIENTE */
    try {
      await axios.get(`${USUARIOS_SERVICE}/${id_cliente}`);
    } catch {
      return res.status(404).json({ error: "Cliente no encontrado" });
    }

    /* VALIDAR HABITACIÓN */
    try {
      await axios.get(`${HABITACIONES_SERVICE}/${id_habitacion}`);
    } catch {
      return res.status(404).json({ error: "Habitación no encontrada" });
    }

    /* VERIFICAR DISPONIBILIDAD */
    const hayConflicto = await reservasModel.verificarConflictoReserva(
      id_habitacion,
      fecha_inicio,
      fecha_fin
    );

    if (hayConflicto) {
      return res.status(400).json({
        error: "La habitación ya está reservada en ese rango de fechas"
      });
    }

    /* CREAR RESERVA */
    const idReserva = await reservasModel.crearReserva(
      id_cliente,
      id_habitacion,
      fecha_inicio,
      fecha_fin
    );

    /* 🔥 CREAR TITULAR AUTOMÁTICO */
    await reservasModel.agregarHuespedReserva(
      idReserva,
      id_cliente,
      'titular'
    );

    res.status(201).json({
      mensaje: "Reserva creada correctamente",
      id_reserva: idReserva
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Error al crear reserva"
    });
  }
});

router.put('/reservas/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { id_habitacion, fecha_inicio, fecha_fin, estado } = req.body;

    const reserva = await reservasModel.obtenerReservaPorId(id);

    if (!reserva) {
      return res.status(404).json({ error: "Reserva no encontrada" });
    }

    const estadosValidos = ['activa', 'cancelada', 'finalizada', 'pagada'];

    if (!estadosValidos.includes(estado)) {
      return res.status(400).json({ error: "Estado inválido" });
    }

    await reservasModel.editarReserva(
      id,
      id_habitacion,
      fecha_inicio,
      fecha_fin,
      estado
    );

    res.json({ mensaje: "Reserva actualizada" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al editar reserva" });
  }
});

router.put('/reservas/:id/cancelar', async (req, res) => {
  try {
    const reserva = await reservasModel.obtenerReservaPorId(req.params.id);

    if (!reserva) {
      return res.status(404).json({ error: "Reserva no encontrada" });
    }

    await reservasModel.cancelarReserva(req.params.id);

    try {
      await axios.put(
        `${HABITACIONES_SERVICE}/${reserva.id_habitacion}`,
        { estado: "disponible" }
      );
    } catch (e) {
      console.error("Error liberando habitación:", e.message);
    }

    res.json({ mensaje: "Reserva cancelada" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al cancelar reserva" });
  }
});

router.delete('/reservas/:id', async (req, res) => {
  try {
    const reserva = await reservasModel.obtenerReservaPorId(req.params.id);

    if (!reserva) {
      return res.status(404).json({ error: "Reserva no encontrada" });
    }

    await reservasModel.eliminarReserva(req.params.id);

    res.json({ mensaje: "Reserva eliminada" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al eliminar reserva" });
  }
});

/* ===================================================
   HUESPEDES
=================================================== */

router.post('/reservas/:id/huespedes', async (req, res) => {
  try {

    const { id } = req.params;
    const { id_cliente, rol } = req.body;

    const reserva = await reservasModel.obtenerReservaPorId(id);

    if (!reserva) {
      return res.status(404).json({ error: "Reserva no encontrada" });
    }

    /* SOLO ACOMPAÑANTES */
    if (rol !== 'acompanante') {
      return res.status(400).json({
        error: "Solo se pueden agregar acompañantes"
      });
    }

    /* VALIDAR USUARIO */
    try {
      await axios.get(`${USUARIOS_SERVICE}/${id_cliente}`);
    } catch {
      return res.status(404).json({ error: "Usuario no existe" });
    }

    /* EVITAR DUPLICADOS */
    const yaExiste = await reservasModel.huespedExisteEnReserva(id, id_cliente);

    if (yaExiste) {
      return res.status(400).json({
        error: "El huésped ya está en la reserva"
      });
    }

    await reservasModel.agregarHuespedReserva(id, id_cliente, rol);

    res.json({
      mensaje: "Huésped agregado correctamente"
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      error: "Error al agregar huésped"
    });

  }
});

router.get('/reservas/:id/huespedes', async (req, res) => {
  try {
    const huespedes = await reservasModel.obtenerHuespedesReserva(req.params.id);
    res.json(huespedes);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener huéspedes" });
  }
});

router.delete('/reservas/:id/huespedes/:id_cliente', async (req, res) => {
  try {
    await reservasModel.eliminarHuespedReserva(req.params.id, req.params.id_cliente);
    res.json({ mensaje: "Huésped eliminado" });
  } catch (error) {
    res.status(500).json({ error: "Error al eliminar huésped" });
  }
});

/* ===================================================
   CONSUMOS
=================================================== */

router.post('/reservas/:id/servicios', async (req, res) => {
  try {
    const { id } = req.params;
    const { id_servicio, cantidad } = req.body;

    const reserva = await reservasModel.obtenerReservaPorId(id);

    if (!reserva) {
      return res.status(404).json({ error: "Reserva no encontrada" });
    }

    if (reserva.estado !== 'activa') {
      return res.status(400).json({ error: "Reserva no activa" });
    }

    let servicio;

    try {
      const response = await axios.get(`${SERVICIOS_SERVICE}/${id_servicio}`);
      servicio = response.data;
    } catch {
      return res.status(404).json({ error: "Servicio no encontrado" });
    }

    await reservasModel.registrarConsumoServicio(
    id,
    id_servicio,
    servicio.nombre,   
    new Date(),
    cantidad,
    servicio.precio
  );

    res.json({ mensaje: "Consumo registrado" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al registrar consumo" });
  }
});

router.get('/reservas/:id/consumos', async (req, res) => {
  try {
    const consumos = await reservasModel.obtenerConsumosReserva(req.params.id);
    res.json(consumos);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener consumos" });
  }
});

router.delete('/consumos/:id', async (req, res) => {
  try {
    await reservasModel.anularConsumoServicio(req.params.id);
    res.json({ mensaje: "Consumo anulado" });
  } catch (error) {
    res.status(500).json({ error: "Error al anular consumo" });
  }
});

router.put('/consumos/:id/pagar', async (req, res) => {
  try {
    await reservasModel.pagarConsumoServicio(req.params.id);
    res.json({ mensaje: "Consumo pagado" });
  } catch (error) {
    res.status(500).json({ error: "Error al pagar consumo" });
  }
});

/* ===================================================
   TOTAL RESERVA + PAGO
=================================================== */

router.get('/reservas/:id/total', async (req, res) => {
  try {

    const total = await reservasModel.calcularTotalReserva(req.params.id);

    res.json({
      id_reserva: req.params.id,
      total
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      error: "Error al calcular total"
    });

  }
});


router.get('/reservas/:id/saldo', async (req, res) => {
  try {

    const { id } = req.params;

    const reserva = await reservasModel.obtenerReservaPorId(id);

    if (!reserva) {
      return res.status(404).json({
        error: "Reserva no encontrada"
      });
    }

    const saldo = await reservasModel.calcularSaldoPendiente(id);

    res.json({
      id_reserva: id,
      saldo_pendiente: saldo
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      error: "Error al calcular saldo pendiente"
    });

  }
});


router.put('/reservas/:id/pagar', async (req, res) => {
  try {

    const { id } = req.params;

    const reserva = await reservasModel.obtenerReservaPorId(id);

    if (!reserva) {
      return res.status(404).json({
        error: "Reserva no encontrada"
      });
    }

    const saldo = await reservasModel.calcularSaldoPendiente(id);

    await reservasModel.pagarReserva(id);

    res.json({
      mensaje: "Reserva pagada correctamente",
      total_pagado: saldo
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      error: "Error al pagar reserva"
    });

  }
});

module.exports = router;