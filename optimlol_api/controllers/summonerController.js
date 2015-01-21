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
		var promises = [
			_statsDataProvider.getRankedStats(region, summonerId),
			_staticDataProvider.getStaticData(region, 'champions')
		];
		var deferred = q.defer();
		q.allSettled(promises)
			.then(function(results) {
				console.log("donsies!!!");
				var championStats = results[0].value;
				championStats.data.champions.forEach(function(championStat) {
					// something is breaking here :/
					championStat.championName = results[1].value.data.data[championStat.id.toString()].name;
				});

				console.log(championStats, "pew pew");
				deferred.resolve(championStats);
			})
			.fail(function(error) {
				deferred.reject(error);
			});

		return deferred.promise;
	};

	var _getMatchHistory = function(region, summonerId, championId) {

	};

	var _generatePerformanceData = function(region, summoner) {
		var deferred = q.defer();
		_getStats(region, summoner.id)
			.then(function(championStats) {
				summoner.championStats = championStats.data;
				deferred.resolve(summoner);
			})
			.fail(function(error) {
				deferred.reject(error);
			});

		return deferred.promise;
		// var promises = [_getStats(region, summoner.id), _getMatchHistory(region, summoner.id)];
		// var deferred = q.defer();
		// q.allSettled(promises)
		// 	.then(function(results) {
		// 	})
		// 	.fail(function(error) {
		// 		deferred.reject(error);
		// 	})
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
	}
};