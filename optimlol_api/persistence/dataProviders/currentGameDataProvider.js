var q = require('q');

module.exports = function() {
	var self = this;
	var _config = null;
	var _apiVersion = null;
	var _riotApi = null;
	var _mongoCache = null;
	var _logger = null;

	var _getCurrentGameApi = function(region, summonerId, deferred) {
		var platformId = _config.riot_api.platformIds[region.toLowerCase()];

		var currentGamePath = "observer-mode/rest/consumer/getSpectatorGameInfo/" + platformId + "/" + summonerId;

		_riotApi.makeRequest(region, currentGamePath)
			.then(function(currentGameData) {
				deferred.resolve(currentGameData);
			})
			.fail(function(error) {
				deferred.reject(error);
			});
	};

	self.getCurrentGame = function(region, summonerId) {
		var deferred = q.defer();
		console.log(region, summonerId);
		_getCurrentGameApi(region, summonerId, deferred)
		// _mongoCache.get('stats', {region: region, summonerId: summonerId})
		// 	.then(function(cacheStatsResult) {
		// 		if (cacheStatsResult.isExpired === false) {
		// 			_logger.debug("Using cached stats.");
		// 			deferred.resolve(cacheStatsResult);
		// 		} else {
		// 			_getCurrentGameApi(region, summonerId, deferred);
		// 		}
		// 	})
		// 	.fail(function(cacheResult) {
		// 		_getCurrentGameApi(region, summonerId, deferred);
		// 	})

		return deferred.promise;
	}

	self.init = function() {
		_config = require('../../config');

		var LoggerConstructor = require('../../common/logger');
		_logger = new LoggerConstructor();

		var MongoCacheConstructor = require('../../common/mongoCache');
		_mongoCache = new MongoCacheConstructor();

		var RiotApiConstructor = require('../../common/riotApi');
		_riotApi = new RiotApiConstructor();
		_riotApi.init();
	}
};