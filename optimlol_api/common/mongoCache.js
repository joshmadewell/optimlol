var q = require('q');
var moment = require('moment');

module.exports = function() {
	var self = this;
	var _config = require('../config');
	var Logger = require('./logger.js');
	var _logger = new Logger();

	var _returnData = function(cachedData) {
		var returnData = {
			success: true,
			data: null
		}

		if (cachedData) {
			var cacheLastUpdated = moment().diff(cachedData.updated_at, 'minutes');

			_logger.debug("Cached object is " + cacheLastUpdated + " minutes old.");

			if (cacheLastUpdated < _config.optimlol_api.expiredCacheMinutes) {
				returnData.data = cachedData.data;
			}
		}

		return returnData;
	}

	self.get = function(collection, identifiers) {
		var model = require('../persistence/mongoModels/' + collection + 'Model');
		_logger.debug("Cache Get:", { "from": collection, "with": identifiers } );

		var deferred = q.defer();
		model.retrieve(identifiers)
			.then(function(cachedResult) {
				_logger.info("Cache returned:", cachedResult ? "value" : "nothing");
				deferred.resolve(_returnData(cachedResult));
			})
			.fail(function(error) {
				deferred.reject(error);
			});

		return deferred.promise;
	};

	self.set = function(collection, identifiers, data) {
		_logger.debug("Cache Set:", { "from": collection, "with": identifiers, "data": data } );
		var model = require('../persistence/mongoModels/' + collection + 'Model');

		var deferred = q.defer();
		model.retrieve(identifiers)
			.then(function(cachedResult) {
				if (cachedResult) {
					cachedResult.data = data;
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
					toSave.data = data;
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

		return deferred.promise;
	};
}