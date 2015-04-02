var _dataProvider = null;

var PromiseFactoryConstructor = require('../../common/utilities/promiseFactory');
var _promiseFactory = new PromiseFactoryConstructor();

var _getLeagueData = function(region, summonerId) {
	return _promiseFactory.defer(function(deferredObject) {
		_dataProvider.getData('league', {region: region, summonerId: summonerId})
			.then(function(leagueInfo) {
				deferredObject.resolve(leagueInfo);
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
	self.getLeagueData = _getLeagueData;
}