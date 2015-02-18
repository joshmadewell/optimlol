var _dataProvider = null;

var PromiseFactoryConstructor = require('../../common/utilities/promiseFactory');
var _promiseFactory = new PromiseFactoryConstructor();

var _getChampionData = function(region) {
	return _promiseFactory.defer(function(deferredObject) {
		_dataProvider.getData('static', {region: region, staticType: 'champions'})
			.then(function(championData) {
				deferredObject.resolve(championData);
			})
			.then(function(error) {
				deferredObject.reject(error);
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
	self.getChampionData = _getChampionData;
}