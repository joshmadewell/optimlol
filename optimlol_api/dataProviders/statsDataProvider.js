var q = require('q');

module.exports = function() {
	var self = this;
	var _apiVersion = null;
	var _riotApi = null;

	var _calculatePerformance = function(wins, losses) {
		var n = wins + losses;
		var phat = wins / n;
		var z = 1.28; // 80% confidence
		var modifier = .0009*n; //custom modifier to pad scores.

		return phat + z*z/(2*n) - z * Math.sqrt((phat*(1-phat)+z*z/(4*n))/n))/(1+z*z/n) + modifier;
	};

	self.getRankedStats = function(region, summonerId) {
		var statsPath = region + "/" + _apiVersion + "/stats/by-summoner/" + summonerId + "/ranked";
		
		var deffered = q.defer();
		_riotApi.makeRequest(statsPath)
			.then(function(statsResult) {
				var optimlolChampions = [];
				statsResult.data.champions.forEach(function(champion) {
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

				statsResult.data.champions = optimlolChampions;
				deffered.resolve(statsResult);
			})
			.fail(function(error) {
				deffered.reject(error);
			});

		return deffered.promise;
	}

	self.init = function() {
		var _config = require('../config');
		_apiVersion = _config.riot_api.versions.stats;

		var RiotApi = require('../common/riotApi');
		_riotApi = new RiotApi();
		_riotApi.init();
	}
};