var q = require('q');
var moment = require('moment');

module.exports = function() {
	var self = this;
	var _config = require('../../config');
	var Logger = require('../logging/logger.js');
	var _logger = new Logger();

	var _returnData = function(cachedData, collection) {
		var returnData = {
			success: true,
			isExpired: null,
			data: null
		}

		if (cachedData) {
			var cacheLastUpdated = moment().diff(cachedData.updated_at, 'minutes');
			_logger.debug("Cached " + collection + " object is " + cacheLastUpdated + " minutes old.", "Expire time is", cachedData.expiredTimeMinutes);

			returnData.data = cachedData.data;
			if (cacheLastUpdated < cachedData.expiredTimeMinutes || cachedData.expiredTimeMinutes === -1) {
				returnData.isExpired = false;
			}  else {
				returnData.isExpired = true;
			}
		}

		return returnData;
	}

	self.get = function(collection, identifiers) {
		var model = require('../persistence/mongoModels/' + collection + 'Model');
		_logger.debug(collection + ": Cache Get:", { "from": collection, "with": identifiers } );

		var deferred = q.defer();
		model.retrieve(identifiers)
			.then(function(cachedResult) {
				_logger.debug(collection + "cache returned:", cachedResult ? "value" : "nothing");
				deferred.resolve(_returnData(cachedResult, collection));
			})
			.fail(function(error) {
				deferred.reject(error);
			});

		return deferred.promise;
	};

	self.set = function(collection, identifiers, toCache) {
		_logger.debug(collection + ": Cache Set:", { "from": collection, "with": identifiers } );
		var model = require('../persistence/mongoModels/' + collection + 'Model');

		var deferred = q.defer();
		if (toCache.success) {
			model.retrieve(identifiers)
				.then(function(cachedResult) {
					if (cachedResult) {
						cachedResult.data = toCache.data;
						cachedResult.save(function(error, result) {
							if (error) deferred.reject(error);
							else {
								deferred.resolve();
							}
						});
					} else {
						var toSave = new model();
						for(property in identifiers) {
							toSave[property] = identifiers[property];
						}
						toSave.data = toCache.data;
						toSave.save(function(error, result) {
							if (error) deferred.reject(error);
							else {
								deferred.resolve();
							}
						});
					}
				})
				.fail(function(error) {
					_logger.warn("Error checking mongo for cache", { "from": collection, "with": identifiers });
					deferred.reject(error);
				});
		} else {
			deferred.resolve();
		}

		return deferred.promise;
	};
}