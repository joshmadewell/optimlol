var q = require('q');

var SummonerDataProvider = require('../dataProviders/summonerDataProvider');
var summonerDataProvider = new SummonerDataProvider();

module.exports = function() {
	var self = this;

	self.verifySummoner = function(region, summonerName) {
		var deferred = q.defer();
		summonerDataProvider.getSummonerByName(region, summonerName)
			.then(function(summonerResult) {
				var summonerResultToArray = [];
				for(var summoner in summonerResult.data) {
					summonerResult[summoner].queriedString = summoner;
					summonerResultToArray.push(summonerResult[summoner]);
				}

				console.log(summonerResultToArray);
				deferred.resolve(summonerResultToArray);
			})
			.fail(function(error) {
				deferred.reject(summonerResult);
			});

		return deferred.promise;
	};
};