(function() {
	'use strict';

	/**
	 * Module dependencies.
	 */
	var glob = require('glob'),
		chalk = require('chalk');

	/**
	 * Module init function.
	 */
	module.exports = init;

	function init() {
		var envFileName = getEnvFileName();
		var envPath = './config/env/' + envFileName + '.js';
		var options = {
			sync: true
		};

		/**
		 * Before we begin, lets set the environment variable
		 * We'll Look for a valid NODE_ENV variable and if one cannot be found load the development NODE_ENV
		 */
		var environmentFiles = glob(envPath, options);
		if (environmentFiles.length) {
			console.log(chalk.black.bgWhite('Application loaded using the "' + process.env.NODE_ENV + '" environment configuration'));
		} else {
			console.error(chalk.red('No configuration file found for "' + process.env.NODE_ENV + '".'));
		}
	}

	function getEnvFileName() {
		if(!process.env.NODE_ENV) {
			process.env.NODE_ENV = 'development';
			console.error(chalk.red('NODE_ENV is not defined! Using "' + process.env.NODE_ENV + '" value'));
		}

		return process.env.NODE_ENV;
	}
})();
