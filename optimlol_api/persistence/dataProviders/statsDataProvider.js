var q = require('q');

module.exports = function() {
	var self = this;
	var _apiVersion = null;
	var _riotApi = null;
	var _mongoCache = null;
	var _logger = null;
	var _performanceCalculator = require('../../common/performanceCalculator');


	var _getStatsApi = function(region, summonerId, deferred) {
		var statsPath = region + "/" + _apiVersion + "/stats/by-summoner/" + summonerId + "/ranked";
		_riotApi.makeRequest(region, statsPath)
			.then(function(statsResult) {
				_mongoCache.set('stats', {region: region, summonerId: summonerId}, statsResult)
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
	};

	self.getRankedStats = function(region, summonerId) {
		var deferred = q.defer();
		_mongoCache.get('stats', {region: region, summonerId: summonerId})
			.then(function(cacheStatsResult) {
				if (cacheStatsResult.isExpired === false) {
					_logger.debug("Using cached stats.");
					deferred.resolve(cacheStatsResult);
				} else {
					_getStatsApi(region, summonerId, deferred);
				}
			})
			.fail(function(cacheResult) {
				_getStatsApi(region, summonerId, deferred);
			})

		return deferred.promise;
	}

	self.init = function() {
		var _config = require('../../config');
		_apiVersion = _config.riot_api.versions.stats;

		var LoggerConstructor = require('../../common/logger');
		_logger = new LoggerConstructor();

		var MongoCacheConstructor = require('../../common/mongoCache');
		_mongoCache = new MongoCacheConstructor();

		var RiotApiConstructor = require('../../common/riotApi');
		_riotApi = new RiotApiConstructor();
		_riotApi.init();
	}
};