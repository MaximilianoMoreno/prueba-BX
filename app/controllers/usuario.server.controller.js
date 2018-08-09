(function() {(function () {
'use strict';

module.exports = init;
const path = require('path');
const express = require('express');

function init(app) {
  
  app.use(express.static(path.join(__dirname, 'build')));
  
  app.get('/ping', function (req, res) {
    return res.send('pong');
  });

  app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname, 'build'))
  });
 
}

})();

  'use strict';

  let jwt = require('jsonwebtoken'),
    bcrypt = require('bcrypt'),
    mongoose = require('mongoose'),
    crudTools = require('../services/crud.tools.server.services'),
    _ = require('lodash');

  let Usuario = mongoose.model('Usuario');

  let controller = {
    "register": register,
    "sign_in": sign_in,
    "update": update,
    "loginRequired": loginRequired,
    "remove": remove
  };

  module.exports = controller;

  function infoUsuarios(req, res) {
    Usuario.findOne({_id: req.user._id}, 'id nombre apellido email nroCelular sexoUsuario fechaNacimientoUsuario')
      .then(function(error, usuario){
        console.log(usuario);
        let opcionesUsuario = {
          '_id': usuario.id || '',
          'nombre': usuario.nombre || '',
          'apellido': usuario.apellido || '',
          'email': usuario.email || '',
          'nroCelular': usuario.nroCelular || '',
          'sexoUsuario': usuario.sexoUsuario || '',
          'recibeDescuentos': usuario.recibeDescuentos || 'true',
          'fechaNacimientoUsuario': usuario.fechaNacimientoUsuario || ''
        };
        res.jsonp(opcionesUsuario);
      });
  }

  function remove(req, res) {
    req.led.removeAsync().then(res.jsonp.bind(res));
  }

  function getById(req, res, next, id) {
    Usuario.findById(req.params.id, function(error, led){
      if(led) {
        req.led = led;
        next();
      } else {
        res.status(404).jsonp('No existe el id usuario: ' + id);
      }
    });
  }

  function update(req, res) {
    Usuario.findById(req.user._id, function(error, usuario){
      if(usuario) {
        if(usuario) {
          usuario.nombre = req.body.nombre;
          usuario.apellido = req.body.apellido;
          usuario.sexoUsuario = req.body.sexoUsuario;
          usuario.nroCelular = req.body.nroCelular;
          usuario.fechaNacimientoUsuario = req.body.fechaNacimientoUsuario;
          usuario.sexoUsuario = req.body.sexoUsuario;
          usuario.tipoUsuario = "usuarioReserva";
          usuario.recibeDescuentos = req.body.recibeDescuentos;
        }
        usuario.saveAsync().then(res.json({token: jwt.sign({ email: usuario.email, nombre: usuario.nombre, apellido: usuario.apellido, tipoUsuario: usuario.tipoUsuario, sexoUsuario: usuario.sexoUsuario, nroCelular: usuario.nroCelular, recibeDescuentos: usuario.recibeDescuentos, fechaNacimientoUsuario: usuario.fechaNacimientoUsuario, _id: usuario._id}, 'secret_key')}));
      } else {
        res.status(404).jsonp('No existe el Usuario con id: ' + req.params.id);
      }
    });

    crudTools.update(req, 'Usuario').then(function (usuario){
      res.status(200).json({token: jwt.sign({ email: usuario.email, nombre: usuario.nombre, apellido: usuario.apellido, tipoUsuario: usuario.tipoUsuario, sexoUsuario: usuario.sexoUsuario, nroCelular: usuario.nroCelular, recibeDescuentos: usuario.recibeDescuentos, fechaNacimientoUsuario: usuario.fechaNacimientoUsuario, _id: usuario._id}, 'secret_key')});
    }).catch(function (err){
      res.status(200).jsonp(err);
    });
  }

  function register(req, res){
    console.log(req.body);
    let newUser = new Usuario(req.body);
    newUser.hash_password = bcrypt.hashSync(req.body.password, 10);
    newUser.email = _.toLower(newUser.email);
    Usuario.findOne({
      email: newUser.email
    }, function(err, user) {
      console.log(err);
      if (err) throw err;
      if (user) {
        res.status(401).json({ message: 'El correo ya se encuentra registrado. Por favor utilice otro' });
      } else {
        newUser.save(function(err, user) {
        if (err) {
          return res.status(400).jsonp({
            message: err
          });
        } else {
          user.hash_password = undefined;
          return res.json({token: jwt.sign({ email: user.email, nombre: user.nombre, apellido: user.apellido, tipoUsuario: user.tipoUsuario, sexoUsuario: user.sexoUsuario, nroCelular: user.nroCelular, recibeDescuentos: user.recibeDescuentos, fechaNacimientoUsuario: user.fechaNacimientoUsuario, _id: user._id}, 'secret_key')});
        }
      });
      }
    });
    
  }

  function sign_in(req, res) {
    Usuario.findOne({
      email: req.body.email
    }, function(err, user) {
      if (err) throw err;
      if (!user) {
        res.status(401).json({ message: 'Error de autenticación. Usuario incorrecto.' });
      } else if (user) {
        if (!user.comparePassword(req.body.password)) {
          res.status(401).json({ message: 'Error de autenticación. Password incorrecto.' });
        } else {
          return res.json({token: jwt.sign({ email: user.email, nombre: user.nombre, apellido: user.apellido, tipoUsuario: user.tipoUsuario, sexoUsuario: user.sexoUsuario, nroCelular: user.nroCelular, recibeDescuentos: user.recibeDescuentos, fechaNacimientoUsuario: user.fechaNacimientoUsuario, _id: user._id}, 'secret_key')});
        }
      }
    });
  }

  function loginRequired(req, res, next){
    if (req.user) {
      next();
    } else {
      return res.status(401).json({ message: 'Unauthorized user!' });
    }
  }
  

})();
