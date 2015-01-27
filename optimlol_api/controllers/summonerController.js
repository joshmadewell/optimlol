var q = require('q');

module.exports = function() {
	var self = this;
	var _summonerDataProvider = null;
	var _statsDataProvider = null;

	var _verifySummoner = function(region, summonerName) {
		var deferred = q.defer();
		_summonerDataProvider.getSummonerByName(region, summonerName)
			.then(function(summonerResult) {
				var resolvedObject = {
					verified: false,
					summoner: {}
				}

				if (summonerResult.length === 0) {
					deferred.resolve(resolvedObject);
				} else {
					var summonerExists = false;
					for(var x = 0; x < summonerResult.length; x++) {
						if (summonerResult[x].queriedName === summonerName.replace(/ /g, '').toLowerCase()) {
							resolvedObject.verified = true;
							resolvedObject.summoner = summonerResult[x];
						}
					}

					deferred.resolve(resolvedObject);
				}
			})
			.fail(function(error) {
				deferred.reject(resolvedObject);
			});

		return deferred.promise;
	};

	var _getStats = function(region, summonerId) {
		var deferred = q.defer();
		_statsDataProvider.getRankedStats(region, summonerId)
			.then(function(championStats) {
				deferred.resolve(championStats.data);
			})
			.fail(function(error) {
				deferred.reject(error);
			});

		return deferred.promise;
	};

	var _getRecentStats = function(region, summonerId, type) {
		var deferred = q.defer();
		_matchHistoryDataProvider.getMatchHistory(region, summonerId, type)
			.then(function(matchHistory) {
				var recentStats = {
					laneStats: { BOTTOM: 0, MIDDLE: 0, TOP: 0, JUNGLE: 0 },
					champions: {},
					matches: []
				};
				if (matchHistory.success && matchHistory.data) {
					matchHistory.data.matches.forEach(function(match) {
						var participants = match.participants[0];
						if (recentStats.champions[participants.championId] === undefined) {
							recentStats.champions[participants.championId] = {};
							recentStats.champions[participants.championId].lanes = [participants.timeline.lane]
							recentStats.champions[participants.championId].count = 1;
							recentStats.champions[participants.championId].kills = participants.stats.kills;
							recentStats.champions[participants.championId].deaths = participants.stats.deaths;
							recentStats.champions[participants.championId].assists = participants.stats.assists;

							if (participants.stats.winner) {
								recentStats.champions[participants.championId].wins = 1;
								recentStats.champions[participants.championId].losses = 0;
							} else {
								recentStats.champions[participants.championId].wins = 0;
								recentStats.champions[participants.championId].losses = 1;
							}
						} else {
							recentStats.champions[participants.championId].count++;
							recentStats.champions[participants.championId].kills += participants.stats.kills;
							recentStats.champions[participants.championId].deaths += participants.stats.deaths;
							recentStats.champions[participants.championId].assists += participants.stats.assists;

							if (participants.stats.winner) {
								recentStats.champions[participants.championId].wins++;
							} else {
								recentStats.champions[participants.championId].losses++;
							}

							if (recentStats.champions[participants.championId].lanes.indexOf(participants.timeline.lane) === -1) {
								recentStats.champions[participants.championId].lanes.push(participants.timeline.lane);
							}
						}
						var optimlolMatchHistoryObject = {};
						optimlolMatchHistoryObject.matchCreation = match.matchCreation;
						recentStats.laneStats[participants.timeline.lane]++;
						optimlolMatchHistoryObject.role = participants.timeline.lane;
						optimlolMatchHistoryObject.championId = participants.championId;
						optimlolMatchHistoryObject.winner = participants.stats.winner;
						optimlolMatchHistoryObject.kills = participants.stats.kills;
						optimlolMatchHistoryObject.deaths =participants.stats.deaths;
						optimlolMatchHistoryObject.assists = participants.stats.assists;
						optimlolMatchHistoryObject.champLevel = participants.stats.champLevel;
						recentStats.matches.push(optimlolMatchHistoryObject);
					});

					deferred.resolve(recentStats);
				} else {
					deferred.resolve(null);
				}
			})
			.fail(function(error) {
				deferred.resolve(null);
			});

		return deferred.promise;
	};

	var _generatePerformanceData = function(region, summoner) {
		var promiseObject = {
			STATS_INDEX: 0,
			RECENT_STATS_INDEX: 1,
			CHAMPIONS_INDEX: 2,
			PRMOMISES: [
				_getStats(region, summoner.id),
				_getRecentStats(region, summoner.id, "SOLO"),
				_staticDataProvider.getStaticData(region, 'champions')
			]
		};

		var deferred = q.defer();
		q.allSettled(promiseObject.PRMOMISES)
			.then(function(results) {
				var championStats = results[promiseObject.STATS_INDEX].state === 'fulfilled' ? results[promiseObject.STATS_INDEX].value : null;
				var recentHistoryStats = results[promiseObject.RECENT_STATS_INDEX].state === 'fulfilled' ? results[promiseObject.RECENT_STATS_INDEX].value : null;
				var champions = results[promiseObject.CHAMPIONS_INDEX].state === 'fulfilled' ? results[promiseObject.CHAMPIONS_INDEX].value : null;
				
				summoner.championStats = null;
				summoner.recentHistory = null;

				if (championStats) {
					var allIndex = null;
					championStats.champions.forEach(function(championStat, index) {
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
						summoner.totalStats = championStats.champions.splice(allIndex, 1);
					}

					summoner.championStats = championStats.champions;
				}

				if (recentHistoryStats) {
					var recentChampionsArray = [];
					for(var champion in recentHistoryStats.champions) {
						recentHistoryStats.champions[champion].id = champion;
						recentHistoryStats.champions[champion].championKey = champions.data.data[champion].key.toLowerCase();
						recentHistoryStats.champions[champion].championName = champions.data.data[champion].name;

						recentChampionsArray.push(recentHistoryStats.champions[champion]);
					}

					recentHistoryStats.matches.forEach(function(recentGameStat) {
						var championIdString = recentGameStat.championId.toString();
						recentGameStat.championKey = champions.data.data[championIdString].key.toLowerCase();
						recentGameStat.championName = champions.data.data[championIdString].name;
					});

					recentHistoryStats.champions = recentChampionsArray;
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
		_verifySummoner(region, summonerName)
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
		var SummonerDataProvider = require('../persistence/dataProviders/summonerDataProvider');
		_summonerDataProvider = new SummonerDataProvider();
		_summonerDataProvider.init();

		var StatsDataProvider = require('../persistence/dataProviders/statsDataProvider');
		_statsDataProvider = new StatsDataProvider();
		_statsDataProvider.init();

		var StaticDataProvider = require('../persistence/dataProviders/staticDataProvider');
		_staticDataProvider = new StaticDataProvider();
		_staticDataProvider.init();

		var MatchHistoryDataProvider = require('../persistence/dataProviders/matchHistoryDataProvider');
		_matchHistoryDataProvider = new MatchHistoryDataProvider();
		_matchHistoryDataProvider.init();
	}
};