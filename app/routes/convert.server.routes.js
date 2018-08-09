(function () {
  'use strict';
  
  module.exports = init;
  
  function init(app) {
    let controller = require('../../app/controllers/convert.server.controller');
    
    app.route('/api/v1/latest').get(controller.getLatestConversion);
    
  }
})();
