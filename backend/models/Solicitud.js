const mongoose = require('mongoose');

const solicitudSchema = new mongoose.Schema({
  item: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Item',
    required: [true, 'El ítem es requerido']
  },
  solicitante: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'El solicitante es requerido']
  },
  propietario: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'El propietario es requerido']
  },
  grupo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Group',
    required: [true, 'El grupo es requerido']
  },
  // Estado de la solicitud
  estado: {
    type: String,
    enum: ['Pendiente', 'Aceptada', 'Rechazada', 'Cancelada', 'Completada'],
    default: 'Pendiente'
  },
  // Fechas importantes
  fechaSolicitud: {
    type: Date,
    default: Date.now
  },
  fechaAprobacion: {
    type: Date,
    default: null
  },
  fechaDevolucion: {
    type: Date,
    default: null
  },
  // Fecha estimada de devolución (opcional, puede ser especificada por el solicitante)
  fechaEstimadaDevolucion: {
    type: Date,
    default: null
  },
  // Mensaje opcional del solicitante
  mensaje: {
    type: String,
    trim: true,
    maxlength: [300, 'El mensaje no puede exceder los 300 caracteres']
  },
  // Respuesta opcional del propietario
  respuesta: {
    type: String,
    trim: true,
    maxlength: [300, 'La respuesta no puede exceder los 300 caracteres']
  },
  // Cantidad solicitada (para insumos)
  cantidadSolicitada: {
    type: Number,
    min: [1, 'La cantidad debe ser al menos 1'],
    default: 1
  },
  // Cantidad aprobada (puede ser diferente a la solicitada)
  cantidadAprobada: {
    type: Number,
    min: [0, 'La cantidad debe ser al menos 0'],
    default: null
  }
}, {
  timestamps: true
});

// Índices para consultas eficientes
solicitudSchema.index({ solicitante: 1, fechaSolicitud: -1 });
solicitudSchema.index({ propietario: 1, fechaSolicitud: -1 });
solicitudSchema.index({ item: 1, fechaSolicitud: -1 });
solicitudSchema.index({ estado: 1 });

// Middleware para actualizar fechas automáticamente
solicitudSchema.pre('findOneAndUpdate', async function(next) {
  const update = this.getUpdate();
  
  // Si se acepta la solicitud, registrar fecha de aprobación
  if (update.estado === 'Aceptada') {
    update.fechaAprobacion = new Date();
  }
  
  // Si se completa la solicitud, registrar fecha de devolución
  if (update.estado === 'Completada') {
    update.fechaDevolucion = new Date();
  }
  
  next();
});

module.exports = mongoose.model('Solicitud', solicitudSchema);
