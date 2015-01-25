var q = require('q');

module.exports = function() {
	var self = this;
	var _apiVersion = null;
	var _riotApi = null;
	var _mongoCache = null;
	var _logger = null;

	var MATCH_HISTORY_TYPES = {
		"solo": "RANKED_SOLO_5x5",
		"team": "RANKED_TEAM_5x5",
		"tri": "RANKED_TEAM_3x3"
	};

	var _getMatchHistoryApi = function(region, summonerId, type, deferred) {
		var rankedMatchHitoryPath = region + "/" + _apiVersion + "/matchhistory/" + summonerId + "?rankedQueues=" + MATCH_HISTORY_TYPES[type];
		
		_riotApi.makeRequest(rankedMatchHitoryPath)
			.then(function(matchHistoryResult) {
				_mongoCache.set('matchHistory', { region: region, summonerId: summonerId, type: MATCH_HISTORY_TYPES[type] }, matchHistoryResult.data)
					.then(function() {
						deferred.resolve(matchHistoryResult);
					})
					.fail(function() {
						// if setting cache fails, don't worry, move on.
						deferred.resolve(matchHistoryResult);
					});
			})
			.fail(function(error) {
				deferred.reject(error);
			});
	}

	self.getMatchHistory = function(region, summonerId, type) {
		_logger.debug("Getting ranked match history data", summonerId, MATCH_HISTORY_TYPES[type]);
		var deferred = q.defer();
		_mongoCache.get('matchHistory', {region: region, summonerId: summonerId, type: MATCH_HISTORY_TYPES[type]})
			.then(function(cachedMatchHistory) {
				if (cachedMatchHistory.data !== null) {
					_logger.debug("Using cached match history data");
					deferred.resolve(cachedMatchHistory);
				} else {
					_getMatchHistoryApi(region, summonerId, type, deferred);
				}
			})
			.fail(function(error) {
				_getMatchHistoryApi(region, summonerId, type, deferred);
			});

		return deferred.promise;
	};

	self.init = function() {
		var config = require('../../config');
		_apiVersion = config.riot_api.versions.matchHistory;

		var MongoCache = require('../../common/mongoCache');
		_mongoCache = new MongoCache();

		var Logger = require('../../common/logger');
		_logger = new Logger();

		var RiotApi = require('../../common/riotApi');
		_riotApi = new RiotApi();
		_riotApi.init();
	}
};