var q = require('q');
var moment = require('moment');

module.exports = function() {
	var self = this;
	var _config = require('../config');

	var _returnData = function(cachedData) {
		var returnData = {
			success: true,
			data: null
		}
		if (cachedData) {
			var cacheLastUpdated = moment(now).diff(cacheSummonerResult.updated_at, 'minutes');
			_logger.debug("Cached " + collect + "object is " + cacheLastUpdated + " minutes old.");

			if (cacheLastUpdated < _config.expiredCacheMinutes) {
				returnData.data = cachedData;
			}
		}
		return returnData;
	}

	self.get = function(collection, identifiers) {
		var deferred = q.defer();
		var model = require('../persistence/mongo/models/' + collection + 'Model');
		model.findOne(identifiers, function(error, result) {
			if (error) {
				deferred.reject(error);
			} else {
				deferred.resolve(_returnData(result));
			}
		})

		return deferred.promise;
	};

	self.set = function(collection, identifiers, data) {
		var model = require('../persistence/mongo/models/' + collection + 'Model');
		model.findOne(identifiers, function(error, result) {
			if (error) return;
			else {
				if (result) {
					result.data = data;
					result.save();
				} else {
					var toSave = new model();
					for(property in identifiers) {
						toSave[property] = identifiers[property];
					}
					toSave.data = data;
					toSave.save();
				}
			}
		});
	};
}