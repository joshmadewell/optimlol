var q = require('q');

module.exports = function() {
	var self = this;
	var _apiVersion = null;
	var _riotApi = null;
	var _mongoCache = null;
	var _logger = null;

	var REQUIRED_PARAMETERS = ['region', 'summonerId'];
	var _parameterValidator = require('../../common/utilities/parameterValidator');

	var PromiseFactoryConstructor = require('../../common/utilities/promiseFactory');
	var _promiseFactory = new PromiseFactoryConstructor();

	self.getFromApi = function(parameters) {
		if (_parameterValidator.validate(parameters, REQUIRED_PARAMETERS) === false) {
			throw new Error("Invalid parameters for Stats Data Provider"); 
		}

		return _promiseFactory.defer(function(deferredObject) {
			var statsPath = parameters.region + "/" + _apiVersion + "/stats/by-summoner/" + parameters.summonerId + "/ranked";
			_riotApi.makeRequest(region, statsPath)
				.then(function(statsResult) {
					_mongoCache.set('stats', parameters, statsResult)
						.then(function() {
							deferred.resolve(statsResult);
						})
						.fail(function(error) {
							_logger.warn("Some failure when setting stats cache", error);
							deferred.resolve(statsResult);
						})
				})
				.fail(function(error) {
					deferred.reject(error);
				});
		});
	};

	self.getFromCache = function(parameters) {
		if (_parameterValidator.validate(parameters, REQUIRED_PARAMETERS) === false) {
			throw new Error("Invalid parameters for Stats Data Provider"); 
		}

		return _promiseFactory.defer(function(deferredObject) {
			_mongoCache.get('stats', parameters)
				.then(function(cacheStatsResult) {
					deferredObject.resolve(cacheStatsResult);
				})
				.fail(function(error) {
					deferredObject.reject(error);
				})
		});
	};

	self.init = function() {
		var _config = require('../../config');
		_apiVersion = _config.riot_api.versions.stats;

		var LoggerConstructor = require('../../common/logging/logger');
		_logger = new LoggerConstructor();

		var MongoCacheConstructor = require('../../common/mongo/mongoCache');
		_mongoCache = new MongoCacheConstructor();

		var RiotApiConstructor = require('../../common/riotApi/riotApi');
		_riotApi = new RiotApiConstructor();
		_riotApi.init();
	}
};