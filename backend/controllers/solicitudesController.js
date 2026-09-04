const Item = require('../models/Item');
const Solicitud = require('../models/Solicitud');

// @desc    Crear una solicitud de préstamo
// @route   POST /api/solicitudes
// @access  Privado
const crearSolicitud = async (req, res) => {
  try {
    const { itemId, mensaje, fechaEstimadaDevolucion, cantidadSolicitada } = req.body;

    // Validar que se proporcione el itemId
    if (!itemId) {
      return res.status(400).json({
        success: false,
        message: 'El ID del ítem es requerido'
      });
    }

    // Buscar el ítem
    const item = await Item.findById(itemId).populate('propietario grupo');

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Ítem no encontrado'
      });
    }

    // Verificar que el ítem esté disponible
    if (item.estado !== 'Disponible') {
      return res.status(400).json({
        success: false,
        message: `El ítem no está disponible. Estado actual: ${item.estado}`
      });
    }

    // Verificar que el solicitante no sea el propietario
    if (item.propietario._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'No puedes solicitar un préstamo de tu propio ítem'
      });
    }

    // Verificar que ambos usuarios pertenezcan al mismo grupo
    const usuarioSolicitante = req.user;
    const perteneceAlMismoGrupo = item.grupo.miembros.some(
      miembro => miembro.toString() === usuarioSolicitante._id.toString()
    );

    if (!perteneceAlMismoGrupo) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permiso para solicitar este ítem. Debes pertenecer al mismo grupo.'
      });
    }

    // Para insumos, validar stock
    if (item.esInsumo) {
      const cantidad = cantidadSolicitada || 1;
      if (cantidad > item.stock) {
        return res.status(400).json({
          success: false,
          message: `Stock insuficiente. Disponible: ${item.stock}, Solicitado: ${cantidad}`
        });
      }
    }

    // Crear la solicitud
    const solicitud = await Solicitud.create({
      item: itemId,
      solicitante: req.user._id,
      propietario: item.propietario._id,
      grupo: item.grupo._id,
      mensaje,
      fechaEstimadaDevolucion,
      cantidadSolicitada: cantidadSolicitada || (item.esInsumo ? 1 : null)
    });

    // Cambiar el estado del ítem a "Pendiente de Aprobación"
    item.estado = 'Pendiente de Aprobación';
    await item.save();

    // Generar URL de WhatsApp
    const telefonoPropietario = item.propietario.telefono;
    let whatsappUrl = '';
    
    if (telefonoPropietario) {
      const textoWhatsApp = `Hola ${item.propietario.nombre}, soy ${req.user.nombre}. Me gustaría pedir prestado: "${item.nombre}". ${mensaje ? 'Mensaje: ' + mensaje : ''}`;
      whatsappUrl = `https://wa.me/${telefonoPropietario.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(textoWhatsApp)}`;
    }

    res.status(201).json({
      success: true,
      message: 'Solicitud creada exitosamente. Por favor, contacta al propietario por WhatsApp.',
      data: {
        solicitud,
        whatsappUrl,
        telefonoPropietario: telefonoPropietario || 'No disponible'
      }
    });

  } catch (error) {
    console.error('Error creando solicitud:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear la solicitud',
      error: error.message
    });
  }
};

// @desc    Obtener solicitudes de un usuario (como solicitante o propietario)
// @route   GET /api/solicitudes
// @access  Privado
const obtenerSolicitudes = async (req, res) => {
  try {
    const { tipo = 'todas', estado } = req.query;
    let query = {};

    // Filtrar por tipo: 'solicitante', 'propietario', o 'todas'
    if (tipo === 'solicitante') {
      query.solicitante = req.user._id;
    } else if (tipo === 'propietario') {
      query.propietario = req.user._id;
    }

    // Filtrar por estado si se proporciona
    if (estado) {
      query.estado = estado;
    }

    const solicitudes = await Solicitud.find(query)
      .populate('item', 'nombre categoria estado esInsumo stock')
      .populate('solicitante', 'nombre email telefono')
      .populate('propietario', 'nombre email telefono')
      .sort({ fechaSolicitud: -1 });

    res.status(200).json({
      success: true,
      count: solicitudes.length,
      data: solicitudes
    });

  } catch (error) {
    console.error('Error obteniendo solicitudes:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener las solicitudes',
      error: error.message
    });
  }
};

// @desc    Actualizar estado de una solicitud (Aceptar/Rechazar)
// @route   PUT /api/solicitudes/:id
// @access  Privado (solo propietario)
const actualizarSolicitud = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado, respuesta, cantidadAprobada } = req.body;

    // Validar estados permitidos
    if (!['Aceptada', 'Rechazada', 'Completada'].includes(estado)) {
      return res.status(400).json({
        success: false,
        message: 'Estado no válido. Los estados permitidos son: Aceptada, Rechazada, Completada'
      });
    }

    // Buscar la solicitud
    const solicitud = await Solicitud.findById(id).populate('item propietario');

    if (!solicitud) {
      return res.status(404).json({
        success: false,
        message: 'Solicitud no encontrada'
      });
    }

    // Verificar que solo el propietario pueda aceptar/rechazar
    if (solicitud.propietario._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'No autorizado. Solo el propietario puede gestionar esta solicitud.'
      });
    }

    // Verificar que la solicitud esté pendiente
    if (solicitud.estado !== 'Pendiente' && estado !== 'Completada') {
      return res.status(400).json({
        success: false,
        message: `La solicitud ya ha sido ${solicitud.estado.toLowerCase()}`
      });
    }

    // Actualizar campos
    solicitud.estado = estado;
    if (respuesta) solicitud.respuesta = respuesta;
    if (cantidadAprobada !== undefined) solicitud.cantidadAprobada = cantidadAprobada;

    await solicitud.save();

    // Actualizar el estado del ítem según la acción
    const item = await Item.findById(solicitud.item);
    
    if (estado === 'Aceptada') {
      if (item.esInsumo) {
        // Para insumos, descontar stock
        const cantidad = solicitud.cantidadAprobada || solicitud.cantidadSolicitada || 1;
        item.stock = Math.max(0, item.stock - cantidad);
        
        // Si el stock llega a 0, marcar como Agotado
        if (item.stock === 0) {
          item.estado = 'Agotado';
        } else {
          item.estado = 'En Uso';
        }
      } else {
        // Para herramientas, marcar como En Uso
        item.estado = 'En Uso';
      }
    } else if (estado === 'Rechazada' || estado === 'Cancelada') {
      // Si se rechaza o cancela, volver a Disponible (si no está agotado)
      if (!item.esInsumo || item.stock > 0) {
        item.estado = 'Disponible';
      }
    } else if (estado === 'Completada') {
      // Cuando se devuelve, volver a Disponible (si no está agotado)
      if (!item.esInsumo || item.stock > 0) {
        item.estado = 'Disponible';
      }
      
      // Para insumos, no se devuelve el stock ya que fue consumido
    }

    await item.save();

    res.status(200).json({
      success: true,
      message: `Solicitud ${estado.toLowerCase()} exitosamente`,
      data: {
        solicitud,
        item
      }
    });

  } catch (error) {
    console.error('Error actualizando solicitud:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar la solicitud',
      error: error.message
    });
  }
};

// @desc    Cancelar una solicitud (solo solicitante)
// @route   PUT /api/solicitudes/:id/cancelar
// @access  Privado (solo solicitante)
const cancelarSolicitud = async (req, res) => {
  try {
    const { id } = req.params;

    const solicitud = await Solicitud.findById(id).populate('item');

    if (!solicitud) {
      return res.status(404).json({
        success: false,
        message: 'Solicitud no encontrada'
      });
    }

    // Verificar que solo el solicitante pueda cancelar
    if (solicitud.solicitante.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'No autorizado. Solo el solicitante puede cancelar esta solicitud.'
      });
    }

    // Solo se pueden cancelar solicitudes pendientes
    if (solicitud.estado !== 'Pendiente') {
      return res.status(400).json({
        success: false,
        message: 'Solo se pueden cancelar solicitudes pendientes'
      });
    }

    solicitud.estado = 'Cancelada';
    await solicitud.save();

    // Volver el ítem a Disponible
    const item = await Item.findById(solicitud.item);
    if (!item.esInsumo || item.stock > 0) {
      item.estado = 'Disponible';
      await item.save();
    }

    res.status(200).json({
      success: true,
      message: 'Solicitud cancelada exitosamente',
      data: solicitud
    });

  } catch (error) {
    console.error('Error cancelando solicitud:', error);
    res.status(500).json({
      success: false,
      message: 'Error al cancelar la solicitud',
      error: error.message
    });
  }
};

module.exports = {
  crearSolicitud,
  obtenerSolicitudes,
  actualizarSolicitud,
  cancelarSolicitud
};
