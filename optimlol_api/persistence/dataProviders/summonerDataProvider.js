var q = require('q');
var moment = require('moment');

module.exports = function() {
	var self = this;
	var _logger = null;
	var _mongoCache = null;
	var _apiVersion = null;
	var _riotApi = null;

	var _getSummonerByNameApi = function(region, summonerName, deferred) {
		var summonersPath = "api/lol/" + region + "/" + _apiVersion + "/summoner/by-name/" + summonerName;
		_riotApi.makeRequest(region, summonersPath)
			.then(function(summonerResult) {
				_mongoCache.set('summoners', {region: region, summonerName: summonerName}, summonerResult)
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
	};

	var _getSummonerByIdApi = function(region, summonerId, deferred) {
		var summonersPath = "api/lol/" + region + "/" + _apiVersion + "/summoner/" + summonerId;
		_riotApi.makeRequest(region, summonersPath)
			.then(function(summonerResult) {
				// we have to set with summoner name because that's how
				// we saved before adding the verify by id methods...
				if (summonerResult.data) {
					var dataToSave = {};
					var summonerName = summonerResult.data[summonerId.toString()].name;
					var queriedName = summonerName.replace(/ /g, '').toLowerCase();
					dataToSave[queriedName] = summonerResult.data[summonerId.toString()];
					summonerResult.data = dataToSave;

					_mongoCache.set('summoners', {region: region, summonerName: summonerName}, summonerResult)
						.then(function() {
							deferred.resolve(summonerResult);
						})
						.fail(function() {
							// if setting cache fails, don't worry, move on.
							deferred.resolve(summonerResult);
						});
				}
			})
			.fail(function(error) {
				deferred.reject(error);
			});
	};

	self.getSummonerById = function(region, summonerId) {
		var deferred = q.defer();
		_logger.debug("Getting summoner by id", summonerId);
		_mongoCache.get('summoners', {region: region, summonerId: summonerId})
			.then(function(cacheSummonerResult) {
				if(cacheSummonerResult.isExpired === false) {
					_logger.debug("Using cached summoner.", cacheSummonerResult);
					deferred.resolve(cacheSummonerResult);
				} else {
					_getSummonerByIdApi(region, summonerId, deferred);
				}
			})
			.fail(function(error) {
				_logger.warn("Some failure when setting summoner cache", error);
				_getSummonerByIdApi(region, summonerId, deferred);
			});

		return deferred.promise;
	};

	self.getSummonerByName = function(region, summonerName) {
		var deferred = q.defer();
		_logger.debug("Getting summoner by name", summonerName);
		_mongoCache.get('summoners', {region: region, summonerName: summonerName})
			.then(function(cacheSummonerResult) {
				if(cacheSummonerResult.isExpired === false) {
					_logger.debug("Using cached summoner.", cacheSummonerResult);
					deferred.resolve(cacheSummonerResult);
				} else {
					_getSummonerByNameApi(region, summonerName, deferred);
				}
			})
			.fail(function(error) {
				_logger.warn("Some failure when setting summoner cache", error);
				_getSummonerByNameApi(region, summonerName, deferred);
			});

		return deferred.promise;
	}

	self.init = function() {
		var config = require('../../config');
		_apiVersion = config.riot_api.versions.summoners;

		var MongoCacheConstructor = require('../../common/mongoCache');
		_mongoCache = new MongoCacheConstructor();

		var LoggerConstructor = require('../../common/logger');
		_logger = new LoggerConstructor();

		var RiotApiConstructor = require('../../common/riotApi');
		_riotApi = new RiotApiConstructor();
		_riotApi.init();
	}
};