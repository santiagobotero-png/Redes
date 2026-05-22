const { Router } = require('express');
const router = Router();
const habitacionesModel = require('../models/habitacionesModel');

router.get('/api/habitaciones', async (req, res) => {
  try {
    const habitaciones = await habitacionesModel.obtenerHabitaciones();
    res.json(habitaciones);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener habitaciones' });
  }
});

router.get('/api/habitaciones/:id', async (req, res) => {
  try {

    const habitacion = await habitacionesModel.obtenerHabitacionPorId(req.params.id);

    if (!habitacion || Object.keys(habitacion).length === 0) {
      return res.status(404).json({
        encontrado: false,
        mensaje: 'No se encontró ninguna habitación con ese ID'
      });
    }

    res.json({
      encontrado: true,
      habitacion: habitacion
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: 'Error al obtener la habitación'
    });
  }
});


router.put('/api/habitaciones/:id', async (req, res) => {
  try {
    const { numero_habitacion, piso, tipo, capacidad, precio, estado } = req.body;

    await habitacionesModel.actualizarHabitacion(
      req.params.id,
      numero_habitacion,
      piso,
      tipo,
      capacidad,
      precio,
      estado
    );

    res.json({ mensaje: 'Habitación actualizada correctamente' });

  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar habitación' });
  }
});

router.post('/api/habitaciones', async (req, res) => {
  try {

    const { numero_habitacion, piso, tipo, capacidad, precio, estado } = req.body;

    await habitacionesModel.crearHabitacion(
      numero_habitacion,
      piso,
      tipo,
      capacidad,
      precio,
      estado
    );

    res.json({ mensaje: 'Habitación creada correctamente' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al crear habitación' });
  }
});




router.delete('/api/habitaciones/:id', async (req, res) => {
  try {
    await habitacionesModel.eliminarHabitacion(req.params.id);
    res.json({ mensaje: 'Habitación eliminada' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar habitación' });
  }
});

module.exports = router; 