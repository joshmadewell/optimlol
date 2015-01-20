var q = require('q');

module.exports = function() {
	var self = this;
	var _apiVersion = null;
	var _riotApi = null;
	var _mongoCache = null;

	var _calculatePerformance = function(wins, losses) {
		var n = wins + losses;
		var phat = wins / n;
		var z = 1.28; // 80% confidence
		var modifier = .0009*n; //custom modifier to pad scores.

		return phat + z*z/(2*n) - z * Math.sqrt((phat*(1-phat)+z*z/(4*n))/n)/(1+z*z/n) + modifier;
	};

	var _prepareStats = function(stats) {
		var optimlolChampions = [];
		stats.data.champions.forEach(function(champion) {
			var optimlolChampion = {};
			optimlolChampion.id = champion.id;
			optimlolChampion.wins = champion.totalSessionsWon;
			optimlolChampion.losses = champion.totalSessionsLost;
			optimlolChampion.kills = champion.totalChampionKills;
			optimlolChampion.deaths = champion.totalDeathsPerSession;
			optimlolChampion.assists = champion.totalAssists;
			optimlolChampion.kda = (champion.totalChampionKills + champion.totalAssists) / champion.totalDeathsPerSession;
			optimlolChampion.gamesPlayed = champion.totalSessionsPlayed;
			optimlolChampion.performance = _calculatePerformance(champion.totalSessionsWon, champion.totalSessionsLost);
			optimlolChampions.push(optimlolChampion);
		});

		stats.data.champions = optimlolChampions;
	};

	var _getStatsApi = function(region, summonerId, deferred) {
		var statsPath = region + "/" + _apiVersion + "/stats/by-summoner/" + summonerId + "/ranked";
		_riotApi.makeRequest(statsPath)
			.then(function(statsResult) {
				_mongoCache.set('stats', {region: region, summonerId: summonerId})
					.then(function() {
						deffered.resolve(_prepareStats(statsResult));
					})
					.fail(function(error) {
						_logger.warn("Some failure when setting cache", error);
						deferred.resolve(_prepareStats(statsResult));
					})
			})
			.fail(function(error) {
				deffered.reject(error);
			});
	};

	self.getRankedStats = function(region, summonerId) {
		var deffered = q.defer();
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

		return deffered.promise;
	}

	self.init = function() {
		var _config = require('../../config');
		_apiVersion = _config.riot_api.versions.stats;

		var MongoCache = require('../../common/mongoCache');
		_mongoCache = new MongoCache();

		var RiotApi = require('../../common/riotApi');
		_riotApi = new RiotApi();
		_riotApi.init();
	}
};