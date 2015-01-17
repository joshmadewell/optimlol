var q = require('q');

module.exports = function() {
	var self = this;
	var _summonerDataProvider = null;

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
						if (summonerResult[x].queriedName === summonerName) {
							resolvedObject.verified = true;
							resolvedObject.summoner = summonerResult[x];
						}
					}

					console.log(resolvedObject);
					deferred.resolve(resolvedObject);
				}
			})
			.fail(function(error) {
				deferred.reject(resolvedObject);
			});

		return deferred.promise;
	};

	self.generateSummonerData = function(region, summonerName) {
		var deferred = q.defer();
		_verifySummoner(region, summonerName)
			.then(function(verifiedSummoner) {
				if (verifiedSummoner.verified) {
					deferred.resolve(verifiedSummoner);
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
		var SummonerDataProvider = require('../dataProviders/summonerDataProvider');
		_summonerDataProvider = new SummonerDataProvider();
		_summonerDataProvider.init();
	}
};