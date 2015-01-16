var logger = require('winston');
var config = require('../config')
var request = require('request');
var q = require('q');

module.exports = function() {
	var self = this;

	self.makeRequest = function(path) {
		var fullUrl = config.riot_api.url_prefix + path;
		var deffered = q.defer();
		request.get({url: fullUrl}, function(error, result) {
			if (error) {
				deffered.reject(error);
			} else {
				deffered.resolve(result);
			}
		});

		return deffered.promise;
	};
};