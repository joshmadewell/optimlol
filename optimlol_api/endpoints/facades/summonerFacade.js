var q = require('q')
var _summonerDataProvider = null;

var _verifySummoner = function(summonerObject) {
	var summonerVerificationObject = { verified: false, summoner: {} };
	var summonersArray = [];

	for (var property in summonerObject.data) {
		summonerObject.data[property].queriedName = property;
		summonersArray.push(summonerObject.data[property]);
	}

	if (summonersArray.length > 0) {
		summonerVerificationObject.verified = true;
		summonerVerificationObject.summoner = summonersArray[0];
	}

	return summonerVerificationObject;
};

var _verifySummonerById = function(region, summonerId) {
	var deferred = q.defer();

	_summonerDataProvider.getSummonerById(region, summonerId)
		.then(function(summonerResult) {
			deferred.resolve(_verifySummoner(summonerResult));
		})
		.fail(function(error) {
			deferred.reject(error);
		});

	return deferred.promise;
};

var _verifySummonerByName = function(region, summonerName) {
	var deferred = q.defer();

	_summonerDataProvider.getSummonerByName(region, summonerName)
		.then(function(summonerResult) {
			deferred.resolve(_verifySummoner(summonerResult));
		})
		.fail(function(error) {
			deferred.reject(error);
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
	self.verifySummonerById = _verifySummonerById;
	self.verifySummonerByName = _verifySummonerByName;
}