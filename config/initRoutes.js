(function() {
	'use strict';

	var glob = require('glob'),
		chalk = require('chalk'),
		_ = require('lodash'),
		path = require('path');

	var initRoutes = {
		"init": init
	};

	module.exports = initRoutes;

	/**
	 * Module init function.
	 */
	function init(app) {
		var routesPath = 'app/routes/**/*.js';
		var options = {
			sync: true
		};

		var routeFiles = glob(routesPath, options);
		if (routeFiles.length) {
			_.each(routeFiles, function(routeFile) {
				require(path.resolve(routeFile))(app);
			});
		} else {
			console.error(chalk.red('There are not route files: "' + routesPath + '"'));
		}
	}
})();
