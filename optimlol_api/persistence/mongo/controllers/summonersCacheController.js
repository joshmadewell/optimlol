var q = require('q');
var SummonersModel = require('../models/summonersModel');
var Logger = require('../../common/logger');
var _logger = new Logger();

module.exports = function() {
	var self = this;

	var _queryName = function(summonerName) {
		return summonerName.replace(/ /g, '').toLowerCase();
	}

	self.cacheSummoner = function(region, summonerName, summoner) {
		_logger.debug("Updating cached summoner: " + summonerName);
		SummonersModel.findOne({ region: region, queryName: _queryName(summonerName) }, function(error, result) {
			var toSave = result;
			if (toSave === null) {
				toSave = new SummonersModel();
				toSave.queryName = _queryName(summonerName);
				toSave.data = summoner.data;
				toSave.region = region;
				toSave.save();
			} else {
				result.data = summoner.data;
				result.save();
			}
		});
	};

	self.getSummonerByName = function(region, summonerName) {
		_logger.debug("Retrieving cached summoner by summonerName: " + summonerName);
		var deferred = q.defer();
		SummonersModel.findOne({region: region, queryName: _queryName(summonerName)}, function(error, result) {
			if (error) {
				deferred.reject(error);
			} else {
				deferred.resolve(result);
			}
		});

		return deferred.promise;
	}
}