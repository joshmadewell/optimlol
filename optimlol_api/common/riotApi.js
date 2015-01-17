var request = require('request');
var q = require('q');

var Logger = require('../common/logger');
var logger = new Logger();
var config = require('../config')

module.exports = function() {
	var self = this;

	var _handleResponse = function(jsonResponse) {
		logger.riotApi(jsonResponse.body);
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
		var fullUrl = config.riot_api.url_prefix + path + config.riot_api.api_key;
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
};