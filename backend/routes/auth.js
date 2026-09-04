const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const protegerRuta = require('../middleware/auth');

// Generar token JWT
const generarToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '30d'
  });
};

// @route   POST /api/auth/registro
// @desc    Registrar un nuevo usuario
// @access  Público
router.post('/registro', async (req, res) => {
  try {
    const { nombre, email, password, telefono } = req.body;

    // Validaciones básicas
    if (!nombre || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Por favor proporciona nombre, email y contraseña'
      });
    }

    // Verificar si el usuario ya existe
    const usuarioExistente = await User.findOne({ email });

    if (usuarioExistente) {
      return res.status(400).json({
        success: false,
        message: 'Ya existe un usuario con este email'
      });
    }

    // Crear usuario
    const user = await User.create({
      nombre,
      email,
      password,
      telefono
    });

    // Generar token
    const token = generarToken(user._id);

    res.status(201).json({
      success: true,
      message: 'Usuario registrado exitosamente',
      data: {
        token,
        user: {
          _id: user._id,
          nombre: user.nombre,
          email: user.email,
          telefono: user.telefono
        }
      }
    });

  } catch (error) {
    console.error('Error registrando usuario:', error);
    res.status(500).json({
      success: false,
      message: 'Error al registrar el usuario',
      error: error.message
    });
  }
});

// @route   POST /api/auth/login
// @desc    Autenticar usuario
// @access  Público
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validaciones básicas
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Por favor proporciona email y contraseña'
      });
    }

    // Buscar usuario e incluir password para comparación
    const user = await User.findOne({ email }).select('+password').populate('grupos');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Email o contraseña inválidos'
      });
    }

    // Verificar si el usuario está activo
    if (!user.activo) {
      return res.status(401).json({
        success: false,
        message: 'Tu cuenta ha sido desactivada. Contacta al administrador.'
      });
    }

    // Verificar contraseña
    const esPasswordValido = await user.compararPassword(password);

    if (!esPasswordValido) {
      return res.status(401).json({
        success: false,
        message: 'Email o contraseña inválidos'
      });
    }

    // Generar token
    const token = generarToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Login exitoso',
      data: {
        token,
        user: {
          _id: user._id,
          nombre: user.nombre,
          email: user.email,
          telefono: user.telefono,
          grupos: user.grupos
        }
      }
    });

  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({
      success: false,
      message: 'Error al autenticar',
      error: error.message
    });
  }
});

// @route   GET /api/auth/perfil
// @desc    Obtener perfil del usuario autenticado
// @access  Privado
router.get('/perfil', protegerRuta, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('grupos', 'nombre descripcion')
      .select('-password');

    res.status(200).json({
      success: true,
      data: user
    });

  } catch (error) {
    console.error('Error obteniendo perfil:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener el perfil',
      error: error.message
    });
  }
});

// @route   PUT /api/auth/perfil
// @desc    Actualizar perfil del usuario
// @access  Privado
router.put('/perfil', protegerRuta, async (req, res) => {
  try {
    const { nombre, telefono, avatar } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { nombre, telefono, avatar },
      { new: true, runValidators: true }
    ).select('-password');

    res.status(200).json({
      success: true,
      message: 'Perfil actualizado exitosamente',
      data: user
    });

  } catch (error) {
    console.error('Error actualizando perfil:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar el perfil',
      error: error.message
    });
  }
});

module.exports = router;
