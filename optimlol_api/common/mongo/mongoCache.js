var moment = require('moment');

module.exports = function() {
	var self = this;
	var _config = require('../../config');

	var Logger = require('../logging/logger.js');
	var _logger = new Logger();

	var PromiseFactoryConstructor = require('../utilities/promiseFactory');
	var _promiseFactory = new PromiseFactoryConstructor();

	var MongoCacheResponseObject = function() {
		this.isExpired = null;
		this.data = null;
	};

	self.get = function(collection, parameters) {
		return _promiseFactory.defer(function(deferredObject) {
			_logger.debug(collection + ": Cache Get:", parameters);

			var responseObject = new MongoCacheResponseObject();
			var model = require('../../persistence/mongoModels/' + collection + 'Model');
			model.retrieve(parameters)
				.then(function(cachedResult) {
					if (cachedResult && cachedResult.data) {
						var cacheLastUpdated = moment().diff(cachedResult.updated_at, 'minutes');
						_logger.debug("Cached " + collection + " object is " + cacheLastUpdated + " minutes old. Expire time is", cachedResult.expiredTimeMinutes);

						responseObject.data = cachedResult.data;
						if (cacheLastUpdated < cachedResult.expiredTimeMinutes || cachedResult.expiredTimeMinutes === -1) {
							responseObject.isExpired = false;
						} else {
							responseObject.isExpired = true;
						}

						deferredObject.resolve(responseObject);
					} else {
						deferredObject.resolve(responseObject);
					}
				})
				.fail(function(error) {
					deferredObject.reject(error);
				});
		});
	};

	self.set = function(collection, parameters, toCache) {
		return _promiseFactory.defer(function(deferredObject) {
			_logger.debug(collection + ": Cache Set:", parameters);
			var model = require('../../persistence/mongoModels/' + collection + 'Model');

			if (toCache.success && toCache.data) {
				model.retrieve(parameters)
					.then(function(cachedResult) {
						if (cachedResult) {
							cachedResult.data = toCache.data;
							cachedResult.save(function(error, result) {
								if (error) deferredObject.reject(error);
								else {
									deferredObject.resolve();
								}
							});
						} else {
							var toSave = new model();
							for(property in parameters) {
								toSave[property] = parameters[property];
							}
							toSave.data = toCache.data;
							toSave.save(function(error, result) {
								if (error) deferredObject.reject(error);
								else {
									deferredObject.resolve();
								}
							});
						}
					})
					.fail(function(error) {
						_logger.warn(collection + ": Error checking mongo for cache", parameters);
						deferredObject.reject(error);
					});
			} else {
				deferredObject.resolve();
			}
		})
	};
}