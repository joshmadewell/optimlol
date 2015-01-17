var q = require('q');

module.exports = function() {
	var self = this;
	var _apiVersion = null;
	var _riotApi = null;

	self.getSummonerByName = function(region, summonerName) {
		var championsPath = region + "/" + _apiVersion + "/summoner/by-name/" + summonerName;
		
		var deffered = q.defer();
		_riotApi.makeRequest(championsPath)
			.then(function(summonerResult) {
				var returnedSummoner = [];
				for(var property in summonerResult.data) {
					summonerResult.data[property].queriedName = property;
					returnedSummoner.push(summonerResult.data[property]);
				}
				
				console.log(returnedSummoner);
				deffered.resolve(returnedSummoner);
			})
			.fail(function(error) {
				deffered.reject(error);
			});

		return deffered.promise;
	}

	self.init = function() {
		var _config = require('../config');
		_apiVersion = _config.riot_api.versions.summoners;

		var RiotApi = require('../common/riotApi');
		_riotApi = new RiotApi();
		_riotApi.init();
	}
};