var q = require('q')
var _summonerDataProvider = null;

var _getSummoner = function(region, summonerName) {
	var deferred = q.defer();
	_summonerDataProvider.getSummonerByName(region, summonerName)
		.then(function(summonerResult) {
			console.log("_getSummoner");
			deferred.resolve(summonerResult);
		})
		.fail(function(error) {
			deferred.reject(error);
		});

	return deferred.promise;
};

var _verifySummoner = function(region, summonerName) {
	var deferred = q.defer();
	var summonerVerificationObject = { verified: false, summoner: {} };

	_getSummoner(region, summonerName)
		.then(function(summonerResult) {
			console.log(summonerResult);
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

				console.log(summonerVerificationObject);
				deferred.resolve(summonerVerificationObject);
			}
		})
		.fail(function(error) {
			deferred.reject(summonerVerificationObject);
		});

	return deferred.promise;
}

var _init = function() {
	var SummonerDataProvider = require('../../persistence/dataProviders/summonerDataProvider');
	_summonerDataProvider = new SummonerDataProvider();
	_summonerDataProvider.init();
}

module.exports = function() {
	var self = this;
	self.init = _init;
	self.verifySummoner = _verifySummoner;
}