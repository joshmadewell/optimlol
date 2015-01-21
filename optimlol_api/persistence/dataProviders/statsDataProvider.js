var q = require('q');

module.exports = function() {
	var self = this;
	var _apiVersion = null;
	var _riotApi = null;
	var _mongoCache = null;
	var _logger = null;

	var _calculatePerformance = function(wins, losses) {
		var n = wins + losses;
		var phat = wins / n;
		var z = 1.28; // 80% confidence
		//var modifier = .0009*n; //custom modifier to pad scores.

		var performance = (phat + z*z/(2*n) - z * Math.sqrt((phat*(1-phat)+z*z/(4*n))/n))/(1+z*z/n)// + modifier;
		return performance.toFixed(2)/1;
	};

	var _prepareStats = function(stats) {
		if (stats.data) {
			var optimlolChampions = [];
			stats.data.champions.forEach(function(champion) {
				var optimlolChampion = {};
				optimlolChampion.id = champion.id;
				optimlolChampion.wins = champion.stats.totalSessionsWon;
				optimlolChampion.losses = champion.stats.totalSessionsLost;
				optimlolChampion.kills = champion.stats.totalChampionKills;
				optimlolChampion.deaths = champion.stats.totalDeathsPerSession;
				optimlolChampion.assists = champion.stats.totalAssists;
				optimlolChampion.kda = (champion.stats.totalChampionKills + champion.stats.totalAssists) / champion.stats.totalDeathsPerSession;
				optimlolChampion.gamesPlayed = champion.stats.totalSessionsPlayed;
				optimlolChampion.performance = _calculatePerformance(champion.stats.totalSessionsWon, champion.stats.totalSessionsLost);
				optimlolChampions.push(optimlolChampion);
			});

			stats.data.champions = optimlolChampions;
		}

		return stats;
	};

	var _getStatsApi = function(region, summonerId, deferred) {
		var statsPath = region + "/" + _apiVersion + "/stats/by-summoner/" + summonerId + "/ranked";
		_riotApi.makeRequest(statsPath)
			.then(function(statsResult) {
				_mongoCache.set('stats', {region: region, summonerId: summonerId}, statsResult.data)
					.then(function() {
						deferred.resolve(_prepareStats(statsResult));
					})
					.fail(function(error) {
						_logger.warn("Some failure when setting cache", error);
						deferred.resolve(_prepareStats(statsResult));
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
				if (cacheStatsResult.data !== null) {
					_logger.debug("Using cached stats.");
					deferred.resolve(_prepareStats(cacheStatsResult));
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

		var Logger = require('../../common/logger');
		_logger = new Logger();

		var MongoCache = require('../../common/mongoCache');
		_mongoCache = new MongoCache();

		var RiotApi = require('../../common/riotApi');
		_riotApi = new RiotApi();
		_riotApi.init();
	}
};