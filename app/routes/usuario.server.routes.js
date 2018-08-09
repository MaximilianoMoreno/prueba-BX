(function () {
  'use strict';
  
  module.exports = init;
  
  function init(app) {
    let controller = require('../../app/controllers/usuario.server.controller');
    
    app.route('/api/v1/admin/register').post(controller.register);
    app.route('/api/v1/admin/sign_in').post(controller.sign_in);
    app.route('/api/v1/admin/actualizarUsuario').put(controller.loginRequired, controller.update);
    app.route('/api/v1/admin/usuario').delete(controller.remove);
  }
  
})();
