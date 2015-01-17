var q = require('q');

var RiotApi = require('../common/riotApi');
var riotApi = new RiotApi();

var config = require('../config');
var apiVersion = config.riot_api.versions.summoners;

module.exports = function() {
	var self = this;

	self.getSummonerByName = function(region, summonerName) {
		var championsPath = region + "/" + apiVersion + "/summoner/by-name/" + summonerName;
		var deffered = q.defer();

		riotApi.makeRequest(championsPath)
			.then(function(result) {
				console.log(result);
				deffered.resolve(result);
			})
			.fail(function(error) {
				deffered.reject(error);
			});

		return deffered.promise;
	}
};