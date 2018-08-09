(function () {
  'use strict';
  
  /**
   * Module dependencies.
   */
  let mongoose = require('mongoose'),
      Schema = mongoose.Schema,
      bcrypt = require('bcrypt'),
      _ = require('lodash');
  
  let UsuarioSchema = new Schema({
    nombre: {
      type: String,
      default: '',
      required: 'Por favor complete el nombre del Usuario',
      trim: true
    },
    apellido: {
      type: String,
      trim: true
    },
    email: {
      type: String,
      default: '',
      required: 'Por favor complete el mail de Usuario',
      trim: true,
      unique: true,
      match: /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/
    },
    hash_password: {
      type: String,
      required: true
    },
    sexoUsuario: {
      type: String,
      trim: true
    },
    nroCelular: {
      type: String,
      trim: true
    },
    fechaNacimientoUsuario: {
      type: String
    },
    fechaCreacion: {
      type: Date,
      default: Date.now
    }
  });
  
  UsuarioSchema.methods.comparePassword = function (password) {
    return !_.isUndefined(this.hash_password) ? bcrypt.compareSync(password, this.hash_password) : false;
  };
  
  mongoose.model('Usuario', UsuarioSchema);
  
})();
