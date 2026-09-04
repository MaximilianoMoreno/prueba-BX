const express = require('express');
const router = express.Router();
const Item = require('../models/Item');
const protegerRuta = require('../middleware/auth');

// @route   GET /api/items
// @desc    Obtener todos los items de los grupos del usuario
// @access  Privado
router.get('/', protegerRuta, async (req, res) => {
  try {
    const { categoria, estado, grupo, search } = req.query;
    
    // Construir query base: solo items de grupos donde el usuario es miembro
    const query = {
      activo: true,
      grupo: { $in: req.user.grupos }
    };

    // Filtrar por categoría si se proporciona
    if (categoria) {
      query.categoria = categoria;
    }

    // Filtrar por estado si se proporciona
    if (estado) {
      query.estado = estado;
    }

    // Filtrar por grupo específico si se proporciona
    if (grupo) {
      query.grupo = grupo;
    }

    // Búsqueda por nombre o descripción
    if (search) {
      query.$or = [
        { nombre: { $regex: search, $options: 'i' } },
        { descripcion: { $regex: search, $options: 'i' } }
      ];
    }

    const items = await Item.find(query)
      .populate('propietario', 'nombre email telefono')
      .populate('grupo', 'nombre')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: items.length,
      data: items
    });

  } catch (error) {
    console.error('Error obteniendo items:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener los items',
      error: error.message
    });
  }
});

// @route   GET /api/items/mis-items
// @desc    Obtener solo los items del usuario autenticado
// @access  Privado
router.get('/mis-items', protegerRuta, async (req, res) => {
  try {
    const { estado } = req.query;
    
    const query = {
      propietario: req.user._id,
      activo: true
    };

    if (estado) {
      query.estado = estado;
    }

    const items = await Item.find(query)
      .populate('grupo', 'nombre')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: items.length,
      data: items
    });

  } catch (error) {
    console.error('Error obteniendo mis items:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener tus items',
      error: error.message
    });
  }
});

// @route   POST /api/items
// @desc    Crear un nuevo item
// @access  Privado
router.post('/', protegerRuta, async (req, res) => {
  try {
    const { 
      nombre, 
      descripcion, 
      categoria, 
      grupo, 
      esInsumo, 
      stock, 
      prioridadReposicion, 
      almacenable, 
      imagen, 
      ubicacion 
    } = req.body;

    // Validar que el usuario pertenezca al grupo
    const userGrupos = req.user.grupos.map(g => g.toString());
    if (!userGrupos.includes(grupo)) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permiso para crear items en este grupo'
      });
    }

    // Validaciones específicas para insumos
    if (esInsumo) {
      if (stock === undefined || stock === null) {
        return res.status(400).json({
          success: false,
          message: 'Los insumos deben tener un valor de stock definido'
        });
      }
      if (almacenable && !prioridadReposicion) {
        return res.status(400).json({
          success: false,
          message: 'Los insumos almacenables deben tener una prioridad de reposición'
        });
      }
    }

    const item = await Item.create({
      nombre,
      descripcion,
      categoria,
      propietario: req.user._id,
      grupo,
      esInsumo: esInsumo || false,
      stock: esInsumo ? stock : null,
      prioridadReposicion: esInsumo && almacenable ? prioridadReposicion : null,
      almacenable: almacenable || false,
      imagen,
      ubicacion,
      estado: esInsumo && stock === 0 ? 'Agotado' : 'Disponible'
    });

    const itemCompleto = await Item.findById(item._id)
      .populate('propietario', 'nombre email')
      .populate('grupo', 'nombre');

    res.status(201).json({
      success: true,
      message: 'Item creado exitosamente',
      data: itemCompleto
    });

  } catch (error) {
    console.error('Error creando item:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear el item',
      error: error.message
    });
  }
});

// @route   PUT /api/items/:id
// @desc    Actualizar un item (solo el propietario)
// @access  Privado
router.put('/:id', protegerRuta, async (req, res) => {
  try {
    const { id } = req.params;
    const actualizaciones = req.body;

    const item = await Item.findById(id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item no encontrado'
      });
    }

    // Verificar que solo el propietario pueda editar
    if (item.propietario.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'No autorizado. Solo el propietario puede editar este item.'
      });
    }

    // Si se actualiza el stock de un insumo, manejar el estado automáticamente
    if (item.esInsumo && actualizaciones.stock !== undefined) {
      if (actualizaciones.stock === 0) {
        actualizaciones.estado = 'Agotado';
      } else if (item.estado === 'Agotado' && actualizaciones.stock > 0) {
        actualizaciones.estado = 'Disponible';
      }
    }

    const itemActualizado = await Item.findByIdAndUpdate(
      id,
      actualizaciones,
      { new: true, runValidators: true }
    )
      .populate('propietario', 'nombre email')
      .populate('grupo', 'nombre');

    res.status(200).json({
      success: true,
      message: 'Item actualizado exitosamente',
      data: itemActualizado
    });

  } catch (error) {
    console.error('Error actualizando item:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar el item',
      error: error.message
    });
  }
});

// @route   DELETE /api/items/:id
// @desc    Eliminar un item (soft delete - solo el propietario)
// @access  Privado
router.delete('/:id', protegerRuta, async (req, res) => {
  try {
    const { id } = req.params;

    const item = await Item.findById(id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item no encontrado'
      });
    }

    // Verificar que solo el propietario pueda eliminar
    if (item.propietario.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'No autorizado. Solo el propietario puede eliminar este item.'
      });
    }

    // Soft delete: marcar como inactivo en lugar de eliminar
    item.activo = false;
    await item.save();

    res.status(200).json({
      success: true,
      message: 'Item eliminado exitosamente',
      data: {}
    });

  } catch (error) {
    console.error('Error eliminando item:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar el item',
      error: error.message
    });
  }
});

// @route   GET /api/items/:id
// @desc    Obtener un item por ID
// @access  Público (para vista rápida, pero con validación de grupo)
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const item = await Item.findById(id)
      .populate('propietario', 'nombre email telefono')
      .populate('grupo', 'nombre miembros');

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item no encontrado'
      });
    }

    // Si hay usuario autenticado, verificar que pertenezca al mismo grupo
    if (req.user) {
      const userGrupos = req.user.grupos.map(g => g.toString());
      if (!userGrupos.includes(item.grupo._id.toString())) {
        return res.status(403).json({
          success: false,
          message: 'No tienes permiso para ver este item'
        });
      }
    } else {
      // Para usuarios no autenticados, no mostrar información sensible
      return res.status(401).json({
        success: false,
        message: 'Autenticación requerida para ver detalles del item'
      });
    }

    res.status(200).json({
      success: true,
      data: item
    });

  } catch (error) {
    console.error('Error obteniendo item:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener el item',
      error: error.message
    });
  }
});

module.exports = router;
