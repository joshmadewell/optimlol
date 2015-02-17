var q = require('q');

module.exports = function() {
	var self = this;
	var _deferredList = [];

	self.defer = function(deferredFunction) {
		var deferred = q.defer();

		_deferredList.push(deferred);

		try {
			if (deferredFunction !== undefined) {
				deferredFunction(deferred);
			}
		} catch(exception) {
			deferred.reject(exception);
		}

		return deferred.promise;
	}

	self.wait = function(promises) {
		return q.allSettled(promises);
	}
}