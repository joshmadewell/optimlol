var _summonerDataProvider = null;

var PromiseFactoryConstructor = require('../../common/utilities/promiseFactory');
var _promiseFactory = new PromiseFactoryConstructor();

var _verifySummoner = function(region, summonerName) {
	return _promiseFactory.defer(function(deferredObject) {
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
				
				deferredObject.resolve(summonerVerificationObject);
			})
			.fail(function(error) {
				deferredObject.reject(summonerVerificationObject);
			});
	});
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