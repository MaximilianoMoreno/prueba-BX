const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: [true, 'El nombre del grupo es requerido'],
    trim: true,
    maxlength: [50, 'El nombre no puede exceder los 50 caracteres']
  },
  descripcion: {
    type: String,
    trim: true,
    maxlength: [200, 'La descripción no puede exceder los 200 caracteres']
  },
  miembros: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }],
  creador: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  activo: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Validación para evitar duplicados de nombre por usuario
groupSchema.index({ nombre: 1, creador: 1 });

module.exports = mongoose.model('Group', groupSchema);
