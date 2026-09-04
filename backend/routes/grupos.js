const express = require('express');
const router = express.Router();
const Group = require('../models/Group');
const User = require('../models/User');
const protegerRuta = require('../middleware/auth');

// @route   GET /api/grupos
// @desc    Obtener todos los grupos del usuario autenticado
// @access  Privado
router.get('/', protegerRuta, async (req, res) => {
  try {
    const grupos = await Group.find({
      _id: { $in: req.user.grupos },
      activo: true
    }).populate('miembros', 'nombre email')
      .populate('creador', 'nombre email');

    res.status(200).json({
      success: true,
      count: grupos.length,
      data: grupos
    });

  } catch (error) {
    console.error('Error obteniendo grupos:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener los grupos',
      error: error.message
    });
  }
});

// @route   POST /api/grupos
// @desc    Crear un nuevo grupo
// @access  Privado
router.post('/', protegerRuta, async (req, res) => {
  try {
    const { nombre, descripcion, miembros } = req.body;

    // Validar que se proporcionen datos requeridos
    if (!nombre) {
      return res.status(400).json({
        success: false,
        message: 'El nombre del grupo es requerido'
      });
    }

    // Crear el grupo con el usuario actual como creador y primer miembro
    const grupo = await Group.create({
      nombre,
      descripcion,
      creador: req.user._id,
      miembros: [req.user._id, ...(miembros || [])]
    });

    // Agregar el grupo a los grupos del usuario creador
    await User.findByIdAndUpdate(req.user._id, {
      $addToSet: { grupos: grupo._id }
    });

    // Agregar el grupo a los miembros adicionales si los hay
    if (miembros && miembros.length > 0) {
      await User.updateMany(
        { _id: { $in: miembros } },
        { $addToSet: { grupos: grupo._id } }
      );
    }

    const grupoCompleto = await Group.findById(grupo._id)
      .populate('miembros', 'nombre email')
      .populate('creador', 'nombre email');

    res.status(201).json({
      success: true,
      message: 'Grupo creado exitosamente',
      data: grupoCompleto
    });

  } catch (error) {
    console.error('Error creando grupo:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear el grupo',
      error: error.message
    });
  }
});

// @route   PUT /api/grupos/:id
// @desc    Actualizar un grupo (solo el creador)
// @access  Privado
router.put('/:id', protegerRuta, async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, descripcion } = req.body;

    const grupo = await Group.findById(id);

    if (!grupo) {
      return res.status(404).json({
        success: false,
        message: 'Grupo no encontrado'
      });
    }

    // Verificar que solo el creador pueda editar
    if (grupo.creador.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'No autorizado. Solo el creador puede editar este grupo.'
      });
    }

    const grupoActualizado = await Group.findByIdAndUpdate(
      id,
      { nombre, descripcion },
      { new: true, runValidators: true }
    )
      .populate('miembros', 'nombre email')
      .populate('creador', 'nombre email');

    res.status(200).json({
      success: true,
      message: 'Grupo actualizado exitosamente',
      data: grupoActualizado
    });

  } catch (error) {
    console.error('Error actualizando grupo:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar el grupo',
      error: error.message
    });
  }
});

// @route   POST /api/grupos/:id/miembros
// @desc    Agregar miembros a un grupo (solo el creador)
// @access  Privado
router.post('/:id/miembros', protegerRuta, async (req, res) => {
  try {
    const { id } = req.params;
    const { miembrosIds } = req.body;

    if (!miembrosIds || !Array.isArray(miembrosIds) || miembrosIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Se debe proporcionar una lista de IDs de usuarios'
      });
    }

    const grupo = await Group.findById(id);

    if (!grupo) {
      return res.status(404).json({
        success: false,
        message: 'Grupo no encontrado'
      });
    }

    // Verificar que solo el creador pueda agregar miembros
    if (grupo.creador.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'No autorizado. Solo el creador puede agregar miembros.'
      });
    }

    // Agregar miembros al grupo
    const grupoActualizado = await Group.findByIdAndUpdate(
      id,
      { $addToSet: { miembros: { $each: miembrosIds } } },
      { new: true }
    )
      .populate('miembros', 'nombre email')
      .populate('creador', 'nombre email');

    // Agregar el grupo a los nuevos miembros
    await User.updateMany(
      { _id: { $in: miembrosIds } },
      { $addToSet: { grupos: id } }
    );

    res.status(200).json({
      success: true,
      message: 'Miembros agregados exitosamente',
      data: grupoActualizado
    });

  } catch (error) {
    console.error('Error agregando miembros:', error);
    res.status(500).json({
      success: false,
      message: 'Error al agregar miembros',
      error: error.message
    });
  }
});

// @route   DELETE /api/grupos/:id/miembros/:usuarioId
// @desc    Eliminar un miembro de un grupo (solo el creador o el propio miembro)
// @access  Privado
router.delete('/:id/miembros/:usuarioId', protegerRuta, async (req, res) => {
  try {
    const { id, usuarioId } = req.params;

    const grupo = await Group.findById(id);

    if (!grupo) {
      return res.status(404).json({
        success: false,
        message: 'Grupo no encontrado'
      });
    }

    // Verificar permisos: solo el creador puede remover a otros, o el usuario puede salir por su cuenta
    const esCreador = grupo.creador.toString() === req.user._id.toString();
    const esPropioMiembro = usuarioId === req.user._id.toString();

    if (!esCreador && !esPropioMiembro) {
      return res.status(403).json({
        success: false,
        message: 'No autorizado para remover este miembro'
      });
    }

    // No permitir que el creador se elimine a sí mismo (debería eliminar el grupo en su lugar)
    if (esCreador && esPropioMiembro) {
      return res.status(400).json({
        success: false,
        message: 'El creador no puede abandonar el grupo. Debe transferir la propiedad o eliminar el grupo.'
      });
    }

    // Remover miembro del grupo
    await Group.findByIdAndUpdate(id, {
      $pull: { miembros: usuarioId }
    });

    // Remover grupo del usuario
    await User.findByIdAndUpdate(usuarioId, {
      $pull: { grupos: id }
    });

    const grupoActualizado = await Group.findById(id)
      .populate('miembros', 'nombre email')
      .populate('creador', 'nombre email');

    res.status(200).json({
      success: true,
      message: 'Miembro eliminado exitosamente',
      data: grupoActualizado
    });

  } catch (error) {
    console.error('Error eliminando miembro:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar el miembro',
      error: error.message
    });
  }
});

// @route   DELETE /api/grupos/:id
// @desc    Eliminar un grupo (solo el creador)
// @access  Privado
router.delete('/:id', protegerRuta, async (req, res) => {
  try {
    const { id } = req.params;

    const grupo = await Group.findById(id);

    if (!grupo) {
      return res.status(404).json({
        success: false,
        message: 'Grupo no encontrado'
      });
    }

    // Verificar que solo el creador pueda eliminar
    if (grupo.creador.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'No autorizado. Solo el creador puede eliminar este grupo.'
      });
    }

    // Soft delete: marcar como inactivo
    grupo.activo = false;
    await grupo.save();

    // Remover el grupo de todos los miembros
    await User.updateMany(
      { grupos: id },
      { $pull: { grupos: id } }
    );

    res.status(200).json({
      success: true,
      message: 'Grupo eliminado exitosamente',
      data: {}
    });

  } catch (error) {
    console.error('Error eliminando grupo:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar el grupo',
      error: error.message
    });
  }
});

// @route   GET /api/grupos/:id
// @desc    Obtener detalles de un grupo
// @access  Privado (solo miembros)
router.get('/:id', protegerRuta, async (req, res) => {
  try {
    const { id } = req.params;

    const grupo = await Group.findById(id)
      .populate('miembros', 'nombre email telefono')
      .populate('creador', 'nombre email');

    if (!grupo) {
      return res.status(404).json({
        success: false,
        message: 'Grupo no encontrado'
      });
    }

    // Verificar que el usuario sea miembro del grupo
    const esMiembro = grupo.miembros.some(
      miembro => miembro._id.toString() === req.user._id.toString()
    );

    if (!esMiembro) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permiso para ver este grupo'
      });
    }

    res.status(200).json({
      success: true,
      data: grupo
    });

  } catch (error) {
    console.error('Error obteniendo grupo:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener el grupo',
      error: error.message
    });
  }
});

module.exports = router;
