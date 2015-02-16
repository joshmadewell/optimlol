var q = require('q');

module.exports = function() {
	var self = this;
	var _config = null;
	var _apiVersion = null;
	var _riotApi = null;
	var _mongoCache = null;
	var _logger = null;

	self.getCurrentGame = function(region, summonerId) {
		var platformId = _config.riot_api.platformIds[region.toLowerCase()];
		var currentGamePath = "observer-mode/rest/consumer/getSpectatorGameInfo/" + platformId + "/" + summonerId;

		var deferred = q.defer();
		_riotApi.makeRequest(region, currentGamePath)
			.then(function(currentGameData) {
				deferred.resolve(currentGameData);
			})
			.fail(function(error) {
				deferred.reject(error);
			});

		return deferred.promise;
	}

	self.init = function() {
		_config = require('../../config');

		var LoggerConstructor = require('../../common/logger');
		_logger = new LoggerConstructor();

		var MongoCacheConstructor = require('../../common/mongoCache');
		_mongoCache = new MongoCacheConstructor();

		var RiotApiConstructor = require('../../common/riotApi');
		_riotApi = new RiotApiConstructor();
		_riotApi.init();
	}
};