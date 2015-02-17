var q = require('q')
var _summonerDataProvider = null;

var _verifySummoner = function(region, summonerName) {
	var deferred = q.defer();
	var summonerVerificationObject = { verified: false, summoner: {} };

	_dataProvider.getData('summoner', {region: region, summonerName: summonerName})
		.then(function(summonerResult) {
			var summonersArray = [];

			for (var property in summonerResult.data) {
				summonerResult.data[property].queriedName = property;
				summonersArray.push(summonerResult.data[property]);
			}

			if (summonersArray.length) {
				var summonerObject = summonersArray[0];
				var uniqueName = summonerName.replace(/ /g, '').toLowerCase();
				if (summonerObject.queriedName === uniqueName) {
					summonerVerificationObject.verified = true;
					summonerVerificationObject.summoner = summonersArray[0];
				}
			}
			
			deferred.resolve(summonerVerificationObject);
		})
		.fail(function(error) {
			deferred.reject(summonerVerificationObject);
		});

	return deferred.promise;
}

var _init = function() {
	var DataProviderConstructor = require('../../persistence/dataProvider');
	_dataProvider = new DataProviderConstructor();
	_dataProvider.init();
}

module.exports = function() {
	var self = this;
	self.init = _init;
	self.verifySummoner = _verifySummoner;
}