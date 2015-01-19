var q = require('q');
var moment = require('moment');

module.exports = function() {
	var self = this;
	var _summonerCacheController = null;
	var _apiVersion = null;
	var _riotApi = null;
	var _config = null;

	var _prepareSummoner =function(summoner) {
		var returnedSummoner = [];
		for(var property in summoner.data) {
			summoner.data[property].queriedName = property;
			returnedSummoner.push(summoner.data[property]);
		}

		return returnedSummoner;
	}
					

	var _getSummonerByNameApi = function(region, summonerName) {
		var championsPath = region + "/" + _apiVersion + "/summoner/by-name/" + summonerName;
		
		var deferred = q.defer();
		_riotApi.makeRequest(championsPath)
			.then(function(summonerResult) {
				deferred.resolve(summonerResult);
			})
			.fail(function(error) {
				deferred.reject(error);
			});

		return deferred.promise;
	};

	self.getSummonerByName = function(region, summonerName) {
		var now = moment();
		var deferred = q.defer();
		_summonerCacheController.getSummonerByName(region, summonerName)
			.then(function(cacheSummonerResult) {
				if(cacheSummonerResult !== null && moment(now).diff(cacheSummonerResult.updated_at, 'hours') <= _config.maxCacheTimeHours) {
					console.log("cached!");
					deferred.resolve(_prepareSummoner(cacheSummonerResult));
				} else {
					_getSummonerByNameApi(region, summonerName)
						.then(function(apiSummoner) {
							_summonerCacheController.cacheSummoner(region, summonerName, apiSummoner);
							deferred.resolve(_prepareSummoner(apiSummoner))
						})
						.fail(function(error) {
							deferred.reject(error);
						});
				}
			})
			.fail(function(error) {
				deferred.reject(error);
			});

		return deferred.promise;
	}

	self.init = function() {
		_config = require('../config');
		_apiVersion = _config.riot_api.versions.summoners;

		var SummonerCacheController = require('../persistence/mongo/controllers/summonersCacheController');
		_summonerCacheController = new SummonerCacheController();

		var RiotApi = require('../common/riotApi');
		_riotApi = new RiotApi();
		_riotApi.init();
	}
};