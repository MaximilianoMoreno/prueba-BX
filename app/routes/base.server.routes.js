(function () {
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
