var _staticDataProvider = null;

var PromiseFactoryConstructor = require('../common/utilities/promiseFactory');
var _promiseFactory = new PromiseFactoryConstructor();

var _getChampionData = function(region) {
	return _promiseFactory.defer(function(deferredObject) {
		_staticDataProvider.getStaticData({region: region, staticType: 'champions'})
			.then(function(championData) {
				deferredObject.resolve(championData);
			})
			.then(function(error) {
				deferredObject.reject(error);
			});
	});
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