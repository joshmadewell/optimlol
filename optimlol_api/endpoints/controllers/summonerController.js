var q = require('q');

module.exports = function() {
	var self = this;
	var _championStatsFacade = null;
	var _championDataFacade = null;
	var _recentMatchStatsFacade = null;
	var _perfomanceCalculator = require('../../common/performanceCalculator');

	var _incrementLaneStats = function(recentStats, matchData, champion) {
		var role = matchData.role;
		if (role === "BOTTOM") {
			role = champion.tags.indexOf("Marksman") === -1 ? "SUPPORT" : "MARKSMAN";
		}

		recentStats[role].total++;
		if (matchData.winner) {
			recentStats[role].wins++;
		} else {
			recentStats[role].losses++;
		}

		recentStats[role].performance = _perfomanceCalculator.calculate(recentStats[role].wins, recentStats[role].losses, {confidence: 1.00});
	};

	var _generatePerformanceData = function(region, summoner) {
		var promiseObject = {
			STATS_INDEX: 0,
			RECENT_STATS_INDEX: 1,
			CHAMPIONS_INDEX: 2,
			PRMOMISES: [
				_championStatsFacade.getRankedStats(region, summoner.id),
				_recentMatchStatsFacade.getRecentStats(region, summoner.id, "SOLO"),
				_championDataFacade.getChampionData(region)
			]
		};

		var deferred = q.defer();
		q.allSettled(promiseObject.PRMOMISES)
			.then(function(results) {
				// var perfomanceData = { quality: null, data: summoner }
				var championStats = results[promiseObject.STATS_INDEX].state === 'fulfilled' ? results[promiseObject.STATS_INDEX].value : null;
				var recentHistoryStats = results[promiseObject.RECENT_STATS_INDEX].state === 'fulfilled' ? results[promiseObject.RECENT_STATS_INDEX].value : null;
				var champions = results[promiseObject.CHAMPIONS_INDEX].state === 'fulfilled' ? results[promiseObject.CHAMPIONS_INDEX].value : null;

				// check champion stats & recent history stats here
				// to see if the quality flag is stale or not and set
				// performanceData.quality accordingly
				// performanceData.quality = 'idk';

				// shouldn't have to say performanceData.data.championStats because yavascript
				summoner.championStats = null;
				summoner.recentHistory = null;

				if (championStats.data) {
					var allIndex = null;
					championStats.data.champions.forEach(function(championStat, index) {
						// we get data back with string id's le sigh....
						var championIdString = championStat.id.toString();
						if (championIdString !== "0") {
							championStat.championKey = champions.data.data[championIdString].key.toLowerCase();
							championStat.championName = champions.data.data[championIdString].name;
						} else {
							allIndex = index;
							championStat.championName = "All";
						}
					});

					if (allIndex) {
						summoner.totalStats = championStats.data.champions.splice(allIndex, 1)[0];
					}

					summoner.championStats = championStats.data.champions;
				}

				if (recentHistoryStats) {
					var recentChampionsArray = [];
					var laneStats = {
						MARKSMAN: {wins: 0, losses: 0, total: 0},
						SUPPORT: {wins: 0, losses: 0, total: 0},
						MIDDLE: {wins: 0, losses: 0, total: 0},
						TOP: {wins: 0, losses: 0, total: 0},
						JUNGLE: {wins: 0, losses: 0, total: 0}
					};

					var recentChamps = recentHistoryStats.champions;
					for(var champion in recentChamps) {
						recentChamps[champion].id = champion;
						recentChamps[champion].championKey = champions.data.data[champion].key.toLowerCase();
						recentChamps[champion].championName = champions.data.data[champion].name;
						recentChampionsArray.push(recentChamps[champion]);
					}

					var recentMatches = recentHistoryStats.matches;
					recentMatches.forEach(function(recentMatchStats) {
						var championIdString = recentMatchStats.championId.toString();
						recentMatchStats.championKey = champions.data.data[championIdString].key.toLowerCase();
						recentMatchStats.championName = champions.data.data[championIdString].name;

						_incrementLaneStats(laneStats, recentMatchStats, champions.data.data[championIdString]);
					});

					recentHistoryStats.champions = recentChampionsArray;
					recentHistoryStats.laneStats = laneStats;
					summoner.recentHistory = recentHistoryStats;
				}

				deferred.resolve(summoner);
			})
			.fail(function(error) {
				deferred.reject(error);
			});

		return deferred.promise;
	};

	self.generateSummonerData = function(region, summonerName) {
		var deferred = q.defer();
		_summonerFacade.verifySummoner(region, summonerName)
			.then(function(verifiedSummoner) {
				console.log("verifiedSummoner", verifiedSummoner);
				if (verifiedSummoner.verified) {
					_generatePerformanceData(region, verifiedSummoner.summoner)
						.then(function(summonerWithPerformanceData) {
							deferred.resolve(summonerWithPerformanceData);
						})
						.fail(function(error) {
							deferred.reject(error);
						});
				} else {
					deferred.resolve(verifiedSummoner);
				}
			})
			.fail(function(error) {
				deferred.reject(error);
			});

		return deferred.promise;
	};

	self.getCurrentGameData = function(region, summonerName) {
		var deferred = q.defer();
		_summonerFacade.verifySummoner(region, summonerName)
			.then(function(verifiedSummoner) {
				if (verifiedSummoner.verified) {
					_currentGameFacade.getCurrentGameData(region, verifiedSummoner.summoner.id)
						.then(function(currentGameData) {
							deferred.resolve(currentGameData);
						})
						.fail(function(error) {
							deferred.reject(error);
						})
				} else {
					deferred.resolve(verifiedSummoner);
				}
			})
			.fail(function(error) {
				deferred.reject(error);
			});

		return deferred.promise;
	};

	self.init = function() {
		var SummonerFacadeConstuctor = require('../facades/summonerFacade');
		_summonerFacade = new SummonerFacadeConstuctor();
		_summonerFacade.init();

		var ChampionStatsFacadeConstructor = require('../facades/championStatsFacade');
		_championStatsFacade = new ChampionStatsFacadeConstructor();
		_championStatsFacade.init();

		var RecentMatchStatsFacadeConstructor = require('../facades/recentMatchStatsFacade');
		_recentMatchStatsFacade = new RecentMatchStatsFacadeConstructor();
		_recentMatchStatsFacade.init();

		var ChampionDataFacadeConstructor = require('../facades/championDataFacade');
		_championDataFacade = new ChampionDataFacadeConstructor();
		_championDataFacade.init();

		var CurrentGameFacadeConstructor = require('../facades/currentGameFacade');
		_currentGameFacade = new CurrentGameFacadeConstructor();
		_currentGameFacade.init();
	}
};