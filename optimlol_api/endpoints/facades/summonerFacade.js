var q = require('q')
var _summonerDataProvider = null;

var _verifySummoner = function(region, summonerName) {
	var deferred = q.defer();
	var summonerVerificationObject = { verified: false, summoner: {} };

	_summonerDataProvider.getSummonerByName(region, summonerName)
		.then(function(summonerResult) {
			var summonersArray = [];
			var expectedResultFromRiot = summonerName.replace(/ /g, '').toLowerCase();

			for (var property in summonerResult.data) {
				summonerResult.data[property].queriedName = property;
				summonersArray.push(summonerResult.data[property]);
			}

			if (summonersArray.length === 0) {
				deferred.resolve(summonerVerificationObject);
			} else {
				var summonerExists = false;
				for(var x = 0; x < summonersArray.length; x++) {
					if (summonersArray[x].queriedName === expectedResultFromRiot) {
						summonerVerificationObject.verified = true;
						summonerVerificationObject.summoner = summonersArray[x];
					}
				}

				deferred.resolve(summonerVerificationObject);
			}
		})
		.fail(function(error) {
			deferred.reject(summonerVerificationObject);
		});

	return deferred.promise;
}

var _init = function() {
	var SummonerDataProviderConstructor = require('../../persistence/dataProviders/summonerDataProvider');
	_summonerDataProvider = new SummonerDataProviderConstructor();
	_summonerDataProvider.init();
}

module.exports = function() {
	var self = this;
	self.init = _init;
	self.verifySummoner = _verifySummoner;
}