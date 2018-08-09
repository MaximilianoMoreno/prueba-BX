(function () {
  'use strict';

  var service =  {
    "find": find,
    "create": create,
    "remove": remove,
    "update": update
  };
  var  mongoose = require('mongoose'),
    _ = require('lodash');


  module.exports = service;

  function find(req, modelo, populateParams) {
    var Modelo = mongoose.model(modelo);
    var promise;

    if (req.query.hasOwnProperty('id')){
      promise = new Promise(function(resolve, reject) {
        Modelo.findById(req.query.id, function(err, encontrado){
          if (err){
            reject(err);
          } else {
            resolve(encontrado);
          }
        }).populate(populateParams);
      });
    } else {
      promise = new Promise(function(resolve, reject) {
        Modelo.find(null, function(err, encontrados){
          if (err){
            reject(err);
          } else {
            resolve(encontrados);
          }
        });
      });

    }

    return promise;
  }

function create(req, modelo) {
    var Modelo = mongoose.model(modelo);

    var query = { };
    Object.keys(req.body).forEach(function(key) {
      query[key] = req.body[key];
    });
    var nuevoModelo = new Modelo(query);

    var promise = new Promise(function(resolve, reject) {
      nuevoModelo.save(query, function (err, modeloGuardado){
        if (err){
          reject(err);
        } else {
          resolve(modeloGuardado);
        }
      });
    });
    
    return promise;
  }

  function update(req, modelo) {
    var Modelo = mongoose.model(modelo);
    var query = { };
    Object.keys(req.body).forEach(function(key) {
      console.log(key, req.body[key]);
      query[key] = req.body[key];
    });
    console.log(query);
    var promise = new Promise(function(resolve, reject) {
      Modelo.findOneAndUpdate({ _id: req.query.id }, query, function (err, modeloActualizado){
        if (err) {
          reject(err);
        } else {
          resolve(modeloActualizado);
        }
      });
    });

    return promise;
  }

  function remove(req, modelo) {
    var Modelo = mongoose.model(modelo);
    var promise = new Promise(function(resolve, reject) {
      Modelo.findById(req.query.id).remove(function (err) {
        if (err){
          reject(err);
        } else{
          resolve('Borrado');
        }
      });
    });

  return promise;
  }


})();
