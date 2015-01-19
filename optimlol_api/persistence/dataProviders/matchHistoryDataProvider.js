var q = require('q');

module.exports = function() {
	var self = this;
	var _apiVersion = null;
	var _riotApi = null;

	self.getRankedMatchHistory = function(region, summonerId) {
		var matchHitoryPath = region + "/" + _apiVersion + "/stats/by-summoner/" + summonerId + "/ranked";
		
		var deferred = q.defer();
		_riotApi.makeRequest(matchHitoryPath)
			.then(function(matchHistoryResult) {
				
				deferred.resolve();
			})
			.fail(function(error) {
				deferred.reject(error);
			});

		return deferred.promise;
	}

	self.init = function() {
		var config = require('../../config');
		_apiVersion = config.riot_api.versions.matchHistory;

		var RiotApi = require('../../common/riotApi');
		_riotApi = new RiotApi();
		_riotApi.init();
	}
};