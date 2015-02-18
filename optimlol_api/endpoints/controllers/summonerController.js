var q = require('q');

module.exports = function() {
	var self = this;
	var _championStatsFacade = null;
	var _championDataFacade = null;
	var _recentMatchStatsFacade = null;

	var _perfomanceCalculator = require('../../common/utilities/performanceCalculator');

	var PromiseFactoryConstructor = require('../../common/utilities/promiseFactory');
	var _promiseFactory = new PromiseFactoryConstructor();

	var SummonerWithPerformanceDataResponseObject = function() {
		this.quality = null;
		this.data = null;
		this.message = null;
	}

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
				_rankedStatsFacade.getRankedStats(region, summoner.id),
				_recentMatchStatsFacade.getRecentStats(region, summoner.id, "SOLO"),
				_championDataFacade.getChampionData(region)
			]
		};

		return _promiseFactory.defer(function(deferredObject) {
			var responseObject = new SummonerWithPerformanceDataResponseObject();
			_promiseFactory.wait(promiseObject.PRMOMISES)
				.then(function(results) {
					var championStats = results[promiseObject.STATS_INDEX].state === 'fulfilled' ? results[promiseObject.STATS_INDEX].value : null;
					var recentHistoryStats = results[promiseObject.RECENT_STATS_INDEX].state === 'fulfilled' ? results[promiseObject.RECENT_STATS_INDEX].value : null;
					var champions = results[promiseObject.CHAMPIONS_INDEX].state === 'fulfilled' ? results[promiseObject.CHAMPIONS_INDEX].value : null;

					responseObject.quality = 'fresh';
					results.forEach(function(result) {
						var worstQuality = null;
						if (result.state === 'fulfilled') {
							if (result.value.quality && result.value.quality === 'stale') {
								resonseObject.quality = responseObject.quality === 'unknown' ? 'unknown' : 'stale';
							} else if (result.value.quality && result.value.quality === 'unkown') {
								responseObject.quality = 'unknown';
							}
						}
					});

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

					if (recentHistoryStats.data) {
						var recentHistoryObject = {};
						var recentChampionsArray = [];
						var laneStats = {
							MARKSMAN: {wins: 0, losses: 0, total: 0},
							SUPPORT: {wins: 0, losses: 0, total: 0},
							MIDDLE: {wins: 0, losses: 0, total: 0},
							TOP: {wins: 0, losses: 0, total: 0},
							JUNGLE: {wins: 0, losses: 0, total: 0}
						};

						var recentChamps = recentHistoryStats.data.champions;
						for(var champion in recentChamps) {
							recentChamps[champion].id = champion;
							recentChamps[champion].championKey = champions.data.data[champion].key.toLowerCase();
							recentChamps[champion].championName = champions.data.data[champion].name;
							recentChampionsArray.push(recentChamps[champion]);
						}

						var recentMatches = recentHistoryStats.data.matches;
						recentMatches.forEach(function(recentMatchStats) {
							var championIdString = recentMatchStats.championId.toString();
							recentMatchStats.championKey = champions.data.data[championIdString].key.toLowerCase();
							recentMatchStats.championName = champions.data.data[championIdString].name;

							_incrementLaneStats(laneStats, recentMatchStats, champions.data.data[championIdString]);
						});

						recentHistoryObject.champions = recentChampionsArray;
						recentHistoryObject.laneStats = laneStats;
						summoner.recentHistory = recentHistoryObject;
					}

					responseObject.data = summoner;

					deferredObject.resolve(responseObject);
				})
				.fail(function(error) {
					deferredObject.reject(error);
				});
		});
	};

	self.generateSummonerData = function(region, summonerName) {
		var deferred = q.defer();
		_summonerFacade.verifySummoner(region, summonerName)
			.then(function(verifiedSummoner) {
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

	self.init = function() {
		var SummonerFacadeConstuctor = require('../facades/summonerFacade');
		_summonerFacade = new SummonerFacadeConstuctor();
		_summonerFacade.init();

		var RankedStatsFacadeConstructor = require('../facades/rankedStatsFacade');
		_rankedStatsFacade = new RankedStatsFacadeConstructor();
		_rankedStatsFacade.init();

		var RecentMatchStatsFacadeConstructor = require('../facades/recentMatchStatsFacade');
		_recentMatchStatsFacade = new RecentMatchStatsFacadeConstructor();
		_recentMatchStatsFacade.init();

		var ChampionDataFacadeConstructor = require('../facades/championDataFacade');
		_championDataFacade = new ChampionDataFacadeConstructor();
		_championDataFacade.init();
	}
};