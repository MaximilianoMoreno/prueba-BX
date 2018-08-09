(function() {
	'use strict';

	var controller = {
		"index": index
	};

	module.exports = controller;

	function index(req, res) {
		res.render('index');
	}
})();
