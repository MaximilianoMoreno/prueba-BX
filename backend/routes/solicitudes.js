const express = require('express');
const router = express.Router();
const {
  crearSolicitud,
  obtenerSolicitudes,
  actualizarSolicitud,
  cancelarSolicitud
} = require('../controllers/solicitudesController');
const protegerRuta = require('../middleware/auth');

// Todas las rutas están protegidas
router.use(protegerRuta);

// @route   POST /api/solicitudes
// @desc    Crear una nueva solicitud de préstamo
router.post('/', crearSolicitud);

// @route   GET /api/solicitudes
// @desc    Obtener solicitudes (filtro por tipo y estado)
router.get('/', obtenerSolicitudes);

// @route   PUT /api/solicitudes/:id
// @desc    Actualizar estado de solicitud (Aceptar/Rechazar/Completar)
router.put('/:id', actualizarSolicitud);

// @route   PUT /api/solicitudes/:id/cancelar
// @desc    Cancelar una solicitud pendiente
router.put('/:id/cancelar', cancelarSolicitud);

module.exports = router;
