const { Router } = require('express');
const router = Router();
const usuariosModel = require('../models/usuariosModel');

// LOGIN
router.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    const usuario = await usuariosModel.login(username, password);

    if (!usuario) {
      return res.status(401).json({ error: "Credenciales incorrectas" });
    }

    res.status(200).json({
      mensaje: "Login exitoso",
      id: usuario.id,
      username: usuario.username,
      rol: usuario.rol
    });

  } catch (error) {
    console.error("Error en login:", error);
    res.status(500).json({ error: "Error del servidor en login" });
  }
});

// Obtener todos los usuarios (ADMIN)
router.get('/api/usuarios', async (req, res) => {
  try {
    const usuarios = await usuariosModel.obtenerUsuarios();
    res.status(200).json(usuarios);
  } catch (error) {
    console.error("Error al obtener usuarios:", error);
    res.status(500).json({ error: "Error del servidor al obtener los usuarios" });
  }
});

// Obtener usuario por ID (RECEPCIONISTA / HUESPED)
router.get('/api/usuarios/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const usuario = await usuariosModel.obtenerUsuarioPorId(id);

    if (!usuario) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    res.status(200).json(usuario);

  } catch (error) {
    console.error("Error al obtener usuario:", error);
    res.status(500).json({ error: "Error del servidor al obtener usuario" });
  }
});

// Crear usuario (ADMIN)
router.post('/api/usuarios', async (req, res) => {
  try {
    const { username, password, email, nombre_completo, rol } = req.body;

    await usuariosModel.crearUsuario(username, password, email, nombre_completo, rol);

    res.status(201).json({ mensaje: "Usuario creado con éxito" });

  } catch (error) {
    console.error("Error al crear usuario:", error);
    res.status(500).json({ error: "Error del servidor al crear usuario" });
  }
});

// Editar usuario (ADMIN)
router.put('/api/usuarios/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { username, email, nombre_completo, rol, activo } = req.body;

    await usuariosModel.editarUsuario(id, username, email, nombre_completo, rol, activo);

    res.status(200).json({ mensaje: "Usuario actualizado con éxito" });

  } catch (error) {
    console.error("Error al actualizar usuario:", error);
    res.status(500).json({ error: "Error del servidor al actualizar usuario" });
  }
});

// Eliminar usuario (ADMIN)
router.delete('/api/usuarios/:id', async (req, res) => {
  try {
    const { id } = req.params;

    await usuariosModel.eliminarUsuario(id);

    res.status(200).json({ mensaje: "Usuario eliminado con éxito" });

  } catch (error) {
    console.error("Error al eliminar usuario:", error);
    res.status(500).json({ error: "Error del servidor al eliminar usuario" });
  }
});

module.exports = router;