const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: [true, 'El nombre es requerido'],
    trim: true,
    maxlength: [50, 'El nombre no puede exceder los 50 caracteres']
  },
  email: {
    type: String,
    required: [true, 'El email es requerido'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Por favor ingresa un email válido']
  },
  password: {
    type: String,
    required: [true, 'La contraseña es requerida'],
    minlength: [6, 'La contraseña debe tener al menos 6 caracteres'],
    select: false // No se devuelve por defecto en las consultas
  },
  telefono: {
    type: String,
    trim: true,
    match: [/^[\d\+\-\s()]+$/, 'Por favor ingresa un número de teléfono válido']
  },
  avatar: {
    type: String,
    default: ''
  },
  grupos: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Group'
  }],
  activo: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Hash de contraseña antes de guardar
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Método para comparar contraseñas
userSchema.methods.compararPassword = async function(passwordEnviada) {
  return await bcrypt.compare(passwordEnviada, this.password);
};

module.exports = mongoose.model('User', userSchema);
