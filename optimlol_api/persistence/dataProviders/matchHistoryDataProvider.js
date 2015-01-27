var q = require('q');

module.exports = function() {
	var self = this;
	var _apiVersion = null;
	var _riotApi = null;
	var _mongoCache = null;
	var _logger = null;

	var _sorter = require('../../common/sorter');

	var MATCH_HISTORY_TYPES = {
		SOLO: "RANKED_SOLO_5x5",
		FIVES: "RANKED_TEAM_5x5",
		THREES: "RANKED_TEAM_3x3"
	};

	var _prepareMatchHistory = function(matchHistory) {
		_sorter.sort(matchHistory.data.matches, 'matchCreation', 'descending');
		return matchHistory;
	};

	var _getMatchHistoryApi = function(region, summonerId, type, deferred) {
		var matchHistoryPath = region + "/" + _apiVersion + "/matchhistory/" + summonerId + "?rankedQueues=" + MATCH_HISTORY_TYPES[type];
		var firstHalfMatchHistory = matchHistoryPath + "&beginIndex=0&endIndex=15";
		var secondHalfMatchHistory = matchHistoryPath + "&beginIndex=15&endIndex=30";
	
		var promises = [
			_riotApi.makeRequest(firstHalfMatchHistory),
			_riotApi.makeRequest(secondHalfMatchHistory)
		];

		q.allSettled(promises)
			.then(function(results) {
				var fullMatchHistory = {
					success: true,
					data: {
						matches: []
					}
				};

				var bothCallsSucceeded = null;
				results.forEach(function(matchHistory) {
					if (matchHistory.state === 'fulfilled') {
						if (matchHistory.success && bothCallsSucceeded === null) {
							bothCallsSucceeded = true;
						} else {
							bothCallsSucceeded = false;
						}

						if (matchHistory.value.data.matches) {
							fullMatchHistory.data.matches = fullMatchHistory.data.matches.concat(matchHistory.value.data.matches);
						}
					}
				});

				_mongoCache.set('matchHistory', { region: region, summonerId: summonerId, type: MATCH_HISTORY_TYPES[type] }, fullMatchHistory)
					.then(function() {
						deferred.resolve(fullMatchHistory);
					})
					.fail(function() {
						// if setting cache fails, don't worry, move on.
						deferred.resolve(fullMatchHistory);
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
				if (cachedMatchHistory.isExpired === false) {
					_logger.debug("Using cached match history data");
					deferred.resolve(_prepareMatchHistory(cachedMatchHistory));
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