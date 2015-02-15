var q = require('q');
var _currentGameDataProvider = null;

var _getCurrentGameData = function(region, summonerId) {
	var deferred = q.defer();
	_currentGameDataProvider.getCurrentGame(region, summonerId)
		.then(function(currentGameData) {
			console.log(currentGameData);
			deferred.resolve(currentGameData);
		})
		.then(function(error) {
			deferred.reject(error);
		});

	return deferred.promise;
}

var _init = function() {
	var CurrentGameDataProviderConstructor = require('../../persistence/dataProviders/currentGameDataProvider');
	_currentGameDataProvider = new CurrentGameDataProviderConstructor();
	_currentGameDataProvider.init();
}

module.exports = function() {
	var self = this;
	self.init = _init;
	self.getCurrentGameData = _getCurrentGameData;
}