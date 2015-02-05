var q = require('q');
var _staticDataProvider = null;

var _getChampionData = function(region) {
	var deferred = q.defer();
	_staticDataProvider.getStaticData(region, 'champions')
		.then(function(championData) {
			deferred.resolve(championData);
		})
		.then(function(error) {
			deferred.reject(error);
		});

	return deferred.promise;
}

var _init = function() {
	var StaticDataProviderConstructor = require('../../persistence/dataProviders/staticDataProvider');
	_staticDataProvider = new StaticDataProviderConstructor();
	_staticDataProvider.init();
}

module.exports = function() {
	var self = this;
	self.init = _init;
	self.getChampionData = _getChampionData;
}