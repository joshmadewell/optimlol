var _parameterValidator = require('../../common/utilities/parameterValidator');

var PromiseFactoryConstructor = require('../../common/utilities/promiseFactory');
var _promiseFactory = new PromiseFactoryConstructor();

function MatchListDataProvider () {
	var self = this;
	var _apiVersion = null;
	var _mongoCache = null;
	var _logger = null;
	var _riotApi = null;

	var REQUIRED_PARAMETERS = ['region', 'summonerId', 'type'];

	self.getFromApi = function (parameters) {
		if (_parameterValidator.validate(parameters, REQUIRED_PARAMETERS) === false) {
			throw new Error('Invalid parameters for Match List Data Provider');
		}

		return _promiseFactory.defer(function (deferredObject) {
			_logger.debug('matchList data provider, getFromApi');
			var matchListPath = parameters.region + '/' + _apiVersion + '/matchlist/by-summoner/' + parameters.summonerId;
			_riotApi.makeRequest(parameters.region, matchListPath)
				.then(function (matchListResult) {
					_mongoCache.set('matchList', parameters, matchListResult)
						.then(function () {
							deferredObject.resolve(matchListResult);
						})
						.fail(function (error) {
							_logger.warn('Some failure when setting leagues cache', error);
							deferredObject.resolve(matchListResult);
						});
				})
				.fail(function (error) {
					deferredObject.reject(error);
				});
		});
	};

	self.getFromCache = function (parameters) {
		if (_parameterValidator.validate(parameters, REQUIRED_PARAMETERS) === false) {
			throw new Error('Invalid parameters for Match List Data Provider');
		}

		return _promiseFactory.defer(function (deferredObject) {
			_logger.debug('matchList data provider, getFromCache', parameters);
			_mongoCache.get('matchList', parameters)
				.then(function (matchListCacheResult) {
					deferredObject.resolve(matchListCacheResult);
				})
				.fail(function (error) {
					deferredObject.reject(error);
				});
		});
	};

	self.init = function () {
		var _config = require('../../config');
		_apiVersion = _config.riot_api.versions.matchList;

		var LoggerConstructor = require('../../common/logging/logger');
		_logger = new LoggerConstructor();

		var MongoCacheConstructor = require('../../common/mongo/mongoCache');
		_mongoCache = new MongoCacheConstructor();

		var RiotApiConstructor = require('../../common/riotApi/riotApi');
		_riotApi = new RiotApiConstructor();
		_riotApi.init();

	};
}

module.exports = MatchListDataProvider;
