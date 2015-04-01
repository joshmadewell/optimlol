define(['durandal/system', 'common/optimlolApi'], function (system, OptimlolApi) {
	return function() {
		var self = this;
		var optimlolApi = new OptimlolApi();

		self.getStatusMessages = function(region, name) {
			var promise = system.defer();
			optimlolApi.makeRequest('statusMessages/')
				.then(function(result) {
					promise.resolve(result.data);
				})
				.fail(function(error) {
					promise.reject(error);
				});

			return promise;
		};
	};
});