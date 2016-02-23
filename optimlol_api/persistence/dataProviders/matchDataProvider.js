var _parameterValidator = require('../../common/utilities/parameterValidator');

var PromiseFactoryConstructor = require('../../common/utilities/promiseFactory');
var _promiseFactory = new PromiseFactoryConstructor();

function MatchDataProvider () {
	var self = this;
	var _apiVersion = null;
	var _mongoCache = null;
	var _logger = null;
	var _riotApi = null;

	var REQUIRED_PARAMETERS = ['region', 'matchId', 'type'];

	self.getFromApi = function (parameters) {
		if (_parameterValidator.validate(parameters, REQUIRED_PARAMETERS) === false) {
			throw new Error('Invalid parameters for Match Data Provider');
		}

		return _promiseFactory.defer(function (deferredObject) {
			_logger.debug('match data provider, getFromApi');
			var matchPath = parameters.region + '/' + _apiVersion + '/match/' + parameters.matchId;
			_riotApi.makeRequest(parameters.region, matchPath)
				.then(function (matchResult) {
					if (matchResult.data) {
						var summonerEntry = matchResult.data[parameters.summonerId][0].entries.filter(function (entry) {
							return parseInt(entry.playerOrTeamId) === parseInt(parameters.summonerId);
						});
						matchResult.data[parameters.summonerId][0].entries = summonerEntry[0];
						matchResult.data = matchResult.data[parameters.summonerId][0];
					}

					_mongoCache.set('match', parameters, matchResult)
						.then(function () {
							deferredObject.resolve(matchResult);
						})
						.fail(function (error) {
							_logger.warn('Some failure when setting leagues cache', error);
							deferredObject.resolve(matchResult);
						});
				})
				.fail(function (error) {
					deferredObject.reject(error);
				});
		});
	};

	self.getFromCache = function (parameters) {
		if (_parameterValidator.validate(parameters, REQUIRED_PARAMETERS) === false) {
			throw new Error('Invalid parameters for Match Data Provider');
		}

		return _promiseFactory.defer(function (deferredObject) {
			_logger.debug('match data provider, getFromCache', parameters);
			_mongoCache.get('match', parameters)
				.then(function (matchCacheResult) {
					deferredObject.resolve(matchCacheResult);
				})
				.fail(function (error) {
					deferredObject.reject(error);
				});
		});
	};

	self.init = function () {
		var _config = require('../../config');
		_apiVersion = _config.riot_api.versions.match;

		var LoggerConstructor = require('../../common/logging/logger');
		_logger = new LoggerConstructor();

		var MongoCacheConstructor = require('../../common/mongo/mongoCache');
		_mongoCache = new MongoCacheConstructor();

		var RiotApiConstructor = require('../../common/riotApi/riotApi');
		_riotApi = new RiotApiConstructor();
		_riotApi.init();

	};
}

module.exports = MatchDataProvider;
