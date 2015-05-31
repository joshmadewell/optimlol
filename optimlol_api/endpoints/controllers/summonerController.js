module.exports = function() {
	var self = this;
	var _championStatsFacade = null;
	var _championDataFacade = null;
	var _recentMatchStatsFacade = null;

	var _perfomanceCalculator = require('../../common/utilities/performanceCalculator');

	var PromiseFactoryConstructor = require('../../common/utilities/promiseFactory');
	var _promiseFactory = new PromiseFactoryConstructor();

	var FinalSummonerObject = function() {
		this.quality = null;
		this.data = null;
		this.message = null;
	};

	var CurrentGameObject = function() {
		this.quality = null;
		this.data = null;
		this.message = null;
	};

	var _incrementLaneStats = function(laneStats, matchData, recentChamps, championInfo) {
		var lane = matchData.lane;
		var role = "";
		switch (lane) {
			case "TOP":
				role = "TOP";
				break;
			case "MID":
			case "MIDDLE":
				role = "MIDDLE";
				break;
			case "BOT":
			case "BOTTOM":
				if (role === 'DUO_SUPPORT') {
					role = "SUPPORT";
				} else if (role === 'DUO_CARRY') {
					role = "MARKSMAN";
				} else {
					role = championInfo.tags.indexOf("Marksman") === -1 ? "SUPPORT" : "MARKSMAN";
				}
				break;
			case "JUNGLE":
				role = "JUNGLE";
				break;
		}

		laneStats[role].total++;
		if (matchData.winner) {
			laneStats[role].wins++;
		} else {
			laneStats[role].losses++;
		}

		var idToString = matchData.championId.toString();
		if (recentChamps[idToString].roles) {
			if (recentChamps[idToString].roles.indexOf(role) === -1) {
				recentChamps[idToString].roles.push(role);
			}
		} else {
			recentChamps[idToString].roles = [role];
		}

		laneStats[role].performance = _perfomanceCalculator.calculate(laneStats[role].wins, laneStats[role].losses, {confidence: 1.00});
	};

	var _generatePerformanceData = function(region, finalSummoner) {
		var summoner = finalSummoner.data;
		var promiseObject = {
			STATS_INDEX: 0,
			RECENT_STATS_INDEX: 1,
			LEAGUE_INFO_INDEX: 2,
			CHAMPIONS_INDEX: 3,
			PRMOMISES: [
				_rankedStatsFacade.getRankedStats(region, summoner.id),
				_recentMatchStatsFacade.getRecentStats(region, summoner.id, "SOLO"),
				_leagueDataFacade.getLeagueData(region, summoner.id),
				_championDataFacade.getChampionData(region)
			]
		};

		return _promiseFactory.defer(function(deferredObject) {
			var responseObject = new FinalSummonerObject();
			_promiseFactory.wait(promiseObject.PRMOMISES)
				.then(function(results) {
					var championStats = results[promiseObject.STATS_INDEX].state === 'fulfilled' ? results[promiseObject.STATS_INDEX].value : null;
					var recentHistoryStats = results[promiseObject.RECENT_STATS_INDEX].state === 'fulfilled' ? results[promiseObject.RECENT_STATS_INDEX].value : null;
					var leagueInfo = results[promiseObject.LEAGUE_INFO_INDEX].state === 'fulfilled' ? results[promiseObject.LEAGUE_INFO_INDEX].value : null;
					var champions = results[promiseObject.CHAMPIONS_INDEX].state === 'fulfilled' ? results[promiseObject.CHAMPIONS_INDEX].value : null;

					responseObject.quality = 'fresh';
					results.forEach(function(result) {
						if (result.state === 'fulfilled') {
							if (result.value.quality && result.value.quality === 'stale') {
								responseObject.quality = responseObject.quality === 'unknown' ? 'unknown' : 'stale';
							} else if (result.value.quality && result.value.quality === 'unknown') {
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
							summoner.totalStats.percentage = ((summoner.totalStats.wins / (summoner.totalStats.wins + summoner.totalStats.losses)) * 100).toFixed(1);
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

							_incrementLaneStats(laneStats, recentMatchStats, recentChamps, champions.data.data[championIdString]);
						});

						recentHistoryObject.champions = recentChampionsArray;
						recentHistoryObject.laneStats = laneStats;
						summoner.recentHistory = recentHistoryObject;
					}

					if (leagueInfo.data && leagueInfo.data.entries) {
						summoner.leagueData = {};
						summoner.leagueData.tier = leagueInfo.data.tier;
						summoner.leagueData.division = leagueInfo.data.entries.division;
						summoner.leagueData.leaguePoints = leagueInfo.data.entries.leaguePoints;
						summoner.leagueData.isFreshBlood = leagueInfo.data.entries.isFreshBlood;
						summoner.leagueData.isVeteran = leagueInfo.data.entries.isVeteran;
						summoner.leagueData.isHotStreak = leagueInfo.data.entries.isHotStreak;
						summoner.leagueData.miniSeries = leagueInfo.data.entries.miniSeries;
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
		return _promiseFactory.defer(function(deferredObject) {
			var finalSummoner = new FinalSummonerObject();
			_summonerFacade.verifySummoner(region, summonerName)
				.then(function(verifiedSummoner) {
					finalSummoner.data = verifiedSummoner.summoner;
					if (verifiedSummoner.verified) {
						_generatePerformanceData(region, finalSummoner)
							.then(function(summonerWithPerformanceData) {
								deferredObject.resolve(summonerWithPerformanceData);
							})
							.fail(function(error) {
								deferredObject.reject(error);
							});
					} else {
						deferredObject.resolve(finalSummoner);
					}
				})
				.fail(function(error) {
					deferredObject.reject(error);
				});
		});
	};

	self.getCurrentGameData = function(region, summonerId) {
		return _promiseFactory.defer(function(deferredObject) {
			var currentGame = new CurrentGameObject();
			_currentGameFacade.getCurrentGameData(region, summonerId)
				.then(function(currentGameData) {
					currentGame.data = currentGameData.data;
					currentGame.quality = currentGameData.quality;
					deferredObject.resolve(currentGame);
				})
				.fail(function(error) {
					deferredObject.reject(error);
				});
		});
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

		var LeagueDataFacadeConstructor = require('../facades/leagueDataFacade');
		_leagueDataFacade = new LeagueDataFacadeConstructor();
		_leagueDataFacade.init();

		var ChampionDataFacadeConstructor = require('../facades/championDataFacade');
		_championDataFacade = new ChampionDataFacadeConstructor();
		_championDataFacade.init();

		var CurrentGameFacadeConstructor = require('../facades/currentGameFacade');
		_currentGameFacade = new CurrentGameFacadeConstructor();
		_currentGameFacade.init();
	}
};