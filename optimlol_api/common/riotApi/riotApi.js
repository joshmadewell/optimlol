var request = require('request');
var q = require('q');

module.exports = function() {
	var self = this;
	var _config = null;
	var _logger = null;
	var _apiStatus = null;

	var _handleResponse = function(jsonResponse) {
		console.log("handling response!");
		var deferred = q.defer();
		_logger.riotApi("Riot:", jsonResponse.statusCode);

		var dataToReturn = {
			statusCode: jsonResponse.statusCode
		};

		switch (jsonResponse.statusCode) {
			case 200:
				dataToReturn.success = true;
				dataToReturn.data = jsonResponse.body;
				_apiStatus.setRateLimitExceeded(false, 0);
				break;
			case 404:
				// riot uses 404 to tell us some things weren't found
				// rather than just the url wasn't found....:(
				dataToReturn.success = true;
				dataToReturn.data = null;
				break;
			case 401:
			case 429:
			case 500:
			case 503:
				dataToReturn.success = false;
				dataToReturn.data = null;
				break;
			default:
				dataToReturn.success = false;
				dataToReturn.data = null;
		}

		if (jsonResponse.statusCode === 429) {
			var retryAfter = parseInt(jsonResponse.headers['retry-after']);
			_apiStatus.setRateLimitExceeded(true, retryAfter);
		} else {
			deferred.resolve(dataToReturn);
		}

		return deferred.promise;
	}

	self.makeRequest = function(region, path) {
		var now = new Date();
		var apiKeyPrefix = path.indexOf('?') !== -1 ? "&api_key=" : "?api_key="; 
		var fullUrl = _config.riot_api.url_prefix + region + _config.riot_api.url_midfix + path + apiKeyPrefix + process.env.RIOT_API_KEY;

		var deferred = q.defer();
		if (now > _apiStatus.getNextApiCallTime) {
			request.get({url: fullUrl, json: true}, function(error, result) {
				if (error) {
					deferred.reject(error);
				} else {
					_handleResponse(result.toJSON())
						.then(function(handledResponse) {
							if (handledResponse.success) {
								deferred.resolve(handledResponse);
							} else {
								deferred.reject(handledResponse);
							}
						})
						.fail(function(error) {
							deferred.reject(error);
						});
				}
			});
		} else {
			deferred.reject({
				success: false,
				status: 429,
				data: null
			});
		}

		return deferred.promise;
	};

	self.makeGlobalRequest = function(region, path) {
		return self.makeRequest('global', path);
	};

	self.init = function() {
		_config = require('../../config')
		_apiStatus = require('./apiStatus');

		var Logger = require('../logging/logger');
		_logger = new Logger();
	}
};