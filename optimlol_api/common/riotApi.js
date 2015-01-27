var request = require('request');
var q = require('q');

module.exports = function() {
	var self = this;
	var _config = null;
	var _logger = null;

	var _handleResponse = function(jsonResponse) {
		var dataToReturn = {};
		switch (jsonResponse.statusCode) {
			case 200:
				_logger.riotApi("Riot:", jsonResponse.statusCode);
				dataToReturn.success = true;
				dataToReturn.data = jsonResponse.body;
				break;
			case 404:
				_logger.riotApi("Riot:", jsonResponse.statusCode);
				dataToReturn.success = true;
				dataToReturn.data = null;
				break;
			case 401:
			case 429:
			case 500:
			case 503:
				_logger.riotApi("Riot:", jsonResponse.statusCode);
				dataToReturn.success = false;
				dataToReturn.data = null;
				break;
			default:
				_logger.riotApi("Riot Unknown StatusCode:", jsonResponse.statusCode);
				dataToReturn.success = false;
				dataToReturn.data = null;
		}

		return dataToReturn;
	}

	self.makeRequest = function(path) {
		var apiKeyPrefix = path.indexOf('?') !== -1 ? "&api_key=" : "?api_key="; 
		var fullUrl = _config.riot_api.url_prefix + path + apiKeyPrefix + process.env.RIOT_API_KEY;
		var deferred = q.defer();
		request.get({url: fullUrl, json: true}, function(error, result) {
			if (error) {
				deferred.reject(error);
			} else {
				var handledResponse = _handleResponse(result.toJSON());
				if (handledResponse.success) {
					deferred.resolve(handledResponse);
				} else {
					deferred.reject(handledResponse);
				}
			}
		});

		return deferred.promise;
	};

	self.init = function() {
		_config = require('../config')

		var Logger = require('../common/logger');
		_logger = new Logger();
	}
};