var q = require('q');
var StatsModel = require('../models/statsModel');
var Logger = require('../../common/logger');
var _logger = new Logger();

module.exports = function() {
	var self = this;

	self.cacheSummoner = function(region, summonerId, stats) {
		_logger.debug("Updating cached stats for summonerId: " + summonerId);
		StatsModel.findOne({ region: region, summonerId: summonerId }, function(error, result) {
			var toSave = result;
			if (toSave === null) {
				toSave = new StatsModel();
				toSave.summonerId = summonerId;
				toSave.data = stats.data;
				toSave.region = region;
				toSave.save();
			} else {
				result.data = stats.data;
				result.save();
			}
		});
	};

	self.getSummonerByName = function(region, summonerId) {
		_logger.debug("Retrieving cached stats for summonerId: " + summonerId);
		var deferred = q.defer();
		StatsModel.findOne({region: region, queryName: _queryName(summonerName)}, function(error, result) {
			if (error) {
				deferred.reject(error);
			} else {
				if (result.updated_at)
				deferred.resolve(result);
			}
		});

		return deferred.promise;
	}
}