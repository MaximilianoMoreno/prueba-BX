const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: [true, 'El nombre del ítem es requerido'],
    trim: true,
    maxlength: [100, 'El nombre no puede exceder los 100 caracteres']
  },
  descripcion: {
    type: String,
    trim: true,
    maxlength: [500, 'La descripción no puede exceder los 500 caracteres']
  },
  categoria: {
    type: String,
    required: [true, 'La categoría es requerida'],
    enum: {
      values: ['Madera', 'Autos', 'Metal', 'Insumos', 'Herramientas', 'Jardín', 'Electricidad', 'Plomería', 'Pintura', 'Otros'],
      message: 'Categoría inválida. Las categorías válidas son: Madera, Autos, Metal, Insumos, Herramientas, Jardín, Electricidad, Plomería, Pintura, Otros'
    }
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
  // Atributos específicos para insumos
  esInsumo: {
    type: Boolean,
    default: false
  },
  stock: {
    type: Number,
    min: [0, 'El stock no puede ser negativo'],
    default: null,
    validate: {
      validator: function(value) {
        // Si es insumo, el stock es obligatorio
        if (this.esInsumo && value === null) {
          return false;
        }
        return true;
      },
      message: 'Los insumos deben tener un valor de stock definido'
    }
  },
  prioridadReposicion: {
    type: String,
    enum: ['Baja', 'Media', 'Alta', 'Crítica'],
    default: 'Media',
    validate: {
      validator: function(value) {
        // Solo aplica si es almacenable y es insumo
        if (this.almacenable && this.esInsumo) {
          return value !== undefined && value !== null;
        }
        return true;
      },
      message: 'Los insumos almacenables deben tener una prioridad de reposición definida'
    }
  },
  almacenable: {
    type: Boolean,
    default: false
  },
  // Estado del ítem
  estado: {
    type: String,
    enum: ['Disponible', 'Pendiente de Aprobación', 'En Uso', 'Agotado'],
    default: 'Disponible'
  },
  imagen: {
    type: String,
    default: ''
  },
  ubicacion: {
    type: String,
    trim: true,
    maxlength: [100, 'La ubicación no puede exceder los 100 caracteres']
  },
  activo: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Validación: Si el stock es 0 y es insumo, el estado debe ser 'Agotado'
itemSchema.pre('save', function(next) {
  if (this.esInsumo && this.stock === 0) {
    this.estado = 'Agotado';
  } else if (this.esInsumo && this.stock > 0 && this.estado === 'Agotado') {
    // Si se repone stock, cambiar a Disponible (si no está en uso o pendiente)
    this.estado = 'Disponible';
  }
  next();
});

// Índice para búsquedas eficientes por grupo y categoría
itemSchema.index({ grupo: 1, categoria: 1 });
itemSchema.index({ propietario: 1 });
itemSchema.index({ estado: 1 });

module.exports = mongoose.model('Item', itemSchema);
