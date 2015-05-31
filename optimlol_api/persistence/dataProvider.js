var PromiseFactoryConstructor = require('../common/utilities/promiseFactory');
var _promiseFactory = new PromiseFactoryConstructor();

var _dataProviders = {
	matchHistory: null,
	static: null,
	rankedStats: null,
	summoner: null,
	league: null,
	currentGame: null
};

var QUALITY_TYPES = {
	STALE: 'stale',
	FRESH: 'fresh',
	UNKNOWN: 'unknown'
};

var DataProviderResponseObject = function() {
	this.success = null;
	this.quality = null;
	this.message = null;
	this.data = null;
};

var _getData = function(dataProvider, parameters) {
	return _promiseFactory.defer(function(deferredObject) {
		var dataResponse = new DataProviderResponseObject();

		if (_dataProviders[dataProvider].hasCache === true) {
			_logger.debug("Attempting to get " + dataProvider + " data from cache");
			_dataProviders[dataProvider].getFromCache(parameters)
				.then(function(cachedData) {
					if (cachedData.isExpired === true || cachedData.isExpired === null) {
						_logger.info(dataProvider + " data expired, or unset, attempting to refresh", parameters);
						_dataProviders[dataProvider].getFromApi(parameters)
							.then(function(apiData) {
								_logger.riotApi(dataProvider + " RiotApi: ", apiData.statusCode);
								if (apiData.success) {
									dataResponse.success = true;
									dataResponse.quality = QUALITY_TYPES.FRESH;
									dataResponse.data = apiData.data;
								} else if (cachedData.data) {
									dataResponse.success = true;
									dataResponse.quality = QUALITY_TYPES.STALE;
									dataResponse.data = cachedData.data;
								} else {
									dataResponse.success = false;
									dataResponse.quality = QUALITY_TYPES.UNKNOWN;
									dataResponse.message = "Failed retrieving data from Riot";
								}

								deferredObject.resolve(dataResponse);
							})
							.fail(function(error) {
								if (cachedData.data) {
									dataResponse.success = true;
									dataResponse.quality = QUALITY_TYPES.STALE;
									dataResponse.data = cachedData.data;
									deferredObject.resolve(dataResponse);
								} else {
									deferredObject.reject(error);
								}
							});
					} else {
						dataResponse.success = true;
						dataResponse.quality = QUALITY_TYPES.FRESH;
						dataResponse.data = cachedData.data;

						deferredObject.resolve(dataResponse);
					}
				})
				.fail(function(error) {
					_dataProviders[dataProvider].getFromApi(dataProvider, parameters)
						.then(function(apiData) {
							if (apiData.success) {
								dataResponse.success = true;
								dataResponse.quality = QUALITY_TYPES.FRESH;
								dataResponse.data = apiData.data;
								deferredObject.resolve(dataResponse);
							} else {
								deferredObject.reject(error);
							}
						})
						.fail(function(error) {
							deferredObject.reject(error);
						});
				});
		} else {
			_logger.debug("Attempting to get " + dataProvider + " data from API");
			_dataProviders[dataProvider].getFromApi(parameters)
				.then(function(apiData) {
					_logger.riotApi(dataProvider + " RiotApi: ", apiData.statusCode);
					if (apiData.success) {
						dataResponse.success = true;
						dataResponse.quality = QUALITY_TYPES.FRESH;
						dataResponse.data = apiData.data;
					} else {
						dataResponse.success = false;
						dataResponse.quality = QUALITY_TYPES.UNKNOWN;
						dataResponse.message = "Failed retrieving data from Riot";
					}

					deferredObject.resolve(dataResponse);
				})
				.fail(function(error) {
					deferredObject.reject(error);
				});
		}
	});
}

var _init = function() {
	var MatchHistoryDataProvider = require('./dataProviders/matchHistoryDataProvider');
	_dataProviders.matchHistory = new MatchHistoryDataProvider();
	_dataProviders.matchHistory.init();

	var StaticDataProvider = require('./dataProviders/staticDataProvider');
	_dataProviders.static = new StaticDataProvider();
	_dataProviders.static.init();

	var LeagueDataProvider = require('./dataProviders/leagueDataProvider');
	_dataProviders.league = new LeagueDataProvider();
	_dataProviders.league.init();

	var RankedStatsDataProvider = require('./dataProviders/rankedStatsDataProvider');
	_dataProviders.rankedStats = new RankedStatsDataProvider();
	_dataProviders.rankedStats.init();

	var SummonerDataProvider = require('./dataProviders/summonerDataProvider');
	_dataProviders.summoner = new SummonerDataProvider();
	_dataProviders.summoner.init();

	var CurrentGameDataProvider = require('./dataProviders/currentGameDataProvider');
	_dataProviders.currentGame = new CurrentGameDataProvider();
	_dataProviders.currentGame.init();
}

module.exports = function() {
	var self = this;
	self.init = _init;
	self.getData  = _getData;
}