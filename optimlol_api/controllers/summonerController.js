var q = require('q');

var SummonerDataProvider = require('../dataProviders/summonerDataProvider');
var summonerDataProvider = new SummonerDataProvider();

module.exports = function() {
	var self = this;

	self.verifySummoner = function(summonerName) {
		var deferred = q.defer();
		summonerDataProvider.getSummonerByName()
			.then(function(summonerResult) {
				// check if summoner result is goodsies...
			})
			.fail(function(error) {

			});

		return deferred.promise;
	};
};