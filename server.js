(function () {
  'use strict';
  
  const express = require('express');
  const path = require('path');
  const _ = require('lodash');
  const bodyParser = require('body-parser');
  const app = express();
  app.use(express.static(path.join(__dirname, 'build')));
  
  
  require('./config/initEnv')();
  let config = require('./config/config');
  let routes = require('./config/initRoutes');
  let mongoose = require('mongoose');
  
  var db = mongoose.connect(config.db, function (err) {
    if (err) {
      console.error('Could not connect to MongoDB!');
      console.log(err);
    } else {
      console.log('MongoDB started at: ' + config.db);
      console.log('Local Time: ' + Date(Date.now()));
    }
  });
  
  let App = function () {
    let self = this;
    
    self.initialize = initialize;
    self.initializeServer = initializeServer;
    self.initializeModels = initializeModels;
  };
  
  var zapp = new App();
  zapp.initialize();
  
  function initialize() {
    
    // Create the express server and routes.
    zapp.initializeModels();
    zapp.initializeServer();
  }
  
  /**
   *  Initialize the server (express) and create the routes and register
   *  the handlers.
   */
  function initializeServer() {
    zapp.app.use(bodyParser.json({limit: '50mb'}));
    
    
    var server = require('http').Server(zapp.app);
    
    console.log('Server running on port ' + config.port);
    server.listen(config.port, config.hostname);
    
    routes.init(zapp.app);
    
    zapp.app.locals.title = config.app.title;
    
    zapp.app.set('showStackError', true);
    
  }
  
  function initializeModels() {
    zapp.app = express();
    
    zapp.app.use(function (req, res, next) {
      if (req.headers && req.headers.authorization && req.headers.authorization.split(' ')[0] === 'JWT') {
        jsonwebtoken.verify(req.headers.authorization && req.headers.authorization.split(' ')[1], 'secret_key', function (err, decode) {
          if (err) req.user = undefined;
          req.user = decode;
          next();
        });
      } else {
        req.user = undefined;
        next();
      }
    });
    
    // Globbing model files
    config.getGlobbedFiles('./app/models/**/*.js', true).forEach(function (modelPath) {
      require(path.resolve(modelPath));
    });
  }
  
})();
