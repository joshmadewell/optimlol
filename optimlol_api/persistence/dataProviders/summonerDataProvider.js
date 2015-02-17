var moment = require('moment');

module.exports = function() {
	var self = this;
	var _logger = null;
	var _mongoCache = null;
	var _apiVersion = null;
	var _riotApi = null;

	var REQUIRED_PARAMETERS = ['region', 'summonerName'];
	var _parameterValidator = require('../../common/utilities/parameterValidator');

	var PromiseFactoryConstructor = require('../../common/utilities/promiseFactory');
	var _promiseFactory = new PromiseFactoryConstructor();

	self.getFromApi = function(parameters) {
		if (_parameterValidator.validate(parameters, REQUIRED_PARAMETERS) === false) {
			throw new Error("Invalid parameters for Summoner Data Provider"); 
		} 

		return _promiseFactory.defer(function(deferredObject) {
			var championsPath = region + "/" + _apiVersion + "/summoner/by-name/" + parameters.summonerName;
			_riotApi.makeRequest(parameters.region, championsPath)
				.then(function(summonerResult) {
					_mongoCache.set('summoners', parameters, summonerResult)
						.then(function() {
							deferred.resolve(summonerResult);
						})
						.fail(function() {
							// if setting cache fails, don't worry, move on.
							deferred.resolve(summonerResult);
						});
				})
				.fail(function(error) {
					deferred.reject(error);
				});
		});
	};

	self.getFromCache = function(parameters) {
		if (_parameterValidator.validate(parameters, REQUIRED_PARAMETERS) === false) {
			throw new Error("Invalid parameters for Summoner Data Provider"); 
		} 

		return _promiseFactory.defer(function(deferredObject) {
			_logger.debug("Getting summoner by name", parameters);
			_mongoCache.get('summoners', parameters)
				.then(function(cacheSummonerResult) {
					deferredObject.resolve(cacheSummonerResult);
				})
				.fail(function(error) {
					deferredObject.reject(error);
				});
		});
	};

	self.init = function() {
		var config = require('../../config');
		_apiVersion = config.riot_api.versions.summoners;

		var MongoCacheConstructor = require('../../common/mongo/mongoCache');
		_mongoCache = new MongoCacheConstructor();

		var LoggerConstructor = require('../../common/logging/logger');
		_logger = new LoggerConstructor();

		var RiotApiConstructor = require('../../common/riotApi/riotApi');
		_riotApi = new RiotApiConstructor();
		_riotApi.init();
	}
};