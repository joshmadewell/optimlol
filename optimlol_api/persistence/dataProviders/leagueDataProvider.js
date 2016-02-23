module.exports = function () {
	var self = this;
	var _apiVersion = null;
	var _riotApi = null;
	var _mongoCache = null;
	var _logger = null;

	var REQUIRED_PARAMETERS = ['region', 'summonerId'];
	var _parameterValidator = require('../../common/utilities/parameterValidator');

	var PromiseFactoryConstructor = require('../../common/utilities/promiseFactory');
	var _promiseFactory = new PromiseFactoryConstructor();

	self.getFromApi = function (parameters) {
		if (_parameterValidator.validate(parameters, REQUIRED_PARAMETERS) === false) {
			throw new Error('Invalid parameters for League Data Provider');
		}

		return _promiseFactory.defer(function (deferredObject) {
			_logger.debug('league data provider, getFromApi');
			var leaguePath = parameters.region + '/' + _apiVersion + '/league/by-summoner/' + parameters.summonerId;
			_riotApi.makeRequest(parameters.region, leaguePath)
				.then(function (leagueResult) {
					if (leagueResult.data) {
						var summonerEntry = leagueResult.data[parameters.summonerId][0].entries.filter(function (entry) {
							return parseInt(entry.playerOrTeamId) === parseInt(parameters.summonerId);
						});
						leagueResult.data[parameters.summonerId][0].entries = summonerEntry[0];
						leagueResult.data = leagueResult.data[parameters.summonerId][0];
					}

					_mongoCache.set('league', parameters, leagueResult)
						.then(function () {
							deferredObject.resolve(leagueResult);
						})
						.fail(function (error) {
							_logger.warn('Some failure when setting leagues cache', error);
							deferredObject.resolve(leagueResult);
						});
				})
				.fail(function (error) {
					deferredObject.reject(error);
				});
		});
	};

	self.getFromCache = function (parameters) {
		if (_parameterValidator.validate(parameters, REQUIRED_PARAMETERS) === false) {
			throw new Error('Invalid parameters for League Data Provider');
		}

		return _promiseFactory.defer(function (deferredObject) {
			_logger.debug('league data provider, getFromCache', parameters);
			_mongoCache.get('league', parameters)
				.then(function (cacheLeagueResult) {
					deferredObject.resolve(cacheLeagueResult);
				})
				.fail(function (error) {
					deferredObject.reject(error);
				});
		});
	};

	self.init = function () {
		var _config = require('../../config');
		_apiVersion = _config.riot_api.versions.leagues;

		var LoggerConstructor = require('../../common/logging/logger');
		_logger = new LoggerConstructor();

		var MongoCacheConstructor = require('../../common/mongo/mongoCache');
		_mongoCache = new MongoCacheConstructor();

		var RiotApiConstructor = require('../../common/riotApi/riotApi');
		_riotApi = new RiotApiConstructor();
		_riotApi.init();
	};
};
