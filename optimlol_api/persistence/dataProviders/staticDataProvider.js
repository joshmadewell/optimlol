var q = require('q');

var RiotApi = require('../../common/riotApi');
var riotApi = new RiotApi();

var config = require('../../config');
var apiVersion = config.riot_api.versions.staticData;

module.exports = function() {
	var self = this;

	self.getAllChampions = function(region) {
		var championsPath = "static-data/" + region + "/" + apiVersion + "/champion?dataById=true" + config.riot_api.api_key;
		var deffered = q.defer();

		riotApi.makeRequest(championsPath)
			.then(function(result) {
				deffered.resolve(result);
			})
			.fail(function(error) {
				deffered.reject(error);
			});

		return deffered.promise;
	}

	self.getChampionById = function(id, region) {
		var championsPath = "static-data/" + region + "/" + apiVersion + "/champion" + id + config.riot_api.api_key;
		var deffered = q.defer();

		riotApi.makeRequest(championsPath)
			.then(function(result) {
				deffered.resolve(result);
			})
			.fail(function(error) {
				deffered.reject(error);
			});

		return deffered.promise;
	}
};