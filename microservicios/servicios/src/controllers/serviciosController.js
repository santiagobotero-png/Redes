const { Router } = require('express');
const router = Router();
const serviciosModel = require('../models/serviciosModel');

// Obtener todos los servicios
router.get('/api/servicios', async (req, res) => {
  try {
    const servicios = await serviciosModel.obtenerServicios();
    res.status(200).json(servicios);
  } catch (error) {
    console.error("Error al obtener servicios:", error);
    res.status(500).json({ error: "Error del servidor al obtener servicios" });
  }
});

// Obtener un servicio por ID
router.get('/api/servicios/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const servicio = await serviciosModel.obtenerServicioPorId(id);

    if (!servicio) {
      return res.status(404).json({ error: "Servicio no encontrado" });
    }

    res.status(200).json(servicio);
  } catch (error) {
    console.error("Error al obtener servicio:", error);
    res.status(500).json({ error: "Error del servidor al obtener servicio" });
  }
});

// Crear servicio
router.post('/api/servicios', async (req, res) => {
  try {
    const { nombre, descripcion, precio, disponibilidad } = req.body;

    await serviciosModel.crearServicio(nombre, descripcion, precio, disponibilidad);

    res.status(201).json({ mensaje: "Servicio creado con éxito" });
  } catch (error) {
    console.error("Error al crear servicio:", error);
    res.status(500).json({ error: "Error del servidor al crear servicio" });
  }
});

// Actualizar servicio
router.put('/api/servicios/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, descripcion, precio, disponibilidad } = req.body;

    await serviciosModel.actualizarServicio(id, nombre, descripcion, precio, disponibilidad);

    res.status(200).json({ mensaje: "Servicio actualizado con éxito" });
  } catch (error) {
    console.error("Error al actualizar servicio:", error);
    res.status(500).json({ error: "Error del servidor al actualizar servicio" });
  }
});

// Eliminar servicio
router.delete('/api/servicios/:id', async (req, res) => {
  try {
    const { id } = req.params;

    await serviciosModel.eliminarServicio(id);

    res.status(200).json({ mensaje: "Servicio eliminado con éxito" });
  } catch (error) {
    console.error("Error al eliminar servicio:", error);
    res.status(500).json({ error: "Error del servidor al eliminar servicio" });
  }
});

module.exports = router;