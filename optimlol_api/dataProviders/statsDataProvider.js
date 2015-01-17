var q = require('q');

module.exports = function() {
	var self = this;
	var _apiVersion = null;
	var _riotApi = null;

	self.getRankedStats = function(region, summonerId) {
		console.log("test");
		var statsPath = region + "/" + _apiVersion + "/stats/by-summoner/" + summonerId + "/ranked";
		
		console.log(statsPath);
		var deffered = q.defer();
		_riotApi.makeRequest(statsPath)
			.then(function(statsResult) {
				var optimlolChampions = [];
				statsResult.data.champions.forEach(function(champion) {
					var optimlolChampion = {};
					optimlolChampion.id = champion.id;
					optimlolChampion.kills = champion.totalChampionKills;
					optimlolChampion.deaths = champion.totalDeathsPerSession;
					optimlolChampion.assists = champion.totalAssists;
					optimlolChampion.kda = (champion.totalChampionKills + champion.totalAssists) / champion.totalDeathsPerSession;
					optimlolChampion.gamesPlayed = champion.totalSessionsPlayed;

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