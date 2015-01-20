var q = require('q');
var moment = require('moment');

module.exports = function() {
	var self = this;
	var _logger = null;
	var _summonerCacheController = null;
	var _apiVersion = null;
	var _riotApi = null;
	var _config = null;

	var _prepareSummoner =function(summoner) {
		var returnedSummoner = [];
		for(var property in summoner.data) {
			summoner.data[property].queriedName = property;
			returnedSummoner.push(summoner.data[property]);
		}

		return returnedSummoner;
	}

	var _getSummonerByNameApi = function(region, summonerName, deferred) {
		var championsPath = region + "/" + _apiVersion + "/summoner/by-name/" + summonerName;
		_riotApi.makeRequest(championsPath)
			.then(function(summonerResult) {
				_mongoCache.set('summoners', {region: region, summonerName: summonerName}, summonerResult.data)
					.then(function() {
						deferred.resolve(_prepareSummoner(summonerResult));
					})
					.fail(function() {
						// if setting cache fails, don't worry, move on.
						deferred.resolve(_prepareSummoner(summonerResult));
					});
			})
			.fail(function(error) {
				deferred.reject(error);
			});
	};

	self.getSummonerByName = function(region, summonerName) {
		var now = moment();
		var deferred = q.defer();
		_logger.debug("Getting summoner by name", summonerName);
		_mongoCache.get('summoners', {region: region, summonerName: summonerName})
			.then(function(cacheSummonerResult) {
				if(cacheSummonerResult.data !== null) {
					_logger.debug("Using cached summoner.");
					deferred.resolve(_prepareSummoner(cacheSummonerResult));
				} else {
					_getSummonerByNameApi(region, summonerName, deferred);
				}
			})
			.fail(function(error) {
				_logger.warn("Some failure when setting cache", error);
				_getSummonerByNameApi(region, summonerName, deferred);
			});

		return deferred.promise;
	}

	self.init = function() {
		_config = require('../../config');
		_apiVersion = _config.riot_api.versions.summoners;

		var MongoCache = require('../../common/mongoCache');
		_mongoCache = new MongoCache();

		var Logger = require('../../common/logger');
		_logger = new Logger();

		var RiotApi = require('../../common/riotApi');
		_riotApi = new RiotApi();
		_riotApi.init();
	}
};