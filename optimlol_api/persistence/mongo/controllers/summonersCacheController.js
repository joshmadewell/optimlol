var q = require('q');
var SummonersModel = require('../models/summonersModel');

module.exports = function() {
	var self = this;

	var _queryName = function(summonerName) {
		return summonerName.replace(/ /g, '').toLowerCase();
	}

	self.cacheSummoner = function(region, summonerName, summoner) {
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
		var deferred = q.defer();
		SummonersModel.findOne({region: region, queryName: _queryName(summonerName)}, function(error, result) {
			if (error) {
				deferred.reject(error);
			} else {
				var summonerResult = {};
				if (result === null) {
					deferred.resolve(result);
				} else {
					deferred.resolve({
						success: true,
						data: result.data
					});
				}
			}
		});

		return deferred.promise;
	}
}