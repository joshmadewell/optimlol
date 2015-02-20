var request = require('request');

module.exports = function() {
	var self = this;
	var _config = null;
	var _logger = null;
	var _apiStatus = null;

	var PromiseFactoryConstructor = require('../utilities/promiseFactory');
	var _promiseFactory = new PromiseFactoryConstructor();

	var RiotApiResponseObject = function() {
		this.success = null;
		this.statusCode = null;
		this.data = null;
	}

	var _setResponseObject = function(responseObject, jsonResponse) {
		_logger.riotApi("Riot:", jsonResponse.statusCode);

		responseObject.statusCode = jsonResponse.statusCode;

		switch (jsonResponse.statusCode) {
			case 200:
				responseObject.success = true;
				responseObject.data = jsonResponse.body;
				break;
			case 404:
				// riot uses 404 to tell us some things weren't found
				// rather than just the url wasn't found....:(
				responseObject.success = true;
				responseObject.data = null;
				break;
			case 401:
			case 429:
			case 500:
			case 503:
				responseObject.success = false;
				responseObject.data = null;
				break;
			default:
				responseObject.success = false;
				responseObject.data = null;
		}
	}

	self.makeRequest = function(region, path) {
		return _promiseFactory.defer(function(deferredObject) {
			var responseObject = new RiotApiResponseObject();
			var apiKeyPrefix = path.indexOf('?') !== -1 ? "&api_key=" : "?api_key=";
			var fullUrl = _config.riot_api.url_prefix + region + _config.riot_api.url_midfix + path + apiKeyPrefix + process.env.RIOT_API_KEY;
			request.get({url: fullUrl, json: true}, function(error, result) {
				if (error) {
					deferredObject.reject(error);
				} else {
					_setResponseObject(responseObject, result.toJSON());
					deferredObject.resolve(responseObject);
				}
			});
		});
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