(function () {
  'use strict';
  
  let  _= require('lodash'),
      CacheService = require('../../app/services/cache.server.service');
  
  
  let controller = {
    "getLatestConversion": getLatestConversion
  };
  
  const ttl = 10 * 60 * 1; // cache for 10 minutes
  const cache = new CacheService(ttl); // Create a new cache service instance
  
  module.exports = controller;
  
  function getLatestConversion(req, res) {
    let baseCurrency = _.get(req.query, 'baseCurrency');
    let toCurrency = _.get(req.query, 'toCurrency');
    const key = 'convert_' + baseCurrency + '_to_' + toCurrency;
    
    let request = require('request');
    
    //Busca en cache, si no encuentra llama al callback
    cache.get(key, () => new Promise(resolve => {
          request({
            //debido a que la API ha sido restringida en su version gratuita, ya no se puede cambiar la base de conversion,
            // se invierte el ejercicio para pasar de EUR a USD y no se envia el param base
            //la access_key deberia leerse desde una variable de entorno del sistema por seguridad
            url: 'http://data.fixer.io/api/latest?access_key=d1478306a9cece630d226a163819685a&symbols=' + toCurrency,
          }, function (error, response, body) {
            if (!error) {
              let respuesta = JSON.parse(body);
              resolve(respuesta);
            }
          })
        })
    ).then((result) => {
      return res.send(result);
    });
  }
  
})();
