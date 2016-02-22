module.exports = function() {
	var self = this;
	var _config = null;
	var _apiVersion = null;
	var _riotApi = null;
	var _mongoCache = null;
	var _logger = null;

	var _parameterValidator = require('../../common/utilities/parameterValidator');
	var _sorter = require('../../common/utilities/sorter');

	var PromiseFactoryConstructor = require('../../common/utilities/promiseFactory');
	var _promiseFactory = new PromiseFactoryConstructor();

	var MATCH_HISTORY_TYPES = { SOLO: "RANKED_SOLO_5x5", FIVES: "RANKED_TEAM_5x5", THREES: "RANKED_TEAM_3x3" };
	var REQUIRED_PARAMETERS = ['region', 'summonerId', 'type'];
	var LOOKBACK_GAMES_COUNT = 30;

	self.getFromApi = function(parameters) {
		if (_parameterValidator.validate(parameters, REQUIRED_PARAMETERS) === false) {
			throw new Error("Invalid parameters for Match History Data Provider");
		}

		return _promiseFactory.defer(function(deferredObject) {
			_logger.debug("match history data provider, getFromApi");
			var matchHistoryLookBackCount = _config.optimlol_api.matchHistoryLookBackCount;
			var maxMatchHistoryGamesCount = _config.riot_api.maxMatchHistoryGamesCount;
			var matchHistoryPath = parameters.region + "/" + _apiVersion + "/matchhistory/" + parameters.summonerId + "?rankedQueues=" + MATCH_HISTORY_TYPES[parameters.type];
			var promises = [];
			for(var x = 0; x < matchHistoryLookBackCount/maxMatchHistoryGamesCount; x++) {
				var beginIndex = x * maxMatchHistoryGamesCount;
				var endIndex = beginIndex + maxMatchHistoryGamesCount;
				var requestPath = matchHistoryPath + "&beginIndex=" + beginIndex + "&endIndex=" + endIndex;
				promises.push(_riotApi.makeRequest(parameters.region, requestPath));
			}

			_promiseFactory.wait(promises)
				.then(function(results) {
					var dataProviderResult = null;

					results.forEach(function(matchHistoryApiResult) {
						if (matchHistoryApiResult.state === 'fulfilled') {
							var currentMatchHistorySet = matchHistoryApiResult.value;
							var deleteHistory = [];
							if (currentMatchHistorySet.data && currentMatchHistorySet.data.matches) {
								// this result is freaking massive, we need to remove the un-needed data...
								currentMatchHistorySet.data.matches.forEach(function(match, index) {
									delete match.participantIdentities;
									delete match.participants[0].runes;
									delete match.participants[0].participantId;
									delete match.participants[0].masteries;

									if (match.participants[0].timeline) {
										var lane = match.participants[0].timeline.lane;
										var role = match.participants[0].timeline.role;

										match.participants[0].timeline = {};
										match.participants[0].timeline.lane = lane;
										match.participants[0].timeline.role = role;
									}
								});

								if (dataProviderResult) {
									dataProviderResult.data.matches = dataProviderResult.data.matches.concat(currentMatchHistorySet.data.matches);
								} else {
									dataProviderResult = currentMatchHistorySet;
								}
							} else if (dataProviderResult === null) {
								dataProviderResult = currentMatchHistorySet;
							}
						}
					});

					_mongoCache.set('matchHistory', parameters, dataProviderResult)
						.then(function() {
							deferredObject.resolve(dataProviderResult);
						})
						.fail(function(error) {
							_logger.warn("Some error when setting Match History Cache", error);
							deferredObject.resolve(dataProviderResult);
						});
				})
				.fail(function(error) {
					deferredObject.reject(error);
				});
		});
	};

	self.getFromCache = function(parameters) {
		if (_parameterValidator.validate(parameters, REQUIRED_PARAMETERS) === false) {
			throw new Error("Invalid parameters for Match History Data Provider");
		}

		return _promiseFactory.defer(function(deferredObject) {
			_logger.debug("match history data provider, getFromCache");
			_mongoCache.get('matchHistory', parameters)
				.then(function(cachedMatchHistory) {
					deferredObject.resolve(cachedMatchHistory);
				})
				.fail(function(error) {
					deferredObject.reject(error);
				});
		});
	};

	self.init = function() {
		_config = require('../../config');
		_apiVersion = _config.riot_api.versions.matchHistory;

		var MongoCacheConstructor = require('../../common/mongo/mongoCache');
		_mongoCache = new MongoCacheConstructor();

		var LoggerConstructor = require('../../common/logging/logger');
		_logger = new LoggerConstructor();

		var RiotApiConstructor = require('../../common/riotApi/riotApi');
		_riotApi = new RiotApiConstructor();
		_riotApi.init();
	};
};
