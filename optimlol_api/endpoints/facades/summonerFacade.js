var q = require('q')
var _summonerDataProvider = null;

var _verifySummoner = function(summonerObject) {
	var summonerVerificationObject = { verified: false, summoner: {} };
	var summonersArray = [];
	var expectedResultFromRiot = summonerName.replace(/ /g, '').toLowerCase();

	for (var property in summonerResult.data) {
		summonerResult.data[property].queriedName = property;
		summonersArray.push(summonerResult.data[property]);
	}

	if (summonersArray.length > 0) {
		var summonerExists = false;
		for(var x = 0; x < summonersArray.length; x++) {
			if (summonersArray[x].queriedName === expectedResultFromRiot) {
				summonerVerificationObject.verified = true;
				summonerVerificationObject.summoner = summonersArray[x];
			}
		}
	}

	return summonerVerificationObject;
};

var _verifySummonerById = function(region, summonerId) {
	var deferred = q.defer();

	_summonerDataProvider.getSummonerById(region, summonerId)
		.then(function(summonerResult) {
			_verifySummoner(summonerResult);
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
			_verifySummoner(summonerResult);
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