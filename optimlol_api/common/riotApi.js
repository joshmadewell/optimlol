var request = require('request');
var q = require('q');

module.exports = function() {
	var self = this;
	var _config = null;
	var _logger = null;

	var _handleResponse = function(jsonResponse) {
		_logger.riotApi(jsonResponse.body);
		var dataToReturn = {
			data: jsonResponse.body
		};

		switch (jsonResponse.statusCode) {
			case 200:
				dataToReturn.success = true;
				break;
			case 404:
				dataToReturn.success = true;
				dataToReturn.data = {};
				break;
			case 401:
			case 429:
			case 500:
			case 503:
				dataToReturn.success = false;
				break;
			default:
				dataToReturn.success = false;
				dataToReturn.message = "Uknown response from Riot.";
		}

		return dataToReturn;
	}

	self.makeRequest = function(path) {
		var fullUrl = _config.riot_api.url_prefix + path + _config.riot_api.api_key;
		var deffered = q.defer();
		request.get({url: fullUrl, json: true}, function(error, result) {
			if (error) {
				deffered.reject(error);
			} else {
				var handledResponse = _handleResponse(result.toJSON());
				if (handledResponse.success) {
					deffered.resolve(handledResponse);
				} else {
					deffered.reject(handledResponse);
				}
			}
		});

		return deffered.promise;
	};

	self.init = function() {
		_config = require('../config')

		var Logger = require('../common/logger');
		_logger = new Logger();
	}
};